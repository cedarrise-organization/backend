export type Charttype = "bar" | "line" | "doughnut" | "pie";

export interface Dataset {
  type: Charttype;
  labels: string[];
  datasets: { label?: string; data: (number | null)[] }[];
}

export type Linedata = {
  title: string;
  amount: number;
}[];

export interface Notificationcandidate {
  type:
    | "POTENTIAL_DROPOUT_RISK"
    | "LOW_ATTENDANCE_RATE"
    | "LOW_MENTORSHIP_ENGAGEMENT"
    | "SCORE_DROP_ALERT"
    | "VOLUNTEER_INACTIVITY";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  entityType:
    | "ash"
    | "volunteer"
    | "tacots"
    | "capacity_building"
    | "administrative";
  dedupeKey: string;
  metadata?: string;
  expiresAt?: Date;
};