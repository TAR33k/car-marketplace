using RS1_2024_25.API.Data.Models.Auth;

namespace RS1_2024_25.API.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public required int SenderId { get; set; }
        public required int ReceiverId { get; set; }
        public string? Content { get; set; }
        public DateTime Timestamp { get; set; }
        public MessageStatus Status { get; set; }

        // Navigation properties for related users (Sender and Receiver)
        public virtual User Sender { get; set; }
        public virtual User Receiver { get; set; }
    }

    public enum MessageStatus
    {
        Sending,
        Sent,
        Delivered,
        Read,
        Failed
    }
}