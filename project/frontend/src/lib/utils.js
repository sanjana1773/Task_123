import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine class names with conditional logic and resolve Tailwind conflicts.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
