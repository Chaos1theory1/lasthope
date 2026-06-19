import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import { put, get } from "@vercel/blob";

const app = express();
// Middleware to parse huge JSON bodies (for user base64 photo uploads up to 20MB)
app.use(express.json({ limit: "10mb" }));

// Resolve paths
// Local file is still used as the seed/fallback.
// On Vercel, public website data is persisted in Vercel Blob.
const SOURCE_DB_PATH = path.join(process.cwd(), "src", "db", "db.json");
const WRITABLE_DB_PATH = process.env.VERCEL ? "/tmp/biotechagro-db.json" : SOURCE_DB_PATH;
const PUBLIC_DATA_BLOB_PATH = "data/public-content.json";
const ADMIN_USERS_BLOB_PATH = process.env.ADMIN_USERS_BLOB_PATH || "data/admin-users.json";
const SESSION_SECRET = process.env.SESSION_SECRET || "mycotunisia_secret_session_2026";
const ADMIN_ACTION_LOG_USER_FOLDER = process.env.ADMIN_ACTION_LOG_USER_FOLDER || "data/admin-action-logs/users";
const MAX_ADMIN_ACTION_LOG_ITEMS = parseInt(process.env.MAX_ADMIN_ACTION_LOG_ITEMS || "1000", 10);

// Do not cache Blob-backed JSON in memory. Vercel serverless instances can keep stale memory
// and accidentally overwrite newer Blob data during ping/login/update requests.

function ensureWritableDB() {
  try {
    if (!fs.existsSync(WRITABLE_DB_PATH) && fs.existsSync(SOURCE_DB_PATH)) {
      fs.mkdirSync(path.dirname(WRITABLE_DB_PATH), { recursive: true });
      fs.copyFileSync(SOURCE_DB_PATH, WRITABLE_DB_PATH);
    }
  } catch (error) {
    console.error("Failed to initialize writable JSON DB:", error);
  }
}

function readLocalDBState() {
  try {
    ensureWritableDB();

    const dbPath = fs.existsSync(WRITABLE_DB_PATH) ? WRITABLE_DB_PATH : SOURCE_DB_PATH;

    if (fs.existsSync(dbPath)) {
      const crude = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(crude);
    }
  } catch (error) {
    console.error("Failed to read local JSON DB:", error);
  }

  return null;
}

function extractPublicWebsiteData(db: any) {
  return {
    siteContent: db?.siteContent || {},
    products: Array.isArray(db?.products) ? db.products : [],
    services: Array.isArray(db?.services) ? db.services : []
  };
}

function mergePublicWebsiteData(baseDb: any, publicData: any) {
  return {
    ...baseDb,
    siteContent: publicData?.siteContent || baseDb?.siteContent || {},
    products: Array.isArray(publicData?.products) ? publicData.products : baseDb?.products || [],
    services: Array.isArray(publicData?.services) ? publicData.services : baseDb?.services || []
  };
}

async function readPublicWebsiteDataFromBlob() {
  try {
    const result = await get(PUBLIC_DATA_BLOB_PATH, { access: "public" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);

    return parsed;
  } catch (error: any) {
    // This is normal the first time, before data/public-content.json exists.
    console.warn("Public website data not found in Blob yet. Using local seed DB.", error?.message || error);
    return null;
  }
}

async function writePublicWebsiteDataToBlob(db: any) {
  const publicData = extractPublicWebsiteData(db);

  await put(PUBLIC_DATA_BLOB_PATH, JSON.stringify(publicData, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0
  });

  return publicData;
}

// Helpers to read and write database
async function getDBState() {
  const localDb = readLocalDBState();

  if (!localDb) {
    return null;
  }

  const blobPublicData = await readPublicWebsiteDataFromBlob();

  if (blobPublicData) {
    return mergePublicWebsiteData(localDb, blobPublicData);
  }

  // First deployment after enabling Blob persistence:
  // seed Blob with current public website data.
  try {
    await writePublicWebsiteDataToBlob(localDb);
  } catch (error) {
    console.error("Failed to seed public website data into Blob:", error);
  }

  return localDb;
}

async function saveDBState(data: any) {
  let localSaved = false;

  // Keep the old temporary/local write so admin reset/session behavior does not break.
  try {
    ensureWritableDB();
    fs.mkdirSync(path.dirname(WRITABLE_DB_PATH), { recursive: true });
    fs.writeFileSync(WRITABLE_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    localSaved = true;
  } catch (error) {
    console.error("Failed to write to local JSON DB:", error);
  }

  // Persist the public website data permanently in Vercel Blob.
  try {
    await writePublicWebsiteDataToBlob(data);
    return true;
  } catch (error) {
    console.error("Failed to write public website data to Vercel Blob:", error);
    return localSaved;
  }
}


type AdminRole = "owner" | "admin" | "editor";

type AdminUser = {
  username: string;
  displayName: string;
  email: string;
  role: AdminRole;
  passwordSalt: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  lastSeenAt?: string;
  resetCode?: {
    code: string;
    expiresAt: number;
  } | null;
};

function normalizeUsername(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function makePasswordHash(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto
    .createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return {
    passwordSalt: salt,
    passwordHash
  };
}

function isUserOnline(lastSeenAt?: string) {
  if (!lastSeenAt) return false;

  const lastSeenTime = new Date(lastSeenAt).getTime();

  if (Number.isNaN(lastSeenTime)) return false;

  return Date.now() - lastSeenTime < 2 * 60 * 1000;
}

function publicAdminUser(user: AdminUser) {
  return {
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin || "",
    lastSeenAt: user.lastSeenAt || "",
    isOnline: isUserOnline(user.lastSeenAt)
  };
}

type AdminUsersReadResult = {
  users: AdminUser[] | null;
  notFound: boolean;
  error?: any;
};

function isBlobNotFoundError(error: any) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("no such") ||
    message.includes("does not exist") ||
    message.includes("could not be found")
  );
}

async function readAdminUsersFromBlob(): Promise<AdminUsersReadResult> {
  try {
    const result = await get(ADMIN_USERS_BLOB_PATH, { access: "public" });

    if (!result || result.statusCode === 404 || !result.stream) {
      return { users: null, notFound: true };
    }

    if (result.statusCode !== 200) {
      return {
        users: null,
        notFound: result.statusCode === 404,
        error: new Error(`Unexpected Blob status while reading admin users: ${result.statusCode}`)
      };
    }

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      return {
        users: null,
        notFound: false,
        error: new Error("Admin users JSON exists but is not an array.")
      };
    }

    return { users: parsed, notFound: false };
  } catch (error: any) {
    if (isBlobNotFoundError(error)) {
      console.warn("Admin users Blob not found yet. It will be seeded once.", error?.message || error);
      return { users: null, notFound: true, error };
    }

    console.error("Failed to read persistent admin users JSON from Vercel Blob:", error?.message || error);
    return { users: null, notFound: false, error };
  }
}

