// Props for the Pagination component
interface Props {
  page: number;       // Current active page (1-indexed)
  totalPages: number; // Total number of pages
  total: number;      // Total number of items (used for "Showing X–Y of Z" label)
  pageSize?: number;  // Items per page (default 10, used to calculate the range label)
  onPage: (p: number) => void; // Callback when the user clicks a page button
}

/**
 * Pagination — renders page navigation buttons and a "Showing X–Y of Z" label.
 * Shows at most 5 page number buttons centered around the current page.
 * Returns null if there is only one page (no pagination needed).
 */
export default function Pagination({ page, totalPages, total, pageSize = 10, onPage }: Props) {
  // Don't render anything if all items fit on one page
  if (totalPages <= 1) return null;

  // Calculate the range of items shown on the current page
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Build an array of up to 5 page numbers centered around the current page
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  // Helper to render a single page button (or prev/next/first/last)
  const btn = (label: React.ReactNode, target: number, disabled: boolean) => (
    <button
      key={String(label)}
      onClick={() => !disabled && onPage(target)}
      disabled={disabled}
      className={`px-3 py-1 rounded text-sm border transition-colors
        ${disabled
          ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
          : target === page
            ? 'bg-teal-600 text-white border-teal-600'       // Active page — teal
            : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`} // Inactive page
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm">
      {/* Range label e.g. "Showing 1–10 of 47" */}
      <span className="text-slate-500">Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        {btn('«', 1,           page === 1)}          {/* First page */}
        {btn('‹', page - 1,   page === 1)}          {/* Previous page */}
        {pages.map(p => btn(p, p, p === page))}      {/* Numbered pages */}
        {btn('›', page + 1,   page === totalPages)} {/* Next page */}
        {btn('»', totalPages, page === totalPages)} {/* Last page */}
      </div>
    </div>
  );
}
