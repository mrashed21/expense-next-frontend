import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency.
 * @param amount - The numeric amount to format.
 * @param currency - ISO 4217 currency code (default: "BDT").
 * @param locale - BCP 47 locale string (default: "en-US").
 */
export function formatCurrency(
  amount: number,
  currency = "BDT",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string or Date object into a readable format.
 * @param date - Date value (string, number, or Date).
 * @param options - Intl.DateTimeFormatOptions (default: medium date).
 * @param locale - BCP 47 locale string (default: "en-US").
 */
export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale = "en-US",
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/**
 * Format a large number with compact notation (e.g. 1.2K, 3.5M).
 */
export function formatCompact(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