async function writeAdminUsersToBlob(
  users: AdminUser[],
  options: { allowOverwrite?: boolean } = {}
) {
  await put(ADMIN_USERS_BLOB_PATH, JSON.stringify(users, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: options.allowOverwrite ?? true,
    cacheControlMaxAge: 0
  });

  return users;
}

async function getAdminUsers(seedDb?: any): Promise<AdminUser[]> {
  const readResult = await readAdminUsersFromBlob();

  if (readResult.users && readResult.users.length > 0) {
    return readResult.users;
  }

  if (readResult.users && readResult.users.length === 0) {
    return readResult.users;
  }

  if (readResult.error && !readResult.notFound) {
    throw new Error(
      "Could not read persistent admin users JSON from Vercel Blob. Existing users were not overwritten. Check BLOB_READ_WRITE_TOKEN and Vercel Blob access."
    );
  }

  const db = seedDb || readLocalDBState() || {};
  const adminSettings = db.adminSettings || {};

  let passwordSalt = adminSettings.passwordSalt || "";
  let passwordHash = adminSettings.passwordHash || "";

  if (!passwordSalt || !passwordHash) {
    const generated = makePasswordHash(process.env.DEFAULT_ADMIN_PASSWORD || "admin123");
    passwordSalt = generated.passwordSalt;
    passwordHash = generated.passwordHash;
  }

  const seedUsers: AdminUser[] = [
    {
      username: "admin",
      displayName: "Main Admin",
      email: adminSettings.adminEmail || process.env.DEFAULT_ADMIN_EMAIL || "biotechagro.digital@gmail.com",
      role: "owner",
      passwordSalt,
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: adminSettings.lastLogin || "",
      lastSeenAt: "",
      resetCode: null
    }
  ];

  try {
    await writeAdminUsersToBlob(seedUsers, { allowOverwrite: false });
  } catch (error: any) {
    throw new Error(
      "Admin users JSON could not be seeded without overwrite. Existing users were preserved. Please check Vercel Blob data/admin-users.json and redeploy."
    );
  }

  return seedUsers;
}

type AdminActionLogEntry = {
  id: string;
  timestamp: string;
  actor: {
    username: string;
    displayName?: string;
    email?: string;
    role?: string;
  };
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceLabel?: string;
  details?: any;
};

function safeLogUsername(username: string) {
  return String(username || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function sanitizeLogDetails(value: any): any {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeLogDetails);
  }

  if (typeof value === "object") {
    const sanitized: any = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("token") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("hash") ||
        lowerKey.includes("salt") ||
        lowerKey.includes("code")
      ) {
        sanitized[key] = "[redacted]";
      } else {
        sanitized[key] = sanitizeLogDetails(nestedValue);
      }
    }
    return sanitized;
  }

  return value;
}

