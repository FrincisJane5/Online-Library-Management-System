// useState for tracking the active tab
import { useState } from 'react';
// Toast notifications for success/error feedback
import { toast } from 'sonner';
import { borrowingService } from '../../services/borrowingService';
// useApi fetches all borrow records and provides a refetch function
import { useApi } from '../../hooks/useApi';
import BorrowForm from './BorrowForm';
import ReturnForm from './ReturnForm';
import BorrowingDetails from './BorrowingDetails';

// The three tabs available on this page
type Tab = 'borrow' | 'return' | 'details';

/**
 * BorrowingPage — the main borrowing management page.
 * Contains three tabs: Borrow Book, Return Book, and Borrowing Details.
 * Fetches all borrow records once and passes them down to child forms.
 */
export default function BorrowingPage() {
  const [tab, setTab] = useState<Tab>('borrow'); // Active tab state

  // Fetch all borrowing records; refetch is called after a successful borrow or return
  const { data: records, refetch } = useApi(() => borrowingService.getAll());

  // Called by child forms on success — refreshes the records list and shows a toast
  const handleSuccess = (msg: string) => {
    refetch();
    toast.success(msg);
  };

  // Called by child forms on error — extracts the server message or falls back to a generic one
  const handleError = (err: any) => {
    toast.error(err?.response?.data?.message ?? 'Operation failed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Borrowing & Returning</h2>
        <p className="text-slate-600">Manage book borrowing and return transactions.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Tab navigation */}
        <div className="border-b border-slate-200 flex">
          {(['borrow', 'return', 'details'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 capitalize transition-colors ${
                tab === t
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'borrow' ? 'Borrow Book' : t === 'return' ? 'Return Book' : 'Borrowing Details'}
            </button>
          ))}
        </div>

        {/* Tab content — only the active tab is rendered */}
        <div className="p-6">
          {tab === 'borrow'  && <BorrowForm onSuccess={handleSuccess} onError={handleError} />}
          {tab === 'return'  && <ReturnForm records={records ?? []} onSuccess={handleSuccess} onError={handleError} />}
          {tab === 'details' && <BorrowingDetails records={records ?? []} />}
        </div>
      </div>
    </div>
  );
}
