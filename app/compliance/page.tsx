'use client';
import { useState } from 'react';
import { complianceRecords, filingDeadlines, overallMetrics, ComplianceRecord } from '@/lib/mock-data/compliance';
import dynamic from 'next/dynamic';
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
} from '@carbon/react';
const LineChart = dynamic(() => import('@carbon/charts-react').then(m => ({ default: m.LineChart })), { ssr: false });
import '@carbon/charts-react/styles.css';
import { WarningAlt } from '@carbon/icons-react';

// ── Gauge component ──────────────────────────────────────────────────────────
function GaugeRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="ri-gauge-wrap" style={{ flex: '1 1 130px', minWidth: 120 }}>
      <div className="ri-score-ring" style={{ width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--cds-layer-02)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r}
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className="ri-score-value">{value}%</span>
      </div>
      <div className="ri-gauge-label">{label}</div>
    </div>
  );
}

// ── Status tag helper ─────────────────────────────────────────────────────────
type TagType = 'green' | 'red' | 'warm-gray' | 'blue';
function statusTag(val: string): TagType {
  if (val === 'Filed' || val === 'Active' || val === 'Compliant' || val === 'Submitted') return 'green';
  if (val === 'Overdue' || val === 'Expired' || val === 'Non-Compliant') return 'red';
  if (val === 'Pending' || val === 'Partial' || val === 'Pending Renewal') return 'warm-gray';
  return 'blue';
}

// ── 6-month trend chart per parastatal ───────────────────────────────────────
function TrendChart({ record }: { record: ComplianceRecord }) {
  const data = record.monthlyData.map(d => ({
    group: record.parastatal.split(' ')[0],
    key: d.month,
    value: d.score,
  }));
  const options = {
    title: '',
    height: '150px',
    axes: {
      bottom: { mapsTo: 'key', scaleType: 'labels' },
      left: { mapsTo: 'value', includeZero: false, min: 30, max: 100 },
    },
    curve: 'curveMonotoneX',
    points: { radius: 3 },
    toolbar: { enabled: false },
    legend: { enabled: false },
    theme: 'g100',
    color: { scale: { [record.parastatal.split(' ')[0]]: record.overallScore >= 70 ? '#42be65' : '#fa4d56' } },
  };
  return <LineChart data={data} options={options as any} />;
}

// ── Headers for main table ────────────────────────────────────────────────────
const headers = [
  { key: 'parastatal', header: 'Parastatal' },
  { key: 'overallScore', header: 'Score' },
  { key: 'vatFiling', header: 'VAT' },
  { key: 'citFiling', header: 'CIT' },
  { key: 'whtRemittance', header: 'WHT' },
  { key: 'cacStatus', header: 'CAC Status' },
];

const deadlineHeaders = [
  { key: 'parastatal', header: 'Parastatal' },
  { key: 'type', header: 'Filing Type' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'status', header: 'Status' },
  { key: 'penalty', header: 'Penalty' },
];