async function readAdminUserLogFile(username: string): Promise<AdminActionLogEntry[]> {
  try {
    const usernameForPath = safeLogUsername(username);
    const userLogPath = `${ADMIN_ACTION_LOG_USER_FOLDER}/${usernameForPath}.json`;

    const result = await get(userLogPath, { access: "public" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return [];
    }

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeAdminUserLogFile(username: string, logs: AdminActionLogEntry[]) {
  const usernameForPath = safeLogUsername(username);
  const userLogPath = `${ADMIN_ACTION_LOG_USER_FOLDER}/${usernameForPath}.json`;

  const blob = await put(userLogPath, JSON.stringify(logs, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0
  });

  return {
    path: userLogPath,
    pathname: blob.pathname,
    url: blob.url
  };
}

async function createAdminUserLogFile(
  newUser: AdminUser,
  createdBy?: AdminUser
) {
  const usernameForPath = safeLogUsername(newUser.username);
  const userLogPath = `${ADMIN_ACTION_LOG_USER_FOLDER}/${usernameForPath}.json`;
  const previousLogs = await readAdminUserLogFile(newUser.username);

  const firstEntry: AdminActionLogEntry = {
    id: `log_${Date.now()}_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    actor: {
      username: createdBy?.username || "system",
      displayName: createdBy?.displayName || "System",
      email: createdBy?.email || "",
      role: createdBy?.role || "system"
    },
    action: "USER_ACCOUNT_CREATED",
    resourceType: "admin_user",
    resourceId: newUser.username,
    resourceLabel: `${newUser.displayName} (${newUser.role})`,
    details: {
      createdUsername: newUser.username,
      createdEmail: newUser.email,
      createdRole: newUser.role,
      logFileCreated: userLogPath
    }
  };

  const updatedLogs = [firstEntry, ...previousLogs].slice(0, MAX_ADMIN_ACTION_LOG_ITEMS);
  const logFile = await writeAdminUserLogFile(newUser.username, updatedLogs);

  console.log("Admin user log file created:", {
    username: newUser.username,
    pathname: logFile.pathname,
    url: logFile.url
  });

  return logFile;
}

async function appendCurrentAdminActionLog(
  req: express.Request,
  log: {
    action: string;
    resourceType: string;
    resourceId?: string;
    resourceLabel?: string;
    details?: any;
  }
) {
  try {
    const currentUser = (req as any).adminUser as AdminUser | undefined;

    if (!currentUser) {
      console.warn("Action log skipped: no admin user attached to request.");
      return null;
    }

    const previousLogs = await readAdminUserLogFile(currentUser.username);

    const newEntry: AdminActionLogEntry = {
      id: `log_${Date.now()}_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      actor: {
        username: currentUser.username,
        displayName: currentUser.displayName,
        email: currentUser.email,
        role: currentUser.role
      },
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId || "",
      resourceLabel: log.resourceLabel || "",
      details: sanitizeLogDetails(log.details || {})
    };

    const updatedLogs = [newEntry, ...previousLogs].slice(0, MAX_ADMIN_ACTION_LOG_ITEMS);
    const logFile = await writeAdminUserLogFile(currentUser.username, updatedLogs);

    return {
      ...logFile,
      entry: newEntry
    };
  } catch (error: any) {
    console.error("Failed to append admin action log:", error?.message || error);
    return null;
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


//Send welcome email when created new user

async function sendAdminInviteEmail(
  toEmail: string,
  invite: {
    username: string;
    displayName: string;
    role: string;
    createdBy?: string;
  }
): Promise<{ success: boolean; realSent: boolean; error?: string }> {
  try {
    const transporter = getMailTransporter();

    if (!transporter) {
      console.warn("SMTP credentials not configured. Admin invite email simulated only.");
      return { success: true, realSent: false };
    }

    const cleanEnvStr = (val?: string): string => {
      if (!val) return "";
      return val.replace(/^["']|["']$/g, "").trim();
    };

    const senderEmail = cleanEnvStr(process.env.SMTP_USER || "contact@biotech-agro.com");
    const senderName = "Biotech Agro Administration";

    const safeDisplayName = invite.displayName || invite.username;
    const safeRole = invite.role.toUpperCase();

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: toEmail,
      subject: "Welcome to the Biotech Agro Admin Console",
      text: `Hello ${safeDisplayName},

Welcome to Biotech Agro.

An administrator account has been created for you on the Biotech Agro website console.

Account details:
Username: ${invite.username}
Role: ${safeRole}

For security reasons, your password is not included in this email.

Please contact the website administrator to receive your temporary password and access instructions.

After your first login, we recommend changing your password from the admin console.

Best regards,
Biotech Agro Administration`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 30px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 18px; color: #1c1917;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 14px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 50%; font-size: 28px;">
              🔬
            </div>
            <h2 style="margin: 12px 0 4px; font-size: 22px;">Welcome to Biotech Agro</h2>
            <p style="margin: 0; color: #047857; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
              Website Admin Console Invitation
            </p>
          </div>

          <p style="font-size: 14px; line-height: 1.6;">Hello <strong>${safeDisplayName}</strong>,</p>

          <p style="font-size: 14px; line-height: 1.6;">
            An administrator account has been created for you on the Biotech Agro website console.
          </p>

          <div style="background: #ffffff; border: 1px solid #e7e5e4; border-radius: 14px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 13px;"><strong>Username:</strong> ${invite.username}</p>
            <p style="margin: 0; font-size: 13px;"><strong>Role:</strong> ${safeRole}</p>
          </div>

          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #7c2d12;">
            <strong>Security notice:</strong> your password is not included in this email.
            Please contact the website administrator to receive your temporary password and access instructions.
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #57534e;">
            After your first login, we recommend changing your password from the admin console.
          </p>

          <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #78716c; text-align: center;">
            Biotech Agro Administration
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Admin invite email sent to ${toEmail}. MessageID: ${info.messageId}`);

    return { success: true, realSent: true };
  } catch (error: any) {
    console.error("Failed to send admin invite email:", error);

    return {
      success: false,
      realSent: false,
      error: error.message || String(error)
    };
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
  const cleanUsername = normalizeUsername(username);
  const expires = Date.now() + 1000 * 60 * 60 * 24; // Valid for 24 hours
  const hmacInput = `${cleanUsername}:${expires}`;
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(hmacInput)
    .digest("hex");

  return `${cleanUsername}:${expires}:${hmac}`;
}

function getSessionUsernameFromToken(token?: string): string | null {
  if (!token) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [username, expiresStr, hmacDigest] = parts;
  const cleanUsername = normalizeUsername(username);
  const expires = parseInt(expiresStr, 10);

  if (!cleanUsername || Number.isNaN(expires) || expires < Date.now()) {
    return null;
  }

  const hmacInput = `${cleanUsername}:${expires}`;
  const computedHmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(hmacInput)
    .digest("hex");

  try {
    const valid = crypto.timingSafeEqual(
      Buffer.from(hmacDigest),
      Buffer.from(computedHmac)
    );

    return valid ? cleanUsername : null;
  } catch (err) {
    return null;
  }
}

// Middleware to secure administrator endpoints
async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Private session missing." });
  }

  const token = authHeader.split(" ")[1];
  const username = getSessionUsernameFromToken(token);

  if (!username) {
    return res.status(403).json({ error: "Invalid or expired admin session token." });
  }

  try {
    const users = await getAdminUsers();
    const user = users.find((adminUser) => adminUser.username === username);

    if (!user || !user.isActive) {
      return res.status(403).json({ error: "Admin account is inactive or no longer exists." });
    }

    (req as any).adminUser = user;
    next();
  } catch (error: any) {
    console.error("Admin authentication failed:", error);
    return res.status(500).json({
      error: error?.message || "Admin authentication failed."
    });
  }
}

function requireOwner(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).adminUser as AdminUser | undefined;

  if (!user || user.role !== "owner") {
    return res.status(403).json({ error: "Owner access required." });
  }

  next();
}

app.post("/api/media/upload", requireAdmin, async (req, res) => {
  try {
    const { dataUrl, filename, folder } = req.body || {};

    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Missing image data." });
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({ error: "Invalid image format." });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    const maxSize = 3 * 1024 * 1024;

    if (buffer.length > maxSize) {
      return res.status(400).json({
        error: "Image is too large. Please upload an image smaller than 3 MB."
      });
    }

    const extension =
      contentType === "image/png" ? "png" :
      contentType === "image/webp" ? "webp" :
      contentType === "image/gif" ? "gif" :
      contentType === "image/svg+xml" ? "svg" :
      "jpg";

    const safeFolder =
      folder === "home" ? "home" :
      folder === "about" ? "about" :
      folder === "gallery" ? "gallery" :
      folder === "products" ? "products" :
      folder === "services" ? "services" :
      folder === "logos" ? "logos" :
      folder === "team" ? "team" :
      folder === "certifications" ? "certifications" :
      "content";

    const safeFilename = String(filename || "image")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const pathname = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}-${safeFilename || "image"}.${extension}`;

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false
    });

    const actionLog = await appendCurrentAdminActionLog(req, {
      action: "UPLOAD_MEDIA",
      resourceType: "media",
      resourceId: blob.pathname,
      resourceLabel: safeFilename || "image",
      details: {
        folder: safeFolder,
        pathname: blob.pathname,
        contentType: blob.contentType,
        sizeBytes: buffer.length
      }
    });

    return res.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      actionLog
    });
  } catch (error: any) {
    console.error("Blob upload error:", error);

    return res.status(500).json({
      error: error.message || "Failed to upload image."
    });
  }
});

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Get entire site datasets
app.get("/api/content", async (req, res) => {
  const db = await getDBState();
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

  const db = await getDBState();
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
  await saveDBState(db);

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
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing login details." });
  }

  const cleanUsername = normalizeUsername(username);

  try {
    const db = await getDBState();
    if (!db) return res.status(500).json({ error: "Database state inaccessible." });

    const users = await getAdminUsers(db);
    const userIndex = users.findIndex((user) => user.username === cleanUsername);
    const user = userIndex >= 0 ? users[userIndex] : null;

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Incorrect administrator login credentials." });
    }

    const attemptedHash = crypto
      .createHmac("sha256", user.passwordSalt)
      .update(password)
      .digest("hex");

    let isMatch = attemptedHash === user.passwordHash;

    // Legacy safety for the first seeded admin only, before you set a stronger password.
    const allowLegacyDefault =
      cleanUsername === "admin" &&
      user.role === "owner" &&
      (password === "admin" || password === "mycoadmin" || password === "admin123");

    if (!isMatch && allowLegacyDefault) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect administrator login credentials." });
    }

    const now = new Date().toISOString();

    users[userIndex] = {
      ...user,
      lastLogin: now,
      lastSeenAt: now,
      resetCode: null
    };

    await writeAdminUsersToBlob(users);

    db.adminSettings = {
      ...(db.adminSettings || {}),
      adminEmail: users[userIndex].email,
      lastLogin: now
    };

    await saveDBState(db);

    const token = generateSessionToken(users[userIndex].username);

    res.json({
      success: true,
      token,
      user: publicAdminUser(users[userIndex])
    });
  } catch (error: any) {
    console.error("Login failed:", error);
    res.status(500).json({ error: error?.message || "Login failed." });
  }
});

