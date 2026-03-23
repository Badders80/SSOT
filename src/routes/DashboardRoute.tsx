import React from 'react';
import { BadgeCheck, BriefcaseBusiness, Coins, Landmark, Link2 } from 'lucide-react';

type HorseLike = {
  horse_id: string;
  horse_name: string;
  sex: string;
  colour: string;
  identity_status: string;
};

type DashboardRouteProps = {
  allHorses: HorseLike[];
  allTrainers: Array<unknown>;
  allOwners: Array<unknown>;
  leaseCount: number;
  investorPayoutEvents: Array<{
    horseId: string;
    horseName: string;
    raceDate: string;
    raceDateIso: string;
    raceName: string;
    raceUrl: string;
    result: string;
    resultDetail: string;
    sourceStakeNzd: number | null;
    leaseId: string;
    investorPayoutNzd: number;
    payoutPerOnePercentNzd: number;
    payoutPerTokenNzd: number | null;
    status: string;
  }>;
  horseImageSrc: (horse: HorseLike) => string;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  href: string;
  icon: React.ReactNode;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, helper, href, icon }) => (
  <a href={href} className="surface-card flex h-full flex-col rounded-xl p-5 transition hover:-translate-y-0.5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className="rounded-lg bg-blue-50 p-2 text-blue-700">{icon}</div>
    </div>
    <p className="mt-3 text-xs text-slate-500">{helper}</p>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
    </div>
  </a>
);

const DashboardRoute: React.FC<DashboardRouteProps> = ({
  allHorses,
  allTrainers,
  allOwners,
  leaseCount,
  investorPayoutEvents,
  horseImageSrc,
}) => (
  <>
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Active Horses" value={String(allHorses.length)} helper="Open horse registry" href="#/horses" icon={<Landmark size={16} />} />
      <MetricCard label="Trainers/Stables" value={String(allTrainers.length)} helper="Open trainer register" href="#/trainers" icon={<BadgeCheck size={16} />} />
      <MetricCard label="Owners" value={String(allOwners.length)} helper="Open owner register" href="#/owners" icon={<BriefcaseBusiness size={16} />} />
      <MetricCard label="Active Leases" value={String(leaseCount)} helper="Open lease register" href="#/leases" icon={<Link2 size={16} />} />
      <MetricCard label="Investor Returns" value={String(investorPayoutEvents.length)} helper="Open investor returns register" href="#/investor-returns" icon={<Coins size={16} />} />
    </section>

    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {allHorses.map((horse) => (
        <a key={horse.horse_id} href={`#/horse/${encodeURIComponent(horse.horse_id)}`} className="block">
          <article className="surface-card overflow-hidden rounded-xl transition hover:-translate-y-0.5">
            <div className="h-44 bg-slate-100">
              <img src={horseImageSrc(horse)} alt={`${horse.horse_name} profile`} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-semibold tracking-tight text-slate-900">{horse.horse_name}</p>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{horse.horse_id}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{horse.sex} - {horse.colour} - {horse.identity_status}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-700">Open Full SSOT Profile</p>
            </div>
          </article>
        </a>
      ))}
    </section>
  </>
);

export default DashboardRoute;
