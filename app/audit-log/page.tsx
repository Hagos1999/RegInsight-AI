'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { auditLog } from '@/lib/mock-data/audit-log';
import { useApp } from '@/lib/app-context';
import { verifyBlock, formatHash } from '@/lib/blockchain-sim';
import { Shield, CheckCircle2, AlertTriangle, Download, Search, ChevronDown, ChevronUp, Lock } from 'lucide-react';

const actionColors: Record<string, string> = {
  GENESIS_BLOCK: 'badge-gray',
  CONTRACT_CREATED: 'badge-green',
  CONTRACT_STATUS_UPDATED: 'badge-blue',
  PAYMENT_APPROVED: 'badge-blue',
  DOCUMENT_UPLOADED: 'badge-gray',
  COMPLIANCE_CHECKED: 'badge-amber',
  AUDIT_REPORT_GENERATED: 'badge-green',
  ANOMALY_FLAGGED: 'badge-red',
  SHELL_COMPANY_FLAGGED: 'badge-red',
  OFFSHORE_TRANSFER_DETECTED: 'badge-red',
  USER_ROLE_CHANGED: 'badge-amber',
};

const roleColors: Record<string, string> = {
  System: 'badge-gray', Admin: 'role-admin', 'Agency User': 'role-agency', Auditor: 'role-auditor',
};

const HIGH_RISK_ACTIONS = ['ANOMALY_FLAGGED', 'SHELL_COMPANY_FLAGGED', 'OFFSHORE_TRANSFER_DETECTED'];

