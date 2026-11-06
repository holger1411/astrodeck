/**
 * @typedef {{ file: string; line?: number; rule: string; message: string }} Finding
 */

/**
 * Format findings as one line each: `file:line  [rule] message`.
 * @param {Finding[]} findings
 * @returns {string}
 */
export function formatFindings(findings) {
  return findings
    .map((f) => `${f.file}${f.line ? `:${f.line}` : ''}  [${f.rule}] ${f.message}`)
    .join('\n');
}
