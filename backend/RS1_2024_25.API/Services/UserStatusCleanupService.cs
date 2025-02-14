using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;

namespace RS1_2024_25.API.Services
{
    public class UserStatusCleanupService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<UserStatusCleanupService> _logger;
        private const int CLEANUP_INTERVAL_MINUTES = 5;

        public UserStatusCleanupService(
            IServiceProvider services,
            ILogger<UserStatusCleanupService> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _services.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    // Find users who are marked as online but haven't been seen in the last 5 minutes
                    var staleTime = DateTime.UtcNow.AddMinutes(-5);
                    var staleUsers = await db.Users
                        .Where(u => u.IsOnline && u.LastSeen < staleTime)
                        .ToListAsync(stoppingToken);

                    foreach (var user in staleUsers)
                    {
                        user.IsOnline = false;
                        user.LastSeen = DateTime.UtcNow;
                    }

                    if (staleUsers.Any())
                    {
                        await db.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation($"Updated status for {staleUsers.Count} stale user sessions");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in user status cleanup service");
                }

                await Task.Delay(TimeSpan.FromMinutes(CLEANUP_INTERVAL_MINUTES), stoppingToken);
            }
        }
    }
}
