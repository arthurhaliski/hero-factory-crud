import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an ISO date string (or Date object) into DD/MM/YYYY format.
 * Returns an empty string if the date is invalid.
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      return ''; // Invalid date
    }
    
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return ''; // Return empty string on error
  }
}
