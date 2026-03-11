import React from 'react';
import { Activity, FileText } from 'lucide-react';

type ReferenceRouteProps = {
  route: 'documentsTemplates' | 'documentsGenerated' | 'complianceNewZealand' | 'complianceDubai' | 'complianceSsot' | 'complianceArchive';
  documents: Array<any>;
  horseById: Map<string, any>;
  docWebHref: (path: string) => string | null;
  archivedRecords: Array<any>;
  onRestoreArchivedRecord: (record: any) => void;
};

const ReferenceRoute: React.FC<ReferenceRouteProps> = ({ route, documents, horseById, docWebHref, archivedRecords, onRestoreArchivedRecord }) => {
  const nzComplianceLinks = [
    {
      title: 'Rules of Racing',
      href: 'https://nztr.co.nz/sites/nztrindustry/files/2025-08/Rules-of-Racing_Gender-Revision-2.pdf',
      description: 'New Zealand Thoroughbred Racing rules of racing PDF.',
    },
    {
      title: 'Bloodstock Syndication Code of Practice',
      href: 'https://loveracing.nz/OnHorseFiles/Syndication/BLOODSTOCK%20SYNDICATION%20CODE%20OF%20PRACTICE.pdf',
      description: 'LoveRacing New Zealand syndication code of practice PDF.',
    },
    {
      title: 'Financial Markets Conduct Act 2020',
      href: 'https://www.legislation.govt.nz/act/public/2020/28/en/latest/',
      description: 'Current New Zealand legislation text.',
    },
    {
      title: 'FMA Equine Bloodstock Exemptions',
      href: 'https://www.fma.govt.nz/business/legislation/secondary-legislation/exemptions/equine-bloodstock/',
      description: 'Financial Markets Authority exemption guidance for equine bloodstock.',
    },
  ];

  if (route === 'documentsTemplates') {
    return (
      <article className="surface-card rounded-xl p-5">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900">Templates</h3>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {['PDS', 'Syndicate Agreement', 'VARA Whitepaper (Horse Lease Reward)', 'HLT Issuance Termsheet'].map((name) => (
            <li key={name} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">{name}</li>
          ))}
        </ul>
      </article>
    );
  }

  if (route === 'documentsGenerated') {
    return (
      <article className="surface-card rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900">Generated Documents</h3>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {documents.map((doc) => (
            <li key={doc.document_id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="truncate font-medium text-slate-800">{doc.document_id} - {doc.source_reference}</p>
              <p className="mt-1 text-xs text-slate-600">{doc.document_type} - {doc.document_date} - {horseById.get(doc.horse_id)?.horse_name ?? doc.horse_id}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">{doc.notes || 'Generated'}</p>
              {docWebHref(doc.file_path) ? (
                <a href={docWebHref(doc.file_path) ?? '#'} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-blue-700 hover:underline">{doc.file_path}</a>
              ) : (
                <p className="mt-1 truncate text-xs text-slate-500">{doc.file_path}</p>
              )}
            </li>
          ))}
        </ul>
      </article>
    );
  }

  if (route === 'complianceNewZealand') {
    return (
      <article className="surface-card rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Compliance / Jurisdiction</p>
        <h3 className="mt-2 text-base font-semibold text-slate-900">New Zealand</h3>
        <p className="mt-2 text-sm text-slate-600">Hardwired reference set for NZTR racing, syndication, and financial markets compliance.</p>
        <div className="mt-4 space-y-3">
          {nzComplianceLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <p className="font-medium text-slate-900">{link.title}</p>
              <p className="mt-1 text-sm text-slate-600">{link.description}</p>
              <p className="mt-2 truncate text-xs font-medium text-blue-700">{link.href}</p>
            </a>
          ))}
        </div>
      </article>
    );
  }
  if (route === 'complianceDubai') {
    return (
      <article className="surface-card rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Compliance / Jurisdiction</p>
        <h3 className="mt-2 text-base font-semibold text-slate-900">Dubai</h3>
        <p className="mt-2 text-sm text-slate-600">Jurisdiction placeholder for Dubai racing and syndication compliance references.</p>
      </article>
    );
  }
  if (route === 'complianceSsot') {
    return <article className="surface-card rounded-xl p-5"><h3 className="text-base font-semibold text-slate-900">SSOT Profiles (Audit Trail)</h3><p className="mt-2 text-sm text-slate-600">Audit and change log view for profile lifecycle and verification events.</p></article>;
  }

  return (
    <article className="surface-card rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-900">Archived Profiles</h3>
      <p className="mt-2 text-sm text-slate-600">Records removed from the live registry are stored here with their archived payload so they can be restored.</p>
      <div className="mt-4 space-y-2">
        {archivedRecords.length ? archivedRecords.map((record) => (
          <div key={`${record.kind}-${record.id}-${record.archived_at}`} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{record.name} ({record.id})</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{record.kind}</p>
                <p className="text-xs text-slate-500">Archived: {record.archived_at}</p>
                <p className="text-xs text-slate-500">{record.details}</p>
                {record.asset_path ? <p className="text-xs text-slate-500">Asset path: {record.asset_path}</p> : null}
                {record.image_src ? <p className="truncate text-xs text-slate-500">Image source: {record.image_src}</p> : null}
                {!record.record ? <p className="text-xs text-amber-700">Legacy archive metadata only. Restore unavailable.</p> : null}
              </div>
              <button
                type="button"
                onClick={() => onRestoreArchivedRecord(record)}
                disabled={!record.record}
                className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Restore
              </button>
            </div>
          </div>
        )) : <p className="text-sm text-slate-500">No archived profiles yet.</p>}
      </div>
    </article>
  );
};

export default ReferenceRoute;
