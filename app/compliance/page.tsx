'use client';
import Header from '@/components/layout/Header';
import { complianceRecords, filingDeadlines, overallMetrics } from '@/lib/mock-data/compliance';
import { useApp } from '@/lib/app-context';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const daysBetween = (date: string) => {
  const d = new Date(date);
  const now = new Date('2024-10-01');
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const statusColor = (s: string) => {
  if (s === 'Submitted') return 'badge-green';
  if (s === 'Overdue') return 'badge-red';
  if (s === 'Due Soon') return 'badge-amber';
  return 'badge-gray';
};

const cacStatusColor = (s: string) => {
  if (s === 'Active') return 'badge-green';
  if (s === 'Expired') return 'badge-red';
  if (s === 'Pending Renewal') return 'badge-amber';
  return 'badge-gray';
};

const scoreColor = (s: number) => s >= 80 ? '#008751' : s >= 60 ? '#f59e0b' : '#dc2626';

function GaugeCard({ label, value, color, subtitle }: { label: string; value: number; color: string; subtitle: string }) {
  const data = [{ name: label, value, fill: color }];
  return (
    <div className="card text-center">
      <ResponsiveContainer width="100%" height={140}>
        <RadialBarChart innerRadius={45} outerRadius={70} data={data} startAngle={210} endAngle={-30}>
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f0f4f3' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="-mt-16 mb-4">
        <div className="font-extrabold text-2xl" style={{ color }}>{value}%</div>
        <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{label}</div>
        <div className="text-[10px] text-[var(--text-secondary)]">{subtitle}</div>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const { user } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const canSeeAll = user.role === 'admin' || user.role === 'auditor';
  const records = canSeeAll ? complianceRecords : complianceRecords.filter(r => user.agency && r.ministry.includes(user.agency.replace('Ministry of ', '')));

  return (
    <div>
      <Header title="Compliance Scorecard" subtitle="Real-time tax, CAC, and procurement compliance across parastatals" />
      <div className="page-content">
        {/* KPI gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <GaugeCard label="Overall Compliance" value={overallMetrics.avgCompliance} color={scoreColor(overallMetrics.avgCompliance)} subtitle="Aggregate score" />
          <GaugeCard label="Filed On Time" value={overallMetrics.filedOnTime} color={scoreColor(overallMetrics.filedOnTime)} subtitle="Returns submitted" />
          <GaugeCard label="Active CAC Status" value={87} color="#1d4ed8" subtitle="Registered entities" />
          <GaugeCard label="WHT Compliant" value={73} color="#7c3aed" subtitle="Remittance rate" />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Overdue Filings', value: overallMetrics.overdueFilings, color: '#dc2626', icon: AlertTriangle },
            { label: 'Expired Registrations', value: overallMetrics.expiredRegistrations, color: '#dc2626', icon: AlertTriangle },
            { label: 'Pending Renewals', value: overallMetrics.pendingRenewals, color: '#f59e0b', icon: Clock },
            { label: 'Penalties Accrued', value: overallMetrics.totalPenaltiesAccrued, color: '#dc2626', icon: TrendingDown },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card py-3 px-4 border-l-4" style={{ borderLeftColor: s.color }}>
                <Icon size={16} style={{ color: s.color }} className="mb-1" />
                <div className="font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Compliance trend chart */}
        <div className="card mb-6">
          <div className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--green-primary)]" />
            6-Month Compliance Trends (Top Parastatals)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f3" />
              <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 11, fill: '#4a6558' }} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#4a6558' }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {records.slice(0, 4).map((r, i) => {
                const colors = ['#008751', '#3b82f6', '#f59e0b', '#7c3aed'];
                return (
                  <Line
                    key={r.id}
                    data={r.monthlyData}
                    type="monotone"
                    dataKey="score"
                    stroke={colors[i]}
                    strokeWidth={2}
                    dot={false}
                    name={r.parastatal.split(' (')[0]}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Parastatal scorecard table */}
          <div className="card lg:col-span-2">
            <div className="font-semibold mb-3 flex items-center gap-2">
              Parastatal Compliance Scorecards
              {!canSeeAll && <span className="badge badge-amber text-[10px]">Filtered to your agency</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Parastatal</th><th>Score</th><th>VAT</th><th>CIT</th><th>WHT</th><th>CAC</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <>
                      <tr key={r.id} className="cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                        <td>
                          <div className="font-semibold text-xs text-[var(--text-primary)]">{r.parastatal}</div>
                          <div className="text-[10px] text-[var(--text-secondary)]">{r.ministry}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: scoreColor(r.overallScore) }}>{r.overallScore}%</span>
                            <div className="w-16 progress-bar">
                              <div className="progress-fill" style={{ width: `${r.overallScore}%`, background: scoreColor(r.overallScore) }} />
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge text-[10px] ${r.vatFiling === 'Filed' || r.vatFiling === 'Exempt' ? 'badge-green' : 'badge-red'}`}>{r.vatFiling}</span></td>
                        <td><span className={`badge text-[10px] ${r.citFiling === 'Filed' ? 'badge-green' : r.citFiling === 'Overdue' ? 'badge-red' : 'badge-amber'}`}>{r.citFiling}</span></td>
                        <td><span className={`badge text-[10px] ${r.whtRemittance === 'Compliant' ? 'badge-green' : r.whtRemittance === 'Non-Compliant' ? 'badge-red' : 'badge-amber'}`}>{r.whtRemittance}</span></td>
                        <td><span className={`badge text-[10px] ${cacStatusColor(r.cacStatus)}`}>{r.cacStatus}</span></td>
                        <td>{expanded === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                      </tr>
                      {expanded === r.id && (
                        <tr key={`${r.id}-exp`}>
                          <td colSpan={7} className="bg-[#f8faf9] p-4">
                            <div className="font-semibold text-xs mb-2">Monthly Score Trend</div>
                            <ResponsiveContainer width="100%" height={80}>
                              <LineChart data={r.monthlyData}>
                                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                                <YAxis domain={[20, 100]} tick={{ fontSize: 9 }} />
                                <Tooltip formatter={(v) => [`${v}%`, '']} />
                                <Line type="monotone" dataKey="score" stroke={scoreColor(r.overallScore)} strokeWidth={2} dot={{ r: 3 }} />
                              </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-2 text-xs text-[var(--text-secondary)]">
                              Next deadline: <strong>{r.nextDeadline}</strong> · Tax compliance: <strong>{r.taxCompliance}%</strong>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filing deadlines */}
          <div className="card">
            <div className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={15} className="text-[var(--green-primary)]" /> Filing Deadlines
            </div>
            <div className="space-y-2.5">
              {filingDeadlines.map(d => {
                const days = daysBetween(d.dueDate);
                return (
                  <div key={d.id} className={`p-3 rounded-lg border ${d.status === 'Overdue' ? 'border-red-200 bg-red-50' : d.status === 'Due Soon' ? 'border-amber-200 bg-amber-50' : 'border-[var(--border)] bg-[#f8faf9]'}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold">{d.parastatal}</span>
                      <span className={`badge text-[9px] ${statusColor(d.status)}`}>{d.status}</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{d.type}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[var(--text-secondary)]">{d.dueDate}</span>
                      <span className={`text-[10px] font-semibold ${days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-green-700'}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    </div>
                    {d.penalty && <div className="text-[9px] text-red-700 mt-1">Penalty: {d.penalty}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
