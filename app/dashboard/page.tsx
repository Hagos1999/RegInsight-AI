'use client';
import Header from '@/components/layout/Header';
import { contracts } from '@/lib/mock-data/contracts';
import { complianceRecords, overallMetrics } from '@/lib/mock-data/compliance';
import { anomalyAlerts } from '@/lib/mock-data/funding-flows';
import { useApp } from '@/lib/app-context';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  FileText, Building2, Landmark, ScrollText, ArrowRight,
  Clock, ShieldAlert, DollarSign, Activity
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const formatNGN = (n: number) => {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  return `₦${n.toLocaleString()}`;
};

const totalContractValue = contracts.reduce((s, c) => s + c.value, 0);
const flaggedContracts = contracts.filter(c => c.flagged).length;
const overdueCount = 3;

const chartData = [
  { month: 'Apr', compliance: 71 }, { month: 'May', compliance: 73 },
  { month: 'Jun', compliance: 74 }, { month: 'Jul', compliance: 75 },
  { month: 'Aug', compliance: 76 }, { month: 'Sep', compliance: 76 },
];

const agencyCards = [
  {
    id: 'firs', name: 'FIRS', full: 'Federal Inland Revenue Service',
    icon: Landmark, color: '#008751', lightColor: '#e6f7ef',
    stats: [
      { label: 'Active Filings', value: '1,247' },
      { label: 'Compliance Rate', value: '76%' },
      { label: 'Overdue Returns', value: '6', alert: true },
    ],
    status: 'Active',
    link: '/compliance',
  },
  {
    id: 'cac', name: 'CAC', full: 'Corporate Affairs Commission',
    icon: Building2, color: '#1d4ed8', lightColor: '#eff6ff',
    stats: [
      { label: 'Registered Entities', value: '8,934' },
      { label: 'Active Status', value: '94%' },
      { label: 'Expired Certs', value: '1', alert: true },
    ],
    status: 'Active',
    link: '/compliance',
  },
  {
    id: 'bpp', name: 'BPP', full: 'Bureau of Public Procurement',
    icon: ScrollText, color: '#b45309', lightColor: '#fffbeb',
    stats: [
      { label: 'Active Contracts', value: `${contracts.filter(c => c.status !== 'Completed').length}` },
      { label: 'Total Value', value: formatNGN(totalContractValue) },
      { label: 'Flagged', value: `${flaggedContracts}`, alert: true },
    ],
    status: 'Active',
    link: '/contracts',
  },
];

export default function DashboardPage() {
  const { user } = useApp();

  const canSeeAnomalies = user.role === 'admin' || user.role === 'auditor';

  return (
    <div>
      <Header
        title="Regulatory Dashboard"
        subtitle={`Federal Republic of Nigeria — RegInsight AI Platform`}
      />
      <div className="page-content">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #005f38 0%, #008751 60%, #00a863 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -mr-20 -mt-20"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-green-200 text-sm font-medium mb-1">Welcome back,</p>
                <h2 className="text-white text-2xl font-bold">{user.name}</h2>
                <p className="text-green-200 text-sm mt-1">
                  {user.role === 'admin' && 'You have full regulatory visibility across all agencies.'}
                  {user.role === 'agency' && `Viewing ${user.agency || 'your agency'} data.`}
                  {user.role === 'auditor' && 'Audit mode — read-only access to all records.'}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                  <div className="text-white text-xl font-bold">{contracts.filter(c => c.status === 'In Progress').length}</div>
                  <div className="text-green-200 text-[10px] uppercase tracking-wider">Active</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                  <div className="text-red-300 text-xl font-bold">{canSeeAnomalies ? flaggedContracts : '—'}</div>
                  <div className="text-green-200 text-[10px] uppercase tracking-wider">Flagged</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                  <div className="text-yellow-300 text-xl font-bold">{overdueCount}</div>
                  <div className="text-green-200 text-[10px] uppercase tracking-wider">Overdue</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Contract Value', value: formatNGN(totalContractValue), change: '+12.4%', up: true, icon: DollarSign, color: '#008751' },
            { label: 'Avg Compliance Score', value: `${overallMetrics.avgCompliance}%`, change: `+${overallMetrics.complianceChange}%`, up: true, icon: Activity, color: '#1d4ed8' },
            { label: 'Agencies Monitored', value: '8', change: 'All active', up: true, icon: Building2, color: '#7c3aed' },
            { label: 'Pending Actions', value: `${overdueCount + flaggedContracts}`, change: 'Needs attention', up: false, icon: ShieldAlert, color: '#dc2626' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.color}18` }}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                  <span className={stat.up ? 'stat-change-up flex items-center gap-1' : 'stat-change-down flex items-center gap-1'}>
                    {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stat.change}
                  </span>
                </div>
                <div className="stat-value text-xl">{stat.value}</div>
                <div className="stat-label mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Agency cards + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {agencyCards.map((ag, i) => {
            const Icon = ag.icon;
            const canSee = user.role === 'admin' || user.role === 'auditor' || (user.role === 'agency');
            if (!canSee) return null;
            return (
              <Link key={ag.id} href={ag.link} className="card no-underline animate-slide-in block"
                style={{ animationDelay: `${i * 0.08}s`, borderTop: `3px solid ${ag.color}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: ag.lightColor }}>
                    <Icon size={20} style={{ color: ag.color }} />
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: ag.color }}>{ag.name}</div>
                    <div className="text-xs text-[var(--text-secondary)] leading-tight">{ag.full}</div>
                  </div>
                  <span className="ml-auto badge badge-green text-[10px]">{ag.status}</span>
                </div>
                <div className="space-y-2.5">
                  {ag.stats.map((s, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
                      <span className={`text-sm font-bold ${s.alert ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
                        {s.alert && <AlertTriangle size={11} className="inline mr-1" />}
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: ag.color }}>
                  View details <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Compliance trend + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Compliance chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title text-base">Compliance Trend</div>
                <div className="section-subtitle text-xs">6-month aggregate score</div>
              </div>
              <span className="badge badge-green">↑ Improving</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008751" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#008751" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a6558' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #d4e6dc', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Compliance']}
                />
                <Area type="monotone" dataKey="compliance" stroke="#008751" strokeWidth={2.5} fill="url(#compGrad)" dot={{ fill: '#008751', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alert feed */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title text-base">Alert Feed</div>
                <div className="section-subtitle text-xs">Recent anomalies & compliance warnings</div>
              </div>
              {canSeeAnomalies && <span className="badge badge-red">{anomalyAlerts.length} Active</span>}
            </div>
            <div className="space-y-2.5">
              {!canSeeAnomalies ? (
                <div className="alert-strip alert-strip-blue">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span>Anomaly alerts are visible to Admin and Auditor roles only.</span>
                </div>
              ) : (
                anomalyAlerts.map(a => (
                  <div key={a.id} className={`alert-strip ${a.severity === 'Critical' ? 'alert-strip-red' : a.severity === 'High' ? 'alert-strip-amber' : 'alert-strip-amber'}`}>
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs">{a.type} · {a.severity}</div>
                      <div className="text-xs opacity-80 truncate">{a.parties} — {a.amount}</div>
                    </div>
                  </div>
                ))
              )}
              <div className="alert-strip alert-strip-amber">
                <Clock size={15} className="mt-0.5 shrink-0" />
                <span className="text-xs"><strong>3 parastatals</strong> have overdue VAT/CIT filings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
