import "server-only";
type EmailOutcome = { attempted: false; reason: "disabled" | "not-implemented" };
export function announcementEmailConfigured() { return Boolean(process.env.RESEND_API_KEY && process.env.ANNOUNCEMENT_FROM_EMAIL); }
export async function notifyAnnouncementPublished(): Promise<EmailOutcome> { return { attempted: false, reason: announcementEmailConfigured() ? "not-implemented" : "disabled" }; }
