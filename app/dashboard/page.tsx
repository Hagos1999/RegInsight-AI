'use client';
import { useApp } from '@/lib/app-context';
import { contracts } from '@/lib/mock-data/contracts';
import { complianceRecords, overallMetrics } from '@/lib/mock-data/compliance';
import { anomalyAlerts } from '@/lib/mock-data/funding-flows';
import Link from 'next/link';
import {
  Tag,
  Button,
} from '@carbon/react';

import {
  CaretUp,
  CaretDown,
  WarningAlt,
  DataCheck,
  Money,
  Building,
  Policy,
  ArrowRight,
  CheckmarkFilled,
} from '@carbon/icons-react';

// Dynamic chart import — required because @carbon/charts-react uses browser-only APIs
import dynamic from 'next/dynamic';
const AreaChart = dynamic(() => import('@carbon/charts-react').then(m => ({ default: m.AreaChart })), {
  ssr: false,
  loading: () => <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cds-text-secondary)', fontSize: 13 }}>Loading chart…</div>,
});
import '@carbon/charts-react/styles.css';

const formatNGN = (n: number) => {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  return `₦${n.toLocaleString()}`;
};

const totalContractValue = contracts.reduce((s, c) => s + c.value, 0);
const flaggedContracts = contracts.filter(c => c.flagged).length;
const activeContracts = contracts.filter(c => c.status === 'In Progress').length;
const overdueCount = 3;

const chartData = [
  { group: 'Compliance', key: 'Apr', value: 71 },
  { group: 'Compliance', key: 'May', value: 73 },
  { group: 'Compliance', key: 'Jun', value: 74 },
  { group: 'Compliance', key: 'Jul', value: 75 },
  { group: 'Compliance', key: 'Aug', value: 76 },
  { group: 'Compliance', key: 'Sep', value: 76 },
];

const chartOptions = {
  title: '',
  height: '200px',
  axes: {
    bottom: { mapsTo: 'key', scaleType: 'labels' },
    left: { mapsTo: 'value', includeZero: false, min: 60, max: 100 },
  },
  color: { scale: { Compliance: '#42be65' } },
  curve: 'curveMonotoneX',
  points: { radius: 3 },
  toolbar: { enabled: false },
  legend: { enabled: false },
  theme: 'g100',
};

const agencyCards = [
  {
    id: 'firs',
    name: 'FIRS',
    full: 'Federal Inland Revenue Service',
    Icon: Money,
    color: '#42be65',
    lightBg: 'rgba(66,190,101,0.12)',
    stats: [
      { label: 'Active Filings', value: '1,247' },
      { label: 'Compliance Rate', value: '76%' },
      { label: 'Overdue Returns', value: '6', alert: true },
    ],
    link: '/compliance',
    tagType: 'green' as const,
  },
  {
    id: 'cac',
    name: 'CAC',
    full: 'Corporate Affairs Commission',
    Icon: Building,
    color: '#4589ff',
    lightBg: 'rgba(69,137,255,0.12)',
    stats: [
      { label: 'Registered Entities', value: '8,934' },
      { label: 'Active Status', value: '94%' },
      { label: 'Expired Certs', value: '1', alert: true },
    ],
    link: '/compliance',
    tagType: 'blue' as const,
  },
  {
    id: 'bpp',
    name: 'BPP',
    full: 'Bureau of Public Procurement',
    Icon: DataCheck,
    color: '#f0a500',
    lightBg: 'rgba(240,165,0,0.12)',
    stats: [
      { label: 'Active Contracts', value: `${activeContracts}` },
      { label: 'Total Value', value: formatNGN(totalContractValue) },
      { label: 'Flagged', value: `${flaggedContracts}`, alert: true },
    ],
    link: '/contracts',
    tagType: 'warm-gray' as const,
  },
];

const kpis = [
  {
    label: 'Total Contract Value',
    value: formatNGN(totalContractValue),
    change: '+12.4%',
    up: true,
    Icon: Money,
    iconBg: 'rgba(66,190,101,0.15)',
    iconColor: '#42be65',
  },
  {
    label: 'Avg Compliance Score',
    value: `${overallMetrics.avgCompliance}%`,
    change: `+${overallMetrics.complianceChange}%`,
    up: true,
    Icon: Policy,
    iconBg: 'rgba(69,137,255,0.15)',
    iconColor: '#4589ff',
  },
  {
    label: 'Agencies Monitored',
    value: '8',
    change: 'All active',
    neutral: true,
    Icon: Building,
    iconBg: 'rgba(190,149,255,0.15)',
    iconColor: '#be95ff',
  },
  {
    label: 'Pending Actions',
    value: `${overdueCount + flaggedContracts}`,
    change: 'Needs attention',
    up: false,
    Icon: WarningAlt,
    iconBg: 'rgba(250,77,86,0.15)',
    iconColor: '#fa4d56',
  },
];

