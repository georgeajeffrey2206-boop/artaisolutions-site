import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, website } = req.body || {};
    if (website) return res.status(200).json({ ok: true, spam: true });

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing required fields." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const fromName = process.env.FROM_NAME || "Art AI Solutions";
    const fromEmail = process.env.FROM_EMAIL || "no-reply@artaisolutions.com";
    const ownerEmail = process.env.OWNER_EMAIL || "owner@example.com";

    // Send to you
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: ownerEmail,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      `
    });

    // Auto-reply to client
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: "Thanks for reaching out to Art AI Solutions",
      text: `Hi ${name.split(" ")[0]},\n\nThanks for contacting Art AI Solutions. We've received your message and will reply shortly. If you'd like a quick 30-minute call, book here: https://calendly.com/YOUR-CALENDLY-USERNAME/30min\n\nTalk soon,\nArt AI Solutions`,
      html: `
        <p>Hi ${name.split(" ")[0]},</p>
        <p>Thanks for contacting <strong>Art AI Solutions</strong>. We've received your message and will reply shortly.</p>
        <p>Want to jump on a 30-minute call?<br/>
          <a href="https://calendly.com/george-a-jeffrey2206/30min" target="_blank" rel="noopener">Book here</a>
        </p>
        <p>Talk soon,<br/>Art AI Solutions</p>
      `
    });

    res.status(200).json({ ok: true, delivered: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to send messages." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
