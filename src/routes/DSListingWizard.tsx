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

type DSListingWizardProps = {
  horses: HorseData[];
  trainers: TrainerData[];
  onClose: () => void;
  onGenerate: (data: Record<string, unknown>) => void;
};

// ─── Load rich JSON data via Vite import.meta.glob ──────────────────────────

const horseModules = import.meta.glob<{ default: RichHorseJson }>('/data/horses/*.json', { eager: true });
const sireModules = import.meta.glob<{ default: RichSireJson }>('/data/sires/*.json', { eager: true });
const damModules = import.meta.glob<{ default: RichDamJson }>('/data/dams/*.json', { eager: true });
const trainerModules = import.meta.glob<{ default: RichTrainerJson }>('/data/trainers/*.json', { eager: true });
const boilerplateModule = import.meta.glob<{ default: BoilerplateJson }>('/data/templates/boilerplate.json', { eager: true });

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
const boilerplate: BoilerplateJson = Object.values(boilerplateModule)[0]?.default ?? {
  intro_template: '',
  why_tokenise_heading: 'Why Tokenise a Racehorse?',
  why_tokenise_body: '',
  earnings_language: '',
  earnings_sentence: '',
  pedigree_intro: 'Built on Pedigree',
  pedigree_intro_body: '',
  asset_type: 'Horse',
  promoted_default: 'Yes',
};

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

function generateSearchTerms(data: {
  horseName: string; trainerName: string; stableName: string;
  sireName: string; damName: string; location: string; colour: string; sex: string;
}): string {
  return [
    data.horseName, data.trainerName, data.stableName,
    data.sireName.replace(/\s*\(.*?\)/g, ''), data.damName.replace(/\s*\(.*?\)/g, ''),
    data.location, data.colour, data.sex,
    'Evolution Stables', 'Tokinvest', 'racehorse', 'tokenisation', 'horse racing', 'New Zealand', 'thoroughbred',
  ].filter(Boolean).join(', ');
}

function buildDetailSummary(parts: {
  colour: string; sex: string; foalingDate: string;
  sireName: string; damName: string; trainerDisplay: string;
  location: string; leaseDuration: number; microchip: string;
}): string {
  return [
    `${parts.colour} ${parts.sex}, ${parts.foalingDate.split('-')[0] ?? ''}`,
    `Sire: ${parts.sireName}`,
    `Dam: ${parts.damName}`,
    `Trainer: ${parts.trainerDisplay}`,
    `Location: ${parts.location}`,
    `Lease Duration: ${parts.leaseDuration} months`,
    `Microchip: ${parts.microchip}`,
  ].filter((p) => {
    const v = p.split(': ').slice(1).join(': ');
    return v && v.trim() !== '';
  }).join(' | ');
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
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</span>
    </div>
  );
}

// ─── Step Progress Indicator ──────────────────────────────────────────────────

const STEP_NAMES = ['Select Horse', 'Narrative Content', 'Details & Meta', 'Review & Generate', 'Document Review'];

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

