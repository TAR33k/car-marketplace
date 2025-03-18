using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.Threading;
using System.Threading.Tasks;
using static RS1_2024_25.API.Endpoints.AuthEndpoints.AuthGetEndpoint;

namespace RS1_2024_25.API.Endpoints.AuthEndpoints
{
    [Route("auth")]
    public class AuthGetEndpoint(MyAuthService authService) : MyEndpointBaseAsync
        .WithoutRequest
        .WithActionResult<AuthGetResponse>
    {
        [HttpGet]
        public override async Task<ActionResult<AuthGetResponse>> HandleAsync(CancellationToken cancellationToken = default)
        {
            // Dohvati token iz zaglavlja Authorization
            var token = HttpContext.Request.Headers["my-auth-token"].ToString();

            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token nije poslan!");
            }

            // Testiraj funkciju GetAuthInfoFromJwtToken
            var authInfo = authService.GetAuthInfoFromJwtToken(token);

            if (authInfo == null || !authInfo.IsLoggedIn)
            {
                return Unauthorized("Neispravan ili istekao token");
            }

            return Ok(new AuthGetResponse
            {
                MyAuthInfo = authInfo
            });
        }

        public class AuthGetResponse
        {
            public required MyAuthInfo MyAuthInfo { get; set; }
        }
    }
}
