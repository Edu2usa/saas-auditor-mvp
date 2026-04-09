import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { parseCSVText } from '@/lib/csv-parser';
import DropZone from '@/components/DropZone';
import type { ParsedCSV } from '@/types';
import { BarChart3, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

// Client-side CSV size / row limits (mirrors server-side guards in /api/parse-csv)
const MAX_CSV_BYTES = 5 * 1024 * 1024;
const MAX_CSV_ROWS = 10_000;
const MAX_AUDIT_NAME_LENGTH = 200;

export default function NewAudit() {
  const router = useRouter();
  const [auditName, setAuditName] = useState('');
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/');
    });
  }, [router]);

  function handleFileParsed(csvText: string, fileName: string) {
    setError('');

    // Client-side guards — mirrors server-side limits
    if (Buffer.byteLength(csvText, 'utf8') > MAX_CSV_BYTES) {
      setError(`CSV file is too large (max ${MAX_CSV_BYTES / 1024 / 1024} MB).`);
      return;
    }
    const rowCount = csvText.split('\n').length - 1;
    if (rowCount > MAX_CSV_ROWS) {
      setError(`CSV has too many rows (max ${MAX_CSV_ROWS.toLocaleString()}).`);
      return;
    }

    try {
      const result = parseCSVText(csvText);
      setParsed(result);
      if (!auditName) {
        const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setAuditName(baseName || `Audit ${new Date().toLocaleDateString()}`);
      }
    } catch (e) {
      setError(`Failed to parse CSV: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async function handleSave() {
    if (!parsed || !auditName.trim()) return;

    const trimmedName = auditName.trim();
    if (trimmedName.length > MAX_AUDIT_NAME_LENGTH) {
      setError(`Audit name must be ${MAX_AUDIT_NAME_LENGTH} characters or fewer.`);
      return;
    }

    setSaving(true);
    setError('');

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { router.push('/'); return; }

    const token = sessionData.session.access_token;

    // POST through the API route so server-side validation and rate-limiting apply
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: trimmedName,
        total_monthly_cost: parsed.total_monthly_cost,
        total_annual_cost: parsed.total_annual_cost,
        vendor_count: parsed.vendor_count,
        report_data: parsed,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Save failed (${res.status})`);
      setSaving(false);
      return;
    }

    const data = await res.json();
    router.push(`/audit/${data.id}`);
  }

  return (
    <>
      <Head><title>New Audit — SaaS Auditor</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto flex items-center h-14 gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">New Audit</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Step 1: Upload */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Upload CSV
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Export from QuickBooks, Ramp, Brex, or any expense tool. Needs at least a <strong>vendor</strong> and <strong>amount</strong> column.
            </p>
            <DropZone onFileParsed={handleFileParsed} />

            {/* Sample hint */}
            <details className="mt-3 text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-600">Expected CSV format (click to expand)</summary>
              <pre className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-500 overflow-x-auto">{`vendor,amount,users,billing_cycle
Slack,125.00,25,monthly
GitHub,84.00,12,monthly
Notion,48.00,8,monthly
Figma,360.00,3,annual`}</pre>
            </details>
          </div>

          {/* Parse results */}
          {parsed && (
            <>
              {parsed.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
                    <AlertTriangle className="h-4 w-4" /> Parse Warnings
                  </div>
                  <ul className="text-xs text-amber-600 space-y-0.5">
                    {parsed.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
              )}

              {parsed.vendor_count === 0 ? (
                <div className="card p-6 text-center text-gray-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                  <p className="font-medium">No subscriptions detected.</p>
                  <p className="text-sm">Make sure your CSV has a vendor/name and amount column.</p>
                </div>
              ) : (
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                    <CheckCircle className="h-5 w-5" />
                    {parsed.vendor_count} subscription{parsed.vendor_count !== 1 ? 's' : ''} detected
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Vendors Found', value: parsed.vendor_count },
                      { label: 'Monthly Spend', value: `$${parsed.total_monthly_cost.toLocaleString()}` },
                      { label: 'Annual Spend', value: `$${parsed.total_annual_cost.toLocaleString()}` },
                    ].map((s) => (
                      <div key={s.label} className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-400 mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-blue-700">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Preview table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Vendor</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-right">Monthly</th>
                          <th className="px-4 py-2 text-right">Annual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {parsed.subscriptions.slice(0, 10).map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-800">{s.vendor}</td>
                            <td className="px-4 py-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.category}</span>
                            </td>
                            <td className="px-4 py-2 text-right text-gray-700">${s.monthly_cost.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right text-gray-700">${s.annual_cost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsed.vendor_count > 10 && (
                      <p className="text-xs text-gray-400 text-center py-2">
                        + {parsed.vendor_count - 10} more rows — save to see full report
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Name & Save */}
              {parsed.vendor_count > 0 && (
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    Name & Save Report
                  </h2>
                  <input
                    type="text"
                    className="input mb-4"
                    placeholder="e.g. Q2 2026 SaaS Audit"
                    maxLength={MAX_AUDIT_NAME_LENGTH}
                    value={auditName}
                    onChange={(e) => setAuditName(e.target.value)}
                  />
                  {error && (
                    <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || !auditName.trim()}
                    className="btn-primary w-full"
                  >
                    {saving ? 'Saving…' : 'Save & View Report'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
