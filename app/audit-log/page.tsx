'use client';
import { useState, useCallback } from 'react';
import { auditLog, AuditEntry } from '@/lib/mock-data/audit-log';
import { useApp } from '@/lib/app-context';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarContent,
  Tag,
  Button,
  Select,
  SelectItem,
  InlineLoading,
  InlineNotification,
} from '@carbon/react';
import { Download, Security, WarningAlt } from '@carbon/icons-react';

// ── Hash verify simulation ───────────────────────────────────────────────────
const VERIFIED_STATE: Record<string, 'idle' | 'verifying' | 'ok' | 'fail'> = {};

// ── Tag helpers ───────────────────────────────────────────────────────────────
type TagType = 'green' | 'blue' | 'teal' | 'warm-gray' | 'red';
function roleTag(role: string): TagType {
  if (role === 'Admin') return 'green';
  if (role === 'Auditor') return 'teal';
  if (role === 'System') return 'blue';
  return 'warm-gray';
}

function actionTag(action: string): TagType {
  if (action.includes('FLAGGED') || action.includes('ANOMALY') || action.includes('OFFSHORE')) return 'red';
  if (action.includes('APPROVED') || action.includes('COMPLETED')) return 'green';
  if (action.includes('AUDIT') || action.includes('CHECKED')) return 'teal';
  return 'warm-gray';
}

const headers = [
  { key: 'blockNum', header: 'Block #' },
  { key: 'timestamp', header: 'Timestamp' },
  { key: 'user', header: 'User' },
  { key: 'role', header: 'Role' },
  { key: 'action', header: 'Action' },
  { key: 'entityType', header: 'Entity' },
  { key: 'verify', header: 'Verify' },
];

const ROLES = [...new Set(auditLog.map(e => e.role))];
const ACTIONS = [...new Set(auditLog.map(e => e.action.split('_').slice(0, 2).join('_')))];

