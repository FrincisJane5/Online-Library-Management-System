import { useState } from 'react';
import { toast } from 'sonner';
import { borrowingService } from '../../services/borrowingService';
import { useApi } from '../../hooks/useApi';
import BorrowForm from './BorrowForm';
import ReturnForm from './ReturnForm';
import BorrowingDetails from './BorrowingDetails';

type Tab = 'borrow' | 'return' | 'details';

export default function BorrowingPage() {
  const [tab, setTab] = useState<Tab>('borrow');
  const { data: records, refetch } = useApi(() => borrowingService.getAll());

  const handleSuccess = (msg: string) => {
    refetch();
    toast.success(msg);
  };

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
        <div className="border-b border-slate-200 flex">
          {(['borrow', 'return', 'details'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 capitalize transition-colors ${
                tab === t ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'borrow' ? 'Borrow Book' : t === 'return' ? 'Return Book' : 'Borrowing Details'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'borrow' && <BorrowForm onSuccess={handleSuccess} onError={handleError} />}
          {tab === 'return' && <ReturnForm records={records ?? []} onSuccess={handleSuccess} onError={handleError} />}
          {tab === 'details' && <BorrowingDetails records={records ?? []} />}
        </div>
      </div>
    </div>
  );
}
