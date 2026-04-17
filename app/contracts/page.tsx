'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { contracts, Contract, ContractStatus, RiskLevel } from '@/lib/mock-data/contracts';
import { useApp } from '@/lib/app-context';
import {
  AlertTriangle, CheckCircle2, Clock, DollarSign, Filter,
  X, ChevronDown, Building2, ShieldAlert, ExternalLink
} from 'lucide-react';

const formatNGN = (n: number) => {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  return `₦${n.toLocaleString()}`;
};

const riskColors: Record<RiskLevel, string> = {
  Low: 'badge-green', Medium: 'badge-amber', High: 'badge-red', Critical: 'badge-red',
};

const statusConfig: Record<ContractStatus, { color: string; border: string; dot: string; icon: React.ElementType }> = {
  'Awarded': { color: '#1d4ed8', border: '#bfdbfe', dot: 'bg-blue-500', icon: Clock },
  'In Progress': { color: '#b45309', border: '#fde68a', dot: 'bg-amber-500', icon: Clock },
  'Completed': { color: '#008751', border: '#bbf7d0', dot: 'bg-green-500', icon: CheckCircle2 },
};

const MINISTRIES = [...new Set(contracts.map(c => c.ministry))];

function ContractCard({ c, onClick, canFlag }: { c: Contract; onClick: () => void; canFlag: boolean }) {
  const progress = Math.round((c.paymentsMade / c.totalPayments) * 100) || 0;
  return (
    <div className="kanban-card" onClick={onClick}>
      {c.flagged && canFlag && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-red-700 font-semibold">
          <AlertTriangle size={12} /> FLAGGED
        </div>
      )}
      <div className="text-xs font-bold text-[var(--text-primary)] leading-snug mb-1 line-clamp-2">{c.title}</div>
      <div className="text-[10px] text-[var(--text-secondary)] mb-2.5 flex items-center gap-1">
        <Building2 size={10} /> {c.ministry}
      </div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-extrabold text-[var(--green-dark)]">{formatNGN(c.value)}</span>
        <span className={`badge ${riskColors[c.riskLevel]} text-[10px]`}>
          {c.riskLevel === 'Critical' || c.riskLevel === 'High' ? <AlertTriangle size={9} className="mr-0.5" /> : null}
          {c.riskLevel}
        </span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-1">
          <span>Payments {c.paymentsMade}/{c.totalPayments}</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? '#008751' : '#f59e0b' }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
        <span>{c.contractor.slice(0, 20)}{c.contractor.length > 20 ? '…' : ''}</span>
        <span>Due {c.dueDate}</span>
      </div>
    </div>
  );
}

