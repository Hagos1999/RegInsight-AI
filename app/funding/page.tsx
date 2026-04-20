'use client';
import { useCallback, useState } from 'react';
import ReactFlow, {
  Background, Controls, Node, Edge,
  useNodesState, useEdgesState, addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fundingNodes, fundingEdges, anomalyAlerts } from '@/lib/mock-data/funding-flows';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Toggle,
  Tag,
} from '@carbon/react';
import { WarningAlt, FlowStream } from '@carbon/icons-react';

// ── React Flow node/edge builders ────────────────────────────────────────────
function buildNodes(anomalyOnly: boolean): Node[] {
  return fundingNodes
    .filter(n => !anomalyOnly || n.flagged)
    .map(n => ({
      id: n.id,
      position: { x: n.x * 1.2, y: n.y * 1.2 },
      data: {
        label: (
          <div style={{ textAlign: 'center', lineHeight: 1.3, fontSize: 11, fontWeight: 600 }}>
            {n.label}
            {n.flagged && (
              <div style={{ marginTop: 3, fontSize: 9, color: '#ffb3b8' }}>⚠ FLAGGED</div>
            )}
          </div>
        ),
      },
      className: `ri-flow-node ${n.flagged ? 'flagged' : n.type}`,
      style: { width: 130 },
    }));
}

const anomalyTypeLabel: Record<string, string> = {
  duplicate_payment: 'Duplicate Payment',
  shell_company: 'Shell Company',
  over_invoicing: 'Over-Invoicing',
  split_payment: 'Split Payment',
};

function formatNGN(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  return n === 0 ? '—' : `₦${n.toLocaleString()}`;
}

function buildEdges(anomalyOnly: boolean): Edge[] {
  return fundingEdges
    .filter(e => !anomalyOnly || e.anomaly)
    .map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: formatNGN(e.amount),
      labelStyle: { fontSize: 10, fontWeight: 600 },
      style: {
        stroke: e.anomaly ? '#fa4d56' : '#42be65',
        strokeWidth: e.anomaly ? 2.5 : 1.5,
        strokeDasharray: e.anomaly ? '6 3' : undefined,
      },
      animated: e.anomaly,
    }));
}

// ── Anomaly table headers ─────────────────────────────────────────────────────
const alertHeaders = [
  { key: 'type', header: 'Type' },
  { key: 'severity', header: 'Severity' },
  { key: 'amount', header: 'Amount' },
  { key: 'parties', header: 'Parties' },
  { key: 'date', header: 'Date' },
  { key: 'ref', header: 'Reference' },
];

type SevTag = 'red' | 'warm-gray';
function severityTag(s: string): SevTag {
  return s === 'Critical' || s === 'High' ? 'red' : 'warm-gray';
}

export default function FundingPage() {
  const [anomalyOnly, setAnomalyOnly] = useState(false);

  const initialNodes = buildNodes(false);
  const initialEdges = buildEdges(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const handleToggle = (checked: boolean) => {
    setAnomalyOnly(checked);
    setNodes(buildNodes(checked));
    setEdges(buildEdges(checked));
  };

  const alertRows = anomalyAlerts.map(a => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    amount: a.amount,
    parties: a.parties,
    date: a.date,
    ref: a.ref,
  }));

  return (
    <div className="ri-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cds-text-primary)', marginBottom: 4 }}>
            Funding Flow Visualizer
          </h1>
          <p style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>
            Interactive money-movement map — {fundingNodes.length} entities, {fundingEdges.length} flows
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Legend chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { cls: 'agency', label: 'Agency' },
              { cls: 'contractor', label: 'Contractor' },
              { cls: 'subvendor', label: 'Sub-vendor' },
              { cls: 'flagged', label: 'Flagged' },
            ].map(({ cls, label }) => (
              <span
                key={cls}
                className={`ri-flow-node ${cls}`}
                style={{ padding: '2px 10px', fontSize: 11, borderRadius: 6, minWidth: 'unset', boxShadow: 'none' }}
              >
                {label}
              </span>
            ))}
          </div>

          <Toggle
            id="ri-anomaly-toggle"
            labelText="Anomalies Only"
            labelA="All"
            labelB="Anomalies"
            toggled={anomalyOnly}
            onToggle={handleToggle}
            size="sm"
          />
        </div>
      </div>

      {/* Anomaly summary tags */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {anomalyAlerts.map(a => (
          <Tag key={a.id} type="red" size="sm">
            <WarningAlt size={10} aria-hidden="true" /> {a.type} · {a.amount}
          </Tag>
        ))}
      </div>

      {/* ReactFlow graph */}
      <div className="ri-flow-wrap" style={{ marginBottom: '1.5rem' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          attributionPosition="bottom-right"
        >
          <Controls />
          <Background color="rgba(255,255,255,0.04)" gap={20} />
        </ReactFlow>
      </div>

      {/* Anomaly alerts DataTable */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable rows={alertRows} headers={alertHeaders}>
          {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer
              title="Anomaly Alert Table"
              description="All detected funding flow irregularities"
            >
              <Table {...getTableProps()} size="sm" aria-label="Funding anomaly alerts">
                <TableHead>
                  <TableRow>
                    {tableHeaders.map(h => (
                      // @ts-expect-error Carbon types
                      <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map(row => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map(cell => (
                        <TableCell key={cell.id} style={{ fontSize: 12 }}>
                          {cell.info.header === 'severity' ? (
                            <Tag type={severityTag(cell.value)} size="sm">
                              {cell.value === 'Critical' && <WarningAlt size={10} aria-hidden="true" />}
                              {cell.value}
                            </Tag>
                          ) : cell.info.header === 'type' ? (
                            <Tag type="red" size="sm">{cell.value}</Tag>
                          ) : cell.info.header === 'amount' ? (
                            <strong style={{ color: 'var(--ri-red)' }}>{cell.value}</strong>
                          ) : (
                            <span>{cell.value}</span>
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
