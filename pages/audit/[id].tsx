import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { exportToPDF, exportToJSON } from '@/lib/pdf-export';
import type { Audit } from '@/types';
import VendorTable from '@/components/VendorTable';
import CostSummary from '@/components/CostSummary';
import CategoryChart from '@/components/CategoryChart';
import { BarChart3, ArrowLeft, Download, FileJson, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditReport() {
  const router = useRouter();
  const { id } = router.query;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/'); return; }
      loadAudit(id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadAudit(auditId: string) {
    const { data, error: dbError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .single();

    if (dbError || !data) {
      setError('Audit not found.');
    } else {
      // report_data holds the full parsed CSV result
      const reportData = data.report_data as { subscriptions?: unknown[]; category_breakdown?: unknown[] } | null;
      setAudit({
        ...data,
        subscriptions: reportData?.subscriptions ?? [],
        category_breakdown: reportData?.category_breakdown ?? [],
      } as Audit);
    }
    setLoading(false);
  }

  async function handleExportPDF() {
    if (!audit) return;
    setExporting(true);
    try { await exportToPDF(audit); } catch (e) { console.error(e); }
    setExporting(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !audit) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <p className="text-gray-500">{error || 'Audit not found.'}</p>
      <Link href="/dashboard" className="btn-primary text-sm">← Back to Dashboard</Link>
    </div>
  );

  return (
    <>
      <Head><title>{audit.name} — SaaS Auditor</title></Head>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{audit.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToJSON(audit)}
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                <FileJson className="h-3.5 w-3.5" /> JSON
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                PDF
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Meta */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Generated {format(new Date(audit.created_at), 'MMMM d, yyyy')}</span>
          </div>

          {/* Summary KPIs */}
          <CostSummary audit={audit} />

          {/* Charts + Category breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            <CategoryChart breakdown={audit.category_breakdown} />
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Spend by Category</h3>
              <div className="space-y-2">
                {audit.category_breakdown.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-gray-700 font-medium">{cat.category}</span>
                      <span className="text-gray-500">${cat.monthly_cost.toFixed(0)}/mo · {cat.vendor_count} vendor{cat.vendor_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${audit.total_monthly_cost > 0 ? (cat.monthly_cost / audit.total_monthly_cost) * 100 : 0}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full subscription table */}
          <VendorTable subscriptions={audit.subscriptions} totalMonthly={audit.total_monthly_cost} />
        </main>
      </div>
    </>
  );
}
