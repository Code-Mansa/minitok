// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

/*------------------------------------------------------
  1️⃣ Tailwind + Class Helpers
------------------------------------------------------*/

// Merge tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Example: cn("p-4", isActive && "bg-blue-500") → "p-4 bg-blue-500"

/*------------------------------------------------------
  2️⃣ String Helpers
------------------------------------------------------*/

// Capitalize first letter
export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// capitalize("hello") → "Hello"

// Truncate long string
export function truncate(str: string, length = 50) {
  if (!str) return "";
  return str.length > length ? `${str.slice(0, length)}...` : str;
}
// truncate("Hello World", 5) → "Hello..."

// Slugify a string
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
// slugify("Hello World!") → "hello-world"

/*------------------------------------------------------
  3️⃣ Number & Currency Helpers
------------------------------------------------------*/

// Convert safely to number
export function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}
// toNumber("42") → 42

// Format number as currency
export function formatCurrency(
  amount: number,
  locale: string = "en-US",
  currency: string = "USD"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // currencyDisplay: "narrowSymbol",
  }).format(amount);
}
// formatCurrency(1234.5) → "$1,234.50"

// Generate random integer between min & max
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// randomInt(1,6) → 4

/*------------------------------------------------------
  4️⃣ Array Helpers
------------------------------------------------------*/

// Pick a random item from array
export function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}
// pickRandom([1,2,3,4]) → 2

// Shuffle an array
export function shuffle<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// shuffle([1,2,3,4]) → [3,1,4,2]

/*------------------------------------------------------
  5️⃣ Date Helpers
------------------------------------------------------*/

// Format date
export function formatDate(date: Date | string, f: string = "PPP") {
  return format(new Date(date), f);
}
// formatDate("2025-11-21") → "Nov 21st, 2025"

/*------------------------------------------------------
  6️⃣ UUID / ID Helpers
------------------------------------------------------*/

// Generate UUID
export function generateId() {
  return uuidv4();
}
// generateId() → "3fa85f64-5717-4562-b3fc-2c963f66afa6"

/*------------------------------------------------------
  7️⃣ Boolean Helpers
------------------------------------------------------*/

// Toggle a boolean
export function toggle(value: boolean) {
  return !value;
}
// toggle(true) → false

/*------------------------------------------------------
  8️⃣ Delay & Debounce Helpers
------------------------------------------------------*/

// Sleep / delay
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// await sleep(1000)

// Debounce a function
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
// const handleSearch = debounce((val)=>console.log(val), 500)

/*------------------------------------------------------
  9️⃣ Validation Helpers
------------------------------------------------------*/

// Validate email
export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}
// isValidEmail("test@example.com") → true

/*------------------------------------------------------
  🔟 Safe JSON / Storage Helpers
------------------------------------------------------*/

// Safe JSON parse
export function safeJSONParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
// safeJSONParse('{"name":"Musa"}') → {name:"Musa"}

// Get / Set item in localStorage safely
export function safeLocalStorageSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function safeLocalStorageGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  return item ? safeJSONParse<T>(item) : null;
}

/*------------------------------------------------------
  Retry Async Function
------------------------------------------------------*/

/**
 * Retry an async function with exponential backoff
 * @param fn - async function to retry
 * @param retries - number of retries (default 3)
 * @param delay - initial delay in ms (default 1000)
 * @param jitter - whether to add random jitter (default true)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  jitter = true
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt < retries - 1) {
        // Calculate exponential backoff
        let backoff = delay * Math.pow(2, attempt);

        // Add random jitter ±20%
        if (jitter) {
          const factor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
          backoff = backoff * factor;
        }

        await sleep(backoff);
      }
    }
  }

  throw lastError;
}

// Example usage: 5 exponential backoff retries with 1s initial delay
// await retry(() => fetch("/api/data").then(res => res.json()), 5, 1000);

/*------------------------------------------------------
   Floating Point Arithmetic Helpers
------------------------------------------------------*/

/**
 * Round a number to n decimal places
 * @param num - number to round
 * @param decimals - number of decimal places (default 2)
 * @returns rounded number
 */
export function round(num: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
// Example:
// round(3.14159) → 3.14
// round(3.14159, 3) → 3.142

/**
 * Format number with fixed decimals as string
 * @param num - number to format
 * @param decimals - number of decimal places (default 2)
 * @returns formatted string
 */
export function formatFloat(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}
// Example:
// formatFloat(3.14159) → "3.14"
// formatFloat(3.14159, 4) → "3.1416"

/**
 * Safely add two floating numbers
 * @param a - first number
 * @param b - second number
 * @returns sum rounded to 2 decimals
 */
export function addFloat(a: number, b: number, decimals = 2): number {
  return round(a + b, decimals);
}
// Example:
// addFloat(0.1, 0.2) → 0.3 (avoids floating point errors)

/**
 * Safely subtract two floating numbers
 */
export function subFloat(a: number, b: number, decimals = 2): number {
  return round(a - b, decimals);
}
// Example:
// subFloat(0.3, 0.1) → 0.2

/**
 * Safely multiply two floating numbers
 */
export function mulFloat(a: number, b: number, decimals = 2): number {
  return round(a * b, decimals);
}
// Example:
// mulFloat(0.1, 0.2) → 0.02

/**
 * Safely divide two floating numbers
 */
export function divFloat(a: number, b: number, decimals = 2): number {
  if (b === 0) throw new Error("Division by zero");
  return round(a / b, decimals);
}
// Example:
// divFloat(1, 3, 3) → 0.333
