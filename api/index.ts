import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

const app = express();
// Middleware to parse huge JSON bodies (for user base64 photo uploads up to 20MB)
app.use(express.json({ limit: "20mb" }));

// Resolve paths
// Vercel serverless functions cannot persist writes inside the deployed source tree.
// We seed a temporary writable DB from src/db/db.json so the API works on Vercel.
// Note: changes made from the admin panel may reset after serverless cold starts/redeploys.
const SOURCE_DB_PATH = path.join(process.cwd(), "src", "db", "db.json");
const WRITABLE_DB_PATH = process.env.VERCEL ? "/tmp/biotechagro-db.json" : SOURCE_DB_PATH;
const SESSION_SECRET = process.env.SESSION_SECRET || "mycotunisia_secret_session_2026";

function ensureWritableDB() {
  try {
    if (!fs.existsSync(WRITABLE_DB_PATH) && fs.existsSync(SOURCE_DB_PATH)) {
      fs.copyFileSync(SOURCE_DB_PATH, WRITABLE_DB_PATH);
    }
  } catch (error) {
    console.error("Failed to initialize writable JSON DB:", error);
  }
}

// Helpers to read and write database
function getDBState() {
  try {
    ensureWritableDB();
    const dbPath = fs.existsSync(WRITABLE_DB_PATH) ? WRITABLE_DB_PATH : SOURCE_DB_PATH;
    if (fs.existsSync(dbPath)) {
      const crude = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(crude);
    }
  } catch (error) {
    console.error("Failed to read JSON DB:", error);
  }
  return null;
}

