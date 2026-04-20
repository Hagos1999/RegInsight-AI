'use client';
import { useState } from 'react';
import { contracts, Contract, ContractStatus, RiskLevel } from '@/lib/mock-data/contracts';
import { useApp } from '@/lib/app-context';
import {
  Tag,
  Button,
  Select,
  SelectItem,
  InlineNotification,
} from '@carbon/react';
import {
  WarningAlt,
  Filter,
  Close,
  Building,
} from '@carbon/icons-react';

const formatNGN = (n: number) => {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  return `₦${n.toLocaleString()}`;
};

const riskTagType: Record<RiskLevel, 'green' | 'warm-gray' | 'red'> = {
  Low: 'green', Medium: 'warm-gray', High: 'red', Critical: 'red',
};

const colConfig: Record<ContractStatus, { tagType: 'blue' | 'warm-gray' | 'green'; borderColor: string }> = {
  Awarded: { tagType: 'blue', borderColor: '#4589ff' },
  'In Progress': { tagType: 'warm-gray', borderColor: '#f0a500' },
  Completed: { tagType: 'green', borderColor: '#42be65' },
};

const MINISTRIES = [...new Set(contracts.map(c => c.ministry))];

function ContractCard({
  c, onClick, canFlag, canMove, dragging, onDragStart, onDragEnd,
}: {
  c: Contract; onClick: () => void; canFlag: boolean; canMove: boolean;
  dragging: boolean; onDragStart: () => void; onDragEnd: () => void;
}) {
  const progress = Math.round((c.paymentsMade / c.totalPayments) * 100) || 0;
  return (
    <div
      className={`ri-kanban-card${c.flagged ? ' flagged' : ''}${dragging ? ' dragging' : ''}`}
      draggable={canMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`View contract: ${c.title}`}
    >
      {c.flagged && canFlag && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--ri-red)' }}>
          <WarningAlt size={11} aria-hidden="true" /> FLAGGED
        </div>
      )}
      <div className="ri-contract-title">{c.title}</div>
      <div className="ri-contract-ministry" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Building size={10} aria-hidden="true" /> {c.ministry}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="ri-contract-value">{formatNGN(c.value)}</span>
        <Tag type={riskTagType[c.riskLevel]} size="sm">
          {(c.riskLevel === 'Critical' || c.riskLevel === 'High') && <WarningAlt size={9} aria-hidden="true" />}
          {c.riskLevel}
        </Tag>
      </div>

      {/* Payment progress */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--cds-text-secondary)', marginBottom: 4 }}>
          <span>Payments {c.paymentsMade}/{c.totalPayments}</span>
          <span>{progress}%</span>
        </div>
        <div className="ri-progress-bar">
          <div
            className="ri-progress-fill"
            style={{ width: `${progress}%`, background: progress === 100 ? '#42be65' : '#f0a500' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--cds-text-secondary)' }}>
        <span>{c.contractor.length > 22 ? c.contractor.slice(0, 22) + '…' : c.contractor}</span>
        <span>Due {c.dueDate}</span>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const { permissions } = useApp();
  const canFlag = permissions.canSeeAnomalyAlerts;
  const canMove = permissions.canMoveKanbanCards;

  const [data, setData] = useState(contracts);
  const [ministry, setMinistry] = useState('');
  const [risk, setRisk] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const filtered = data.filter(c => {
    if (ministry && c.ministry !== ministry) return false;
    if (risk && c.riskLevel !== risk) return false;
    return true;
  });

  const columns: ContractStatus[] = ['Awarded', 'In Progress', 'Completed'];

  const handleDrop = (status: ContractStatus) => {
    if (!dragging || !canMove) return;
    setData(prev => prev.map(c => c.id === dragging ? { ...c, status } : c));
    setDragging(null);
  };

  return (
    <div className="ri-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cds-text-primary)', marginBottom: 4 }}>
          Contract Tracker
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>
          Procurement lifecycle — Kanban boards with drag-and-drop
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {columns.map(col => {
            const n = filtered.filter(c => c.status === col).length;
            const cfg = colConfig[col];
            return (
              <Tag key={col} type={cfg.tagType} size="sm">
                {col}: {n}
              </Tag>
            );
          })}
          {(ministry || risk) && (
            <Tag type="cool-gray" size="sm">
              {filtered.length} of {data.length} shown
            </Tag>
          )}
        </div>
        <Button
          size="sm"
          kind={showFilter ? 'primary' : 'tertiary'}
          renderIcon={Filter}
          onClick={() => setShowFilter(!showFilter)}
          id="ri-contracts-filter-btn"
        >
          {showFilter ? 'Hide Filters' : 'Filter'}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div
          className="ri-chart-panel ri-fade-up"
          style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}
        >
          <Select
            id="ri-ministry-filter"
            labelText="Ministry"
            value={ministry}
            onChange={e => setMinistry(e.target.value)}
          >
            <SelectItem value="" text="All Ministries" />
            {MINISTRIES.map(m => <SelectItem key={m} value={m} text={m} />)}
          </Select>

          <Select
            id="ri-risk-filter"
            labelText="Risk Level"
            value={risk}
            onChange={e => setRisk(e.target.value)}
          >
            <SelectItem value="" text="All Levels" />
            {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map(r =>
              <SelectItem key={r} value={r} text={r} />
            )}
          </Select>

          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close}
            onClick={() => { setMinistry(''); setRisk(''); }}
            id="ri-clear-filters"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Auditor notice */}
      {!canMove && (
        <InlineNotification
          kind="info"
          title="Read-only mode"
          subtitle="Auditor role — drag-and-drop is disabled."
          hideCloseButton
          style={{ marginBottom: '1rem', maxWidth: '100%' }}
          lowContrast
        />
      )}

      {/* Kanban Board */}
      <div className="ri-kanban-board">
        {columns.map(col => {
          const cfg = colConfig[col];
          const colContracts = filtered.filter(c => c.status === col);
          return (
            <div
              key={col}
              className="ri-kanban-col"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col)}
              style={{ borderTop: `3px solid ${cfg.borderColor}` }}
            >
              <div className="ri-kanban-col-header" style={{ borderBottomColor: cfg.borderColor }}>
                <span style={{ color: cfg.borderColor }}>{col}</span>
                <Tag type={cfg.tagType} size="sm">{colContracts.length}</Tag>
              </div>
              <div className="ri-kanban-cards" style={{ minHeight: 300 }}>
                {colContracts.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, fontSize: 12, color: 'var(--cds-text-secondary)' }}>
                    No contracts
                  </div>
                )}
                {colContracts.map(c => (
                  <ContractCard
                    key={c.id}
                    c={c}
                    onClick={() => setSelected(c)}
                    canFlag={canFlag}
                    canMove={canMove}
                    dragging={dragging === c.id}
                    onDragStart={() => { if (canMove) setDragging(c.id); }}
                    onDragEnd={() => setDragging(null)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contract Detail Modal */}
      {selected && (
        <div className="ri-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ri-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--cds-text-secondary)', marginBottom: 4 }}>{selected.id}</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--cds-text-primary)', lineHeight: 1.3 }}>{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close modal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cds-icon-primary)', padding: 4, borderRadius: 4 }}
              >
                <Close size={20} />
              </button>
            </div>

            {selected.flagged && canFlag && (
              <div className="ri-alert error" style={{ marginBottom: '1rem' }}>
                <WarningAlt size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
                <div><strong>Flagged:</strong> {selected.flagReason}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
              {[
                { label: 'Ministry', value: selected.ministry },
                { label: 'Contractor', value: selected.contractor },
                { label: 'Contract Value', value: formatNGN(selected.value) },
                { label: 'Risk Level', value: selected.riskLevel },
                { label: 'Status', value: selected.status },
                { label: 'Awarded', value: selected.awarded },
                { label: 'Due Date', value: selected.dueDate },
                { label: 'Tax ID (FIRS)', value: selected.taxId },
                { label: 'CAC Reg #', value: selected.cacReg },
                { label: 'Payments Made', value: `${selected.paymentsMade} of ${selected.totalPayments}` },
              ].map(r => (
                <div key={r.label} style={{ background: 'var(--cds-layer-02)', borderRadius: 6, padding: '0.625rem 0.875rem' }}>
                  <div style={{ fontSize: 10, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cds-text-primary)' }}>{r.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--cds-layer-02)', borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: 10, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Description</div>
              <p style={{ fontSize: 13, color: 'var(--cds-text-primary)', lineHeight: 1.6 }}>{selected.description}</p>
            </div>

            <div style={{ background: 'var(--cds-layer-02)', borderRadius: 6, padding: '0.75rem' }}>
              <div style={{ fontSize: 10, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Audit Hash</div>
              <div className="ri-hash-code">{selected.auditHash}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