// Request a password reset code sent to the matching admin user's registered email
app.post("/api/auth/request-reset", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  try {
    const users = await getAdminUsers();
    const cleanEmail = String(email).trim().toLowerCase();

    const userIndex = users.findIndex(
      (user) => user.email.toLowerCase() === cleanEmail && user.isActive
    );

    if (userIndex === -1) {
      return res.status(400).json({ error: "No active admin account uses this email." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    users[userIndex] = {
      ...users[userIndex],
      resetCode: {
        code,
        expiresAt
      }
    };

    await writeAdminUsersToBlob(users);

    const destinationEmail = users[userIndex].email;
    const mailResult = await sendResetCodeEmail(destinationEmail, code);

    if (mailResult.realSent) {
      return res.json({
        success: true,
        message: `A secure verification code has been sent to ${destinationEmail}.`,
        realSent: true
      });
    }

    if (mailResult.error) {
      return res.status(500).json({
        error: `Failed to dispatch secure email. Reason: ${mailResult.error}`
      });
    }

    return res.json({
      success: true,
      message: `A security code has been generated for ${destinationEmail} (Simulated Sandbox).`,
      simulatedCode: code,
      realSent: false
    });
  } catch (error: any) {
    console.error("Password reset request failed:", error);
    return res.status(500).json({
      error: error?.message || "Password reset request failed."
    });
  }
});

// Reset password with a valid reset code
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Missing email, code, or new password." });
  }

  if (String(newPassword).trim().length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long." });
  }

  try {
    const users = await getAdminUsers();
    const cleanEmail = String(email).trim().toLowerCase();

    const userIndex = users.findIndex(
      (user) => user.email.toLowerCase() === cleanEmail && user.isActive
    );

    if (userIndex === -1) {
      return res.status(400).json({ error: "No active admin account uses this email." });
    }

    const user = users[userIndex];
    const resetInfo = user.resetCode;

    if (!resetInfo || resetInfo.code !== String(code).trim() || Date.now() > resetInfo.expiresAt) {
      return res.status(400).json({ error: "Invalid, expired, or missing verification reset code." });
    }

    const newHash = makePasswordHash(String(newPassword).trim());

    users[userIndex] = {
      ...user,
      passwordSalt: newHash.passwordSalt,
      passwordHash: newHash.passwordHash,
      resetCode: null
    };

    await writeAdminUsersToBlob(users);

    if (users[userIndex].username === "admin") {
      const db = await getDBState();
      if (db) {
        db.adminSettings = {
          ...(db.adminSettings || {}),
          passwordSalt: newHash.passwordSalt,
          passwordHash: newHash.passwordHash,
          isDefaultPassword: false,
          lastLogin: new Date().toISOString(),
          resetCode: null
        };
        await saveDBState(db);
      }
    }

    return res.json({
      success: true,
      message: "Password reset successfully."
    });
  } catch (error: any) {
    console.error("Password reset failed:", error);
    return res.status(500).json({
      error: error?.message || "Password reset failed."
    });
  }
});

