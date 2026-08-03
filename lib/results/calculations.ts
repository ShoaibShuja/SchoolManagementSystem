export type GradeInput = { subjectName: string; subjectCode: string; maximumMarks: number; passingMarks: number | null; marks: number | null; status: "graded" | "absent" | "exempt" | null };
export type SubjectResult = GradeInput & { earned: number | null; includedMaximum: number; percentage: number | null; grade: string | null; passed: boolean | null; missing: boolean };
export type ReportResult = { subjects: SubjectResult[]; total: number; maximumTotal: number; average: number | null; grade: string | null; passed: boolean | null; missingCount: number; complete: boolean };

export function gradeFromPercentage(percentage: number | null) { if (percentage === null) return null; if (percentage >= 90) return "A"; if (percentage >= 80) return "B"; if (percentage >= 70) return "C"; if (percentage >= 60) return "D"; return "F"; }

export function calculateReport(rows: GradeInput[]): ReportResult {
  const subjects = rows.map((row): SubjectResult => {
    const missing = row.status === null;
    const exempt = row.status === "exempt";
    const earned = missing || exempt ? null : row.status === "absent" ? 0 : row.marks;
    const includedMaximum = exempt || missing ? 0 : row.maximumMarks;
    const percentage = earned === null || includedMaximum === 0 ? null : (earned / includedMaximum) * 100;
    const passed = missing || exempt ? null : row.passingMarks === null ? null : earned !== null && earned >= row.passingMarks;
    return { ...row, earned, includedMaximum, percentage, grade: gradeFromPercentage(percentage), passed, missing };
  });
  const total = subjects.reduce((sum, row) => sum + (row.earned ?? 0), 0);
  const maximumTotal = subjects.reduce((sum, row) => sum + row.includedMaximum, 0);
  const average = maximumTotal > 0 ? (total / maximumTotal) * 100 : null;
  const missingCount = subjects.filter((row) => row.missing).length;
  const applicablePasses = subjects.map((row) => row.passed).filter((value): value is boolean => value !== null);
  return { subjects, total, maximumTotal, average, grade: gradeFromPercentage(average), passed: missingCount > 0 ? null : applicablePasses.length ? applicablePasses.every(Boolean) : null, missingCount, complete: missingCount === 0 };
}
