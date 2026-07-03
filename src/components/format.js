/* ============================================================================
   Formatting Helpers
   Purpose: tiny shared string/number helpers that keep render components clean.
   ============================================================================ */

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function titleCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
