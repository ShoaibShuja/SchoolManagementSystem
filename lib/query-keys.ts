export const queryKeys = {
  session: ["session"] as const,
  dashboard: (role: string) => ["dashboard", role] as const,
  students: (filters?: Record<string, string | number | boolean | undefined>) => ["students", filters] as const,
  teachers: (filters?: Record<string, string | number | boolean | undefined>) => ["teachers", filters] as const,
  attendance: (sectionId: string, date: string) => ["attendance", sectionId, date] as const,
};
