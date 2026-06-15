// server.js — TTPR 2026 contract app.
const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");

const db = require("./db");
const { GROUPS, CONTACT } = require("./content");
const views = require("./views");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ttpr2026";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "change-this-cookie-secret";

app.use(express.json({ limit: "4mb" })); // signature PNGs can be largish
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));

// ---------- Public: contract pages ----------
app.get("/", (req, res) => {
  res.type("html").send(`<!doctype html><html><head><meta charset="utf-8">
    <title>TTPR 2026 Contracts</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>body{font-family:Inter,sans-serif;max-width:560px;margin:80px auto;padding:0 20px;color:#16161d}
    h1{font-family:'Space Grotesk';color:#c8102e}a{display:block;padding:14px 18px;margin:10px 0;border:1px solid #ddd;border-radius:10px;text-decoration:none;color:#16161d;font-weight:600}</style>
    </head><body><h1>TTPR 2026 Internship Contracts</h1>
    <p>Student links:</p>
    <a href="/group1">Group 1 \u2014 ${GROUPS[1].internship}</a>
    <a href="/group2">Group 2 \u2014 ${GROUPS[2].internship}</a>
    <p style="margin-top:30px"><a href="/admin" style="border:none;padding:0;color:#5b6270">Admin \u2192</a></p>
    </body></html>`);
});

app.get("/group1", (req, res) => res.type("html").send(views.contractPage(GROUPS[1])));
app.get("/group2", (req, res) => res.type("html").send(views.contractPage(GROUPS[2])));

// ---------- Public: submit ----------
app.post("/api/submit", async (req, res) => {
  try {
    const b = req.body || {};
    const groupNum = Number(b.group_num);
    if (![1, 2].includes(groupNum)) return res.status(400).json({ error: "Invalid group" });
    const required = ["first_name", "last_name", "student_id", "typed_name", "signature_data", "signed_date"];
    for (const k of required) {
      if (!b[k] || !String(b[k]).trim()) return res.status(400).json({ error: "Missing required information" });
    }
    if (!String(b.signature_data).startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid signature" });
    }
    const saved = await db.insertSubmission({
      group_num: groupNum,
      first_name: String(b.first_name).trim().slice(0, 120),
      last_name: String(b.last_name).trim().slice(0, 120),
      student_id: String(b.student_id).trim().slice(0, 60),
      email: b.email ? String(b.email).trim().slice(0, 160) : "",
      typed_name: String(b.typed_name).trim().slice(0, 200),
      signature_data: String(b.signature_data),
      signed_date: String(b.signed_date).slice(0, 60),
      ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim(),
      user_agent: (req.headers["user-agent"] || "").slice(0, 300),
    });
    res.json({ id: saved.id });
  } catch (err) {
    console.error("submit error:", err);
    res.status(500).json({ error: "Server error saving contract" });
  }
});

app.get("/done", async (req, res) => {
  const row = await db.getSubmission(req.query.id);
  if (!row) return res.redirect("/");
  res.type("html").send(views.successPage(row));
});

// ---------- Admin auth ----------
function token() {
  return crypto.createHmac("sha256", COOKIE_SECRET).update("admin-ok").digest("hex");
}
function requireAdmin(req, res, next) {
  if (req.signedCookies && req.signedCookies.admin === token()) return next();
  res.type("html").send(views.adminLogin());
}
app.post("/admin/login", (req, res) => {
  if ((req.body.password || "") === ADMIN_PASSWORD) {
    res.cookie("admin", token(), {
      signed: true, httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8,
    });
    return res.redirect("/admin");
  }
  res.type("html").send(views.adminLogin("Incorrect passcode. Try again."));
});
app.get("/admin/logout", (req, res) => { res.clearCookie("admin"); res.redirect("/admin"); });

// ---------- Admin views ----------
app.get("/admin", requireAdmin, async (req, res) => {
  const g = req.query.group ? Number(req.query.group) : null;
  const rows = await db.listSubmissions([1, 2].includes(g) ? g : null);
  res.type("html").send(views.adminDashboard(rows, [1, 2].includes(g) ? g : null));
});

app.get("/admin/contract/:id", requireAdmin, async (req, res) => {
  const row = await db.getSubmission(req.params.id);
  if (!row) return res.redirect("/admin");
  res.type("html").send(views.contractDetail(row, true));
});

app.get("/admin/print", requireAdmin, async (req, res) => {
  const g = req.query.group ? Number(req.query.group) : null;
  const rows = await db.listSubmissions([1, 2].includes(g) ? g : null);
  res.type("html").send(views.printAll(rows, [1, 2].includes(g) ? g : null));
});

app.get("/admin/export", requireAdmin, async (req, res) => {
  const g = req.query.group ? Number(req.query.group) : null;
  const rows = await db.listSubmissions([1, 2].includes(g) ? g : null);
  const headers = ["Last name", "First name", "Student ID", "Email", "Group", "Typed name", "Date signed", "Submitted", "Reference"];
  const csvCell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = [headers.map(csvCell).join(",")];
  rows.forEach((r) => {
    lines.push([
      r.last_name, r.first_name, r.student_id, r.email || "",
      "Group " + r.group_num, r.typed_name, r.signed_date,
      new Date(r.created_at).toLocaleString("en-US"), r.id,
    ].map(csvCell).join(","));
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="ttpr-contracts${g ? "-group" + g : ""}.csv"`);
  res.send("\uFEFF" + lines.join("\r\n"));
});

app.get("/admin/signature/:id", requireAdmin, async (req, res) => {
  const row = await db.getSubmission(req.params.id);
  if (!row) return res.status(404).send("Not found");
  const m = /^data:image\/png;base64,(.+)$/.exec(row.signature_data);
  if (!m) return res.status(400).send("Bad signature data");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `attachment; filename="${row.last_name}_${row.first_name}_signature.png"`);
  res.send(Buffer.from(m[1], "base64"));
});

app.get("/admin/delete/:id", requireAdmin, async (req, res) => {
  await db.deleteSubmission(req.params.id);
  res.redirect("/admin");
});

// ---------- Start ----------
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TTPR contract app on :${PORT} (${db.usePg ? "Postgres" : "SQLite"})`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
