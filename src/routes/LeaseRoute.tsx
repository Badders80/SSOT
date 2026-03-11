import React from 'react';
import { PlusCircle } from 'lucide-react';

type LeaseRouteProps = {
  filteredLeases: Array<any>;
  horseById: Map<string, any>;
  leaseTab: 'active' | 'proposed' | 'draft' | 'completed';
  leaseHorseFilter: string;
  leaseStatusFilter: 'all' | 'active' | 'proposed' | 'draft' | 'completed';
  showLeaseHorseFilter: boolean;
  showLeaseStatusFilter: boolean;
  leaseHorseOptions: Array<{ id: string; name: string }>;
  setLeaseTab: (tab: 'active' | 'proposed' | 'draft' | 'completed') => void;
  setLeaseHorseFilter: (value: string) => void;
  setLeaseStatusFilter: (value: 'all' | 'active' | 'proposed' | 'draft' | 'completed') => void;
  setShowLeaseHorseFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLeaseStatusFilter: React.Dispatch<React.SetStateAction<boolean>>;
  formatNzd: (value: string) => string;
  leaseStatusBadgeClass: (status: string) => string;
  openHltWizard: () => void;
};

const leaseTabs: Array<'active' | 'proposed' | 'draft' | 'completed'> = ['active', 'proposed', 'draft', 'completed'];

const LeaseRoute: React.FC<LeaseRouteProps> = ({
  filteredLeases,
  horseById,
  leaseTab,
  leaseHorseFilter,
  leaseStatusFilter,
  showLeaseHorseFilter,
  showLeaseStatusFilter,
  leaseHorseOptions,
  setLeaseTab,
  setLeaseHorseFilter,
  setLeaseStatusFilter,
  setShowLeaseHorseFilter,
  setShowLeaseStatusFilter,
  formatNzd,
  leaseStatusBadgeClass,
  openHltWizard,
}) => (
  <article className="surface-card rounded-xl">
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold text-slate-900">Lease Registry</h3>
      <p className="mt-1 text-sm text-slate-500">Click horse names for live pages</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {leaseTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setLeaseTab(tab); setLeaseStatusFilter(tab); }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${leaseStatusFilter !== 'all' && leaseTab === tab ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {(leaseHorseFilter !== 'all' || leaseStatusFilter !== 'all') ? (
        <button
          type="button"
          onClick={() => {
            setLeaseHorseFilter('all');
            setLeaseStatusFilter('all');
            setShowLeaseHorseFilter(false);
            setShowLeaseStatusFilter(false);
          }}
          className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
        >
          Clear filters
        </button>
      ) : null}
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
            <th className="px-5 py-3 font-semibold">Lease</th>
            <th className="relative px-5 py-3 font-semibold">
              <button type="button" onClick={() => { setShowLeaseHorseFilter((prev) => !prev); setShowLeaseStatusFilter(false); }} className="inline-flex items-center gap-1">
                Horse
                {leaseHorseFilter !== 'all' ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
              </button>
              {showLeaseHorseFilter ? (
                <div className="absolute left-5 top-11 z-20 min-w-[220px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <button type="button" onClick={() => { setLeaseHorseFilter('all'); setShowLeaseHorseFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">All Horses</button>
                  {leaseHorseOptions.map((horse) => (
                    <button key={horse.id} type="button" onClick={() => { setLeaseHorseFilter(horse.id); setShowLeaseHorseFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">{horse.name}</button>
                  ))}
                </div>
              ) : null}
            </th>
            <th className="px-5 py-3 font-semibold">Performance</th>
            <th className="px-5 py-3 font-semibold">Token Price</th>
            <th className="relative px-5 py-3 font-semibold">
              <button type="button" onClick={() => { setShowLeaseStatusFilter((prev) => !prev); setShowLeaseHorseFilter(false); }} className="inline-flex items-center gap-1">
                Status
                {leaseStatusFilter !== 'all' ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
              </button>
              {showLeaseStatusFilter ? (
                <div className="absolute left-5 top-11 z-20 min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <button type="button" onClick={() => { setLeaseStatusFilter('all'); setShowLeaseStatusFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">All</button>
                  {leaseTabs.map((status) => (
                    <button key={status} type="button" onClick={() => { setLeaseStatusFilter(status); setLeaseTab(status); setShowLeaseStatusFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">{status}</button>
                  ))}
                </div>
              ) : null}
            </th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {filteredLeases.map((lease) => {
            const horse = horseById.get(lease.horse_id);
            return (
              <tr key={lease.lease_id} className="border-t border-slate-100 hover:bg-slate-50/70">
                <td className="px-5 py-3 font-medium text-slate-900">{lease.lease_id}</td>
                <td className="px-5 py-3">{horse ? <a href={`#/horse/${encodeURIComponent(horse.horse_id)}`} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">{horse.horse_name}</a> : <span className="text-slate-700">{lease.horse_id}</span>}</td>
                <td className="px-5 py-3">{horse?.performance_profile_url ? <a href={horse.performance_profile_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-800 hover:underline">Open performance</a> : <span className="text-slate-500">n/a</span>}</td>
                <td className="px-5 py-3 font-medium text-slate-700">{formatNzd(lease.token_price_nzd)}</td>
                <td className="px-5 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${leaseStatusBadgeClass(lease.lease_status)}`}>{lease.lease_status}</span></td>
              </tr>
            );
          })}
          <tr className="border-t border-slate-100">
            <td colSpan={5} className="px-5 py-4">
              <button type="button" onClick={openHltWizard} className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                <PlusCircle size={24} />
                <div className="text-left">
                  <p className="text-sm font-semibold">Create New HLT</p>
                  <p className="text-xs text-slate-500 group-hover:text-blue-700">Generate a new Horse Lease Token issuance</p>
                </div>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
);

export default LeaseRoute;
