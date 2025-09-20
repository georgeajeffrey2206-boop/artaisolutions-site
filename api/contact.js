// api/contact.js — Vercel Serverless Function using Resend
import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { name, email, message, website } = req.body || {};

    // Honeypot: real users never see/fill this
    if (website) return res.status(200).json({ ok: true, spam: true });

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing required fields." });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_NAME   = process.env.FROM_NAME   || "Art AI Solutions";
    const FROM_EMAIL  = process.env.FROM_EMAIL  || "no-reply@artaisolutions.com";
    const OWNER_EMAIL = process.env.OWNER_EMAIL || "owner@example.com";
    const CALENDLY    = process.env.CALENDLY_LINK || "https://calendly.com/YOUR-CALENDLY-USERNAME/30min";

    // 1) Send to you (owner)
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      reply_to: email,
      subject: `New inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${(message || "").replace(/\n/g, "<br/>")}</p>
      `,
    });

    // 2) Instant auto-reply to client
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "Thanks for reaching out to Art AI Solutions",
      text: `Hi ${name.split(" ")[0]},\n\nThanks for contacting Art AI Solutions. We've received your message and will reply shortly.\nIf you'd like a quick 30-minute call, book here: ${CALENDLY}\n\nTalk soon,\nArt AI Solutions`,
      html: `
        <p>Hi ${name.split(" ")[0]},</p>
        <p>Thanks for contacting <strong>Art AI Solutions</strong>. We've received your message and will reply shortly.</p>
        <p>Want to jump on a 30-minute call?<br/>
          <a href="${CALENDLY}" target="_blank" rel="noopener">Book here</a>
        </p>
        <p>Talk soon,<br/>Art AI Solutions</p>
      `,
    });

    return res.status(200).json({ ok: true, delivered: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Failed to send messages." });
  }
}
