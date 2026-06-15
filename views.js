// views.js — server-rendered HTML.
const { clauses, RF_INSTRUCTIONS_URL, RF_TIMESHEET_URL, RF_CLAIM_URL, RF_PASSWORD_EMAIL, CONTACT } = require("./content");

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEAD_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

function brandbar(progressLabel) {
  return `
  <header class="brandbar">
    <div class="inner">
      <div class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="wordmark">
        <span class="lockup"><span class="brk">[</span>CUNY 2X TECH<span class="brk">]</span></span>
        <span class="prog">${esc(progressLabel)}</span>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="foot">
    <span class="dept">Math, Engineering &amp; Computer Science \u2014 LaGuardia Community College</span>
    <span>Visit: <a href="https://${CONTACT.site}">${esc(CONTACT.site)}</a></span>
    <span>Call: ${esc(CONTACT.phone)}</span>
    <span>Email: <a href="mailto:${CONTACT.email}">${esc(CONTACT.email)}</a></span>
  </footer>`;
}

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function contractPage(group) {
  const cls = clauses(group);
  const clauseHtml = cls
    .map((c) => {
      const sched = c.schedule
        ? `<div class="sched"><div class="h">${esc(c.scheduleHeading)}</div><ul>${c.schedule
            .map((d) => `<li>${esc(d)}</li>`)
            .join("")}</ul></div>`
        : "";
      const payTag = c.emphasis ? `<span class="pay-tag">No timesheet = no pay</span><br>` : "";
      const text = c.emphasis
        ? `<strong>${esc(c.text)}</strong>`
        : esc(c.text);
      return `
      <div class="clause${c.emphasis ? " emphasis" : ""}">
        <span class="box">${CHECK_SVG}</span>
        <span class="text">${payTag}${text}${sched}</span>
      </div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TTPR 2026 Student Internship Contract \u2014 ${esc(group.label)}</title>
${HEAD_FONTS}
<link rel="stylesheet" href="/styles.css">
</head>
<body data-group="${group.num}">
${brandbar("Student Internship Contract")}
<div class="wrap">

  <div class="doc-head">
    <p class="eyebrow">Tech Talent Pipeline Residency \u00b7 2026</p>
    <h1>Student Internship Contract</h1>
    <div class="group-pill">
      <strong>${esc(group.label)}</strong>
      <span class="dates">Internship: ${esc(group.internship)}</span>
    </div>
  </div>

  <!-- Student details -->
  <section class="card">
    <div class="card-head"><h2>Your details</h2><span class="card-num">STEP 1</span></div>
    <div class="card-body">
      <div class="field-grid">
        <div class="field">
          <label class="lbl" for="first_name">First name <span class="req">*</span></label>
          <input type="text" id="first_name" autocomplete="given-name" required>
        </div>
        <div class="field">
          <label class="lbl" for="last_name">Last name <span class="req">*</span></label>
          <input type="text" id="last_name" autocomplete="family-name" required>
        </div>
        <div class="field">
          <label class="lbl" for="student_id">Student ID <span class="req">*</span></label>
          <input type="text" id="student_id" inputmode="numeric" required>
        </div>
        <div class="field">
          <label class="lbl" for="email">LaGuardia email</label>
          <input type="email" id="email" autocomplete="email" placeholder="optional">
        </div>
      </div>
    </div>
  </section>

  <!-- RF account -->
  <section class="card">
    <div class="card-head"><h2>Set up your RF account</h2><span class="card-num">BEFORE YOU SIGN</span></div>
    <div class="card-body">
      <p class="card-note">You are paid through the Research Foundation of CUNY (RF). Create and confirm your RF account before your first timesheet is due.</p>
      <p>The instructions for creating the RF account are outlined in these <a class="rf-instr" href="${RF_INSTRUCTIONS_URL}" target="_blank" rel="noopener">step-by-step instructions</a>, and for claiming the OneRF login at the link below.</p>
      <p>For how to submit and manage your timesheets in Workday, see the <a class="rf-instr" href="${RF_TIMESHEET_URL}" target="_blank" rel="noopener">Time and Leave Manual</a> (non-exempt employees, pages 7\u201317).</p>
      <div class="rf-links">
        <div><span class="k">Step-by-step instructions (PDF)</span><a href="${RF_INSTRUCTIONS_URL}" target="_blank" rel="noopener">OneRF login directions</a></div>
        <div><span class="k">Submitting &amp; managing timesheets (PDF)</span><a href="${RF_TIMESHEET_URL}" target="_blank" rel="noopener">Time and Leave Manual \u2014 pages 7\u201317</a></div>
        <div><span class="k">Claim your OneRF login</span><a href="${RF_CLAIM_URL}" target="_blank" rel="noopener">${esc(RF_CLAIM_URL)}</a></div>
        <div><span class="k">Password issues</span><a href="mailto:${RF_PASSWORD_EMAIL}">${esc(RF_PASSWORD_EMAIL)}</a></div>
      </div>
    </div>
  </section>

  <!-- Agreements -->
  <section class="card">
    <div class="card-head"><h2>Read &amp; agree</h2><span class="card-num">STEP 2</span></div>
    <div class="meter">
      <div class="track"><div class="fill" id="meterFill"></div></div>
      <span class="count" id="meterCount">0 / ${cls.length} agreed</span>
    </div>
    <div class="card-body">
      <p class="card-note">Tap each statement to confirm you have read and understand it. All are required.</p>
      <div class="clauses">
        ${clauseHtml}
      </div>
    </div>
  </section>

  <!-- Signature -->
  <section class="card sign-wrap" id="signShell">
    <div class="card-head"><h2>Sign &amp; date</h2><span class="card-num">STEP 3</span></div>
    <div class="card-body">
      <div class="sig-pad-shell">
        <div class="locked-veil"><div><div class="lock-ico">\uD83D\uDD12</div><p>Complete your details and agree to every statement above to unlock signing.</p></div></div>
        <div class="field full" style="margin-bottom:14px">
          <label class="lbl" for="typed_name">Type your full legal name <span class="req">*</span></label>
          <input type="text" id="typed_name" autocomplete="name">
        </div>
        <label class="lbl" style="display:block;margin-bottom:6px">Draw your signature <span class="req">*</span></label>
        <canvas id="sigPad" class="sig-pad" aria-label="Signature pad"></canvas>
        <span class="sig-x" aria-hidden="true">\u00d7</span>
        <div class="sig-row">
          <button type="button" id="sigClear" class="sig-clear">Clear signature</button>
          <span class="sig-date" id="signDate"></span>
        </div>
      </div>
    </div>
  </section>

  <div class="submit-bar">
    <button type="button" id="submitBtn" class="btn-primary" disabled>Agree &amp; submit contract</button>
    <p class="submit-msg" id="submitMsg"></p>
  </div>

  ${footer()}
</div>
<script src="/contract.js"></script>
</body>
</html>`;
}

function successPage(row) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contract submitted \u2014 TTPR 2026</title>
${HEAD_FONTS}
<link rel="stylesheet" href="/styles.css">
</head>
<body>
${brandbar("Contract submitted")}
<div class="success">
  <div class="seal">
    <svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#1b7a43" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
  <h1>You're all set, ${esc(row.first_name)}.</h1>
  <p>Your signed TTPR internship contract has been received. Keep this confirmation for your records \u2014 there is nothing else to submit right now.</p>
  <div class="receipt">
    <div><span class="lbl2">Name</span><span>${esc(row.first_name)} ${esc(row.last_name)}</span></div>
    <div><span class="lbl2">Student ID</span><span>${esc(row.student_id)}</span></div>
    <div><span class="lbl2">Group</span><span>Group ${esc(row.group_num)}</span></div>
    <div><span class="lbl2">Signed</span><span>${esc(row.signed_date)}</span></div>
    <div><span class="lbl2">Reference</span><span>${esc(row.id.slice(0, 8)).toUpperCase()}</span></div>
  </div>
</div>
</body>
</html>`;
}

function adminLogin(error) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin sign in \u2014 TTPR 2026</title>${HEAD_FONTS}<link rel="stylesheet" href="/styles.css"></head>
<body>
<form class="login-box" method="POST" action="/admin/login">
  <h1>TTPR contract admin</h1>
  <p>Enter the admin passcode to view signed contracts.</p>
  ${error ? `<div class="err">${esc(error)}</div>` : ""}
  <input type="password" name="password" placeholder="Passcode" autofocus required>
  <button type="submit" class="btn-primary">Sign in</button>
</form>
</body></html>`;
}

function adminDashboard(rows, filterGroup) {
  const counts = { 1: 0, 2: 0 };
  rows.forEach((r) => { counts[r.group_num] = (counts[r.group_num] || 0) + 1; });

  const body = rows.length
    ? `<table class="subs">
        <thead><tr><th>Name</th><th>Student ID</th><th>Group</th><th>Signed</th><th>Submitted</th><th></th></tr></thead>
        <tbody>
        ${rows
          .map(
            (r) => `<tr>
            <td>${esc(r.last_name)}, ${esc(r.first_name)}</td>
            <td class="mono">${esc(r.student_id)}</td>
            <td><span class="grp-tag grp-${esc(r.group_num)}">GROUP ${esc(r.group_num)}</span></td>
            <td class="mono">${esc(r.signed_date)}</td>
            <td class="mono">${esc(new Date(r.created_at).toLocaleString("en-US"))}</td>
            <td><a class="row-link" href="/admin/contract/${esc(r.id)}">View</a></td>
          </tr>`
          )
          .join("")}
        </tbody></table>`
    : `<div class="empty">No contracts signed yet. Share the Group 1 and Group 2 links with students.</div>`;

  const q = filterGroup ? `?group=${filterGroup}` : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Signed contracts \u2014 TTPR 2026</title>${HEAD_FONTS}<link rel="stylesheet" href="/styles.css"></head>
<body>
${brandbar("Signed contracts")}
<div class="wrap">
  <div class="admin-head">
    <h1>Signed contracts</h1>
    <div class="filters no-print">
      <a class="chip ${!filterGroup ? "active" : ""}" href="/admin">All (${rows.length && !filterGroup ? rows.length : counts[1] + counts[2]})</a>
      <a class="chip ${filterGroup == 1 ? "active" : ""}" href="/admin?group=1">Group 1 (${counts[1] || 0})</a>
      <a class="chip ${filterGroup == 2 ? "active" : ""}" href="/admin?group=2">Group 2 (${counts[2] || 0})</a>
      <a class="btn-ghost" href="/admin/export${q}">Export CSV</a>
      <a class="btn-ghost" href="/admin/print${q}" target="_blank">Print all</a>
      <a class="btn-ghost" href="/admin/logout">Sign out</a>
    </div>
  </div>
  ${body}
</div>
</body></html>`;
}

// One signed contract, formatted for screen + print.
function contractDetail(r, standalone) {
  const cls = clauses({ num: r.group_num, schedule: [] });
  const clauseList = cls.map((c) => `<div class="print-clause">${esc(c.text)}</div>`).join("");
  const inner = `
  <div class="print-doc">
    <div class="doc-head">
      <p class="eyebrow">TTPR 2026 \u00b7 Signed Internship Contract</p>
      <h1>${esc(r.first_name)} ${esc(r.last_name)}</h1>
    </div>
    <div class="kv">
      <span class="k">Student ID</span><span>${esc(r.student_id)}</span>
      <span class="k">Group</span><span>Group ${esc(r.group_num)}</span>
      ${r.email ? `<span class="k">Email</span><span>${esc(r.email)}</span>` : ""}
      <span class="k">Date signed</span><span>${esc(r.signed_date)}</span>
      <span class="k">Submitted</span><span>${esc(new Date(r.created_at).toLocaleString("en-US"))}</span>
      <span class="k">Reference</span><span>${esc(r.id)}</span>
    </div>
    <h2 style="font-family:'Space Grotesk';font-size:16px;margin:18px 0 4px">Agreed statements</h2>
    ${clauseList}
    <h2 style="font-family:'Space Grotesk';font-size:16px;margin:22px 0 8px">Signature</h2>
    <img class="sig-img" src="${esc(r.signature_data)}" alt="Signature of ${esc(r.first_name)} ${esc(r.last_name)}">
    <p style="font-family:'JetBrains Mono';font-size:13px;margin-top:10px">${esc(r.typed_name)} \u00b7 ${esc(r.signed_date)}</p>
  </div>`;

  if (!standalone) return inner; // embedded in print-all
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(r.last_name)}, ${esc(r.first_name)} \u2014 signed contract</title>${HEAD_FONTS}<link rel="stylesheet" href="/styles.css"></head>
<body>
${brandbar("Signed contract")}
<div class="print-actions no-print">
  <a class="btn-ghost" href="/admin">\u2190 Back to all</a>
  <button class="btn-ghost" onclick="window.print()">Print this contract</button>
  <a class="btn-ghost" href="/admin/signature/${esc(r.id)}" download="${esc(r.last_name)}_${esc(r.first_name)}_signature.png">Download signature</a>
  <a class="btn-ghost" href="/admin/delete/${esc(r.id)}" onclick="return confirm('Delete this signed contract permanently?')" style="color:#c8102e">Delete</a>
</div>
${inner}
</body></html>`;
}

function printAll(rows, filterGroup) {
  const docs = rows.map((r) => contractDetail(r, false)).join('<div style="page-break-after:always"></div>');
  const label = filterGroup ? `Group ${filterGroup}` : "All groups";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Print all \u2014 ${esc(label)}</title>${HEAD_FONTS}<link rel="stylesheet" href="/styles.css"></head>
<body>
<div class="print-actions no-print">
  <a class="btn-ghost" href="/admin">\u2190 Back</a>
  <button class="btn-ghost" onclick="window.print()">Print ${rows.length} contract(s)</button>
  <span style="align-self:center;color:#5b6270;font-size:13px">${esc(label)} \u00b7 ${rows.length} signed</span>
</div>
${docs || '<div class="empty">Nothing to print.</div>'}
</body></html>`;
}

module.exports = {
  esc,
  contractPage,
  successPage,
  adminLogin,
  adminDashboard,
  contractDetail,
  printAll,
};
