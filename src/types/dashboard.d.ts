export type Charttype = "bar" | "line" | "doughnut" | "pie";

export interface Dataset {
  type: Charttype;
  labels: string[];
  datasets: { label?: string; data: (number | null)[] }[];
}

export type LineData = {
  title: string;
  amount: number;
}[];