function ContractModal({ c, onClose, canFlag }: { c: Contract; onClose: () => void; canFlag: boolean }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-[var(--text-secondary)] mb-1">{c.id}</div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{c.title}</h2>
          </div>
          <button className="btn btn-ghost p-1.5" onClick={onClose}><X size={18} /></button>
        </div>
        {c.flagged && canFlag && (
          <div className="alert-strip alert-strip-red mb-4">
            <AlertTriangle size={16} className="shrink-0" />
            <div><strong>Flagged:</strong> {c.flagReason}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {[
            { label: 'Ministry', value: c.ministry },
            { label: 'Contractor', value: c.contractor },
            { label: 'Contract Value', value: formatNGN(c.value) },
            { label: 'Risk Level', value: c.riskLevel },
            { label: 'Status', value: c.status },
            { label: 'Awarded', value: c.awarded },
            { label: 'Due Date', value: c.dueDate },
            { label: 'Tax ID (FIRS)', value: c.taxId },
            { label: 'CAC Reg #', value: c.cacReg },
            { label: 'Payments Made', value: `${c.paymentsMade} of ${c.totalPayments}` },
          ].map(r => (
            <div key={r.label} className="bg-[#f8faf9] rounded-lg p-3">
              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">{r.label}</div>
              <div className="font-semibold text-[var(--text-primary)] text-sm">{r.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#f8faf9] rounded-lg p-3 mb-4">
          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Description</div>
          <p className="text-sm text-[var(--text-primary)]">{c.description}</p>
        </div>
        <div className="bg-[#f8faf9] rounded-lg p-3">
          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Audit Hash</div>
          <div className="hash-block text-[10px] break-all">{c.auditHash}</div>
        </div>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const { user } = useApp();
  const canFlag = user.role === 'admin' || user.role === 'auditor';
  const canMove = user.role === 'admin' || user.role === 'agency';

  const [data, setData] = useState(contracts);
  const [filters, setFilters] = useState({ ministry: '', risk: '', minValue: 0, maxValue: 400_000_000_000 });
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const filtered = data.filter(c => {
    if (filters.ministry && c.ministry !== filters.ministry) return false;
    if (filters.risk && c.riskLevel !== filters.risk) return false;
    if (c.value < filters.minValue || c.value > filters.maxValue) return false;
    return true;
  });

  const columns: ContractStatus[] = ['Awarded', 'In Progress', 'Completed'];

  const handleDragStart = (id: string) => { if (canMove) setDragging(id); };
  const handleDrop = (status: ContractStatus) => {
    if (!dragging || !canMove) return;
    setData(prev => prev.map(c => c.id === dragging ? { ...c, status } : c));
    setDragging(null);
  };

  return (
    <div>
      <Header title="Contract Tracker" subtitle="Procurement lifecycle — Kanban view" />
      <div className="page-content">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex gap-2 flex-wrap text-sm text-[var(--text-secondary)]">
            {columns.map(col => {
              const n = filtered.filter(c => c.status === col).length;
              const cfg = statusConfig[col];
              return (
                <span key={col} className="flex items-center gap-1.5 bg-white border border-[var(--border)] px-3 py-1.5 rounded-lg">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {col}: <strong className="text-[var(--text-primary)]">{n}</strong>
                </span>
              );
            })}
          </div>
          <button className="btn btn-outline text-sm" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={14} /> Filter {showFilter ? <ChevronDown size={14} className="rotate-180" /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="card mb-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold block mb-1">Ministry</label>
                <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--green-primary)]"
                  value={filters.ministry} onChange={e => setFilters({ ...filters, ministry: e.target.value })}>
                  <option value="">All Ministries</option>
                  {MINISTRIES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold block mb-1">Risk Level</label>
                <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--green-primary)]"
                  value={filters.risk} onChange={e => setFilters({ ...filters, risk: e.target.value })}>
                  <option value="">All Levels</option>
                  {['Low', 'Medium', 'High', 'Critical'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button className="btn btn-ghost text-sm" onClick={() => setFilters({ ministry: '', risk: '', minValue: 0, maxValue: 400_000_000_000 })}>
                  <X size={14} /> Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {!canMove && (
          <div className="alert-strip alert-strip-blue mb-4">
            <ShieldAlert size={15} className="shrink-0" />
            <span className="text-sm">Auditor mode — cards are read-only. Drag-and-drop is disabled.</span>
          </div>
        )}

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => {
            const cfg = statusConfig[col];
            const Icon = cfg.icon;
            const colContracts = filtered.filter(c => c.status === col);
            return (
              <div
                key={col}
                className="kanban-col"
                onDragOver={e => { e.preventDefault(); }}
                onDrop={() => handleDrop(col)}
              >
                <div className="kanban-col-header flex items-center gap-2" style={{ color: cfg.color, borderColor: cfg.border }}>
                  <Icon size={14} />
                  {col}
                  <span className="ml-auto bg-white border border-current rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {colContracts.length}
                  </span>
                </div>
                <div className="p-1 min-h-[400px]">
                  {colContracts.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-xs text-[var(--text-secondary)]">
                      No contracts
                    </div>
                  )}
                  {colContracts.map(c => (
                    <div
                      key={c.id}
                      draggable={canMove}
                      onDragStart={() => handleDragStart(c.id)}
                      onDragEnd={() => setDragging(null)}
                      className={dragging === c.id ? 'opacity-50' : ''}
                    >
                      <ContractCard c={c} onClick={() => setSelected(c)} canFlag={canFlag} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selected && <ContractModal c={selected} onClose={() => setSelected(null)} canFlag={canFlag} />}
      </div>
    </div>
  );
}