function saveDBState(data: any) {
  try {
    ensureWritableDB();
    fs.mkdirSync(path.dirname(WRITABLE_DB_PATH), { recursive: true });
    fs.writeFileSync(WRITABLE_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write to JSON DB:", error);
    return false;
  }
}

// Lazy-initialized Gemini API client
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your AI Studio secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// SMTP Transporter initialization and validation helpers
function getMailTransporter() {
  const cleanEnvStr = (val?: string): string => {
    if (!val) return "";
    return val.replace(/^["']|["']$/g, "").trim();
  };

  const host = cleanEnvStr(process.env.SMTP_HOST || "smtp.gmail.com");
  const portStr = cleanEnvStr(process.env.SMTP_PORT || "587");
  const port = parseInt(portStr, 10);
  const user = cleanEnvStr(process.env.SMTP_USER);
  const pass = cleanEnvStr(process.env.SMTP_PASS);

  console.log(`[SMTP Debug] Initializing transporter - Host: "${host}", Port: ${port}, User: "${user}", PassLength: ${pass ? pass.length : 0}, PassFirstLast: ${pass ? pass[0] + "..." + pass[pass.length - 1] : "none"}`);

  // Check if SMTP is configured (non-empty and not the default placeholder)
  if (!user || !pass || pass === "" || pass.includes("YOUR_SECURE")) {
    return null;
  }

  // If using Gmail, using the standard service configuration is highly recommended for security and port compliance
  if (host.toLowerCase().includes("smtp.gmail.com") || host.toLowerCase() === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      // Allow self-signed or TLS handshakes comfortably
      rejectUnauthorized: false
    }
  });
}

// Highly stylized secure HTML password reset mailing engine
async function sendResetCodeEmail(toEmail: string, code: string): Promise<{ success: boolean; realSent: boolean; error?: string }> {
  try {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.warn("⚠️ SMTP credentials not fully configured in environment variables. Falling back to Simulated Console Delivery Mode.");
      return { success: true, realSent: false };
    }

    const cleanEnvStr = (val?: string): string => {
      if (!val) return "";
      return val.replace(/^["']|["']$/g, "").trim();
    };

    const senderEmail = cleanEnvStr(process.env.SMTP_USER || "biotechagro.digital@gmail.com");
    const senderName = "🔑 Biotech Agro Verification";

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: toEmail,
      subject: "🛡️ Administrative Security Code - Biotech-Agro Verification",
      text: `Hello,\n\nA request was made to update the administrative credentials of Biotech-Agro Lab portal.\n\nYour secure 6-digit verification code is: ${code}\n\nThis verification sequence is valid for 10 minutes. If you did not initiate this, please secure your administrative console instantly.\n\nPortal Security Operations\nBiotech-Agro (biotech-agro.com)`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 35px 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fafaf9; color: #1c1917;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; padding: 14px; background-color: #f0fdf4; border-radius: 50%; border: 1px solid #bbf7d0; margin-bottom: 12px;">
              <span style="font-size: 28px; line-height: 1;">🔬</span>
            </div>
            <h2 style="font-size: 22px; font-weight: 700; margin: 0; color: #1c1917; letter-spacing: -0.035em;">Biotech-Agro Lab</h2>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #15803d; font-weight: 700; margin: 4px 0 0 0;">Secure Password Reset Services</p>
          </div>
          
          <div style="border-top: 1px solid #e7e5e4; padding-top: 25px; margin-bottom: 25px;">
            <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0;">Hello Laboratory Admin,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 24px 0;">A security credential reset query was triggered. Use the temporary digital out-of-band verification token below to update your passcode:</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px 24px; text-align: center; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #166534; font-weight: 700; display: block; margin-bottom: 10px;">Your Recovery Passcode</span>
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 0.3em; font-family: monospace; color: #14532d; display: inline-block; padding-left: 0.3em; text-shadow: 1px 1px 0px rgba(255,255,255,0.7);">${code}</span>
            </div>
            
            <div style="font-size: 12px; color: #57534e; line-height: 1.6; background-color: #f5f5f4; padding: 14px; border-radius: 10px; border: 1px solid #e7e5e4; margin-bottom: 15px;">
              <strong>⚠️ Critical Security Notice:</strong> This single-use authorization passcode is only valid for <strong>10 minutes</strong>. Do not expose this email or relay the verification numerals to anyone under any circumstances.
            </div>
          </div>

          <div style="border-top: 1px solid #e7e5e4; padding-top: 18px; text-align: center; font-size: 11px; color: #78716c; line-height: 1.5;">
            <p style="margin: 0;">This transmission was dispatched to <strong>${toEmail}</strong> representing Biotech-Agro.</p>
            <p style="margin: 4px 0 0 0;">Admin Priority Routing: Gateway (smtp.gmail.com) • Cloud Security Infrastructure</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`🚀 Dedicated SMTP reset code email dispatched! MessageID: ${info.messageId}`);
    return { success: true, realSent: true };
  } catch (error: any) {
    console.error("❌ Failed to dispatch SMTP Email:", error);
    return { success: false, realSent: false, error: error.message || String(error) };
  }
}

// Highly stylized secure HTML contact inquiry mailing helper
async function sendContactInquiryEmail(adminEmail: string, inquiry: { senderName: string; senderEmail: string; senderPhone?: string; subject: string; message: string }): Promise<{ success: boolean; realSent: boolean; error?: string }> {
  try {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.warn("⚠️ SMTP credentials not fully configured in environment variables. Falling back to Simulated Console Delivery Mode for contact inquiry.");
      return { success: true, realSent: false };
    }

    const cleanEnvStr = (val?: string): string => {
      if (!val) return "";
      return val.replace(/^["']|["']$/g, "").trim();
    };

    const senderEmail = cleanEnvStr(process.env.SMTP_USER || "biotechagro.digital@gmail.com");
    const senderName = "📬 Biotech Agro Inquiry";

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: adminEmail,
      replyTo: inquiry.senderEmail,
      subject: `📬 Biotech-Agro [New Contact Inquiry]: ${inquiry.subject}`,
      text: `Hello Admin,\n\nYou have received a new contact inquiry through the Biotech Agro portal:\n\n---\nName: ${inquiry.senderName}\nEmail: ${inquiry.senderEmail}\nPhone: ${inquiry.senderPhone || "Not provided"}\nSubject: ${inquiry.subject}\n\nMessage:\n${inquiry.message}\n---\n\nReply directly to: ${inquiry.senderEmail}\n\nPortal Security Operations\nBiotech-Agro (biotech-agro.com)`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 35px 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fafaf9; color: #1c1917;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; padding: 14px; background-color: #f0fdf4; border-radius: 50%; border: 1px solid #bbf7d0; margin-bottom: 12px;">
              <span style="font-size: 28px; line-height: 1;">📬</span>
            </div>
            <h2 style="font-size: 22px; font-weight: 700; margin: 0; color: #1c1917; letter-spacing: -0.035em;">Biotech-Agro Lab</h2>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #15803d; font-weight: 700; margin: 4px 0 0 0;">New Contact Form Submission</p>
          </div>
          
          <div style="border-top: 1px solid #e7e5e4; padding-top: 25px; margin-bottom: 25px;">
            <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0;">Hello Laboratory Admin,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 24px 0;">A visitor has submitted an inquiry. Below are the submission details:</p>
            
            <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; padding: 20px; border-radius: 14px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #78716c; font-weight: 600; width: 100px;">Name:</td>
                  <td style="padding: 6px 0; color: #1c1917; font-weight: 500;">${inquiry.senderName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c; font-weight: 600;">Email:</td>
                  <td style="padding: 6px 0; color: #1c1917; font-weight: 500;"><a href="mailto:${inquiry.senderEmail}" style="color: #15803d; text-decoration: none;">${inquiry.senderEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c; font-weight: 600;">Phone:</td>
                  <td style="padding: 6px 0; color: #1c1917; font-weight: 500;">${inquiry.senderPhone || "<i>Not provided</i>"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c; font-weight: 600;">Subject:</td>
                  <td style="padding: 6px 0; color: #1c1917; font-weight: 600;">${inquiry.subject}</td>
                </tr>
              </table>
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e7e5e4;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c; font-weight: 700; display: block; margin-bottom: 8px;">Message Content:</span>
                <div style="background-color: #ffffff; border: 1px solid #e7e5e4; padding: 14px; border-radius: 8px; color: #292524; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 10px;">
              <a href="mailto:${inquiry.senderEmail}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">Reply to Sender Directly</a>
            </div>
          </div>

          <div style="border-top: 1px solid #e7e5e4; padding-top: 18px; text-align: center; font-size: 11px; color: #78716c; line-height: 1.5;">
            <p style="margin: 0;">This notification matches admin setting forwarding to <strong>${adminEmail}</strong>.</p>
            <p style="margin: 4px 0 0 0;">Priority Routing: Biotech-Agro Lead System • Cloud Security Infrastructure</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`🚀 Contact inquiry SMTP notification dispatched! MessageID: ${info.messageId}`);
    return { success: true, realSent: true };
  } catch (error: any) {
    console.error("❌ Failed to dispatch Contact Inquiry SMTP Email:", error);
    return { success: false, realSent: false, error: error.message || String(error) };
  }
}


// Secure token helpers using standard node:crypto (HMAC timing-safe token)
function generateSessionToken(username: string): string {
  const expires = Date.now() + 1000 * 60 * 60 * 24; // Valid for 24 hours
  const hmacInput = `${username}:${expires}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(hmacInput).digest("hex");
  return `${username}:${expires}:${hmac}`;
}

function verifySessionToken(token?: string): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [username, expiresStr, hmacDigest] = parts;
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || expires < Date.now()) return false;

  const hmacInput = `${username}:${expires}`;
  const computedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(hmacInput).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hmacDigest), Buffer.from(computedHmac));
  } catch (err) {
    return false;
  }
}

// Middleware to secure administrator endpoints
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Private session missing." });
  }
  const token = authHeader.split(" ")[1];
  if (verifySessionToken(token)) {
    next();
  } else {
    res.status(403).json({ error: "Invalid or expired admin session token." });
  }
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Get entire site datasets
app.get("/api/content", (req, res) => {
  const db = getDBState();
  if (!db) {
    return res.status(500).json({ error: "Unable to read database datasets." });
  }
  // Sanitize admin settings
  const { adminSettings, ...publicData } = db;
  res.json(publicData);
});

// Post a contact inquiry message
app.post("/api/messages", async (req, res) => {
  const { senderName, senderEmail, senderPhone, subject, message } = req.body;
  if (!senderName || !senderEmail || !subject || !message) {
    return res.status(400).json({ error: "Required contact form parameters are missing." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Unable to read database." });

  const newMessage = {
    id: "msg_" + Date.now().toString(),
    senderName: String(senderName).slice(0, 150),
    senderEmail: String(senderEmail).slice(0, 150),
    senderPhone: senderPhone ? String(senderPhone).slice(0, 50) : "",
    subject: String(subject).slice(0, 200),
    message: String(message).slice(0, 3000),
    isRead: false,
    receivedAt: new Date().toISOString(),
  };

  db.messages = db.messages || [];
  db.messages.unshift(newMessage);
  saveDBState(db);

  // Retrieve same destination email address used for administrative actions
  const adminSettings = db.adminSettings || {};
  const adminEmail = adminSettings.adminEmail || "biotechagro.digital@gmail.com";

  // Stylized simulated or live console delivery card
  console.log(`\n=============================================================`);
  console.log(`✉️  SECURE EMAIL DELIVERY SYSTEM (Biotech Agro Laboratory)`);
  console.log(`-------------------------------------------------------------`);
  console.log(`To:       ${adminEmail}`);
  console.log(`From (Visitor): ${newMessage.senderName} <${newMessage.senderEmail}>`);
  console.log(`Subject:  📬 [New Contact Inquiry] ${newMessage.subject}`);
  console.log(`Message:  ${newMessage.message.slice(0, 100)}${newMessage.message.length > 100 ? "..." : ""}`);
  console.log(`=============================================================\n`);

  // Send real SMTP notification if configured
  await sendContactInquiryEmail(adminEmail, {
    senderName: newMessage.senderName,
    senderEmail: newMessage.senderEmail,
    senderPhone: newMessage.senderPhone,
    subject: newMessage.subject,
    message: newMessage.message
  });

  res.status(201).json({ success: true, message: newMessage });
});

// Authentication log in
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing login details." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  const adminSettings = db.adminSettings;
  if (!adminSettings) {
    return res.status(500).json({ error: "Admin configuration state missing." });
  }

  let isMatch = false;

  // Defensive fallback helper to enable instant logins (only if default password is not overridden)
  const isDefaultActive = adminSettings.isDefaultPassword !== false;
  if (isDefaultActive && (password === "admin" || password === "mycoadmin" || password === "admin123")) {
    isMatch = true;
  } else {
    const salt = adminSettings.passwordSalt || "myco_tunisia_salt_2026";
    const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    isMatch = hash === adminSettings.passwordHash;
  }

  if (username.toLowerCase() === "admin" && isMatch) {
    const token = generateSessionToken("admin");
    // Securely record login timestamp
    db.adminSettings.lastLogin = new Date().toISOString();
    saveDBState(db);

    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Incorrect administrator login credentials." });
  }
});

// Request a password reset code sent to the registered email
app.post("/api/auth/request-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  const adminSettings = db.adminSettings || {};
  const adminEmail = adminSettings.adminEmail || "biotechagro.digital@gmail.com";

  if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(400).json({ error: "The provided email does not match our administrator registry." });
  }

  // Generate a random 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

  db.adminSettings = {
    ...db.adminSettings,
    adminEmail,
    resetCode: {
      code,
      expiresAt,
    }
  };

  saveDBState(db);

  // Print highly stylized mock email delivery card to the console logs
  console.log(`\n=============================================================`);
  console.log(`✉️  SECURE EMAIL DELIVERY SYSTEM (Biotech Agro Laboratory)`);
  console.log(`-------------------------------------------------------------`);
  console.log(`To:       ${adminEmail}`);
  console.log(`Subject:  Lab Administrative Code Verification Reset`);
  console.log(`Code:     ${code}`);
  console.log(`Alert:    This code is valid for 10 minutes. Please enter`);
  console.log(`          it on the security console to reset the password.`);
  console.log(`=============================================================\n`);

  // Attempt real SMTP execution if configured
  const mailResult = await sendResetCodeEmail(adminEmail, code);

  if (mailResult.realSent) {
    // If sent via real SMTP, do not expose simulatedCode in client response for highest production security!
    return res.json({
      success: true,
      message: `A secure verification code has been dispatched to ${adminEmail} via Biotech-Agro Mail routing.`,
      realSent: true,
    });
  } else if (mailResult.error) {
    // If SMTP is configured but failed to deliver, return descriptive error so they can debug credentials
    return res.status(500).json({
      error: `Failed to dispatch secure email over SMTP gateway (${process.env.SMTP_HOST || "smtp.gmail.com"}). Reason: ${mailResult.error}. Please double-check your SMTP login, port, and security credentials.`
    });
  }

  // Otherwise, fallback to Simulated Sandbox representation
  res.json({
    success: true,
    message: `A security code has been sent to ${adminEmail} (Simulated Sandbox)`,
    simulatedCode: code, // returned so they can easily reset/test it in the client preview environment
    realSent: false,
  });
});

// Reset password with a valid reset code
app.post("/api/auth/reset-password", (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Missing email, code, or new password." });
  }
  if (newPassword.trim().length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  const adminSettings = db.adminSettings || {};
  const adminEmail = adminSettings.adminEmail || "biotechagro.digital@gmail.com";

  if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(400).json({ error: "Provided email address mismatch." });
  }

  const resetInfo = adminSettings.resetCode;
  if (!resetInfo || resetInfo.code !== code.trim() || Date.now() > resetInfo.expiresAt) {
    return res.status(400).json({ error: "Invalid, expired, or missing verification reset code." });
  }

  // Update password hashes
  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = crypto.createHmac("sha256", newSalt).update(newPassword.trim()).digest("hex");

  db.adminSettings = {
    ...db.adminSettings,
    passwordSalt: newSalt,
    passwordHash: newHash,
    isDefaultPassword: false,
    lastLogin: new Date().toISOString(),
    resetCode: null, // Clear reset code
  };

  saveDBState(db);

  res.json({
    success: true,
    message: "Admin password successfully reset! Insecure fallback defaults have been permanently disabled.",
  });
});

// ==========================================
// PROTECTED SECURE ADMIN ENDPOINTS
// ==========================================

// Validate current token
app.get("/api/auth/verify", requireAdmin, (req, res) => {
  res.json({ success: true, username: "admin" });
});

// Get current secure admin details
app.get("/api/auth/settings", requireAdmin, (req, res) => {
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });
  const settings = db.adminSettings || {};
  res.json({
    adminEmail: settings.adminEmail || "biotechagro.digital@gmail.com",
    isDefaultPassword: settings.isDefaultPassword !== false,
    lastLogin: settings.lastLogin || ""
  });
});

// Update Admin Registered Security Email
app.put("/api/auth/update-email", requireAdmin, (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.adminSettings = db.adminSettings || {};
  db.adminSettings.adminEmail = email.trim();

  saveDBState(db);
  res.json({ success: true, email: db.adminSettings.adminEmail, message: "Registered laboratory email updated!" });
});

// Update Admin Password
app.put("/api/auth/update-password", requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = crypto.createHmac("sha256", newSalt).update(newPassword.trim()).digest("hex");

  db.adminSettings = {
    ...db.adminSettings,
    passwordSalt: newSalt,
    passwordHash: newHash,
    isDefaultPassword: false,
    lastLogin: new Date().toISOString(),
  };

  saveDBState(db);
  res.json({ success: true, message: "Administrator password updated successfully and default pass overridden!" });
});

// Update text copy sections
app.put("/api/content/text", requireAdmin, (req, res) => {
  const { section, data } = req.body;
  if (!section || !data) {
    return res.status(400).json({ error: "Section identifier or data values missing." });
  }

  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  if (section === "hero") {
    db.siteContent.hero = { ...db.siteContent.hero, ...data };
  } else if (section === "about") {
    db.siteContent.about = { ...db.siteContent.about, ...data };
  } else if (section === "contact") {
    db.siteContent.contactDetails = { ...db.siteContent.contactDetails, ...data };
  } else if (section === "features") {
    db.siteContent.features = data;
  } else if (section === "logo") {
    db.siteContent.logoUrl = data.logoUrl;
  } else {
    return res.status(400).json({ error: "Invalid text section identifier." });
  }

  saveDBState(db);
  res.json({ success: true, content: db.siteContent });
});

// Add a product catalog item
app.post("/api/products", requireAdmin, (req, res) => {
  const productData = req.body;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  const newProduct = {
    id: "prod_" + Date.now().toString(),
    name: productData.name || "Unnamed Product",
    scientificName: productData.scientificName || "",
    description: productData.description || "",
    category: productData.category || "Grain Spawn",
    price: productData.price || "10 TND",
    status: productData.status || "Available",
    image: productData.image || "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600",
    specifications: Array.isArray(productData.specifications) ? productData.specifications : [],
    availableItems: typeof productData.availableItems === "number" ? productData.availableItems : (parseInt(productData.availableItems, 10) || 50),
    productionDate: productData.productionDate || new Date().toISOString().slice(0, 10),
    expirationDate: productData.expirationDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  };

  db.products = db.products || [];
  db.products.push(newProduct);
  saveDBState(db);

  res.status(201).json({ success: true, product: newProduct });
});

// Update a product catalog item
app.put("/api/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.products = db.products || [];
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product item not found." });
  }

  db.products[index] = {
    ...db.products[index],
    ...updateData,
    id, // Safeguard immutability of ID
  };

  saveDBState(db);
  res.json({ success: true, product: db.products[index] });
});

// Delete a product catalog item
app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.products = db.products || [];
  const initialLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== id);

  if (db.products.length === initialLength) {
    return res.status(404).json({ error: "Product item not found with this id." });
  }

  saveDBState(db);
  res.json({ success: true, message: "Product deleted from catalog." });
});

// Add a consultation service item
app.post("/api/services", requireAdmin, (req, res) => {
  const serviceData = req.body;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  const newService = {
    id: "serv_" + Date.now().toString(),
    name: serviceData.name || "Unnamed Service",
    description: serviceData.description || "",
    price: serviceData.price || "Contact for Quote",
    duration: serviceData.duration || "Custom duration",
    image: serviceData.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600",
    benefits: Array.isArray(serviceData.benefits) ? serviceData.benefits : [],
  };

  db.services = db.services || [];
  db.services.push(newService);
  saveDBState(db);

  res.status(201).json({ success: true, service: newService });
});

// Update a consultation service item
app.put("/api/services/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.services = db.services || [];
  const index = db.services.findIndex((s: any) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Service item not found." });
  }

  db.services[index] = {
    ...db.services[index],
    ...updateData,
    id, // Safe ID
  };

  saveDBState(db);
  res.json({ success: true, service: db.services[index] });
});

// Delete a consultation service item
app.delete("/api/services/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.services = db.services || [];
  const initialLength = db.services.length;
  db.services = db.services.filter((s: any) => s.id !== id);

  if (db.services.length === initialLength) {
    return res.status(404).json({ error: "Service item not found with this id." });
  }

  saveDBState(db);
  res.json({ success: true, message: "Consultation package deleted." });
});

// Admin list all contact forms
app.get("/api/messages", requireAdmin, (req, res) => {
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });
  res.json(db.messages || []);
});

// Toggle message read status
app.put("/api/messages/:id/read", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.messages = db.messages || [];
  const msg = db.messages.find((m: any) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: "Message item not found." });
  }

  msg.isRead = !msg.isRead;
  saveDBState(db);
  res.json({ success: true, message: msg });
});

// Admin delete contact message
app.delete("/api/messages/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.messages = db.messages || [];
  db.messages = db.messages.filter((m: any) => m.id !== id);
  saveDBState(db);

  res.json({ success: true, message: "Contact lead successfully removed." });
});

// Biotech Agro AI Copywriter Assistant powered by Gemini 3.5 Flash
app.post("/api/assistant", requireAdmin, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt copy instruction is missing." });
  }

  const systemInstruction = `You are an expert bio-engineering copywriter specializing in sustainable agriculture, circular bio-economy, organic farming, and mycelium biotechnology in Tunisia. 
The user is managing their Biotech Agro website and needs your assistance drafting clear, professional copy. 

Fulfill their request in a highly academic yet commercially appealing and accessible tone. You can use French, English, or Tunisian terms where appropriate to resonate with local farmers. Keep the response clean and return ONLY the rewritten copy without conversational intro/outro.`;

  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const ai = getGeminiClient();
        console.log(`[Gemini API] Attempt ${attempt} on model ${modelName}...`);
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{
                text: `${systemInstruction}\n\nRequest: ${prompt}`,
              }],
            },
          ],
        });

        const textOutput = result.text?.trim();
        if (textOutput) {
          return res.json({ text: textOutput });
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini API Warning] Attempt ${attempt} for model ${modelName} failed:`, error?.message || error);
        
        // Check if it's a transient, retryable error
        const isTransient = error?.message?.includes("503") || 
                            error?.message?.includes("UNAVAILABLE") || 
                            error?.message?.includes("429") || 
                            error?.message?.includes("RESOURCE_EXHAUSTED");

        if (!isTransient && attempt === 1) {
          // If it is another type of error (e.g. auth, configuration, etc.), don't spin in retry; try next model immediately
          break;
        }

        if (attempt < attempts) {
          const delayMs = attempt * 800; // backoff multiplier
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
  }

  console.error("Gemini API Error in /api/assistant:", lastError);
  res.status(503).json({ 
    error: lastError?.message || "Failed to generate copy using Gemini. The model is currently experiencing high demand. Please try again in a few seconds." 
  });
});


export default app;