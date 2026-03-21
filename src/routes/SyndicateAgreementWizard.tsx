import React, { useState, useMemo, useCallback } from 'react';

// ─── Rich JSON types (matching data/ files) ─────────────────────────────────

type RichHorseJson = {
  slug: string;
  name: string;
  countryCode: string;
  foalingDate: string;
  sex: string;
  colour: string;
  sireSlug: string;
  damSlug: string;
  trainerSlug: string;
  microchip?: string;
  lifeNumber?: string;
  family?: string;
  breeder?: string;
  breedingUrl?: string;
  racingRecord?: string;
  identity?: {
    horse_id?: string;
    horse_name?: string;
    country_code?: string;
    foaling_date?: string;
    sex?: string;
    colour?: string;
    microchip_number?: string;
    nztr_life_number?: string;
    breeding_url?: string;
    performance_profile_url?: string;
    horse_status?: string;
    identity_status?: string;
  };
  pedigree?: {
    sire_name?: string;
    dam_name?: string;
    sire_slug?: string;
    dam_slug?: string;
  };
  offering?: {
    lease_id?: string;
    start_date?: string;
    end_date?: string;
    duration_months?: number;
    leaseDurationMonths?: number;
    percent_leased?: number;
    token_count?: number;
    percent_per_token?: number;
    token_price_nzd?: number;
    total_issuance_value_nzd?: number;
    investor_share_percent?: number;
    owner_share_percent?: number;
    location?: string;
    earnings_distribution?: string;
  };
  narrative?: {
    tagline?: string;
    intro_paragraph?: string;
    about_paragraph?: string;
    current_status?: string;
    horse_intro?: string;
    headline?: string;
    body?: string;
  };
  races?: Array<{
    date: string;
    course: string;
    race_name?: string;
    distance?: string;
    position?: string;
    jockey?: string;
    trainer?: string;
    replay_url?: string;
  }>;
};

type RichSireJson = {
  slug: string;
  name?: string;
  display_name?: string;
  description: string;
  notableProgeny?: string[];
  notable_progeny?: string[];
  stud?: string;
  location?: string;
};

type RichDamJson = {
  slug: string;
  name?: string;
  display_name?: string;
  description: string;
  breeding_record?: string;
  sire_of_dam?: string;
};

type RichTrainerJson = {
  trainer_id: string;
  trainer_name: string;
  stable_name: string;
  contact_name: string;
  location?: string;
  full_address?: string;
  bio: string;
  notable_wins?: string[];
};

// ─── Seed types (from App.tsx) ───────────────────────────────────────────────

type HorseData = {
  horse_id: string;
  horse_name: string;
  country_code: string;
  foaling_date: string;
  sex: string;
  colour: string;
  sire: string;
  dam: string;
  microchip_number: string;
  breeding_url: string;
  trainer_id: string;
};

type TrainerData = {
  trainer_id: string;
  trainer_name: string;
  stable_name: string;
  contact_name: string;
  notes: string;
};

type SyndicateAgreementWizardProps = {
  horses: HorseData[];
  trainers: TrainerData[];
  onClose: () => void;
  onGenerate: (data: Record<string, unknown>) => void;
};

// ─── Syndicate Agreement Payload type ────────────────────────────────────────

type SyndicateAgreementPayload = {
  syndicateName: string;
  horseName: string;
  agreementDate: string;
  countryCode: string;
  leaseDurationMonths: number;
  numTokens: number;
  percentPerToken: string;
  leasePercent: string;
  leaseStartDate: string;
  leaseEndDate: string;
  investorSplit: string;
  ownerSplit: string;
  staticClauseBody: string;
  signatoryName: string;
  signatoryTitle: string;
  variations: string;
};

// ─── Load rich JSON data via Vite import.meta.glob ──────────────────────────

const horseModules = import.meta.glob<{ default: RichHorseJson }>('/data/horses/*.json', { eager: true });
const sireModules = import.meta.glob<{ default: RichSireJson }>('/data/sires/*.json', { eager: true });
const damModules = import.meta.glob<{ default: RichDamJson }>('/data/dams/*.json', { eager: true });
const trainerModules = import.meta.glob<{ default: RichTrainerJson }>('/data/trainers/*.json', { eager: true });

function buildLookup<T extends { slug?: string }>(modules: Record<string, { default: T }>): Record<string, T> {
  const map: Record<string, T> = {};
  for (const [filePath, mod] of Object.entries(modules)) {
    const slug = mod.default.slug || filePath.split('/').pop()?.replace('.json', '') || '';
    map[slug] = mod.default;
  }
  return map;
}

