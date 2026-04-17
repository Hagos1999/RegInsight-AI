'use client';
import { useCallback, useState } from 'react';
import Header from '@/components/layout/Header';
import ReactFlow, {
  Background, Controls, MiniMap, Node, Edge,
  NodeTypes, Handle, Position, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fundingNodes, fundingEdges, anomalyAlerts, FlowNode } from '@/lib/mock-data/funding-flows';
import { useApp } from '@/lib/app-context';
import { AlertTriangle, Eye, EyeOff, ShieldAlert, Building2, User, Package, Landmark } from 'lucide-react';

const formatNGN = (n: number) => {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  return `₦${n.toLocaleString()}`;
};

const typeColors: Record<FlowNode['type'], { bg: string; border: string; text: string }> = {
  agency: { bg: '#e6f7ef', border: '#008751', text: '#005f38' },
  contractor: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  subvendor: { bg: '#faf5ff', border: '#7c3aed', text: '#5b21b6' },
  bank: { bg: '#fff7ed', border: '#f59e0b', text: '#92400e' },
};

const typeIcons: Record<FlowNode['type'], React.ElementType> = {
  agency: Landmark, contractor: Building2, subvendor: Package, bank: Landmark,
};

function CustomNode({ data }: { data: FlowNode & { showAnomaly: boolean } }) {
  const colors = data.flagged ? { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' } : typeColors[data.type];
  const Icon = typeIcons[data.type];
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: colors.border }} />
      <div
        className="rounded-xl text-center transition-shadow hover:shadow-lg cursor-pointer"
        style={{
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          padding: '10px 16px',
          minWidth: 120,
          maxWidth: 150,
          boxShadow: data.flagged ? '0 0 0 3px rgba(220,38,38,0.25)' : undefined,
        }}
      >
        {data.flagged && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={10} className="text-white" />
          </div>
        )}
        <div className="flex items-center justify-center mb-1">
          <Icon size={14} style={{ color: colors.border }} />
        </div>
        <div className="font-bold text-[11px] leading-tight whitespace-pre-line" style={{ color: colors.text }}>
          {data.label}
        </div>
        <div className="text-[9px] mt-1 opacity-70 capitalize" style={{ color: colors.text }}>{data.type}</div>
        <div className="text-[9px] font-semibold mt-0.5" style={{ color: colors.border }}>
          {formatNGN(data.totalReceived)}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: colors.border }} />
    </>
  );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

export default function FundingPage() {
  const { user } = useApp();
  const canSeeAnomalies = user.role === 'admin' || user.role === 'auditor';
  const [anomalyOnly, setAnomalyOnly] = useState(false);

  const rfNodes: Node[] = fundingNodes.map(n => ({
    id: n.id,
    type: 'custom',
    position: { x: n.x * 4.5, y: n.y * 2.5 },
    data: { ...n, showAnomaly: canSeeAnomalies },
    draggable: true,
  }));

  const rfEdges: Edge[] = fundingEdges
    .filter(e => anomalyOnly ? e.anomaly : true)
    .map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.anomaly,
      label: formatNGN(e.amount),
      labelStyle: { fontSize: 10, fill: e.anomaly ? '#dc2626' : '#4a6558', fontWeight: e.anomaly ? 700 : 400 },
      labelBgStyle: { fill: e.anomaly ? '#fef2f2' : '#f8faf9', fillOpacity: 0.9 },
      style: { stroke: e.anomaly ? '#dc2626' : '#b0ccc0', strokeWidth: e.anomaly ? 2.5 : 1.5, strokeDasharray: e.anomaly ? '6 3' : undefined },
      markerEnd: { type: MarkerType.ArrowClosed, color: e.anomaly ? '#dc2626' : '#b0ccc0' },
    }));

  return (
    <div>
      <Header title="Funding Flow Visualizer" subtitle="Interactive money movement network with anomaly detection" />
      <div className="page-content">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Legend */}
            {[
              { label: 'Gov Agency', color: '#008751' },
              { label: 'Contractor', color: '#3b82f6' },
              { label: 'Sub-vendor', color: '#7c3aed' },
              { label: '⚠ Flagged', color: '#dc2626' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span className="w-3 h-3 rounded-full border-2 inline-block" style={{ borderColor: l.color, background: l.color + '22' }} />
                {l.label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {canSeeAnomalies && (
              <button
                className={`btn text-xs ${anomalyOnly ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => setAnomalyOnly(!anomalyOnly)}
              >
                {anomalyOnly ? <Eye size={13} /> : <EyeOff size={13} />}
                {anomalyOnly ? 'Show All' : 'Anomalies Only'}
              </button>
            )}
          </div>
        </div>

        {/* Network graph */}
        <div className="card p-0 overflow-hidden mb-8" style={{ height: 560 }}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
            maxZoom={2}
          >
            <Background color="#d4e6dc" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={n => {
                const fn = fundingNodes.find(f => f.id === n.id);
                if (fn?.flagged) return '#dc2626';
                return fn ? typeColors[fn.type].border : '#888';
              }}
              style={{ background: '#f8faf9', border: '1px solid #d4e6dc' }}
            />
          </ReactFlow>
        </div>

        {/* Anomaly alerts */}
        {canSeeAnomalies && (
          <div className="card">
            <div className="font-semibold mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-600" />
              Anomaly Detection Alerts
              <span className="ml-1 badge badge-red">{anomalyAlerts.length} Active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Alert ID</th><th>Type</th><th>Severity</th><th>Amount</th>
                    <th>Parties Involved</th><th>Date</th><th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalyAlerts.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono text-xs text-[var(--text-secondary)]">{a.id}</td>
                      <td className="font-semibold">{a.type}</td>
                      <td>
                        <span className={`badge text-[10px] ${a.severity === 'Critical' ? 'badge-red' : a.severity === 'High' ? 'badge-red' : 'badge-amber'}`}>
                          {a.severity === 'Critical' && <AlertTriangle size={9} className="mr-0.5" />}
                          {a.severity}
                        </span>
                      </td>
                      <td className="font-bold text-red-700">{a.amount}</td>
                      <td className="text-xs text-[var(--text-secondary)]">{a.parties}</td>
                      <td className="text-xs">{a.date}</td>
                      <td className="font-mono text-[10px] text-[var(--text-secondary)]">{a.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!canSeeAnomalies && (
          <div className="alert-strip alert-strip-blue">
            <ShieldAlert size={16} className="shrink-0" />
            <span>Anomaly alerts and flagged entities are visible to Admin and Auditor roles only.</span>
          </div>
        )}
      </div>
    </div>
  );
}
