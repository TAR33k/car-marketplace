using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models.Auth;

namespace RS1_2024_25.API.Services
{
    public class MyAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public MyAuthService(ApplicationDbContext db, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");

            var secretKey = jwtSettings["SecretKey"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT SecretKey is not configured.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("UserId", user.ID.ToString()),
            new Claim("Username", user.Username),
            new Claim("IsAdmin", user.IsAdmin.ToString()),
            new Claim("FirstName", user.FirstName),
            new Claim("LastName", user.LastName)
        };

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> SendInviteEmail(string recipientEmail, string senderToken)
        {
            try
            {
                var userAuthInfo = GetAuthInfoFromJwtToken(senderToken);
                var user = new User
                {
                    Username = userAuthInfo.Username,
                    FirstName = userAuthInfo.FirstName,
                    LastName = userAuthInfo.LastName,
                    IsAdmin = userAuthInfo.IsAdmin
                };
                if (userAuthInfo == null || string.IsNullOrEmpty(userAuthInfo.Username))
                    return false; 

                string token = GenerateJwtToken(user);
                string inviteLink = $"http://your-website.com/invite?token={token}";

                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("aidausanovic03@gmail.com", "nxlp uims zxli lafm"),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("aidausanovic03@gmail.com"),
                    Subject = "You're Invited!",
                    Body = $"<p>{user.Username} has invited you to join. Click on the following link to accept the invitation:</p> " +
                           $"<p><a href='{inviteLink}'>Join Now</a></p>",
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(recipientEmail);

                await smtpClient.SendMailAsync(mailMessage);
                return true; 
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending email: " + ex.Message);
                return false;  
            }
        }


        public MyAuthInfo GetAuthInfo()
        {
            string? token = _httpContextAccessor.HttpContext?.Request.Headers["my-auth-token"];
            if (string.IsNullOrEmpty(token))
            {
                return new MyAuthInfo { IsAdmin = false, IsLoggedIn = false };
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (jwtToken == null)
            {
                return new MyAuthInfo { IsAdmin = false, IsLoggedIn = false };
            }

            // Extract the information from the token claims
            var userId = int.Parse(jwtToken.Claims.First(c => c.Type == "UserId").Value);
            var username = jwtToken.Claims.First(c => c.Type == "Username").Value;
            var firstName = jwtToken.Claims.First(c => c.Type == "FirstName").Value;
            var lastName = jwtToken.Claims.First(c => c.Type == "LastName").Value;
            var isAdmin = bool.Parse(jwtToken.Claims.First(c => c.Type == "IsAdmin").Value);

            return new MyAuthInfo
            {
                UserId = userId,
                Username = username,
                FirstName = firstName,
                LastName = lastName,
                IsAdmin = isAdmin,
                IsLoggedIn = true
            };
        }
        public MyAuthInfo GetAuthInfoFromTokenModel(MyAuthenticationToken? myAuthToken)
        {
            if (myAuthToken == null)
            {
                return new MyAuthInfo();  
            }

            return new MyAuthInfo
            {
                UserId = myAuthToken.UserId,
                Username = myAuthToken.User!.Username,
                FirstName = myAuthToken.User.FirstName,
                LastName = myAuthToken.User.LastName,
                IsAdmin = myAuthToken.User.IsAdmin,
                IsLoggedIn = true
            };
        }

        public MyAuthInfo GetAuthInfoFromJwtToken(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("Token je prazan ili null!");
                    return null;
                }

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

                foreach (var claim in jsonToken.Claims)
                {
                    Console.WriteLine($"Claim: {claim.Type} - {claim.Value}");
                }

                if (jsonToken == null)
                {
                    Console.WriteLine("Neuspjelo parsiranje tokena!");
                    return null;
                }

                var userIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
                var username = jsonToken.Claims.FirstOrDefault(c => c.Type == "Username")?.Value;
                var firstName = jsonToken.Claims.FirstOrDefault(c => c.Type == "FirstName")?.Value;
                var lastName = jsonToken.Claims.FirstOrDefault(c => c.Type == "LastName")?.Value;
                var isAdminClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "IsAdmin")?.Value;


                if (string.IsNullOrEmpty(username))
                {
                    Console.WriteLine("Username nije pronađen u tokenu!");
                    return null;
                }

                return new MyAuthInfo
                {
                    UserId = int.Parse(userIdClaim),
                    Username = username,
                    FirstName = firstName,
                    LastName = lastName,
                    IsAdmin = bool.Parse(isAdminClaim),
                    IsLoggedIn = true
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Greška pri dekodiranju tokena: " + ex.Message);
                return null;
            }
        }
    }

    public class MyAuthInfo
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsLoggedIn { get; set; }
        public string? SlikaPath { get; set; }
    }
}
