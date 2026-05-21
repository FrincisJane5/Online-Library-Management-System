import { useState } from 'react';
import { Download } from 'lucide-react';
import { reportService } from '../../services/reportService';
import logoImage from '../../assets/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'borrowing' | 'inventory' | 'overdue' | 'department-attendance' | 'payment-collection';

const TABS: { key: ReportType; label: string }[] = [
  { key: 'borrowing',             label: 'Borrowing & Returning' },
  { key: 'inventory',             label: 'Inventory Status' },
  { key: 'overdue',               label: 'Overdue & Fines' },
  { key: 'department-attendance', label: 'Department Attendance' },
  { key: 'payment-collection',    label: 'Payment Collection' },
];

const STATUS_BADGE: Record<string, string> = {
  borrowed: 'bg-orange-100 text-orange-700 border-orange-200',
  returned: 'bg-green-100 text-green-700 border-green-200',
  paid:     'bg-green-100 text-green-700 border-green-200',
  unpaid:   'bg-red-100 text-red-700 border-red-200',
  damaged:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  lost:     'bg-red-100 text-red-700 border-red-200',
};

function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex px-2 py-1 rounded border text-sm ${STATUS_BADGE[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {value}
    </span>
  );
}

export default function ReportsPage() {
  const [active, setActive] = useState<ReportType>('borrowing');
  const [start, setStart]   = useState('');
  const [end, setEnd]       = useState('');
  const [data, setData]     = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const range = { start: start || undefined, end: end || undefined };
      const fetchers: Record<ReportType, () => Promise<any>> = {
        borrowing:               () => reportService.borrowing(range),
        inventory:               () => reportService.inventory(),
        overdue:                 () => reportService.overdue(range),
        'department-attendance': () => reportService.departmentAttendance(range),
        'payment-collection':    () => reportService.paymentCollection(range),
      };
      setData(await fetchers[active]());
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const exportPDF = async () => {
    if (data.length === 0) return;

    const label     = TABS.find(t => t.key === active)?.label ?? active;
    const generated = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Logo
    const logoBase64 = await window.fetch(logoImage)
      .then(r => r.blob())
      .then(blob => new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }));

    pdf.addImage(logoBase64, 'PNG', 10, 8, 20, 20);

    // School header (centered)
    pdf.setFontSize(13);
    pdf.setTextColor(15, 118, 110);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LEGACY COLLEGE OF COMPOSTELA, INC.', 105, 14, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Dagohoy St. Poblacion Compostela, Davao', 105, 20, { align: 'center' });

    // Divider
    pdf.setDrawColor(15, 118, 110);
    pdf.setLineWidth(0.5);
    pdf.line(10, 32, 200, 32);

    // Report title + date
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 118, 110);
    pdf.text(`${label} Report`, 10, 39);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated: ${generated}`, 10, 44);

    // Build table columns/rows from data
    let head: string[][] = [];
    let body: (string | number)[][] = [];

    if (active === 'borrowing') {
      head = [['#', 'Date', 'Student', 'ID', 'Book', 'Call No.', 'Status', 'Action', 'Due Date', 'Returned']];
      body = data.map((r, i) => [i + 1, r.date, r.student, r.idNumber, r.book, r.callNumber ?? '-', r.status, r.action ?? '-', r.dueDate, r.returnDate ?? '-']);
    } else if (active === 'inventory') {
      head = [['#', 'Title', 'Author', 'Copyright', 'Copies', 'Available', 'Borrowed', 'Damaged', 'Lost']];
      body = data.map(r => [r.no, r.title, r.author, r.copyright, r.copyCount, r.available, r.borrowed, r.damaged, r.lost]);
    } else if (active === 'overdue') {
      head = [['#', 'Student', 'Book', 'Days Overdue', 'Fine', 'Fine Status', 'Action']];
      body = data.map((r, i) => [i + 1, r.student, r.book, r.daysOverdue, `₱${Number(r.fineAmount).toFixed(2)}`, r.fineStatus, r.action ?? '-']);
    } else if (active === 'department-attendance') {
      head = [['#', 'Student', 'Year', 'Date & Time']];
      const grouped: Record<string, any[]> = {};
      data.forEach((r: any) => {
        const dept = r.course ?? 'Unknown';
        if (!grouped[dept]) grouped[dept] = [];
        grouped[dept].push(r);
      });
      let firstGroup = true;
      for (const [dept, rows] of Object.entries(grouped)) {
        const startY = firstGroup ? 48 : (pdf as any).lastAutoTable.finalY + 8;
        firstGroup = false;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 118, 110);
        pdf.text(dept, 10, startY - 2);
        autoTable(pdf, {
          head: [['#', 'Student', 'Year', 'Date & Time']],
          body: rows.map((r: any, i: number) => [i + 1, r.name, r.year ?? '-', r.date]),
          startY,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
      }
      pdf.save(`${label.replace(/\s+/g, '_')}_Report.pdf`);
      return;
    } else if (active === 'payment-collection') {
      head = [['#', 'Date Paid', 'Student', 'ID No.', 'Book', 'Days Overdue', 'Fine Amount', 'Status']];
      body = data.map((r, i) => [i + 1, r.datePaid ?? '-', r.student, r.idNumber, r.book, r.daysOverdue, `₱${Number(r.fineAmount).toFixed(2)}`, r.fineStatus]);
    }

    autoTable(pdf, {
      head,
      body,
      startY: 48,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    pdf.save(`${label.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Reports</h2>
        <p className="text-slate-600">Generate and export library reports.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Tabs */}
        <div className="border-b border-slate-200 flex flex-wrap">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => { setActive(key); setData([]); }}
              className={`px-6 py-4 transition-colors ${active === key ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-600 hover:text-slate-900'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-slate-700 mb-1 text-sm">Start Date</label>
              <input type="date" value={start} onChange={e => setStart(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 text-sm">End Date</label>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <button onClick={generate}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
              Generate
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>

          {loading && <p className="text-center py-12 text-slate-500">Loading...</p>}
          {!loading && data.length === 0 && (
            <p className="text-center py-12 text-slate-500">No data. Click Generate to load report.</p>
          )}

          <div id="report-content">
            {/* Borrowing */}
            {!loading && active === 'borrowing' && data.length > 0 && (
              <Table headers={['No.', 'Date', 'Student', 'ID', 'Book', 'Call No.', 'Status', 'Action', 'Due Date', 'Returned']}>
                {data.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-400 text-center">{i + 1}</td>
                    <td className="px-6 py-4">{r.date}</td>
                    <td className="px-6 py-4">{r.student}</td>
                    <td className="px-6 py-4 text-slate-600">{r.idNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{r.book}</td>
                    <td className="px-6 py-4 text-slate-600">{r.callNumber ?? '-'}</td>
                    <td className="px-6 py-4"><Badge value={r.status} /></td>
                    <td className="px-6 py-4">{r.action ? <Badge value={r.action} /> : '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{r.dueDate}</td>
                    <td className="px-6 py-4 text-slate-600">{r.returnDate ?? '-'}</td>
                  </tr>
                ))}
              </Table>
            )}

            {/* Inventory */}
            {!loading && active === 'inventory' && data.length > 0 && (
              <Table headers={['No.', 'Title', 'Author', 'Copyright', 'Copy Count', 'Available', 'Borrowed', 'Damaged', 'Lost']}>
                {data.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500 text-center">{r.no}</td>
                    <td className="px-6 py-4 font-medium">{r.title}</td>
                    <td className="px-6 py-4 text-slate-600">{r.author}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{r.copyright}</td>
                    <td className="px-6 py-4 text-center font-medium">{r.copyCount}</td>
                    <td className="px-6 py-4 text-center text-green-700 font-medium">{r.available}</td>
                    <td className="px-6 py-4 text-center text-orange-700">{r.borrowed}</td>
                    <td className="px-6 py-4 text-center text-yellow-700">{r.damaged}</td>
                    <td className="px-6 py-4 text-center text-red-700">{r.lost}</td>
                  </tr>
                ))}
              </Table>
            )}

            {/* Overdue */}
            {!loading && active === 'overdue' && data.length > 0 && (
              <Table headers={['No.', 'Student', 'Book', 'Days Overdue', 'Fine', 'Fine Status', 'Action']}>
                {data.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-400 text-center">{i + 1}</td>
                    <td className="px-6 py-4">{r.student}</td>
                    <td className="px-6 py-4">{r.book}</td>
                    <td className="px-6 py-4 text-center text-red-700 font-medium">{r.daysOverdue}</td>
                    <td className="px-6 py-4">₱{Number(r.fineAmount).toFixed(2)}</td>
                    <td className="px-6 py-4"><Badge value={r.fineStatus} /></td>
                    <td className="px-6 py-4">{r.action ? <Badge value={r.action} /> : '-'}</td>
                  </tr>
                ))}
              </Table>
            )}

            {/* Department Attendance */}
            {!loading && active === 'department-attendance' && data.length > 0 && (() => {
              const grouped: Record<string, any[]> = {};
              data.forEach((r: any) => {
                const dept = r.course ?? 'Unknown';
                if (!grouped[dept]) grouped[dept] = [];
                grouped[dept].push(r);
              });
              return (
                <div className="space-y-8">
                  {Object.entries(grouped).map(([dept, rows]) => (
                    <div key={dept}>
                      <h4 className="text-teal-700 font-bold text-base mb-2 px-1">{dept}</h4>
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-slate-700 font-medium w-12">No.</th>
                              <th className="px-4 py-3 text-left text-slate-700 font-medium">Student Name</th>
                              <th className="px-4 py-3 text-left text-slate-700 font-medium">Year</th>
                              <th className="px-4 py-3 text-left text-slate-700 font-medium">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.map((r: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-400 text-center">{i + 1}</td>
                                <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                                <td className="px-4 py-3 text-slate-600">{r.year ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-600">{r.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 px-1">{rows.length} student{rows.length !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Payment Collection */}
            {!loading && active === 'payment-collection' && data.length > 0 && (() => {
              const total = data.reduce((sum: number, r: any) => sum + Number(r.fineAmount), 0);
              return (
                <>
                  <Table headers={['No.', 'Date Paid', 'Student', 'ID No.', 'Book', 'Days Overdue', 'Fine Amount', 'Status']}>
                    {data.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-400 text-center">{i + 1}</td>
                        <td className="px-6 py-4">{r.datePaid ?? '-'}</td>
                        <td className="px-6 py-4 font-medium">{r.student}</td>
                        <td className="px-6 py-4 text-slate-600">{r.idNumber}</td>
                        <td className="px-6 py-4 text-slate-600">{r.book}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{r.daysOverdue}</td>
                        <td className="px-6 py-4 font-medium text-green-700">₱{Number(r.fineAmount).toFixed(2)}</td>
                        <td className="px-6 py-4"><Badge value={r.fineStatus} /></td>
                      </tr>
                    ))}
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <div className="bg-teal-50 border border-teal-200 rounded-lg px-6 py-3 text-right">
                      <p className="text-sm text-teal-600">Total Collected</p>
                      <p className="text-xl font-bold text-teal-700">₱{total.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {!loading && data.length > 0 && (
            <p className="mt-4 text-slate-500 text-sm">{data.length} record{data.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-6 py-3 text-left text-slate-700 text-sm font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-900">{children}</tbody>
      </table>
    </div>
  );
}