export default function AuditLogPage() {
  const { permissions } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifyState, setVerifyState] = useState<Record<string, 'idle' | 'verifying' | 'ok' | 'fail'>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filtered = auditLog.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.user.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.details.toLowerCase().includes(q);
    const matchRole = !roleFilter || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const rows = filtered.map(e => ({
    id: e.id,
    blockNum: e.blockNum,
    timestamp: new Date(e.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
    user: e.user,
    role: e.role,
    action: e.action,
    entityType: `${e.entityType} / ${e.entityId}`,
    verify: e.id,
    _full: e,
  }));

  const handleVerify = useCallback((id: string) => {
    if (!permissions.canVerifyAuditBlocks) return;
    setVerifyState(prev => ({ ...prev, [id]: 'verifying' }));
    setTimeout(() => {
      // Deterministic: last block is always 'ok', others random
      const entry = auditLog.find(e => e.id === id)!;
      const result = entry.blockNum < 14 ? 'ok' : 'ok';
      setVerifyState(prev => ({ ...prev, [id]: result }));
    }, 900);
  }, [permissions.canVerifyAuditBlocks]);

  const handleExport = () => {
    const headers = ['Block #', 'Hash', 'Prev Hash', 'Timestamp', 'User', 'Role', 'Action', 'Entity', 'Entity ID', 'IP', 'Details'];
    const csvRows = auditLog.map(e =>
      [e.blockNum, e.hash, e.prevHash, e.timestamp, e.user, e.role, e.action, e.entityType, e.entityId, e.ipAddress, `"${e.details}"`].join(',')
    );
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reginsight-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ri-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cds-text-primary)', marginBottom: 4 }}>
            Blockchain Audit Log
          </h1>
          <p style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>
            Tamper-evident chain of {auditLog.length} audit blocks — SHA-256 simulated integrity
          </p>
        </div>
        {permissions.canExportAuditLog && (
          <Button
            kind="tertiary"
            size="sm"
            renderIcon={Download}
            onClick={handleExport}
            id="ri-export-audit"
          >
            Export CSV
          </Button>
        )}
      </div>

      {!permissions.canVerifyAuditBlocks && (
        <InlineNotification
          kind="info"
          title="Read-only access"
          subtitle="Block verification is available to Admin and Auditor roles."
          hideCloseButton
          lowContrast
          style={{ marginBottom: '1rem', maxWidth: '100%' }}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <Select
            id="ri-audit-role-filter"
            labelText="Filter by Role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            size="sm"
          >
            <SelectItem value="" text="All Roles" />
            {ROLES.map(r => <SelectItem key={r} value={r} text={r} />)}
          </Select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--cds-text-secondary)', marginBottom: 4 }}>Search</label>
          <input
            id="ri-audit-search"
            type="text"
            placeholder="Search user, action, details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--cds-layer-02)',
              border: '1px solid var(--cds-border-strong-01)',
              borderRadius: 4,
              padding: '0.4rem 0.75rem',
              color: 'var(--cds-text-primary)',
              fontSize: 13,
              height: 32,
            }}
          />
        </div>
        <Tag type="cool-gray" size="sm">{filtered.length} entries</Tag>
      </div>

      {/* DataTable */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable rows={rows} headers={headers}>
          {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps, getExpandedRowProps }) => (
            <TableContainer aria-label="Blockchain audit log">
              <Table {...getTableProps()} size="sm">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader aria-label="Expand row" />
                    {tableHeaders.map(h => (
                      // @ts-expect-error Carbon types
                      <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map(row => {
                    const entry = filtered.find(e => e.id === row.id)!;
                    const isExpanded = expandedRows.has(row.id);
                    const vState = verifyState[row.id] ?? 'idle';
                    return (
                      <>
                        <TableExpandRow
                          {...getRowProps({ row })}
                          key={row.id}
                          isExpanded={isExpanded}
                          onExpand={() => {
                            setExpandedRows(prev => {
                              const next = new Set(prev);
                              isExpanded ? next.delete(row.id) : next.add(row.id);
                              return next;
                            });
                          }}
                        >
                          {row.cells.map(cell => (
                            <TableCell key={cell.id} style={{ fontSize: 12 }}>
                              {cell.info.header === 'blockNum' ? (
                                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: 'var(--ri-green-light)' }}>#{cell.value}</span>
                              ) : cell.info.header === 'role' ? (
                                <Tag type={roleTag(cell.value)} size="sm">{cell.value}</Tag>
                              ) : cell.info.header === 'action' ? (
                                <Tag type={actionTag(cell.value)} size="sm" style={{ maxWidth: 180, overflow: 'hidden' }}>{cell.value}</Tag>
                              ) : cell.info.header === 'verify' ? (
                                <div>
                                  {vState === 'idle' && (
                                    <Button
                                      kind="ghost"
                                      size="sm"
                                      renderIcon={Security}
                                      onClick={() => handleVerify(cell.value)}
                                      disabled={!permissions.canVerifyAuditBlocks}
                                    >
                                      Verify
                                    </Button>
                                  )}
                                  {vState === 'verifying' && <InlineLoading description="Verifying…" />}
                                  {vState === 'ok' && <Tag type="green" size="sm">✓ Verified</Tag>}
                                  {vState === 'fail' && <Tag type="red" size="sm"><WarningAlt size={10} /> Tampered</Tag>}
                                </div>
                              ) : (
                                <span>{cell.value}</span>
                              )}
                            </TableCell>
                          ))}
                        </TableExpandRow>
                        {isExpanded && (
                          <TableExpandedRow
                            {...getExpandedRowProps({ row })}
                            key={`${row.id}-exp`}
                            colSpan={tableHeaders.length + 1}
                          >
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <div>
                                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--cds-text-secondary)', marginBottom: 4, fontWeight: 700 }}>
                                  Action Details
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--cds-text-primary)' }}>{entry.details}</p>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                  <div style={{ fontSize: 10, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>Block Hash</div>
                                  <div className="ri-hash-code">{entry.hash}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: 10, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>Previous Hash</div>
                                  <div className="ri-hash-code">{entry.prevHash}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '2rem', fontSize: 12, color: 'var(--cds-text-secondary)' }}>
                                <span>IP: <strong style={{ color: 'var(--cds-text-primary)' }}>{entry.ipAddress}</strong></span>
                                <span>Full time: <strong style={{ color: 'var(--cds-text-primary)' }}>{entry.timestamp}</strong></span>
                              </div>
                            </div>
                          </TableExpandedRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </div>
  );
}
