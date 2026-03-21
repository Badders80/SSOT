import React, { useState } from 'react';
import { FileText, Plus, Wand2, Wrench } from 'lucide-react';

type TemplateRouteProps = {
  onOpenDSListingWizard: () => void;
  onOpenHLTIssuanceWizard: () => void;
  onOpenSyndicateAgreementWizard: () => void;
  onOpenPDSWizard: () => void;
};

type PlaceholderTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
};

const PLACEHOLDER_TEMPLATES: PlaceholderTemplate[] = [
  {
    id: 'vara-whitepaper',
    name: 'VARA Whitepaper',
    category: 'Compliance',
    description: 'Virtual Asset Regulatory Authority compliant whitepaper covering tokenomics, governance structure, and compliance framework.',
  },
];

export default function TemplateRoute({ onOpenDSListingWizard, onOpenHLTIssuanceWizard, onOpenSyndicateAgreementWizard, onOpenPDSWizard }: TemplateRouteProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Document Templates
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Reusable document structures for generating consistent, data-driven offering documents. Active templates can be populated from SSOT horse and trainer data.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          style={{ whiteSpace: 'nowrap', gap: '0.375rem' }}
        >
          <Plus size={15} />
          Create New Template
        </button>
      </div>

      {/* Active Templates Section */}
      <div className="surface-card rounded-xl p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500" style={{ marginBottom: '0.75rem' }}>
          Active Templates
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* DS Listing Document */}
          <div
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 hover:border-blue-200 hover:bg-blue-50"
            style={{ cursor: 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                      DS Listing Document
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '0.25rem',
                        padding: '0.125rem 0.375rem',
                      }}
                    >
                      Listing
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    Tokinvest DS Data Fields document for new horse listings. Produces the complete offering page content including horse profile, pedigree analysis, trainer bio, and meta keys.
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    v1.0 &nbsp;·&nbsp; 8 sections &nbsp;·&nbsp; Wizard-built from 3 example documents
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={onOpenDSListingWizard}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Use Template
                </button>
                <button
                  onClick={() => alert('Template editor coming soon — this will open the full section/field editor.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* HLT Issuance Termsheet */}
          <div
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 hover:border-blue-200 hover:bg-blue-50"
            style={{ cursor: 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                      HLT Issuance Termsheet
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '0.25rem',
                        padding: '0.125rem 0.375rem',
                      }}
                    >
                      Listing
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    Structured term sheet for Horse Lease Token issuances. Covers token quantity, lease duration, and financial terms.
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    v1.0 &nbsp;·&nbsp; 7 sections &nbsp;·&nbsp; Wizard-built
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={onOpenHLTIssuanceWizard}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Use Template
                </button>
                <button
                  onClick={() => alert('Template editor coming soon — this will open the full section/field editor.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Syndicate Agreement */}
          <div
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 hover:border-blue-200 hover:bg-blue-50"
            style={{ cursor: 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                      Syndicate Agreement
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '0.25rem',
                        padding: '0.125rem 0.375rem',
                      }}
                    >
                      Legal
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    17-clause legal syndicate agreement for horse racing tokenisation. Covers object, shares, duration, revenue distribution, and winding-up provisions.
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    v1.0 &nbsp;·&nbsp; 4 sections &nbsp;·&nbsp; Wizard-built
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={onOpenSyndicateAgreementWizard}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Use Template
                </button>
                <button
                  onClick={() => alert('Template editor coming soon — this will open the full section/field editor.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Product Disclosure Statement (PDS) */}
          <div
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 hover:border-blue-200 hover:bg-blue-50"
            style={{ cursor: 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                      Product Disclosure Statement (PDS)
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '0.25rem',
                        padding: '0.125rem 0.375rem',
                      }}
                    >
                      Compliance
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    Regulatory disclosure document required for each offering. Includes risk factors, fee schedule, and jurisdiction-specific disclosures.
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    v1.0 &nbsp;·&nbsp; 8 sections &nbsp;·&nbsp; Wizard-built
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={onOpenPDSWizard}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Use Template
                </button>
                <button
                  onClick={() => alert('Template editor coming soon — this will open the full section/field editor.')}
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Templates Section */}
      <div className="surface-card rounded-xl p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500" style={{ marginBottom: '0.375rem' }}>
          Placeholder Templates
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
          These templates are planned for future implementation. Use "+ Create New Template" to build them.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {PLACEHOLDER_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              style={{ opacity: 0.7 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} color="#94a3b8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#475569' }}>{tpl.name}</span>
                    <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      Placeholder
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        padding: '0.125rem 0.375rem',
                      }}
                    >
                      {tpl.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{tpl.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Template Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Create New Template
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Choose how you'd like to build your new document template.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
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
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Wizard Option */}
              <button
                onClick={() =>
                  alert('Coming soon — this wizard will be wired in a future update.')
                }
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#bfdbfe';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc';
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Wand2 size={20} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem', marginBottom: '0.375rem' }}>
                    Wizard — Analyse completed documents
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                    Upload 2–5 example documents of the same type. The wizard will analyse the structure, identify repeating sections and fields, and auto-detect which content is static, reusable, or per-horse input.
                  </div>
                  <div
                    style={{
                      marginTop: '0.625rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563eb',
                    }}
                  >
                    <span>Recommended for existing document types</span>
                  </div>
                </div>
              </button>

              {/* Manual Option */}
              <button
                onClick={() =>
                  alert('Coming soon — this wizard will be wired in a future update.')
                }
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#bfdbfe';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc';
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Wrench size={20} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem', marginBottom: '0.375rem' }}>
                    Manual — Build from scratch
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                    Use the step-by-step section and field builder to define the template structure from the ground up. Specify each field's label, type, and classification (Static, Reusable, Input, or Derived).
                  </div>
                  <div
                    style={{
                      marginTop: '0.625rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#16a34a',
                    }}
                  >
                    <span>Best for new document types with no examples</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
