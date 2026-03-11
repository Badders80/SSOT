import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  ExternalLink,
  FileCheck2,
  Landmark,
  LayoutDashboard,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { buildHltDocxBlob, buildInvestorUpdateDocxBlob, downloadHltPdfFromHtml, downloadInvestorUpdatePdf } from './src/lib/lazyExports';

const DashboardRoute = lazy(() => import('./src/routes/DashboardRoute'));
const LeaseRoute = lazy(() => import('./src/routes/LeaseRoute'));
const ReferenceRoute = lazy(() => import('./src/routes/ReferenceRoute'));

type RouteKey =
  | 'dashboard'
  | 'horses'
  | 'horse'
  | 'trainers'
  | 'trainer'
  | 'owners'
  | 'owner'
  | 'governingBodies'
  | 'governingBody'
  | 'leases'
  | 'documentsTemplates'
  | 'documentsGenerated'
  | 'complianceNewZealand'
  | 'complianceDubai'
  | 'complianceSsot'
  | 'complianceArchive'
  | 'intake'
  | 'documents';

type HorseRecord = {
  horse_id: string;
  horse_name: string;
  country_code: string;
  foaling_date: string;
  sex: string;
  colour: string;
  sire: string;
  dam: string;
  nztr_life_number: string;
  microchip_number: string;
  trainer_id: string;
  owner_id: string;
  governing_body_code: string;
  breeding_url: string;
  performance_profile_url: string;
  horse_status: string;
  identity_status: string;
  source_primary: string;
  source_last_verified_at: string;
  source_notes: string;
};

type LeaseRecord = {
  lease_id: string;
  horse_id: string;
  start_date: string;
  end_date: string;
  duration_months: string;
  percent_leased: string;
  token_count: string;
  percent_per_token: string;
  monthly_lease_price_nzd: string;
  annual_lease_price_nzd: string;
  price_per_one_percent_nzd: string;
  token_price_nzd: string;
  total_issuance_value_nzd: string;
  investor_share_percent: string;
  owner_share_percent: string;
  platform_fee_percent: string;
  lease_status: string;
  created_at: string;
  notes: string;
};

type IntakeRecord = {
  intake_id: string;
  breeding_url: string;
  parse_status: string;
  parsed_horse_name: string;
};

type DocumentRecord = {
  document_id: string;
  lease_id?: string;
  horse_id: string;
  document_type: string;
  document_version: string;
  document_date: string;
  source_reference: string;
  file_path: string;
  is_current: string;
  notes: string;
};

type TrainerRecord = {
  trainer_id: string;
  trainer_name: string;
  stable_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  profile_status: string;
  notes: string;
  ai_profile?: string;
  social_links?: string[];
};

type OwnerRecord = {
  owner_id: string;
  owner_name: string;
  entity_type: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  profile_status: string;
  notes: string;
  ai_profile?: string;
  social_links?: string[];
};

type GoverningBodyRecord = {
  governing_body_code: string;
  governing_body_name: string;
  website: string;
  status: string;
  notes?: string;
};

type SeedPayload = {
  horses: HorseRecord[];
  leases: LeaseRecord[];
  intakeQueue: IntakeRecord[];
  documents: DocumentRecord[];
  trainers: TrainerRecord[];
  owners: OwnerRecord[];
  governingBodies: GoverningBodyRecord[];
  _meta: {
    generatedAt: string;
  };
};

type ArchivedRecord = {
  kind: 'horse' | 'trainer' | 'owner' | 'governing';
  id: string;
  name: string;
  archived_at: string;
  details: string;
  record?: HorseRecord | TrainerRecord | OwnerRecord | GoverningBodyRecord;
  image_src?: string;
  asset_path?: string;
};

type HLTRecord = {
  lease_id: string;
  token_name: string;
  erc20_identifier: string;
  submission_date: string;
  horse_id: string;
  horse_name: string;
  horse_country: string;
  horse_year: string;
  horse_microchip: string;
  trainer_id: string;
  trainer_name: string;
  stable_name: string;
  stable_location: string;
  owner_id: string;
  owner_name: string;
  governing_body_code: string;
  governing_body_name: string;
  lease_start_date: string;
  lease_length_months: number;
  lease_end_date: string;
  percentage_leased: number;
  owner_stakes_split: number;
  investor_stakes_split: number;
  num_tokens: number;
  token_price_nzd: number;
  percentage_price: number;
  total_issuance_value: number;
  variations: string;
  status: 'proposed' | 'active' | 'draft' | 'completed';
  document_filename: string;
};

type HLTDraft = {
  submissionDate: string;
  horseId: string;
  trainerId: string;
  ownerId: string;
  governingBodyCode: string;
  leaseStartDate: string;
  leaseLengthMonths: string;
  percentageLeased: string;
  ownerStakesSplit: string;
  numTokens: string;
  tokenPriceNzd: string;
  percentagePrice: string;
  variations: string;
  tokenName: string;
  erc20Identifier: string;
};

type InvestorUpdateType = 'standard' | 'quarterly';

type InvestorUpdateDraft = {
  template: InvestorUpdateType;
  horseId: string;
  headline: string;
  summary: string;
  body: string;
  asOfDate: string;
};

type SavedInvestorUpdate = {
  fileName: string;
  horseName: string;
  filePath: string;
  savedAt: string;
};

type RouteState = {
  route: RouteKey;
  entityId: string | null;
};

type PersistedLocalState = {
  seed: SeedPayload | null;
  customHorses: HorseRecord[];
  customTrainers: TrainerRecord[];
  customOwners: OwnerRecord[];
  customGoverningBodies: GoverningBodyRecord[];
  horseEdits: Record<string, HorseRecord>;
  trainerEdits: Record<string, TrainerRecord>;
  ownerEdits: Record<string, OwnerRecord>;
  governingEdits: Record<string, GoverningBodyRecord>;
  archivedRecords: ArchivedRecord[];
};

const LOCAL_STATE_KEY = 'ssot_local_state_v1';

