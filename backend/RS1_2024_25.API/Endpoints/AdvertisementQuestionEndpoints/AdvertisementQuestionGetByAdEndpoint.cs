using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;

namespace RS1_2024_25.API.Endpoints.AdvertisementQuestionEndpoints
{
    [Route("advertisement-questions")]
    public class AdvertisementQuestionGetByAdEndpoint : MyEndpointBaseAsync
    .WithRequest<int>
    .WithActionResult<List<AdvertQuestionResponse>>
    {
        private readonly ApplicationDbContext _db;

        public AdvertisementQuestionGetByAdEndpoint(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("by-advertisement/{id}")]
        public override async Task<ActionResult<List<AdvertQuestionResponse>>> HandleAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var questions = await _db.AdvertisementQuestions
                .Include(q => q.User)
                .Where(q => q.AdvertisementID == id)
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new AdvertQuestionResponse
                {
                    ID = q.ID,
                    Content = q.Content,
                    CreatedAt = q.CreatedAt,
                    Answer = q.Answer,
                    AnsweredAt = q.AnsweredAt,
                    User = new AdvertQuestionUserResponse
                    {
                        ID = q.User.ID,
                        UserName = q.User.Username,
                        FirstName = q.User.FirstName,
                        LastName = q.User.LastName
                    }
                })
                .ToListAsync(cancellationToken);

            return questions;
        }
    }
}