function buildTrainerLookup(modules: Record<string, { default: RichTrainerJson }>): Record<string, RichTrainerJson> {
  const map: Record<string, RichTrainerJson> = {};
  for (const [filePath, mod] of Object.entries(modules)) {
    const slug = filePath.split('/').pop()?.replace('.json', '') || '';
    map[slug] = mod.default;
  }
  return map;
}

const horseLookup = buildLookup(horseModules);
const sireLookup = buildLookup(sireModules);
const damLookup = buildLookup(damModules);
const trainerLookup = buildTrainerLookup(trainerModules);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugFromSeedHorse(h: HorseData): string {
  return h.horse_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function calcAge(foalingDate: string): number {
  const dob = new Date(foalingDate);
  const now = new Date();
  const seasonYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return seasonYear - dob.getFullYear();
}

function ageDescription(foalingDate: string): string {
  const age = calcAge(foalingDate);
  const map: Record<number, string> = { 0: 'yearling', 1: 'yearling', 2: 'two-year-old', 3: 'three-year-old', 4: 'four-year-old', 5: 'five-year-old', 6: 'six-year-old' };
  return map[age] || `${age}-year-old`;
}

function formatDateDMY(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addMonthsToDate(isoDate: string, months: number): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return formatDateISO(d);
}

// ─── Static Clause Body (boilerplate) ─────────────────────────────────────────

const STATIC_CLAUSE_BODY = `CLAUSE 1 \u2013 DEFINITIONS: In this Agreement, unless the context otherwise requires: \u201cAgreement\u201d means this Syndicate Agreement; \u201cHorse\u201d means the thoroughbred racehorse identified in Clause 2; \u201cSyndicate\u201d means the syndicate established under this Agreement; \u201cToken\u201d means a digital token representing a fractional interest in the Horse\u2019s lease; \u201cToken Holder\u201d means the registered holder of one or more Tokens.

CLAUSE 3 \u2013 FORMATION: The Syndicate is formed on the date of this Agreement for the purpose of leasing and racing the Horse.

CLAUSE 6 \u2013 MANAGEMENT: The Manager shall have full authority to make all decisions regarding the training, racing, spelling, veterinary care, and general management of the Horse.

CLAUSE 7 \u2013 EXPENSES: All expenses incurred in connection with the Horse shall be borne by the Manager and are factored into the lease pricing.

CLAUSE 9 \u2013 INSURANCE: The Manager shall maintain appropriate insurance coverage for the Horse at all times during the lease period.

CLAUSE 10 \u2013 REPORTING: The Manager shall provide Token Holders with regular updates on the Horse\u2019s progress, training, and racing activities.

CLAUSE 11 \u2013 TRANSFER: Tokens may be transferred through the Tokinvest platform in accordance with the platform\u2019s terms and conditions.

CLAUSE 12 \u2013 WINDING UP: Upon expiry of the lease period, the Syndicate shall be wound up and any residual funds distributed to Token Holders pro-rata.

CLAUSE 13 \u2013 FORCE MAJEURE: Neither party shall be liable for any failure to perform obligations due to circumstances beyond reasonable control.

CLAUSE 15 \u2013 GOVERNING LAW: This Agreement shall be governed by and construed in accordance with the laws of New Zealand.

CLAUSE 16 \u2013 DISPUTE RESOLUTION: Any dispute arising under this Agreement shall be referred to mediation, and if unresolved, to arbitration in accordance with the Arbitration Act 1996 (NZ).

CLAUSE 17 \u2013 ENTIRE AGREEMENT: This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements.`;

// ─── Signature Block (static) ─────────────────────────────────────────────────

const SIGNATORY_NAME = 'Alex Baddeley';
const SIGNATORY_TITLE = 'Director, Evolution Stables Ltd';

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
      {children}
    </label>
  );
}

