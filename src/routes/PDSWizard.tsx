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

type BoilerplateJson = {
  intro_template: string;
  why_tokenise_heading: string;
  why_tokenise_body: string;
  why_tokenise_bullets?: string[];
  earnings_language: string;
  earnings_sentence: string;
  pedigree_intro: string;
  pedigree_intro_body: string;
  asset_type: string;
  promoted_default: string;
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

type PDSWizardProps = {
  horses: HorseData[];
  trainers: TrainerData[];
  onClose: () => void;
  onGenerate: (data: Record<string, unknown>) => void;
};

// ─── PDS Docx Payload type ──────────────────────────────────────────────────

type PDSPayload = {
  productName: string;
  issuerName: string;
  issueDate: string;
  pdsVersion: string;
  investmentType: string;
  riskLevel: string;
  minInvestment: number;
  keyBenefits: string[];
  keyRisks: string[];
  horseName: string;
  horseCountryCode: string;
  sire: string;
  dam: string;
  foalingDate: string;
  sex: string;
  colour: string;
  trainer: string;
  location: string;
  racingRecord: string;
  horseNarrative: string;
  tokenCount: number;
  tokenPrice: number;
  totalOffering: number;
  leaseDuration: number;
  leaseStart: string;
  leaseEnd: string;
  revenueShare: string;
  earningsDistribution: string;
  investmentRisks: string;
  horseRisks: string;
  regulatoryRisks: string;
  managementFee: string;
  platformFee: string;
  transactionFee: string;
  otherCosts: string;
  governingLaw: string;
  disputeResolution: string;
  regulatoryStatus: string;
  privacyStatement: string;
  glossary: string;
  contactDetails: string;
  websiteUrl: string;
};

// ─── Static PDS Content ─────────────────────────────────────────────────────

const STATIC_CONTENT = {
  issuerName: 'Tokinvest Limited',
  pdsVersion: '1.0',
  riskLevel: 'High',
  investmentType: 'Horse Lease Token (HLT) — a digital token representing a fractional interest in the lease of a thoroughbred racehorse.',
  keyBenefits: [
    'Fractional ownership of a real-world racing asset',
    'Entitlement to a share of net prize money earnings',
    'Tradable on the Tokinvest platform',
    'Regular reporting and updates on horse progress',
    'Low minimum investment threshold',
  ],
  keyRisks: [
    'Horse may not perform as expected or may be injured',
    'Prize money earnings are not guaranteed',
    'Token value may fluctuate',
    'Regulatory changes may affect the offering',
    'Liquidity risk — tokens may not always be readily tradable',
  ],
  investmentRisks: 'Investing in Horse Lease Tokens involves significant risks. The value of your investment may go down as well as up. Past performance is not indicative of future results. You should only invest money that you can afford to lose.',
  horseRisks: 'Thoroughbred racing is inherently risky. Horses may suffer injuries, illness, or poor form that prevents them from racing or earning prize money. There is no guarantee that any horse will race, win, or generate returns.',
  regulatoryRisks: 'The regulatory environment for digital assets and tokenised securities is evolving. Changes in law or regulation may affect the operation of the Tokinvest platform or the rights of Token Holders.',
  managementFee: 'Nil — management costs are built into the lease pricing structure.',
  platformFee: '2.5% of token transaction value on secondary market trades.',
  transactionFee: 'Standard blockchain gas fees apply to on-chain transactions.',
  otherCosts: 'No additional costs to Token Holders. All training, veterinary, and racing costs are borne by the lease manager.',
  governingLaw: 'This PDS and the rights of Token Holders are governed by the laws of New Zealand.',
  disputeResolution: 'Disputes shall be resolved through mediation, and if unresolved, through arbitration under the Arbitration Act 1996 (NZ).',
  regulatoryStatus: 'Tokinvest Limited operates under the regulatory framework of New Zealand. Horse Lease Tokens are structured as tokenised lease interests and are not classified as financial products under the Financial Markets Conduct Act 2013.',
  privacyStatement: 'Personal information collected in connection with this offering is handled in accordance with the Privacy Act 2020 (NZ) and Tokinvest\'s Privacy Policy.',
  glossary: 'HLT: Horse Lease Token | PDS: Product Disclosure Statement | NZD: New Zealand Dollar | AED: United Arab Emirates Dirham | NZTR: New Zealand Thoroughbred Racing',
  contactDetails: 'Tokinvest Limited, Auckland, New Zealand | support@tokinvest.com | www.tokinvest.com',
  websiteUrl: 'https://www.tokinvest.com',
  earningsDistribution: 'Token holders are entitled to their pro-rata share of net prize money earned during the lease period, distributed quarterly.',
};

// ─── Load rich JSON data via Vite import.meta.glob ──────────────────────────

const horseModules = import.meta.glob<{ default: RichHorseJson }>('/data/horses/*.json', { eager: true });
const sireModules = import.meta.glob<{ default: RichSireJson }>('/data/sires/*.json', { eager: true });
const damModules = import.meta.glob<{ default: RichDamJson }>('/data/dams/*.json', { eager: true });
const trainerModules = import.meta.glob<{ default: RichTrainerJson }>('/data/trainers/*.json', { eager: true });
const _boilerplateModule = import.meta.glob<{ default: BoilerplateJson }>('/data/templates/boilerplate.json', { eager: true });

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

function formatDateDMY(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addMonthsISO(isoDate: string, months: number): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return formatDateISO(d);
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
    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.625rem 0.75rem', marginBottom: '0.875rem', fontStyle: 'italic' }}>
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

const STEP_NAMES = ['Select Horse', 'Offering Details', 'Review Content', 'Generate', 'Document Review'];

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

export default function PDSWizard({ horses, trainers, onClose, onGenerate }: PDSWizardProps) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedOnce, setGeneratedOnce] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Step 1 — Horse selection
  const [selectedHorseId, setSelectedHorseId] = useState('');

  // Step 2 — Editable fields
  const [issueDate, setIssueDate] = useState(formatDateISO(new Date()));
  const [tokenCount, setTokenCount] = useState(100);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [leaseDuration, setLeaseDuration] = useState(0);
  const [leaseStart, setLeaseStart] = useState('');
  const [revenueShare, setRevenueShare] = useState('75/25 in favour of token holders');
  const [horseNarrative, setHorseNarrative] = useState('');

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
  const horseSex = richHorse?.sex ?? selectedHorse?.sex ?? '';
  const horseColour = richHorse?.colour ?? selectedHorse?.colour ?? '';
  const microchipNumber = richHorse?.microchip ?? richHorse?.identity?.microchip_number ?? selectedHorse?.microchip_number ?? '';
  const sireName = richHorse?.pedigree?.sire_name ?? richSire?.display_name ?? selectedHorse?.sire ?? '';
  const damName = richHorse?.pedigree?.dam_name ?? richDam?.display_name ?? selectedHorse?.dam ?? '';
  const trainerName = richTrainer?.trainer_name ?? autoTrainer?.trainer_name ?? '';
  const trainerLocation = richTrainer?.location ?? autoTrainer?.notes ?? '';
  const racingRecord = richHorse?.racingRecord ?? (richHorse?.races && richHorse.races.length > 0 ? `${richHorse.races.length} start${richHorse.races.length > 1 ? 's' : ''}` : 'Unraced — in preparation');

  // ── Auto-derived fields ────────────────────────────────────────────────────
  const productName = selectedHorse ? `HLT \u2013 ${horseName} ${horseCountryCode} Product Disclosure Statement` : '';
  const totalOffering = tokenCount * tokenPrice;
  const minInvestment = tokenPrice;
  const leaseEnd = leaseStart && leaseDuration > 0 ? addMonthsISO(leaseStart, leaseDuration) : '';

  // ── Auto-fill when horse selection changes ────────────────────────────────
  const handleHorseChange = useCallback((id: string) => {
    setSelectedHorseId(id);
    const horse = horses.find((h) => h.horse_id === id) ?? null;
    if (!horse) return;

    const slug = slugFromSeedHorse(horse);
    const rh = horseLookup[slug];

    const offering = rh?.offering;

    // Auto-fill from offering data
    setTokenCount(offering?.token_count ?? 100);
    setTokenPrice(offering?.token_price_nzd ?? 0);

    const dur = offering?.duration_months ?? offering?.leaseDurationMonths ?? 0;
    setLeaseDuration(dur);
    setLeaseStart(offering?.start_date ?? '');

    const investorPct = offering?.investor_share_percent ?? 75;
    const ownerPct = offering?.owner_share_percent ?? 25;
    setRevenueShare(`${investorPct}/${ownerPct} in favour of token holders`);

    // Auto-fill narrative
    setHorseNarrative(rh?.narrative?.about_paragraph ?? '');
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
      templateId: 'pds',
      horseId: selectedHorseId,
      horseName: selectedHorse?.horse_name ?? '',
      timestamp: new Date().toISOString(),
      feedback: feedbackText,
      fields: {
        issueDate,
        tokenCount,
        tokenPrice,
        leaseDuration,
        leaseStart,
        revenueShare,
        horseNarrative,
      },
    };
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pds-${slug}-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Generate .docx ────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!selectedHorse) return;
    setGenerating(true);
    try {
      const { buildPDSDocxBlob } = await import('../lib/lazyExports');

      const payload: PDSPayload = {
        productName,
        issuerName: STATIC_CONTENT.issuerName,
        issueDate,
        pdsVersion: STATIC_CONTENT.pdsVersion,
        investmentType: STATIC_CONTENT.investmentType,
        riskLevel: STATIC_CONTENT.riskLevel,
        minInvestment,
        keyBenefits: STATIC_CONTENT.keyBenefits,
        keyRisks: STATIC_CONTENT.keyRisks,
        horseName,
        horseCountryCode,
        sire: sireName,
        dam: damName,
        foalingDate: foalingDate,
        sex: horseSex,
        colour: horseColour,
        trainer: trainerName,
        location: trainerLocation,
        racingRecord,
        horseNarrative,
        tokenCount,
        tokenPrice,
        totalOffering,
        leaseDuration,
        leaseStart,
        leaseEnd,
        revenueShare,
        earningsDistribution: STATIC_CONTENT.earningsDistribution,
        investmentRisks: STATIC_CONTENT.investmentRisks,
        horseRisks: STATIC_CONTENT.horseRisks,
        regulatoryRisks: STATIC_CONTENT.regulatoryRisks,
        managementFee: STATIC_CONTENT.managementFee,
        platformFee: STATIC_CONTENT.platformFee,
        transactionFee: STATIC_CONTENT.transactionFee,
        otherCosts: STATIC_CONTENT.otherCosts,
        governingLaw: STATIC_CONTENT.governingLaw,
        disputeResolution: STATIC_CONTENT.disputeResolution,
        regulatoryStatus: STATIC_CONTENT.regulatoryStatus,
        privacyStatement: STATIC_CONTENT.privacyStatement,
        glossary: STATIC_CONTENT.glossary,
        contactDetails: STATIC_CONTENT.contactDetails,
        websiteUrl: STATIC_CONTENT.websiteUrl,
      };

      const blob = await buildPDSDocxBlob(payload);

      // Trigger download
      const horseSlug = richHorse?.slug ?? slugFromSeedHorse(selectedHorse);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pds-${horseSlug}.docx`;
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
        ...payload,
      });
    } catch (err) {
      console.error('Failed to generate .docx:', err);
      alert('Failed to generate document. Check the console for details.');
    } finally {
      setGenerating(false);
    }
  }, [
    selectedHorse, richHorse, productName, issueDate, minInvestment,
    horseName, horseCountryCode, sireName, damName, foalingDate,
    horseSex, horseColour, trainerName, trainerLocation, racingRecord,
    horseNarrative, tokenCount, tokenPrice, totalOffering,
    leaseDuration, leaseStart, leaseEnd, revenueShare,
    onGenerate, generatedOnce,
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

        {/* Right: Counterparties + Product Name */}
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

          {/* Product Name (derived) */}
          {selectedHorse && (
            <SectionCard title="Product Identity" badge="DERIVED">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.625rem' }}>
                <InfoPill label="Product Name" value={productName} />
                <InfoPill label="Issuer" value={STATIC_CONTENT.issuerName} />
                <InfoPill label="PDS Version" value={STATIC_CONTENT.pdsVersion} />
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
                {richHorse.offering.token_price_nzd && <InfoPill label="Token Price" value={`$${richHorse.offering.token_price_nzd}`} />}
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
      <SectionCard title="Front Matter">
        <InputField label="Issue Date" value={issueDate} onChange={setIssueDate} type="date"
          note="Date this PDS is issued." />
        <InputField label="Product Name" value={productName} readOnly
          note="Derived: HLT - [Horse Name] [Country Code] Product Disclosure Statement" />
        <InputField label="Issuer Name" value={STATIC_CONTENT.issuerName} readOnly
          note="Static: Tokinvest Limited" />
        <InputField label="PDS Version" value={STATIC_CONTENT.pdsVersion} readOnly
          note="Static: 1.0" />
      </SectionCard>

      <SectionCard title="Offering Terms">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField label="Number of Tokens" value={tokenCount} onChange={(v) => setTokenCount(Number(v) || 0)} type="number"
            note={richHorse?.offering?.token_count ? 'Pre-filled from SSOT offering data.' : undefined} />
          <InputField label="Token Price (NZD)" value={tokenPrice} onChange={(v) => setTokenPrice(Number(v) || 0)} type="number"
            note={richHorse?.offering?.token_price_nzd ? 'Pre-filled from SSOT offering data.' : undefined} />
        </div>
        <InputField label="Total Offering Value (NZD)" value={totalOffering.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' })} readOnly
          note="Derived: Number of Tokens x Token Price NZD" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField label="Lease Duration (months)" value={leaseDuration} onChange={(v) => setLeaseDuration(Number(v) || 0)} type="number"
            note={richHorse?.offering ? 'Pre-filled from SSOT offering data.' : undefined} />
          <InputField label="Lease Start" value={leaseStart} onChange={setLeaseStart} type="date"
            note={richHorse?.offering?.start_date ? 'Pre-filled from SSOT.' : undefined} />
        </div>
        <InputField label="Lease End" value={leaseEnd ? formatDateDMY(leaseEnd) : ''} readOnly
          note="Derived: Lease Start + Lease Duration months" />
        <InputField label="Revenue Share" value={revenueShare} onChange={setRevenueShare}
          placeholder="e.g. 75/25 in favour of token holders"
          note={richHorse?.offering?.investor_share_percent ? 'Pre-filled from SSOT offering data.' : undefined} />
      </SectionCard>

      <SectionCard title="Horse Narrative">
        <TextareaField label="About the Horse" value={horseNarrative} onChange={setHorseNarrative}
          placeholder="1-2 paragraphs introducing this horse — breeding highlights, physical attributes, and training situation."
          rows={6}
          note={richHorse?.narrative?.about_paragraph ? 'Pre-filled from SSOT narrative data.' : undefined} />
      </SectionCard>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
        Review all 8 PDS sections before generating. Static content is shown in grey. Fields shown as "(empty)" were left blank.
      </p>

      {/* Section 1: Front Matter */}
      <ReviewBlock title="1. Front Matter" rows={[
        { label: 'Product Name', value: productName },
        { label: 'Issuer Name', value: STATIC_CONTENT.issuerName },
        { label: 'Issue Date', value: formatDateDMY(issueDate) },
        { label: 'PDS Version', value: STATIC_CONTENT.pdsVersion },
      ]} />

      {/* Section 2: Key Information Summary */}
      <ReviewBlock title="2. Key Information Summary" rows={[
        { label: 'Investment Type', value: STATIC_CONTENT.investmentType },
        { label: 'Risk Level', value: STATIC_CONTENT.riskLevel },
        { label: 'Min. Investment', value: minInvestment > 0 ? `$${minInvestment.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (1 token)` : '' },
        { label: 'Key Benefits', value: STATIC_CONTENT.keyBenefits.join(' | ') },
        { label: 'Key Risks', value: STATIC_CONTENT.keyRisks.join(' | ') },
      ]} />

      {/* Section 3: Horse Profile */}
      <ReviewBlock title="3. Horse Profile" rows={[
        { label: 'Horse Name', value: horseName },
        { label: 'Sire', value: sireName },
        { label: 'Dam', value: damName },
        { label: 'Foaling Date', value: horseDOBFormatted },
        { label: 'Sex', value: horseSex },
        { label: 'Colour', value: horseColour },
        { label: 'Trainer', value: trainerName },
        { label: 'Location', value: trainerLocation },
        { label: 'Racing Record', value: racingRecord },
        { label: 'Narrative', value: horseNarrative },
      ]} />

      {/* Section 4: Offering Terms */}
      <ReviewBlock title="4. Offering Terms" rows={[
        { label: 'Token Count', value: String(tokenCount) },
        { label: 'Token Price', value: `$${tokenPrice.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Total Offering', value: `$${totalOffering.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Lease Duration', value: `${leaseDuration} months` },
        { label: 'Lease Start', value: leaseStart ? formatDateDMY(leaseStart) : '' },
        { label: 'Lease End', value: leaseEnd ? formatDateDMY(leaseEnd) : '' },
        { label: 'Revenue Share', value: revenueShare },
        { label: 'Earnings Dist.', value: STATIC_CONTENT.earningsDistribution },
      ]} />

      {/* Section 5: Risk Factors (Static) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.375rem', borderBottom: '1px solid #f1f5f9' }}>5. Risk Factors</div>
        <ReadOnlyGrey>{STATIC_CONTENT.investmentRisks}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.horseRisks}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.regulatoryRisks}</ReadOnlyGrey>
      </div>

      {/* Section 6: Fees & Costs (Static) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.375rem', borderBottom: '1px solid #f1f5f9' }}>6. Fees & Costs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', width: '10rem' }}>Management Fee</span>
            <ReadOnlyGrey>{STATIC_CONTENT.managementFee}</ReadOnlyGrey>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', width: '10rem' }}>Platform Fee</span>
            <ReadOnlyGrey>{STATIC_CONTENT.platformFee}</ReadOnlyGrey>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', width: '10rem' }}>Transaction Fee</span>
            <ReadOnlyGrey>{STATIC_CONTENT.transactionFee}</ReadOnlyGrey>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ flexShrink: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', width: '10rem' }}>Other Costs</span>
            <ReadOnlyGrey>{STATIC_CONTENT.otherCosts}</ReadOnlyGrey>
          </div>
        </div>
      </div>

      {/* Section 7: Legal & Compliance (Static) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.375rem', borderBottom: '1px solid #f1f5f9' }}>7. Legal & Compliance</div>
        <ReadOnlyGrey>{STATIC_CONTENT.governingLaw}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.disputeResolution}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.regulatoryStatus}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.privacyStatement}</ReadOnlyGrey>
      </div>

      {/* Section 8: Appendices (Static) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.375rem', borderBottom: '1px solid #f1f5f9' }}>8. Appendices</div>
        <ReadOnlyGrey>{STATIC_CONTENT.glossary}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.contactDetails}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.websiteUrl}</ReadOnlyGrey>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
        All data has been reviewed. Click "Generate & Download .docx" to produce the Product Disclosure Statement document.
      </p>
      <ReviewBlock title="Summary" rows={[
        { label: 'Product Name', value: productName },
        { label: 'Horse', value: `${horseName} (${horseCountryCode})` },
        { label: 'Tokens', value: `${tokenCount} @ $${tokenPrice.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} = $${totalOffering.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}` },
        { label: 'Lease', value: `${leaseDuration} months from ${leaseStart ? formatDateDMY(leaseStart) : 'TBD'}${leaseEnd ? ` to ${formatDateDMY(leaseEnd)}` : ''}` },
        { label: 'Revenue Share', value: revenueShare },
        { label: 'Issuer', value: STATIC_CONTENT.issuerName },
        { label: 'Risk Level', value: STATIC_CONTENT.riskLevel },
        { label: 'Issue Date', value: formatDateDMY(issueDate) },
      ]} />
    </div>
  );

  // ── Editable review field (Step 5) ────────────────────────────────────────
  const editableFieldMap: Record<string, { get: () => string; set: (v: string) => void; multiline?: boolean }> = useMemo(() => ({
    'Token Count': { get: () => String(tokenCount), set: (v) => setTokenCount(Number(v) || 0) },
    'Token Price': { get: () => String(tokenPrice), set: (v) => setTokenPrice(Number(v) || 0) },
    'Lease Duration': { get: () => String(leaseDuration), set: (v) => setLeaseDuration(Number(v) || 0) },
    'Lease Start': { get: () => leaseStart, set: setLeaseStart },
    'Revenue Share': { get: () => revenueShare, set: setRevenueShare },
    'Horse Narrative': { get: () => horseNarrative, set: setHorseNarrative, multiline: true },
    'Issue Date': { get: () => issueDate, set: setIssueDate },
  }), [tokenCount, tokenPrice, leaseDuration, leaseStart, revenueShare, horseNarrative, issueDate]);

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

      {/* Section 1: Front Matter */}
      <SectionCard title="1. Front Matter">
        <EditableReviewRow label="Product Name" value={productName} />
        <EditableReviewRow label="Issuer Name" value={STATIC_CONTENT.issuerName} />
        <EditableReviewRow label="Issue Date" value={formatDateDMY(issueDate)} fieldKey="Issue Date" />
        <EditableReviewRow label="PDS Version" value={STATIC_CONTENT.pdsVersion} />
      </SectionCard>

      {/* Section 2: Key Information Summary */}
      <SectionCard title="2. Key Information Summary" badge="STATIC">
        <EditableReviewRow label="Investment Type" value={STATIC_CONTENT.investmentType} />
        <EditableReviewRow label="Risk Level" value={STATIC_CONTENT.riskLevel} />
        <EditableReviewRow label="Min. Investment" value={minInvestment > 0 ? `$${minInvestment.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (1 token)` : ''} />
        <ReadOnlyGrey>Key Benefits: {STATIC_CONTENT.keyBenefits.join(' | ')}</ReadOnlyGrey>
        <ReadOnlyGrey>Key Risks: {STATIC_CONTENT.keyRisks.join(' | ')}</ReadOnlyGrey>
      </SectionCard>

      {/* Section 3: Horse Profile */}
      <SectionCard title="3. Horse Profile" badge="DERIVED">
        <EditableReviewRow label="Horse Name" value={horseName} />
        <EditableReviewRow label="Sire" value={sireName} />
        <EditableReviewRow label="Dam" value={damName} />
        <EditableReviewRow label="Foaling Date" value={horseDOBFormatted} />
        <EditableReviewRow label="Sex" value={horseSex} />
        <EditableReviewRow label="Colour" value={horseColour} />
        <EditableReviewRow label="Trainer" value={trainerName} />
        <EditableReviewRow label="Location" value={trainerLocation} />
        <EditableReviewRow label="Racing Record" value={racingRecord} />
        <EditableReviewRow label="Narrative" value={horseNarrative} fieldKey="Horse Narrative" />
      </SectionCard>

      {/* Section 4: Offering Terms */}
      <SectionCard title="4. Offering Terms">
        <EditableReviewRow label="Token Count" value={String(tokenCount)} fieldKey="Token Count" />
        <EditableReviewRow label="Token Price" value={`$${tokenPrice.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} fieldKey="Token Price" />
        <EditableReviewRow label="Total Offering" value={`$${totalOffering.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <EditableReviewRow label="Lease Duration" value={`${leaseDuration} months`} fieldKey="Lease Duration" />
        <EditableReviewRow label="Lease Start" value={leaseStart ? formatDateDMY(leaseStart) : ''} fieldKey="Lease Start" />
        <EditableReviewRow label="Lease End" value={leaseEnd ? formatDateDMY(leaseEnd) : ''} />
        <EditableReviewRow label="Revenue Share" value={revenueShare} fieldKey="Revenue Share" />
        <EditableReviewRow label="Earnings Dist." value={STATIC_CONTENT.earningsDistribution} />
      </SectionCard>

      {/* Section 5: Risk Factors (Static) */}
      <SectionCard title="5. Risk Factors" badge="STATIC">
        <ReadOnlyGrey>{STATIC_CONTENT.investmentRisks}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.horseRisks}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.regulatoryRisks}</ReadOnlyGrey>
      </SectionCard>

      {/* Section 6: Fees & Costs (Static) */}
      <SectionCard title="6. Fees & Costs" badge="STATIC">
        <EditableReviewRow label="Management Fee" value={STATIC_CONTENT.managementFee} />
        <EditableReviewRow label="Platform Fee" value={STATIC_CONTENT.platformFee} />
        <EditableReviewRow label="Transaction Fee" value={STATIC_CONTENT.transactionFee} />
        <EditableReviewRow label="Other Costs" value={STATIC_CONTENT.otherCosts} />
      </SectionCard>

      {/* Section 7: Legal & Compliance (Static) */}
      <SectionCard title="7. Legal & Compliance" badge="STATIC">
        <ReadOnlyGrey>{STATIC_CONTENT.governingLaw}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.disputeResolution}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.regulatoryStatus}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.privacyStatement}</ReadOnlyGrey>
      </SectionCard>

      {/* Section 8: Appendices (Static) */}
      <SectionCard title="8. Appendices" badge="STATIC">
        <ReadOnlyGrey>{STATIC_CONTENT.glossary}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.contactDetails}</ReadOnlyGrey>
        <ReadOnlyGrey>{STATIC_CONTENT.websiteUrl}</ReadOnlyGrey>
      </SectionCard>

      {/* Feedback / Issue Flagging */}
      <SectionCard title="Review Feedback" badge="OPTIONAL">
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.625rem' }}>
          Flag any issues with this PDS for the team to review. This feedback will be attached to the document record.
        </p>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="e.g. Horse narrative needs review by compliance. Lease start date is tentative pending trainer confirmation."
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
              Product Disclosure Statement {'\u2014'} Step {step} of 5: {STEP_NAMES[step - 1]}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {step === 1 && 'Select the horse and verify identity data auto-filled from SSOT.'}
              {step === 2 && 'Configure offering terms, front matter, and horse narrative.'}
              {step === 3 && 'Review all 8 PDS sections before generating the document.'}
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
