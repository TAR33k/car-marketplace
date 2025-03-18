using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Models;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _db;
        private readonly MyAuthService _myAuthService;

        private static readonly Dictionary<int, HashSet<string>> UserConnections = new();
        private static readonly object LockObject = new();

        public ChatHub(ApplicationDbContext db, MyAuthService myAuthService)
        {
            _db = db;
            _myAuthService = myAuthService;
        }
        private string? GetMyAuthToken()
        {
            return Context.GetHttpContext()?.Request.Query["my-auth-token"];
        }
        public async Task<List<ChatMessage>> GetChatHistory(int otherUserId)
        {
            var tokenString = Context.GetHttpContext()?.Request.Query["my-auth-token"].ToString();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);

            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized");

            var currentUserId = authInfo.UserId;

            // Mark messages as delivered when retrieving chat history
            var undeliveredMessages = await _db.ChatMessages
                .Where(m => m.SenderId == otherUserId &&
                            m.ReceiverId == currentUserId &&
                            m.Status == MessageStatus.Sent)
                .ToListAsync();

            foreach (var message in undeliveredMessages)
            {
                message.Status = MessageStatus.Delivered;
                await Clients.Group($"user_{message.SenderId}")
                             .SendAsync("MessageDelivered", message.Id);
            }

            if (undeliveredMessages.Any())
            {
                await _db.SaveChangesAsync();
            }

            return await _db.ChatMessages
                .Where(m =>
                    (m.SenderId == currentUserId && m.ReceiverId == otherUserId) ||
                    (m.SenderId == otherUserId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }
        public override async Task OnConnectedAsync()
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);

            if (authInfo.IsLoggedIn)
            {
                var user = await _db.Users.FindAsync(authInfo.UserId);
                if (user != null)
                {
                    lock (LockObject)
                    {
                        if (!UserConnections.ContainsKey(user.ID))
                        {
                            UserConnections[user.ID] = new HashSet<string>();
                        }
                        UserConnections[user.ID].Add(Context.ConnectionId);

                        // Only update status if this is the first connection for this user
                        if (UserConnections[user.ID].Count == 1)
                        {
                            user.IsOnline = true;
                            user.LastSeen = DateTime.UtcNow;
                            _db.SaveChanges();

                            // Broadcast status change to all clients
                            Clients.All.SendAsync("UserStatusChanged", new
                            {
                                userId = user.ID,
                                isOnline = true,
                                lastSeen = user.LastSeen?.ToUniversalTime()
                            });
                        }
                    }

                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{authInfo.UserId}");
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);

            if (authInfo.IsLoggedIn)
            {
                var user = await _db.Users.FindAsync(authInfo.UserId);
                if (user != null)
                {
                    lock (LockObject)
                    {
                        if (UserConnections.ContainsKey(user.ID))
                        {
                            UserConnections[user.ID].Remove(Context.ConnectionId);

                            // Only update status if this was the last connection for this user
                            if (UserConnections[user.ID].Count == 0)
                            {
                                UserConnections.Remove(user.ID);
                                user.IsOnline = false;
                                user.LastSeen = DateTime.UtcNow;
                                _db.SaveChanges();

                                // Broadcast status change to all clients
                                Clients.All.SendAsync("UserStatusChanged", new
                                {
                                    userId = user.ID,
                                    isOnline = false,
                                    lastSeen = user.LastSeen?.ToUniversalTime()
                                });
                            }
                        }
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(SendMessageRequest request)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized.");

            var newMessage = new ChatMessage
            {
                SenderId = authInfo.UserId,
                ReceiverId = request.ReceiverId,
                Content = request.Content,
                Timestamp = DateTime.Now,
                Status = MessageStatus.Sent
            };

            _db.ChatMessages.Add(newMessage);
            await _db.SaveChangesAsync();

            // Send to receiver first
            await Clients.Group($"user_{request.ReceiverId}")
                         .SendAsync("ReceiveMessage", newMessage);

            // Then send back to sender with the actual ID
            await Clients.Caller.SendAsync("MessageSent", newMessage);
        }
        public async Task UserTyping(int receiverId)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized.");

            await Clients.Group($"user_{receiverId}")
                        .SendAsync("UserTyping", new { userId = authInfo.UserId, isTyping = true });
        }

        public async Task StopTyping(int receiverId)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized.");

            await Clients.Group($"user_{receiverId}")
                        .SendAsync("UserTyping", new { userId = authInfo.UserId, isTyping = false });
        }
        public async Task MarkMessageAsDelivered(int senderId)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized.");

            var messages = await _db.ChatMessages
                .Where(m => m.SenderId == senderId &&
                           m.ReceiverId == authInfo.UserId &&
                           m.Status == MessageStatus.Sent)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.Status = MessageStatus.Delivered;
                // Notify sender immediately for each message
                await Clients.Group($"user_{message.SenderId}")
                            .SendAsync("MessageDelivered", message.Id);
            }

            if (messages.Any())
            {
                await _db.SaveChangesAsync();
            }
        }
        public async Task MarkMessageAsRead(int messageId)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized.");
            var message = await _db.ChatMessages.FindAsync(messageId);
            if (message != null)
            {
                message.Status = MessageStatus.Read;
                await _db.SaveChangesAsync();
                await Clients.Group($"user_{message.SenderId}")
                           .SendAsync("MessageRead", messageId);
            }
        }
        public async Task<List<UnreadMessageCount>> GetUnreadMessageCounts()
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromJwtToken(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized");

            var unreadCounts = await _db.ChatMessages
                .Where(m => m.ReceiverId == authInfo.UserId && m.Status != MessageStatus.Read)
                .GroupBy(m => m.SenderId)
                .Select(g => new UnreadMessageCount
                {
                    SenderId = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            await Clients.Caller.SendAsync("UnreadMessageCounts", unreadCounts);
            return unreadCounts;
        }
        public class SendMessageRequest
        {
            public int ReceiverId { get; set; }
            public string Content { get; set; }
        }
        public class UnreadMessageCount
        {
            public int SenderId { get; set; }
            public int Count { get; set; }
        }
    }
}
