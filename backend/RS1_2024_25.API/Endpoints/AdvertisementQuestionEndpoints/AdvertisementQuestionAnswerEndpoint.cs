using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Endpoints.AdvertisementQuestionEndpoints
{
    [Route("advertisement-questions")]
    public class AdvertisementQuestionAnswerEndpoint : MyEndpointBaseAsync
    .WithRequest<AdvertQuestionAnswerRequest>
    .WithActionResult<AdvertQuestionResponse>
    {
        private readonly ApplicationDbContext _db;
        private readonly MyAuthService _myAuthService;

        public AdvertisementQuestionAnswerEndpoint(
            ApplicationDbContext db,
            MyAuthService myAuthService)
        {
            _db = db;
            _myAuthService = myAuthService;
        }

        [HttpPut("{id}/answer")]
        public override async Task<ActionResult<AdvertQuestionResponse>> HandleAsync(
            [FromBody] AdvertQuestionAnswerRequest request,
            CancellationToken cancellationToken = default)
        {
            MyAuthInfo authInfo = _myAuthService.GetAuthInfo();
            if (!authInfo.IsLoggedIn)
                return Unauthorized();

            var question = await _db.AdvertisementQuestions
                .Include(q => q.Advertisement)
                .FirstOrDefaultAsync(q => q.ID == request.QuestionId, cancellationToken);

            if (question == null)
                return NotFound("Question not found");

            // Check if user is advertisement owner or admin
            if (question.Advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                return Unauthorized("Only the advertisement owner can answer questions");

            question.Answer = request.Answer;
            question.AnsweredAt = DateTime.UtcNow;

            try
            {
                await _db.SaveChangesAsync(cancellationToken);

                var response = await GetQuestionResponse(question.ID, cancellationToken);
                return response;
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Error saving answer: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                return StatusCode(500, "Error saving answer. Please try again.");
            }
        }

        private async Task<AdvertQuestionResponse> GetQuestionResponse(
            int questionId,
            CancellationToken cancellationToken)
        {
            return await _db.AdvertisementQuestions
                .Include(q => q.User)
                .Where(q => q.ID == questionId)
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
                        FirstName = q.User.FirstName,
                        LastName = q.User.LastName
                    }
                })
                .FirstAsync(cancellationToken);
        }
    }

    public class AdvertQuestionAnswerRequest
    {
        [Required]
        public int QuestionId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Answer { get; set; }
    }
}