export default function DSListingWizard({ horses, trainers, onClose, onGenerate }: DSListingWizardProps) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedOnce, setGeneratedOnce] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Step 1 — Horse identity
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [loveracingUrl, setLoveracingUrl] = useState('');

  // Step 2 — Narrative content (auto-populated from rich JSON, editable)
  const [horseIntro, setHorseIntro] = useState('');
  const [narrativeHeadline, setNarrativeHeadline] = useState('');
  const [narrativeBody, setNarrativeBody] = useState('');
  const [sireDescription, setSireDescription] = useState('');
  const [damDescription, setDamDescription] = useState('');
  const [trainerBio, setTrainerBio] = useState('');

  // Step 3 — Details & Meta (auto-populated from offering data)
  const [leaseDuration, setLeaseDuration] = useState(16);
  const [location, setLocation] = useState('');
  const [racingRecord, setRacingRecord] = useState('');
  const [searchTerms, setSearchTerms] = useState('');

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

  // ── Auto-fill when horse selection changes ────────────────────────────────
  const handleHorseChange = useCallback((id: string) => {
    setSelectedHorseId(id);
    const horse = horses.find((h) => h.horse_id === id) ?? null;
    if (!horse) return;

    const slug = slugFromSeedHorse(horse);
    const rh = horseLookup[slug];
    const rs = rh ? sireLookup[rh.sireSlug] : null;
    const rd = rh ? damLookup[rh.damSlug] : null;
    const rt = rh ? trainerLookup[rh.trainerSlug] : null;
    const seedTrainer = trainers.find((t) => t.trainer_id === horse.trainer_id) ?? null;

    // Auto-fill narrative from rich horse JSON
    if (rh?.narrative?.horse_intro) setHorseIntro(rh.narrative.horse_intro);
    else setHorseIntro('');

    if (rh?.narrative?.headline) setNarrativeHeadline(rh.narrative.headline);
    else setNarrativeHeadline('');

    if (rh?.narrative?.body) setNarrativeBody(rh.narrative.body);
    else setNarrativeBody('');

    // Auto-fill REUSABLE sire/dam/trainer descriptions
    if (rs?.description) setSireDescription(rs.description);
    else setSireDescription('');

    if (rd?.description) setDamDescription(rd.description);
    else setDamDescription('');

    if (rt?.bio) setTrainerBio(rt.bio);
    else setTrainerBio('');

    // Auto-fill offering details
    const offering = rh?.offering;
    setLeaseDuration(offering?.duration_months ?? offering?.leaseDurationMonths ?? 16);
    setLocation(offering?.location ?? rt?.location ?? seedTrainer?.notes ?? '');
    setRacingRecord(rh?.racingRecord ?? '');

    // Generate search terms
    const sireName = rh?.pedigree?.sire_name ?? horse.sire ?? '';
    const damName = rh?.pedigree?.dam_name ?? horse.dam ?? '';
    setSearchTerms(generateSearchTerms({
      horseName: horse.horse_name,
      trainerName: rt?.trainer_name ?? seedTrainer?.trainer_name ?? '',
      stableName: rt?.stable_name ?? seedTrainer?.stable_name ?? '',
      sireName, damName,
      location: offering?.location ?? rt?.location ?? '',
      colour: horse.colour,
      sex: horse.sex,
    }));
  }, [horses, trainers]);

  // Computed derived fields
  const foalingDate = richHorse?.foalingDate ?? selectedHorse?.foaling_date ?? '';
  const ageName = foalingDate ? ageDescription(foalingDate) : '';
  const horseDOBFormatted = formatDateDMY(foalingDate);
  const foalingYear = foalingDate ? foalingDate.split('-')[0] ?? '' : '';
  const offeringTitle = selectedHorse ? `${selectedHorse.horse_name} (${selectedHorse.country_code})` : '';
  const previewDetails = selectedHorse ? `${offeringTitle}, ${ageName} ${selectedHorse.sex}` : '';
  const horseColour = selectedHorse ? `${selectedHorse.colour} ${selectedHorse.sex}` : '';
  const sireName = richHorse?.pedigree?.sire_name ?? richSire?.display_name ?? selectedHorse?.sire ?? '';
  const damName = richHorse?.pedigree?.dam_name ?? richDam?.display_name ?? selectedHorse?.dam ?? '';
  const trainerDisplay = richTrainer
    ? `${richTrainer.stable_name} (${richTrainer.contact_name})`
    : autoTrainer
      ? `${autoTrainer.stable_name} (${autoTrainer.contact_name})`
      : '';
  const detailSummary = selectedHorse ? buildDetailSummary({
    colour: selectedHorse.colour, sex: selectedHorse.sex, foalingDate,
    sireName, damName, trainerDisplay, location, leaseDuration,
    microchip: richHorse?.microchip ?? selectedHorse?.microchip_number ?? '',
  }) : '';

  // Static boilerplate
  const staticIntro = boilerplate.intro_template.replace(/\{horseName\}/g, selectedHorse?.horse_name ?? '{horseName}');
  const earningsSentence = boilerplate.earnings_sentence;
  const pedigreeIntroBody = boilerplate.pedigree_intro_body.replace(/\{horseName\}/g, selectedHorse?.horse_name ?? '{horseName}');

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, 5));
  const goBack = () => {
    if (step === 1) onClose();
    else setStep((s) => s - 1);
  };

  // ── Generate .docx ────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!selectedHorse) return;
    setGenerating(true);
    try {
      const { buildDsListingDocxBlob } = await import('../lib/lazyExports');
      const blob = await buildDsListingDocxBlob({
        horseName: selectedHorse.horse_name,
        countryCode: selectedHorse.country_code,
        foalingDate,
        sex: selectedHorse.sex,
        colour: selectedHorse.colour,
        microchip: richHorse?.microchip ?? selectedHorse.microchip_number ?? '',
        breedingUrl: richHorse?.breedingUrl ?? selectedHorse.breeding_url ?? '',
        sireName,
        damName,
        sireDisplayName: richSire?.display_name ?? sireName,
        damDisplayName: richDam?.display_name ?? damName,
        sireDescription,
        damDescription,
        trainerName: richTrainer?.trainer_name ?? autoTrainer?.trainer_name ?? '',
        stableName: richTrainer?.stable_name ?? autoTrainer?.stable_name ?? '',
        contactName: richTrainer?.contact_name ?? autoTrainer?.contact_name ?? '',
        trainerBio,
        trainerLocation: location,
        trainerFullAddress: richTrainer?.full_address ?? location,
        horseIntro,
        narrativeHeadline,
        narrativeBody,
        earningsSentence,
        racingRecord,
        leaseDuration,
        leaseStartDate: richHorse?.offering?.start_date ?? '',
        leaseEndDate: richHorse?.offering?.end_date ?? '',
        searchTerms,
        detailSummary,
        offeringTitle,
        previewDetails,
        horseColour,
        horseDOB: horseDOBFormatted,
        ageName,
        pedigreeIntroBody,
        boilerplate: {
          why_tokenise_heading: boilerplate.why_tokenise_heading,
          why_tokenise_body: boilerplate.why_tokenise_body,
          pedigree_intro: boilerplate.pedigree_intro,
          asset_type: boilerplate.asset_type,
          promoted_default: boilerplate.promoted_default,
        },
        races: richHorse?.races ?? [],
        currentStatus: richHorse?.narrative?.current_status ?? racingRecord,
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${richHorse?.slug ?? slugFromSeedHorse(selectedHorse)}-DS-listing.docx`;
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
        richSire,
        richDam,
        richTrainer,
        horseIntro, narrativeHeadline, narrativeBody,
        sireDescription, damDescription, trainerBio,
        leaseDuration, location, racingRecord, searchTerms,
        detailSummary, offeringTitle, previewDetails, horseColour,
        horseDOB: horseDOBFormatted, ageName,
      });
    } catch (err) {
      console.error('Failed to generate .docx:', err);
      alert('Failed to generate document. Check the console for details.');
    } finally {
      setGenerating(false);
    }
  }, [
    selectedHorse, richHorse, richSire, richDam, richTrainer, autoTrainer,
    foalingDate, sireName, damName, sireDescription, damDescription,
    trainerBio, location, horseIntro, narrativeHeadline, narrativeBody,
    earningsSentence, racingRecord, leaseDuration, searchTerms,
    detailSummary, offeringTitle, previewDetails, horseColour,
    horseDOBFormatted, ageName, pedigreeIntroBody, onGenerate, generatedOnce,
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
                <option value="">— Select a horse —</option>
                {horses.map((h) => (
                  <option key={h.horse_id} value={h.horse_id}>{h.horse_name} ({h.country_code})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <FieldLabel>Or enter loveracing.nz URL</FieldLabel>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <input type="url" value={loveracingUrl} onChange={(e) => setLoveracingUrl(e.target.value)}
                  placeholder="https://loveracing.nz/Breeding/..."
                  style={{ flex: 1, borderRadius: '0.375rem', border: '1px solid #e2e8f0', padding: '0.5rem 0.625rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }} />
                <button onClick={() => alert('Loveracing.nz fetch will be wired in a future update. For now, select a horse from the dropdown.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  style={{ flexShrink: 0 }}>Fetch</button>
              </div>
            </div>
            {selectedHorse ? (
              <div style={{ borderRadius: '0.5rem', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                <InfoPill label="Name" value={selectedHorse.horse_name} />
                <InfoPill label="Country" value={selectedHorse.country_code} />
                <InfoPill label="Foaling Date" value={selectedHorse.foaling_date} />
                <InfoPill label="Sex" value={selectedHorse.sex} />
                <InfoPill label="Colour" value={selectedHorse.colour} />
                <InfoPill label="Microchip" value={richHorse?.microchip ?? selectedHorse.microchip_number} />
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

        {/* Right: Counterparties */}
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
                {richTrainer?.bio && <InfoPill label="Bio" value={`${richTrainer.bio.slice(0, 80)}...`} />}
              </div>
            ) : (
              <div style={{ borderRadius: '0.5rem', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                Trainer details will appear here
              </div>
            )}
          </SectionCard>

          {/* Offering summary (from rich JSON) */}
          {richHorse?.offering && (
            <SectionCard title="Offering Data" badge="FROM SSOT">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                <InfoPill label="Lease Duration" value={`${richHorse.offering.duration_months ?? richHorse.offering.leaseDurationMonths ?? '—'} months`} />
                <InfoPill label="Location" value={richHorse.offering.location ?? ''} />
                {richHorse.offering.token_count && <InfoPill label="Tokens" value={String(richHorse.offering.token_count)} />}
                {richHorse.offering.token_price_nzd && <InfoPill label="Token Price" value={`$${richHorse.offering.token_price_nzd}`} />}
                {richHorse.offering.investor_share_percent && <InfoPill label="Investor Share" value={`${richHorse.offering.investor_share_percent}%`} />}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {selectedHorse && (
        <SectionCard title="Auto-Filled from SSOT" badge="READ ONLY">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <InfoPill label="Horse Display" value={`${selectedHorse.horse_name} (${selectedHorse.country_code}) ${foalingYear}`} />
            <InfoPill label="Microchip" value={richHorse?.microchip ?? selectedHorse.microchip_number} />
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.125rem' }}>Breeding URL</span>
              {(richHorse?.breedingUrl ?? selectedHorse.breeding_url) ? (
                <a href={richHorse?.breedingUrl ?? selectedHorse.breeding_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {richHorse?.breedingUrl ?? selectedHorse.breeding_url}
                </a>
              ) : (
                <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>—</span>
              )}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <SectionCard title="Horse Introduction">
        <ReadOnlyGrey>{staticIntro}</ReadOnlyGrey>
        <TextareaField
          label="Horse-specific Introduction Paragraph (Input)"
          value={horseIntro}
          onChange={setHorseIntro}
          placeholder={selectedHorse ? `e.g. ${selectedHorse.horse_name} (${selectedHorse.country_code}) is a New Zealand-bred ${ageName} ${selectedHorse.sex} by ${sireName}, trained by...` : 'A unique paragraph introducing this horse, its breeding, and training situation.'}
          rows={4}
          note={richHorse?.narrative?.horse_intro ? 'Pre-filled from SSOT horse profile. Edit as needed.' : undefined}
        />
      </SectionCard>

      <SectionCard title="Horse Narrative">
        <InputField label="Narrative Headline" value={narrativeHeadline} onChange={setNarrativeHeadline}
          placeholder="e.g. Presence, Balance, and Pedigree"
          note={richHorse?.narrative?.headline ? 'Pre-filled from SSOT.' : undefined} />
        <TextareaField label="Narrative Body" value={narrativeBody} onChange={setNarrativeBody}
          placeholder="1-2 paragraphs describing the horse's physical attributes, pedigree highlights, and training status." rows={6}
          note={richHorse?.narrative?.body ? 'Pre-filled from SSOT horse profile. Edit as needed.' : undefined} />
        <ReadOnlyGrey>{earningsSentence}</ReadOnlyGrey>
      </SectionCard>

      <SectionCard title="Pedigree Descriptions" badge="REUSABLE">
        <TextareaField
          label={`Sire Description — ${richSire?.display_name ?? sireName}`}
          value={sireDescription} onChange={setSireDescription}
          placeholder="Enter sire description or select from saved sire profiles..." rows={4}
          note={richSire?.description ? 'Pre-filled from SSOT sire profile.' : undefined} />
        <TextareaField
          label={`Dam Description — ${richDam?.display_name ?? damName}`}
          value={damDescription} onChange={setDamDescription}
          placeholder="Enter dam description or select from saved dam profiles..." rows={4}
          note={richDam?.description ? 'Pre-filled from SSOT dam profile.' : undefined} />
      </SectionCard>

      <SectionCard title="Trainer Bio" badge="REUSABLE">
        <TextareaField
          label={`Trainer Bio — ${richTrainer?.trainer_name ?? autoTrainer?.trainer_name ?? ''}`}
          value={trainerBio} onChange={setTrainerBio}
          placeholder="Select a saved trainer profile or enter manually..." rows={5}
          note={richTrainer?.bio ? 'Pre-filled from SSOT trainer profile.' : 'Trainer bios are reusable — saved content will be available for future horses.'} />
      </SectionCard>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <SectionCard title="Offering Details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField label="Lease Duration (months)" value={leaseDuration} onChange={(v) => setLeaseDuration(Number(v))} type="number"
            note={richHorse?.offering ? 'Pre-filled from SSOT offering data.' : undefined} />
          <InputField label="Location" value={location} onChange={setLocation} placeholder="e.g. Wexford Stables, Matamata, New Zealand"
            note={richHorse?.offering?.location ? 'Pre-filled from SSOT.' : undefined} />
        </div>
        <InputField label="Racing Record" value={racingRecord} onChange={setRacingRecord}
          placeholder="e.g. Early Career / Trialing or 3:1-0-1 ($12,450)"
          note={richHorse?.racingRecord ? 'Pre-filled from SSOT.' : undefined} />
      </SectionCard>

      <SectionCard title="Meta Keys">
        <InputField label="Search Terms (auto-generated)" value={searchTerms} onChange={setSearchTerms}
          placeholder="Auto-generated from horse name, sire, trainer, location"
          note="Edit to add additional keywords. Separate with commas." />
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.875rem', marginTop: '0.25rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Derived Fields (read-only — generated from data above)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoPill label="Offering Title" value={offeringTitle} />
            <InfoPill label="Preview Details" value={previewDetails} />
            <InfoPill label="Trainer (meta)" value={richTrainer?.contact_name ?? autoTrainer?.contact_name ?? ''} />
            <InfoPill label="Horse Type" value={selectedHorse?.sex ?? ''} />
            <InfoPill label="Horse Colour" value={horseColour} />
            <InfoPill label="Horse DOB" value={horseDOBFormatted} />
            <InfoPill label="Age" value={ageName} />
            <InfoPill label="Asset Type" value={boilerplate.asset_type} />
            <InfoPill label="Promoted" value={boilerplate.promoted_default} />
            <InfoPill label="Property Location" value={location} />
          </div>
          <div style={{ marginTop: '0.875rem' }}>
            <FieldLabel>Detail Summary (derived)</FieldLabel>
            <div style={{ borderRadius: '0.375rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55, minHeight: '2.5rem' }}>
              {detailSummary || <span style={{ color: '#cbd5e1' }}>Will be generated from fields above</span>}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
        Review all sections before generating. Fields shown as "—" or "(empty)" were left blank.
      </p>
      <ReviewBlock title="Horse Identity" rows={[
        { label: 'Horse', value: offeringTitle },
        { label: 'Foaling Year', value: foalingYear },
        { label: 'Age', value: ageName },
        { label: 'Sex', value: selectedHorse?.sex ?? '' },
        { label: 'Colour', value: selectedHorse?.colour ?? '' },
        { label: 'Sire', value: sireName },
        { label: 'Dam', value: damName },
        { label: 'Microchip', value: richHorse?.microchip ?? selectedHorse?.microchip_number ?? '' },
        { label: 'Breeding URL', value: richHorse?.breedingUrl ?? selectedHorse?.breeding_url ?? '' },
      ]} />
      <ReviewBlock title="Counterparties" rows={[
        { label: 'Trainer', value: richTrainer?.trainer_name ?? autoTrainer?.trainer_name ?? '' },
        { label: 'Stable', value: richTrainer?.stable_name ?? autoTrainer?.stable_name ?? '' },
        { label: 'Contact', value: richTrainer?.contact_name ?? autoTrainer?.contact_name ?? '' },
        { label: 'Location', value: location },
      ]} />
      <ReviewBlock title="Narrative Content" rows={[
        { label: 'Static Intro', value: staticIntro },
        { label: 'Horse Intro', value: horseIntro },
        { label: 'Headline', value: narrativeHeadline },
        { label: 'Narrative Body', value: narrativeBody },
        { label: 'Earnings', value: earningsSentence },
        { label: 'Sire Description', value: sireDescription },
        { label: 'Dam Description', value: damDescription },
        { label: 'Trainer Bio', value: trainerBio },
      ]} />
      <ReviewBlock title="Offering Details & Meta" rows={[
        { label: 'Lease Duration', value: `${leaseDuration} months` },
        { label: 'Racing Record', value: racingRecord },
        { label: 'Offering Title', value: offeringTitle },
        { label: 'Preview Details', value: previewDetails },
        { label: 'Horse Colour', value: horseColour },
        { label: 'Horse DOB', value: horseDOBFormatted },
        { label: 'Search Terms', value: searchTerms },
        { label: 'Detail Summary', value: detailSummary },
        { label: 'Asset Type', value: boilerplate.asset_type },
        { label: 'Promoted', value: boilerplate.promoted_default },
      ]} />
    </div>
  );

  // ── Editable review field (Step 5) ────────────────────────────────────────
  const editableFieldMap: Record<string, { get: () => string; set: (v: string) => void; multiline?: boolean }> = useMemo(() => ({
    'Horse Introduction': { get: () => horseIntro, set: setHorseIntro, multiline: true },
    'Narrative Headline': { get: () => narrativeHeadline, set: setNarrativeHeadline },
    'Narrative Body': { get: () => narrativeBody, set: setNarrativeBody, multiline: true },
    'Sire Description': { get: () => sireDescription, set: setSireDescription, multiline: true },
    'Dam Description': { get: () => damDescription, set: setDamDescription, multiline: true },
    'Trainer Bio': { get: () => trainerBio, set: setTrainerBio, multiline: true },
    'Racing Record': { get: () => racingRecord, set: setRacingRecord },
    'Search Terms': { get: () => searchTerms, set: setSearchTerms },
    'Location': { get: () => location, set: setLocation },
    'Lease Duration': { get: () => String(leaseDuration), set: (v) => setLeaseDuration(Number(v) || 0) },
  }), [horseIntro, narrativeHeadline, narrativeBody, sireDescription, damDescription, trainerBio, racingRecord, searchTerms, location, leaseDuration]);

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

      <SectionCard title="Section 1: Offering Header" badge="DERIVED">
        <EditableReviewRow label="Offering Title" value={offeringTitle} />
        <EditableReviewRow label="Preview Details" value={previewDetails} />
      </SectionCard>

      <SectionCard title="Section 2: Full Details (Marketing Copy)">
        <EditableReviewRow label="Static Intro" value={staticIntro} />
        <EditableReviewRow label="Horse Intro" value={horseIntro} fieldKey="Horse Introduction" />
        <EditableReviewRow label="Headline" value={narrativeHeadline} fieldKey="Narrative Headline" />
        <EditableReviewRow label="Narrative Body" value={narrativeBody} fieldKey="Narrative Body" />
        <EditableReviewRow label="Earnings" value={earningsSentence} />
        <EditableReviewRow label="Trainer Bio" value={trainerBio} fieldKey="Trainer Bio" />
      </SectionCard>

      <SectionCard title="Section 3: Pedigree Block">
        <EditableReviewRow label="Sire Description" value={sireDescription} fieldKey="Sire Description" />
        <EditableReviewRow label="Dam Description" value={damDescription} fieldKey="Dam Description" />
      </SectionCard>

      <SectionCard title="Section 4: Meta Keys">
        <EditableReviewRow label="Racing Record" value={racingRecord} fieldKey="Racing Record" />
        <EditableReviewRow label="Trainer" value={richTrainer?.trainer_name ?? autoTrainer?.trainer_name ?? ''} />
        <EditableReviewRow label="Horse Type" value={selectedHorse?.sex ?? ''} />
        <EditableReviewRow label="Location" value={location} fieldKey="Location" />
        <EditableReviewRow label="Search Terms" value={searchTerms} fieldKey="Search Terms" />
        <EditableReviewRow label="Horse Colour" value={horseColour} />
        <EditableReviewRow label="Horse DOB" value={horseDOBFormatted} />
        <EditableReviewRow label="Asset Type" value={boilerplate.asset_type} />
        <EditableReviewRow label="Lease Duration" value={`${leaseDuration} months`} fieldKey="Lease Duration" />
        <EditableReviewRow label="Detail Summary" value={detailSummary} />
      </SectionCard>

      {/* Step 5 (Bonus): Feedback / Issue Flagging */}
      <SectionCard title="Review Feedback" badge="OPTIONAL">
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.625rem' }}>
          Flag any issues with this listing for the team to review. This feedback will be attached to the document record.
        </p>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="e.g. Sire description needs updating — recent Group 1 win not included. Trainer bio mentions old stable location."
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
              New DS Listing — Step {step} of 5: {STEP_NAMES[step - 1]}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {step === 1 && 'Select the horse and verify counterparties auto-filled from SSOT.'}
              {step === 2 && 'Write or paste narrative content for each section. Reusable profiles are pre-filled where available.'}
              {step === 3 && 'Confirm offering details and check the derived meta key values.'}
              {step === 4 && 'Review all data. Click Generate to produce the .docx file.'}
              {step === 5 && 'Review the generated document. Click fields to edit, then re-generate if needed.'}
            </p>
          </div>
          <button onClick={onClose}
            style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 400, lineHeight: 1 }}
            aria-label="Close wizard">\u00d7</button>
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
                <button onClick={onClose}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Done
                </button>
              </>
            ) : step === 4 ? (
              <>
                <button onClick={() => alert('Draft saved — save functionality will be wired in a future update.')}
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
                Next \u2192
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
