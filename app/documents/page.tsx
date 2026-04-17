'use client';
import { useState, useRef, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { processDocument, ProcessingResult, ExtractedEntity, sampleDocuments } from '@/lib/ai-processor';
import { useApp } from '@/lib/app-context';
import {
  Upload, FileText, Sparkles, AlertTriangle, CheckCircle2,
  Tag, Calendar, Building2, Hash, ShieldAlert, User, RefreshCw
} from 'lucide-react';

const entityConfig = {
  amount: { label: 'Currency Amount', className: 'entity-amount', icon: '₦' },
  date: { label: 'Date', className: 'entity-date', icon: '📅' },
  org: { label: 'Organization', className: 'entity-org', icon: '🏛' },
  taxid: { label: 'Tax ID / FIRS', className: 'entity-taxid', icon: '#' },
  cacid: { label: 'CAC Registration', className: 'entity-taxid', icon: '©' },
  risk: { label: 'Risk Indicator', className: 'entity-risk', icon: '⚠' },
  person: { label: 'Person', className: 'entity-org', icon: '👤' },
};

function HighlightedText({ text, entities }: { text: string; entities: ExtractedEntity[] }) {
  if (!entities.length) return <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>;

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  const sorted = [...entities].sort((a, b) => a.start - b.start);

  sorted.forEach((ent, i) => {
    if (ent.start > lastIdx) parts.push(<span key={`txt-${i}`}>{text.slice(lastIdx, ent.start)}</span>);
    if (ent.start >= lastIdx) {
      const cfg = entityConfig[ent.type] || entityConfig.org;
      parts.push(
        <span key={`ent-${i}`} className={cfg.className} title={`${cfg.label} (${Math.round(ent.confidence * 100)}% confidence)`}>
          {text.slice(ent.start, ent.end)}
        </span>
      );
      lastIdx = ent.end;
    }
  });

  if (lastIdx < text.length) parts.push(<span key="tail">{text.slice(lastIdx)}</span>);
  return <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-sans leading-relaxed">{parts}</pre>;
}

function EntityLegend() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(entityConfig).filter(([k]) => k !== 'cacid').map(([k, v]) => (
        <span key={k} className={`${v.className} badge text-[11px]`}>{v.label}</span>
      ))}
    </div>
  );
}

