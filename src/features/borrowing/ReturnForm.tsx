// useMemo for finding the matched record, useState for form state
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { borrowingService } from '../../services/borrowingService';
import { today } from '../../utils';
import type { BorrowingRecord } from '../../types';

interface Props {
  records: BorrowingRecord[];          // All active borrowing records to search through
  onSuccess: (msg: string) => void;    // Called with a success message after a successful return
  onError: (err: any) => void;         // Called with the error object if the return fails
}

// Book condition on return: empty string = normal return
type Action = '' | 'damaged' | 'lost';

/**
 * ReturnForm — lets staff search for an active borrow transaction and process its return.
 * Supports normal returns as well as damaged/lost conditions with an optional description.
 * Calculates and displays the fine after submission.
 */
export default function ReturnForm({ records, onSuccess, onError }: Props) {
  const [query, setQuery]           = useState('');
  const [action, setAction]         = useState<Action>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Find the first active (status === 'borrowed') record matching the search query
  const matched = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return null;
    return records.find(r =>
      r.status === 'borrowed' && (
        `${r.id}`.includes(term) ||
        r.student_name.toLowerCase().includes(term) ||
        r.book_title.toLowerCase().includes(term) ||
        (r.call_number ?? '').toLowerCase().includes(term)
      )
    ) ?? null;
  }, [records, query]);

  // Submit the return — sends action and description to the API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matched) {
      onError({ response: { data: { message: 'No active transaction found.' } } });
      return;
    }
    setSubmitting(true);
    try {
      const result = await borrowingService.return(matched.id, {
        action:      action || undefined,
        description: description || undefined,
      });
      const fine = Number(result.fine_amount ?? 0);
      const msg = fine > 0
        ? `Book returned with fine: ₱${fine.toFixed(2)}`
        : 'Book returned on time – no fine.';
      setQuery('');
      setAction('');
      setDescription('');
      onSuccess(msg);
    } catch (err) {
      onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Detail rows shown in the transaction summary card
  const DETAIL_ROWS = matched ? [
    ['Student Name', matched.student_name],
    ['Email',        matched.email ?? '—'],
    ['Phone',        matched.contact_number ?? '—'],
    ['Call Number',  matched.call_number ?? '—'],
    ['Book Title',   matched.book_title],
    ['Date Borrowed',matched.borrow_date],
    ['Due Date',     matched.due_date],
    ["Today's Date", today()],
  ] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Search Input ──────────────────────────────────────────────── */}
      <div>
        <label className="block text-slate-700 mb-2">Search Active Transaction</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by student name, call number, or book title..."
            required
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* ── Transaction Details Card (shown when a match is found) ────── */}
      {matched && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
          <h3 className="text-slate-900">Transaction Details</h3>
          {/* Two-column grid of label/value pairs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DETAIL_ROWS.map(([label, value]) => (
              <div key={label}>
                <p className="text-slate-500 text-sm">{label}</p>
                <p className="text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {/* ── Book Condition Selector ──────────────────────────────── */}
          <div>
            <label className="block text-slate-700 mb-2">Book Condition</label>
            <select
              value={action}
              onChange={e => setAction(e.target.value as Action)}
              className="w-full md:w-56 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Normal Return</option>
              <option value="damaged">Damaged</option>
              <option value="lost">Lost</option>
            </select>
            {/* Warning shown when a fine-triggering condition is selected */}
            {action && (
              <p className="mt-2 text-sm text-orange-700">
                ⚠ Additional fine will be applied for {action} book.
              </p>
            )}
          </div>

          {/* ── Description Textarea (only shown for damaged/lost) ────── */}
          {action && (
            <div>
              <label className="block text-slate-700 mb-2">
                Description <span className="text-slate-400 text-sm">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={`Describe the ${action} condition of the book...`}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          )}
        </div>
         
      )}

      {submitting ? (
        <button type="button" disabled
          className="w-full py-3 bg-teal-600 text-white rounded-lg text-sm animate-pulse">
          Processing...
        </button>
      ) : (
        <button type="submit"
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors">
          Confirm Return
        </button>
      )}
    </form>
  );
}