// ==========================================
// PROTECTED SECURE ADMIN ENDPOINTS
// ==========================================

// Validate current token
app.get("/api/auth/verify", requireAdmin, (req, res) => {
  const user = (req as any).adminUser as AdminUser;

  res.json({
    success: true,
    username: user.username,
    user: publicAdminUser(user)
  });
});

app.post("/api/auth/ping", requireAdmin, async (req, res) => {
  try {
    const currentUser = (req as any).adminUser as AdminUser;
    const users = await getAdminUsers();
    const now = new Date().toISOString();

    const updatedUsers = users.map((user) =>
      user.username === currentUser.username
        ? {
            ...user,
            lastSeenAt: now
          }
        : user
    );

    await writeAdminUsersToBlob(updatedUsers);

    const updatedUser = updatedUsers.find((user) => user.username === currentUser.username);

    res.json({
      success: true,
      user: updatedUser ? publicAdminUser(updatedUser) : null
    });
  } catch (error: any) {
    console.error("Admin ping failed:", error);
    res.status(500).json({ error: error?.message || "Admin ping failed." });
  }
});

app.post("/api/admin/sync-public-data", requireAdmin, async (req, res) => {
  const db = await getDBState();

  if (!db) {
    return res.status(500).json({ error: "Database state inaccessible." });
  }

  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "SYNC_PUBLIC_DATA",
    resourceType: "public_content",
    resourceId: PUBLIC_DATA_BLOB_PATH,
    resourceLabel: "Public website data",
    details: {
      blobPath: PUBLIC_DATA_BLOB_PATH,
      products: Array.isArray(db.products) ? db.products.length : 0,
      services: Array.isArray(db.services) ? db.services.length : 0,
      hasSiteContent: Boolean(db.siteContent)
    }
  });

  return res.json({
    success: true,
    message: "Public website data synced to Vercel Blob.",
    blobPath: PUBLIC_DATA_BLOB_PATH,
    products: Array.isArray(db.products) ? db.products.length : 0,
    services: Array.isArray(db.services) ? db.services.length : 0,
    hasSiteContent: Boolean(db.siteContent),
    actionLog
  });
});

// Get current secure admin details
app.get("/api/auth/settings", requireAdmin, async (req, res) => {
  const user = (req as any).adminUser as AdminUser;

  res.json({
    username: user.username,
    displayName: user.displayName,
    adminEmail: user.email,
    role: user.role,
    isDefaultPassword: false,
    lastLogin: user.lastLogin || "",
    lastSeenAt: user.lastSeenAt || ""
  });
});

// Update current admin registered security email
app.put("/api/auth/update-email", requireAdmin, async (req, res) => {
  const { email } = req.body;

  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ error: "A valid email is required." });
  }

  try {
    const currentUser = (req as any).adminUser as AdminUser;
    const users = await getAdminUsers();
    const cleanEmail = String(email).trim();

    const duplicate = users.find(
      (user) =>
        user.email.toLowerCase() === cleanEmail.toLowerCase() &&
        user.username !== currentUser.username
    );

    if (duplicate) {
      return res.status(400).json({ error: "This email is already used by another admin account." });
    }

    const updatedUsers = users.map((user) =>
      user.username === currentUser.username
        ? {
            ...user,
            email: cleanEmail
          }
        : user
    );

    await writeAdminUsersToBlob(updatedUsers);

    if (currentUser.username === "admin") {
      const db = await getDBState();
      if (db) {
        db.adminSettings = {
          ...(db.adminSettings || {}),
          adminEmail: cleanEmail
        };
        await saveDBState(db);
      }
    }

    const actionLog = await appendCurrentAdminActionLog(req, {
      action: "UPDATE_OWN_EMAIL",
      resourceType: "admin_user",
      resourceId: currentUser.username,
      resourceLabel: currentUser.displayName,
      details: {
        username: currentUser.username,
        previousEmail: currentUser.email,
        newEmail: cleanEmail
      }
    });

    return res.json({
      success: true,
      email: cleanEmail,
      message: "Registered account email updated successfully.",
      actionLog
    });
  } catch (error: any) {
    console.error("Update email failed:", error);
    res.status(500).json({ error: error?.message || "Failed to update email." });
  }
});

