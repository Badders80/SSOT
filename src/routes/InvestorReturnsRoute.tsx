import React from 'react';

type HorseLike = {
  horse_id: string;
  horse_name: string;
  performance_profile_url?: string;
};

type InvestorReturnEvent = {
  horseId: string;
  horseName: string;
  raceDate: string;
  raceName: string;
  raceUrl: string;
  result: string;
  sourceStakeNzd: number | null;
  leaseId: string;
  investorPayoutNzd: number;
  payoutPerOnePercentNzd: number;
  payoutPerTokenNzd: number | null;
  status: string;
};

type InvestorReturnsRouteProps = {
  filteredInvestorReturns: InvestorReturnEvent[];
  horseById: Map<string, HorseLike>;
  investorReturnTab: 'all' | 'returned' | 'pending';
  investorReturnHorseFilter: string;
  showInvestorReturnHorseFilter: boolean;
  showInvestorReturnStatusFilter: boolean;
  investorReturnHorseOptions: Array<{ id: string; name: string }>;
  setInvestorReturnTab: (tab: 'all' | 'returned' | 'pending') => void;
  setInvestorReturnHorseFilter: (value: string) => void;
  setShowInvestorReturnHorseFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setShowInvestorReturnStatusFilter: React.Dispatch<React.SetStateAction<boolean>>;
  formatNzdAmount: (value: number, maximumFractionDigits?: number) => string;
  investorPayoutLoading: boolean;
  accumulatedInvestorReturnNzd: number;
};

const investorReturnTabs: Array<{ id: 'all' | 'returned' | 'pending'; label: string }> = [
  { id: 'all', label: 'all' },
  { id: 'returned', label: 'returned' },
  { id: 'pending', label: 'pending' },
];

const statusBadgeClass = (status: string): string => (
  status === 'Live lease payout'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700'
);

const InvestorReturnsRoute: React.FC<InvestorReturnsRouteProps> = ({
  filteredInvestorReturns,
  horseById,
  investorReturnTab,
  investorReturnHorseFilter,
  showInvestorReturnHorseFilter,
  showInvestorReturnStatusFilter,
  investorReturnHorseOptions,
  setInvestorReturnTab,
  setInvestorReturnHorseFilter,
  setShowInvestorReturnHorseFilter,
  setShowInvestorReturnStatusFilter,
  formatNzdAmount,
  investorPayoutLoading,
  accumulatedInvestorReturnNzd,
}) => (
  <article className="surface-card rounded-xl">
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold text-slate-900">Investor Returns Register</h3>
      <p className="mt-1 text-sm text-slate-500">Only races that landed inside an active lease window appear in this register.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{filteredInvestorReturns.length} race events</span>
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700">{formatNzdAmount(accumulatedInvestorReturnNzd)} accumulated investor returns</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {investorReturnTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setInvestorReturnTab(tab.id);
              setShowInvestorReturnStatusFilter(false);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${investorReturnTab === tab.id ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {(investorReturnHorseFilter !== 'all' || investorReturnTab !== 'all') ? (
        <button
          type="button"
          onClick={() => {
            setInvestorReturnHorseFilter('all');
            setInvestorReturnTab('all');
            setShowInvestorReturnHorseFilter(false);
            setShowInvestorReturnStatusFilter(false);
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
            <th className="px-5 py-3 font-semibold">Date</th>
            <th className="relative px-5 py-3 font-semibold">
              <button type="button" onClick={() => { setShowInvestorReturnHorseFilter((prev) => !prev); setShowInvestorReturnStatusFilter(false); }} className="inline-flex items-center gap-1">
                Horse
                {investorReturnHorseFilter !== 'all' ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
              </button>
              {showInvestorReturnHorseFilter ? (
                <div className="absolute left-5 top-11 z-20 min-w-[220px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <button type="button" onClick={() => { setInvestorReturnHorseFilter('all'); setShowInvestorReturnHorseFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">All Horses</button>
                  {investorReturnHorseOptions.map((horse) => (
                    <button key={horse.id} type="button" onClick={() => { setInvestorReturnHorseFilter(horse.id); setShowInvestorReturnHorseFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">{horse.name}</button>
                  ))}
                </div>
              ) : null}
            </th>
            <th className="px-5 py-3 font-semibold">Race</th>
            <th className="px-5 py-3 font-semibold">Result</th>
            <th className="px-5 py-3 font-semibold">Stake</th>
            <th className="px-5 py-3 font-semibold">Lease</th>
            <th className="px-5 py-3 font-semibold">Per 1%</th>
            <th className="px-5 py-3 font-semibold">Per Token</th>
            <th className="relative px-5 py-3 font-semibold">
              <button type="button" onClick={() => setShowInvestorReturnStatusFilter((prev) => !prev)} className="inline-flex items-center gap-1">
                Status
                {investorReturnTab !== 'all' ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
              </button>
              {showInvestorReturnStatusFilter ? (
                <div className="absolute left-5 top-11 z-20 min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  {investorReturnTabs.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => { setInvestorReturnTab(tab.id); setShowInvestorReturnStatusFilter(false); }} className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-100">{tab.label}</button>
                  ))}
                </div>
              ) : null}
            </th>
            <th className="px-5 py-3 font-semibold">Investor Return</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {filteredInvestorReturns.map((event) => {
            const horse = horseById.get(event.horseId);
            return (
              <tr key={`${event.horseId}-${event.raceDate}-${event.raceName}`} className="border-t border-slate-100 hover:bg-slate-50/70">
                <td className="px-5 py-3 whitespace-nowrap text-slate-700">{event.raceDate}</td>
                <td className="px-5 py-3">
                  <a href={`#/horse/${encodeURIComponent(event.horseId)}`} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
                    {event.horseName}
                  </a>
                  {horse?.performance_profile_url ? (
                    <a href={horse.performance_profile_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-slate-500 hover:text-blue-700 hover:underline">
                      Open performance
                    </a>
                  ) : null}
                </td>
                <td className="px-5 py-3">
                  <a href={event.raceUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-800 hover:underline">
                    {event.raceName}
                  </a>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-slate-700">{event.result}</td>
                <td className="px-5 py-3 whitespace-nowrap text-slate-700">{event.sourceStakeNzd != null ? formatNzdAmount(event.sourceStakeNzd) : 'Source unavailable'}</td>
                <td className="px-5 py-3 whitespace-nowrap font-medium text-slate-900">{event.leaseId}</td>
                <td className="px-5 py-3 whitespace-nowrap text-slate-700">{formatNzdAmount(event.payoutPerOnePercentNzd, 3)}</td>
                <td className="px-5 py-3 whitespace-nowrap text-slate-700">{event.payoutPerTokenNzd != null ? formatNzdAmount(event.payoutPerTokenNzd, 3) : 'Source pending'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(event.status)}`}>{event.status}</span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap font-semibold text-slate-900">{formatNzdAmount(event.investorPayoutNzd, 3)}</td>
              </tr>
            );
          })}
          {!filteredInvestorReturns.length ? (
            <tr className="border-t border-slate-100">
              <td colSpan={10} className="px-5 py-6 text-sm text-slate-500">
                {investorPayoutLoading ? 'Loading investor return events...' : 'No investor return events match the current filters.'}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </article>
);

export default InvestorReturnsRoute;
