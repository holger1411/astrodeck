/**
 * Estimate reading time for a markdown body.
 *
 * Counts words after stripping code fences, inline code, markdown syntax and
 * HTML tags. Uses 200 words per minute, rounded up, minimum 1 minute.
 */
const WORDS_PER_MINUTE = 200;

export interface ReadingTime {
  minutes: number;
  words: number;
  /** Human-readable label, e.g. "4 min read" */
  text: string;
}

export function getReadingTime(markdown: string): ReadingTime {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|-]+/g, ' ');
  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words, text: `${minutes} min read` };
}
