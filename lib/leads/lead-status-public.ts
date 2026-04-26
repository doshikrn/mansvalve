import type { LeadStatus, LeadStatusInDb } from "@/lib/db/schema";

/** Russian labels for simplified admin pipeline statuses (UI only). */
export const LEAD_STATUS_LABEL_RU: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Завершена",
  spam: "Спам",
};

/** Map legacy CRM statuses to the simplified admin pipeline. */
export function normalizeLeadStatus(status: LeadStatusInDb): LeadStatus {
  if (status === "won" || status === "lost") return "done";
  return status;
}
