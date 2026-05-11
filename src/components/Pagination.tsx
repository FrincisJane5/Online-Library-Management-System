interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, pageSize = 10, onPage }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Show at most 5 page buttons around current page
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn = (label: React.ReactNode, target: number, disabled: boolean) => (
    <button
      key={String(label)}
      onClick={() => !disabled && onPage(target)}
      disabled={disabled}
      className={`px-3 py-1 rounded text-sm border transition-colors
        ${disabled ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400' :
          target === page
            ? 'bg-teal-600 text-white border-teal-600'
            : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm">
      <span className="text-slate-500">Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        {btn('«', 1,            page === 1)}
        {btn('‹', page - 1,    page === 1)}
        {pages.map(p => btn(p, p, p === page))}
        {btn('›', page + 1,    page === totalPages)}
        {btn('»', totalPages,  page === totalPages)}
      </div>
    </div>
  );
}
