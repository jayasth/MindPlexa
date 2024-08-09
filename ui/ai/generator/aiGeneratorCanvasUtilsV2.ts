import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTitleAndType(input: string): {
  title: string;
  content: string;
} {
  // Handle cases where the input is just a node ID
  if (/^[A-Z]\d+$/.test(input)) {
    return { title: input, content: 'No description available' };
  }

  const parts = input.split('::');
  if (parts.length === 2) {
    return { title: parts[0].trim(), content: parts[1].trim() };
  } else if (parts.length === 1) {
    // If there's no '::' separator, use the whole input as the title
    return { title: input.trim(), content: 'No description available' };
  } else {
    // Handle cases with multiple '::' by using the first part as title and the rest as content
    const [title, ...contentParts] = parts;
    return { title: title.trim(), content: contentParts.join('::').trim() };
  }
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
  return text.replace(/\`\`\`mermaid/g, '').replace(/```/g, '');
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
  return text.replace(/¡!/g, '');
}
