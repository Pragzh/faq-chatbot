const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("./db");
const Groq = require("groq-sdk");
require("dotenv").config();

function maskSensitiveData(text) {
  return text.replace(/\d{4,}/g, "XXXX");
}

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ChatbotSchema = new mongoose.Schema({
  business_name: String,
  faq_text: String,
  share_link: String,
  created_at: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" },
  question: String,
  answer: String,
  rating: { type: Number, default: null },
  is_resolved: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const Chatbot = mongoose.model("Chatbot", ChatbotSchema);
const Conversation = mongoose.model("Conversation", ConversationSchema);

// ROUTE 1 — Create chatbot
app.post("/api/setup", async (req, res) => {
  try {
    const { business_name, faq_text } = req.body;
    const share_link = crypto.randomBytes(6).toString("hex");
    const chatbot = new Chatbot({ business_name, faq_text, share_link });
    await chatbot.save();
    res.json({ share_link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 2 — Customer chat
// ROUTE 2 — Customer chat
app.post("/api/chat/:shareLink", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "")
      return res.status(400).json({ error: "Question cannot be empty" });

    if (question.length > 300)
      return res.status(400).json({ error: "Question too long. Max 300 characters." });

    const chatbot = await Chatbot.findOne({ share_link: req.params.shareLink });

    if (!chatbot)
      return res.status(404).json({ error: "Chatbot not found" });

    // Get all conversations for this chatbot
    const allConvos = await Conversation.find({ 
      chatbot_id: chatbot._id 
    }).lean();

    // FIX 1 — Return admin's answer if same question was answered before
    const previousAnswer = allConvos.find(c =>
      c.is_resolved === true &&
      c.question.toLowerCase().trim() === question.toLowerCase().trim() &&
      c.answer !== "I couldn't find an exact answer. Please contact our support team."
    );

    if (previousAnswer) {
      const savedConvo = await Conversation.create({
        chatbot_id: chatbot._id,
        question: maskSensitiveData(question),
        answer: previousAnswer.answer,
        is_resolved: true
      });
      return res.json({ 
        answer: previousAnswer.answer, 
        id: savedConvo._id 
      });
    }

    // Call AI
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a professional fintech customer support chatbot.
          RULES:
          1. Only answer using the provided FAQ/context.
          2. If answer NOT in context say exactly:
             "I couldn't find an exact answer. Please contact our support team."
          3. Never provide financial advice. If asked say:
             "I cannot provide financial advice. Please consult a certified financial advisor."
          4. If user mentions fraud, scam, unauthorized transaction say:
             "This is a sensitive issue. Please contact support immediately."
          5. Keep responses short (max 3-4 lines), simple, professional.
          6. Do NOT make up any information.
          
          Company Info:
          ${chatbot.faq_text}`
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    const rawAnswer = response.choices[0].message.content;
    const safeQuestion = maskSensitiveData(question);
    const safeAnswer = maskSensitiveData(rawAnswer);

    const is_resolved =
      !safeAnswer.toLowerCase().includes("contact our support team") &&
      !safeAnswer.toLowerCase().includes("contact support immediately");

    // FIX 2 — Don't save duplicate unresolved questions
    if (!is_resolved) {
      const existingUnresolved = allConvos.find(c =>
        c.question.toLowerCase().trim() === question.toLowerCase().trim() &&
        c.is_resolved === false
      );

      if (existingUnresolved) {
        return res.json({ 
          answer: safeAnswer, 
          id: existingUnresolved._id 
        });
      }
    }

    // Save new conversation
    const savedConvo = await Conversation.create({
      chatbot_id: chatbot._id,
      question: safeQuestion,
      answer: safeAnswer,
      is_resolved
    });

    res.json({ answer: safeAnswer, id: savedConvo._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 3 — Rate a message
app.post("/api/rate/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating !== 0 && rating !== 1)
      return res.status(400).json({ error: "Rating must be 0 or 1" });
    await Conversation.findByIdAndUpdate(req.params.id, { rating });
    res.json({ message: "Rating saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 4 — Admin reply
app.post("/api/admin/reply/:id", async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || reply.trim() === "")
      return res.status(400).json({ error: "Reply cannot be empty" });
    await Conversation.findByIdAndUpdate(
      req.params.id,
      { answer: reply, is_resolved: true }
    );
    res.json({ message: "Reply saved and marked as resolved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 5 — Debug
app.get("/api/debug/:shareLink", async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      share_link: req.params.shareLink 
    });
    if (!chatbot) return res.json({ error: "Chatbot not found" });

    const allConvos = await Conversation.find({}).lean();
    res.json({
      chatbot_id: chatbot._id,
      total_conversations: allConvos.length,
      first_convo: allConvos[0] || "none"
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ROUTE 6 — Admin stats
app.get("/api/admin/stats/:shareLink", async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      share_link: req.params.shareLink 
    });
    if (!chatbot)
      return res.status(404).json({ error: "Chatbot not found" });

    const chatbotId = chatbot._id.toString();
    const all = await Conversation.find({}).lean();

    const mine = all.filter(c => c.chatbot_id && c.chatbot_id.toString() === chatbotId);

    res.json({
      totalChats: mine.length,
      thumbsUp: mine.filter(c => c.rating === 1).length,
      thumbsDown: mine.filter(c => c.rating === 0).length,
      unresolved: mine.filter(c => c.is_resolved === false).length,
      business_name: chatbot.business_name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 7 — Top questions
app.get("/api/admin/top-questions/:shareLink", async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      share_link: req.params.shareLink 
    });
    if (!chatbot)
      return res.status(404).json({ error: "Chatbot not found" });

    const chatbotId = chatbot._id.toString();
    const all = await Conversation.find({}).lean();
    const mine = all.filter(c => c.chatbot_id && c.chatbot_id.toString() === chatbotId);

    const questionCount = {};
    mine.forEach(c => {
      questionCount[c.question] = (questionCount[c.question] || 0) + 1;
    });

    const topQuestions = Object.entries(questionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([question, count]) => ({ question, count }));

    res.json({ topQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 8 — Unresolved
app.get("/api/admin/unresolved/:shareLink", async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      share_link: req.params.shareLink 
    });
    if (!chatbot)
      return res.status(404).json({ error: "Chatbot not found" });

    const chatbotId = chatbot._id.toString();
    const all = await Conversation.find({}).lean();

    const unresolved = all
      .filter(c => c.chatbot_id && c.chatbot_id.toString() === chatbotId && c.is_resolved === false)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ unresolved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});