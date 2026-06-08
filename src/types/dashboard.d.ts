export type Charttype = "bar" | "line" | "doughnut" | "pie";

export interface Dataset {
  type: Charttype;
  labels: string[];
  datasets: { label?: string; data: number[] }[];
}

export type LineData = {
  title: string;
  amount: number;
}[];
