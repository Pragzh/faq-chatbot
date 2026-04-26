import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const QUICK_QUESTIONS = [
  "Why did my payment fail?",
  "How do I block my card?",
  "When will I get my refund?",
  "How do I update KYC?",
  "What is my transaction limit?"
];

export default function ChatPage() {
  const { shareLink } = useParams();
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I am your support assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState({}); // tracks which messages are already rated

  // 👍👎 Rate a message
  const rateMessage = async (id, rating) => {
    try {
      await axios.post(`http://localhost:5000/api/rate/${id}`, { rating });
      setRated(prev => ({ ...prev, [id]: rating })); // mark as rated
    } catch {
      console.log("Rating failed");
    }
  };

  const sendMessage = async (question) => {
    const q = question || input;
    if (!q.trim()) return;

    // Input validation
    if (q.length > 300) {
      alert("Question too long! Max 300 characters.");
      return;
    }

    setMessages(prev => [...prev, { from: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/chat/${shareLink}`,
        { question: q }
      );

      // Save answer with id for rating
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: res.data.answer,
        id: res.data.id
      }]);

    } catch {
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: "Something went wrong. Please try again." 
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "Arial" }}>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "16px 20px", borderRadius: "12px 12px 0 0" }}>
        <h3 style={{ color: "white", margin: 0 }}>🏦 Support Chat</h3>
        <p style={{ color: "#aaa", margin: 0, fontSize: 12 }}>We reply instantly</p>
      </div>

      {/* Messages */}
      <div style={{ border: "1px solid #ddd", borderTop: "none", padding: 16, height: 400, overflowY: "auto", background: "#fafafa" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "10px 0" }}>

            {/* Message bubble */}
            <span style={{
              background: msg.from === "user" ? "#1a1a2e" : "white",
              color: msg.from === "user" ? "white" : "black",
              padding: "10px 14px",
              borderRadius: msg.from === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
              display: "inline-block",
              maxWidth: "75%",
              fontSize: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              {msg.text}
            </span>

            {/* 👍👎 buttons — only for bot messages that have an id */}
            {msg.from === "bot" && msg.id && (
              <div style={{ marginTop: 4, display: "flex", gap: 6, justifyContent: "flex-start" }}>
                {rated[msg.id] !== undefined ? (
                  // Already rated — show thank you
                  <span style={{ fontSize: 11, color: "gray" }}>
                    {rated[msg.id] === 1 ? "✅ Thanks for the feedback!" : "🙏 Sorry! We'll improve."}
                  </span>
                ) : (
                  // Not rated yet — show buttons
                  <>
                    <button
                      onClick={() => rateMessage(msg.id, 1)}
                      style={{ background: "none", border: "1px solid #ddd", borderRadius: 20, padding: "2px 10px", cursor: "pointer", fontSize: 14 }}
                    >
                      👍
                    </button>
                    <button
                      onClick={() => rateMessage(msg.id, 0)}
                      style={{ background: "none", border: "1px solid #ddd", borderRadius: 20, padding: "2px 10px", cursor: "pointer", fontSize: 14 }}
                    >
                      👎
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ textAlign: "left" }}>
            <span style={{ background: "white", padding: "10px 14px", borderRadius: "18px 18px 18px 0", display: "inline-block", fontSize: 14 }}>
              Typing...
            </span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{ border: "1px solid #ddd", borderTop: "none", padding: 10, background: "white", borderRadius: "0 0 12px 12px" }}>

        {/* Quick questions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid #1a1a2e", background: "white", cursor: "pointer", fontSize: 11 }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type your question... (max 300 chars)"
            maxLength={300}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
          />
          <button
            onClick={() => sendMessage()}
            style={{ padding: "10px 18px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Send
          </button>
        </div>

        {/* Character counter */}
        <p style={{ fontSize: 10, color: input.length > 250 ? "red" : "gray", textAlign: "right", margin: "4px 0" }}>
          {input.length}/300
        </p>

        {/* Disclaimer */}
        <p style={{ fontSize: 10, color: "gray", textAlign: "center", marginTop: 4 }}>
          General info only. Not financial advice. Contact support for urgent issues.
        </p>
      </div>

    </div>
  );
}