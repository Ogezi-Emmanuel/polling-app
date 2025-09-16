import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateShareablePollUrl(pollId: string): string {
  // In a real application, you would use your actual domain.
  // For local development, this will be localhost:3000.
  // Ensure this is updated for production deployment.
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';
  return `${baseUrl}/poll/${pollId}`;
}