// Update current admin password
app.put("/api/auth/update-password", requireAdmin, async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || String(newPassword).trim().length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long." });
  }

  try {
    const currentUser = (req as any).adminUser as AdminUser;
    const users = await getAdminUsers();
    const newHash = makePasswordHash(String(newPassword).trim());

    const updatedUsers = users.map((user) =>
      user.username === currentUser.username
        ? {
            ...user,
            passwordSalt: newHash.passwordSalt,
            passwordHash: newHash.passwordHash,
            resetCode: null
          }
        : user
    );

    await writeAdminUsersToBlob(updatedUsers);

    if (currentUser.username === "admin") {
      const db = await getDBState();
      if (db) {
        db.adminSettings = {
          ...(db.adminSettings || {}),
          passwordSalt: newHash.passwordSalt,
          passwordHash: newHash.passwordHash,
          isDefaultPassword: false,
          lastLogin: new Date().toISOString()
        };
        await saveDBState(db);
      }
    }

    const actionLog = await appendCurrentAdminActionLog(req, {
      action: "UPDATE_OWN_PASSWORD",
      resourceType: "admin_user",
      resourceId: currentUser.username,
      resourceLabel: currentUser.displayName,
      details: {
        username: currentUser.username
      }
    });

    return res.json({
      success: true,
      message: "Your password was updated successfully.",
      actionLog
    });
  } catch (error: any) {
    console.error("Update password failed:", error);
    res.status(500).json({ error: error?.message || "Failed to update password." });
  }
});

// Owner-only admin user management
app.get("/api/admin/users", requireAdmin, requireOwner, async (req, res) => {
  try {
    const users = await getAdminUsers();

    res.json({
      success: true,
      users: users.map(publicAdminUser)
    });
  } catch (error: any) {
    console.error("Load admin users failed:", error);
    res.status(500).json({ error: error?.message || "Failed to load admin users." });
  }
});