const parseRoute = (hash: string): RouteState => {
  const clean = hash.replace(/^#\/?/, '').trim();
  const parts = clean.split('/').filter(Boolean);
  if (parts[0] === 'horse' && parts[1]) {
    return { route: 'horse', entityId: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'trainer' && parts[1]) {
    return { route: 'trainer', entityId: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'owner' && parts[1]) {
    return { route: 'owner', entityId: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'governing-body' && parts[1]) {
    return { route: 'governingBody', entityId: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'horses') return { route: 'horses', entityId: null };
  if (parts[0] === 'trainers') return { route: 'trainers', entityId: null };
  if (parts[0] === 'owners') return { route: 'owners', entityId: null };
  if (parts[0] === 'governing-bodies') return { route: 'governingBodies', entityId: null };
  if (parts[0] === 'leases') return { route: 'leases', entityId: null };
  if (parts[0] === 'documents' && parts[1] === 'templates') return { route: 'documentsTemplates', entityId: null };
  if (parts[0] === 'documents' && parts[1] === 'generated') return { route: 'documentsGenerated', entityId: null };
  if (parts[0] === 'compliance' && parts[1] === 'rules-of-racing') return { route: 'complianceNewZealand', entityId: null };
  if (parts[0] === 'compliance' && parts[1] === 'syndication-rules') return { route: 'complianceNewZealand', entityId: null };
  if (parts[0] === 'compliance' && parts[1] === 'jurisdiction' && parts[2] === 'new-zealand') return { route: 'complianceNewZealand', entityId: null };
  if (parts[0] === 'compliance' && parts[1] === 'jurisdiction' && parts[2] === 'dubai') return { route: 'complianceDubai', entityId: null };
  if (parts[0] === 'compliance' && parts[1] === 'ssot-profiles') return { route: 'complianceSsot', entityId: null };
  if (parts[0] === 'compliance' && parts[1] === 'archive') return { route: 'complianceArchive', entityId: null };
  if (parts[0] === 'intake') return { route: 'intake', entityId: null };
  if (parts[0] === 'documents') return { route: 'documents', entityId: null };
  return { route: 'dashboard', entityId: null };
};

const horseImageFor = (horse: HorseRecord): string => {
  if (horse.horse_id === 'HRS-001') return '/horse-images/first-gear.png';
  if (horse.horse_id === 'HRS-002') return '/horse-images/prudentia.png';
  return '/horse-images/silhouette.svg';
};

const titleCase = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const nzdFormatter = new Intl.NumberFormat('en-NZ', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatNzd = (value: string): string => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `NZD ${value}`;
  return `NZD ${nzdFormatter.format(amount)}`;
};

const leaseStatusBadgeClass = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized === 'proposed') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (normalized === 'draft') return 'border-slate-300 bg-slate-100 text-slate-700';
  if (normalized === 'completed') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
};

const isoToday = (): string => new Date().toISOString().slice(0, 10);

const parseNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractFoalingYear = (foalingDate: string): string => {
  if (!foalingDate) return '';
  const parts = foalingDate.split('-');
  return parts[0] ?? '';
};

const addMonthsIso = (dateIso: string, months: number): string => {
  if (!dateIso || !Number.isFinite(months) || months <= 0) return '';
  const base = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(base.getTime())) return '';
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
};

const buildSequence = (num: number): string => String(num).padStart(2, '0');

const generateErc20Identifier = (horseName: string, countryCode: string, sequenceNum: number): string => {
  const consonants = horseName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .filter((char) => !'AEIOU'.includes(char))
    .slice(0, 3)
    .join('')
    .padEnd(3, 'X');
  return `TVHLT${consonants}${countryCode.toUpperCase()}${buildSequence(sequenceNum)}`;
};

const nextLeaseId = (leases: LeaseRecord[]): string => {
  const max = leases.reduce((acc, lease) => {
    const parsed = Number.parseInt(lease.lease_id.replace('LSE-', ''), 10);
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);
  return `LSE-${String(max + 1).padStart(3, '0')}`;
};

const nextDocumentId = (documents: DocumentRecord[]): string => {
  const max = documents.reduce((acc, doc) => {
    const parsed = Number.parseInt(doc.document_id.replace('DOC-', ''), 10);
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);
  return `DOC-${String(max + 1).padStart(3, '0')}`;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const humanDate = (dateIso: string): string => {
  if (!dateIso) return '';
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formalDate = (dateIso: string): string => {
  if (!dateIso) return '';
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const month = date.toLocaleDateString('en-NZ', { month: 'long' });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

const monthYearUpper = (dateIso: string): string => {
  if (!dateIso) return '';
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' }).toUpperCase();
};

const compactDate = (dateIso: string): string => dateIso.replaceAll('-', '');

const docWebHref = (path: string): string | null => {
  if (!path) return null;
  if (path.startsWith('/horses/')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return null;
};

const INVESTOR_UPDATES_ROOT_LABEL = '/data/generated/investor_updates';

const slugSegment = (value: string): string =>
  value.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';

const horseUpdateFolderPath = (horseName: string, horseId: string): string =>
  `${INVESTOR_UPDATES_ROOT_LABEL}/${slugSegment(horseName)}_${slugSegment(horseId)}`;

const appendSourceNote = (base: string, note: string): string => {
  const trimmed = base.trim();
  if (!trimmed) return note;
  return trimmed.includes(note) ? trimmed : `${trimmed} | ${note}`;
};

const extractAssetPath = (sourceNotes: string): string => {
  const match = sourceNotes.match(/(?:^|\|\s*)asset_path:([^|]+)/i);
  return match?.[1]?.trim() ?? '';
};

const investorUpdateHtml = (input: {
  template: InvestorUpdateType;
  horseId: string;
  horseName: string;
  headline: string;
  summary: string;
  body: string;
  asOfDate: string;
}): string => {
  const title = `${input.headline || `${input.horseName} Investor Update`} (${input.asOfDate || isoToday()})`;
  const templateLabel = input.template === 'quarterly' ? 'Quarterly Investor Update' : 'Standard Investor Update';
  const bodyParagraphs = input.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; margin: 0; background: #f8fafc; }
    .page { max-width: 860px; margin: 0 auto; background: #fff; min-height: 100vh; padding: 42px 52px; box-sizing: border-box; }
    .meta { font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 10px 0 8px; font-size: 30px; line-height: 1.2; }
    .summary { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px 16px; margin-top: 14px; }
    .summary p { margin: 0; font-size: 15px; line-height: 1.6; }
    .content { margin-top: 20px; font-size: 16px; line-height: 1.75; }
    .content p { margin: 0 0 14px; }
  </style>
</head>
<body>
  <main class="page">
    <div class="meta">${escapeHtml(templateLabel)} · ${escapeHtml(input.horseName)} (${escapeHtml(input.horseId)}) · ${escapeHtml(input.asOfDate || isoToday())}</div>
    <h1>${escapeHtml(input.headline || `${input.horseName} Investor Update`)}</h1>
    <section class="summary"><p>${escapeHtml(input.summary || 'No summary provided.')}</p></section>
    <section class="content">
      ${bodyParagraphs || '<p>No body content provided.</p>'}
    </section>
  </main>
</body>
</html>`;
};

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const buildHltDocumentHtml = (record: HLTRecord): string => {
  const safeVariations = record.variations.trim() || 'n/a';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HLT Issuance - ${escapeHtml(record.token_name)}</title>
  <style>
    body {
      font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a2e;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    @media print {
      body { margin: 0; }
      .page { padding: 20mm 22mm; }
    }
    .page {
      max-width: 210mm;
      min-height: 270mm;
      margin: 0 auto;
      padding: 28mm 24mm 20mm 24mm;
      position: relative;
      box-sizing: border-box;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 10px;
      border-bottom: 1px solid #1a1a2e;
    }
    .doc-header .label {
      font-family: 'Courier New', monospace;
      font-size: 7.5pt;
      letter-spacing: 0.15em;
      color: #888;
      text-transform: uppercase;
    }
    .doc-header .doc-ref {
      font-family: 'Courier New', monospace;
      font-size: 7.5pt;
      color: #888;
      text-align: right;
    }
    .doc-title {
      font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      color: #1a1a2e;
      margin: 32px 0 8px 0;
      letter-spacing: 0.01em;
    }
    .title-rule {
      border: none;
      border-top: 1.5px solid #1a1a2e;
      margin: 4px auto 32px auto;
      width: 60%;
    }
    .item {
      display: flex;
      gap: 20px;
      margin-bottom: 14px;
      line-height: 1.55;
    }
    .item-num {
      font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a2e;
      min-width: 18px;
      padding-top: 0;
    }
    .item-content { flex: 1; }
    .item-label, .item-value {
      font-family: 'Manrope', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a2e;
    }
    .sub-items { margin-top: 6px; }
    .sub-item {
      display: flex;
      gap: 16px;
      margin-bottom: 6px;
      padding-left: 8px;
    }
    .sub-item-label {
      min-width: 28px;
      font-size: 11pt;
      color: #555;
    }
    .sub-item-content {
      font-size: 11pt;
      color: #1a1a2e;
      flex: 1;
    }
    .identifier {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      color: #1a1a2e;
      background: #f5f0e8;
      padding: 1px 6px;
      border-radius: 2px;
      letter-spacing: 0.05em;
    }
    .confidential {
      position: absolute;
      top: 14mm;
      right: 24mm;
      font-family: 'Courier New', monospace;
      font-size: 6.5pt;
      letter-spacing: 0.12em;
      color: #aaa;
      text-transform: uppercase;
      text-align: right;
      line-height: 1.6;
    }
    .doc-footer {
      position: absolute;
      bottom: 14mm;
      left: 24mm;
      right: 24mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e0ddd5;
      padding-top: 6px;
    }
    .footer-left {
      font-family: 'Courier New', monospace;
      font-size: 7pt;
      color: #aaa;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .footer-right {
      font-family: 'Courier New', monospace;
      font-size: 7pt;
      color: #aaa;
    }
    .footer-pages {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .page-num {
      font-size: 9pt;
      color: #888;
    }
    .page-sep {
      width: 32px;
      height: 1px;
      background: #aaa;
      display: inline-block;
      vertical-align: middle;
    }
  </style>
</head>
<body>
<div class="page">
  <div class="confidential">
    STRICTLY PRIVATE &amp; CONFIDENTIAL<br>
    ID: ${escapeHtml(record.erc20_identifier)}-${compactDate(record.submission_date)}
  </div>
  <div class="doc-header">
    <div class="label">Horse Lease Token &middot; New Issuance</div>
    <div class="doc-ref">
      EVOLUTION STABLES<br>
      ES-HLT &middot; ${monthYearUpper(record.submission_date)}
    </div>
  </div>
  <div class="doc-title">Horse Lease Token (&quot;HLT&quot;) New Issuance Details</div>
  <hr class="title-rule">
  <div class="item">
    <div class="item-num">1.</div>
    <div class="item-content">
      <span class="item-label">Issuance Submission Date:&nbsp;&nbsp;</span>
      <span class="item-value">${formalDate(record.submission_date)}</span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">2.</div>
    <div class="item-content">
      <span class="item-label">Token Name:&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(record.token_name)}</span><br>
      <span style="font-size:10pt;color:#555;margin-top:4px;display:block;">
        ERC20 blockchain identifier for this token will be:&nbsp;
        <span class="identifier">${escapeHtml(record.erc20_identifier)}</span>
      </span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">3.</div>
    <div class="item-content">
      <span class="item-label">Horse Microchip Number:&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(record.horse_microchip || 'n/a')}</span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">4.</div>
    <div class="item-content">
      <span class="item-label">Token Issuance Particulars:</span>
      <span style="font-size:10pt;color:#777;">&nbsp;(Priced in NZD to be converted to AED prior to issuance)</span>
      <div class="sub-items">
        <div class="sub-item">
          <div class="sub-item-label">a.</div>
          <div class="sub-item-content">Number of Tokens issued:-&nbsp;&nbsp;&nbsp;<strong>${record.num_tokens}</strong></div>
        </div>
        <div class="sub-item">
          <div class="sub-item-label">b.</div>
          <div class="sub-item-content">Token Price:-&nbsp;&nbsp;&nbsp;<strong>$${record.token_price_nzd.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        </div>
        <div class="sub-item">
          <div class="sub-item-label">c.</div>
          <div class="sub-item-content">Total Issuance Value:-&nbsp;&nbsp;&nbsp;<strong>$${record.total_issuance_value.toLocaleString('en-NZ')}</strong></div>
        </div>
      </div>
    </div>
  </div>
  <div class="item">
    <div class="item-num">5.</div>
    <div class="item-content">
      <span class="item-label">Horse(s):&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(record.horse_name)} (${escapeHtml(record.horse_country)}) ${escapeHtml(record.horse_year)}</span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">6.</div>
    <div class="item-content">
      <span class="item-label">Stable / Trainer:&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(record.trainer_name)}${record.stable_location ? `, ${escapeHtml(record.stable_location)}` : ''}</span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">7.</div>
    <div class="item-content">
      <span class="item-label">Horse Asset Lease/Owner:&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(record.owner_name)}</span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">8.</div>
    <div class="item-content">
      <span class="item-label">Governing Body:&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(record.governing_body_name)} (${escapeHtml(record.governing_body_code)})</span>
    </div>
  </div>
  <div class="item">
    <div class="item-num">9.</div>
    <div class="item-content">
      <span class="item-label">Product commercial details:</span>
      <div class="sub-items">
        <div class="sub-item">
          <div class="sub-item-label">a.</div>
          <div class="sub-item-content">
            <strong>HLT Lease period:</strong> ${record.lease_length_months} Months commencing ${humanDate(record.lease_start_date)}
          </div>
        </div>
        <div class="sub-item">
          <div class="sub-item-label">b.</div>
          <div class="sub-item-content">
            <strong>Stakes Split:</strong> Agreed split of race winnings between owner and investor.
            For this Issuance the split is ${record.owner_stakes_split}/${record.investor_stakes_split} in favour of the tokenholders.
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="item">
    <div class="item-num">10.</div>
    <div class="item-content">
      <span class="item-label">Variations:&nbsp;&nbsp;</span>
      <span class="item-value">${escapeHtml(safeVariations)}</span>
    </div>
  </div>
  <div class="doc-footer">
    <div class="footer-left">Strictly Private &amp; Confidential</div>
    <div class="footer-right">
      <div class="footer-pages">
        <span class="page-num">01</span>
        <span class="page-sep"></span>
        <span class="page-num">01</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
};

type ParsedBreedingLink = {
  sourceHorseId: string;
  horseName: string;
  countryCode: string;
  foalingYear: string | null;
};

type ScrapedHorseDetails = {
  horseName: string;
  countryCode: string;
  foalingDate: string;
  sex: string;
  colour: string;
  sire: string;
  dam: string;
  nztrLifeNumber: string;
  microchipNumber: string;
  performanceProfileUrl: string;
};

type RecentRaceRecord = {
  placing: string;
  date: string;
  raceName: string;
  raceUrl: string;
  distance: string;
  trackCondition: string;
};

const parseBreedingLink = (rawLink: string): ParsedBreedingLink | null => {
  try {
    const parsedUrl = new URL(rawLink.trim());
    const match = parsedUrl.pathname.match(/\/Breeding\/(\d+)\/([^/]+)\.aspx$/i);
    if (!match) return null;
    const sourceHorseId = match[1];
    const slug = decodeURIComponent(match[2]);
    const parts = slug.split('-').filter(Boolean);
    if (!parts.length) return null;
    const maybeYear = parts[parts.length - 1];
    const foalingYear = /^\d{4}$/.test(maybeYear) ? maybeYear : null;
    const maybeCountry = parts[parts.length - 2] ?? '';
    const countryCode = /^[A-Za-z]{2,3}$/.test(maybeCountry) ? maybeCountry.toUpperCase() : 'NZ';
    const namePartCount = foalingYear ? (countryCode === maybeCountry.toUpperCase() ? parts.length - 2 : parts.length - 1) : parts.length;
    const nameFromSlug = parts.slice(0, Math.max(1, namePartCount)).join(' ');
    return {
      sourceHorseId,
      horseName: titleCase(nameFromSlug.replace(/\s+/g, ' ').trim()),
      countryCode,
      foalingYear,
    };
  } catch {
    return null;
  }
};

const nextHorseId = (horses: HorseRecord[]): string => {
  const max = horses.reduce((acc, horse) => {
    const parsed = Number.parseInt(horse.horse_id.replace('HRS-', ''), 10);
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);
  return `HRS-${String(max + 1).padStart(3, '0')}`;
};

const nextEntityId = (values: string[], prefix: string): string => {
  const max = values.reduce((acc, id) => {
    const parsed = Number.parseInt(id.replace(`${prefix}-`, ''), 10);
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

const defaultTrainerImageById: Record<string, string> = {
  'TRN-001': 'https://dzpdbgwih7u1r.cloudfront.net/96a71343-70b1-41b0-a4d3-219a20d7bab8/9e88f1fa-50fa-4fa9-a77f-ddae53b38138/a12513a8-9bc6-4856-928a-eb689fd76158/w1200h800-c67ce5b5-b5f9-41e2-aca8-b08d49c45d27.jpeg',
  'TRN-002': 'https://images.mistable.com/wp-content/uploads/sites/68/2020/09/08013159/14-Hwasong-30-August.jpg',
};

const defaultOwnerImageById: Record<string, string> = {
  'OWN-001': 'https://static1.squarespace.com/static/68b3a55795fa0517264bfda3/t/68dc73042d7b3e0e5c4b9836/1759277833457/IMG_3251.jpeg?format=1500w',
  'OWN-002': 'https://images.mistable.com/wp-content/uploads/sites/68/2020/09/08013159/14-Hwasong-30-August.jpg',
};

const seededHorseIds = new Set(['HRS-001', 'HRS-002']);
const seededTrainerIds = new Set(['TRN-001', 'TRN-002']);
const seededOwnerIds = new Set(['OWN-001', 'OWN-002']);
const seededGoverningCodes = new Set(['NZTR', 'DRC']);

type RemoveTarget =
  | { kind: 'horse'; id: string; name: string; seeded: boolean }
  | { kind: 'trainer'; id: string; name: string; seeded: boolean }
  | { kind: 'owner'; id: string; name: string; seeded: boolean }
  | { kind: 'governing'; id: string; name: string; seeded: boolean };

const normalizeDateDDMMYYYY = (value: string): string => {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return 'unknown';
  const dd = match[1].padStart(2, '0');
  const mm = match[2].padStart(2, '0');
  const yyyy = match[3];
  return `${yyyy}-${mm}-${dd}`;
};

const normalizeLineageName = (value: string): string =>
  value
    .replace(/\s+\d{4}$/, '')
    .replace(/\s+/g, ' ')
    .trim();

const decodeHtmlText = (value: string): string => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&ndash;/g, '-')
  .replace(/&rsquo;/g, "'")
  .replace(/&#x27;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

const stripHtml = (value: string): string =>
  decodeHtmlText(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const extractText = (html: string, pattern: RegExp): string | null => {
  const match = html.match(pattern);
  if (!match?.[1]) return null;
  return stripHtml(match[1]);
};

const parseRecentRacesFromPerformanceHtml = (html: string): RecentRaceRecord[] => {
  const matches = Array.from(html.matchAll(/race-summary-cell">\s*<div[^>]*placing[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*col4[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/div>\s*<div[^>]*col2[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*col1[^>]*>([\s\S]*?)<\/div>/gi));
  return matches.slice(0, 3).map((match) => ({
    placing: stripHtml(match[1]),
    date: stripHtml(match[2]),
    raceUrl: match[3].startsWith('http') ? match[3] : `https://loveracing.nz${match[3]}`,
    raceName: stripHtml(match[4]),
    distance: stripHtml(match[5]),
    trackCondition: stripHtml(match[6]),
  })).filter((row) => row.raceName);
};

const scrapeHorseDetailsFromHtml = (html: string, fallback: ParsedBreedingLink): ScrapedHorseDetails | null => {
  const headingRaw = extractText(html, /<h2[^>]*class="[^"]*horse-name[^"]*"[^>]*>([\s\S]*?)<\/h2>/i);
  const bornRaw = extractText(html, /<li>\s*<strong>\s*Born:\s*<\/strong>\s*([^<]+)<\/li>/i)
    ?? extractText(html, /<strong>\s*Foaling date:\s*<\/strong>\s*([^<]+)</i);
  const microchipRaw = extractText(html, /<strong>\s*Microchip:\s*<\/strong>\s*([^<]+)</i);
  const lifeNoRaw = extractText(html, /<strong>\s*Life no:\s*<\/strong>\s*([^<]+)</i);
  const sireRaw = extractText(html, /<li>\s*<strong>\s*Sire:\s*<\/strong>\s*([\s\S]*?)<\/li>/i);
  const damRaw = extractText(html, /<li>\s*<strong>\s*Dam:\s*<\/strong>\s*([\s\S]*?)<\/li>/i);
  const colourSexRaw = extractText(html, /<li>\s*(?!<strong>)([A-Za-z]+\s+[A-Za-z]+)\s*<\/li>/i);
  const perfPathRaw = extractText(html, /id="linkStudbookHorsePerformanceProfile"[^>]*href="([^"]+)"/i);
  const perfPath = perfPathRaw ?? `/Common/SystemTemplates/Modal/EntryDetail.aspx?DisplayContext=Modal&HorseID=${fallback.sourceHorseId}`;
  const perfUrl = perfPath.startsWith('http') ? perfPath : `https://loveracing.nz${perfPath}`;

  if (!headingRaw && !bornRaw && !sireRaw && !damRaw && !microchipRaw && !lifeNoRaw) {
    return null;
  }

  const headingMatch = (headingRaw ?? '').match(/^(.+?)\s+\(([A-Za-z]{2,3})\)\s+\d{4}$/);
  const horseName = headingMatch ? titleCase(headingMatch[1].trim()) : fallback.horseName;
  const countryCode = headingMatch ? headingMatch[2].toUpperCase() : fallback.countryCode;

  let colour = 'Unknown';
  let sex = 'Unknown';
  if (colourSexRaw) {
    const parts = colourSexRaw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      colour = titleCase(parts[0]);
      sex = titleCase(parts.slice(1).join(' '));
    }
  }

  return {
    horseName,
    countryCode,
    foalingDate: bornRaw ? normalizeDateDDMMYYYY(bornRaw) : 'unknown',
    sex,
    colour,
    sire: sireRaw ? normalizeLineageName(sireRaw) : 'Unknown',
    dam: damRaw ? normalizeLineageName(damRaw) : 'Unknown',
    nztrLifeNumber: lifeNoRaw ?? `NZ${fallback.sourceHorseId.padStart(8, '0')}`,
    microchipNumber: microchipRaw ?? 'Unknown',
    performanceProfileUrl: perfUrl,
  };
};

const fetchScrapedHorseDetails = async (breedingLink: string, parsed: ParsedBreedingLink): Promise<ScrapedHorseDetails | null> => {
  const url = new URL(breedingLink);
  const proxyPath = `/__loveracing_proxy${url.pathname}${url.search}`;
  const response = await fetch(proxyPath, { cache: 'no-store' });
  if (!response.ok) return null;
  const html = await response.text();
  return scrapeHorseDetailsFromHtml(html, parsed);
};

const parseHorseImageFromHtml = (html: string, horseName: string): string | null => {
  const tags = html.match(/<img\b[^>]*>/gi) ?? [];
  const normalizedHorse = horseName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const horseTokens = normalizedHorse.split(' ').filter(Boolean);
  const hasHorseHint = (value: string): boolean => {
    const lower = value.toLowerCase();
    if (lower.includes('horse')) return true;
    return horseTokens.length > 0 && horseTokens.every((token) => lower.includes(token));
  };

  for (const tag of tags) {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? '';
    if (!src) continue;
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? '';
    if (!hasHorseHint(`${alt} ${src}`)) continue;
    try {
      return new URL(src, 'https://loveracing.nz').toString();
    } catch {
      continue;
    }
  }
  return null;
};

const fetchWebsiteOgImage = async (websiteUrl: string): Promise<string> => {
  if (!websiteUrl || websiteUrl === '#') return '';
  const candidateUrls = [
    websiteUrl,
    safeUrlJoin(websiteUrl, '/about') ?? '',
    safeUrlJoin(websiteUrl, '/about/') ?? '',
    safeUrlJoin(websiteUrl, '/contact') ?? '',
    safeUrlJoin(websiteUrl, '/contact/') ?? '',
  ].filter(Boolean);
  for (const candidateUrl of candidateUrls) {
    const html = await fetchUrlViaProxy(candidateUrl);
    if (!html) continue;
    const images = extractImageCandidates(html, candidateUrl);
    if (images[0]) return images[0];
  }
  return '';
};

type FieldState = {
  value: string;
  found: boolean;
  editing: boolean;
  confidence?: 'high' | 'inferred' | 'low';
};

type NameOption = {
  label: string;
  value: string;
  confidence: 'high' | 'inferred' | 'low';
};

type TrainerDraftProfile = {
  name: FieldState;
  stableName: FieldState;
  stableNameOptions: NameOption[];
  contactName: FieldState;
  phone: FieldState;
  email: FieldState;
  website: FieldState;
  facebook: FieldState;
  x: FieldState;
  instagram: FieldState;
  socialLinks: string[];
  imageUrl: FieldState;
  notes: string;
};

type OwnerDraftProfile = {
  name: FieldState;
  entityType: FieldState;
  contactName: FieldState;
  phone: FieldState;
  email: FieldState;
  website: FieldState;
  facebook: FieldState;
  x: FieldState;
  instagram: FieldState;
  socialLinks: string[];
  imageUrl: FieldState;
  notes: string;
};

type HorseDraftProfile = {
  horseId: string;
  horseName: FieldState;
  countryCode: FieldState;
  foalingDate: FieldState;
  sex: FieldState;
  colour: FieldState;
  sire: FieldState;
  dam: FieldState;
  nztrLifeNumber: FieldState;
  microchipNumber: FieldState;
  breedingUrl: string;
  performanceUrl: string;
  trainerId: string;
  ownerId: string;
  governingBodyCode: string;
  identityStatus: string;
  sourceNotes: string;
  imageUrl: string;
  imageFound: boolean;
  imageFile: File | null;
};

type GoverningBodyDraftProfile = {
  code: FieldState;
  name: FieldState;
  website: FieldState;
  status: FieldState;
  notes: string;
};

const fieldState = (value = '', found = false, confidence: 'high' | 'inferred' | 'low' = 'high'): FieldState => ({
  value,
  found,
  editing: !found,
  confidence,
});

const mergeField = (existing: FieldState, candidate: string): FieldState => {
  if (existing.value.trim()) return existing;
  if (!candidate.trim()) return existing;
  return { value: candidate.trim(), found: true, editing: false };
};

const toDraftField = (value: string, found: boolean): FieldState => ({
  value,
  found: Boolean(found && value.trim() && value !== 'Unknown' && value !== 'unknown'),
  editing: false,
  confidence: found ? 'high' : undefined,
});

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const extractMeta = (html: string, key: string): string | null => {
  const direct = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'));
  if (direct?.[1]) return direct[1].trim();
  const reverse = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'));
  if (reverse?.[1]) return reverse[1].trim();
  return null;
};

const extractTitleTag = (html: string): string =>
  normalizeWhitespace(extractText(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? '');

const extractAllEmails = (html: string): string[] => {
  const results = new Set<string>();
  const mailtos = html.match(/mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi) ?? [];
  mailtos.forEach((match) => {
    const email = match.replace(/^mailto:/i, '').trim();
    if (email) results.add(email);
  });
  const plain = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
  plain.forEach((email) => results.add(email.trim()));
  return Array.from(results);
};

const extractAllPhones = (html: string): string[] => {
  const results = new Set<string>();
  const matches = html.match(/(?:\+64[\s().-]?\d(?:[\s().-]?\d){6,10}|0(?:21|22|27|9|6|7)[\s().-]?\d(?:[\s().-]?\d){5,9})/g) ?? [];
  matches.forEach((value) => results.add(normalizeWhitespace(value)));
  const telMatches = html.match(/tel:([\d+\s().-]{6,})/gi) ?? [];
  telMatches.forEach((value) => {
    const cleaned = normalizeWhitespace(value.replace(/^tel:/i, ''));
    if (cleaned) results.add(cleaned);
  });
  return Array.from(results);
};

const extractAddressCandidate = (html: string): string => {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const normalized = normalizeWhitespace(text);
  const nzTowns = ['Feilding', 'Matamata', 'Cambridge', 'Pukekohe', 'Taupo', 'Hastings', 'Rotorua'];
  const townPattern = new RegExp(`\\b(${nzTowns.join('|')})\\b`, 'i');
  const townMatch = normalized.match(townPattern);
  if (townMatch?.index !== undefined) {
    const start = Math.max(0, townMatch.index - 80);
    const end = Math.min(normalized.length, townMatch.index + 120);
    const snippet = normalized.slice(start, end);
    if (/racing/i.test(snippet)) return snippet;
  }
  const match = normalized.match(/\b\d{1,4}\s+[A-Za-z0-9\s]{3,40}\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Way|Place|Pl)\b[^.]{0,80}/i);
  return match?.[0] ?? '';
};

const extractSocialLinks = (html: string): string[] => {
  const socialDomain = /(?:x\.com|twitter\.com|linkedin\.com|facebook\.com|instagram\.com)/i;
  const absolute = html.match(/https?:\/\/(?:www\.)?(?:x\.com|twitter\.com|linkedin\.com|facebook\.com|instagram\.com)\/[^"'\s<)]+/gi) ?? [];
  const hrefs = Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map((match) => match[1]);
  const hrefSocials = hrefs.filter((value) => socialDomain.test(value));
  const normalized = [...absolute, ...hrefSocials]
    .map((item) => item.replace(/&amp;/g, '&'))
    .map((item) => normalizeSocialLink(item))
    .filter(Boolean);
  return Array.from(new Set(normalized));
};

const isLikelyProfileSocialUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    const segments = parsed.pathname.split('/').filter(Boolean).map((seg) => seg.toLowerCase());
    if (!segments.length) return false;

    const blocked = new Set([
      'home', 'explore', 'i', 'messages', 'compose', 'privacy', 'tos', 'settings',
      'search', 'intent', 'share', 'hashtag', 'login', 'signup', 'about', 'help',
      'support', 'legal', 'business', 'articles', 'using-x', 'x-supported-browsers',
    ]);

    if (host === 'x.com' || host === 'twitter.com') {
      if (segments.length !== 1) return false;
      if (blocked.has(segments[0])) return false;
      return /^@?[a-z0-9_]{1,30}$/i.test(segments[0]);
    }

    if (host === 'instagram.com') {
      if (segments.length !== 1) return false;
      if (blocked.has(segments[0])) return false;
      return /^[a-z0-9._]{1,30}$/i.test(segments[0]);
    }

    if (host === 'facebook.com') {
      if (segments.length < 1 || segments.length > 2) return false;
      if (blocked.has(segments[0])) return false;
      return true;
    }

    if (host === 'linkedin.com') {
      if (!['in', 'company', 'school'].includes(segments[0])) return false;
      if (segments.length < 2) return false;
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const normalizeSocialLink = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (!/^https?:$/i.test(parsed.protocol)) return '';
    if (!isLikelyProfileSocialUrl(parsed.toString())) return '';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
};

const pickSocialLink = (links: string[], kind: 'facebook' | 'x' | 'instagram'): string => {
  const predicates: Record<'facebook' | 'x' | 'instagram', RegExp> = {
    facebook: /facebook\.com/i,
    x: /(?:x\.com|twitter\.com)/i,
    instagram: /instagram\.com/i,
  };
  return links.find((link) => predicates[kind].test(link)) ?? '';
};

const mergeSocialLinks = (base: string[], fields: { facebook?: string; x?: string; instagram?: string }): string[] => {
  const out = new Set<string>();
  base.forEach((link) => {
    const normalized = normalizeSocialLink(link);
    if (normalized) out.add(normalized);
  });
  [fields.facebook, fields.x, fields.instagram].forEach((value) => {
    const normalized = normalizeSocialLink(value ?? '');
    if (normalized) out.add(normalized);
  });
  return Array.from(out);
};

const getDisplaySocialLinks = (links?: string[]): string[] => {
  if (!links?.length) return [];
  const cleaned = links
    .map((link) => normalizeSocialLink(link))
    .filter(Boolean);
  return Array.from(new Set(cleaned));
};

const inferNameFromTitle = (raw: string): string =>
  normalizeWhitespace(raw.split('|')[0].split(' - ')[0].split(' / ')[0]);

const fetchUrlViaProxy = async (targetUrl: string): Promise<string | null> => {
  try {
    const proxied = `/__url_proxy?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxied, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
};

const isSocialUrl = (value: string): boolean => /(?:x\.com|twitter\.com|linkedin\.com|facebook\.com|instagram\.com)/i.test(value);

const extractXUsername = (value: string): string => {
  try {
    const parsed = new URL(value);
    if (!/(x\.com|twitter\.com)/i.test(parsed.hostname)) return '';
    const segment = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
    return segment.replace(/^@/, '').trim();
  } catch {
    return '';
  }
};

const cleanNameFromUsername = (username: string): string =>
  username
    .replace(/[_-]+/g, ' ')
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .trim();

const parseXDisplayName = (raw: string): string => {
  const normalized = normalizeWhitespace(raw);
  const stripped = normalized
    .replace(/\(@[^)]+\)/g, '')
    .replace(/\/\s*X$/i, '')
    .replace(/\|\s*X.*$/i, '')
    .trim();
  return inferNameFromTitle(stripped);
};

const normalizeWebsiteCandidate = (value: string): string => {
  const trimmed = value.trim().replace(/[),.;]+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return '';
};

const extractWebsiteCandidates = (value: string): string[] => {
  const out = new Set<string>();
  const matches = value.match(/(?:https?:\/\/[^\s<>"']+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s<>"']*)?)/gi) ?? [];
  for (const raw of matches) {
    const normalized = normalizeWebsiteCandidate(raw);
    if (normalized) out.add(normalized);
  }
  return Array.from(out);
};

const isSearchLikeUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return /\/search\b/i.test(parsed.pathname) || parsed.searchParams.has('q');
  } catch {
    return false;
  }
};

const isLikelyPrimaryWebsite = (value: string): boolean => {
  if (!value || isSocialUrl(value) || isSearchLikeUrl(value)) return false;
  try {
    const parsed = new URL(value);
    const blockedHosts = ['races.nz', 'loveracing.nz', 'nztr.co.nz'];
    return !blockedHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};

const extractPersonNameFromText = (value: string): string => {
  const paren = value.match(/\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\)/);
  if (paren?.[1]) return paren[1];
  const label = value.match(/\b(?:contact|trainer|owner)\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i);
  return label?.[1] ?? '';
};

const resolveImageCandidate = (value: string, baseUrl: string): string => {
  const cleaned = value.trim().replace(/&amp;/g, '&');
  if (!cleaned) return '';
  try {
    const resolved = new URL(cleaned, baseUrl).toString();
    if (!/^https?:\/\//i.test(resolved)) return '';
    if (/\.(svg|ico)(\?|$)/i.test(resolved)) return '';
    if (/sprite|icon|favicon/i.test(resolved)) return '';
    return resolved;
  } catch {
    return '';
  }
};

const extractImageCandidates = (html: string, pageUrl: string): string[] => {
  const out = new Set<string>();
  const metaCandidates = [
    extractMeta(html, 'og:image') ?? '',
    extractMeta(html, 'twitter:image') ?? '',
    extractMeta(html, 'og:image:secure_url') ?? '',
    extractMeta(html, 'twitter:image:src') ?? '',
  ];
  for (const candidate of metaCandidates) {
    const resolved = resolveImageCandidate(candidate, pageUrl);
    if (resolved) out.add(resolved);
  }

  const imgSrcMatches = Array.from(html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)).map((m) => m[1]);
  for (const src of imgSrcMatches) {
    const resolved = resolveImageCandidate(src, pageUrl);
    if (!resolved) continue;
    out.add(resolved);
  }
  return Array.from(out);
};

const deriveContactPerson = (existingName: string, email: string, contextText: string): string => {
  const fromContext = extractPersonNameFromText(contextText);
  if (fromContext) return fromContext;
  const normalizedExisting = normalizeWhitespace(existingName);
  if (!email.includes('@')) return normalizedExisting;
  const localPart = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const tokens = localPart.split(/[._-]+/).filter(Boolean);
  if (!tokens.length) return normalizedExisting;
  const first = tokens[0];
  if (!first || first.length < 3) return normalizedExisting;
  const capFirst = first[0].toUpperCase() + first.slice(1);
  const nameTokens = normalizedExisting.split(/\s+/).filter(Boolean);
  const meaningfulTokens = nameTokens.filter((token) => !/^(racing|stable|stables|lodge|stud|club|limited|ltd|company)$/i.test(token));
  if (meaningfulTokens.length > 0) {
    return `${capFirst} ${meaningfulTokens[meaningfulTokens.length - 1]}`;
  }
  const emailDomain = email.split('@')[1]?.toLowerCase() ?? '';
  const domainBase = emailDomain.split('.')[0]?.replace(/[^a-z]/g, '') ?? '';
  const family = domainBase.replace(/(racing|stables|stable|stud|lodge|club|limited|ltd|company)$/i, '');
  if (family.length >= 3) return `${capFirst} ${family[0].toUpperCase()}${family.slice(1)}`;
  return capFirst;
};

const fetchXSyndicationProfile = async (username: string): Promise<{
  name: string;
  description: string;
  profileImage: string;
  website: string;
} | null> => {
  if (!username) return null;
  const endpoint = `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${encodeURIComponent(username)}`;
  const raw = await fetchUrlViaProxy(endpoint);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Array<{
      name?: string;
      description?: string;
      profile_image_url_https?: string;
      profile_image_url?: string;
      url?: string;
    }>;
    const row = parsed?.[0];
    if (!row) return null;
    const websiteCandidate = normalizeWebsiteCandidate(row.url ?? '') || '';
    return {
      name: normalizeWhitespace(row.name ?? ''),
      description: normalizeWhitespace(row.description ?? ''),
      profileImage: (row.profile_image_url_https || row.profile_image_url || '').replace('_normal', '_400x400'),
      website: websiteCandidate,
    };
  } catch {
    return null;
  }
};

const safeUrlJoin = (baseUrl: string, path: string): string | null => {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return null;
  }
};

const summarizePageText = (html: string): string => {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');
  return normalizeWhitespace(stripped).slice(0, 1200);
};

const generateAiProfile = async (payload: {
  entityType: 'trainer' | 'owner';
  entityName: string;
  stableName: string;
  website: string;
  socialLinks: string[];
  notes: string;
  otherContext: string;
  limitedContext: boolean;
}): Promise<string> => {
  let response = await fetch('/__glm_profile', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    response = await fetch('/__groq_profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  if (!response.ok) {
    response = await fetch('/__anthropic_profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  if (!response.ok) throw new Error('Failed to generate AI profile');
  const json = await response.json() as { text?: string };
  return (json.text ?? '').trim();
};

const enrichProfileFromUrls = async (urls: string[]): Promise<{
  name: string;
  stableName: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  socialLinks: string[];
  notesCandidate: string;
  context: string;
  limitedContext: boolean;
  nameConfidence: 'high' | 'inferred' | 'low';
  stableNameConfidence: 'high' | 'inferred' | 'low';
  stableNameOptions: NameOption[];
}> => {
  let name = '';
  let stableName = '';
  let contactPerson = '';
  let phone = '';
  let email = '';
  let website = '';
  let imageUrl = '';
  let notesCandidate = '';
  let nameConfidence: 'high' | 'inferred' | 'low' = 'high';
  let stableNameConfidence: 'high' | 'inferred' | 'low' = 'high';
  const socials = new Set<string>();
  const pageContexts: string[] = [];
  const stableNameOptions = new Map<string, NameOption>();
  const normalizedUrls = Array.from(new Set(urls.map((value) => value.trim()).filter(Boolean)));
  const queued = [...normalizedUrls];
  const visited = new Set<string>();

  const pushStableNameOption = (option: NameOption) => {
    const clean = normalizeWhitespace(option.value);
    if (!clean) return;
    if (!stableNameOptions.has(clean.toLowerCase())) {
      stableNameOptions.set(clean.toLowerCase(), { ...option, value: clean });
    }
  };

  const secondaryLookupUrls = (displayOrUsername: string): string[] => {
    const q = encodeURIComponent(`${displayOrUsername} racing NZ`);
    return [
      `https://www.races.nz/search?q=${q}`,
      `https://loveracing.nz/search?q=${q}`,
      `https://www.nztr.co.nz/search/?q=${q}`,
    ];
  };

  const guessWebsiteUrlsFromUsername = (username: string): string[] => {
    const compact = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!compact || compact.length < 4) return [];
    return [
      `https://${compact}.co.nz`,
      `https://${compact}.nz`,
      `https://${compact}.com`,
      `https://${compact}.com.au`,
    ];
  };

  const setWebsiteCandidate = (candidate: string) => {
    const normalized = normalizeWebsiteCandidate(candidate);
    if (!normalized) return;
    if (!website) {
      website = normalized;
      return;
    }
    if (isLikelyPrimaryWebsite(normalized) && !isLikelyPrimaryWebsite(website)) {
      website = normalized;
    }
  };

  const collectFromUrl = async (url: string) => {
    if (visited.has(url)) return;
    visited.add(url);
    const html = await fetchUrlViaProxy(url);
    if (!html) return;
    if (!isSocialUrl(url) && isLikelyPrimaryWebsite(url)) setWebsiteCandidate(url);
    const ogTitle = extractMeta(html, 'og:title') ?? '';
    const twitterTitle = extractMeta(html, 'twitter:title') ?? '';
    const ogDescription = extractMeta(html, 'og:description') ?? '';
    const twitterDescription = extractMeta(html, 'twitter:description') ?? '';
    const pageTitle = extractTitleTag(html);
    const pageSummary = summarizePageText(html);
    const pageEmails = extractAllEmails(html);
    const pagePhones = extractAllPhones(html);
    const address = extractAddressCandidate(html);
    const imageCandidates = extractImageCandidates(html, url);
    const pageSocials = extractSocialLinks(html);

    const metaName = inferNameFromTitle(ogTitle || twitterTitle || pageTitle);
    const xDisplayName = /(?:x\.com|twitter\.com)/i.test(url) ? parseXDisplayName(ogTitle || twitterTitle || pageTitle) : '';
    const inferredFromTitle = xDisplayName || metaName;
    if (!name && inferredFromTitle && !/evolution ssot/i.test(inferredFromTitle)) {
      name = inferredFromTitle;
      nameConfidence = 'high';
    }
    if (!stableName && inferredFromTitle && !/evolution ssot/i.test(inferredFromTitle)) {
      stableName = inferredFromTitle;
      stableNameConfidence = /(?:x\.com|twitter\.com)/i.test(url) ? 'inferred' : 'high';
    }
    if (xDisplayName) {
      pushStableNameOption({ label: 'Display name', value: xDisplayName, confidence: 'inferred' });
    }
    if (!email && pageEmails[0]) email = pageEmails[0];
    if (!phone && pagePhones[0]) phone = pagePhones[0];
    if (!imageUrl && imageCandidates[0]) imageUrl = imageCandidates[0];
    pageSocials.forEach((link) => socials.add(link));
    if (isSocialUrl(url)) socials.add(url);
    if (!imageUrl) {
      const xLike = pageSocials.find((link) => /(?:x\.com|twitter\.com)/i.test(link));
      if (xLike) {
        const username = extractXUsername(xLike);
        const xProfile = await fetchXSyndicationProfile(username);
        if (xProfile?.profileImage) imageUrl = xProfile.profileImage;
      }
    }
    const description = ogDescription || twitterDescription;
    if (!notesCandidate && description) notesCandidate = description;
    if (!website && description) {
      const descSites = extractWebsiteCandidates(description);
      if (descSites[0]) setWebsiteCandidate(descSites[0]);
    }
    if (!website) {
      const summarySites = extractWebsiteCandidates(pageSummary);
      if (summarySites[0]) setWebsiteCandidate(summarySites[0]);
    }

    // pull contact/location hints out of meta description when available
    if (description) {
      const metaEmails = description.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
      const metaPhones = description.match(/(?:\+64[\s().-]?\d(?:[\s().-]?\d){6,10}|0(?:21|22|27|9|6|7)[\s().-]?\d(?:[\s().-]?\d){5,9})/g) ?? [];
      if (!email && metaEmails[0]) email = metaEmails[0];
      if (!phone && metaPhones[0]) phone = normalizeWhitespace(metaPhones[0]);
      const stableMatch = description.match(/\b([A-Z][A-Za-z0-9'&\-\s]{2,60}(?:Racing|Stables?|Stud|Lodge))\b/);
      if (!stableName && stableMatch?.[1]) {
        stableName = normalizeWhitespace(stableMatch[1]);
        stableNameConfidence = 'inferred';
      }
      const person = extractPersonNameFromText(description);
      if (person && (!name || nameConfidence === 'low')) {
        name = person;
        nameConfidence = 'inferred';
      }
      if (!contactPerson && person) contactPerson = person;
      const locationMatch = description.match(/\b(Feilding|Matamata|Cambridge|Pukekohe|Taupo|Hastings|Rotorua)\b/i);
      if (locationMatch) {
        notesCandidate = notesCandidate
          ? `${notesCandidate} | Location hint: ${locationMatch[1]}`
          : `Location hint: ${locationMatch[1]}`;
      }
    }

    const extraSignals: string[] = [];
    if (address) extraSignals.push(`Address candidate: ${address}`);
    if (pagePhones.length) extraSignals.push(`Phones found: ${pagePhones.join(', ')}`);
    if (pageEmails.length) extraSignals.push(`Emails found: ${pageEmails.join(', ')}`);
    const stableMatches = pageSummary.match(/\b([A-Z][A-Za-z0-9'&\-\s]{2,60}(?:Racing|Stables?|Stud|Lodge))\b/g) ?? [];
    if (!stableName && stableMatches[0]) {
      stableName = normalizeWhitespace(stableMatches[0]);
      stableNameConfidence = 'inferred';
    }
    stableMatches.slice(0, 3).forEach((candidate) => {
      pushStableNameOption({ label: 'Inferred', value: candidate, confidence: 'inferred' });
    });
    pageContexts.push([
      `URL: ${url}`,
      ogTitle ? `OG Title: ${ogTitle}` : '',
      twitterTitle ? `Twitter Title: ${twitterTitle}` : '',
      ogDescription ? `OG Description: ${ogDescription}` : '',
      twitterDescription ? `Twitter Description: ${twitterDescription}` : '',
      imageCandidates.length ? `Image candidates: ${imageCandidates.slice(0, 5).join(', ')}` : '',
      pageSummary ? `Body Summary: ${pageSummary}` : '',
      ...extraSignals,
    ].filter(Boolean).join('\n'));
  };

  for (const url of queued) {
    const username = extractXUsername(url);
    if (username) {
      const usernameName = cleanNameFromUsername(username);
      if (!name) {
        name = usernameName;
        nameConfidence = 'low';
      }
      pushStableNameOption({ label: 'Username', value: usernameName, confidence: 'low' });

      const xProfile = await fetchXSyndicationProfile(username);
      if (xProfile) {
        if (xProfile.name) {
          pushStableNameOption({ label: 'Display name', value: xProfile.name, confidence: 'inferred' });
          if (!stableName) {
            stableName = xProfile.name;
            stableNameConfidence = 'inferred';
          }
        }
      if (xProfile.description) {
        if (!notesCandidate) notesCandidate = xProfile.description;
        const person = extractPersonNameFromText(xProfile.description);
        if (person) {
          name = person;
          nameConfidence = 'inferred';
          if (!contactPerson) contactPerson = person;
        }
        const sites = extractWebsiteCandidates(xProfile.description);
        if (sites[0]) setWebsiteCandidate(sites[0]);
      }
      if (xProfile.website) setWebsiteCandidate(xProfile.website);
      if (!imageUrl && xProfile.profileImage) imageUrl = xProfile.profileImage;
      }

      for (const guessedWebsite of guessWebsiteUrlsFromUsername(username)) {
        const html = await fetchUrlViaProxy(guessedWebsite);
        if (!html) continue;
        if (/404|not found|page not found/i.test(html.slice(0, 2000))) continue;
        setWebsiteCandidate(guessedWebsite);
        await collectFromUrl(guessedWebsite);
        break;
      }

      const cleaned = cleanNameFromUsername(username);
      for (const lookupUrl of secondaryLookupUrls(cleaned)) {
        await collectFromUrl(lookupUrl);
      }
    }
    await collectFromUrl(url);
    if (!isSocialUrl(url)) {
      const aboutUrl = safeUrlJoin(url, '/about');
      const aboutSlashUrl = safeUrlJoin(url, '/about/');
      const contactUrl = safeUrlJoin(url, '/contact');
      const contactSlashUrl = safeUrlJoin(url, '/contact/');
      if (aboutUrl) await collectFromUrl(aboutUrl);
      if (aboutSlashUrl) await collectFromUrl(aboutSlashUrl);
      if (contactUrl) await collectFromUrl(contactUrl);
      if (contactSlashUrl) await collectFromUrl(contactSlashUrl);
    }
  }

  if (!stableName && name) {
    stableName = name;
    stableNameConfidence = nameConfidence === 'low' ? 'low' : 'inferred';
  }
  if (stableName) {
    pushStableNameOption({
      label: stableNameConfidence === 'low' ? 'Username' : stableNameConfidence === 'inferred' ? 'Display name' : 'Primary source',
      value: stableName,
      confidence: stableNameConfidence,
    });
  }
  if (!imageUrl && website) {
    imageUrl = await fetchWebsiteOgImage(website);
  }

  const context = pageContexts.join('\n\n').slice(0, 16000);
  const limitedContext = context.length < 200;
  if (!contactPerson) {
    contactPerson = deriveContactPerson(name || stableName, email, `${notesCandidate}\n${context}`);
  }
  return {
    name,
    stableName,
    contactPerson,
    phone,
    email,
    website,
    imageUrl,
    socialLinks: Array.from(socials),
    notesCandidate,
    context,
    limitedContext,
    nameConfidence,
    stableNameConfidence,
    stableNameOptions: Array.from(stableNameOptions.values()),
  };
};

const RouteLoadingFallback: React.FC = () => (
  <article className="surface-card rounded-xl p-5 text-sm text-slate-500">Loading view...</article>
);

const FieldReviewRow: React.FC<{
  label: string;
  field: FieldState;
  onChange: (next: FieldState) => void;
  type?: string;
}> = ({ label, field, onChange, type = 'text' }) => {
  const status = field.found && field.value.trim() ? 'found' : field.value.trim() ? 'manual' : 'missing';
  const badgeClass = status === 'found'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : status === 'manual'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  const badgeText = status === 'found' ? 'FOUND' : status === 'manual' ? 'manually entered' : 'NOT FOUND';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badgeClass}`}>{badgeText}</span>
      </div>
      {field.editing || status === 'missing' ? (
        <input
          type={type}
          value={field.value}
          onChange={(event) => onChange({ ...field, value: event.target.value })}
          placeholder="Add manually"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      ) : (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-700">{field.value || '—'}</p>
          <button
            type="button"
            onClick={() => onChange({ ...field, editing: true })}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

const InlineEditableField: React.FC<{
  label: string;
  field: FieldState;
  onChange: (next: FieldState) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, field, onChange, placeholder = 'Not found — add manually', type = 'text' }) => {
  const commit = () => onChange({ ...field, editing: false });
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {field.found && field.value.trim() && field.confidence === 'low' ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">LOW CONFIDENCE</span>
        ) : null}
        {field.found && field.value.trim() && field.confidence === 'inferred' ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">FOUND inferred</span>
        ) : null}
        {field.found && field.value.trim() && field.confidence !== 'low' && field.confidence !== 'inferred' ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">FOUND</span>
        ) : null}
      </div>
      {field.editing ? (
        <input
          type={type}
          value={field.value}
          onChange={(event) => onChange({ ...field, value: event.target.value })}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }
          }}
          autoFocus
          placeholder={placeholder}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      ) : (
        <button
          type="button"
          onClick={() => onChange({ ...field, editing: true })}
          className="mt-2 w-full rounded-md border border-dashed border-slate-300 px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400"
        >
          {field.value.trim() || placeholder}
        </button>
      )}
    </div>
  );
};

const CarouselDots: React.FC<{ count: number; active: number }> = ({ count, active }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: count }).map((_, index) => (
      <span
        key={index}
        className={`h-2.5 w-2.5 rounded-full ${index === active ? 'bg-blue-600' : 'bg-slate-300'}`}
      />
    ))}
  </div>
);

const fallbackAiProfile = (entityName: string, kind: 'trainer' | 'owner'): string => {
  const safeName = entityName.trim() || (kind === 'trainer' ? 'This stable' : 'This ownership entity');
  if (kind === 'trainer') return `${safeName} is a New Zealand racing trainer/stable profile currently being validated from verified source fields. Confirmed identity and operating details are available, while deeper performance proof will be included only as verified evidence is captured.`;
  return `${safeName} is a New Zealand racing owner profile currently being validated from verified source fields. Confirmed identity and operating details are available, while deeper performance proof will be included only as verified evidence is captured.`;
};

const splitIntoSentences = (value: string): string[] => {
  const compact = normalizeWhitespace(value.replace(/\n+/g, ' ').trim());
  if (!compact) return [];
  const normalized = compact
    .replace(/https?:\/\/\S+/gi, ' URL ')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, ' EMAIL ')
    .replace(/\b(?:co|com|org|net|gov|nz)\./gi, (match) => match.replace('.', ''));
  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const enforceInvestorProfileShape = (raw: string, entityName: string, kind: 'trainer' | 'owner'): string => {
  const fallbackSentences = splitIntoSentences(fallbackAiProfile(entityName, kind));
  const generatedSentences = splitIntoSentences(raw);

  if (!generatedSentences.length) return fallbackSentences.slice(0, 2).join(' ');
  if (generatedSentences.length === 1) {
    const second = fallbackSentences[1] ?? 'This profile remains relevant to investors as verified details are progressively expanded.';
    return `${generatedSentences[0]} ${second}`.trim();
  }
  if (generatedSentences.length > 3) return generatedSentences.slice(0, 3).join(' ');
  return generatedSentences.join(' ');
};

const App: React.FC = () => {
  const [seed, setSeed] = useState<SeedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeState, setRouteState] = useState<RouteState>(() => parseRoute(window.location.hash));
  const [isComplianceJurisdictionOpen, setIsComplianceJurisdictionOpen] = useState(() => {
    const initialRoute = parseRoute(window.location.hash).route;
    return initialRoute === 'complianceNewZealand' || initialRoute === 'complianceDubai';
  });
  const [customHorses, setCustomHorses] = useState<HorseRecord[]>([]);
  const [customTrainers, setCustomTrainers] = useState<TrainerRecord[]>([]);
  const [customOwners, setCustomOwners] = useState<OwnerRecord[]>([]);
  const [customGoverningBodies, setCustomGoverningBodies] = useState<GoverningBodyRecord[]>([]);
  const [horseEdits, setHorseEdits] = useState<Record<string, HorseRecord>>({});
  const [trainerEdits, setTrainerEdits] = useState<Record<string, TrainerRecord>>({});
  const [ownerEdits, setOwnerEdits] = useState<Record<string, OwnerRecord>>({});
  const [governingEdits, setGoverningEdits] = useState<Record<string, GoverningBodyRecord>>({});
  const [horseImageOverrides, setHorseImageOverrides] = useState<Record<string, string>>({});
  const [trainerImageOverrides, setTrainerImageOverrides] = useState<Record<string, string>>({});
  const [ownerImageOverrides, setOwnerImageOverrides] = useState<Record<string, string>>({});
  const [removalTarget, setRemovalTarget] = useState<RemoveTarget | null>(null);
  const [governingExpandedCode, setGoverningExpandedCode] = useState<string | null>(null);
  const [showAddHorseForm, setShowAddHorseForm] = useState(false);
  const [showAddTrainerForm, setShowAddTrainerForm] = useState(false);
  const [showAddOwnerForm, setShowAddOwnerForm] = useState(false);
  const [showAddGoverningForm, setShowAddGoverningForm] = useState(false);
  const [showRemovePickerKind, setShowRemovePickerKind] = useState<RemoveTarget['kind'] | null>(null);
  const [removeCandidateId, setRemoveCandidateId] = useState('');
  const [archivedRecords, setArchivedRecords] = useState<ArchivedRecord[]>([]);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [recentRacesByHorseId, setRecentRacesByHorseId] = useState<Record<string, RecentRaceRecord[]>>({});
  const [recentRaceLoadingHorseId, setRecentRaceLoadingHorseId] = useState<string | null>(null);
  const [editingHorseId, setEditingHorseId] = useState<string | null>(null);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [editingGoverningCode, setEditingGoverningCode] = useState<string | null>(null);
  const [horseEditDraft, setHorseEditDraft] = useState<HorseRecord | null>(null);
  const [trainerEditDraft, setTrainerEditDraft] = useState<TrainerRecord | null>(null);
  const [ownerEditDraft, setOwnerEditDraft] = useState<OwnerRecord | null>(null);
  const [governingEditDraft, setGoverningEditDraft] = useState<GoverningBodyRecord | null>(null);
  const [expandedTrainerId, setExpandedTrainerId] = useState<string | null>(null);
  const [expandedOwnerId, setExpandedOwnerId] = useState<string | null>(null);
  const [newHorseLink, setNewHorseLink] = useState('');
  const [manualHorseOverride, setManualHorseOverride] = useState(false);
  const [manualHorseInput, setManualHorseInput] = useState({
    horseName: '',
    countryCode: 'NZ',
    foalingYear: '',
    microchip: '',
  });
  const [newHorseImage, setNewHorseImage] = useState<File | null>(null);
  const [newHorseImageName, setNewHorseImageName] = useState('');
  const [addHorseError, setAddHorseError] = useState<string | null>(null);
  const [isAddingHorse, setIsAddingHorse] = useState(false);
  const [leaseTab, setLeaseTab] = useState<'active' | 'proposed' | 'draft' | 'completed'>('active');
  const [leaseHorseFilter, setLeaseHorseFilter] = useState<string>('all');
  const [leaseStatusFilter, setLeaseStatusFilter] = useState<'all' | 'active' | 'proposed' | 'draft' | 'completed'>('all');
  const [showLeaseHorseFilter, setShowLeaseHorseFilter] = useState(false);
  const [showLeaseStatusFilter, setShowLeaseStatusFilter] = useState(false);
  const [showHltWizard, setShowHltWizard] = useState(false);
  const [hltStep, setHltStep] = useState(1);
  const [hltError, setHltError] = useState<string | null>(null);
  const [hltNotice, setHltNotice] = useState<string | null>(null);
  const [hltGoverningOverride, setHltGoverningOverride] = useState(false);
  const [hltDraft, setHltDraft] = useState<HLTDraft>({
    submissionDate: isoToday(),
    horseId: '',
    trainerId: '',
    ownerId: '',
    governingBodyCode: '',
    leaseStartDate: '',
    leaseLengthMonths: '',
    percentageLeased: '',
    ownerStakesSplit: '',
    numTokens: '',
    tokenPriceNzd: '',
    percentagePrice: '',
    variations: 'n/a',
    tokenName: '',
    erc20Identifier: '',
  });

  const [trainerInput, setTrainerInput] = useState({
    name: '',
    websiteUrl: '',
    socialUrl: '',
    anyUrl: '',
  });
  const [ownerInput, setOwnerInput] = useState({
    name: '',
    websiteUrl: '',
    socialUrl: '',
    anyUrl: '',
  });
  const [trainerDraft, setTrainerDraft] = useState<TrainerDraftProfile | null>(null);
  const [ownerDraft, setOwnerDraft] = useState<OwnerDraftProfile | null>(null);
  const [showTrainerReviewModal, setShowTrainerReviewModal] = useState(false);
  const [showOwnerReviewModal, setShowOwnerReviewModal] = useState(false);
  const [showHorseReviewModal, setShowHorseReviewModal] = useState(false);
  const [showGoverningReviewModal, setShowGoverningReviewModal] = useState(false);
  const [isBuildingTrainerDraft, setIsBuildingTrainerDraft] = useState(false);
  const [isBuildingOwnerDraft, setIsBuildingOwnerDraft] = useState(false);
  const [trainerDraftImageFile, setTrainerDraftImageFile] = useState<File | null>(null);
  const [ownerDraftImageFile, setOwnerDraftImageFile] = useState<File | null>(null);
  const [horseDraft, setHorseDraft] = useState<HorseDraftProfile | null>(null);
  const [governingDraft, setGoverningDraft] = useState<GoverningBodyDraftProfile | null>(null);
  const [trainerReviewPanel, setTrainerReviewPanel] = useState(0);
  const [ownerReviewPanel, setOwnerReviewPanel] = useState(0);
  const [horseReviewPanel, setHorseReviewPanel] = useState(0);
  const [governingReviewPanel, setGoverningReviewPanel] = useState(0);
  const [addTrainerError, setAddTrainerError] = useState<string | null>(null);
  const [addOwnerError, setAddOwnerError] = useState<string | null>(null);

  const [newGoverningBody, setNewGoverningBody] = useState({
    code: '',
    name: '',
    website: '',
    status: 'active',
  });
  const [addGoverningError, setAddGoverningError] = useState<string | null>(null);
  const [showInvestorUpdateBuilder, setShowInvestorUpdateBuilder] = useState(false);
  const [isSavingInvestorUpdate, setIsSavingInvestorUpdate] = useState(false);
  const [investorUpdateError, setInvestorUpdateError] = useState<string | null>(null);
  const [investorUpdateNotice, setInvestorUpdateNotice] = useState<string | null>(null);
  const [savedInvestorUpdates, setSavedInvestorUpdates] = useState<SavedInvestorUpdate[]>([]);
  const [downloadFormat, setDownloadFormat] = useState<'html' | 'docx' | 'pdf'>('html');
  const [investorUpdateDraft, setInvestorUpdateDraft] = useState<InvestorUpdateDraft>({
    template: 'standard',
    horseId: 'HRS-001',
    headline: 'Investor Update',
    summary: '',
    body: '',
    asOfDate: isoToday(),
  });

  useEffect(() => {
    const onHashChange = () => setRouteState(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (routeState.route === 'complianceNewZealand' || routeState.route === 'complianceDubai') {
      setIsComplianceJurisdictionOpen(true);
    }
  }, [routeState.route]);

  useEffect(() => {
    const load = async () => {
      let persisted: PersistedLocalState | null = null;
      try {
        const raw = window.localStorage.getItem(LOCAL_STATE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedLocalState;
          if (parsed && typeof parsed === 'object') {
            persisted = parsed;
          }
        }
      } catch {
        window.localStorage.removeItem(LOCAL_STATE_KEY);
      }

      let latestSeed: SeedPayload | null = null;
      try {
        const res = await fetch('/intake/v0.1/seed.json', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load seed.json (${res.status})`);
        }
        const json = await res.json();
        latestSeed = json as SeedPayload;
      } catch (err) {
        if (!persisted?.seed) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      }

      if (persisted) {
        setSeed(latestSeed ?? persisted.seed ?? null);
        setCustomHorses(persisted.customHorses ?? []);
        setCustomTrainers(persisted.customTrainers ?? []);
        setCustomOwners(persisted.customOwners ?? []);
        setCustomGoverningBodies(persisted.customGoverningBodies ?? []);
        setHorseEdits(persisted.horseEdits ?? {});
        setTrainerEdits(persisted.trainerEdits ?? {});
        setOwnerEdits(persisted.ownerEdits ?? {});
        setGoverningEdits(persisted.governingEdits ?? {});
        setArchivedRecords(persisted.archivedRecords ?? []);
        if (latestSeed) {
          setError(null);
        }
        return;
      }

      if (latestSeed) {
        setSeed(latestSeed);
        setError(null);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!seed) return;
    const payload: PersistedLocalState = {
      seed,
      customHorses,
      customTrainers,
      customOwners,
      customGoverningBodies,
      horseEdits,
      trainerEdits,
      ownerEdits,
      governingEdits,
      archivedRecords,
    };
    try {
      window.localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write errors (quota/private mode)
    }
  }, [
    seed,
    customHorses,
    customTrainers,
    customOwners,
    customGoverningBodies,
    horseEdits,
    trainerEdits,
    ownerEdits,
    governingEdits,
    archivedRecords,
  ]);

  useEffect(() => {
    if (!hltNotice) return;
    const timer = window.setTimeout(() => setHltNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [hltNotice]);

  useEffect(() => {
    if (!investorUpdateNotice) return;
    const timer = window.setTimeout(() => setInvestorUpdateNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [investorUpdateNotice]);

  const allHorses = useMemo(
    () => ([...(seed?.horses ?? []), ...customHorses]).map((horse) => horseEdits[horse.horse_id] ?? horse),
    [seed, customHorses, horseEdits],
  );
  useEffect(() => {
    if (!allHorses.length) return;
    if (allHorses.some((horse) => horse.horse_id === investorUpdateDraft.horseId)) return;
    setInvestorUpdateDraft((prev) => ({ ...prev, horseId: allHorses[0].horse_id }));
  }, [allHorses, investorUpdateDraft.horseId]);

  const allTrainers = useMemo(
    () => ([...(seed?.trainers ?? []), ...customTrainers]).map((trainer) => trainerEdits[trainer.trainer_id] ?? trainer),
    [seed, customTrainers, trainerEdits],
  );
  const allOwners = useMemo(() => {
    const trainerById = new Map<string, TrainerRecord>();
    allTrainers.forEach((trainer) => {
      trainerById.set(trainer.trainer_id, trainer);
    });

    return ([...(seed?.owners ?? []), ...customOwners]).map((owner) => {
      const next = ownerEdits[owner.owner_id] ?? owner;
      if (next.owner_id !== 'OWN-002') return next;
      const matchedTrainer = trainerById.get('TRN-002');
      if (!matchedTrainer) return next;

      return {
        ...next,
        owner_name: matchedTrainer.trainer_name,
        contact_name: matchedTrainer.contact_name,
        phone: matchedTrainer.phone,
        email: matchedTrainer.email,
        website: matchedTrainer.website,
        profile_status: matchedTrainer.profile_status,
        notes: matchedTrainer.notes,
      };
    });
  }, [seed, customOwners, ownerEdits, allTrainers]);
  const allGoverningBodies = useMemo(() => {
    const base = [...(seed?.governingBodies ?? []), ...customGoverningBodies];
    const byCode = new Map<string, GoverningBodyRecord>(
      base.map((row) => [row.governing_body_code, governingEdits[row.governing_body_code] ?? row]),
    );
    if (!byCode.has('NZTR')) {
      byCode.set('NZTR', {
        governing_body_code: 'NZTR',
        governing_body_name: 'New Zealand Thoroughbred Racing',
        website: 'https://www.nztr.co.nz',
        status: 'active',
      });
    }
    if (!byCode.has('DRC')) {
      byCode.set('DRC', {
        governing_body_code: 'DRC',
        governing_body_name: 'Dubai Racing Club',
        website: 'https://www.dubairacingclub.com',
        status: 'active',
      });
    }
    Object.values(governingEdits as Record<string, GoverningBodyRecord>).forEach((row) => byCode.set(row.governing_body_code, row));
    return Array.from(byCode.values());
  }, [seed, customGoverningBodies, governingEdits]);

  const horseById = useMemo(() => {
    const map = new Map<string, HorseRecord>();
    allHorses.forEach((horse) => map.set(horse.horse_id, horse));
    return map;
  }, [allHorses]);

  const trainerById = useMemo(() => {
    const map = new Map<string, TrainerRecord>();
    allTrainers.forEach((trainer) => map.set(trainer.trainer_id, trainer));
    return map;
  }, [allTrainers]);

  const ownerById = useMemo(() => {
    const map = new Map<string, OwnerRecord>();
    allOwners.forEach((owner) => map.set(owner.owner_id, owner));
    return map;
  }, [allOwners]);

  const governingBodyByCode = useMemo(() => {
    const map = new Map<string, GoverningBodyRecord>();
    allGoverningBodies.forEach((body) => map.set(body.governing_body_code, body));
    return map;
  }, [allGoverningBodies]);

  const selectedHorse = routeState.route === 'horse' && routeState.entityId ? horseById.get(routeState.entityId) ?? null : null;
  const selectedTrainer = routeState.route === 'trainer' && routeState.entityId ? trainerById.get(routeState.entityId) ?? null : null;
  const selectedOwner = routeState.route === 'owner' && routeState.entityId ? ownerById.get(routeState.entityId) ?? null : null;
  const selectedGoverningBody = routeState.route === 'governingBody' && routeState.entityId ? governingBodyByCode.get(routeState.entityId) ?? null : null;
  const selectedHorseTrainer = selectedHorse ? trainerById.get(selectedHorse.trainer_id) ?? null : null;
  const selectedHorseOwner = selectedHorse ? ownerById.get(selectedHorse.owner_id) ?? null : null;
  const selectedHorseGoverningBody = selectedHorse ? governingBodyByCode.get(selectedHorse.governing_body_code) ?? null : null;
  const removableHorses = useMemo(() => allHorses.filter((horse) => !seededHorseIds.has(horse.horse_id)), [allHorses]);
  const removableTrainers = useMemo(() => allTrainers.filter((trainer) => !seededTrainerIds.has(trainer.trainer_id)), [allTrainers]);
  const removableOwners = useMemo(() => allOwners.filter((owner) => !seededOwnerIds.has(owner.owner_id)), [allOwners]);
  const removableGoverningBodies = useMemo(
    () => allGoverningBodies.filter((body) => !seededGoverningCodes.has(body.governing_body_code)),
    [allGoverningBodies],
  );
  const selectedHorseLeases = selectedHorse
    ? (seed?.leases ?? []).filter((lease) => lease.horse_id === selectedHorse.horse_id)
    : [];
  const selectedHorseDocs = selectedHorse
    ? (seed?.documents ?? []).filter((doc) => doc.horse_id === selectedHorse.horse_id)
    : [];
  const selectedHorseIntake = selectedHorse
    ? (seed?.intakeQueue ?? []).filter((row) => row.parsed_horse_name === selectedHorse.horse_name)
    : [];
  const selectedHorseRecentRaces = selectedHorse ? (recentRacesByHorseId[selectedHorse.horse_id] ?? []) : [];
  const selectedHorseRecentRacesLoading = selectedHorse ? recentRaceLoadingHorseId === selectedHorse.horse_id : false;

  useEffect(() => {
    const horseId = selectedHorse?.horse_id ?? '';
    const performanceUrl = selectedHorse?.performance_profile_url ?? '';
    if (!horseId || !performanceUrl) return;
    if (Object.prototype.hasOwnProperty.call(recentRacesByHorseId, horseId)) return;

    let cancelled = false;
    setRecentRaceLoadingHorseId(horseId);

    const loadRecentRaces = async () => {
      const html = await fetchUrlViaProxy(performanceUrl);
      const nextRows = html ? parseRecentRacesFromPerformanceHtml(html) : [];
      if (cancelled) return;
      setRecentRacesByHorseId((prev) => ({ ...prev, [horseId]: nextRows }));
      setRecentRaceLoadingHorseId((prev) => (prev === horseId ? null : prev));
    };

    void loadRecentRaces();
    return () => {
      cancelled = true;
      setRecentRaceLoadingHorseId((prev) => (prev === horseId ? null : prev));
    };
  }, [selectedHorse?.horse_id, selectedHorse?.performance_profile_url, recentRacesByHorseId]);

  const selectedTrainerHorses = selectedTrainer
    ? allHorses.filter((horse) => horse.trainer_id === selectedTrainer.trainer_id)
    : [];
  const selectedOwnerHorses = selectedOwner
    ? allHorses.filter((horse) => horse.owner_id === selectedOwner.owner_id)
    : [];
  const selectedGoverningHorses = selectedGoverningBody
    ? allHorses.filter((horse) => horse.governing_body_code === selectedGoverningBody.governing_body_code)
    : [];
  const selectedTrainerHorseIds = new Set(selectedTrainerHorses.map((horse) => horse.horse_id));
  const selectedOwnerHorseIds = new Set(selectedOwnerHorses.map((horse) => horse.horse_id));
  const selectedGoverningHorseIds = new Set(selectedGoverningHorses.map((horse) => horse.horse_id));
  const selectedTrainerLeases = (seed?.leases ?? []).filter((lease) => selectedTrainerHorseIds.has(lease.horse_id));
  const selectedOwnerLeases = (seed?.leases ?? []).filter((lease) => selectedOwnerHorseIds.has(lease.horse_id));
  const selectedGoverningLeases = (seed?.leases ?? []).filter((lease) => selectedGoverningHorseIds.has(lease.horse_id));
  const selectedTrainerDocs = (seed?.documents ?? []).filter((doc) => selectedTrainerHorseIds.has(doc.horse_id));
  const selectedOwnerDocs = (seed?.documents ?? []).filter((doc) => selectedOwnerHorseIds.has(doc.horse_id));
  const selectedGoverningDocs = (seed?.documents ?? []).filter((doc) => selectedGoverningHorseIds.has(doc.horse_id));

  const stats = useMemo(() => {
    if (!seed) return { parsedCount: 0, totalIssuance: 0, issuedIssuance: 0, proposedIssuance: 0, potentialIssuance: 0 };
    const issuedIssuance = seed.leases
      .filter((lease) => {
        const status = lease.lease_status.toLowerCase();
        return status === 'active' || status === 'completed';
      })
      .reduce((sum, lease) => sum + Number(lease.total_issuance_value_nzd || 0), 0);
    const proposedIssuance = seed.leases
      .filter((lease) => lease.lease_status.toLowerCase() === 'proposed')
      .reduce((sum, lease) => sum + Number(lease.total_issuance_value_nzd || 0), 0);
    return {
      parsedCount: seed.intakeQueue.filter((row) => row.parse_status === 'parsed').length,
      totalIssuance: seed.leases.reduce((sum, lease) => sum + Number(lease.total_issuance_value_nzd || 0), 0),
      issuedIssuance,
      proposedIssuance,
      potentialIssuance: issuedIssuance + proposedIssuance,
    };
  }, [seed]);

  const leaseHorseOptions = useMemo(() => {
    const ids = Array.from(new Set((seed?.leases ?? []).map((lease) => lease.horse_id)));
    return ids
      .map((id) => horseById.get(id))
      .filter((horse): horse is HorseRecord => Boolean(horse))
      .map((horse) => ({ id: horse.horse_id, name: horse.horse_name }));
  }, [seed, horseById]);

  const filteredLeases = useMemo(() => {
    return (seed?.leases ?? []).filter((lease) => {
      const horseMatch = leaseHorseFilter === 'all' || lease.horse_id === leaseHorseFilter;
      const statusValue = lease.lease_status.toLowerCase() as 'active' | 'proposed' | 'draft' | 'completed';
      const statusMatch = leaseStatusFilter === 'all' ? true : statusValue === leaseStatusFilter;
      return horseMatch && statusMatch;
    });
  }, [seed, leaseHorseFilter, leaseStatusFilter]);
  const hltHorse = hltDraft.horseId ? horseById.get(hltDraft.horseId) ?? null : null;
  const hltTrainer = hltDraft.trainerId ? trainerById.get(hltDraft.trainerId) ?? null : null;
  const hltOwner = hltDraft.ownerId ? ownerById.get(hltDraft.ownerId) ?? null : null;
  const hltGoverningBody = hltDraft.governingBodyCode ? governingBodyByCode.get(hltDraft.governingBodyCode) ?? null : null;
  const hltOwnerSplitRaw = hltDraft.ownerStakesSplit.trim();
  const hltInvestorSplit = hltOwnerSplitRaw === '' ? 0 : Math.max(0, 100 - parseNumber(hltDraft.ownerStakesSplit));
  const hltInvestorInputValue = hltOwnerSplitRaw === '' ? '' : String(Number(hltInvestorSplit.toFixed(4)));
  const hltLeaseEndDate = addMonthsIso(hltDraft.leaseStartDate, parseNumber(hltDraft.leaseLengthMonths));
  const hltTokenPriceValue = parseNumber(hltDraft.tokenPriceNzd);
  const hltNumTokensValue = parseNumber(hltDraft.numTokens);
  const hltPercentLeasedValue = parseNumber(hltDraft.percentageLeased);
  const hltLeaseLengthMonthsValue = parseNumber(hltDraft.leaseLengthMonths);
  const hltPricePerOnePercentMonth = parseNumber(hltDraft.percentagePrice);
  const hltPercentPerToken = hltNumTokensValue > 0 ? hltPercentLeasedValue / hltNumTokensValue : 0;
  const hltTotalIssuanceValue = (hltTokenPriceValue > 0 && hltNumTokensValue > 0)
    ? hltTokenPriceValue * hltNumTokensValue
    : hltPricePerOnePercentMonth * hltPercentLeasedValue * hltLeaseLengthMonthsValue;
  const hltPreviewRecord: HLTRecord | null = hltHorse && hltTrainer && hltOwner && hltGoverningBody
    ? {
      lease_id: nextLeaseId(seed?.leases ?? []),
      token_name: hltDraft.tokenName,
      erc20_identifier: hltDraft.erc20Identifier,
      submission_date: hltDraft.submissionDate,
      horse_id: hltHorse.horse_id,
      horse_name: hltHorse.horse_name,
      horse_country: hltHorse.country_code,
      horse_year: extractFoalingYear(hltHorse.foaling_date),
      horse_microchip: hltHorse.microchip_number,
      trainer_id: hltTrainer.trainer_id,
      trainer_name: hltTrainer.trainer_name,
      stable_name: hltTrainer.stable_name,
      stable_location: hltTrainer.notes || '',
      owner_id: hltOwner.owner_id,
      owner_name: hltOwner.owner_name,
      governing_body_code: hltGoverningBody.governing_body_code,
      governing_body_name: hltGoverningBody.governing_body_name,
      lease_start_date: hltDraft.leaseStartDate,
      lease_length_months: parseNumber(hltDraft.leaseLengthMonths),
      lease_end_date: hltLeaseEndDate,
      percentage_leased: parseNumber(hltDraft.percentageLeased),
      owner_stakes_split: parseNumber(hltDraft.ownerStakesSplit),
      investor_stakes_split: hltInvestorSplit,
      num_tokens: hltNumTokensValue,
      token_price_nzd: hltTokenPriceValue,
      percentage_price: hltPricePerOnePercentMonth,
      total_issuance_value: hltTotalIssuanceValue,
      variations: hltDraft.variations,
      status: 'proposed',
      document_filename: '',
    }
    : null;

  useEffect(() => {
    if (!hltHorse) return;
    const sequence = (seed?.leases ?? []).filter((lease) => lease.horse_id === hltHorse.horse_id).length + 1;
    const tokenName = `HLT - ${hltHorse.horse_name} ${hltHorse.country_code}${buildSequence(sequence)}`;
    const erc20Identifier = generateErc20Identifier(hltHorse.horse_name, hltHorse.country_code, sequence);
    setHltDraft((prev) => ({
      ...prev,
      governingBodyCode: hltGoverningOverride ? (prev.governingBodyCode || hltHorse.governing_body_code) : hltHorse.governing_body_code,
      tokenName,
      erc20Identifier,
    }));
  }, [hltHorse, seed, hltGoverningOverride]);

  const horseImageSrc = (horse: HorseRecord): string => horseImageOverrides[horse.horse_id] ?? horseImageFor(horse);
  const trainerImageSrc = (trainer: TrainerRecord): string => trainerImageOverrides[trainer.trainer_id] ?? defaultTrainerImageById[trainer.trainer_id] ?? 'https://images.mistable.com/wp-content/uploads/sites/68/2024/08/04224751/Asset-15.png';
  const ownerImageSrc = (owner: OwnerRecord): string => ownerImageOverrides[owner.owner_id] ?? defaultOwnerImageById[owner.owner_id] ?? 'https://images.squarespace-cdn.com/content/v1/68b3a55795fa0517264bfda3/1759202045687-N27AF4EL23U8QK3MPZQM/IMG_0618.jpeg?format=750w';

  const saveHorseUpdate = () => {
    if (!horseEditDraft) return;
    setHorseEdits((prev) => ({ ...prev, [horseEditDraft.horse_id]: horseEditDraft }));
    setEditingHorseId(null);
    setHorseEditDraft(null);
  };

  const saveTrainerUpdate = () => {
    if (!trainerEditDraft) return;
    setTrainerEdits((prev) => ({ ...prev, [trainerEditDraft.trainer_id]: trainerEditDraft }));
    setEditingTrainerId(null);
    setTrainerEditDraft(null);
  };

  const saveOwnerUpdate = () => {
    if (!ownerEditDraft) return;
    setOwnerEdits((prev) => ({ ...prev, [ownerEditDraft.owner_id]: ownerEditDraft }));
    setEditingOwnerId(null);
    setOwnerEditDraft(null);
  };

  const saveGoverningUpdate = () => {
    if (!governingEditDraft) return;
    const oldCode = editingGoverningCode;
    const newCode = governingEditDraft.governing_body_code.trim().toUpperCase();
    if (!newCode) return;
    const nextRow = { ...governingEditDraft, governing_body_code: newCode };

    if (oldCode && oldCode !== newCode) {
      setCustomGoverningBodies((prev) => prev.filter((row) => row.governing_body_code !== oldCode));
      setGoverningEdits((prev) => {
        const cloned = { ...prev };
        delete cloned[oldCode];
        cloned[newCode] = nextRow;
        return cloned;
      });
    } else {
      setGoverningEdits((prev) => ({ ...prev, [newCode]: nextRow }));
    }
    setEditingGoverningCode(null);
    setGoverningEditDraft(null);
  };

  const confirmRemoveTarget = () => {
    if (!removalTarget || removalTarget.seeded) {
      setRemovalTarget(null);
      return;
    }
    const archivedAt = new Date().toISOString();
    if (removalTarget.kind === 'horse') {
      const horse = allHorses.find((row) => row.horse_id === removalTarget.id);
      if (horse) {
        setArchivedRecords((prev) => [{
          kind: 'horse',
          id: horse.horse_id,
          name: horse.horse_name,
          archived_at: archivedAt,
          details: `${horse.sex} ? ${horse.colour}`,
          record: horse,
          image_src: horseImageOverrides[horse.horse_id] ?? '',
          asset_path: extractAssetPath(horse.source_notes),
        }, ...prev]);
      }
      setCustomHorses((prev) => prev.filter((row) => row.horse_id !== removalTarget.id));
      setHorseEdits((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
      setHorseImageOverrides((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
    } else if (removalTarget.kind === 'trainer') {
      const trainer = allTrainers.find((row) => row.trainer_id === removalTarget.id);
      if (trainer) {
        setArchivedRecords((prev) => [{
          kind: 'trainer',
          id: trainer.trainer_id,
          name: trainer.trainer_name,
          archived_at: archivedAt,
          details: trainer.stable_name,
          record: trainer,
          image_src: trainerImageOverrides[trainer.trainer_id] ?? '',
        }, ...prev]);
      }
      setCustomTrainers((prev) => prev.filter((row) => row.trainer_id !== removalTarget.id));
      setTrainerEdits((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
      setTrainerImageOverrides((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
    } else if (removalTarget.kind === 'owner') {
      const owner = allOwners.find((row) => row.owner_id === removalTarget.id);
      if (owner) {
        setArchivedRecords((prev) => [{
          kind: 'owner',
          id: owner.owner_id,
          name: owner.owner_name,
          archived_at: archivedAt,
          details: owner.website,
          record: owner,
          image_src: ownerImageOverrides[owner.owner_id] ?? '',
        }, ...prev]);
      }
      setCustomOwners((prev) => prev.filter((row) => row.owner_id !== removalTarget.id));
      setOwnerEdits((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
      setOwnerImageOverrides((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
    } else {
      const body = allGoverningBodies.find((row) => row.governing_body_code === removalTarget.id);
      if (body) {
        setArchivedRecords((prev) => [{
          kind: 'governing',
          id: body.governing_body_code,
          name: body.governing_body_name,
          archived_at: archivedAt,
          details: body.status,
          record: body,
        }, ...prev]);
      }
      setCustomGoverningBodies((prev) => prev.filter((row) => row.governing_body_code !== removalTarget.id));
      setGoverningEdits((prev) => {
        const cloned = { ...prev };
        delete cloned[removalTarget.id];
        return cloned;
      });
    }
    setArchiveNotice('This profile has been removed from the live registry and archived.');
    setRemovalTarget(null);
  };

  const restoreArchivedRecord = (archivedRecord: ArchivedRecord) => {
    if (!archivedRecord.record) {
      setArchiveNotice('This archive entry is legacy metadata only and cannot be restored automatically.');
      return;
    }

    if (archivedRecord.kind === 'horse') {
      const horse = archivedRecord.record as HorseRecord;
      setCustomHorses((prev) => [...prev.filter((row) => row.horse_id !== horse.horse_id), horse]);
      if (archivedRecord.image_src) {
        setHorseImageOverrides((prev) => ({ ...prev, [horse.horse_id]: archivedRecord.image_src as string }));
      }
    } else if (archivedRecord.kind === 'trainer') {
      const trainer = archivedRecord.record as TrainerRecord;
      setCustomTrainers((prev) => [...prev.filter((row) => row.trainer_id !== trainer.trainer_id), trainer]);
      if (archivedRecord.image_src) {
        setTrainerImageOverrides((prev) => ({ ...prev, [trainer.trainer_id]: archivedRecord.image_src as string }));
      }
    } else if (archivedRecord.kind === 'owner') {
      const owner = archivedRecord.record as OwnerRecord;
      setCustomOwners((prev) => [...prev.filter((row) => row.owner_id !== owner.owner_id), owner]);
      if (archivedRecord.image_src) {
        setOwnerImageOverrides((prev) => ({ ...prev, [owner.owner_id]: archivedRecord.image_src as string }));
      }
    } else {
      const body = archivedRecord.record as GoverningBodyRecord;
      setCustomGoverningBodies((prev) => [...prev.filter((row) => row.governing_body_code !== body.governing_body_code), body]);
    }

    setArchivedRecords((prev) => prev.filter((row) => !(row.kind === archivedRecord.kind && row.id === archivedRecord.id && row.archived_at === archivedRecord.archived_at)));
    setArchiveNotice(`${archivedRecord.name} has been restored to the live registry.`);
  };

  const openRemovePicker = (kind: RemoveTarget['kind']) => {
    setShowRemovePickerKind(kind);
    setRemoveCandidateId('');
  };

  const selectedRemoveTarget = useMemo<RemoveTarget | null>(() => {
    if (!showRemovePickerKind || !removeCandidateId) return null;
    if (showRemovePickerKind === 'horse') {
      const horse = allHorses.find((row) => row.horse_id === removeCandidateId);
      return horse ? { kind: 'horse', id: horse.horse_id, name: horse.horse_name, seeded: seededHorseIds.has(horse.horse_id) } : null;
    }
    if (showRemovePickerKind === 'trainer') {
      const trainer = allTrainers.find((row) => row.trainer_id === removeCandidateId);
      return trainer ? { kind: 'trainer', id: trainer.trainer_id, name: trainer.trainer_name, seeded: seededTrainerIds.has(trainer.trainer_id) } : null;
    }
    if (showRemovePickerKind === 'owner') {
      const owner = allOwners.find((row) => row.owner_id === removeCandidateId);
      return owner ? { kind: 'owner', id: owner.owner_id, name: owner.owner_name, seeded: seededOwnerIds.has(owner.owner_id) } : null;
    }
    const body = allGoverningBodies.find((row) => row.governing_body_code === removeCandidateId);
    return body ? { kind: 'governing', id: body.governing_body_code, name: body.governing_body_name, seeded: seededGoverningCodes.has(body.governing_body_code) } : null;
  }, [showRemovePickerKind, removeCandidateId, allHorses, allTrainers, allOwners, allGoverningBodies]);

  const executeConfirmedRemoval = () => {
    confirmRemoveTarget();
  };

  const handleAddHorse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddHorseError(null);

    const trimmedLink = newHorseLink.trim();
    const manualName = manualHorseInput.horseName.trim();
    const manualCountry = (manualHorseInput.countryCode.trim() || 'NZ').toUpperCase();
    const manualFoalingYear = manualHorseInput.foalingYear.trim();
    const parsedLink = manualHorseOverride ? null : parseBreedingLink(trimmedLink);

    if (!manualHorseOverride) {
      if (!parsedLink) {
        setAddHorseError('Please provide a valid Loveracing breeding link or use Manual Override.');
        return;
      }
    } else {
      if (!manualName) {
        setAddHorseError('Manual override requires at least a horse name.');
        return;
      }
      if (manualFoalingYear && !/^\d{4}$/.test(manualFoalingYear)) {
        setAddHorseError('Foaling year must be YYYY.');
        return;
      }
    }

    if (!manualHorseOverride) {
      const existingHorse = allHorses.find((horse) => horse.breeding_url === trimmedLink);
      if (existingHorse) {
        setAddHorseError('That breeding link is already mapped to an existing horse profile.');
        return;
      }
    }

    setIsAddingHorse(true);
    try {
      const matchedSeedHorse = parsedLink
        ? (seed?.horses ?? []).find((horse) => {
          const sourceMatch = parseBreedingLink(horse.breeding_url);
          return sourceMatch?.sourceHorseId === parsedLink.sourceHorseId;
        })
        : null;

      let scrapedDetails: ScrapedHorseDetails | null = null;
      let loveracingHtml: string | null = null;
      if (parsedLink) {
        try {
          const url = new URL(trimmedLink);
          const proxyPath = `/__loveracing_proxy${url.pathname}${url.search}`;
          const response = await fetch(proxyPath, { cache: 'no-store' });
          if (response.ok) {
            loveracingHtml = await response.text();
            scrapedDetails = scrapeHorseDetailsFromHtml(loveracingHtml, parsedLink);
          }
        } catch {
          scrapedDetails = null;
        }
      }

      const generatedHorseId = nextHorseId(allHorses);
      const trainerByDesign = matchedSeedHorse?.trainer_id ?? (allTrainers[0]?.trainer_id ?? '');
      const ownerByDesign = matchedSeedHorse?.owner_id ?? (allOwners[0]?.owner_id ?? '');
      const governingByDesign = matchedSeedHorse?.governing_body_code ?? (seed?.governingBodies ?? [])[0]?.governing_body_code ?? 'NZTR';
      const foalingDate = parsedLink?.foalingYear
        ? `${parsedLink.foalingYear}-01-01`
        : manualFoalingYear
          ? `${manualFoalingYear}-01-01`
          : 'unknown';
      const nztrLifeNumber = parsedLink ? `NZ${parsedLink.sourceHorseId.padStart(8, '0')}` : `MANUAL-${generatedHorseId}`;
      const performanceUrl = parsedLink
        ? `https://loveracing.nz/Common/SystemTemplates/Modal/EntryDetail.aspx?DisplayContext=Modal&HorseID=${parsedLink.sourceHorseId}`
        : '#';
      const horseNameForImage = scrapedDetails?.horseName ?? parsedLink?.horseName ?? manualName;
      const loveracingImage = loveracingHtml ? parseHorseImageFromHtml(loveracingHtml, horseNameForImage) : null;
      const ownerWebsite = ownerById.get(ownerByDesign)?.website ?? '';
      const ownerWebsiteImage = loveracingImage ? '' : await fetchWebsiteOgImage(ownerWebsite);
      const resolvedHorseImage = newHorseImage
        ? URL.createObjectURL(newHorseImage)
        : loveracingImage || ownerWebsiteImage || '/horse-images/silhouette.svg';

      const newHorseRecord: HorseRecord = matchedSeedHorse
        ? {
            ...matchedSeedHorse,
            horse_id: generatedHorseId,
            breeding_url: trimmedLink,
            horse_name: scrapedDetails?.horseName ?? matchedSeedHorse.horse_name,
            country_code: scrapedDetails?.countryCode ?? matchedSeedHorse.country_code,
            foaling_date: scrapedDetails?.foalingDate ?? matchedSeedHorse.foaling_date,
            sex: scrapedDetails?.sex ?? matchedSeedHorse.sex,
            colour: scrapedDetails?.colour ?? matchedSeedHorse.colour,
            sire: scrapedDetails?.sire ?? matchedSeedHorse.sire,
            dam: scrapedDetails?.dam ?? matchedSeedHorse.dam,
            nztr_life_number: scrapedDetails?.nztrLifeNumber ?? matchedSeedHorse.nztr_life_number,
            microchip_number: scrapedDetails?.microchipNumber ?? matchedSeedHorse.microchip_number,
            performance_profile_url: scrapedDetails?.performanceProfileUrl ?? matchedSeedHorse.performance_profile_url,
            source_primary: 'loveracing + image resolution',
            source_last_verified_at: new Date().toISOString().slice(0, 10),
            source_notes: `Created from Add Horse workflow. Trainer=${trainerByDesign} Owner=${ownerByDesign} GoverningBody=${governingByDesign}.`,
          }
        : {
            horse_id: generatedHorseId,
            horse_name: scrapedDetails?.horseName ?? parsedLink?.horseName ?? manualName,
            country_code: scrapedDetails?.countryCode ?? parsedLink?.countryCode ?? manualCountry,
            foaling_date: scrapedDetails?.foalingDate ?? foalingDate,
            sex: scrapedDetails?.sex ?? 'Unknown',
            colour: scrapedDetails?.colour ?? 'Unknown',
            sire: scrapedDetails?.sire ?? 'Unknown',
            dam: scrapedDetails?.dam ?? 'Unknown',
            nztr_life_number: scrapedDetails?.nztrLifeNumber ?? nztrLifeNumber,
            microchip_number: scrapedDetails?.microchipNumber ?? (manualHorseInput.microchip.trim() || 'Unknown'),
            trainer_id: trainerByDesign,
            owner_id: ownerByDesign,
            governing_body_code: governingByDesign,
            breeding_url: trimmedLink || `manual://${generatedHorseId}`,
            performance_profile_url: scrapedDetails?.performanceProfileUrl ?? performanceUrl,
            horse_status: 'active',
            identity_status: scrapedDetails ? 'verified' : (manualHorseOverride ? 'manual' : 'pending'),
            source_primary: manualHorseOverride ? 'manual override' : 'loveracing + image resolution',
            source_last_verified_at: new Date().toISOString().slice(0, 10),
            source_notes: manualHorseOverride
              ? `Created from manual override. Trainer=${trainerByDesign} Owner=${ownerByDesign} GoverningBody=${governingByDesign}.`
              : `Created from Add Horse workflow. Trainer=${trainerByDesign} Owner=${ownerByDesign} GoverningBody=${governingByDesign}.${scrapedDetails ? ' Horse details scraped from Loveracing.' : ' Horse details fallback from URL only.'}`,
          };
      const draft: HorseDraftProfile = {
        horseId: generatedHorseId,
        horseName: toDraftField(newHorseRecord.horse_name, Boolean(scrapedDetails?.horseName || matchedSeedHorse)),
        countryCode: toDraftField(newHorseRecord.country_code, Boolean(scrapedDetails?.countryCode || matchedSeedHorse)),
        foalingDate: toDraftField(newHorseRecord.foaling_date, Boolean(scrapedDetails?.foalingDate || matchedSeedHorse)),
        sex: toDraftField(newHorseRecord.sex, Boolean(scrapedDetails?.sex || matchedSeedHorse)),
        colour: toDraftField(newHorseRecord.colour, Boolean(scrapedDetails?.colour || matchedSeedHorse)),
        sire: toDraftField(newHorseRecord.sire, Boolean(scrapedDetails?.sire || matchedSeedHorse)),
        dam: toDraftField(newHorseRecord.dam, Boolean(scrapedDetails?.dam || matchedSeedHorse)),
        nztrLifeNumber: toDraftField(newHorseRecord.nztr_life_number, Boolean(scrapedDetails?.nztrLifeNumber || matchedSeedHorse)),
        microchipNumber: toDraftField(newHorseRecord.microchip_number, Boolean(scrapedDetails?.microchipNumber || matchedSeedHorse)),
        breedingUrl: trimmedLink,
        performanceUrl: newHorseRecord.performance_profile_url,
        trainerId: trainerByDesign,
        ownerId: ownerByDesign,
        governingBodyCode: governingByDesign,
        identityStatus: newHorseRecord.identity_status,
        sourceNotes: newHorseRecord.source_notes,
        imageUrl: resolvedHorseImage,
        imageFound: Boolean(newHorseImage || loveracingImage || ownerWebsiteImage),
        imageFile: newHorseImage,
      };
      setHorseDraft(draft);
      setHorseReviewPanel(0);
      setShowHorseReviewModal(true);
      setShowAddHorseForm(false);
      setNewHorseLink('');
      setManualHorseOverride(false);
      setManualHorseInput({ horseName: '', countryCode: 'NZ', foalingYear: '', microchip: '' });
      setNewHorseImage(null);
      setNewHorseImageName('');
    } finally {
      setIsAddingHorse(false);
    }
  };

  const buildTrainerDraft = async () => {
    setAddTrainerError(null);
    setIsBuildingTrainerDraft(true);
    try {
      const urls = [trainerInput.websiteUrl, trainerInput.socialUrl, trainerInput.anyUrl]
        .map((value) => value.trim())
        .filter(Boolean);
      const enriched = await enrichProfileFromUrls(urls);
      const inferredName = trainerInput.name.trim() || enriched.name;
      const draft: TrainerDraftProfile = {
        name: fieldState(inferredName, Boolean(inferredName), enriched.nameConfidence),
        stableName: fieldState(inferredName || enriched.stableName, Boolean(inferredName || enriched.stableName), enriched.stableNameConfidence),
        stableNameOptions: enriched.stableNameOptions,
        contactName: fieldState(enriched.contactPerson || inferredName, Boolean(enriched.contactPerson || inferredName), enriched.contactPerson ? 'inferred' : 'low'),
        phone: fieldState(enriched.phone, Boolean(enriched.phone)),
        email: fieldState(enriched.email, Boolean(enriched.email)),
        website: fieldState(trainerInput.websiteUrl.trim() || enriched.website, Boolean(trainerInput.websiteUrl.trim() || enriched.website)),
        facebook: fieldState(pickSocialLink(enriched.socialLinks, 'facebook'), Boolean(pickSocialLink(enriched.socialLinks, 'facebook')), 'inferred'),
        x: fieldState(pickSocialLink(enriched.socialLinks, 'x'), Boolean(pickSocialLink(enriched.socialLinks, 'x')), 'inferred'),
        instagram: fieldState(pickSocialLink(enriched.socialLinks, 'instagram'), Boolean(pickSocialLink(enriched.socialLinks, 'instagram')), 'inferred'),
        socialLinks: enriched.socialLinks,
        imageUrl: fieldState(enriched.imageUrl, Boolean(enriched.imageUrl)),
        notes: enriched.notesCandidate,
      };
      if (!draft.stableName.value && draft.name.value) {
        draft.stableName = fieldState(draft.name.value, true, draft.name.confidence === 'low' ? 'low' : 'inferred');
      }
      setTrainerDraft(draft);
      setTrainerReviewPanel(0);
      setShowTrainerReviewModal(true);
    } catch (error) {
      setAddTrainerError(error instanceof Error ? error.message : 'Failed to build trainer profile.');
    } finally {
      setIsBuildingTrainerDraft(false);
    }
  };

  const buildOwnerDraft = async () => {
    setAddOwnerError(null);
    setIsBuildingOwnerDraft(true);
    try {
      const urls = [ownerInput.websiteUrl, ownerInput.socialUrl, ownerInput.anyUrl]
        .map((value) => value.trim())
        .filter(Boolean);
      const enriched = await enrichProfileFromUrls(urls);
      const inferredName = ownerInput.name.trim() || enriched.name;
      const draft: OwnerDraftProfile = {
        name: fieldState(inferredName, Boolean(inferredName), enriched.nameConfidence),
        entityType: fieldState('company', false),
        contactName: fieldState(enriched.contactPerson || inferredName, Boolean(enriched.contactPerson || inferredName), enriched.contactPerson ? 'inferred' : 'low'),
        phone: fieldState(enriched.phone, Boolean(enriched.phone)),
        email: fieldState(enriched.email, Boolean(enriched.email)),
        website: fieldState(ownerInput.websiteUrl.trim() || enriched.website, Boolean(ownerInput.websiteUrl.trim() || enriched.website)),
        facebook: fieldState(pickSocialLink(enriched.socialLinks, 'facebook'), Boolean(pickSocialLink(enriched.socialLinks, 'facebook')), 'inferred'),
        x: fieldState(pickSocialLink(enriched.socialLinks, 'x'), Boolean(pickSocialLink(enriched.socialLinks, 'x')), 'inferred'),
        instagram: fieldState(pickSocialLink(enriched.socialLinks, 'instagram'), Boolean(pickSocialLink(enriched.socialLinks, 'instagram')), 'inferred'),
        socialLinks: enriched.socialLinks,
        imageUrl: fieldState(enriched.imageUrl, Boolean(enriched.imageUrl)),
        notes: enriched.notesCandidate,
      };
      setOwnerDraft(draft);
      setOwnerReviewPanel(0);
      setShowOwnerReviewModal(true);
    } catch (error) {
      setAddOwnerError(error instanceof Error ? error.message : 'Failed to build owner profile.');
    } finally {
      setIsBuildingOwnerDraft(false);
    }
  };

  const saveTrainerProfile = () => {
    if (!trainerDraft) return;
    const trainerId = nextEntityId(allTrainers.map((row) => row.trainer_id), 'TRN');
    const socialLinks = mergeSocialLinks(trainerDraft.socialLinks, {
      facebook: trainerDraft.facebook.value,
      x: trainerDraft.x.value,
      instagram: trainerDraft.instagram.value,
    });
    const hasContact = Boolean(trainerDraft.phone.value.trim() || trainerDraft.email.value.trim() || trainerDraft.website.value.trim() || socialLinks.length);
    const profileStatus = trainerDraft.name.value.trim() && hasContact ? 'active' : 'incomplete';
    const record: TrainerRecord = {
      trainer_id: trainerId,
      trainer_name: trainerDraft.name.value.trim() || `Trainer ${trainerId}`,
      stable_name: trainerDraft.name.value.trim() || trainerDraft.stableName.value.trim() || 'Unknown Stable',
      contact_name: trainerDraft.contactName.value.trim() || 'Unknown',
      phone: trainerDraft.phone.value.trim() || 'Unknown',
      email: trainerDraft.email.value.trim() || 'Unknown',
      website: trainerDraft.website.value.trim() || '#',
      profile_status: profileStatus,
      notes: trainerDraft.notes.trim() || 'Created from smart enrichment workflow.',
      social_links: socialLinks,
    };
    if (trainerDraftImageFile) {
      setTrainerImageOverrides((prev) => ({ ...prev, [trainerId]: URL.createObjectURL(trainerDraftImageFile) }));
    } else if (trainerDraft.imageUrl.value.trim()) {
      setTrainerImageOverrides((prev) => ({ ...prev, [trainerId]: trainerDraft.imageUrl.value.trim() }));
    }
    setCustomTrainers((prev) => [...prev, record]);
    setShowTrainerReviewModal(false);
    setShowAddTrainerForm(false);
    setTrainerDraft(null);
    setTrainerInput({ name: '', websiteUrl: '', socialUrl: '', anyUrl: '' });
    setTrainerDraftImageFile(null);
  };

  const saveOwnerProfile = () => {
    if (!ownerDraft) return;
    const ownerId = nextEntityId(allOwners.map((row) => row.owner_id), 'OWN');
    const socialLinks = mergeSocialLinks(ownerDraft.socialLinks, {
      facebook: ownerDraft.facebook.value,
      x: ownerDraft.x.value,
      instagram: ownerDraft.instagram.value,
    });
    const hasContact = Boolean(ownerDraft.phone.value.trim() || ownerDraft.email.value.trim() || ownerDraft.website.value.trim() || socialLinks.length);
    const profileStatus = ownerDraft.name.value.trim() && hasContact ? 'active' : 'incomplete';
    const record: OwnerRecord = {
      owner_id: ownerId,
      owner_name: ownerDraft.name.value.trim() || `Owner ${ownerId}`,
      entity_type: ownerDraft.entityType.value.trim() || 'company',
      contact_name: ownerDraft.contactName.value.trim() || 'Unknown',
      phone: ownerDraft.phone.value.trim() || 'Unknown',
      email: ownerDraft.email.value.trim() || 'Unknown',
      website: ownerDraft.website.value.trim() || '#',
      profile_status: profileStatus,
      notes: ownerDraft.notes.trim() || 'Created from smart enrichment workflow.',
      social_links: socialLinks,
    };
    if (ownerDraftImageFile) {
      setOwnerImageOverrides((prev) => ({ ...prev, [ownerId]: URL.createObjectURL(ownerDraftImageFile) }));
    } else if (ownerDraft.imageUrl.value.trim()) {
      setOwnerImageOverrides((prev) => ({ ...prev, [ownerId]: ownerDraft.imageUrl.value.trim() }));
    }
    setCustomOwners((prev) => [...prev, record]);
    setShowOwnerReviewModal(false);
    setShowAddOwnerForm(false);
    setOwnerDraft(null);
    setOwnerInput({ name: '', websiteUrl: '', socialUrl: '', anyUrl: '' });
    setOwnerDraftImageFile(null);
  };

  const saveHorseProfile = () => {
    if (!horseDraft) return;
    const targetHorsePath = horseUpdateFolderPath(
      horseDraft.horseName.value.trim() || horseDraft.horseId,
      horseDraft.horseId,
    );
    const record: HorseRecord = {
      horse_id: horseDraft.horseId,
      horse_name: horseDraft.horseName.value.trim() || `Horse ${horseDraft.horseId}`,
      country_code: horseDraft.countryCode.value.trim() || 'NZ',
      foaling_date: horseDraft.foalingDate.value.trim() || 'unknown',
      sex: horseDraft.sex.value.trim() || 'Unknown',
      colour: horseDraft.colour.value.trim() || 'Unknown',
      sire: horseDraft.sire.value.trim() || 'Unknown',
      dam: horseDraft.dam.value.trim() || 'Unknown',
      nztr_life_number: horseDraft.nztrLifeNumber.value.trim() || 'Unknown',
      microchip_number: horseDraft.microchipNumber.value.trim() || 'Unknown',
      trainer_id: horseDraft.trainerId,
      owner_id: horseDraft.ownerId,
      governing_body_code: horseDraft.governingBodyCode,
      breeding_url: horseDraft.breedingUrl,
      performance_profile_url: horseDraft.performanceUrl,
      horse_status: 'active',
      identity_status: horseDraft.identityStatus,
      source_primary: 'loveracing + image resolution',
      source_last_verified_at: new Date().toISOString().slice(0, 10),
      source_notes: appendSourceNote(horseDraft.sourceNotes, `asset_path:${targetHorsePath}`),
    };
    setHorseImageOverrides((prev) => ({ ...prev, [horseDraft.horseId]: horseDraft.imageUrl || '/horse-images/silhouette.svg' }));
    setCustomHorses((prev) => [...prev, record]);
    setShowHorseReviewModal(false);
    setHorseDraft(null);
    window.location.hash = `#/horse/${encodeURIComponent(horseDraft.horseId)}`;
  };

  const handleAddGoverningBody = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddGoverningError(null);
    const code = newGoverningBody.code.trim().toUpperCase();
    if (!code || !newGoverningBody.name.trim()) {
      setAddGoverningError('Code and full name are required.');
      return;
    }
    if (governingBodyByCode.has(code)) {
      setAddGoverningError('A governing body with that code already exists.');
      return;
    }
    setGoverningDraft({
      code: toDraftField(code, true),
      name: toDraftField(newGoverningBody.name.trim(), true),
      website: toDraftField(newGoverningBody.website.trim(), Boolean(newGoverningBody.website.trim())),
      status: toDraftField(newGoverningBody.status, true),
      notes: '',
    });
    setGoverningReviewPanel(0);
    setShowGoverningReviewModal(true);
  };

  const saveGoverningBodyProfile = () => {
    if (!governingDraft) return;
    const code = governingDraft.code.value.trim().toUpperCase();
    if (!code) return;
    if (governingBodyByCode.has(code)) {
      setAddGoverningError('A governing body with that code already exists.');
      return;
    }
    setCustomGoverningBodies((prev) => [
      ...prev,
      {
        governing_body_code: code,
        governing_body_name: governingDraft.name.value.trim() || code,
        website: governingDraft.website.value.trim() || '#',
        status: governingDraft.status.value.trim() || 'active',
        notes: governingDraft.notes.trim() || undefined,
      },
    ]);
    setShowGoverningReviewModal(false);
    setGoverningDraft(null);
    setNewGoverningBody({ code: '', name: '', website: '', status: 'active' });
    setShowAddGoverningForm(false);
  };

  const openHltWizard = () => {
    setHltGoverningOverride(false);
    setHltDraft({
      submissionDate: isoToday(),
      horseId: '',
      trainerId: '',
      ownerId: '',
      governingBodyCode: '',
      leaseStartDate: '',
      leaseLengthMonths: '',
      percentageLeased: '',
      ownerStakesSplit: '',
      numTokens: '',
      tokenPriceNzd: '',
      percentagePrice: '',
      variations: 'n/a',
      tokenName: '',
      erc20Identifier: '',
    });
    setHltStep(1);
    setHltError(null);
    setShowHltWizard(true);
  };

  const closeHltWizard = () => {
    setShowHltWizard(false);
    setHltStep(1);
    setHltError(null);
  };

  const stepOneReady = Boolean(hltDraft.horseId && hltDraft.trainerId && hltDraft.ownerId);
  const validateStepTwo = (): string | null => {
    if (!hltDraft.leaseStartDate) return 'Lease start date is required.';
    if (!Number.isInteger(parseNumber(hltDraft.leaseLengthMonths)) || parseNumber(hltDraft.leaseLengthMonths) <= 0) return 'Lease length must be a positive integer.';
    if (hltDraft.ownerStakesSplit.trim() === '') return 'Enter owner or investor stakes split.';
    const ownerSplit = parseNumber(hltDraft.ownerStakesSplit);
    if (ownerSplit < 0 || ownerSplit > 100) return 'Owner stakes split must be between 0 and 100.';
    if (Math.abs((ownerSplit + hltInvestorSplit) - 100) > 0.001) return 'Owner and investor split must total 100.';
    if (!Number.isInteger(parseNumber(hltDraft.numTokens)) || parseNumber(hltDraft.numTokens) <= 0) return 'Number of tokens must be a positive integer.';
    if (parseNumber(hltDraft.tokenPriceNzd) <= 0 && parseNumber(hltDraft.percentagePrice) <= 0) return 'Enter token price or percentage price.';
    return null;
  };

  const onHltTokenPriceChange = (value: string) => {
    if (value.trim() === '') {
      setHltDraft((prev) => ({ ...prev, tokenPriceNzd: '', percentagePrice: '' }));
      return;
    }
    const numeric = parseNumber(value);
    const factor = hltPercentPerToken * hltLeaseLengthMonthsValue;
    const derivedPercentage = factor > 0 && numeric > 0 ? numeric / factor : 0;
    setHltDraft((prev) => ({
      ...prev,
      tokenPriceNzd: value,
      percentagePrice: derivedPercentage > 0 ? String(Number(derivedPercentage.toFixed(4))) : '',
    }));
  };

  const onHltPercentagePriceChange = (value: string) => {
    if (value.trim() === '') {
      setHltDraft((prev) => ({ ...prev, percentagePrice: '', tokenPriceNzd: '' }));
      return;
    }
    const numeric = parseNumber(value);
    const factor = hltPercentPerToken * hltLeaseLengthMonthsValue;
    const derivedTokenPrice = factor > 0 && numeric > 0 ? numeric * factor : 0;
    setHltDraft((prev) => ({
      ...prev,
      percentagePrice: value,
      tokenPriceNzd: derivedTokenPrice > 0 ? String(Number(derivedTokenPrice.toFixed(2))) : '',
    }));
  };

  const onHltOwnerSplitChange = (value: string) => {
    if (value.trim() === '') {
      setHltDraft((prev) => ({ ...prev, ownerStakesSplit: '' }));
      return;
    }
    const owner = Math.min(100, Math.max(0, parseNumber(value)));
    setHltDraft((prev) => ({
      ...prev,
      ownerStakesSplit: String(Number(owner.toFixed(4))),
    }));
  };

  const onHltInvestorSplitChange = (value: string) => {
    if (value.trim() === '') {
      setHltDraft((prev) => ({ ...prev, ownerStakesSplit: '' }));
      return;
    }
    const investor = Math.min(100, Math.max(0, parseNumber(value)));
    const owner = 100 - investor;
    setHltDraft((prev) => ({
      ...prev,
      ownerStakesSplit: String(Number(owner.toFixed(4))),
    }));
  };

  const moveHltStepForward = () => {
    if (hltStep === 1 && !stepOneReady) {
      setHltError('Select horse, trainer, and owner to continue.');
      return;
    }
    if (hltStep === 2) {
      const validationError = validateStepTwo();
      if (validationError) {
        setHltError(validationError);
        return;
      }
    }
    setHltError(null);
    setHltStep((prev) => Math.min(3, prev + 1));
  };

  const moveHltStepBack = () => {
    if (hltStep === 1) {
      if (window.confirm('Close the HLT wizard? Unsaved progress will be lost.')) closeHltWizard();
      return;
    }
    setHltError(null);
    setHltStep((prev) => Math.max(1, prev - 1));
  };

  const updateHltReviewField = (field: keyof HLTDraft, value: string) => {
    setHltDraft((prev) => ({ ...prev, [field]: value }));
  };

  const hltRecordFromDoc = (doc: DocumentRecord): HLTRecord | null => {
    if (!seed) return null;
    if (doc.document_type.toLowerCase() !== 'hlt issuance termsheet') return null;
    const horse = horseById.get(doc.horse_id);
    if (!horse) return null;
    const lease = doc.lease_id
      ? seed.leases.find((row) => row.lease_id === doc.lease_id)
      : seed.leases.find((row) => row.horse_id === doc.horse_id && row.notes.includes('HLT'));
    if (!lease) return null;
    const trainer = trainerById.get(horse.trainer_id);
    const owner = ownerById.get(horse.owner_id);
    const governing = governingBodyByCode.get(horse.governing_body_code);
    const tokenMatch = lease.notes.match(/^(HLT\s-\s.*)\s\(/);
    const ercMatch = lease.notes.match(/\(([A-Z0-9]+)\)$/);
    const fallbackTokenName = lease.notes.split('(')[0].trim() || `HLT - ${horse.horse_name}`;
    return {
      lease_id: lease.lease_id,
      token_name: tokenMatch?.[1] ?? fallbackTokenName,
      erc20_identifier: ercMatch?.[1] ?? 'UNKNOWN',
      submission_date: doc.document_date || lease.created_at,
      horse_id: horse.horse_id,
      horse_name: horse.horse_name,
      horse_country: horse.country_code,
      horse_year: extractFoalingYear(horse.foaling_date),
      horse_microchip: horse.microchip_number,
      trainer_id: trainer?.trainer_id ?? '',
      trainer_name: trainer?.trainer_name ?? 'Unknown',
      stable_name: trainer?.stable_name ?? 'Unknown',
      stable_location: trainer?.notes ?? '',
      owner_id: owner?.owner_id ?? '',
      owner_name: owner?.owner_name ?? 'Unknown',
      governing_body_code: governing?.governing_body_code ?? horse.governing_body_code,
      governing_body_name: governing?.governing_body_name ?? 'Unknown',
      lease_start_date: lease.start_date,
      lease_length_months: Number(lease.duration_months || 0),
      lease_end_date: lease.end_date,
      percentage_leased: Number(lease.percent_leased || 0),
      owner_stakes_split: Number(lease.owner_share_percent || 0),
      investor_stakes_split: Number(lease.investor_share_percent || 0),
      num_tokens: Number(lease.token_count || 0),
      token_price_nzd: Number(lease.token_price_nzd || 0),
      percentage_price: Number(lease.price_per_one_percent_nzd || 0),
      total_issuance_value: Number(lease.total_issuance_value_nzd || 0),
      variations: 'n/a',
      status: (lease.lease_status.toLowerCase() as HLTRecord['status']) || 'proposed',
      document_filename: doc.source_reference,
    };
  };

  const downloadHorseDocument = async (doc: DocumentRecord, format: 'html' | 'docx' | 'pdf') => {
    const hltRecord = hltRecordFromDoc(doc);
    if (!hltRecord) {
      setHltNotice(`Download not available for ${doc.document_id}.`);
      return;
    }
    const baseName = (doc.source_reference || `HLT_${doc.document_id}`).replace(/\.[^.]+$/, '');
    if (format === 'html') {
      const html = buildHltDocumentHtml(hltRecord);
      triggerBlobDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `${baseName}.html`);
      return;
    }
    if (format === 'docx') {
      const blob = await buildHltDocxBlob(hltRecord, { formalDate, humanDate });
      triggerBlobDownload(blob, `${baseName}.docx`);
      return;
    }
    await downloadHltPdfFromHtml(buildHltDocumentHtml(hltRecord), `${baseName}.pdf`);
  };

  const generateAndSaveHlt = () => {
    if (!seed || !hltPreviewRecord) {
      setHltError('HLT preview data is incomplete.');
      return;
    }
    const validationError = validateStepTwo();
    if (!stepOneReady || validationError) {
      setHltError(validationError ?? 'Step 1 details are incomplete.');
      return;
    }

    const tokenSuffix = hltPreviewRecord.token_name.match(/([A-Z]{2}\d{2})$/)?.[1] ?? `${hltPreviewRecord.horse_country}01`;
    const filename = `HLT_Issuance_${hltPreviewRecord.horse_name.replace(/[^A-Za-z0-9]/g, '')}_${tokenSuffix}_${hltPreviewRecord.submission_date}.html`;
    const targetHorsePath = horseUpdateFolderPath(hltPreviewRecord.horse_name, hltPreviewRecord.horse_id);
    const targetHltPath = `${targetHorsePath}/hlt/${filename}`;
    const finalRecord: HLTRecord = { ...hltPreviewRecord, document_filename: filename };
    const html = buildHltDocumentHtml(finalRecord);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    const nextLease: LeaseRecord = {
      lease_id: finalRecord.lease_id,
      horse_id: finalRecord.horse_id,
      start_date: finalRecord.lease_start_date,
      end_date: finalRecord.lease_end_date,
      duration_months: String(finalRecord.lease_length_months),
      percent_leased: String(finalRecord.percentage_leased),
      token_count: String(finalRecord.num_tokens),
      percent_per_token: finalRecord.num_tokens > 0 ? String(finalRecord.percentage_leased / finalRecord.num_tokens) : '0',
      monthly_lease_price_nzd: '',
      annual_lease_price_nzd: '',
      price_per_one_percent_nzd: hltPricePerOnePercentMonth > 0 ? String(hltPricePerOnePercentMonth) : '',
      token_price_nzd: String(finalRecord.token_price_nzd),
      total_issuance_value_nzd: String(finalRecord.total_issuance_value),
      investor_share_percent: String(finalRecord.investor_stakes_split),
      owner_share_percent: String(finalRecord.owner_stakes_split),
      platform_fee_percent: '',
      lease_status: 'proposed',
      created_at: finalRecord.submission_date,
      notes: `${finalRecord.token_name} (${finalRecord.erc20_identifier})`,
    };

    const nextDocument: DocumentRecord = {
      document_id: nextDocumentId(seed.documents),
      horse_id: finalRecord.horse_id,
      document_type: 'HLT Issuance Termsheet',
      document_version: 'v1',
      document_date: finalRecord.submission_date,
      source_reference: finalRecord.document_filename,
      file_path: targetHltPath,
      is_current: 'true',
      notes: `Generated | target_path:${targetHltPath}`,
    };

    setSeed((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leases: [...prev.leases, nextLease],
        documents: [...prev.documents, nextDocument],
      };
    });
    setLeaseTab('proposed');
    setLeaseStatusFilter('proposed');
    setLeaseHorseFilter('all');
    closeHltWizard();
    setHltNotice(`HLT ${finalRecord.token_name} created successfully. Document downloaded. Target path: ${targetHltPath}`);
  };

  const openInvestorUpdateBuilder = (template: InvestorUpdateType) => {
    const preferredHorseId = allHorses[0]?.horse_id ?? '';
    const preferredHorseName = allHorses[0]?.horse_name ?? 'Horse';
    setInvestorUpdateDraft({
      template,
      horseId: preferredHorseId,
      headline: template === 'quarterly' ? `${preferredHorseName} Quarterly Investor Update` : `${preferredHorseName} Investor Update`,
      summary: '',
      body: '',
      asOfDate: isoToday(),
    });
    setDownloadFormat('html');
    setInvestorUpdateError(null);
    setInvestorUpdateNotice(null);
    setShowInvestorUpdateBuilder(true);
  };

  const buildInvestorDraftPayload = () => {
    const horse = allHorses.find((row) => row.horse_id === investorUpdateDraft.horseId);
    if (!horse) {
      throw new Error('Select a valid horse before saving or downloading.');
    }
    return {
      horseId: horse.horse_id,
      horseName: horse.horse_name,
      template: investorUpdateDraft.template,
      headline: investorUpdateDraft.headline.trim(),
      summary: investorUpdateDraft.summary.trim(),
      body: investorUpdateDraft.body.trim(),
      asOfDate: investorUpdateDraft.asOfDate || isoToday(),
    };
  };

  const saveInvestorUpdateLocally = async () => {
    try {
      const payload = buildInvestorDraftPayload();
      if (!payload.headline || !payload.body) {
        setInvestorUpdateError('Headline and body are required to save locally.');
        return;
      }
      setIsSavingInvestorUpdate(true);
      setInvestorUpdateError(null);
      const html = investorUpdateHtml(payload);
      const response = await fetch('/__save_investor_update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, html }),
      });
      const data = await response.json() as { fileName?: string; filePath?: string; savedAt?: string; error?: string };
      if (!response.ok || !data.fileName || !data.filePath) {
        throw new Error(data.error || `Save failed (${response.status})`);
      }
      setSavedInvestorUpdates((prev) => [
        {
          fileName: data.fileName as string,
          filePath: data.filePath as string,
          horseName: payload.horseName,
          savedAt: data.savedAt || isoToday(),
        },
        ...prev,
      ].slice(0, 8));
      setInvestorUpdateNotice(`Saved locally: ${data.filePath}`);
    } catch (err) {
      setInvestorUpdateError(err instanceof Error ? err.message : 'Failed to save locally.');
    } finally {
      setIsSavingInvestorUpdate(false);
    }
  };

  const downloadInvestorUpdate = async () => {
    try {
      const payload = buildInvestorDraftPayload();
      if (!payload.headline || !payload.body) {
        setInvestorUpdateError('Headline and body are required to download.');
        return;
      }
      setInvestorUpdateError(null);
      const baseFileName = `${slugSegment(payload.horseName)}-${payload.template === 'quarterly' ? 'Quarterly' : 'Update'}-${payload.asOfDate.replaceAll('-', '')}`;
      if (downloadFormat === 'html') {
        const htmlBlob = new Blob([investorUpdateHtml(payload)], { type: 'text/html;charset=utf-8' });
        triggerBlobDownload(htmlBlob, `${baseFileName}.html`);
        return;
      }
      if (downloadFormat === 'docx') {
        const bodyBlocks = payload.body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
        const doc = new DocxDocument({
          sections: [{
            children: [
              new Paragraph({ text: payload.headline, heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ children: [new TextRun({ text: `${payload.horseName} (${payload.horseId}) · ${payload.asOfDate}`, bold: true })] }),
              new Paragraph({ text: payload.summary || 'No summary provided.' }),
              ...bodyBlocks.map((block) => new Paragraph({ text: block })),
            ],
          }],
        });
        const blob = await Packer.toBlob(doc);
        triggerBlobDownload(blob, `${baseFileName}.docx`);
        return;
      }
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 48;
      const width = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 58;
      const writeWrapped = (text: string, size: number) => {
        pdf.setFontSize(size);
        const lines = pdf.splitTextToSize(text, width) as string[];
        for (const line of lines) {
          if (y > pageHeight - 52) {
            pdf.addPage();
            y = 58;
          }
          pdf.text(line, margin, y);
          y += size + 6;
        }
      };
      writeWrapped(payload.headline, 18);
      y += 4;
      writeWrapped(`${payload.horseName} (${payload.horseId}) · ${payload.asOfDate}`, 11);
      y += 8;
      writeWrapped(payload.summary || 'No summary provided.', 12);
      y += 8;
      writeWrapped(payload.body, 12);
      pdf.save(`${baseFileName}.pdf`);
    } catch (err) {
      setInvestorUpdateError(err instanceof Error ? err.message : 'Download failed.');
    }
  };

  const route = routeState.route;
  const routeForNav = route === 'horse'
    ? 'horses'
    : route === 'trainer'
      ? 'trainers'
      : route === 'owner'
        ? 'owners'
        : route === 'governingBody'
          ? 'governingBodies'
          : route;
  const isRepositorySectionActive = ['horses', 'trainers', 'owners', 'governingBodies'].includes(routeForNav);
  const isComplianceJurisdictionActive = ['complianceNewZealand', 'complianceDubai'].includes(routeForNav);
  const contentTitle = route === 'dashboard'
    ? 'Operational Dashboard'
    : route === 'horses'
      ? 'Horse Registry'
      : route === 'horse'
        ? `${selectedHorse?.horse_name ?? 'Horse'} Profile`
        : route === 'trainers'
          ? 'Trainers / Stables'
          : route === 'trainer'
            ? `${selectedTrainer?.trainer_name ?? 'Trainer'} Profile`
            : route === 'owners'
              ? 'Owner Registry'
              : route === 'owner'
                ? `${selectedOwner?.owner_name ?? 'Owner'} Profile`
                : route === 'governingBodies'
                  ? 'Governing Bodies'
                  : route === 'governingBody'
                    ? `${selectedGoverningBody?.governing_body_name ?? 'Governing Body'} Profile`
                    : route === 'documentsTemplates'
                      ? 'Document Templates'
                      : route === 'documentsGenerated'
                        ? 'Generated Documents'
                        : route === 'complianceNewZealand'
                          ? 'Compliance - New Zealand'
                          : route === 'complianceDubai'
                            ? 'Compliance - Dubai'
                            : route === 'complianceSsot'
                              ? 'SSOT Profiles'
                              : route === 'complianceArchive'
                                ? 'Archive'
                                : route === 'leases'
                                  ? 'Lease Registry'
                                  : route === 'intake'
                                    ? 'Intake Queue'
                                    : 'Document Register';
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
              <a className={`nav-item ${routeForNav === 'dashboard' ? 'nav-item-active' : ''}`} href="#/dashboard"><LayoutDashboard size={16} /><span>Dashboard</span></a>
              <p className="px-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Lease Management</p>
              <a className={`nav-item ${routeForNav === 'leases' ? 'nav-item-active' : ''}`} href="#/leases"><Link2 size={16} /><span>Leases</span></a>

              <div className={`nav-group ${isRepositorySectionActive ? 'nav-group-active' : ''}`}>
                <div className="px-3 pt-4">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isRepositorySectionActive ? 'text-blue-700' : 'text-slate-500'}`}>Repository</p>
                </div>
                <a className={`nav-item ${routeForNav === 'horses' ? 'nav-item-active' : ''}`} href="#/horses"><Landmark size={16} /><span>Horses</span></a>
                <a className={`nav-item ${routeForNav === 'trainers' ? 'nav-item-active' : ''}`} href="#/trainers"><BadgeCheck size={16} /><span>Trainers / Stables</span></a>
                <a className={`nav-item ${routeForNav === 'owners' ? 'nav-item-active' : ''}`} href="#/owners"><BriefcaseBusiness size={16} /><span>Owners</span></a>
                <a className={`nav-item ${routeForNav === 'governingBodies' ? 'nav-item-active' : ''}`} href="#/governing-bodies"><ShieldCheck size={16} /><span>Governing Bodies</span></a>
              </div>

              <p className="px-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Documents</p>
              <a className={`nav-item ${routeForNav === 'documentsTemplates' ? 'nav-item-active' : ''}`} href="#/documents/templates"><FileText size={16} /><span>Templates</span></a>
              <a className={`nav-item ${routeForNav === 'documentsGenerated' ? 'nav-item-active' : ''}`} href="#/documents/generated"><FileCheck2 size={16} /><span>Generated Documents</span></a>

              <p className="px-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Compliance</p>
              <button
                type="button"
                onClick={() => setIsComplianceJurisdictionOpen((prev) => !prev)}
                className={`nav-item w-full justify-between ${isComplianceJurisdictionActive ? 'nav-item-active' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Jurisdiction</span>
                </span>
                <ChevronDown size={14} className={`transition-transform ${isComplianceJurisdictionOpen ? 'rotate-180' : ''}`} />
              </button>
              {isComplianceJurisdictionOpen ? (
                <>
                  <a className={`nav-item pl-6 ${routeForNav === 'complianceNewZealand' ? 'nav-item-active' : ''}`} href="#/compliance/jurisdiction/new-zealand"><ShieldCheck size={16} /><span>New Zealand</span></a>
                  <a className={`nav-item pl-6 ${routeForNav === 'complianceDubai' ? 'nav-item-active' : ''}`} href="#/compliance/jurisdiction/dubai"><ShieldCheck size={16} /><span>Dubai</span></a>
                </>
              ) : null}
              <a className={`nav-item ${routeForNav === 'complianceSsot' ? 'nav-item-active' : ''}`} href="#/compliance/ssot-profiles"><ShieldCheck size={16} /><span>SSOT Profiles</span></a>
              <a className={`nav-item ${routeForNav === 'complianceArchive' ? 'nav-item-active' : ''}`} href="#/compliance/archive"><ShieldCheck size={16} /><span>Archive</span></a>
            </nav>
          </div>
        </aside>

        <main className="overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Single Source Of Truth</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{contentTitle}</h2>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Live Snapshot</p>
                <p className="text-sm font-medium text-slate-700">{seed?._meta.generatedAt ?? 'loading...'}</p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {error ? <div className="surface-card rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
            {archiveNotice ? (
              <div className="surface-card rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <div className="flex items-center justify-between gap-3">
                  <p>{archiveNotice}</p>
                  <button type="button" onClick={() => setArchiveNotice(null)} className="text-xs font-semibold text-emerald-700 hover:underline">Dismiss</button>
                </div>
              </div>
            ) : null}
            {hltNotice ? (
              <div className="surface-card rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex items-center justify-between gap-3">
                  <p>{hltNotice}</p>
                  <button type="button" onClick={() => setHltNotice(null)} className="text-xs font-semibold text-blue-700 hover:underline">Dismiss</button>
                </div>
              </div>
            ) : null}
            {route === 'dashboard' ? (
              <Suspense fallback={<RouteLoadingFallback />}>
                <DashboardRoute
                  allHorses={allHorses}
                  allTrainers={allTrainers}
                  allOwners={allOwners}
                  leaseCount={seed?.leases.length ?? 0}
                  horseImageSrc={horseImageSrc}
                />
              </Suspense>
            ) : null}

            {route === 'horses' ? (
              <>
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {allHorses.map((horse) => (
                    <article
                      key={horse.horse_id}
                      role="button"
                      tabIndex={0}
                      onClick={() => { window.location.hash = `#/horse/${encodeURIComponent(horse.horse_id)}`; }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          window.location.hash = `#/horse/${encodeURIComponent(horse.horse_id)}`;
                        }
                      }}
                      className="surface-card cursor-pointer overflow-hidden rounded-xl transition hover:-translate-y-0.5"
                    >
                      <div className="h-44 bg-slate-100">
                        <img src={horseImageSrc(horse)} alt={`${horse.horse_name} profile`} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-2xl font-semibold tracking-tight text-slate-900">{horse.horse_name}</p>
                          <div className="flex flex-col items-end gap-1">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{horse.horse_id}</span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingHorseId(horse.horse_id);
                                setHorseEditDraft({ ...horse });
                              }}
                              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{horse.sex} • {horse.colour} • {horse.identity_status}</p>
                        {editingHorseId === horse.horse_id && horseEditDraft ? (
                          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3" onClick={(event) => event.stopPropagation()}>
                            <input value={horseEditDraft.horse_name} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, horse_name: e.target.value } : prev))} placeholder="Horse name" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                              <input value={horseEditDraft.sex} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, sex: e.target.value } : prev))} placeholder="Sex" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                              <input value={horseEditDraft.colour} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, colour: e.target.value } : prev))} placeholder="Colour" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                            </div>
                            <input value={horseEditDraft.foaling_date} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, foaling_date: e.target.value } : prev))} placeholder="Foaling date" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <select value={horseEditDraft.trainer_id} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, trainer_id: e.target.value } : prev))} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                                {allTrainers.map((trainer) => <option key={trainer.trainer_id} value={trainer.trainer_id}>{trainer.trainer_name}</option>)}
                              </select>
                              <select value={horseEditDraft.owner_id} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, owner_id: e.target.value } : prev))} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                                {allOwners.map((owner) => <option key={owner.owner_id} value={owner.owner_id}>{owner.owner_name}</option>)}
                              </select>
                              <select value={horseEditDraft.governing_body_code} onChange={(e) => setHorseEditDraft((prev) => (prev ? { ...prev, governing_body_code: e.target.value } : prev))} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                                {allGoverningBodies.map((body) => <option key={body.governing_body_code} value={body.governing_body_code}>{body.governing_body_code}</option>)}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={saveHorseUpdate} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Save Update</button>
                              <button type="button" onClick={() => { setEditingHorseId(null); setHorseEditDraft(null); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </section>
                {route === 'horses' ? (
                  <div className="px-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddHorseForm((prev) => !prev);
                          setAddHorseError(null);
                        }}
                        className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        onClick={() => openRemovePicker('horse')}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        - Remove
                      </button>
                    </div>
                    {showAddHorseForm ? (
                    <form onSubmit={handleAddHorse} className="surface-card rounded-xl border border-blue-100 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add New Horse Profile</h3>
                      <div className="mt-3 space-y-3">
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={manualHorseOverride}
                            onChange={(event) => setManualHorseOverride(event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Manual override (create without Loveracing URL)
                        </label>
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Loveracing Breeding Link</span>
                          <input
                            type={manualHorseOverride ? 'text' : 'url'}
                            value={newHorseLink}
                            onChange={(event) => setNewHorseLink(event.target.value)}
                            placeholder={manualHorseOverride ? 'Optional reference note' : 'https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx'}
                            required={!manualHorseOverride}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                        {manualHorseOverride ? (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <label className="block text-sm md:col-span-2">
                              <span className="mb-1 block font-medium text-slate-700">Horse Name</span>
                              <input
                                type="text"
                                value={manualHorseInput.horseName}
                                onChange={(event) => setManualHorseInput((prev) => ({ ...prev, horseName: event.target.value }))}
                                placeholder="Turn Me Loose x Yearn"
                                required={manualHorseOverride}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                            <label className="block text-sm">
                              <span className="mb-1 block font-medium text-slate-700">Country Code</span>
                              <input
                                type="text"
                                value={manualHorseInput.countryCode}
                                onChange={(event) => setManualHorseInput((prev) => ({ ...prev, countryCode: event.target.value.toUpperCase() }))}
                                placeholder="NZ"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                            <label className="block text-sm">
                              <span className="mb-1 block font-medium text-slate-700">Foaling Year</span>
                              <input
                                type="text"
                                value={manualHorseInput.foalingYear}
                                onChange={(event) => setManualHorseInput((prev) => ({ ...prev, foalingYear: event.target.value }))}
                                placeholder="2023"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                            <label className="block text-sm md:col-span-2">
                              <span className="mb-1 block font-medium text-slate-700">Microchip Number (optional)</span>
                              <input
                                type="text"
                                value={manualHorseInput.microchip}
                                onChange={(event) => setManualHorseInput((prev) => ({ ...prev, microchip: event.target.value }))}
                                placeholder="985125000126462"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                          </div>
                        ) : null}
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Horse Image (optional)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setNewHorseImage(file);
                              setNewHorseImageName(file?.name ?? '');
                            }}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
                          />
                          {newHorseImageName ? <p className="mt-1 text-xs text-slate-500">{newHorseImageName}</p> : null}
                        </label>
                        {addHorseError ? <p className="text-sm text-rose-700">{addHorseError}</p> : null}
                        <div className="flex items-center gap-2">
                          <button type="submit" disabled={isAddingHorse} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60">{isAddingHorse ? 'Creating...' : 'Create Profile'}</button>
                          <button type="button" onClick={() => setShowAddHorseForm(false)} disabled={isAddingHorse} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
                        </div>
                      </div>
                    </form>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {route === 'horse' ? (
              selectedHorse ? (
                <section className="space-y-6">
                  <div>
                    <a href="#/horses" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">← Back to Horses</a>
                  </div>

                  <article className="surface-card overflow-hidden rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]">
                      <img src={horseImageSrc(selectedHorse)} alt={selectedHorse.horse_name} className="h-full w-full object-cover" />
                      <div className="p-5">
                        <p className="text-3xl font-semibold tracking-tight text-slate-900">{selectedHorse.horse_name}</p>
                        <p className="mt-1 text-sm text-slate-500">{selectedHorse.horse_id} • {selectedHorse.horse_status} • {selectedHorse.identity_status}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a href={selectedHorse.breeding_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Breeding <ExternalLink size={11} /></a>
                          <a href={selectedHorse.performance_profile_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Performance <ExternalLink size={11} /></a>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                          {selectedHorseTrainer ? (
                            <a href={`#/trainer/${encodeURIComponent(selectedHorseTrainer.trainer_id)}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 hover:border-blue-200 hover:text-blue-700">Trainer / Stable: {selectedHorseTrainer.stable_name || selectedHorseTrainer.trainer_name}</a>
                          ) : null}
                          {selectedHorseOwner ? (
                            <a href={`#/owner/${encodeURIComponent(selectedHorseOwner.owner_id)}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 hover:border-blue-200 hover:text-blue-700">Owner: {selectedHorseOwner.owner_name}</a>
                          ) : null}
                          {selectedHorseGoverningBody ? (
                            <a href={`#/governing-body/${encodeURIComponent(selectedHorseGoverningBody.governing_body_code)}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 hover:border-blue-200 hover:text-blue-700">Governing Body: {selectedHorseGoverningBody.governing_body_name}</a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>

                  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Horse Details</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Country:</span> {selectedHorse.country_code}</p>
                        <p><span className="font-semibold text-slate-900">Foaled:</span> {selectedHorse.foaling_date}</p>
                        <p><span className="font-semibold text-slate-900">Sex:</span> {selectedHorse.sex}</p>
                        <p><span className="font-semibold text-slate-900">Colour:</span> {selectedHorse.colour}</p>
                        <p><span className="font-semibold text-slate-900">Sire:</span> {selectedHorse.sire}</p>
                        <p><span className="font-semibold text-slate-900">Dam:</span> {selectedHorse.dam}</p>
                        <p><span className="font-semibold text-slate-900">NZTR Life #:</span> {selectedHorse.nztr_life_number}</p>
                        <p><span className="font-semibold text-slate-900">Microchip:</span> {selectedHorse.microchip_number}</p>
                      </div>
                    </article>

                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Last 3 Races</h3>
                      <div className="mt-3 min-h-[170px] space-y-3 text-sm text-slate-700">
                        {selectedHorseRecentRaces.map((race) => (
                          <div key={`${race.date}-${race.raceName}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{race.placing}</p>
                                <p className="text-xs text-slate-500">{race.date}</p>
                              </div>
                              <div className="text-right text-xs text-slate-500">
                                <p>{race.distance}</p>
                                <p>{race.trackCondition}</p>
                              </div>
                            </div>
                            <a href={race.raceUrl} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-blue-700 hover:underline">{race.raceName}</a>
                          </div>
                        ))}
                        {selectedHorseRecentRacesLoading ? <div className="h-0" aria-hidden="true" /> : null}
                      </div>
                    </article>
                  </section>

                  <article className="surface-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Commercial Terms</h3>
                    {selectedHorseLeases.length ? (
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="py-2 pr-3">Lease</th>
                              <th className="py-2 pr-3">Term</th>
                              <th className="py-2 pr-3">Leased %</th>
                              <th className="py-2 pr-3">Token Price</th>
                              <th className="py-2 pr-3">Issuance</th>
                              <th className="py-2 pr-3">Investor/Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedHorseLeases.map((lease) => (
                              <tr key={lease.lease_id} className="border-t border-slate-100 text-slate-700">
                                <td className="py-2 pr-3 font-semibold text-slate-900">{lease.lease_id}</td>
                                <td className="py-2 pr-3">{lease.start_date} to {lease.end_date}</td>
                                <td className="py-2 pr-3">{lease.percent_leased}%</td>
                                <td className="py-2 pr-3">NZD {lease.token_price_nzd}</td>
                                <td className="py-2 pr-3">NZD {lease.total_issuance_value_nzd}</td>
                                <td className="py-2 pr-3">{lease.investor_share_percent}% / {lease.owner_share_percent}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="mt-3 text-sm text-slate-500">No commercial terms linked.</p>}
                  </article>

                  <article className="surface-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Documents</h3>
                    {selectedHorseDocs.length ? (
                      <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-3 py-2 font-semibold">Document</th>
                              <th className="px-3 py-2 font-semibold">Date</th>
                              <th className="px-3 py-2 font-semibold">Reference</th>
                              <th className="px-3 py-2 font-semibold">Status</th>
                              <th className="px-3 py-2 font-semibold">Download</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedHorseDocs.map((doc) => (
                              <tr key={doc.document_id} className="border-t border-slate-100">
                                <td className="px-3 py-2">
                                  <p className="font-semibold text-slate-900">{doc.document_id}</p>
                                  <p className="text-xs text-slate-500">{doc.document_type}</p>
                                </td>
                                <td className="px-3 py-2 text-slate-700">{doc.document_date}</td>
                                <td className="max-w-[420px] px-3 py-2">
                                  <p className="truncate text-slate-700">{doc.source_reference}</p>
                                  {docWebHref(doc.file_path) ? (
                                    <a href={docWebHref(doc.file_path) ?? '#'} target="_blank" rel="noreferrer" className="truncate text-xs text-blue-700 hover:underline">{doc.file_path}</a>
                                  ) : (
                                    <p className="truncate text-xs text-slate-500">{doc.file_path}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${doc.notes?.toLowerCase() === 'generated' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                    {doc.notes || 'Current'}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    <button type="button" onClick={() => void downloadHorseDocument(doc, 'html')} className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">HTML</button>
                                    <button type="button" onClick={() => void downloadHorseDocument(doc, 'docx')} className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">DOCX</button>
                                    <button type="button" onClick={() => void downloadHorseDocument(doc, 'pdf')} className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">PDF</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="mt-3 text-sm text-slate-500">No docs linked.</p>}
                  </article>

                  <article className="surface-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Additional Info</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p><span className="font-semibold text-slate-900">Source Primary:</span> {selectedHorse.source_primary}</p>
                      <p><span className="font-semibold text-slate-900">Last Verified:</span> {selectedHorse.source_last_verified_at}</p>
                      <p><span className="font-semibold text-slate-900">Source Notes:</span> {selectedHorse.source_notes}</p>
                      <p><span className="font-semibold text-slate-900">Intake Records:</span> {selectedHorseIntake.length}</p>
                      {selectedHorseIntake.map((row) => (
                        <p key={row.intake_id} className="text-xs text-slate-500">{row.intake_id} - {row.parse_status}</p>
                      ))}
                    </div>
                  </article>
                </section>
              ) : (
                <div className="surface-card rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Horse profile not found in SSOT snapshot.
                </div>
              )
            ) : null}

            {route === 'trainers' ? (
              <section className="space-y-4">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {allTrainers.map((trainer) => (
                    <article key={trainer.trainer_id} className="surface-card overflow-hidden rounded-xl transition hover:-translate-y-0.5">
                      <div className="h-44 bg-slate-100">
                        <img src={trainerImageSrc(trainer)} alt={`${trainer.trainer_name} profile`} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => { window.location.hash = `#/trainer/${encodeURIComponent(trainer.trainer_id)}`; }}
                            className="text-left text-2xl font-semibold tracking-tight text-slate-900 hover:underline"
                          >
                            {trainer.trainer_name}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedTrainerId(trainer.trainer_id);
                                setEditingTrainerId(trainer.trainer_id);
                                setTrainerEditDraft({ ...trainer });
                              }}
                              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Update
                            </button>
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{trainer.trainer_id}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{trainer.stable_name}</p>
                        {expandedTrainerId === trainer.trainer_id ? (
                          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{editingTrainerId === trainer.trainer_id ? 'Update Trainer' : 'Stable / Trainer'}</h3>
                            {editingTrainerId === trainer.trainer_id && trainerEditDraft ? (
                              <div className="mt-3 space-y-2">
                                <input value={trainerEditDraft.trainer_name} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, trainer_name: e.target.value } : prev))} placeholder="Name" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <input value={trainerEditDraft.stable_name} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, stable_name: e.target.value } : prev))} placeholder="Stable" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <input value={trainerEditDraft.contact_name} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, contact_name: e.target.value } : prev))} placeholder="Contact Person" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <input value={trainerEditDraft.phone} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, phone: e.target.value } : prev))} placeholder="Phone" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                  <input value={trainerEditDraft.email} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, email: e.target.value } : prev))} placeholder="Email" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                </div>
                                <input value={trainerEditDraft.website} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, website: e.target.value } : prev))} placeholder="Website" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <textarea value={trainerEditDraft.notes} onChange={(e) => setTrainerEditDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))} rows={3} placeholder="Notes" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={saveTrainerUpdate} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Save Update</button>
                                  <button type="button" onClick={() => { setEditingTrainerId(null); setTrainerEditDraft(null); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold text-slate-900">Name:</span> {trainer.trainer_name}</p>
                                <p><span className="font-semibold text-slate-900">Stable:</span> {trainer.stable_name}</p>
                                <p><span className="font-semibold text-slate-900">Contact Person:</span> {trainer.contact_name}</p>
                                <p><span className="font-semibold text-slate-900">Phone:</span> {trainer.phone}</p>
                                <p><span className="font-semibold text-slate-900">Email:</span> {trainer.email}</p>
                                <p><span className="font-semibold text-slate-900">Website:</span> <a href={trainer.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{trainer.website}</a></p>
                                {getDisplaySocialLinks(trainer.social_links).length ? (
                                  <div>
                                    <p className="font-semibold text-slate-900">Social:</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                      {getDisplaySocialLinks(trainer.social_links).map((link) => (
                                        <a key={link} href={link} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-blue-700 hover:underline">
                                          {new URL(link).hostname.replace(/^www\./, '')}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </section>
                <div className="px-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTrainerForm((prev) => !prev);
                        setAddTrainerError(null);
                      }}
                      className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() => openRemovePicker('trainer')}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      - Remove
                    </button>
                  </div>
                  {showAddTrainerForm ? (
                    <div className="rounded-xl border border-blue-100 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tell us what you know</h3>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input type="text" value={trainerInput.name} onChange={(e) => setTrainerInput((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={trainerInput.websiteUrl} onChange={(e) => setTrainerInput((prev) => ({ ...prev, websiteUrl: e.target.value }))} placeholder="Website URL (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={trainerInput.socialUrl} onChange={(e) => setTrainerInput((prev) => ({ ...prev, socialUrl: e.target.value }))} placeholder="Social URL (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={trainerInput.anyUrl} onChange={(e) => setTrainerInput((prev) => ({ ...prev, anyUrl: e.target.value }))} placeholder="Any other URL (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                      </div>
                      {addTrainerError ? <p className="mt-3 text-sm text-rose-700">{addTrainerError}</p> : null}
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" onClick={() => void buildTrainerDraft()} disabled={isBuildingTrainerDraft} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60">{isBuildingTrainerDraft ? 'Building...' : 'Build Profile ->'}</button>
                        <button type="button" onClick={() => setShowAddTrainerForm(false)} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}


            {route === 'trainer' ? (
              selectedTrainer ? (
                <section className="space-y-6">
                  <div>
                    <a href="#/trainers" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">Back to Trainers</a>
                  </div>

                  <article className="surface-card overflow-hidden rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]">
                      <img src={trainerImageSrc(selectedTrainer)} alt={selectedTrainer.trainer_name} className="h-full w-full object-cover" />
                      <div className="p-5">
                        <p className="text-3xl font-semibold tracking-tight text-slate-900">{selectedTrainer.trainer_name}</p>
                        <p className="mt-1 text-sm text-slate-500">{selectedTrainer.trainer_id} - {selectedTrainer.profile_status}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">Stable: {selectedTrainer.stable_name}</span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedTrainerHorses.length} horses</span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedTrainerLeases.length} leases</span>
                        </div>
                        {selectedTrainer.website && selectedTrainer.website !== '#' ? (
                          <div className="mt-4">
                            <a href={selectedTrainer.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Website <ExternalLink size={11} /></a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>

                  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Trainer Details</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Stable:</span> {selectedTrainer.stable_name}</p>
                        <p><span className="font-semibold text-slate-900">Contact Person:</span> {selectedTrainer.contact_name}</p>
                        <p><span className="font-semibold text-slate-900">Phone:</span> {selectedTrainer.phone}</p>
                        <p><span className="font-semibold text-slate-900">Email:</span> {selectedTrainer.email}</p>
                        <p><span className="font-semibold text-slate-900">Website:</span> {selectedTrainer.website && selectedTrainer.website !== '#' ? <a href={selectedTrainer.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{selectedTrainer.website}</a> : 'Not set'}</p>
                      </div>
                    </article>

                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Additional Info</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Linked Documents:</span> {selectedTrainerDocs.length}</p>
                        <p><span className="font-semibold text-slate-900">Notes:</span> {selectedTrainer.notes || 'No internal notes recorded.'}</p>
                      </div>
                    </article>
                  </section>

                  <article className="surface-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Associated Horses</h3>
                    {selectedTrainerHorses.length ? (
                      <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-3 py-2 font-semibold">Horse</th>
                              <th className="px-3 py-2 font-semibold">Status</th>
                              <th className="px-3 py-2 font-semibold">Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTrainerHorses.map((horse) => (
                              <tr key={horse.horse_id} className="border-t border-slate-100 text-slate-700">
                                <td className="px-3 py-2"><a href={`#/horse/${encodeURIComponent(horse.horse_id)}`} className="font-semibold text-blue-700 hover:underline">{horse.horse_name}</a></td>
                                <td className="px-3 py-2">{horse.horse_status} - {horse.identity_status}</td>
                                <td className="px-3 py-2">{ownerById.get(horse.owner_id)?.owner_name ?? 'Unknown'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="mt-3 text-sm text-slate-500">No horses linked to this trainer.</p>}
                  </article>
                </section>
              ) : (
                <div className="surface-card rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Trainer profile not found in SSOT snapshot.</div>
              )
            ) : null}

            {route === 'owners' ? (
              <section className="space-y-4">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {allOwners.map((owner) => (
                    <article key={owner.owner_id} className="surface-card overflow-hidden rounded-xl transition hover:-translate-y-0.5">
                      <div className="h-44 bg-slate-100">
                        <img src={ownerImageSrc(owner)} alt={`${owner.owner_name} profile`} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => { window.location.hash = `#/owner/${encodeURIComponent(owner.owner_id)}`; }}
                            className="text-left text-2xl font-semibold tracking-tight text-slate-900 hover:underline"
                          >
                            {owner.owner_name}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedOwnerId(owner.owner_id);
                                setEditingOwnerId(owner.owner_id);
                                setOwnerEditDraft({ ...owner });
                              }}
                              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Update
                            </button>
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{owner.owner_id}</span>
                          </div>
                        </div>
                        {expandedOwnerId === owner.owner_id ? (
                          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{editingOwnerId === owner.owner_id ? 'Update Owner' : 'Owner'}</h3>
                            {editingOwnerId === owner.owner_id && ownerEditDraft ? (
                              <div className="mt-3 space-y-2">
                                <input value={ownerEditDraft.owner_name} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, owner_name: e.target.value } : prev))} placeholder="Name" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <input value={ownerEditDraft.entity_type} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, entity_type: e.target.value } : prev))} placeholder="Entity type" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                  <input value={ownerEditDraft.contact_name} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, contact_name: e.target.value } : prev))} placeholder="Contact Person" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <input value={ownerEditDraft.phone} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, phone: e.target.value } : prev))} placeholder="Phone" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                  <input value={ownerEditDraft.email} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, email: e.target.value } : prev))} placeholder="Email" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                </div>
                                <input value={ownerEditDraft.website} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, website: e.target.value } : prev))} placeholder="Website" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <textarea value={ownerEditDraft.notes} onChange={(e) => setOwnerEditDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))} rows={3} placeholder="Notes" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={saveOwnerUpdate} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Save Update</button>
                                  <button type="button" onClick={() => { setEditingOwnerId(null); setOwnerEditDraft(null); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold text-slate-900">Name:</span> {owner.owner_name}</p>
                                <p><span className="font-semibold text-slate-900">Entity Type:</span> {owner.entity_type}</p>
                                <p><span className="font-semibold text-slate-900">Contact Person:</span> {owner.contact_name}</p>
                                <p><span className="font-semibold text-slate-900">Phone:</span> {owner.phone}</p>
                                <p><span className="font-semibold text-slate-900">Email:</span> {owner.email}</p>
                                <p><span className="font-semibold text-slate-900">Website:</span> <a href={owner.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{owner.website}</a></p>
                                {getDisplaySocialLinks(owner.social_links).length ? (
                                  <div>
                                    <p className="font-semibold text-slate-900">Social:</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                      {getDisplaySocialLinks(owner.social_links).map((link) => (
                                        <a key={link} href={link} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-blue-700 hover:underline">
                                          {new URL(link).hostname.replace(/^www\./, '')}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </section>
                <div className="px-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddOwnerForm((prev) => !prev);
                        setAddOwnerError(null);
                      }}
                      className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() => openRemovePicker('owner')}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      - Remove
                    </button>
                  </div>
                  {showAddOwnerForm ? (
                    <div className="rounded-xl border border-blue-100 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tell us what you know</h3>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input type="text" value={ownerInput.name} onChange={(e) => setOwnerInput((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={ownerInput.websiteUrl} onChange={(e) => setOwnerInput((prev) => ({ ...prev, websiteUrl: e.target.value }))} placeholder="Website URL (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={ownerInput.socialUrl} onChange={(e) => setOwnerInput((prev) => ({ ...prev, socialUrl: e.target.value }))} placeholder="Social URL (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={ownerInput.anyUrl} onChange={(e) => setOwnerInput((prev) => ({ ...prev, anyUrl: e.target.value }))} placeholder="Any other URL (optional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                      </div>
                      {addOwnerError ? <p className="mt-3 text-sm text-rose-700">{addOwnerError}</p> : null}
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" onClick={() => void buildOwnerDraft()} disabled={isBuildingOwnerDraft} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60">{isBuildingOwnerDraft ? 'Building...' : 'Build Profile ->'}</button>
                        <button type="button" onClick={() => setShowAddOwnerForm(false)} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}


            {route === 'owner' ? (
              selectedOwner ? (
                <section className="space-y-6">
                  <div>
                    <a href="#/owners" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">Back to Owners</a>
                  </div>

                  <article className="surface-card overflow-hidden rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]">
                      <img src={ownerImageSrc(selectedOwner)} alt={selectedOwner.owner_name} className="h-full w-full object-cover" />
                      <div className="p-5">
                        <p className="text-3xl font-semibold tracking-tight text-slate-900">{selectedOwner.owner_name}</p>
                        <p className="mt-1 text-sm text-slate-500">{selectedOwner.owner_id} - {selectedOwner.profile_status}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">Type: {selectedOwner.entity_type}</span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedOwnerHorses.length} horses</span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedOwnerLeases.length} leases</span>
                        </div>
                        {selectedOwner.website && selectedOwner.website !== '#' ? (
                          <div className="mt-4">
                            <a href={selectedOwner.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Website <ExternalLink size={11} /></a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>

                  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Owner Details</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Entity Type:</span> {selectedOwner.entity_type}</p>
                        <p><span className="font-semibold text-slate-900">Contact Person:</span> {selectedOwner.contact_name}</p>
                        <p><span className="font-semibold text-slate-900">Phone:</span> {selectedOwner.phone}</p>
                        <p><span className="font-semibold text-slate-900">Email:</span> {selectedOwner.email}</p>
                        <p><span className="font-semibold text-slate-900">Website:</span> {selectedOwner.website && selectedOwner.website !== '#' ? <a href={selectedOwner.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{selectedOwner.website}</a> : 'Not set'}</p>
                      </div>
                    </article>

                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Additional Info</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Linked Documents:</span> {selectedOwnerDocs.length}</p>
                        <p><span className="font-semibold text-slate-900">Notes:</span> {selectedOwner.notes || 'No internal notes recorded.'}</p>
                      </div>
                    </article>
                  </section>

                  <article className="surface-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Associated Horses</h3>
                    {selectedOwnerHorses.length ? (
                      <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-3 py-2 font-semibold">Horse</th>
                              <th className="px-3 py-2 font-semibold">Status</th>
                              <th className="px-3 py-2 font-semibold">Trainer / Stable</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOwnerHorses.map((horse) => (
                              <tr key={horse.horse_id} className="border-t border-slate-100 text-slate-700">
                                <td className="px-3 py-2"><a href={`#/horse/${encodeURIComponent(horse.horse_id)}`} className="font-semibold text-blue-700 hover:underline">{horse.horse_name}</a></td>
                                <td className="px-3 py-2">{horse.horse_status} - {horse.identity_status}</td>
                                <td className="px-3 py-2">{trainerById.get(horse.trainer_id)?.stable_name ?? trainerById.get(horse.trainer_id)?.trainer_name ?? 'Unknown'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="mt-3 text-sm text-slate-500">No horses linked to this owner.</p>}
                  </article>
                </section>
              ) : (
                <div className="surface-card rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Owner profile not found in SSOT snapshot.</div>
              )
            ) : null}

            {route === 'governingBodies' ? (
              <section className="space-y-4">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {allGoverningBodies.map((body) => (
                    <article key={body.governing_body_code} className="surface-card rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => { window.location.hash = `#/governing-body/${encodeURIComponent(body.governing_body_code)}`; }}
                          className="text-left text-xl font-semibold tracking-tight text-slate-900 hover:underline"
                        >
                          {body.governing_body_name}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGoverningExpandedCode(body.governing_body_code);
                              setEditingGoverningCode(body.governing_body_code);
                              setGoverningEditDraft({ ...body });
                            }}
                            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Update
                          </button>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{body.governing_body_code}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{body.status}</p>
                      {governingExpandedCode === body.governing_body_code ? (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                          {editingGoverningCode === body.governing_body_code && governingEditDraft ? (
                            <div className="space-y-2">
                              <input value={governingEditDraft.governing_body_code} onChange={(e) => setGoverningEditDraft((prev) => (prev ? { ...prev, governing_body_code: e.target.value } : prev))} placeholder="Code" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                              <input value={governingEditDraft.governing_body_name} onChange={(e) => setGoverningEditDraft((prev) => (prev ? { ...prev, governing_body_name: e.target.value } : prev))} placeholder="Name" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                              <input value={governingEditDraft.website} onChange={(e) => setGoverningEditDraft((prev) => (prev ? { ...prev, website: e.target.value } : prev))} placeholder="Website" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                              <input value={governingEditDraft.status} onChange={(e) => setGoverningEditDraft((prev) => (prev ? { ...prev, status: e.target.value } : prev))} placeholder="Status" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                              <textarea value={governingEditDraft.notes ?? ''} onChange={(e) => setGoverningEditDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))} rows={3} placeholder="Notes" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={saveGoverningUpdate} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Save Update</button>
                                <button type="button" onClick={() => { setEditingGoverningCode(null); setGoverningEditDraft(null); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p><span className="font-semibold text-slate-900">Code:</span> {body.governing_body_code}</p>
                              <p><span className="font-semibold text-slate-900">Name:</span> {body.governing_body_name}</p>
                              <p><span className="font-semibold text-slate-900">Status:</span> {body.status}</p>
                              <p><span className="font-semibold text-slate-900">Website:</span> <a href={body.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{body.website}</a></p>
                              {body.notes ? <p><span className="font-semibold text-slate-900">Notes:</span> {body.notes}</p> : null}
                            </>
                          )}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </section>
                <div className="px-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddGoverningForm((prev) => !prev);
                        setAddGoverningError(null);
                      }}
                      className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() => openRemovePicker('governing')}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      - Remove
                    </button>
                  </div>
                  {showAddGoverningForm ? (
                    <form onSubmit={handleAddGoverningBody} className="rounded-xl border border-blue-100 bg-slate-50 p-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input type="text" value={newGoverningBody.code} onChange={(e) => setNewGoverningBody((prev) => ({ ...prev, code: e.target.value }))} placeholder="Code (e.g. NZTR)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="text" value={newGoverningBody.name} onChange={(e) => setNewGoverningBody((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <input type="url" value={newGoverningBody.website} onChange={(e) => setNewGoverningBody((prev) => ({ ...prev, website: e.target.value }))} placeholder="Website" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        <select value={newGoverningBody.status} onChange={(e) => setNewGoverningBody((prev) => ({ ...prev, status: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </select>
                      </div>
                      {addGoverningError ? <p className="mt-3 text-sm text-rose-700">{addGoverningError}</p> : null}
                      <div className="mt-3 flex items-center gap-2">
                        <button type="submit" className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">Save Governing Body</button>
                        <button type="button" onClick={() => setShowAddGoverningForm(false)} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </section>
            ) : null}

            {route === 'governingBody' ? (
              selectedGoverningBody ? (
                <section className="space-y-6">
                  <div>
                    <a href="#/governing-bodies" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">Back to Governing Bodies</a>
                  </div>

                  <article className="surface-card rounded-xl p-5">
                    <p className="text-3xl font-semibold tracking-tight text-slate-900">{selectedGoverningBody.governing_body_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{selectedGoverningBody.governing_body_code} - {selectedGoverningBody.status}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedGoverningHorses.length} horses</span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedGoverningLeases.length} leases</span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">{selectedGoverningDocs.length} docs</span>
                    </div>
                    {selectedGoverningBody.website && selectedGoverningBody.website !== '#' ? (
                      <div className="mt-4">
                        <a href={selectedGoverningBody.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Website <ExternalLink size={11} /></a>
                      </div>
                    ) : null}
                  </article>

                  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Governing Body Details</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Code:</span> {selectedGoverningBody.governing_body_code}</p>
                        <p><span className="font-semibold text-slate-900">Status:</span> {selectedGoverningBody.status}</p>
                        <p><span className="font-semibold text-slate-900">Website:</span> {selectedGoverningBody.website && selectedGoverningBody.website !== '#' ? <a href={selectedGoverningBody.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{selectedGoverningBody.website}</a> : 'Not set'}</p>
                        {selectedGoverningBody.governing_body_code === 'NZTR' ? (
                          <p><span className="font-semibold text-slate-900">Compliance:</span> <a href="#/compliance/jurisdiction/new-zealand" className="text-blue-700 hover:underline">New Zealand compliance references</a></p>
                        ) : null}
                      </div>
                    </article>

                    <article className="surface-card rounded-xl p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Additional Info</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Notes:</span> {selectedGoverningBody.notes || 'No internal notes recorded.'}</p>
                      </div>
                    </article>
                  </section>

                  <article className="surface-card rounded-xl p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Associated Horses</h3>
                    {selectedGoverningHorses.length ? (
                      <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-3 py-2 font-semibold">Horse</th>
                              <th className="px-3 py-2 font-semibold">Trainer / Stable</th>
                              <th className="px-3 py-2 font-semibold">Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedGoverningHorses.map((horse) => (
                              <tr key={horse.horse_id} className="border-t border-slate-100 text-slate-700">
                                <td className="px-3 py-2"><a href={`#/horse/${encodeURIComponent(horse.horse_id)}`} className="font-semibold text-blue-700 hover:underline">{horse.horse_name}</a></td>
                                <td className="px-3 py-2">{trainerById.get(horse.trainer_id)?.stable_name ?? trainerById.get(horse.trainer_id)?.trainer_name ?? 'Unknown'}</td>
                                <td className="px-3 py-2">{ownerById.get(horse.owner_id)?.owner_name ?? 'Unknown'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="mt-3 text-sm text-slate-500">No horses linked to this governing body.</p>}
                  </article>
                </section>
              ) : (
                <div className="surface-card rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Governing body profile not found in SSOT snapshot.</div>
              )
            ) : null}

            {route === 'leases' ? (
              <Suspense fallback={<RouteLoadingFallback />}>
                <LeaseRoute
                  filteredLeases={filteredLeases}
                  horseById={horseById}
                  leaseTab={leaseTab}
                  leaseHorseFilter={leaseHorseFilter}
                  leaseStatusFilter={leaseStatusFilter}
                  showLeaseHorseFilter={showLeaseHorseFilter}
                  showLeaseStatusFilter={showLeaseStatusFilter}
                  leaseHorseOptions={leaseHorseOptions}
                  setLeaseTab={setLeaseTab}
                  setLeaseHorseFilter={setLeaseHorseFilter}
                  setLeaseStatusFilter={setLeaseStatusFilter}
                  setShowLeaseHorseFilter={setShowLeaseHorseFilter}
                  setShowLeaseStatusFilter={setShowLeaseStatusFilter}
                  formatNzd={formatNzd}
                  leaseStatusBadgeClass={leaseStatusBadgeClass}
                  openHltWizard={openHltWizard}
                />
              </Suspense>
            ) : null}
            {['documentsTemplates', 'documentsGenerated', 'complianceNewZealand', 'complianceDubai', 'complianceSsot', 'complianceArchive'].includes(route) ? (
              <Suspense fallback={<RouteLoadingFallback />}>
                <ReferenceRoute
                  route={route as 'documentsTemplates' | 'documentsGenerated' | 'complianceNewZealand' | 'complianceDubai' | 'complianceSsot' | 'complianceArchive'}
                  documents={seed?.documents ?? []}
                  horseById={horseById}
                  docWebHref={docWebHref}
                  archivedRecords={archivedRecords}
                  onRestoreArchivedRecord={restoreArchivedRecord}
                />
              </Suspense>
            ) : null}

            {showRemovePickerKind ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {showRemovePickerKind === 'horse'
                      ? 'Select Horse To Archive'
                      : showRemovePickerKind === 'trainer'
                        ? 'Select Trainer To Archive'
                        : showRemovePickerKind === 'owner'
                          ? 'Select Owner To Archive'
                          : 'Select Governing Body To Archive'}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {showRemovePickerKind === 'horse' && removableHorses.length ? removableHorses.map((horse) => (
                      <button key={horse.horse_id} type="button" onClick={() => setRemoveCandidateId(horse.horse_id)} className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${removeCandidateId === horse.horse_id ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{horse.horse_name} ({horse.horse_id})</button>
                    )) : null}
                    {showRemovePickerKind === 'trainer' && removableTrainers.length ? removableTrainers.map((trainer) => (
                      <button key={trainer.trainer_id} type="button" onClick={() => setRemoveCandidateId(trainer.trainer_id)} className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${removeCandidateId === trainer.trainer_id ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{trainer.trainer_name} ({trainer.trainer_id})</button>
                    )) : null}
                    {showRemovePickerKind === 'owner' && removableOwners.length ? removableOwners.map((owner) => (
                      <button key={owner.owner_id} type="button" onClick={() => setRemoveCandidateId(owner.owner_id)} className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${removeCandidateId === owner.owner_id ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{owner.owner_name} ({owner.owner_id})</button>
                    )) : null}
                    {showRemovePickerKind === 'governing' && removableGoverningBodies.length ? removableGoverningBodies.map((body) => (
                      <button key={body.governing_body_code} type="button" onClick={() => setRemoveCandidateId(body.governing_body_code)} className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${removeCandidateId === body.governing_body_code ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{body.governing_body_name} ({body.governing_body_code})</button>
                    )) : null}
                    {(showRemovePickerKind === 'horse' && !removableHorses.length)
                    || (showRemovePickerKind === 'trainer' && !removableTrainers.length)
                    || (showRemovePickerKind === 'owner' && !removableOwners.length)
                    || (showRemovePickerKind === 'governing' && !removableGoverningBodies.length) ? (
                      <p className="text-sm text-slate-500">No removable custom records are available. Seed records stay protected in the live registry.</p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => { setShowRemovePickerKind(null); setRemoveCandidateId(''); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button
                      type="button"
                      disabled={!selectedRemoveTarget}
                      onClick={() => {
                        if (!selectedRemoveTarget) return;
                        setRemovalTarget(selectedRemoveTarget);
                        setShowRemovePickerKind(null);
                        setRemoveCandidateId('');
                      }}
                      className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {removalTarget ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Archive this {removalTarget.kind} from the live registry?</h3>
                  <p className="mt-2 text-sm text-slate-600">This will remove {removalTarget.name} ({removalTarget.id}) from the live registry, keep its record in Archive, and allow it to be restored later.</p>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setRemovalTarget(null)} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">No</button>
                    <button
                      type="button"
                      onClick={executeConfirmedRemoval}
                      className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {showHltWizard ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
                <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-slate-900">
                    New HLT - Step {hltStep} of 3: {hltStep === 1 ? 'Entities' : hltStep === 2 ? 'Commercial Terms' : 'Review & Edit'}
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    {[1, 2, 3].map((step) => (
                      <React.Fragment key={step}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${hltStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{step}</div>
                        {step < 3 ? <div className={`h-1 flex-1 rounded ${hltStep > step ? 'bg-blue-500' : 'bg-slate-200'}`} /> : null}
                      </React.Fragment>
                    ))}
                  </div>

                  {hltStep === 1 ? (
                    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Entities</h4>
                        <div className="mt-3 space-y-3">
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Submission Date</span>
                            <input type="date" value={hltDraft.submissionDate} onChange={(e) => setHltDraft((prev) => ({ ...prev, submissionDate: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Select Horse</span>
                            <select
                              value={hltDraft.horseId}
                              onChange={(e) => setHltDraft((prev) => ({ ...prev, horseId: e.target.value }))}
                              className="w-full rounded-md border border-slate-300 px-3 py-2"
                            >
                              <option value="">Select horse...</option>
                              {allHorses.map((horse) => (
                                <option key={horse.horse_id} value={horse.horse_id}>{horse.horse_name}</option>
                              ))}
                            </select>
                          </label>
                          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                            <p><span className="font-semibold text-slate-900">Horse display:</span> {hltHorse ? `${hltHorse.horse_name} (${hltHorse.country_code}) ${extractFoalingYear(hltHorse.foaling_date)}` : 'n/a'}</p>
                            <p className="mt-1"><span className="font-semibold text-slate-900">Governing Body:</span> {hltGoverningBody ? `${hltGoverningBody.governing_body_name} (${hltGoverningBody.governing_body_code})` : 'n/a'}</p>
                            {hltHorse ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setHltGoverningOverride((prev) => {
                                    const next = !prev;
                                    if (!next) {
                                      setHltDraft((draftPrev) => ({ ...draftPrev, governingBodyCode: hltHorse.governing_body_code }));
                                    }
                                    return next;
                                  });
                                }}
                                className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
                              >
                                {hltGoverningOverride ? 'Use Horse Default' : 'Override'}
                              </button>
                            ) : null}
                            {hltHorse && hltGoverningOverride ? (
                              <select
                                value={hltDraft.governingBodyCode}
                                onChange={(e) => setHltDraft((prev) => ({ ...prev, governingBodyCode: e.target.value }))}
                                className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              >
                                {allGoverningBodies.map((body) => (
                                  <option key={body.governing_body_code} value={body.governing_body_code}>{body.governing_body_code} - {body.governing_body_name}</option>
                                ))}
                              </select>
                            ) : null}
                          </div>
                        </div>
                      </section>
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Counterparties</h4>
                        <div className="mt-3 space-y-3">
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Select Trainer / Stable</span>
                            <select
                              value={hltDraft.trainerId}
                              onChange={(e) => setHltDraft((prev) => ({ ...prev, trainerId: e.target.value }))}
                              className="w-full rounded-md border border-slate-300 px-3 py-2"
                            >
                              <option value="">Select trainer...</option>
                              {allTrainers.map((trainer) => (
                                <option key={trainer.trainer_id} value={trainer.trainer_id}>{trainer.trainer_name}</option>
                              ))}
                            </select>
                          </label>
                          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                            <p><span className="font-semibold text-slate-900">Stable name:</span> {hltTrainer?.stable_name || 'n/a'}</p>
                            <p className="mt-1"><span className="font-semibold text-slate-900">Location:</span> {hltTrainer?.notes || 'n/a'}</p>
                          </div>
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Select Owner</span>
                            <select
                              value={hltDraft.ownerId}
                              onChange={(e) => setHltDraft((prev) => ({ ...prev, ownerId: e.target.value }))}
                              className="w-full rounded-md border border-slate-300 px-3 py-2"
                            >
                              <option value="">Select owner...</option>
                              {allOwners.map((owner) => (
                                <option key={owner.owner_id} value={owner.owner_id}>{owner.owner_name}</option>
                              ))}
                            </select>
                          </label>
                          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                            <p><span className="font-semibold text-slate-900">Owner display name:</span> {hltOwner?.owner_name || 'n/a'}</p>
                          </div>
                        </div>
                      </section>
                      <section className="rounded-xl border border-slate-200 bg-slate-100 p-4 lg:col-span-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Auto-generated</h4>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Token Name</p>
                            <p className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-900">{hltDraft.tokenName || 'Waiting for horse selection...'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ERC20 Identifier</p>
                            <p className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900">{hltDraft.erc20Identifier || 'Waiting for horse selection...'}</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  ) : null}

                  {hltStep === 2 ? (
                    <div className="mt-5 space-y-4">
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Section A - Lease Period</h4>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">HLT Lease Start Date</span>
                            <input type="date" value={hltDraft.leaseStartDate} onChange={(e) => setHltDraft((prev) => ({ ...prev, leaseStartDate: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Lease Length (months)</span>
                            <input type="number" min="1" step="1" value={hltDraft.leaseLengthMonths} onChange={(e) => setHltDraft((prev) => ({ ...prev, leaseLengthMonths: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <div className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">HLT Lease End Date</span>
                            <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700">{hltLeaseEndDate || 'Calculated from start + length'}</p>
                          </div>
                        </div>
                      </section>
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Section B - Stakes Split</h4>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Investor Stakes Split (%)</span>
                            <input type="number" min="0" max="100" value={hltInvestorInputValue} onChange={(e) => onHltInvestorSplitChange(e.target.value)} placeholder="__%" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Owner Stakes Split (%)</span>
                            <input type="number" min="0" max="100" value={hltDraft.ownerStakesSplit} onChange={(e) => onHltOwnerSplitChange(e.target.value)} placeholder="__%" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Stakes split represents the division of race winnings between owner and tokenholders.</p>
                      </section>
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Section C - Token Issuance</h4>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Percentage of horse leased (%)</span>
                            <input type="number" min="0" value={hltDraft.percentageLeased} onChange={(e) => setHltDraft((prev) => ({ ...prev, percentageLeased: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Number of Tokens</span>
                            <input type="number" min="1" step="1" value={hltDraft.numTokens} onChange={(e) => setHltDraft((prev) => ({ ...prev, numTokens: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Token Price (NZD)</span>
                            <input type="number" min="0" step="0.01" value={hltDraft.tokenPriceNzd} onChange={(e) => onHltTokenPriceChange(e.target.value)} placeholder="$--" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                          <label className="text-sm">
                            <span className="mb-1 block font-medium text-slate-700">Price Per 1%/month</span>
                            <input type="number" min="0" step="0.0001" value={hltDraft.percentagePrice} onChange={(e) => onHltPercentagePriceChange(e.target.value)} placeholder="__%" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                          </label>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Enter token price or percentage - the other will be calculated automatically.</p>
                        <p className="mt-3 text-lg font-semibold text-slate-900">Total Issuance Value: {formatNzd(String(hltTotalIssuanceValue.toFixed(2)))}</p>
                      </section>
                      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Section D - Variations</h4>
                        <textarea
                          rows={3}
                          value={hltDraft.variations}
                          onChange={(e) => setHltDraft((prev) => ({ ...prev, variations: e.target.value }))}
                          placeholder="n/a"
                          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </section>
                    </div>
                  ) : null}
                  {hltStep === 3 ? (
                    <div className="mt-5">
                      <h4 className="text-base font-semibold text-slate-900">Review Before Generating - {hltDraft.tokenName || 'New HLT'}</h4>
                      <p className="mt-1 text-xs text-slate-500">Click values to edit inline. Click outside a value to confirm edits.</p>
                      <div className="mt-4 rounded-xl border border-slate-300 bg-white p-8 shadow-sm">
                        <h5 className="text-center text-xl font-bold text-slate-900">Horse Lease Token ("HLT") New Issuance Details</h5>
                        <hr className="mx-auto my-4 w-2/3 border-t border-slate-900" />
                        <div className="space-y-3 text-[15px] leading-relaxed text-slate-900">
                          <p><span className="mr-2 font-semibold">1.</span>Issuance Submission Date: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('submissionDate', e.currentTarget.textContent?.trim() || '')} className="rounded px-1 hover:bg-slate-100">{hltDraft.submissionDate || 'YYYY-MM-DD'}</span></p>
                          <p><span className="mr-2 font-semibold">2.</span>Token Name: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('tokenName', e.currentTarget.textContent?.trim() || '')} className="rounded bg-slate-50 px-1 font-mono hover:bg-slate-100">{hltDraft.tokenName}</span></p>
                          <p className="pl-6 text-sm text-slate-700">ERC20 blockchain identifier for this token will be: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('erc20Identifier', e.currentTarget.textContent?.trim() || '')} className="rounded bg-slate-50 px-1 font-mono hover:bg-slate-100">{hltDraft.erc20Identifier}</span></p>
                          <p><span className="mr-2 font-semibold">3.</span>Horse Microchip Number: <span>{hltHorse?.microchip_number || 'n/a'}</span></p>
                          <p><span className="mr-2 font-semibold">4.</span>Token Issuance Particulars: <span className="text-sm text-slate-500">(Priced in NZD to be converted to AED prior to issuance)</span></p>
                          <p className="pl-6">a. Number of Tokens issued:- <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('numTokens', e.currentTarget.textContent?.trim() || '')} className="rounded px-1 font-semibold hover:bg-slate-100">{hltDraft.numTokens || '0'}</span></p>
                          <p className="pl-6">b. Token Price:- <span contentEditable suppressContentEditableWarning onBlur={(e) => onHltTokenPriceChange(e.currentTarget.textContent?.replace(/[^0-9.]/g, '') || '')} className="rounded px-1 font-semibold hover:bg-slate-100">${parseNumber(hltDraft.tokenPriceNzd).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                          <p className="pl-6">c. Total Issuance Value:- <span className="rounded px-1 font-semibold">${hltTotalIssuanceValue.toLocaleString('en-NZ')}</span></p>
                          <p><span className="mr-2 font-semibold">5.</span>Horse(s): <span>{hltHorse ? `${hltHorse.horse_name} (${hltHorse.country_code}) ${extractFoalingYear(hltHorse.foaling_date)}` : 'n/a'}</span></p>
                          <p><span className="mr-2 font-semibold">6.</span>Stable / Trainer: <span>{hltTrainer ? `${hltTrainer.trainer_name}${hltTrainer.notes ? `, ${hltTrainer.notes}` : ''}` : 'n/a'}</span></p>
                          <p><span className="mr-2 font-semibold">7.</span>Horse Asset Lease/Owner: <span>{hltOwner?.owner_name || 'n/a'}</span></p>
                          <p><span className="mr-2 font-semibold">8.</span>Governing Body: <span>{hltGoverningBody ? `${hltGoverningBody.governing_body_name} (${hltGoverningBody.governing_body_code})` : 'n/a'}</span></p>
                          <p><span className="mr-2 font-semibold">9.</span>Product commercial details:</p>
                          <p className="pl-6">a. HLT Lease period: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('leaseLengthMonths', e.currentTarget.textContent?.replace(/[^0-9]/g, '') || '')} className="rounded px-1 hover:bg-slate-100">{hltDraft.leaseLengthMonths || '0'}</span> Months commencing <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('leaseStartDate', e.currentTarget.textContent?.trim() || '')} className="rounded px-1 hover:bg-slate-100">{hltDraft.leaseStartDate || 'YYYY-MM-DD'}</span></p>
                          <p className="pl-6">b. Stakes Split: Agreed split of race winnings between owner and investor. For this Issuance the split is <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('ownerStakesSplit', e.currentTarget.textContent?.replace(/[^0-9.]/g, '') || '')} className="rounded px-1 hover:bg-slate-100">{hltDraft.ownerStakesSplit || '0'}</span>/<span>{hltInvestorSplit}</span> in favour of the tokenholders.</p>
                          <p><span className="mr-2 font-semibold">10.</span>Variations: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateHltReviewField('variations', e.currentTarget.textContent?.trim() || 'n/a')} className="rounded px-1 hover:bg-slate-100">{hltDraft.variations || 'n/a'}</span></p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {hltError ? <p className="mt-4 text-sm text-rose-700">{hltError}</p> : null}
                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
                    <button type="button" onClick={moveHltStepBack} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
                    {hltStep < 3 ? (
                      <button type="button" onClick={moveHltStepForward} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">Next →</button>
                    ) : (
                      <button type="button" onClick={generateAndSaveHlt} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">Generate & Save HLT Document</button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {showHorseReviewModal && horseDraft ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Review Before Saving — {horseDraft.horseName.value || horseDraft.horseId}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <CarouselDots count={4} active={horseReviewPanel} />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panel {horseReviewPanel + 1} of 4</p>
                  </div>
                  {horseReviewPanel === 0 ? (
                    <div className="mt-4 space-y-3">
                      <img src={horseDraft.imageFile ? URL.createObjectURL(horseDraft.imageFile) : horseDraft.imageUrl} alt="Horse review" className="h-60 w-full rounded-lg object-cover" />
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;
                        setHorseDraft((prev) => (prev ? { ...prev, imageFile: file, imageUrl: URL.createObjectURL(file), imageFound: true } : prev));
                      }} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InlineEditableField label="Horse Name" field={horseDraft.horseName} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, horseName: next } : prev))} />
                        <InlineEditableField label="Country" field={horseDraft.countryCode} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, countryCode: next } : prev))} />
                        <InlineEditableField label="Foaled" field={horseDraft.foalingDate} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, foalingDate: next } : prev))} />
                        <InlineEditableField label="Sex" field={horseDraft.sex} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, sex: next } : prev))} />
                        <InlineEditableField label="Colour" field={horseDraft.colour} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, colour: next } : prev))} />
                        <InlineEditableField label="Sire" field={horseDraft.sire} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, sire: next } : prev))} />
                        <InlineEditableField label="Dam" field={horseDraft.dam} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, dam: next } : prev))} />
                        <InlineEditableField label="NZTR Life #" field={horseDraft.nztrLifeNumber} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, nztrLifeNumber: next } : prev))} />
                        <InlineEditableField label="Microchip" field={horseDraft.microchipNumber} onChange={(next) => setHorseDraft((prev) => (prev ? { ...prev, microchipNumber: next } : prev))} />
                      </div>
                    </div>
                  ) : null}
                  {horseReviewPanel === 1 ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stable / Trainer</h4>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <select value={horseDraft.trainerId} onChange={(e) => setHorseDraft((prev) => (prev ? { ...prev, trainerId: e.target.value } : prev))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                          {allTrainers.map((trainer) => <option key={trainer.trainer_id} value={trainer.trainer_id}>{trainer.trainer_name} ({trainer.stable_name})</option>)}
                        </select>
                        <div className="text-sm text-slate-700">
                          <p><span className="font-semibold text-slate-900">Contact Person:</span> {trainerById.get(horseDraft.trainerId)?.contact_name ?? 'Unknown'}</p>
                          <p><span className="font-semibold text-slate-900">Phone:</span> {trainerById.get(horseDraft.trainerId)?.phone ?? 'Unknown'}</p>
                          <p><span className="font-semibold text-slate-900">Email:</span> {trainerById.get(horseDraft.trainerId)?.email ?? 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {horseReviewPanel === 2 ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Owner</h4>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <select value={horseDraft.ownerId} onChange={(e) => setHorseDraft((prev) => (prev ? { ...prev, ownerId: e.target.value } : prev))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                          {allOwners.map((owner) => <option key={owner.owner_id} value={owner.owner_id}>{owner.owner_name}</option>)}
                        </select>
                        <div className="text-sm text-slate-700">
                          <p><span className="font-semibold text-slate-900">Type:</span> {ownerById.get(horseDraft.ownerId)?.entity_type ?? 'Unknown'}</p>
                          <p><span className="font-semibold text-slate-900">Contact Person:</span> {ownerById.get(horseDraft.ownerId)?.contact_name ?? 'Unknown'}</p>
                          <p><span className="font-semibold text-slate-900">Email:</span> {ownerById.get(horseDraft.ownerId)?.email ?? 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {horseReviewPanel === 3 ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Governing Body</h4>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <select value={horseDraft.governingBodyCode} onChange={(e) => setHorseDraft((prev) => (prev ? { ...prev, governingBodyCode: e.target.value } : prev))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                          {allGoverningBodies.map((body) => <option key={body.governing_body_code} value={body.governing_body_code}>{body.governing_body_code} — {body.governing_body_name}</option>)}
                        </select>
                        <div className="text-sm text-slate-700">
                          <p><span className="font-semibold text-slate-900">Name:</span> {governingBodyByCode.get(horseDraft.governingBodyCode)?.governing_body_name ?? 'Unknown'}</p>
                          <p><span className="font-semibold text-slate-900">Status:</span> {governingBodyByCode.get(horseDraft.governingBodyCode)?.status ?? 'Unknown'}</p>
                          <p><span className="font-semibold text-slate-900">Website:</span> {governingBodyByCode.get(horseDraft.governingBodyCode)?.website ?? 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                    <button type="button" onClick={() => { setShowHorseReviewModal(false); setHorseDraft(null); setShowAddHorseForm(true); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setHorseReviewPanel((prev) => Math.max(0, prev - 1))} disabled={horseReviewPanel === 0} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">← Prev</button>
                      <button type="button" onClick={() => setHorseReviewPanel((prev) => Math.min(3, prev + 1))} disabled={horseReviewPanel === 3} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">→ Next</button>
                      <button type="button" onClick={saveHorseProfile} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">✓ Confirm & Save</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {showTrainerReviewModal && trainerDraft ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Review Before Saving — {trainerDraft.name.value || 'Trainer/Stable'}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <CarouselDots count={2} active={trainerReviewPanel} />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panel {trainerReviewPanel + 1} of 2</p>
                  </div>
                  {trainerReviewPanel === 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <InlineEditableField
                        label="Trainer/Stable"
                        field={trainerDraft.name}
                        onChange={(next) => setTrainerDraft((prev) => (prev ? {
                          ...prev,
                          name: next,
                          stableName: { ...prev.stableName, value: next.value, editing: false, found: next.found, confidence: next.confidence },
                        } : prev))}
                      />
                      <InlineEditableField label="Contact Person" field={trainerDraft.contactName} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, contactName: next } : prev))} />
                      <InlineEditableField label="Phone" field={trainerDraft.phone} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, phone: next } : prev))} />
                      <InlineEditableField label="Email" field={trainerDraft.email} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, email: next } : prev))} type="email" />
                      <InlineEditableField label="Website" field={trainerDraft.website} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, website: next } : prev))} type="url" />
                      <InlineEditableField label="Facebook" field={trainerDraft.facebook} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, facebook: next } : prev))} type="url" />
                      <InlineEditableField label="X" field={trainerDraft.x} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, x: next } : prev))} type="url" />
                      <InlineEditableField label="Instagram" field={trainerDraft.instagram} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, instagram: next } : prev))} type="url" />
                      <InlineEditableField label="Image URL" field={trainerDraft.imageUrl} onChange={(next) => setTrainerDraft((prev) => (prev ? { ...prev, imageUrl: next } : prev))} type="url" />
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">Image preview</p>
                        <img src={trainerDraftImageFile ? URL.createObjectURL(trainerDraftImageFile) : (trainerDraft.imageUrl.value || '/horse-images/silhouette.svg')} alt="Trainer preview" className="mt-2 h-36 w-full rounded-md object-cover" />
                        <input type="file" accept="image/*" onChange={(e) => setTrainerDraftImageFile(e.target.files?.[0] ?? null)} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
                      </div>
                    </div>
                  ) : null}
                  {trainerReviewPanel === 1 ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h4>
                      <textarea value={trainerDraft.notes} onChange={(e) => setTrainerDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))} rows={8} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                    <button type="button" onClick={() => { setShowTrainerReviewModal(false); setTrainerDraft(null); setTrainerDraftImageFile(null); setShowAddTrainerForm(true); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setTrainerReviewPanel((prev) => Math.max(0, prev - 1))} disabled={trainerReviewPanel === 0} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">← Prev</button>
                      <button type="button" onClick={() => setTrainerReviewPanel((prev) => Math.min(1, prev + 1))} disabled={trainerReviewPanel === 1} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">→ Next</button>
                      <button type="button" onClick={saveTrainerProfile} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">✓ Confirm & Save</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {showOwnerReviewModal && ownerDraft ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Review Before Saving — {ownerDraft.name.value || 'Owner'}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <CarouselDots count={2} active={ownerReviewPanel} />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panel {ownerReviewPanel + 1} of 2</p>
                  </div>
                  {ownerReviewPanel === 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <InlineEditableField label="Owner / entity name" field={ownerDraft.name} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, name: next } : prev))} />
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">Entity Type</p>
                        <select value={ownerDraft.entityType.value || 'company'} onChange={(e) => setOwnerDraft((prev) => (prev ? { ...prev, entityType: { ...prev.entityType, value: e.target.value, editing: false } } : prev))} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                          <option value="company">Company</option>
                          <option value="trust">Trust</option>
                          <option value="individual">Individual</option>
                        </select>
                      </div>
                      <InlineEditableField label="Contact Person" field={ownerDraft.contactName} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, contactName: next } : prev))} />
                      <InlineEditableField label="Phone" field={ownerDraft.phone} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, phone: next } : prev))} />
                      <InlineEditableField label="Email" field={ownerDraft.email} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, email: next } : prev))} type="email" />
                      <InlineEditableField label="Website" field={ownerDraft.website} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, website: next } : prev))} type="url" />
                      <InlineEditableField label="Facebook" field={ownerDraft.facebook} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, facebook: next } : prev))} type="url" />
                      <InlineEditableField label="X" field={ownerDraft.x} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, x: next } : prev))} type="url" />
                      <InlineEditableField label="Instagram" field={ownerDraft.instagram} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, instagram: next } : prev))} type="url" />
                      <InlineEditableField label="Image URL" field={ownerDraft.imageUrl} onChange={(next) => setOwnerDraft((prev) => (prev ? { ...prev, imageUrl: next } : prev))} type="url" />
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">Image preview</p>
                        <img src={ownerDraftImageFile ? URL.createObjectURL(ownerDraftImageFile) : (ownerDraft.imageUrl.value || '/horse-images/silhouette.svg')} alt="Owner preview" className="mt-2 h-36 w-full rounded-md object-cover" />
                        <input type="file" accept="image/*" onChange={(e) => setOwnerDraftImageFile(e.target.files?.[0] ?? null)} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
                      </div>
                    </div>
                  ) : null}
                  {ownerReviewPanel === 1 ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h4>
                      <textarea value={ownerDraft.notes} onChange={(e) => setOwnerDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))} rows={8} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                    <button type="button" onClick={() => { setShowOwnerReviewModal(false); setOwnerDraft(null); setOwnerDraftImageFile(null); setShowAddOwnerForm(true); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setOwnerReviewPanel((prev) => Math.max(0, prev - 1))} disabled={ownerReviewPanel === 0} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">← Prev</button>
                      <button type="button" onClick={() => setOwnerReviewPanel((prev) => Math.min(1, prev + 1))} disabled={ownerReviewPanel === 1} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">→ Next</button>
                      <button type="button" onClick={saveOwnerProfile} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">✓ Confirm & Save</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {showGoverningReviewModal && governingDraft ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Review Before Saving — {governingDraft.name.value || governingDraft.code.value}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <CarouselDots count={2} active={governingReviewPanel} />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panel {governingReviewPanel + 1} of 2</p>
                  </div>
                  {governingReviewPanel === 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <InlineEditableField label="Code" field={governingDraft.code} onChange={(next) => setGoverningDraft((prev) => (prev ? { ...prev, code: next } : prev))} />
                      <InlineEditableField label="Full Name" field={governingDraft.name} onChange={(next) => setGoverningDraft((prev) => (prev ? { ...prev, name: next } : prev))} />
                      <InlineEditableField label="Website" field={governingDraft.website} onChange={(next) => setGoverningDraft((prev) => (prev ? { ...prev, website: next } : prev))} type="url" />
                      <InlineEditableField label="Status" field={governingDraft.status} onChange={(next) => setGoverningDraft((prev) => (prev ? { ...prev, status: next } : prev))} />
                    </div>
                  ) : null}
                  {governingReviewPanel === 1 ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h4>
                      <textarea value={governingDraft.notes} onChange={(e) => setGoverningDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))} rows={8} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                    <button type="button" onClick={() => { setShowGoverningReviewModal(false); setGoverningDraft(null); setShowAddGoverningForm(true); }} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setGoverningReviewPanel((prev) => Math.max(0, prev - 1))} disabled={governingReviewPanel === 0} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">← Prev</button>
                      <button type="button" onClick={() => setGoverningReviewPanel((prev) => Math.min(1, prev + 1))} disabled={governingReviewPanel === 1} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">→ Next</button>
                      <button type="button" onClick={saveGoverningBodyProfile} className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">✓ Confirm & Save</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
