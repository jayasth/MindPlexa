import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTitleAndType(input: string): {
  title: string;
  type: string;
  id: string;
  content: string;
} {
  const regex = /^([^[\]]+)\[(.+?)\\n(.+)?\]$/;
  const match = input.match(regex);

  if (match) {
    const id = match[1].trim();
    const title = match[2].trim();
    const content = match[3] ? match[3].trim() : 'No description available';
    return { title, type: 'note', id, content };
  } else {
    const parts = input.split('\\n');
    const title = parts[0].trim();
    const content = parts[1] ? parts[1].trim() : 'No description available';
    return {
      title,
      type: 'note',
      id: nanoid(),
      content
    };
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
