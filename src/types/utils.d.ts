// Type definitions for @/lib/utils

declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string;
  export function formatDate(date: Date | string | number): string;
  export function formatCurrency(amount: number, currency: string): string;
  // Add other utility functions as needed
}

// Export as a module to be used in other files
export {};
