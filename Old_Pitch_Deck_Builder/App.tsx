import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CircleDollarSign,
  DatabaseZap,
  FileCheck2,
  FileWarning,
  FolderSync,
  Landmark,
  LayoutDashboard,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { ssotData } from './data/ssotSnapshot';

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  progress: number;
  icon: React.ReactNode;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, helper, progress, icon }) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className="surface-card rounded-xl p-5"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className="rounded-lg bg-blue-50 p-2 text-blue-700">{icon}</div>
    </div>
    <p className="mt-3 text-xs text-slate-500">{helper}</p>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  </motion.article>
);

const App: React.FC = () => {
  const parsedCount = ssotData.intakeQueue.filter((row) => row.parse_status === 'parsed').length;
  const docLinkedCount = ssotData.documents.filter((doc) => doc.path_status === 'ok').length;
  const docBrokenCount = ssotData.documents.length - docLinkedCount;
  const totalIssuance = ssotData.leases.reduce((sum, lease) => sum + lease.total_issuance_value_nzd, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mission-grid">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-5 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">SSOT Build</p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Evolution Mission Control</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              <a className="nav-item nav-item-active" href="#">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </a>
              <a className="nav-item" href="#">
                <Landmark size={16} />
                <span>Horses</span>
              </a>
              <a className="nav-item" href="#">
                <Link2 size={16} />
                <span>Leases</span>
              </a>
              <a className="nav-item" href="#">
                <FolderSync size={16} />
                <span>Intake Queue</span>
              </a>
              <a className="nav-item" href="#">
                <ShieldCheck size={16} />
                <span>Compliance Docs</span>
              </a>
            </nav>
            <div className="border-t border-slate-200 p-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                <p className="text-xs font-semibold text-blue-800">Pipeline status</p>
                <p className="mt-1 text-xs text-blue-700">{parsedCount}/{ssotData.intakeQueue.length} intakes parsed</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Single Source Of Truth</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Operational Dashboard</h2>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Snapshot Date</p>
                <p className="text-sm font-medium text-slate-700">{ssotData.snapshotDate}</p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Active Horses"
                value={String(ssotData.horses.length)}
                helper="Identity records verified against breeding sources."
                progress={100}
                icon={<Landmark size={16} />}
              />
              <MetricCard
                label="Active Leases"
                value={String(ssotData.leases.length)}
                helper="Commercial terms loaded from signed docs."
                progress={100}
                icon={<Link2 size={16} />}
              />
              <MetricCard
                label="Documents Linked"
                value={`${docLinkedCount}/${ssotData.documents.length}`}
                helper={docBrokenCount === 0 ? 'All source files currently resolvable.' : `${docBrokenCount} references still unresolved.`}
                progress={(docLinkedCount / ssotData.documents.length) * 100}
                icon={docBrokenCount === 0 ? <FileCheck2 size={16} /> : <FileWarning size={16} />}
              />
              <MetricCard
                label="Issuance Value"
                value={`NZD ${totalIssuance.toLocaleString()}`}
                helper="Combined issuance value across active leases."
                progress={92}
                icon={<CircleDollarSign size={16} />}
              />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
              <article className="surface-card rounded-xl">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-base font-semibold text-slate-900">Lease Registry</h3>
                  <p className="mt-1 text-sm text-slate-500">Live rows from SSOT intake snapshot</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-5 py-3 font-semibold">Lease</th>
                        <th className="px-5 py-3 font-semibold">Horse</th>
                        <th className="px-5 py-3 font-semibold">Term</th>
                        <th className="px-5 py-3 font-semibold">Token Price</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {ssotData.leases.map((lease) => (
                        <tr key={lease.lease_id} className="border-t border-slate-100">
                          <td className="px-5 py-3 font-medium text-slate-900">{lease.lease_id}</td>
                          <td className="px-5 py-3 text-slate-700">{lease.horse_name}</td>
                          <td className="px-5 py-3 text-slate-700">{lease.start_date} to {lease.end_date}</td>
                          <td className="px-5 py-3 text-slate-700">NZD {lease.token_price_nzd}</td>
                          <td className="px-5 py-3">
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              {lease.lease_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <div className="space-y-6">
                <article className="surface-card rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <FolderSync size={16} className="text-blue-600" />
                    <h3 className="text-base font-semibold text-slate-900">Intake Queue</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {ssotData.intakeQueue.map((row) => (
                      <div key={row.intake_id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{row.intake_id}</p>
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                            {row.parse_status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{row.parsed_horse_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.breeding_url}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="surface-card rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <DatabaseZap size={16} className="text-blue-600" />
                    <h3 className="text-base font-semibold text-slate-900">HLT Draft</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{ssotData.hltDraft.draftId}</p>
                  <p className="mt-1 text-xs text-slate-500">{ssotData.hltDraft.status} • {ssotData.hltDraft.createdAt}</p>
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {ssotData.hltDraft.horseName}: {ssotData.hltDraft.hltNarrative}
                  </div>
                </article>

                <article className="surface-card rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-600" />
                    <h3 className="text-base font-semibold text-slate-900">Document Integrity</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {ssotData.documents.map((doc) => (
                      <li key={doc.document_id} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="truncate">{doc.document_id} • {doc.source_reference}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${doc.path_status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {doc.path_status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
