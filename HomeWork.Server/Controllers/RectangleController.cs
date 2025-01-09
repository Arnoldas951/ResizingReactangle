using Microsoft.AspNetCore.Mvc;

namespace HomeWork.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RectangleController : ControllerBase
    {
        private static CancellationTokenSource sharedCancellationTokenSource = new CancellationTokenSource();
        public record Rectangle(int X, int Y, int Width, int Height);

        [HttpGet(Name = "GetInitialRectangleSize")]
        public JsonResult Get()
        {
            return new JsonResult(new Rectangle(50, 50, 200, 200));
        }

        [HttpPost("Validate")]
        public async Task<IActionResult> ValidateRectangle([FromBody] Rectangle rectangle)
        {
            if (!sharedCancellationTokenSource.IsCancellationRequested)
            {
                sharedCancellationTokenSource.Cancel();
                sharedCancellationTokenSource.Dispose();
            }
            
            sharedCancellationTokenSource = new CancellationTokenSource();
            var cancellationToken = sharedCancellationTokenSource.Token;

            try
            {
                await Task.Delay(10000, cancellationToken);
                if (rectangle.Height > rectangle.Width)
                {
                    return BadRequest(new { message = "Height > width." });
                }

                return Ok(new { message = "Validation successful." });
            }
            catch (TaskCanceledException)
            {
                return Ok();
            }
        }
    }
}