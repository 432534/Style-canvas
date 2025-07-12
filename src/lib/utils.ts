import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...classes: ClassValue[]) {
  const merged = twMerge(clsx(classes))
  return merged
}
