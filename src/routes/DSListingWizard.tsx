import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFoalingYear(foalingDate: string): string {
  if (!foalingDate) return '';
  return foalingDate.split('-')[0] ?? '';
}

function buildSearchTerms(horse: HorseData | null, trainer: TrainerData | null): string {
  if (!horse) return '';
  const parts = [
    horse.horse_name,
    horse.sire,
    horse.dam,
    trainer?.stable_name ?? '',
    trainer?.contact_name ?? '',
    horse.country_code,
    'thoroughbred',
    'racehorse',
    'tokenise',
    'investment',
  ];
  return parts.filter(Boolean).join(', ');
}

function buildDetailSummary(
  horse: HorseData | null,
  trainer: TrainerData | null,
  location: string,
  leaseDuration: number
): string {
  if (!horse) return '';
  const foalingYear = getFoalingYear(horse.foaling_date);
  const trainerDisplay = trainer ? `${trainer.stable_name} (${trainer.contact_name})` : '';
  const parts = [
    `${horse.colour} ${horse.sex}, ${foalingYear}`,
    `Sire: ${horse.sire}`,
    `Dam: ${horse.dam}`,
    `Trainer: ${trainerDisplay}`,
    `Location: ${location}`,
    `Lease Duration: ${leaseDuration} months`,
    `Microchip: ${horse.microchip_number}`,
  ];
  return parts.filter((p) => p.split(': ')[1]).join(' | ');
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.375rem',
      }}
    >
      {children}
    </label>
  );
}

function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div
      style={{
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#64748b',
              backgroundColor: '#e2e8f0',
              borderRadius: '9999px',
              padding: '0.0625rem 0.5rem',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: '1rem' }}>{children}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
  note,
}: {
  label: string;
  value: string | number;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: '0.375rem',
          border: '1px solid #e2e8f0',
          padding: '0.5rem 0.625rem',
          fontSize: '0.875rem',
          color: readOnly ? '#94a3b8' : '#0f172a',
          backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
          outline: 'none',
        }}
      />
      {note && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{note}</p>
      )}
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  readOnly = false,
  note,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: '0.375rem',
          border: '1px solid #e2e8f0',
          padding: '0.5rem 0.625rem',
          fontSize: '0.875rem',
          color: readOnly ? '#94a3b8' : '#0f172a',
          backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.55,
        }}
      />
      {note && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{note}</p>
      )}
    </div>
  );
}

function ReadOnlyGrey({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.8125rem',
        color: '#94a3b8',
        lineHeight: 1.55,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem',
        padding: '0.625rem 0.75rem',
        marginBottom: '0.875rem',
        fontStyle: 'italic',
      }}
    >
      {children}
    </p>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>
        {value || <span style={{ color: '#cbd5e1' }}>—</span>}
      </span>
    </div>
  );
}

// ─── Step Progress Indicator ──────────────────────────────────────────────────