export default function DocumentsPage() {
  const { user } = useApp();
  const [dragover, setDragover] = useState(false);
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canUpload = user.role === 'admin' || user.role === 'agency';

  const runProcess = useCallback((content: string, name: string) => {
    setProcessing(true);
    setFilename(name);
    setText(content);
    setResult(null);
    setTimeout(() => {
      setResult(processDocument(content));
      setProcessing(false);
    }, 900);
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => runProcess(e.target?.result as string, file.name);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragover(false);
    if (!canUpload) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <Header title="AI Document Processor" subtitle="Upload regulatory documents for intelligent entity extraction" />
      <div className="page-content">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left: upload + sample */}
          <div className="xl:col-span-2 space-y-6">
            {!canUpload && (
              <div className="alert-strip alert-strip-amber">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="text-sm">Auditors have read-only access. Document upload is restricted.</span>
              </div>
            )}

            {/* Upload zone */}
            <div className="card">
              <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Upload size={15} className="text-[var(--green-primary)]" /> Upload Document
              </div>
              <div
                className={`upload-zone ${dragover ? 'dragover' : ''} ${!canUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={e => { e.preventDefault(); if (canUpload) setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleDrop}
                onClick={() => canUpload && fileRef.current?.click()}
              >
                <Upload size={32} className="mx-auto mb-3 text-[var(--text-secondary)]" />
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Supports .txt, .pdf, .docx — Regulatory documents, contracts, filings
                </p>
                <input ref={fileRef} type="file" accept=".txt,.pdf,.docx" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>

            {/* Sample documents */}
            <div className="card">
              <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText size={15} className="text-[var(--green-primary)]" /> Sample Documents
              </div>
              <div className="space-y-2">
                {sampleDocuments.map(doc => (
                  <button
                    key={doc.name}
                    className="w-full text-left p-3 rounded-lg border border-[var(--border)] hover:border-[var(--green-primary)] hover:bg-[var(--green-pale)] transition-all group"
                    onClick={() => runProcess(doc.content, doc.name)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--green-primary)]" />
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">{doc.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] capitalize">{doc.type} document</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            {result && (
              <div className="card">
                <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Tag size={15} className="text-[var(--green-primary)]" /> Entity Legend
                </div>
                <EntityLegend />
              </div>
            )}
          </div>

          {/* Right: processing result */}
          <div className="xl:col-span-3 space-y-6">
            {processing && (
              <div className="card flex flex-col items-center justify-center py-16 animate-fade-in">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--green-primary)] border-t-transparent animate-spin mb-4" />
                <div className="font-semibold">Analyzing document...</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">Running entity extraction & risk assessment</div>
              </div>
            )}

            {!processing && !result && (
              <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <Sparkles size={48} className="text-[var(--green-primary)] opacity-40 mb-4" />
                <div className="font-semibold text-[var(--text-secondary)]">Upload or select a sample document</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
                  The AI processor will extract entities like amounts, dates, tax IDs, organizations, and flag risk indicators.
                </div>
              </div>
            )}

            {!processing && result && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 animate-fade-in">
                  {[
                    { label: 'Doc Type', value: result.documentType, icon: FileText, color: '#008751' },
                    { label: 'Entities Found', value: result.entities.length.toString(), icon: Tag, color: '#1d4ed8' },
                    { label: 'Confidence', value: `${result.confidence}%`, icon: Sparkles, color: '#7c3aed' },
                    { label: 'Risk Score', value: `${result.riskScore}/100`, icon: ShieldAlert, color: result.riskScore > 60 ? '#dc2626' : result.riskScore > 30 ? '#f59e0b' : '#008751' },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="card py-3 px-4">
                        <Icon size={16} style={{ color: s.color }} className="mb-1" />
                        <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mt-0.5">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Risk flags */}
                {result.riskFlags.length > 0 && (
                  <div className="card animate-fade-in" style={{ borderLeft: '4px solid #dc2626' }}>
                    <div className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-700">
                      <ShieldAlert size={15} /> Risk Flags ({result.riskFlags.length})
                    </div>
                    <div className="space-y-1">
                      {result.riskFlags.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-red-800">
                          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extraction summary table */}
                <div className="card animate-fade-in">
                  <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--green-primary)]" /> Extraction Summary — {filename}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    {[
                      { label: 'Currency Amounts', icon: '₦', items: result.summary.amounts, cls: 'entity-amount' },
                      { label: 'Dates', icon: '📅', items: result.summary.dates, cls: 'entity-date' },
                      { label: 'Organizations', icon: '🏛', items: result.summary.organizations, cls: 'entity-org' },
                      { label: 'Tax IDs (FIRS/TIN)', icon: '#', items: result.summary.taxIds, cls: 'entity-taxid' },
                      { label: 'CAC Registrations', icon: '©', items: result.summary.cacIds, cls: 'entity-taxid' },
                      { label: 'Risk Keywords', icon: '⚠', items: result.summary.riskKeywords, cls: 'entity-risk' },
                    ].map(row => (
                      <div key={row.label} className="bg-[#f8faf9] rounded-lg p-3">
                        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">{row.label} ({row.items.length})</div>
                        {row.items.length === 0
                          ? <span className="text-[11px] text-[var(--text-secondary)]">None detected</span>
                          : <div className="flex flex-wrap gap-1">{row.items.slice(0, 5).map((it, i) => <span key={i} className={`${row.cls} badge text-[10px]`}>{it}</span>)}</div>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlighted document */}
                <div className="card animate-fade-in">
                  <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-[var(--green-primary)]" /> Document View — Highlighted Entities
                  </div>
                  <EntityLegend />
                  <div className="bg-[#f8faf9] rounded-xl p-4 max-h-96 overflow-y-auto border border-[var(--border)]">
                    <HighlightedText text={text} entities={result.entities} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
