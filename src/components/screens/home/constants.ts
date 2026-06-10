import type { IconName } from "@/src/components/ui/icon";

export const CATEGORIES = [
  "Taxi",
  "Food",
  "SaaS",
  "Equipement",
  "Junk",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category | "Income", IconName> = {
  Taxi: "car",
  Food: "restaurant",
  SaaS: "cloud",
  Equipement: "construct",
  Junk: "cube",
  Income: "cash",
};
