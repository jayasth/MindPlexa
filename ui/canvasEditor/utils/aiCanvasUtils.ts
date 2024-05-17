import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTitleAndType(input: string): {
  title: string;
  type: string;
} {
  return {
    title: input.trim(),
    type: 'note'
  };
}

export function removeNonAlphanumeric(text: string): string {
  if (!text) {
    return '';
  }
  return text.replace(/[^a-zA-Z0-9]/g, '');
}

export function removeMarkdowncode(text: string): string {
  if (!text) {
    return '';
  }
  return text.replace(/```mermaid/g, '').replace(/```/g, '');
}

export function removeDoubleQuoteInsideParentheses(input: string): string {
  const regex = /\(([^)]+)\)/g;
  const result = input.replace(regex, (match) => {
    return match.replace(/"/g, '');
  });

  return result;
}

export function removeDoubleQuoteInsideBrackets(input: string): string {
  const regex = /\[([^\]]+)\]/g;
  const result = input.replace(regex, (match) => {
    return match.replace(/"/g, '');
  });

  return result;
}

export function removeSpecialCharacters(text: string): string {
  // This will remove the special ¡! characters used in your node labels
  return text.replace(/¡!/g, '');
}
