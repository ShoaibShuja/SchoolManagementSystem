import assert from "node:assert/strict";
import test from "node:test";
import { calculateReport } from "../../lib/results/calculations";

test("result calculations handle grades, absence, exemption, and missing marks deterministically", () => {
  const report = calculateReport([
    { subjectName: "Math", subjectCode: "MTH", maximumMarks: 100, passingMarks: 40, marks: 80, status: "graded" },
    { subjectName: "Science", subjectCode: "SCI", maximumMarks: 100, passingMarks: 40, marks: null, status: "absent" },
    { subjectName: "Art", subjectCode: "ART", maximumMarks: 100, passingMarks: null, marks: null, status: "exempt" },
    { subjectName: "English", subjectCode: "ENG", maximumMarks: 100, passingMarks: 40, marks: null, status: null },
  ]);
  assert.deepEqual({ total: report.total, maximum: report.maximumTotal, average: report.average, grade: report.grade, passed: report.passed, missing: report.missingCount }, { total: 80, maximum: 200, average: 40, grade: "F", passed: null, missing: 1 });
  assert.equal(report.subjects[1].earned, 0);
  assert.equal(report.subjects[2].includedMaximum, 0);
});
