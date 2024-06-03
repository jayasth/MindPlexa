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
  const regex = /^(\w+)\[(.+?)::(.+?)\]$/;
  const match = input.match(regex);

  if (match) {
    const id = match[1].trim();
    const title = match[2].trim();
    const content = match[3].trim();
    console.log(
      `Parsed values - ID: ${id}, Title: ${title}, Content: ${content}`
    );
    return { title, type: 'note', id, content };
  } else {
    const parts = input.split('::');
    if (parts.length === 2) {
      const title = parts[0].trim();
      const content = parts[1].trim();
      console.log(`Parsed values - Title: ${title}, Content: ${content}`);
      return {
        title,
        type: 'note',
        id: nanoid(),
        content
      };
    } else {
      console.error(`Failed to parse input: ${input}`);
      return {
        title: 'Untitled',
        type: 'note',
        id: nanoid(),
        content: 'No description available'
      };
    }
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
