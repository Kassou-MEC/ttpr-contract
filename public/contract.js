// contract.js — runs on each contract page.
(function () {
  var groupNum = Number(document.body.dataset.group);
  var clauses = Array.prototype.slice.call(document.querySelectorAll(".clause"));
  var totalClauses = clauses.length;
  var fill = document.getElementById("meterFill");
  var count = document.getElementById("meterCount");
  var fields = {
    first: document.getElementById("first_name"),
    last: document.getElementById("last_name"),
    sid: document.getElementById("student_id"),
    email: document.getElementById("email"),
    typed: document.getElementById("typed_name"),
  };
  var signShell = document.getElementById("signShell");
  var submitBtn = document.getElementById("submitBtn");
  var msg = document.getElementById("submitMsg");
  var dateEl = document.getElementById("signDate");

  // Stamp today's date (locale-friendly, human readable)
  var today = new Date();
  var dateStr = today.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  if (dateEl) dateEl.textContent = "Date: " + dateStr;

  // ---- Clause toggling ----
  function checkedCount() {
    return clauses.filter(function (c) { return c.classList.contains("checked"); }).length;
  }
  function toggleClause(c) {
    c.classList.toggle("checked");
    var on = c.classList.contains("checked");
    c.setAttribute("aria-checked", on ? "true" : "false");
    updateMeter();
    refresh();
  }
  clauses.forEach(function (c) {
    c.setAttribute("role", "checkbox");
    c.setAttribute("aria-checked", "false");
    c.setAttribute("tabindex", "0");
    c.addEventListener("click", function () { toggleClause(c); });
    c.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleClause(c); }
    });
  });
  function updateMeter() {
    var n = checkedCount();
    var pct = totalClauses ? Math.round((n / totalClauses) * 100) : 0;
    fill.style.width = pct + "%";
    count.textContent = n + " / " + totalClauses + " agreed";
  }

  // ---- Signature pad ----
  var canvas = document.getElementById("sigPad");
  var ctx = canvas.getContext("2d");
  var drawing = false, hasInk = false, last = null;

  function sizeCanvas() {
    var ratio = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var prev = hasInk ? canvas.toDataURL() : null;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#16161d";
    if (prev) {
      var img = new Image();
      img.onload = function () { ctx.drawImage(img, 0, 0, rect.width, rect.height); };
      img.src = prev;
    }
  }
  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }
  function start(e) {
    if (!isUnlocked()) return;
    e.preventDefault();
    drawing = true; last = pos(e);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p; hasInk = true;
    refresh();
  }
  function end() { drawing = false; }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  document.getElementById("sigClear").addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false; refresh();
  });

  // ---- Validation / gating ----
  function infoComplete() {
    return (
      fields.first.value.trim() &&
      fields.last.value.trim() &&
      fields.sid.value.trim()
    );
  }
  function allChecked() { return checkedCount() === totalClauses; }
  function isUnlocked() { return infoComplete() && allChecked(); }

  function refresh() {
    var unlocked = isUnlocked();
    signShell.classList.toggle("is-unlocked", unlocked);
    var ready = unlocked && hasInk && fields.typed.value.trim();
    submitBtn.disabled = !ready;
    if (!unlocked) {
      msg.textContent = "Complete your details above and agree to all statements to sign.";
      msg.className = "submit-msg";
    } else if (!hasInk) {
      msg.textContent = "Draw your signature in the box above.";
      msg.className = "submit-msg";
    } else if (!fields.typed.value.trim()) {
      msg.textContent = "Type your full legal name to confirm.";
      msg.className = "submit-msg";
    } else {
      msg.textContent = "Ready to submit.";
      msg.className = "submit-msg";
    }
  }
  Object.keys(fields).forEach(function (k) {
    if (fields[k]) fields[k].addEventListener("input", refresh);
  });

  // ---- Submit ----
  submitBtn.addEventListener("click", function () {
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    msg.textContent = "Submitting\u2026";
    msg.className = "submit-msg";
    var payload = {
      group_num: groupNum,
      first_name: fields.first.value.trim(),
      last_name: fields.last.value.trim(),
      student_id: fields.sid.value.trim(),
      email: fields.email ? fields.email.value.trim() : "",
      typed_name: fields.typed.value.trim(),
      signature_data: canvas.toDataURL("image/png"),
      signed_date: dateStr,
    };
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.id) {
          window.location.href = "/done?id=" + encodeURIComponent(res.j.id);
        } else {
          throw new Error(res.j.error || "Submission failed");
        }
      })
      .catch(function (err) {
        msg.textContent = err.message + " \u2014 please try again.";
        msg.className = "submit-msg err";
        submitBtn.disabled = false;
      });
  });

  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();
  updateMeter();
  refresh();
})();