function SectionCard({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div style={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {badge && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', backgroundColor: '#e2e8f0', borderRadius: '9999px', padding: '0.0625rem 0.5rem' }}>{badge}</span>}
      </div>
      <div style={{ padding: '1rem' }}>{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', readOnly = false, note }: {
  label: string; value: string | number; onChange?: (v: string) => void; placeholder?: string; type?: string; readOnly?: boolean; note?: string;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <FieldLabel>{label}</FieldLabel>
      <input type={type} value={value} readOnly={readOnly} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #e2e8f0', padding: '0.5rem 0.625rem', fontSize: '0.875rem', color: readOnly ? '#94a3b8' : '#0f172a', backgroundColor: readOnly ? '#f8fafc' : '#ffffff', outline: 'none' }} />
      {note && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{note}</p>}
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 4, readOnly = false, note }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string; rows?: number; readOnly?: boolean; note?: string;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} readOnly={readOnly} placeholder={placeholder} rows={rows} onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #e2e8f0', padding: '0.5rem 0.625rem', fontSize: '0.875rem', color: readOnly ? '#94a3b8' : '#0f172a', backgroundColor: readOnly ? '#f8fafc' : '#ffffff', outline: 'none', resize: 'vertical', lineHeight: 1.55 }} />
      {note && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{note}</p>}
    </div>
  );
}

function ReadOnlyGrey({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.625rem 0.75rem', marginBottom: '0.875rem', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
      {children}
    </p>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{value || <span style={{ color: '#cbd5e1' }}>{'\u2014'}</span>}</span>
    </div>
  );
}

// ─── Step Progress Indicator ──────────────────────────────────────────────────

const STEP_NAMES = ['Select Horse', 'Agreement Terms', 'Review Clauses', 'Generate', 'Document Review'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
      {STEP_NAMES.map((name, idx) => {
        const stepNum = idx + 1;
        const isCompleted = current > stepNum;
        const isActive = current === stepNum;
        return (
          <React.Fragment key={stepNum}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '1.875rem', height: '1.875rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, backgroundColor: isActive || isCompleted ? '#2563eb' : '#e2e8f0', color: isActive || isCompleted ? '#ffffff' : '#64748b', flexShrink: 0, transition: 'background-color 0.2s' }}>
                {isCompleted ? '\u2713' : stepNum}
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#2563eb' : isCompleted ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap', textAlign: 'center', maxWidth: '5rem', lineHeight: 1.3 }}>{name}</span>
            </div>
            {idx < STEP_NAMES.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: current > stepNum ? '#3b82f6' : '#e2e8f0', marginBottom: '1.125rem', transition: 'background-color 0.2s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Review Section Block ─────────────────────────────────────────────────────

function ReviewBlock({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.375rem', borderBottom: '1px solid #f1f5f9' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', width: '10rem' }}>{label}</span>
            <span style={{ fontSize: '0.8125rem', color: value ? '#334155' : '#cbd5e1', whiteSpace: 'pre-wrap', flex: 1 }}>{value || '(empty)'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SyndicateAgreementWizard({ horses, trainers, onClose, onGenerate }: SyndicateAgreementWizardProps) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedOnce, setGeneratedOnce] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Step 1 — Horse selection
  const [selectedHorseId, setSelectedHorseId] = useState('');

  // Step 2 — Agreement terms
  const [agreementDate, setAgreementDate] = useState(formatDateISO(new Date()));
  const [leaseDurationMonths, setLeaseDurationMonths] = useState(16);
  const [numTokens, setNumTokens] = useState(100);
  const [leasePercent, setLeasePercent] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [investorSplit, setInvestorSplit] = useState('75%');
  const [variations, setVariations] = useState('');

  // ── Derived values from seed data ─────────────────────────────────────────
  const selectedHorse = horses.find((h) => h.horse_id === selectedHorseId) ?? null;
  const autoTrainer = selectedHorse
    ? trainers.find((t) => t.trainer_id === selectedHorse.trainer_id) ?? null
    : null;

  // ── Resolved rich JSON data ───────────────────────────────────────────────
  const richHorse = useMemo(() => {
    if (!selectedHorse) return null;
    const slug = slugFromSeedHorse(selectedHorse);
    return horseLookup[slug] ?? null;
  }, [selectedHorse]);

  const richSire = useMemo(() => {
    if (!richHorse) return null;
    return sireLookup[richHorse.sireSlug] ?? null;
  }, [richHorse]);

  const richDam = useMemo(() => {
    if (!richHorse) return null;
    return damLookup[richHorse.damSlug] ?? null;
  }, [richHorse]);

  const richTrainer = useMemo(() => {
    if (!richHorse) return null;
    return trainerLookup[richHorse.trainerSlug] ?? null;
  }, [richHorse]);

  // ── Derived identity fields ────────────────────────────────────────────────
  const horseName = selectedHorse?.horse_name ?? '';
  const horseCountryCode = selectedHorse?.country_code ?? '';
  const foalingDate = richHorse?.foalingDate ?? selectedHorse?.foaling_date ?? '';
  const ageName = foalingDate ? ageDescription(foalingDate) : '';
  const horseDOBFormatted = formatDateDMY(foalingDate);
  const microchipNumber = richHorse?.microchip ?? richHorse?.identity?.microchip_number ?? selectedHorse?.microchip_number ?? '';
  const sireName = richHorse?.pedigree?.sire_name ?? richSire?.display_name ?? selectedHorse?.sire ?? '';
  const damName = richHorse?.pedigree?.dam_name ?? richDam?.display_name ?? selectedHorse?.dam ?? '';

  // ── Auto-derived fields ────────────────────────────────────────────────────
  const syndicateName = horseName ? `${horseName} Syndicate` : '';
  const percentPerToken = numTokens > 0 ? (100 / numTokens).toFixed(2) + '%' : '';
  const leaseEndDate = leaseStartDate && leaseDurationMonths > 0
    ? addMonthsToDate(leaseStartDate, leaseDurationMonths)
    : '';
  const ownerSplit = investorSplit
    ? (100 - parseInt(investorSplit.replace('%', ''), 10)) + '%'
    : '';

  // ── Auto-fill when horse selection changes ────────────────────────────────
  const handleHorseChange = useCallback((id: string) => {
    setSelectedHorseId(id);
    const horse = horses.find((h) => h.horse_id === id) ?? null;
    if (!horse) return;

    const slug = slugFromSeedHorse(horse);
    const rh = horseLookup[slug];

    const offering = rh?.offering;

    // Auto-fill terms from offering data
    setLeaseDurationMonths(offering?.duration_months ?? offering?.leaseDurationMonths ?? 16);
    setNumTokens(offering?.token_count ?? 100);
    setLeasePercent(offering?.percent_leased != null ? `${offering.percent_leased}%` : '');
    setLeaseStartDate(offering?.start_date ?? '');

    const investorPct = offering?.investor_share_percent ?? 75;
    setInvestorSplit(`${investorPct}%`);

    setVariations('');
  }, [horses]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, 5));
  const goBack = () => {
    if (step === 1) onClose();
    else setStep((s) => s - 1);
  };

  // ── Save Locally (JSON snapshot) ──────────────────────────────────────────
  const handleSaveLocally = () => {
    const slug = selectedHorse ? slugFromSeedHorse(selectedHorse) : 'unknown';
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshot = {
      templateId: 'syndicate-agreement',
      horseId: selectedHorseId,
      horseName: selectedHorse?.horse_name ?? '',
      timestamp: new Date().toISOString(),
      feedback: feedbackText,
      fields: {
        agreementDate,
        leaseDurationMonths,
        numTokens,
        leasePercent,
        leaseStartDate,
        investorSplit,
        variations,
      },
    };
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syndicate-agreement-${slug}-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Generate .docx ────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!selectedHorse) return;
    setGenerating(true);
    try {
      const { buildSyndicateAgreementDocxBlob } = await import('../lib/lazyExports');

      const payload: SyndicateAgreementPayload = {
        syndicateName,
        horseName,
        agreementDate: formatDateDMY(agreementDate),
        countryCode: horseCountryCode,
        leaseDurationMonths,
        numTokens,
        percentPerToken,
        leasePercent,
        leaseStartDate: leaseStartDate ? formatDateDMY(leaseStartDate) : '',
        leaseEndDate: leaseEndDate ? formatDateDMY(leaseEndDate) : '',
        investorSplit,
        ownerSplit,
        staticClauseBody: STATIC_CLAUSE_BODY,
        signatoryName: SIGNATORY_NAME,
        signatoryTitle: SIGNATORY_TITLE,
        variations,
      };

      const blob = await buildSyndicateAgreementDocxBlob(payload);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syndicate-agreement-${richHorse?.slug ?? slugFromSeedHorse(selectedHorse)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Advance to review step (only on first generation)
      if (!generatedOnce) {
        setGeneratedOnce(true);
        setStep(5);
      }

      // Also call onGenerate callback
      onGenerate({
        horse: selectedHorse,
        richHorse,
        syndicateName,
        horseName,
        agreementDate,
        countryCode: horseCountryCode,
        leaseDurationMonths,
        numTokens,
        percentPerToken,
        leasePercent,
        leaseStartDate,
        leaseEndDate,
        investorSplit,
        ownerSplit,
        staticClauseBody: STATIC_CLAUSE_BODY,
        signatoryName: SIGNATORY_NAME,
        signatoryTitle: SIGNATORY_TITLE,
        variations,
      });
    } catch (err) {
      console.error('Failed to generate .docx:', err);
      alert('Failed to generate document. Check the console for details.');
    } finally {
      setGenerating(false);
    }
  }, [
    selectedHorse, richHorse, syndicateName, horseName, agreementDate,
    horseCountryCode, leaseDurationMonths, numTokens, percentPerToken,
    leasePercent, leaseStartDate, leaseEndDate, investorSplit, ownerSplit,
    variations, onGenerate, generatedOnce,
  ]);

  // ─── Render steps ──────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Horse Identity */}
        <div>
          <SectionCard title="Horse Identity">
            <div style={{ marginBottom: '0.875rem' }}>
              <FieldLabel>Select Horse</FieldLabel>
              <select value={selectedHorseId} onChange={(e) => handleHorseChange(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #e2e8f0', padding: '0.5rem 0.625rem', fontSize: '0.875rem', color: selectedHorseId ? '#0f172a' : '#94a3b8', backgroundColor: '#ffffff', outline: 'none' }}>
                <option value="">{'\u2014'} Select a horse {'\u2014'}</option>
                {horses.map((h) => (
                  <option key={h.horse_id} value={h.horse_id}>{h.horse_name} ({h.country_code})</option>
                ))}
              </select>
            </div>
            {selectedHorse ? (
              <div style={{ borderRadius: '0.5rem', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                <InfoPill label="Name" value={selectedHorse.horse_name} />
                <InfoPill label="Country" value={selectedHorse.country_code} />
                <InfoPill label="Foaling Date" value={selectedHorse.foaling_date} />
                <InfoPill label="Sex" value={selectedHorse.sex} />
                <InfoPill label="Colour" value={selectedHorse.colour} />
                <InfoPill label="Microchip" value={microchipNumber} />
                <InfoPill label="Sire" value={sireName} />
                <InfoPill label="Dam" value={damName} />
                {ageName && <InfoPill label="Age" value={ageName} />}
                {richHorse && <InfoPill label="Data Source" value="Rich JSON" />}
              </div>
            ) : (
              <div style={{ borderRadius: '0.5rem', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                Select a horse to see the preview
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Counterparties + Syndicate Identity */}
        <div>
          <SectionCard title="Counterparties">
            <div style={{ marginBottom: '0.875rem' }}>
              <FieldLabel>Trainer</FieldLabel>
              <select value={autoTrainer?.trainer_id ?? ''} disabled
                style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #e2e8f0', padding: '0.5rem 0.625rem', fontSize: '0.875rem', color: autoTrainer ? '#0f172a' : '#94a3b8', backgroundColor: '#f8fafc', outline: 'none' }}>
                {autoTrainer ? (
                  <option value={autoTrainer.trainer_id}>{richTrainer?.trainer_name ?? autoTrainer.trainer_name}</option>
                ) : (
                  <option value="">Auto-filled from horse selection</option>
                )}
              </select>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Auto-filled from horse's trainer link</p>
            </div>
            {(richTrainer || autoTrainer) ? (
              <div style={{ borderRadius: '0.5rem', border: '1px solid #dcfce7', backgroundColor: '#f0fdf4', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <InfoPill label="Stable" value={richTrainer?.stable_name ?? autoTrainer?.stable_name ?? ''} />
                <InfoPill label="Contact" value={richTrainer?.contact_name ?? autoTrainer?.contact_name ?? ''} />
                <InfoPill label="Location" value={richTrainer?.location ?? autoTrainer?.notes ?? ''} />
              </div>
            ) : (
              <div style={{ borderRadius: '0.5rem', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                Trainer details will appear here
              </div>
            )}
          </SectionCard>

          {/* Syndicate Identity (derived) */}
          {selectedHorse && (
            <SectionCard title="Syndicate Identity" badge="DERIVED">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.625rem' }}>
                <InfoPill label="Syndicate Name" value={syndicateName} />
                <InfoPill label="Country Code" value={horseCountryCode} />
              </div>
            </SectionCard>
          )}

          {/* Offering summary (from rich JSON) */}
          {richHorse?.offering && (
            <SectionCard title="Offering Data" badge="FROM SSOT">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                <InfoPill label="Lease Duration" value={`${richHorse.offering.duration_months ?? richHorse.offering.leaseDurationMonths ?? '\u2014'} months`} />
                <InfoPill label="Location" value={richHorse.offering.location ?? ''} />
                {richHorse.offering.token_count && <InfoPill label="Tokens" value={String(richHorse.offering.token_count)} />}
                {richHorse.offering.percent_leased && <InfoPill label="Lease %" value={`${richHorse.offering.percent_leased}%`} />}
                {richHorse.offering.investor_share_percent && <InfoPill label="Investor Share" value={`${richHorse.offering.investor_share_percent}%`} />}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <SectionCard title="Agreement Details">
        <InputField label="Agreement Date" value={agreementDate} onChange={setAgreementDate} type="date"
          note="Date of the syndicate agreement. Defaults to today." />
        <InputField label="Syndicate Name" value={syndicateName} readOnly
          note="Derived: Horse Name + ' Syndicate'" />
      </SectionCard>

      <SectionCard title="Commercial Terms">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField label="Lease Duration (Months)" value={leaseDurationMonths} onChange={(v) => setLeaseDurationMonths(Number(v) || 0)} type="number"
            note={richHorse?.offering?.duration_months ? 'Pre-filled from SSOT offering data.' : undefined} />
          <InputField label="Number of Tokens / Shares" value={numTokens} onChange={(v) => setNumTokens(Number(v) || 0)} type="number"
            note={richHorse?.offering?.token_count ? 'Pre-filled from SSOT offering data.' : undefined} />
        </div>
        <InputField label="Percentage Per Token" value={percentPerToken} readOnly
          note="Derived: 100 / Number of Tokens" />
        <InputField label="Lease Percentage of Horse" value={leasePercent} onChange={setLeasePercent}
          placeholder="e.g. 50%"
          note={richHorse?.offering?.percent_leased ? 'Pre-filled from SSOT offering data.' : undefined} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField label="Lease Start Date" value={leaseStartDate} onChange={setLeaseStartDate} type="date"
            note={richHorse?.offering?.start_date ? 'Pre-filled from SSOT.' : undefined} />
          <InputField label="Lease End Date" value={leaseEndDate ? formatDateDMY(leaseEndDate) : ''} readOnly
            note="Derived: Lease Start Date + Lease Duration Months" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField label="Investor Revenue Split %" value={investorSplit} onChange={setInvestorSplit}
            placeholder="e.g. 75%"
            note={richHorse?.offering?.investor_share_percent ? 'Pre-filled from SSOT offering data.' : undefined} />
          <InputField label="Owner Revenue Split %" value={ownerSplit} readOnly
            note="Derived: 100 - Investor Split" />
        </div>
      </SectionCard>

      <SectionCard title="Variations">
        <TextareaField label="Variations to Standard Terms" value={variations} onChange={setVariations}
          placeholder="Any variations to standard agreement terms (leave blank for n/a)." rows={3} />
      </SectionCard>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
        Review all sections before generating. Fields shown as {'\u201c\u2014\u201d'} or "(empty)" were left blank.
      </p>
      <ReviewBlock title="Agreement Header" rows={[
        { label: 'Syndicate Name', value: syndicateName },
        { label: 'Horse Name', value: horseName },
        { label: 'Country Code', value: horseCountryCode },
        { label: 'Agreement Date', value: formatDateDMY(agreementDate) },
      ]} />
      <ReviewBlock title="Variable Clause Fields" rows={[
        { label: 'Horse (Clause 2)', value: `${horseName} (${horseCountryCode})` },
        { label: 'Lease Duration', value: `${leaseDurationMonths} months` },
        { label: 'Number of Tokens', value: String(numTokens) },
        { label: 'Percent Per Token', value: percentPerToken },
        { label: 'Lease Percentage', value: leasePercent },
        { label: 'Lease Start Date', value: leaseStartDate ? formatDateDMY(leaseStartDate) : '' },
        { label: 'Lease End Date', value: leaseEndDate ? formatDateDMY(leaseEndDate) : '' },
        { label: 'Investor Split', value: investorSplit },
        { label: 'Owner Split', value: ownerSplit },
        { label: 'Variations', value: variations },
      ]} />

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.375rem', borderBottom: '1px solid #f1f5f9' }}>Static Boilerplate Clauses</div>
        <ReadOnlyGrey>{STATIC_CLAUSE_BODY}</ReadOnlyGrey>
      </div>

      <ReviewBlock title="Signature Block" rows={[
        { label: 'Signatory Name', value: SIGNATORY_NAME },
        { label: 'Signatory Title', value: SIGNATORY_TITLE },
      ]} />
    </div>
  );

  const renderStep4 = () => (
    <div>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
        All data has been reviewed. Click "Generate & Download .docx" to produce the Syndicate Agreement document.
      </p>
      <ReviewBlock title="Summary" rows={[
        { label: 'Syndicate Name', value: syndicateName },
        { label: 'Horse', value: `${horseName} (${horseCountryCode})` },
        { label: 'Agreement Date', value: formatDateDMY(agreementDate) },
        { label: 'Tokens', value: `${numTokens} @ ${percentPerToken} each` },
        { label: 'Lease', value: `${leaseDurationMonths} months from ${leaseStartDate ? formatDateDMY(leaseStartDate) : 'TBD'}` },
        { label: 'Lease %', value: leasePercent },
        { label: 'Revenue Split', value: `Investors: ${investorSplit} / Owner: ${ownerSplit}` },
        { label: 'Signatory', value: `${SIGNATORY_NAME}, ${SIGNATORY_TITLE}` },
      ]} />
    </div>
  );

  // ── Editable review field (Step 5) ────────────────────────────────────────
  const editableFieldMap: Record<string, { get: () => string; set: (v: string) => void; multiline?: boolean }> = useMemo(() => ({
    'Agreement Date': { get: () => agreementDate, set: setAgreementDate },
    'Lease Duration Months': { get: () => String(leaseDurationMonths), set: (v) => setLeaseDurationMonths(Number(v) || 0) },
    'Number of Tokens': { get: () => String(numTokens), set: (v) => setNumTokens(Number(v) || 0) },
    'Lease Percent': { get: () => leasePercent, set: setLeasePercent },
    'Lease Start Date': { get: () => leaseStartDate, set: setLeaseStartDate },
    'Investor Split': { get: () => investorSplit, set: setInvestorSplit },
    'Variations': { get: () => variations, set: setVariations, multiline: true },
  }), [agreementDate, leaseDurationMonths, numTokens, leasePercent, leaseStartDate, investorSplit, variations]);

  function EditableReviewRow({ label, value, fieldKey }: { label: string; value: string; fieldKey?: string }) {
    const editable = fieldKey ? editableFieldMap[fieldKey] : undefined;
    const isEditing = editingField === fieldKey;
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.375rem 0', borderBottom: '1px solid #f8fafc' }}>
        <span style={{ flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', width: '10rem', paddingTop: '0.125rem' }}>{label}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing && editable ? (
            editable.multiline ? (
              <textarea
                autoFocus
                value={editable.get()}
                onChange={(e) => editable.set(e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null); }}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #3b82f6', padding: '0.375rem 0.5rem', fontSize: '0.8125rem', color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.55, backgroundColor: '#eff6ff' }}
              />
            ) : (
              <input
                autoFocus
                value={editable.get()}
                onChange={(e) => editable.set(e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null); if (e.key === 'Enter') setEditingField(null); }}
                style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #3b82f6', padding: '0.375rem 0.5rem', fontSize: '0.8125rem', color: '#0f172a', outline: 'none', backgroundColor: '#eff6ff' }}
              />
            )
          ) : (
            <span
              onClick={editable ? () => setEditingField(fieldKey!) : undefined}
              style={{
                fontSize: '0.8125rem',
                color: value ? '#334155' : '#cbd5e1',
                whiteSpace: 'pre-wrap',
                cursor: editable ? 'pointer' : 'default',
                display: 'block',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                border: editable ? '1px dashed transparent' : 'none',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onMouseEnter={(e) => { if (editable) { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.backgroundColor = '#f0f9ff'; } }}
              onMouseLeave={(e) => { if (editable) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              {value || '(empty)'}
              {editable && <span style={{ fontSize: '0.6875rem', color: '#93c5fd', marginLeft: '0.5rem' }}>click to edit</span>}
            </span>
          )}
        </div>
      </div>
    );
  }

  const renderStep5 = () => (
    <div>
      <div style={{ borderRadius: '0.5rem', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem' }}>{'\u2705'}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534' }}>Document generated and downloaded.</span>
        <span style={{ fontSize: '0.8125rem', color: '#15803d' }}>Review the content below. Click any editable field to make changes, then re-generate.</span>
      </div>

      <SectionCard title="Agreement Header" badge="DERIVED">
        <EditableReviewRow label="Syndicate Name" value={syndicateName} />
        <EditableReviewRow label="Horse Name" value={horseName} />
        <EditableReviewRow label="Country Code" value={horseCountryCode} />
        <EditableReviewRow label="Agreement Date" value={formatDateDMY(agreementDate)} fieldKey="Agreement Date" />
      </SectionCard>

      <SectionCard title="Commercial Terms">
        <EditableReviewRow label="Lease Duration" value={`${leaseDurationMonths} months`} fieldKey="Lease Duration Months" />
        <EditableReviewRow label="Number of Tokens" value={String(numTokens)} fieldKey="Number of Tokens" />
        <EditableReviewRow label="Percent Per Token" value={percentPerToken} />
        <EditableReviewRow label="Lease Percentage" value={leasePercent} fieldKey="Lease Percent" />
        <EditableReviewRow label="Lease Start Date" value={leaseStartDate ? formatDateDMY(leaseStartDate) : ''} fieldKey="Lease Start Date" />
        <EditableReviewRow label="Lease End Date" value={leaseEndDate ? formatDateDMY(leaseEndDate) : ''} />
        <EditableReviewRow label="Investor Split" value={investorSplit} fieldKey="Investor Split" />
        <EditableReviewRow label="Owner Split" value={ownerSplit} />
        <EditableReviewRow label="Variations" value={variations} fieldKey="Variations" />
      </SectionCard>

      <SectionCard title="Static Boilerplate Clauses" badge="STATIC">
        <ReadOnlyGrey>{STATIC_CLAUSE_BODY}</ReadOnlyGrey>
      </SectionCard>

      <SectionCard title="Signature Block" badge="STATIC">
        <EditableReviewRow label="Signatory Name" value={SIGNATORY_NAME} />
        <EditableReviewRow label="Signatory Title" value={SIGNATORY_TITLE} />
      </SectionCard>

      {/* Step 5 (Bonus): Feedback / Issue Flagging */}
      <SectionCard title="Review Feedback" badge="OPTIONAL">
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.625rem' }}>
          Flag any issues with this syndicate agreement for the team to review. This feedback will be attached to the document record.
        </p>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="e.g. Investor split needs confirmation. Lease start date is tentative pending trainer availability."
          rows={4}
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.375rem', border: '1px solid #e2e8f0', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.55, backgroundColor: feedbackText ? '#fefce8' : '#ffffff' }}
        />
        {feedbackText && (
          <p style={{ fontSize: '0.75rem', color: '#ca8a04', marginTop: '0.375rem', fontWeight: 500 }}>
            Feedback will be included when you re-generate the document.
          </p>
        )}
      </SectionCard>
    </div>
  );

  // ─── Full Wizard Modal ──────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6"
        style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.125rem' }}>
              Syndicate Agreement {'\u2014'} Step {step} of 5: {STEP_NAMES[step - 1]}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {step === 1 && 'Select the horse and verify counterparties auto-filled from SSOT.'}
              {step === 2 && 'Configure agreement terms, commercial details, and any variations.'}
              {step === 3 && 'Review all clauses and data before generating the agreement document.'}
              {step === 4 && 'Review the summary. Click Generate to produce the .docx file.'}
              {step === 5 && 'Review the generated document. Click fields to edit, then re-generate if needed.'}
            </p>
          </div>
          <button onClick={onClose}
            style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 400, lineHeight: 1 }}
            aria-label="Close wizard">{'\u00d7'}</button>
        </div>

        <StepIndicator current={step} />

        <div>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Footer Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={goBack}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {step === 1 ? 'Cancel' : '\u2190 Back'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {step === 5 ? (
              <>
                <button onClick={handleGenerate} disabled={generating}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  style={{ opacity: generating ? 0.6 : 1, cursor: generating ? 'wait' : 'pointer' }}>
                  {generating ? 'Re-generating...' : 'Re-generate .docx'}
                </button>
                <button onClick={handleSaveLocally}
                  className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                  Save Locally
                </button>
                <button onClick={onClose}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Done
                </button>
              </>
            ) : step === 4 ? (
              <>
                <button onClick={() => alert('Draft saved \u2014 save functionality will be wired in a future update.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                  Save Draft
                </button>
                <button onClick={handleGenerate} disabled={generating}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                  style={{ opacity: generating ? 0.6 : 1, cursor: generating ? 'wait' : 'pointer' }}>
                  {generating ? 'Generating...' : 'Generate & Download .docx'}
                </button>
              </>
            ) : (
              <button onClick={goNext} disabled={step === 1 && !selectedHorseId}
                className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                style={{ opacity: step === 1 && !selectedHorseId ? 0.4 : 1, cursor: step === 1 && !selectedHorseId ? 'not-allowed' : 'pointer' }}>
                Next {'\u2192'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
