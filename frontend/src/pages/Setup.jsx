import { useState } from "react";
import axios from "axios";

const TEMPLATES = {
  bank: `Bank Name: SafeBank
Working Hours: 9AM - 6PM Monday to Saturday
Support: 1800-XXX-XXXX

Q: How do I block my card?
A: Call 1800-XXX-XXXX or App > Cards > Block Card

Q: How long does KYC take?
A: 24-48 hours after document submission

Q: What is minimum balance?
A: Rs 1000 for savings account

Q: How to dispute a transaction?
A: App > Transactions > Select > Raise Dispute`,

  payments: `App: QuickPay
Support: support@quickpay.com

Q: Why did my payment fail?
A: Wrong UPI PIN, bank server issue, or low balance

Q: How long does refund take?
A: 5-7 working days

Q: What is daily limit?
A: Rs 1 lakh per day as per NPCI guidelines`,

  investment: `Platform: GrowMore
SEBI Reg: INZ000XXXXXX

Q: How to withdraw mutual fund?
A: Portfolio > Select Fund > Redeem. 2-3 working days

Q: Minimum SIP amount?
A: Rs 100 per month

Q: How to update bank account?
A: Profile > Bank Details > Update`
};

export default function Setup() {
  const [name, setName] = useState("");
  const [faq, setFaq] = useState("");
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !faq) return alert("Fill all fields");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/setup", {
        business_name: name,
        faq_text: faq
      });

      const shareLink = res.data.share_link;

      setLinks({
        chat: `${window.location.origin}/chat/${shareLink}`,
        dashboard: `${window.location.origin}/dashboard/${shareLink}`
      });

    } catch {
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "Arial" }}>
      <h1 style={{ color: "#1a1a2e" }}>🏦 Fintech Chatbot Builder</h1>
      <p style={{ color: "gray" }}>Create a support chatbot in seconds</p>

      <input
        placeholder="Business Name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />

      <p style={{ fontWeight: "bold" }}>Pick a template:</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {["bank", "payments", "investment"].map(t => (
          <button
            key={t}
            onClick={() => setFaq(TEMPLATES[t])}
            style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid #1a1a2e", background: "white", cursor: "pointer", textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Or paste your own FAQ here..."
        value={faq}
        onChange={e => setFaq(e.target.value)}
        rows={10}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 10 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: "100%", padding: 14, background: "#1a1a2e", color: "white", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}
      >
        {loading ? "Creating..." : "Create Chatbot"}
      </button>

      {/* Show both links after creation */}
      {links && (
        <div style={{ marginTop: 20 }}>

          {/* Chat Link */}
          <div style={{ padding: 16, background: "#f0f8ff", borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontWeight: "bold", margin: "0 0 6px 0" }}>
              💬 Customer Chat Link
            </p>
            <p style={{ color: "gray", fontSize: 12, margin: "0 0 8px 0" }}>
              Share this with your customers
            </p>
            <p style={{ wordBreak: "break-all", color: "blue", fontSize: 13, margin: "0 0 8px 0" }}>
              {links.chat}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(links.chat)}
              style={{ padding: "6px 14px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
            >
              Copy Chat Link
            </button>
          </div>

          {/* Dashboard Link */}
          <div style={{ padding: 16, background: "#fff8f0", borderRadius: 8, border: "1px solid #ffe0b0" }}>
            <p style={{ fontWeight: "bold", margin: "0 0 6px 0" }}>
              📊 Your Admin Dashboard
            </p>
            <p style={{ color: "gray", fontSize: 12, margin: "0 0 8px 0" }}>
              Keep this private — only for you
            </p>
            <p style={{ wordBreak: "break-all", color: "blue", fontSize: 13, margin: "0 0 8px 0" }}>
              {links.dashboard}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(links.dashboard)}
              style={{ padding: "6px 14px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
            >
              Copy Dashboard Link
            </button>
          </div>

        </div>
      )}
    </div>
  );
}