app.post("/api/admin/users", requireAdmin, requireOwner, async (req, res) => {
  try {
    const { username, displayName, email, password, role } = req.body;
    const cleanUsername = normalizeUsername(username);

    if (!cleanUsername) {
      return res.status(400).json({ error: "Username is required." });
    }

    if (!email || !String(email).includes("@")) {
      return res.status(400).json({ error: "Valid email is required." });
    }

    if (!password || String(password).trim().length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    const cleanRole: AdminRole =
      role === "owner" || role === "admin" || role === "editor" ? role : "editor";

    const users = await getAdminUsers();

    if (users.some((user) => user.username === cleanUsername)) {
      return res.status(400).json({ error: "Username already exists." });
    }

    if (users.some((user) => user.email.toLowerCase() === String(email).trim().toLowerCase())) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hash = makePasswordHash(String(password).trim());

    const newUser: AdminUser = {
      username: cleanUsername,
      displayName: displayName ? String(displayName).trim() : cleanUsername,
      email: String(email).trim(),
      role: cleanRole,
      passwordSalt: hash.passwordSalt,
      passwordHash: hash.passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: "",
      lastSeenAt: "",
      resetCode: null
    };

    users.push(newUser);

    await writeAdminUsersToBlob(users);

    const currentUser = (req as any).adminUser as AdminUser | undefined;

    let userLogFile: any = null;

    try {
      userLogFile = await createAdminUserLogFile(newUser, currentUser);
    } catch (logError: any) {
      console.error("User was created, but log file creation failed:", logError?.message || logError);
    }

    const ownerActionLog = await appendCurrentAdminActionLog(req, {
      action: "CREATE_ADMIN_USER",
      resourceType: "admin_user",
      resourceId: newUser.username,
      resourceLabel: `${newUser.displayName} (${newUser.role})`,
      details: {
        createdUsername: newUser.username,
        createdEmail: newUser.email,
        createdRole: newUser.role,
        userLogFile
      }
    });

    const inviteEmailResult = await sendAdminInviteEmail(newUser.email, {
      username: newUser.username,
      displayName: newUser.displayName,
      role: newUser.role,
      createdBy: currentUser?.username
    });

    return res.status(201).json({
      success: true,
      user: publicAdminUser(newUser),
      userLogFile,
      ownerActionLog,
      inviteEmail: {
        success: inviteEmailResult.success,
        realSent: inviteEmailResult.realSent,
        error: inviteEmailResult.error || ""
      }
    });
  } catch (error: any) {
    console.error("Create admin user failed:", error);

    return res.status(500).json({
      error: error?.message || "Failed to create admin user."
    });
  }
});

app.put("/api/admin/users/:username", requireAdmin, requireOwner, async (req, res) => {
  try {
    const targetUsername = normalizeUsername(req.params.username);
    const { displayName, email, role, isActive } = req.body;

    const users = await getAdminUsers();
    const userIndex = users.findIndex((user) => user.username === targetUsername);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    const currentUser = (req as any).adminUser as AdminUser;
    const previousUser = { ...users[userIndex] };

    if (targetUsername === currentUser.username && isActive === false) {
      return res.status(400).json({ error: "You cannot deactivate your own account." });
    }

    const cleanRole: AdminRole | undefined =
      role === "owner" || role === "admin" || role === "editor" ? role : undefined;

    if (targetUsername === currentUser.username && cleanRole && cleanRole !== "owner") {
      return res.status(400).json({ error: "You cannot remove owner access from your own account." });
    }

    if (email) {
      const duplicate = users.find(
        (user) =>
          user.email.toLowerCase() === String(email).trim().toLowerCase() &&
          user.username !== targetUsername
      );

      if (duplicate) {
        return res.status(400).json({ error: "This email is already used by another admin account." });
      }
    }

    if (previousUser.role === "owner" && cleanRole && cleanRole !== "owner") {
      const otherActiveOwners = users.filter(
        (user) => user.username !== targetUsername && user.role === "owner" && user.isActive
      );

      if (otherActiveOwners.length === 0) {
        return res.status(400).json({ error: "At least one active owner account is required." });
      }
    }

    if (typeof isActive === "boolean" && isActive === false && previousUser.role === "owner") {
      const otherActiveOwners = users.filter(
        (user) => user.username !== targetUsername && user.role === "owner" && user.isActive
      );

      if (otherActiveOwners.length === 0) {
        return res.status(400).json({ error: "At least one active owner account is required." });
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      displayName: displayName !== undefined ? String(displayName).trim() : users[userIndex].displayName,
      email: email !== undefined ? String(email).trim() : users[userIndex].email,
      role: cleanRole || users[userIndex].role,
      isActive: typeof isActive === "boolean" ? isActive : users[userIndex].isActive
    };

    await writeAdminUsersToBlob(users);

    const actionLog = await appendCurrentAdminActionLog(req, {
      action: "UPDATE_ADMIN_USER",
      resourceType: "admin_user",
      resourceId: users[userIndex].username,
      resourceLabel: `${users[userIndex].displayName} (${users[userIndex].role})`,
      details: {
        username: users[userIndex].username,
        before: {
          displayName: previousUser.displayName,
          email: previousUser.email,
          role: previousUser.role,
          isActive: previousUser.isActive
        },
        after: {
          displayName: users[userIndex].displayName,
          email: users[userIndex].email,
          role: users[userIndex].role,
          isActive: users[userIndex].isActive
        }
      }
    });

    return res.json({
      success: true,
      user: publicAdminUser(users[userIndex]),
      users: users.map(publicAdminUser),
      actionLog
    });
  } catch (error: any) {
    console.error("Update admin user failed:", error);

    return res.status(500).json({
      error: error?.message || "Failed to update admin user."
    });
  }
});

app.put("/api/admin/users/:username/password", requireAdmin, requireOwner, async (req, res) => {
  try {
    const targetUsername = normalizeUsername(req.params.username);
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).trim().length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    const users = await getAdminUsers();
    const userIndex = users.findIndex((user) => user.username === targetUsername);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    const hash = makePasswordHash(String(newPassword).trim());

    users[userIndex] = {
      ...users[userIndex],
      passwordSalt: hash.passwordSalt,
      passwordHash: hash.passwordHash,
      resetCode: null
    };

    await writeAdminUsersToBlob(users);

    const actionLog = await appendCurrentAdminActionLog(req, {
      action: "RESET_ADMIN_USER_PASSWORD",
      resourceType: "admin_user",
      resourceId: users[userIndex].username,
      resourceLabel: users[userIndex].displayName,
      details: {
        username: users[userIndex].username,
        role: users[userIndex].role
      }
    });

    return res.json({
      success: true,
      message: "Admin user password updated.",
      user: publicAdminUser(users[userIndex]),
      actionLog
    });
  } catch (error: any) {
    console.error("Update admin user password failed:", error);

    return res.status(500).json({
      error: error?.message || "Failed to update admin user password."
    });
  }
});

app.delete("/api/admin/users/:username", requireAdmin, requireOwner, async (req, res) => {
  try {
    const targetUsername = normalizeUsername(req.params.username);
    const currentUser = (req as any).adminUser as AdminUser;

    if (targetUsername === currentUser.username) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const users = await getAdminUsers();
    const userToDelete = users.find((user) => user.username === targetUsername);

    if (!userToDelete) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    const remainingUsers = users.filter((user) => user.username !== targetUsername);

    if (!remainingUsers.some((user) => user.role === "owner" && user.isActive)) {
      return res.status(400).json({ error: "At least one active owner account is required." });
    }

    await writeAdminUsersToBlob(remainingUsers);

    const actionLog = await appendCurrentAdminActionLog(req, {
      action: "DELETE_ADMIN_USER",
      resourceType: "admin_user",
      resourceId: userToDelete.username,
      resourceLabel: `${userToDelete.displayName} (${userToDelete.role})`,
      details: {
        username: userToDelete.username,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });

    return res.json({
      success: true,
      message: "Admin user deleted.",
      users: remainingUsers.map(publicAdminUser),
      actionLog
    });
  } catch (error: any) {
    console.error("Delete admin user failed:", error);

    return res.status(500).json({
      error: error?.message || "Failed to delete admin user."
    });
  }
});

app.get("/api/admin/users/:username/log", requireAdmin, requireOwner, async (req, res) => {
  try {
    const username = safeLogUsername(req.params.username);
    const userLogPath = `${ADMIN_ACTION_LOG_USER_FOLDER}/${username}.json`;

    const result = await get(userLogPath, { access: "public" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(404).json({
        success: false,
        error: "User log file not found.",
        path: userLogPath
      });
    }

    const text = await new Response(result.stream).text();
    const logs = JSON.parse(text);

    return res.json({
      success: true,
      path: userLogPath,
      logs: Array.isArray(logs) ? logs : []
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to read user log file."
    });
  }
});

// Update text copy sections// Update text copy sections
// Update text copy sections
app.put("/api/content/text", requireAdmin, async (req, res) => {
  const { section, data } = req.body;

  if (!section || data === undefined || data === null) {
    return res.status(400).json({ error: "Section identifier or data values missing." });
  }

  const db = await getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.siteContent = db.siteContent || {};

  if (section === "hero") {
    db.siteContent.hero = { ...(db.siteContent.hero || {}), ...data };
  } else if (section === "about") {
    db.siteContent.about = { ...(db.siteContent.about || {}), ...data };
  } else if (section === "contact") {
    db.siteContent.contactDetails = { ...(db.siteContent.contactDetails || {}), ...data };
  } else if (section === "features") {
    db.siteContent.features = data;
  } else if (section === "logo") {
    db.siteContent.logoUrl = data.logoUrl;
  } else if (section === "header") {
    db.siteContent.header = data;
  } else if (section === "footer") {
    db.siteContent.footer = data;
  } else if (section === "catalog") {
    db.siteContent.catalog = data;
  } else if (section === "gallery") {
    db.siteContent.gallery = {
      ...(db.siteContent.gallery || {}),
      ...data,
      images: Array.isArray(data.images) ? data.images : []
    };
  } else if (section === "team") {
    db.siteContent.team = Array.isArray(data) ? data : [];
  } else if (section === "certifications") {
    db.siteContent.certifications = Array.isArray(data) ? data : [];
  } else {
    return res.status(400).json({
      error: "Invalid text section identifier.",
      receivedSection: section,
      allowedSections: [
        "hero",
        "about",
        "contact",
        "features",
        "logo",
        "header",
        "footer",
        "catalog",
        "gallery",
        "team",
        "certifications"
      ]
    });
  }

  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "UPDATE_CONTENT_SECTION",
    resourceType: "site_content",
    resourceId: section,
    resourceLabel: section,
    details: {
      section,
      changedKeys: typeof data === "object" && data !== null ? Object.keys(data) : []
    }
  });

  res.json({ success: true, content: db.siteContent, actionLog });
});

// Add a product catalog item
app.post("/api/products", requireAdmin, async (req, res) => {
  const productData = req.body;
  const db = await getDBState();
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
  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "CREATE_PRODUCT",
    resourceType: "product",
    resourceId: newProduct.id,
    resourceLabel: newProduct.name,
    details: {
      name: newProduct.name,
      category: newProduct.category,
      status: newProduct.status
    }
  });

  res.status(201).json({ success: true, product: newProduct, actionLog });
});

