/**
 * @typedef {{
 *   file: string;
 *   line?: number;
 *   rule: string;
 *   message: string;
 *   severity?: 'error' | 'warn';
 *   suggestion?: string;
 * }} Finding
 */

/**
 * Format findings as one line each: `file:line  [rule] message`.
 * Optional severity is printed as `(warn)` / `(error)` after the rule and the
 * suggestion is appended as ` -> suggestion`.
 * @param {Finding[]} findings
 * @returns {string}
 */
export function formatFindings(findings) {
  return findings
    .map((f) => {
      const sev = f.severity ? ` (${f.severity})` : '';
      const hint = f.suggestion ? ` -> ${f.suggestion}` : '';
      return `${f.file}${f.line ? `:${f.line}` : ''}  [${f.rule}]${sev} ${f.message}${hint}`;
    })
    .join('\n');
}
