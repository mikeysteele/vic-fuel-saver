import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a safe string message from an unknown error type.
 * Useful for cleanly handling `catch (e: unknown)` blocks.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
    if (typeof msg === "number" || typeof msg === "boolean") return String(msg);
  }
  return typeof error === "number" || typeof error === "boolean"
    ? String(error)
    : "An unknown error occurred";
}