export default function CompliancePage() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filteredRecords = complianceRecords.filter(r =>
    r.parastatal.toLowerCase().includes(search.toLowerCase()) ||
    r.ministry.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredRecords.map(r => ({
    id: r.id,
    parastatal: r.parastatal,
    overallScore: r.overallScore,
    vatFiling: r.vatFiling,
    citFiling: r.citFiling,
    whtRemittance: r.whtRemittance,
    cacStatus: r.cacStatus,
    _full: r,
  }));

  const deadlineRows = filingDeadlines.map(d => ({
    id: d.id,
    parastatal: d.parastatal,
    type: d.type,
    dueDate: d.dueDate,
    status: d.status,
    penalty: d.penalty ?? '—',
  }));

  return (
    <div className="ri-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cds-text-primary)', marginBottom: 4 }}>
          Compliance Scorecard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>
          Tax, CAC, and WHT compliance across 8 parastatals
        </p>
      </div>

      {/* Gauge row */}
      <div
        className="ri-chart-panel ri-fade-up"
        style={{ marginBottom: '1.5rem' }}
      >
        <div className="ri-chart-header">
          <div>
            <div className="ri-chart-title">Overall Compliance Metrics</div>
            <div className="ri-chart-subtitle">Aggregate scores — Q3 2024</div>
          </div>
          <Tag type={overallMetrics.avgCompliance >= 80 ? 'green' : 'warm-gray'} size="sm">
            {overallMetrics.avgCompliance}% Avg
          </Tag>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-around', padding: '0.5rem 0' }}>
          <GaugeRing value={overallMetrics.avgCompliance} label="Overall" color="#42be65" />
          <GaugeRing value={overallMetrics.filedOnTime} label="Filed On Time" color="#4589ff" />
          <GaugeRing value={78} label="CAC Active %" color="#be95ff" />
          <GaugeRing value={82} label="WHT Compliant" color="#f0a500" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cds-border-subtle-01)' }}>
          {[
            { label: 'Overdue Filings', value: overallMetrics.overdueFilings, color: '#fa4d56' },
            { label: 'Expired Registrations', value: overallMetrics.expiredRegistrations, color: '#fa4d56' },
            { label: 'Pending Renewals', value: overallMetrics.pendingRenewals, color: '#f0a500' },
            { label: 'Penalties Accrued', value: overallMetrics.totalPenaltiesAccrued, color: '#f0a500' },
          ].map(m => (
            <div key={m.label} style={{ flex: '1 1 150px', background: 'var(--cds-layer-02)', borderRadius: 6, padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance scorecard DataTable */}
      <div className="ri-chart-panel ri-fade-up" style={{ marginBottom: '1.5rem', animationDelay: '0.1s', padding: 0, overflow: 'hidden' }}>
        <DataTable
          rows={rows}
          headers={headers}
          isSortable
        >
          {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps, getExpandedRowProps }) => (
            <TableContainer title="Parastatal Compliance Records" description="Click a row to expand and view 6-month trend">
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    id="ri-compliance-search"
                    placeholder="Search parastatal or ministry…"
                    onChange={(e: any, newSearchValue?: string) => setSearch(typeof newSearchValue === 'string' ? newSearchValue : e?.target?.value || e || '')}
                    value={search}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} aria-label="Compliance scorecard table">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader aria-label="Expand row" />
                    {tableHeaders.map(h => (
                      <TableHeader {...getHeaderProps({ header: h })} key={h.key}>
                        {h.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map(row => {
                    const record = filteredRecords.find(r => r.id === row.id)!;
                    const isExpanded = expandedRows.has(row.id);
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
                            <TableCell key={cell.id}>
                              {cell.info.header === 'overallScore' ? (
                                <span style={{ fontWeight: 800, color: cell.value >= 80 ? '#42be65' : cell.value >= 60 ? '#f0a500' : '#fa4d56' }}>
                                  {cell.value}%
                                </span>
                              ) : ['vatFiling', 'citFiling', 'whtRemittance', 'cacStatus'].includes(cell.info.header) ? (
                                <Tag type={statusTag(cell.value)} size="sm">{cell.value}</Tag>
                              ) : (
                                <span style={{ fontSize: 13 }}>{cell.value}</span>
                              )}
                            </TableCell>
                          ))}
                        </TableExpandRow>
                        {isExpanded && (
                          <TableExpandedRow
                            {...getExpandedRowProps({ row })}
                            key={`${row.id}-expanded`}
                            colSpan={tableHeaders.length + 1}
                          >
                            <div style={{ padding: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                              <div style={{ flex: '1 1 320px', minWidth: 280 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
                                  6-Month Compliance Trend — {record.parastatal.split('(')[0].trim()}
                                </div>
                                <TrendChart record={record} />
                              </div>
                              <div style={{ flex: '1 1 200px' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
                                  Details
                                </div>
                                {[
                                  { label: 'Ministry', val: record.ministry },
                                  { label: 'Tax Compliance', val: `${record.taxCompliance}%` },
                                  { label: 'Next Deadline', val: record.nextDeadline },
                                ].map(d => (
                                  <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--cds-border-subtle-01)', fontSize: 13 }}>
                                    <span style={{ color: 'var(--cds-text-secondary)' }}>{d.label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>{d.val}</span>
                                  </div>
                                ))}
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

      {/* Filing deadlines table */}
      <div className="ri-chart-panel ri-fade-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.2s' }}>
        <DataTable rows={deadlineRows} headers={deadlineHeaders}>
          {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="Filing Deadline Tracker" description="Upcoming and overdue regulatory submissions">
              <Table {...getTableProps()} aria-label="Filing deadlines table">
                <TableHead>
                  <TableRow>
                    {tableHeaders.map(h => (
                      <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map(row => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map(cell => (
                        <TableCell key={cell.id}>
                          {cell.info.header === 'status' ? (
                            <Tag type={statusTag(cell.value)} size="sm">
                              {cell.value === 'Overdue' && <WarningAlt size={10} aria-hidden="true" />}
                              {cell.value}
                            </Tag>
                          ) : (
                            <span style={{ fontSize: 13 }}>{cell.value}</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </div>
  );
}
