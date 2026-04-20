'use client';
import { useState, useRef, useCallback } from 'react';
import { processDocument, ProcessingResult, ExtractedEntity, sampleDocuments } from '@/lib/ai-processor';
import { useApp } from '@/lib/app-context';
import {
  Tag,
  Button,
  InlineLoading,
  InlineNotification,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import {
  Upload,
  Document,
  MagicWand,
  WarningAlt,
  Policy,
  TagGroup,
  ArrowRight,
} from '@carbon/icons-react';

// ── Entity config ─────────────────────────────────────────────────────────────
const ENTITY_CLASSES: Record<string, string> = {
  amount: 'ri-entity-amount',
  date: 'ri-entity-date',
  org: 'ri-entity-org',
  taxid: 'ri-entity-taxid',
  cacid: 'ri-entity-cacid',
  risk: 'ri-entity-risk',
  person: 'ri-entity-person',
};

const ENTITY_LABELS: Record<string, string> = {
  amount: 'Currency Amount',
  date: 'Date',
  org: 'Organization',
  taxid: 'Tax ID / TIN',
  cacid: 'CAC Registration',
  risk: 'Risk Indicator',
  person: 'Person',
};

// ── Highlighted text renderer ─────────────────────────────────────────────────
function HighlightedText({ text, entities }: { text: string; entities: ExtractedEntity[] }) {
  if (!entities.length) {
    return (
      <pre style={{ fontSize: 13, color: 'var(--cds-text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>
        {text}
      </pre>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  const sorted = [...entities].sort((a, b) => a.start - b.start);

  sorted.forEach((ent, i) => {
    if (ent.start > lastIdx) parts.push(<span key={`t${i}`}>{text.slice(lastIdx, ent.start)}</span>);
    if (ent.start >= lastIdx) {
      parts.push(
        <span
          key={`e${i}`}
          className={ENTITY_CLASSES[ent.type] ?? 'ri-entity-org'}
          title={`${ENTITY_LABELS[ent.type] ?? ent.type} · ${Math.round(ent.confidence * 100)}% confidence`}
        >
          {text.slice(ent.start, ent.end)}
        </span>
      );
      lastIdx = ent.end;
    }
  });

  if (lastIdx < text.length) parts.push(<span key="tail">{text.slice(lastIdx)}</span>);

  return (
    <pre style={{ fontSize: 13, color: 'var(--cds-text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>
      {parts}
    </pre>
  );
}

// ── Entity legend ─────────────────────────────────────────────────────────────
function EntityLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
      {Object.entries(ENTITY_LABELS).map(([k, label]) => (
        <span key={k} className={ENTITY_CLASSES[k]} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const { permissions } = useApp();
  const canUpload = permissions.canUploadDocuments;

  const [dragover, setDragover] = useState(false);
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const runProcess = useCallback((content: string, name: string) => {
    setProcessing(true);
    setFilename(name);
    setText(content);
    setResult(null);
    // Simulate 🤖 AI API latency
    // TODO: Replace with: fetch('/api/process-doc', { method: 'POST', body: JSON.stringify({ text: content, fileName: name }) }).then(r => r.json())
    setTimeout(() => {
      setResult(processDocument(content));
      setProcessing(false);
    }, 1000);
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => runProcess(e.target?.result as string, file.name);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    if (!canUpload) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const riskColor = result
    ? result.riskScore > 60 ? '#fa4d56' : result.riskScore > 30 ? '#f0a500' : '#42be65'
    : '#42be65';

  return (
    <div className="ri-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cds-text-primary)', marginBottom: 4 }}>
          AI Document Processor
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>
          Upload regulatory documents for intelligent entity extraction and risk assessment
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(0, 3fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* ── Left column ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Auditor notice */}
          {!canUpload && (
            <InlineNotification
              kind="warning"
              title="Read-only access"
              subtitle="Document upload is restricted to Admin and Agency roles."
              hideCloseButton
              lowContrast
            />
          )}

          {/* Upload zone */}
          <div className="ri-chart-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem', fontWeight: 700, fontSize: 13 }}>
              <Upload size={16} style={{ color: 'var(--ri-green-primary)' }} aria-hidden="true" />
              Upload Document
            </div>
            <div
              className={`ri-upload-zone${dragover ? ' drag-over' : ''}${!canUpload ? '' : ''}`}
              style={{ opacity: canUpload ? 1 : 0.5, cursor: canUpload ? 'pointer' : 'not-allowed' }}
              onDragOver={e => { e.preventDefault(); if (canUpload) setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
              onClick={() => canUpload && fileRef.current?.click()}
              role="button"
              tabIndex={canUpload ? 0 : -1}
              aria-label="Drop regulatory document here or click to upload"
              onKeyDown={e => e.key === 'Enter' && canUpload && fileRef.current?.click()}
            >
              <Upload size={36} style={{ margin: '0 auto 0.75rem', display: 'block', color: 'var(--cds-text-secondary)' }} aria-hidden="true" />
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--cds-text-primary)', marginBottom: 4 }}>
                {dragover ? 'Drop to analyze' : 'Drop file here or click to browse'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>
                Supports .txt, .pdf, .docx · Contracts, filings, registrations
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.pdf,.docx"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                aria-label="Upload document file"
              />
            </div>
          </div>

          {/* Sample documents */}
          <div className="ri-chart-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem', fontWeight: 700, fontSize: 13 }}>
              <Document size={16} style={{ color: 'var(--ri-green-primary)' }} aria-hidden="true" />
              Sample Documents
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sampleDocuments.map(doc => (
                <button
                  key={doc.name}
                  onClick={() => runProcess(doc.content, doc.name)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--cds-layer-02)',
                    border: '1px solid var(--cds-border-subtle-01)',
                    borderRadius: 6,
                    padding: '0.625rem 0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    color: 'var(--cds-text-primary)',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = 'var(--ri-green-primary)';
                    e.currentTarget.style.background = 'var(--ri-green-pale)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'var(--cds-border-subtle-01)';
                    e.currentTarget.style.background = 'var(--cds-layer-02)';
                  }}
                  aria-label={`Analyze ${doc.name}`}
                >
                  <Document size={16} style={{ color: 'var(--cds-text-secondary)', flexShrink: 0 }} aria-hidden="true" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--cds-text-secondary)', textTransform: 'capitalize' }}>{doc.type} document</div>
                  </div>
                  <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--cds-text-secondary)' }} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {/* Entity legend */}
          {result && (
            <div className="ri-chart-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem', fontWeight: 700, fontSize: 13 }}>
                <TagGroup size={16} style={{ color: 'var(--ri-green-primary)' }} aria-hidden="true" />
                Entity Legend
              </div>
              <EntityLegend />
            </div>
          )}
        </div>

        {/* ── Right column ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Empty state */}
          {!processing && !result && (
            <div
              className="ri-chart-panel ri-fade-up"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', minHeight: 300 }}
            >
              <MagicWand size={52} style={{ color: 'var(--ri-green-primary)', opacity: 0.4, marginBottom: '1rem' }} aria-hidden="true" />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--cds-text-secondary)', marginBottom: 8 }}>
                Upload or select a sample document
              </p>
              <p style={{ fontSize: 13, color: 'var(--cds-text-secondary)', maxWidth: 320 }}>
                The AI processor will extract currency amounts, dates, tax IDs, organizations, and flag risk indicators.
              </p>
            </div>
          )}

          {/* Processing state */}
          {processing && (
            <div
              className="ri-chart-panel ri-fade-up"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center', minHeight: 300 }}
            >
              <InlineLoading description="Analyzing document — running entity extraction & risk assessment…" />
            </div>
          )}

          {/* Results */}
          {!processing && result && (
            <>
              {/* KPI summary strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Document Type', value: result.documentType, color: 'var(--ri-green-light)' },
                  { label: 'Entities Found', value: String(result.entities.length), color: '#4589ff' },
                  { label: 'Confidence', value: `${result.confidence}%`, color: '#be95ff' },
                  { label: 'Risk Score', value: `${result.riskScore}/100`, color: riskColor },
                ].map(s => (
                  <div key={s.label} className="ri-kpi-tile" style={{ padding: '0.875rem' }}>
                    <div className="ri-kpi-value" style={{ fontSize: 18, color: s.color }}>{s.value}</div>
                    <div className="ri-kpi-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Risk score bar */}
              <div className="ri-chart-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
                  <span>Risk Score</span>
                  <span style={{ color: riskColor }}>{result.riskScore}/100</span>
                </div>
                <div className="ri-progress-bar" style={{ height: 8 }}>
                  <div className="ri-progress-fill" style={{ width: `${result.riskScore}%`, background: riskColor }} />
                </div>
                {result.riskFlags.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {result.riskFlags.map((f, i) => (
                      <div key={i} className="ri-alert error" style={{ padding: '0.5rem 0.75rem' }}>
                        <WarningAlt size={13} aria-hidden="true" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs: Summary + Document view */}
              <div className="ri-chart-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <Tabs>
                  <TabList aria-label="Document analysis tabs">
                    <Tab id="ri-tab-summary">Extraction Summary</Tab>
                    <Tab id="ri-tab-doc">Document View</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel style={{ padding: '1rem' }}>
                      <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)', marginBottom: '0.875rem' }}>
                        Analyzing <strong style={{ color: 'var(--cds-text-primary)' }}>{filename}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem' }}>
                        {[
                          { label: 'Currency Amounts', items: result.summary.amounts, cls: 'ri-entity-amount' },
                          { label: 'Dates', items: result.summary.dates, cls: 'ri-entity-date' },
                          { label: 'Organizations', items: result.summary.organizations, cls: 'ri-entity-org' },
                          { label: 'Tax IDs (FIRS/TIN)', items: result.summary.taxIds, cls: 'ri-entity-taxid' },
                          { label: 'CAC Registrations', items: result.summary.cacIds, cls: 'ri-entity-cacid' },
                          { label: 'Risk Keywords', items: result.summary.riskKeywords, cls: 'ri-entity-risk' },
                        ].map(row => (
                          <div key={row.label} style={{ background: 'var(--cds-layer-02)', borderRadius: 6, padding: '0.625rem' }}>
                            <div style={{ fontSize: 10, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700, marginBottom: 6 }}>
                              {row.label} ({row.items.length})
                            </div>
                            {row.items.length === 0 ? (
                              <span style={{ fontSize: 11, color: 'var(--cds-text-secondary)' }}>None detected</span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {row.items.slice(0, 5).map((it, i) => (
                                  <span key={i} className={row.cls} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3 }}>{it}</span>
                                ))}
                                {row.items.length > 5 && (
                                  <span style={{ fontSize: 10, color: 'var(--cds-text-secondary)' }}>+{row.items.length - 5} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabPanel>

                    <TabPanel style={{ padding: '1rem' }}>
                      <EntityLegend />
                      <div
                        style={{
                          background: 'var(--cds-layer-02)',
                          border: '1px solid var(--cds-border-subtle-01)',
                          borderRadius: 8,
                          padding: '1rem',
                          maxHeight: 400,
                          overflowY: 'auto',
                        }}
                      >
                        <HighlightedText text={text} entities={result.entities} />
                      </div>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
