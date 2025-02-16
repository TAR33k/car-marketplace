using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Endpoints.AdvertisementQuestionEndpoints
{
    [Route("advertisement-questions")]
    public class AdvertisementQuestionCreateEndpoint : MyEndpointBaseAsync
    .WithRequest<AdvertQuestionCreateRequest>
    .WithActionResult<AdvertQuestionResponse>
    {
        private readonly ApplicationDbContext _db;
        private readonly MyAuthService _myAuthService;

        public AdvertisementQuestionCreateEndpoint(
            ApplicationDbContext db,
            MyAuthService myAuthService)
        {
            _db = db;
            _myAuthService = myAuthService;
        }

        [HttpPost]
        public override async Task<ActionResult<AdvertQuestionResponse>> HandleAsync(
            [FromBody] AdvertQuestionCreateRequest request,
            CancellationToken cancellationToken = default)
        {
            // Check authentication
            MyAuthInfo authInfo = _myAuthService.GetAuthInfo();
            if (!authInfo.IsLoggedIn)
                return Unauthorized();

            // Validate if Advertisement exists
            var advertisementExists = await _db.Advertisements
                .AnyAsync(a => a.ID == request.AdvertisementId, cancellationToken);
            if (!advertisementExists)
                return BadRequest("Invalid AdvertisementId");

            var question = new AdvertisementQuestion
            {
                Content = request.Content,
                AdvertisementID = request.AdvertisementId,
                UserID = authInfo.UserId, // Use authenticated user's ID
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _db.AdvertisementQuestions.Add(question);
                await _db.SaveChangesAsync(cancellationToken);

                var response = await GetQuestionResponse(question.ID, cancellationToken);
                return response;
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Error saving question: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                return StatusCode(500, "Error saving question. Please try again.");
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

    public class AdvertQuestionCreateRequest
    {
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; }

        [Required]
        public int AdvertisementId { get; set; }
    }

    public class AdvertQuestionResponse
    {
        public int ID { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Answer { get; set; }
        public DateTime? AnsweredAt { get; set; }
        public AdvertQuestionUserResponse User { get; set; }
    }

    public class AdvertQuestionUserResponse
    {
        public int ID { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
