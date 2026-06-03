import fs from "node:fs/promises";
import db from "./db.js";
import {
  ashStudent,
  ashTermlyTracking,
  ashWeeklyAttendance,
  ashExit,
  ashProgramFeedback,
  volunteerRegistration,
  volunteerFeedback,
} from "./models/admin.js";

// npx tsx --env-file=.env src/db/newseed.ts

const clearTables = async () => {
  try {
    console.log("Clearing tables...");
    await db.delete(ashStudent);
    await db.delete(ashTermlyTracking);
    await db.delete(ashWeeklyAttendance);
    await db.delete(ashExit);
    await db.delete(ashProgramFeedback);
    await db.delete(volunteerRegistration);
    await db.delete(volunteerFeedback);
    console.log("Tables cleared ;)");
  } catch {
    console.log("Could not delete all tables");
  }
};
// ASH
async function seedAshStudent() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/ash_student.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));

    await db.insert(ashStudent).values(rows);

    console.log(`Inserted ${rows.length} rows into ashstudent`);
  } catch (error) {
    console.log("Could not seed ashstudent tables", error);
  }
}
async function seedAshTermlyTracking() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/ash_termly_tracking.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));

    await db.insert(ashTermlyTracking).values(rows);

    console.log(`Inserted ${rows.length} rows into ashTermlyTracking`);
  } catch (error) {
    console.log("could not seed ashtermlytracking table", error);
  }
}
async function seedAshWeeklyAttendance() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/ash_weekly_attendance.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          sessionDate: new Date(row.sessionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(ashWeeklyAttendance).values(rows);

    console.log(`Inserted ${rows.length} rows into ashWeeklyAttendance`);
  } catch (error) {
    console.log("could not seed ashWeeklyAttendance table", error);
  }
}
async function seedAshExit() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/ash_exit.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          exitDate: new Date(row.exitDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(ashExit).values(rows);

    console.log(`Inserted ${rows.length} rows into ashExit`);
  } catch (error) {
    console.log("could not seed ashExit table", error);
  }
}
async function seedAshProgramFeedback() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/ash_program_feedback.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(ashProgramFeedback).values(rows);

    console.log(`Inserted ${rows.length} rows into ashProgramFeedback`);
  } catch (error) {
    console.log("could not seed ashProgramFeedback table", error);
  }
}

// VOLUNTEER
async function seedVolunteerRegistration() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/volunteer_registration.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          dob: new Date(row.dob),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(volunteerRegistration).values(rows);

    console.log(`Inserted ${rows.length} rows into volunteerRegistration`);
  } catch (error) {
    console.log("could not seed volunteerRegistration table", error);
  }
}
async function seedVolunteerFeedback() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/volunteer_feedback.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          submissionDate: new Date(row.submissionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(volunteerFeedback).values(rows);

    console.log(`Inserted ${rows.length} rows into volunteerFeedback`);
  } catch (error) {
    console.log("could not seed volunteerFeedback table", error);
  }
}

// example
async function seedExample() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    // await db.insert().values(rows);

    console.log(`Inserted ${rows.length} rows into `);
  } catch (error) {
    console.log("could not seed  table", error);
  }
}

await clearTables();
await seedAshStudent();
await seedAshTermlyTracking();
await seedAshWeeklyAttendance();
await seedAshExit();
await seedAshProgramFeedback();
await seedVolunteerRegistration();
await seedVolunteerFeedback();
