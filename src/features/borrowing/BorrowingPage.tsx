import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { borrowingService } from '../../services/borrowingService';
import { useApi } from '../../hooks/useApi';
import BorrowForm from './BorrowForm';
import ReturnForm from './ReturnForm';
import BorrowingDetails from './BorrowingDetails';

type Tab = 'borrow' | 'return' | 'details';

export default function BorrowingPage() {
  const [tab, setTab] = useState<Tab>('borrow');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { data: records, refetch } = useApi(() => borrowingService.getAll());

  const handleSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    refetch();
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleError = (err: any) => {
    setError(err?.response?.data?.message ?? 'Operation failed');
    setSuccess('');
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
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              className={`px-6 py-4 capitalize transition-colors ${
                tab === t ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'borrow' ? 'Borrow Book' : t === 'return' ? 'Return Book' : 'Borrowing Details'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-900">{success}</p>
            </div>
          )}

          {tab === 'borrow' && <BorrowForm onSuccess={handleSuccess} onError={handleError} />}
          {tab === 'return' && <ReturnForm records={records ?? []} onSuccess={handleSuccess} onError={handleError} />}
          {tab === 'details' && <BorrowingDetails records={records ?? []} />}
        </div>
      </div>
    </div>
  );
}