export default function AuditLogPage() {
  const { user } = useApp();
  const canExport = user.role === 'admin' || user.role === 'auditor';
  const canVerify = user.role === 'admin' || user.role === 'auditor';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, boolean | null>>({});
  const [verifying, setVerifying] = useState<string | null>(null);

  const filtered = auditLog.filter(e => {
    const q = search.toLowerCase();
    if (q && !e.action.toLowerCase().includes(q) && !e.user.toLowerCase().includes(q) && !e.details.toLowerCase().includes(q) && !e.entityId.toLowerCase().includes(q)) return false;
    if (filter && e.role !== filter) return false;
    return true;
  });

  const handleVerify = (id: string, hash: string, prevHash: string, details: string) => {
    setVerifying(id);
    setTimeout(() => {
      setVerified(v => ({ ...v, [id]: verifyBlock(hash, prevHash, details) }));
      setVerifying(null);
    }, 600);
  };

  const handleExport = () => {
    const csv = ['Block,Hash,Timestamp,User,Role,Action,Entity,Details'].concat(
      auditLog.map(e => `${e.blockNum},${e.hash},${e.timestamp},${e.user},${e.role},${e.action},${e.entityId},"${e.details.replace(/"/g, '""')}"`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reginsight-audit-log.csv'; a.click();
  };

  return (
    <div>
      <Header title="Blockchain Audit Log" subtitle="Immutable transaction ledger — tamper-evident chain" />
      <div className="page-content">
        {/* Info banner */}
        <div className="rounded-xl p-4 mb-5 flex items-start gap-3 animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #004d2c, #008751)', color: 'white' }}>
          <Lock size={20} className="mt-0.5 shrink-0 text-green-300" />
          <div>
            <div className="font-bold text-sm mb-0.5">Simulated Blockchain Audit Chain</div>
            <div className="text-green-200 text-xs">
              Each entry is cryptographically linked to the previous block. Use the Verify button to check block integrity.
              Chain contains {auditLog.length} immutable entries. Any tampering breaks the hash chain.
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-200 text-xs">Chain Intact</span>
          </div>
        </div>

        {/* Chain stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Blocks', value: auditLog.length, color: '#008751' },
            { label: 'Risk Events', value: auditLog.filter(e => HIGH_RISK_ACTIONS.includes(e.action)).length, color: '#dc2626' },
            { label: 'Unique Users', value: [...new Set(auditLog.map(e => e.user))].length, color: '#1d4ed8' },
            { label: 'Chain Status', value: '✓ Valid', color: '#008751' },
          ].map((s, i) => (
            <div key={i} className="card py-3 px-4">
              <div className="font-extrabold text-xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + export */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-lg px-3 py-2 flex-1 min-w-48">
            <Search size={14} className="text-[var(--text-secondary)]" />
            <input type="text" placeholder="Search by action, user, entity..." className="bg-transparent text-sm outline-none flex-1"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--green-primary)]"
            value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Agency User">Agency User</option>
            <option value="Auditor">Auditor</option>
            <option value="System">System</option>
          </select>
          {canExport && (
            <button className="btn btn-outline text-sm" onClick={handleExport}>
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        {/* Log table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Block #</th><th>Hash</th><th>Timestamp</th><th>User</th>
                  <th>Action</th><th>Entity</th><th>Integrity</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const isRisk = HIGH_RISK_ACTIONS.includes(e.action);
                  const isExpanded = expanded === e.id;
                  const vStatus = verified[e.id];
                  return (
                    <>
                      <tr key={e.id} className={isRisk ? 'bg-red-50' : undefined}>
                        <td>
                          <span className="font-mono text-xs font-bold text-[var(--text-secondary)]">#{e.blockNum}</span>
                        </td>
                        <td>
                          <span className="hash-block text-[10px]">{formatHash(e.hash)}</span>
                        </td>
                        <td className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          {new Date(e.timestamp).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td>
                          <div className="text-xs font-semibold">{e.user}</div>
                          <span className={`badge text-[9px] px-2 py-0.5 mt-0.5 ${roleColors[e.role] || 'badge-gray'}`}>{e.role}</span>
                        </td>
                        <td>
                          <span className={`badge text-[10px] ${actionColors[e.action] || 'badge-gray'}`}>
                            {isRisk && <AlertTriangle size={9} className="mr-0.5" />}
                            {e.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs font-mono">{e.entityId}</div>
                          <div className="text-[10px] text-[var(--text-secondary)]">{e.entityType}</div>
                        </td>
                        <td>
                          {canVerify ? (
                            <button
                              className={`btn text-[10px] px-2 py-1 ${vStatus === true ? 'btn-primary' : vStatus === false ? 'btn-danger' : 'btn-outline'}`}
                              onClick={() => handleVerify(e.id, e.hash, e.prevHash, e.details)}
                              disabled={verifying === e.id}
                            >
                              {verifying === e.id ? '...' : vStatus === true ? <><CheckCircle2 size={11} /> Valid</> : vStatus === false ? <><AlertTriangle size={11} /> FAIL</> : <><Shield size={11} /> Verify</>}
                            </button>
                          ) : <span className="text-[10px] text-[var(--text-secondary)]">—</span>}
                        </td>
                        <td>
                          <button className="btn btn-ghost p-1" onClick={() => setExpanded(isExpanded ? null : e.id)}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${e.id}-exp`} className="bg-[#f8faf9]">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">Details</div>
                                <div className="text-[var(--text-primary)]">{e.details}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">Block Hash Chain</div>
                                <div className="space-y-1">
                                  <div><span className="text-[10px] text-[var(--text-secondary)]">Current: </span><span className="hash-block text-[9px]">{e.hash}</span></div>
                                  <div><span className="text-[10px] text-[var(--text-secondary)]">Previous: </span><span className="hash-block text-[9px]">{formatHash(e.prevHash)}</span></div>
                                  <div><span className="text-[10px] text-[var(--text-secondary)]">IP: </span><span className="font-mono text-[10px]">{e.ipAddress}</span></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>Showing {filtered.length} of {auditLog.length} entries</span>
            <span className="flex items-center gap-1.5 text-[var(--green-primary)]">
              <Lock size={11} /> Tamper-evident ledger
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
