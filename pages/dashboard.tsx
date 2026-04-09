import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Audit } from '@/types';
import { BarChart3, Plus, LogOut, FileText, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/'); return; }
      setEmail(data.session.user.email ?? '');
      loadAudits();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAudits() {
    setLoading(true);
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAudits(data as Audit[]);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this audit? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('audits').delete().eq('id', id);
    setAudits((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  }

  return (
    <>
      <Head><title>Dashboard — SaaS Auditor</title></Head>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">SaaS Auditor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-gray-500 truncate max-w-[180px]">{email}</span>
              <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Audits</h1>
              <p className="text-gray-500 text-sm mt-0.5">{audits.length} report{audits.length !== 1 ? 's' : ''} saved</p>
            </div>
            <Link href="/audit/new" className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" /> New Audit
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : audits.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No audits yet</h3>
              <p className="text-gray-400 text-sm mb-4">Upload a CSV to get your first SaaS spend report.</p>
              <Link href="/audit/new" className="btn-primary inline-flex items-center gap-1.5 text-sm">
                <Plus className="h-4 w-4" /> Start First Audit
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audits.map((audit) => (
                <div key={audit.id} className="card p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{audit.name}</h3>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(audit.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(audit.id)}
                      disabled={deleting === audit.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 p-1 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Vendors', value: audit.vendor_count },
                      { label: 'Monthly', value: `$${(audit.total_monthly_cost ?? 0).toFixed(0)}` },
                      { label: 'Annual', value: `$${((audit.total_annual_cost ?? 0) / 1000).toFixed(1)}k` },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <p className="font-bold text-gray-900 text-sm">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/audit/${audit.id}`}
                    className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors"
                  >
                    View Report →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