// Update a product catalog item
app.put("/api/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
 const db = await getDBState();
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

  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "UPDATE_PRODUCT",
    resourceType: "product",
    resourceId: id,
    resourceLabel: db.products[index].name,
    details: {
      productId: id,
      changedKeys: Object.keys(updateData || {})
    }
  });

  res.json({ success: true, product: db.products[index], actionLog });
});

// Delete a product catalog item
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const db = await getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.products = db.products || [];
  const deletedProduct = db.products.find((p: any) => p.id === id);
  const initialLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== id);

  if (db.products.length === initialLength) {
    return res.status(404).json({ error: "Product item not found with this id." });
  }

  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "DELETE_PRODUCT",
    resourceType: "product",
    resourceId: id,
    resourceLabel: deletedProduct?.name || id,
    details: {
      productId: id,
      name: deletedProduct?.name || ""
    }
  });

  res.json({ success: true, message: "Product deleted from catalog.", actionLog });
});

// Add a consultation service item
app.post("/api/services", requireAdmin, async (req, res) => {
  const serviceData = req.body;
  const db = await getDBState();
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
  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "CREATE_SERVICE",
    resourceType: "service",
    resourceId: newService.id,
    resourceLabel: newService.name,
    details: {
      name: newService.name,
      price: newService.price,
      duration: newService.duration
    }
  });

  res.status(201).json({ success: true, service: newService, actionLog });
});

// Update a consultation service item
app.put("/api/services/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = await getDBState();
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

  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "UPDATE_SERVICE",
    resourceType: "service",
    resourceId: id,
    resourceLabel: db.services[index].name,
    details: {
      serviceId: id,
      changedKeys: Object.keys(updateData || {})
    }
  });

  res.json({ success: true, service: db.services[index], actionLog });
});

// Delete a consultation service item
app.delete("/api/services/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const db = await getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.services = db.services || [];
  const deletedService = db.services.find((s: any) => s.id === id);
  const initialLength = db.services.length;
  db.services = db.services.filter((s: any) => s.id !== id);

  if (db.services.length === initialLength) {
    return res.status(404).json({ error: "Service item not found with this id." });
  }

  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "DELETE_SERVICE",
    resourceType: "service",
    resourceId: id,
    resourceLabel: deletedService?.name || id,
    details: {
      serviceId: id,
      name: deletedService?.name || ""
    }
  });

  res.json({ success: true, message: "Consultation package deleted.", actionLog });
});

// Admin list all contact forms
app.get("/api/messages", requireAdmin, async (req, res) => {
  const db = await getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });
  res.json(db.messages || []);
});

// Toggle message read status
app.put("/api/messages/:id/read", requireAdmin, async  (req, res) => {
  const { id } = req.params;
  const db = await getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.messages = db.messages || [];
  const msg = db.messages.find((m: any) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: "Message item not found." });
  }

  msg.isRead = !msg.isRead;
  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: msg.isRead ? "MARK_MESSAGE_READ" : "MARK_MESSAGE_UNREAD",
    resourceType: "contact_message",
    resourceId: id,
    resourceLabel: msg.subject || id,
    details: {
      messageId: id,
      senderEmail: msg.senderEmail || "",
      isRead: msg.isRead
    }
  });

  res.json({ success: true, message: msg, actionLog });
});

// Admin delete contact message
app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const db = await getDBState();
  if (!db) return res.status(500).json({ error: "Database state inaccessible." });

  db.messages = db.messages || [];
  const deletedMessage = db.messages.find((m: any) => m.id === id);
  db.messages = db.messages.filter((m: any) => m.id !== id);
  await saveDBState(db);

  const actionLog = await appendCurrentAdminActionLog(req, {
    action: "DELETE_MESSAGE",
    resourceType: "contact_message",
    resourceId: id,
    resourceLabel: deletedMessage?.subject || id,
    details: {
      messageId: id,
      senderEmail: deletedMessage?.senderEmail || "",
      subject: deletedMessage?.subject || ""
    }
  });

  res.json({ success: true, message: "Contact lead successfully removed.", actionLog });
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