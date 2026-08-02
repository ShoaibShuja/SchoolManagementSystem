import assert from "node:assert/strict";
import test from "node:test";
import { studentFormSchema, teacherFormSchema } from "../../lib/admin/schemas";

const student = {
  admissionNumber: "S-1001", firstName: "Amina", lastName: "Rahimi", dateOfBirth: "2015-04-20", enrolledOn: "2026-03-21", status: "active" as const,
  academicYearId: "11111111-1111-4111-8111-111111111111", sectionId: "22222222-2222-4222-8222-222222222222",
  guardianFirstName: "Farid", guardianLastName: "Rahimi", guardianPhone: "+93 700 000000", guardianEmail: "farid@example.com", guardianRelationship: "Parent",
};

test("student form accepts a complete record and normalizes optional values", () => {
  const result = studentFormSchema.parse(student);
  assert.equal(result.admissionNumber, "S-1001");
  assert.equal(result.guardianPhone, "+93 700 000000");
});

test("student form requires both academic year and section", () => {
  const result = studentFormSchema.safeParse({ ...student, sectionId: "" });
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error.issues[0]?.message ?? "", /academic year and section/i);
});

test("teacher form prevents invalid employment dates", () => {
  const result = teacherFormSchema.safeParse({ employeeNumber: "T-1001", firstName: "Laila", lastName: "Ahmadi", phone: "", email: "", qualification: "B.Ed.", employmentStartedOn: "2026-08-01", employmentEndedOn: "2026-07-31", status: "active" });
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.error.issues[0]?.message ?? "", /cannot be before/i);
});
