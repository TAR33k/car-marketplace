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
            var authInfo = _myAuthService.GetAuthInfoFromTokenString(tokenString);

            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized");
            var currentUserId = authInfo.UserId;
            return await _db.ChatMessages
               .Where(m =>
                   (m.SenderId == currentUserId && m.ReceiverId == otherUserId) ||
                   (m.SenderId == otherUserId && m.ReceiverId == currentUserId))
               .OrderBy(m => m.Timestamp)
               .ToListAsync();
        }
        public override async Task OnConnectedAsync()
        {
            var tokenString = Context.GetHttpContext()?.Request.Query["my-auth-token"].ToString();
            var authInfo = _myAuthService.GetAuthInfoFromTokenString(tokenString);

            if (authInfo.IsLoggedIn)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{authInfo.UserId}");
            }
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var tokenString = GetMyAuthToken();
            if (!string.IsNullOrEmpty(tokenString))
            {
                var authInfo = _myAuthService.GetAuthInfoFromTokenString(tokenString);
                if (authInfo.IsLoggedIn)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{authInfo.UserId}");
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(SendMessageRequest request)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromTokenString(tokenString);
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

            await Clients.Group($"user_{request.ReceiverId}")
                         .SendAsync("ReceiveMessage", newMessage);
            await Clients.Caller.SendAsync("ReceiveMessage", newMessage);
        }
        public async Task UserTyping(int receiverId)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromTokenString(tokenString);
            if (!authInfo.IsLoggedIn)
                throw new HubException("Unauthorized.");
            await Clients.Group($"user_{receiverId}")
                       .SendAsync("UserTyping", authInfo.UserId);
        }
        public async Task MarkMessageAsRead(int messageId)
        {
            var tokenString = GetMyAuthToken();
            var authInfo = _myAuthService.GetAuthInfoFromTokenString(tokenString);
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
        public class SendMessageRequest
        {
            public int ReceiverId { get; set; }
            public string Content { get; set; }
        }
    }
}
