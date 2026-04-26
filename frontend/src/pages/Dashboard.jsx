import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const { shareLink } = useParams(); // ← gets shareLink from URL
  const [stats, setStats] = useState(null);
  const [topQuestions, setTopQuestions] = useState([]);
  const [unresolved, setUnresolved] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchAll();
  const interval = setInterval(fetchAll, 30000); // refresh every 30 seconds
  return () => clearInterval(interval); // cleanup on page close
}, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, topRes, unresolvedRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/stats/${shareLink}`),
        axios.get(`http://localhost:5000/api/admin/top-questions/${shareLink}`),
        axios.get(`http://localhost:5000/api/admin/unresolved/${shareLink}`)
      ]);

      setStats(statsRes.data);
      setTopQuestions(topRes.data.topQuestions);
      setUnresolved(unresolvedRes.data.unresolved);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleReply = async (id) => {
    if (!replyText[id] || replyText[id].trim() === "")
      return alert("Please type a reply first");

    try {
      await axios.post(
        `http://localhost:5000/api/admin/reply/${id}`,
        { reply: replyText[id] }
      );

      alert("✅ Reply sent and marked as resolved!");
      setUnresolved(prev => prev.filter(c => c._id !== id));
      setStats(prev => ({ ...prev, unresolved: prev.unresolved - 1 }));
      setReplyText(prev => ({ ...prev, [id]: "" }));

    } catch {
      alert("Something went wrong");
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 100, fontFamily: "Arial" }}>
      Loading dashboard...
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20, fontFamily: "Arial" }}>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "20px 24px", borderRadius: 12, marginBottom: 24 }}>
        <h2 style={{ color: "white", margin: 0 }}>📊 Admin Dashboard</h2>
        <p style={{ color: "#aaa", margin: 0, fontSize: 13 }}>
          {stats?.business_name} — Support Overview
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: "bold", color: "#1a1a2e" }}>{stats.totalChats}</p>
            <p style={{ margin: 0, color: "gray", fontSize: 13 }}>Total Chats</p>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: "bold", color: "green" }}>{stats.thumbsUp}</p>
            <p style={{ margin: 0, color: "gray", fontSize: 13 }}>👍 Thumbs Up</p>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: "bold", color: "red" }}>{stats.thumbsDown}</p>
            <p style={{ margin: 0, color: "gray", fontSize: 13 }}>👎 Thumbs Down</p>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: "bold", color: "orange" }}>{stats.unresolved}</p>
            <p style={{ margin: 0, color: "gray", fontSize: 13 }}>❗ Unresolved</p>
          </div>
        </div>
      )}

      {/* Top Questions */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#1a1a2e" }}>📊 Top 5 Most Asked Questions</h3>
        {topQuestions.length === 0 ? (
          <p style={{ color: "gray" }}>No data yet</p>
        ) : (
          topQuestions.map((q, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < topQuestions.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <span style={{ fontSize: 14 }}>{i + 1}. {q.question}</span>
              <span style={{ background: "#1a1a2e", color: "white", padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>
                {q.count}x
              </span>
            </div>
          ))
        )}
      </div>

      {/* Unresolved Queries */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#1a1a2e" }}>❗ Unresolved Queries</h3>
        {unresolved.length === 0 ? (
          <p style={{ color: "green" }}>✅ All queries resolved!</p>
        ) : (
          unresolved.map((convo) => (
            <div key={convo._id} style={{ padding: 16, border: "1px solid #ffe0e0", borderRadius: 8, marginBottom: 12, background: "#fff8f8" }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: "bold", fontSize: 14 }}>
                ❓ {convo.question}
              </p>
              <p style={{ margin: "0 0 10px 0", color: "gray", fontSize: 13 }}>
                🤖 Bot said: {convo.answer}
              </p>
              <p style={{ margin: "0 0 8px 0", color: "#aaa", fontSize: 11 }}>
                {new Date(convo.created_at).toLocaleString()}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={replyText[convo._id] || ""}
                  onChange={e => setReplyText(prev => ({ ...prev, [convo._id]: e.target.value }))}
                  placeholder="Type your manual reply..."
                  style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ddd", fontSize: 13 }}
                />
                <button
                  onClick={() => handleReply(convo._id)}
                  style={{ padding: "8px 16px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                >
                  Reply ✅
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}