const STEP_NAMES = ['Select Horse', 'Narrative Content', 'Details & Meta', 'Review & Generate'];

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
              <div
                style={{
                  width: '1.875rem',
                  height: '1.875rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: isActive || isCompleted ? '#2563eb' : '#e2e8f0',
                  color: isActive || isCompleted ? '#ffffff' : '#64748b',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                }}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#2563eb' : isCompleted ? '#64748b' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  maxWidth: '5rem',
                  lineHeight: 1.3,
                }}
              >
                {name}
              </span>
            </div>
            {idx < STEP_NAMES.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: current > stepNum ? '#3b82f6' : '#e2e8f0',
                  marginBottom: '1.125rem',
                  transition: 'background-color 0.2s',
                }}
              />
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
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.5rem',
          paddingBottom: '0.375rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
            <span
              style={{
                flexShrink: 0,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#94a3b8',
                width: '10rem',
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                color: value ? '#334155' : '#cbd5e1',
                whiteSpace: 'pre-wrap',
                flex: 1,
              }}
            >
              {value || '(empty)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DSListingWizard({ horses, trainers, onClose, onGenerate }: DSListingWizardProps) {
  const [step, setStep] = useState(1);

  // Step 1 — Horse identity
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [loveracingUrl, setLoveracingUrl] = useState('');

  // Step 2 — Narrative content
  const [horseIntro, setHorseIntro] = useState('');
  const [narrativeHeadline, setNarrativeHeadline] = useState('');
  const [narrativeBody, setNarrativeBody] = useState('');
  const [sireDescription, setSireDescription] = useState('');
  const [damDescription, setDamDescription] = useState('');
  const [trainerBio, setTrainerBio] = useState('');

  // Step 3 — Details & Meta
  const [leaseDuration, setLeaseDuration] = useState(16);
  const [location, setLocation] = useState('');
  const [racingRecord, setRacingRecord] = useState('');
  const [searchTerms, setSearchTerms] = useState('');

  // ── Derived values ──────────────────────────────────────────────────────────
  const selectedHorse = horses.find((h) => h.horse_id === selectedHorseId) ?? null;
  const autoTrainer = selectedHorse
    ? trainers.find((t) => t.trainer_id === selectedHorse.trainer_id) ?? null
    : null;
  const foalingYear = selectedHorse ? getFoalingYear(selectedHorse.foaling_date) : '';

  // When horse changes, auto-fill dependent fields
  const handleHorseChange = (id: string) => {
    setSelectedHorseId(id);
    const horse = horses.find((h) => h.horse_id === id) ?? null;
    const trainer = horse ? trainers.find((t) => t.trainer_id === horse.trainer_id) ?? null : null;
    setLocation(trainer?.notes ?? '');
    setRacingRecord(horse ? '' : '');
    setSearchTerms(buildSearchTerms(horse, trainer));
    // Pre-fill narrative from horse data if available (cast to any since HorseData doesn't include narrative fields but actual data may)
    const h = horse as Record<string, unknown> | null;
    if (h && h['horse_intro']) setHorseIntro(h['horse_intro'] as string);
    if (h && h['narrative_headline']) setNarrativeHeadline(h['narrative_headline'] as string);
    if (h && h['narrative_body']) setNarrativeBody(h['narrative_body'] as string);
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep((s) => s - 1);
    }
  };

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    const data: Record<string, unknown> = {
      horse: selectedHorse,
      trainer: autoTrainer,
      horseIntro,
      narrativeHeadline,
      narrativeBody,
      sireDescription,
      damDescription,
      trainerBio,
      leaseDuration,
      location,
      racingRecord,
      searchTerms,
      detailSummary: buildDetailSummary(selectedHorse, autoTrainer, location, leaseDuration),
      offeringTitle: selectedHorse
        ? `${selectedHorse.horse_name} (${selectedHorse.country_code})`
        : '',
      previewDetails: selectedHorse
        ? `${selectedHorse.horse_name} (${selectedHorse.country_code}), ${foalingYear} ${selectedHorse.sex}`
        : '',
      horseColour: selectedHorse ? `${selectedHorse.colour} ${selectedHorse.sex}` : '',
      horseDOB: selectedHorse?.foaling_date ?? '',
    };
    onGenerate(data);
  };

  // ─── Boilerplate ─────────────────────────────────────────────────────────────
  const STATIC_INTRO =
    'Tokinvest is bringing the excitement of thoroughbred racing to a new generation of investors through digital-syndication, a tokenised model of ownership that provides simple access to the performance and potential of real-world racehorses.';
  const EARNINGS_SENTENCE =
    'Investors receive a pro-rata share of 75% of eligible race earnings, distributed quarterly in accordance with the lease terms.';

  // ─── Render steps ────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Left: Horse Identity */}
        <div>
          <SectionCard title="Horse Identity">
            {/* Select dropdown */}
            <div style={{ marginBottom: '0.875rem' }}>
              <FieldLabel>Select Horse</FieldLabel>
              <select
                value={selectedHorseId}
                onChange={(e) => handleHorseChange(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '0.375rem',
                  border: '1px solid #e2e8f0',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.875rem',
                  color: selectedHorseId ? '#0f172a' : '#94a3b8',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="">— Select a horse —</option>
                {horses.map((h) => (
                  <option key={h.horse_id} value={h.horse_id}>
                    {h.horse_name} ({h.country_code})
                  </option>
                ))}
              </select>
            </div>

            {/* loveracing.nz URL */}
            <div style={{ marginBottom: '0.875rem' }}>
              <FieldLabel>Or enter loveracing.nz URL</FieldLabel>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <input
                  type="url"
                  value={loveracingUrl}
                  onChange={(e) => setLoveracingUrl(e.target.value)}
                  placeholder="https://loveracing.nz/Breeding/..."
                  style={{
                    flex: 1,
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0',
                    padding: '0.5rem 0.625rem',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() =>
                    alert(
                      'Loveracing.nz fetch will be wired in a future update. For now, select a horse from the dropdown.'
                    )
                  }
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  style={{ flexShrink: 0 }}
                >
                  Fetch
                </button>
              </div>
            </div>

            {/* Preview card */}
            {selectedHorse ? (
              <div
                style={{
                  borderRadius: '0.5rem',
                  border: '1px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  padding: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.625rem',
                }}
              >
                <InfoPill label="Name" value={selectedHorse.horse_name} />
                <InfoPill label="Country" value={selectedHorse.country_code} />
                <InfoPill label="Foaling Date" value={selectedHorse.foaling_date} />
                <InfoPill label="Sex" value={selectedHorse.sex} />
                <InfoPill label="Colour" value={selectedHorse.colour} />
                <InfoPill label="Microchip" value={selectedHorse.microchip_number} />
                <InfoPill label="Sire" value={selectedHorse.sire} />
                <InfoPill label="Dam" value={selectedHorse.dam} />
              </div>
            ) : (
              <div
                style={{
                  borderRadius: '0.5rem',
                  border: '1px dashed #e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: '1.25rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8125rem',
                }}
              >
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
              <select
                value={autoTrainer?.trainer_id ?? ''}
                disabled
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '0.375rem',
                  border: '1px solid #e2e8f0',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.875rem',
                  color: autoTrainer ? '#0f172a' : '#94a3b8',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                }}
              >
                {autoTrainer ? (
                  <option value={autoTrainer.trainer_id}>{autoTrainer.trainer_name}</option>
                ) : (
                  <option value="">Auto-filled from horse selection</option>
                )}
              </select>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Auto-filled from horse's trainer_id
              </p>
            </div>

            {autoTrainer ? (
              <div
                style={{
                  borderRadius: '0.5rem',
                  border: '1px solid #dcfce7',
                  backgroundColor: '#f0fdf4',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <InfoPill label="Stable" value={autoTrainer.stable_name} />
                <InfoPill label="Contact" value={autoTrainer.contact_name} />
                <InfoPill label="Location" value={autoTrainer.notes} />
              </div>
            ) : (
              <div
                style={{
                  borderRadius: '0.5rem',
                  border: '1px dashed #e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: '1.25rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8125rem',
                }}
              >
                Trainer details will appear here
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Auto-filled from SSOT */}
      {selectedHorse && (
        <SectionCard title="Auto-Filled from SSOT" badge="READ ONLY">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.875rem',
            }}
          >
            <InfoPill
              label="Horse Display"
              value={`${selectedHorse.horse_name} (${selectedHorse.country_code}) ${foalingYear}`}
            />
            <InfoPill label="Microchip" value={selectedHorse.microchip_number} />
            <div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '0.125rem',
                }}
              >
                Breeding URL
              </span>
              {selectedHorse.breeding_url ? (
                <a
                  href={selectedHorse.breeding_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedHorse.breeding_url}
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
      {/* Horse Introduction */}
      <SectionCard title="Horse Introduction">
        <ReadOnlyGrey>{STATIC_INTRO}</ReadOnlyGrey>
        <TextareaField
          label="Horse-specific Introduction Paragraph (Input)"
          value={horseIntro}
          onChange={setHorseIntro}
          placeholder={
            selectedHorse
              ? `e.g. ${selectedHorse.horse_name} (${selectedHorse.country_code}) is a New Zealand-bred ${foalingYear} ${selectedHorse.sex} by ${selectedHorse.sire}, trained by...`
              : 'A unique paragraph introducing this horse, its breeding, and training situation.'
          }
          rows={4}
        />
      </SectionCard>

      {/* Horse Narrative */}
      <SectionCard title="Horse Narrative">
        <InputField
          label="Narrative Headline"
          value={narrativeHeadline}
          onChange={setNarrativeHeadline}
          placeholder="e.g. Presence, Balance, and Pedigree"
        />
        <TextareaField
          label="Narrative Body"
          value={narrativeBody}
          onChange={setNarrativeBody}
          placeholder="1–2 paragraphs describing the horse's physical attributes, pedigree highlights, and training status."
          rows={6}
        />
        <ReadOnlyGrey>{EARNINGS_SENTENCE}</ReadOnlyGrey>
      </SectionCard>

      {/* Pedigree Descriptions */}
      <SectionCard title="Pedigree Descriptions">
        <TextareaField
          label={`Sire Description${selectedHorse ? ` — ${selectedHorse.sire}` : ''}`}
          value={sireDescription}
          onChange={setSireDescription}
          placeholder="Enter sire description or select from saved sire profiles..."
          rows={4}
        />
        <TextareaField
          label={`Dam Description${selectedHorse ? ` — ${selectedHorse.dam}` : ''}`}
          value={damDescription}
          onChange={setDamDescription}
          placeholder="Enter dam description or select from saved dam profiles..."
          rows={4}
        />
      </SectionCard>

      {/* Trainer Bio */}
      <SectionCard title="Trainer Bio">
        <TextareaField
          label={`Trainer Bio${autoTrainer ? ` — ${autoTrainer.trainer_name}` : ''}`}
          value={trainerBio}
          onChange={setTrainerBio}
          placeholder="Select a saved trainer profile or enter manually..."
          rows={5}
          note="Trainer bios are reusable — saved content will be available for future horses."
        />
      </SectionCard>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <SectionCard title="Offering Details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <InputField
            label="Lease Duration (months)"
            value={leaseDuration}
            onChange={(v) => setLeaseDuration(Number(v))}
            type="number"
          />
          <InputField
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Wexford Stables, Matamata, New Zealand"
          />
        </div>
        <InputField
          label="Racing Record"
          value={racingRecord}
          onChange={setRacingRecord}
          placeholder="e.g. Early Career / Trialing or 3:1-0-1 ($12,450)"
        />
      </SectionCard>

      <SectionCard title="Meta Keys">
        <InputField
          label="Search Terms (auto-generated)"
          value={searchTerms}
          onChange={setSearchTerms}
          placeholder="Auto-generated from horse name, sire, trainer, location"
          note="Edit to add additional keywords. Separate with commas."
        />

        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.875rem',
            marginTop: '0.25rem',
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.625rem',
            }}
          >
            Derived Fields (read-only — generated from data above)
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <InfoPill
              label="Offering Title"
              value={
                selectedHorse
                  ? `${selectedHorse.horse_name} (${selectedHorse.country_code})`
                  : ''
              }
            />
            <InfoPill
              label="Trainer (meta)"
              value={autoTrainer?.contact_name ?? ''}
            />
            <InfoPill
              label="Horse Type"
              value={selectedHorse?.sex ?? ''}
            />
            <InfoPill
              label="Horse Colour"
              value={
                selectedHorse
                  ? `${selectedHorse.colour} ${selectedHorse.sex}`
                  : ''
              }
            />
            <InfoPill
              label="Horse DOB"
              value={selectedHorse?.foaling_date ?? ''}
            />
            <InfoPill label="Asset Type" value="Horse" />
            <InfoPill label="Promoted" value="Yes" />
            <InfoPill
              label="Property Location"
              value={location}
            />
          </div>
          <div style={{ marginTop: '0.875rem' }}>
            <FieldLabel>Detail Summary (derived)</FieldLabel>
            <div
              style={{
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                padding: '0.625rem 0.75rem',
                fontSize: '0.8125rem',
                color: '#94a3b8',
                lineHeight: 1.55,
                minHeight: '2.5rem',
              }}
            >
              {buildDetailSummary(selectedHorse, autoTrainer, location, leaseDuration) || (
                <span style={{ color: '#cbd5e1' }}>Will be generated from fields above</span>
              )}
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

      <ReviewBlock
        title="Horse Identity"
        rows={[
          { label: 'Horse', value: selectedHorse ? `${selectedHorse.horse_name} (${selectedHorse.country_code})` : '' },
          { label: 'Foaling Year', value: foalingYear },
          { label: 'Sex', value: selectedHorse?.sex ?? '' },
          { label: 'Colour', value: selectedHorse?.colour ?? '' },
          { label: 'Sire', value: selectedHorse?.sire ?? '' },
          { label: 'Dam', value: selectedHorse?.dam ?? '' },
          { label: 'Microchip', value: selectedHorse?.microchip_number ?? '' },
          { label: 'Breeding URL', value: selectedHorse?.breeding_url ?? '' },
        ]}
      />

      <ReviewBlock
        title="Counterparties"
        rows={[
          { label: 'Trainer', value: autoTrainer?.trainer_name ?? '' },
          { label: 'Stable', value: autoTrainer?.stable_name ?? '' },
          { label: 'Contact', value: autoTrainer?.contact_name ?? '' },
          { label: 'Location', value: location },
        ]}
      />

      <ReviewBlock
        title="Narrative Content"
        rows={[
          { label: 'Static Intro', value: STATIC_INTRO },
          { label: 'Horse Intro', value: horseIntro },
          { label: 'Headline', value: narrativeHeadline },
          { label: 'Narrative Body', value: narrativeBody },
          { label: 'Earnings Sentence', value: EARNINGS_SENTENCE },
          { label: 'Sire Description', value: sireDescription },
          { label: 'Dam Description', value: damDescription },
          { label: 'Trainer Bio', value: trainerBio },
        ]}
      />

      <ReviewBlock
        title="Offering Details & Meta"
        rows={[
          { label: 'Lease Duration', value: `${leaseDuration} months` },
          { label: 'Racing Record', value: racingRecord },
          { label: 'Search Terms', value: searchTerms },
          {
            label: 'Detail Summary',
            value: buildDetailSummary(selectedHorse, autoTrainer, location, leaseDuration),
          },
          { label: 'Asset Type', value: 'Horse' },
          { label: 'Promoted', value: 'Yes' },
        ]}
      />
    </div>
  );

  // ─── Full Wizard Modal ────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6"
        style={{ position: 'relative' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.125rem' }}>
              New DS Listing — Step {step} of 4: {STEP_NAMES[step - 1]}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {step === 1 && 'Select the horse and verify counterparties auto-filled from SSOT.'}
              {step === 2 && 'Write or paste narrative content for each section. Reusable profiles are pre-filled where available.'}
              {step === 3 && 'Confirm offering details and check the derived meta key values.'}
              {step === 4 && 'Review all data. Click Generate to produce the .docx file.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: '2rem',
              height: '2rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              fontWeight: 400,
              lineHeight: 1,
            }}
            aria-label="Close wizard"
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={step} />

        {/* Step Content */}
        <div>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            onClick={goBack}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {step === 4 ? (
              <>
                <button
                  onClick={() => alert('Draft saved — save functionality will be wired in a future update.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Generate & Download .docx
                </button>
              </>
            ) : (
              <button
                onClick={goNext}
                disabled={step === 1 && !selectedHorseId}
                className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                style={{
                  opacity: step === 1 && !selectedHorseId ? 0.4 : 1,
                  cursor: step === 1 && !selectedHorseId ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
