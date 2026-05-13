/** Export an array of objects as a CSV file download. */
export function exportCSV(data: Record<string, unknown>[], filename: string) {
  // If there's no data, do nothing — avoid creating an empty file
  if (!data.length) return;

  // Extract column headers from the keys of the first object
  const headers = Object.keys(data[0]);

  // Convert each row object into a comma-separated string, wrapping each value in quotes
  // to handle values that may contain commas
  const rows = data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','));

  // Combine the header row and all data rows into one CSV string, separated by newlines
  const csv = [headers.join(','), ...rows].join('\n');

  // Create a temporary URL pointing to a Blob (in-memory file) containing the CSV text
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));

  // Create a hidden <a> element, set its href to the blob URL and the download filename,
  // then programmatically click it to trigger the browser's file download
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();

  // Release the blob URL from memory now that the download has been triggered
  URL.revokeObjectURL(url);
}

/** Return today's date as YYYY-MM-DD.
 *  Uses ISO format and slices off the time portion (e.g. "2026-05-12T14:00:00.000Z" → "2026-05-12"). */
export const today = () => new Date().toISOString().split('T')[0];
