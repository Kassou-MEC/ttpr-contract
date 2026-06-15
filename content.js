// content.js — the contract text, group schedules, and RF account steps.
// Edit clause wording or RF steps here; both contract pages read from this file.

const GROUPS = {
  1: {
    num: 1,
    label: "Group 1",
    internship: "June 22, 2026 \u2013 August 12, 2026",
    schedule: [
      "Thursday, July 2, 2026",
      "Thursday, July 16, 2026",
      "Thursday, July 30, 2026",
      "Thursday, August 13, 2026",
    ],
  },
  2: {
    num: 2,
    label: "Group 2",
    internship: "July 6, 2026 \u2013 August 26, 2026",
    schedule: [
      "Friday, July 17, 2026",
      "Friday, July 31, 2026",
      "Friday, August 14, 2026",
      "Friday, August 28, 2026",
    ],
  },
};

// The seven agreement clauses, in order. {{SCHEDULE}} is replaced per group.
// `emphasis: true` highlights the pay clause (per program note: no timesheet, no pay).
function clauses(group) {
  return [
    {
      text:
        "I confirm that I have read all instructions, watched the full instructional video, and understand how to properly submit my timesheet. I also confirm that I have created my RF account and am able to log in successfully.",
    },
    {
      emphasis: true,
      text:
        "I understand that I am responsible for submitting my timesheets by the required deadlines. I understand that if I do not submit my timesheet correctly and on time, I will not get paid for that pay period.",
    },
    {
      text:
        "I understand that I will not be able to submit timesheets on official holidays, including Friday, July 3, 2026 and Monday, September 7, 2026 (Labor Day).",
    },
    {
      text:
        "I understand that my timesheets must be submitted according to the schedule assigned to my internship group.",
      schedule: group.schedule,
      scheduleHeading: `${group.label} \u2014 Internship ${group.internship}. Timesheet submission dates:`,
    },
    {
      text:
        "I understand that provided I complete the program successfully \u2014 including completing the bootcamp, attending the internship, and finishing the internship successfully \u2014 I will be eligible to graduate from the TTPR program.",
    },
    {
      text:
        "I understand that upon successful completion, I am expected to attend the graduation and certificate ceremony at LaGuardia Community College on Tuesday, October 14, 2026 at 6:00 PM.",
    },
    {
      text:
        "I understand that I may be expected to present about my internship project during the graduation and certificate ceremony.",
    },
  ];
}

// RF (Research Foundation of CUNY) account setup.
// Official OneRF login directions (PDF), linked as "step-by-step instructions".
const RF_INSTRUCTIONS_URL =
  "https://www.rfcuny.org/rfwebsite/media/blhe2qhl/sis-12-9-2025-onerflogindirections.pdf";
// Time and Leave manual — submitting & managing timesheets in Workday
// for non-exempt employees (see pages 7–17).
const RF_TIMESHEET_URL =
  "https://www.rfcuny.org/rfwebsite/media/woye52dr/time-and-leave-manual-final-rev-1-2025.pdf";
const RF_CLAIM_URL = "https://www.rfcuny.org/rflogonclaim";
const RF_PASSWORD_EMAIL = "hrpassword@rfcuny.org";

const CONTACT = {
  site: "meccareers.github.io",
  phone: "(718) 482-5414",
  email: "cuny2x@lagcc.cuny.edu",
};

module.exports = { GROUPS, clauses, RF_INSTRUCTIONS_URL, RF_TIMESHEET_URL, RF_CLAIM_URL, RF_PASSWORD_EMAIL, CONTACT };
