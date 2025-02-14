using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Models;
using RS1_2024_25.API.Services;
using System.Net.NetworkInformation;
using Microsoft.EntityFrameworkCore;
namespace RS1_2024_25.API.Endpoints.ChatEndpoints
{
    [Route("chats")]
    public class ChatHistoryEndpoint(
       ApplicationDbContext db,
       MyAuthService myAuthService) : MyEndpointBaseAsync
       .WithRequest<int>
       .WithActionResult<List<ChatMessage>>
    {
        [HttpGet("history/{id}")]
        public override async Task<ActionResult<List<ChatMessage>>> HandleAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var authInfo = myAuthService.GetAuthInfo();
            if (!authInfo.IsLoggedIn)
                return Unauthorized();
            var currentUserId = authInfo.UserId;
            var targetUserId = id;
            var messages = await db.ChatMessages
               .Where(m => (m.SenderId == currentUserId && m.ReceiverId == targetUserId) ||
                          (m.SenderId == targetUserId && m.ReceiverId == currentUserId))
               .OrderBy(m => m.Timestamp)
               .ToListAsync(cancellationToken);
            return Ok(messages);
        }
    }
}