export default function DashboardPage() {
  const { user, permissions } = useApp();

  return (
    <div className="ri-page">
      {/* Welcome Banner */}
      <div className="ri-welcome-banner" style={{ marginBottom: '1.75rem', animation: 'ri-fade-up 0.4s ease both' }}>
        <div className="ri-welcome-inner">
          <div>
            <p className="ri-welcome-greeting">Welcome back,</p>
            <h1 className="ri-welcome-name">{user.name}</h1>
            <p className="ri-welcome-role">
              {user.role === 'admin' && 'Full regulatory visibility across all agencies.'}
              {user.role === 'agency' && `Viewing ${user.agency || 'your agency'} data.`}
              {user.role === 'auditor' && 'Audit mode — read-only access to all records.'}
            </p>
          </div>
          <div className="ri-welcome-stats">
            <div className="ri-welcome-stat">
              <div className="stat-num">{activeContracts}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="ri-welcome-stat danger">
              <div className="stat-num">{permissions.canSeeAnomalyAlerts ? flaggedContracts : '—'}</div>
              <div className="stat-label">Flagged</div>
            </div>
            <div className="ri-welcome-stat warning">
              <div className="stat-num">{overdueCount}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {kpis.map((kpi, i) => {
          const Icon = kpi.Icon;
          return (
            <div
              key={i}
              className="ri-kpi-tile ri-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="ri-kpi-top">
                <div className="ri-kpi-icon" style={{ background: kpi.iconBg }}>
                  <Icon size={18} style={{ color: kpi.iconColor }} aria-hidden="true" />
                </div>
                <span className={`ri-kpi-trend ${kpi.neutral ? 'neutral' : kpi.up ? 'up' : 'down'}`}>
                  {!kpi.neutral && (kpi.up ? <CaretUp size={12} aria-hidden="true" /> : <CaretDown size={12} aria-hidden="true" />)}
                  {kpi.change}
                </span>
              </div>
              <div className="ri-kpi-value">{kpi.value}</div>
              <div className="ri-kpi-label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Agency Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {agencyCards.map((ag, i) => {
          const Icon = ag.Icon;
          return (
            <Link
              key={ag.id}
              href={ag.link}
              className="ri-agency-card ri-fade-up"
              style={{ borderTopColor: ag.color, animationDelay: `${0.2 + i * 0.08}s` }}
            >
              <div className="ri-agency-header">
                <div className="ri-agency-icon-wrap" style={{ background: ag.lightBg }}>
                  <Icon size={20} style={{ color: ag.color }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ri-agency-name" style={{ color: ag.color }}>{ag.name}</div>
                  <div className="ri-agency-full">{ag.full}</div>
                </div>
                <Tag type={ag.tagType} size="sm">Active</Tag>
              </div>

              {ag.stats.map((s, j) => (
                <div key={j} className="ri-agency-stat-row">
                  <span className="label">{s.label}</span>
                  <span className={`value${s.alert ? ' alert' : ''}`}>
                    {s.alert && <WarningAlt size={11} aria-hidden="true" style={{ marginRight: 3 }} />}
                    {s.value}
                  </span>
                </div>
              ))}

              <div className="ri-agency-link" style={{ color: ag.color }}>
                View details <ArrowRight size={13} aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Chart + Alert Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Compliance Trend Chart */}
        <div className="ri-chart-panel ri-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="ri-chart-header">
            <div>
              <div className="ri-chart-title">Compliance Trend</div>
              <div className="ri-chart-subtitle">6-month aggregate score across all parastatals</div>
            </div>
            <Tag type="green" size="sm">↑ Improving</Tag>
          </div>
          <AreaChart data={chartData} options={chartOptions as any} />
        </div>

        {/* Alert Feed */}
        <div className="ri-chart-panel ri-fade-up" style={{ animationDelay: '0.35s' }}>
          <div className="ri-chart-header">
            <div>
              <div className="ri-chart-title">Alert Feed</div>
              <div className="ri-chart-subtitle">Recent anomalies & compliance warnings</div>
            </div>
            {permissions.canSeeAnomalyAlerts && (
              <Tag type="red" size="sm">{anomalyAlerts.length} Active</Tag>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {!permissions.canSeeAnomalyAlerts ? (
              <div className="ri-alert info">
                <CheckmarkFilled size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Anomaly alerts are visible to Admin and Auditor roles only.</span>
              </div>
            ) : (
              anomalyAlerts.map(a => (
                <div
                  key={a.id}
                  className={`ri-alert ${a.severity === 'Critical' ? 'error' : 'warning'}`}
                >
                  <WarningAlt size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>
                      {a.type}
                      <Tag type={a.severity === 'Critical' ? 'red' : 'warm-gray'} size="sm" style={{ marginLeft: 6 }}>
                        {a.severity}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.parties} — {a.amount}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="ri-alert warning">
              <WarningAlt size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13 }}><strong>3 parastatals</strong> have overdue VAT/CIT filings</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              as={Link}
              href="/compliance"
              kind="ghost"
              size="sm"
              renderIcon={ArrowRight}
            >
              View Compliance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
