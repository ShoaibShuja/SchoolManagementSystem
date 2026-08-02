import assert from "node:assert/strict";
import test from "node:test";
import { canWriteAdminRecords } from "../../lib/admin/authorization";
import { matchesStudentFilter, matchesTeacherFilter } from "../../lib/admin/filters";

const student = { id: "student-1", admissionNumber: "S-1001", firstName: "Amina", lastName: "Rahimi", status: "active" as const, enrolledOn: "2026-03-21", hasAccount: false, section: { id: "section-a", name: "A", className: "Grade 1" }, guardian: null };
const teacher = { id: "teacher-1", employeeNumber: "T-1001", firstName: "Laila", lastName: "Ahmadi", phone: null, email: "laila@example.com", qualification: null, employmentStartedOn: "2026-03-21", employmentEndedOn: null, status: "on_leave" as const, hasAccount: false };

test("student search and filters match the requested fields", () => {
  assert.equal(matchesStudentFilter(student, "rahimi", "active", "section-a"), true);
  assert.equal(matchesStudentFilter(student, "S-999", "active", "section-a"), false);
  assert.equal(matchesStudentFilter(student, "amina", "inactive"), false);
});

test("teacher search and status filters match contact and employment data", () => {
  assert.equal(matchesTeacherFilter(teacher, "laila@example.com", "on_leave"), true);
  assert.equal(matchesTeacherFilter(teacher, "T-1001", "active"), false);
});

test("only the fixed admin role may perform admin writes", () => {
  assert.equal(canWriteAdminRecords("admin"), true);
  assert.equal(canWriteAdminRecords("teacher"), false);
  assert.equal(canWriteAdminRecords("student"), false);
  assert.equal(canWriteAdminRecords("parent"), false);
});
