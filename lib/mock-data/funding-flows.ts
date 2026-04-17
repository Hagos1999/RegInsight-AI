// Mock funding flow data — money movement between agencies, contractors, sub-vendors

export interface FlowNode {
  id: string;
  label: string;
  type: 'agency' | 'contractor' | 'subvendor' | 'bank';
  flagged: boolean;
  flagReason?: string;
  totalReceived: number;
  totalDisbursed: number;
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  date: string;
  reference: string;
  anomaly: boolean;
  anomalyType?: 'duplicate_payment' | 'shell_company' | 'over_invoicing' | 'split_payment';
  anomalyDescription?: string;
}

export const fundingNodes: FlowNode[] = [
  { id: 'n1', label: 'Federal Ministry\nof Finance', type: 'agency', flagged: false, totalReceived: 0, totalDisbursed: 450_000_000_000, x: 50, y: 200 },
  { id: 'n2', label: 'Ministry of Works\n& Housing', type: 'agency', flagged: false, totalReceived: 180_000_000_000, totalDisbursed: 175_000_000_000, x: 250, y: 100 },
  { id: 'n3', label: 'Ministry of Health', type: 'agency', flagged: false, totalReceived: 95_000_000_000, totalDisbursed: 92_000_000_000, x: 250, y: 300 },
  { id: 'n4', label: 'Julius Berger\nNigeria PLC', type: 'contractor', flagged: false, totalReceived: 47_500_000_000, totalDisbursed: 18_000_000_000, x: 480, y: 50 },
  { id: 'n5', label: 'Costain West\nAfrica PLC', type: 'contractor', flagged: false, totalReceived: 2_100_000_000, totalDisbursed: 800_000_000, x: 480, y: 170 },
  { id: 'n6', label: 'Dantata &\nSawoe Const.', type: 'contractor', flagged: false, totalReceived: 12_800_000_000, totalDisbursed: 4_000_000_000, x: 480, y: 290 },
  { id: 'n7', label: 'TrueNorth\nComms Ltd', type: 'contractor', flagged: true, flagReason: 'Duplicate payment detected — Invoice #2 paid twice', totalReceived: 680_000_000, totalDisbursed: 200_000_000, x: 480, y: 410 },
  { id: 'n8', label: 'Eko Atlantic\nConsulting LLC', type: 'contractor', flagged: true, flagReason: 'Shell company indicators: single director, no verifiable office, registered 45 days before award', totalReceived: 850_000_000, totalDisbursed: 500_000_000, x: 480, y: 530 },
  { id: 'n9', label: 'Lagoon Bridge\nSub-Contracting', type: 'subvendor', flagged: false, totalReceived: 12_000_000_000, totalDisbursed: 0, x: 720, y: 50 },
  { id: 'n10', label: 'Alpha Cement\nSuppliers', type: 'subvendor', flagged: false, totalReceived: 4_000_000_000, totalDisbursed: 0, x: 720, y: 180 },
  { id: 'n11', label: 'MedEx\nPharmaceuticals', type: 'subvendor', flagged: false, totalReceived: 2_500_000_000, totalDisbursed: 0, x: 720, y: 310 },
  { id: 'n12', label: 'Offshore Clarity\nHoldings Ltd', type: 'subvendor', flagged: true, flagReason: 'Registered in BVI. Suspected beneficial owner linked to Eko Atlantic Consulting LLC.', totalReceived: 500_000_000, totalDisbursed: 0, x: 720, y: 530 },
];

export const fundingEdges: FlowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', amount: 180_000_000_000, date: '2024-01-15', reference: 'FMF-ALLOC-2024-001', anomaly: false },
  { id: 'e2', source: 'n1', target: 'n3', amount: 95_000_000_000, date: '2024-01-15', reference: 'FMF-ALLOC-2024-002', anomaly: false },
  { id: 'e3', source: 'n2', target: 'n4', amount: 47_500_000_000, date: '2024-03-15', reference: 'MOW-PAY-2024-JBN-001', anomaly: false },
  { id: 'e4', source: 'n2', target: 'n5', amount: 2_100_000_000, date: '2024-03-20', reference: 'MOW-PAY-2024-CWA-001', anomaly: false },
  { id: 'e5', source: 'n3', target: 'n6', amount: 12_800_000_000, date: '2024-06-01', reference: 'MOH-PAY-2024-DSC-001', anomaly: false },
  { id: 'e6', source: 'n3', target: 'n7', amount: 340_000_000, date: '2023-12-01', reference: 'MOH-PAY-2023-TNC-001', anomaly: false },
  { id: 'e7', source: 'n3', target: 'n7', amount: 340_000_000, date: '2024-01-15', reference: 'MOH-PAY-2024-TNC-001', anomaly: true, anomalyType: 'duplicate_payment', anomalyDescription: 'Invoice MOH-INV-002 paid twice: ₦340M on 2023-12-01 and again on 2024-01-15.' },
  { id: 'e8', source: 'n1', target: 'n8', amount: 850_000_000, date: '2024-04-22', reference: 'FMF-PAY-2024-EAC-001', anomaly: true, anomalyType: 'shell_company', anomalyDescription: 'Payment to newly formed entity with no operating history. Single director. BVI links suspected.' },
  { id: 'e9', source: 'n4', target: 'n9', amount: 12_000_000_000, date: '2024-04-10', reference: 'JBN-SUB-2024-LBS-001', anomaly: false },
  { id: 'e10', source: 'n5', target: 'n10', amount: 800_000_000, date: '2024-04-05', reference: 'CWA-SUB-2024-ACS-001', anomaly: false },
  { id: 'e11', source: 'n6', target: 'n11', amount: 2_500_000_000, date: '2024-07-01', reference: 'DSC-SUB-2024-MED-001', anomaly: false },
  { id: 'e12', source: 'n8', target: 'n12', amount: 500_000_000, date: '2024-05-10', reference: 'EAC-XFER-2024-OCH-001', anomaly: true, anomalyType: 'shell_company', anomalyDescription: 'Rapid fund transfer to BVI-registered Offshore Clarity Holdings. Beneficial ownership opaque.' },
  { id: 'e13', source: 'n4', target: 'n10', amount: 600_000_000, date: '2024-06-15', reference: 'JBN-SUB-2024-ACS-001', anomaly: false },
  { id: 'e14', source: 'n3', target: 'n7', amount: 0, date: '2024-03-01', reference: 'MOH-PAY-2024-TNC-002', anomaly: true, anomalyType: 'split_payment', anomalyDescription: 'Payment of ₦680M split into 2×₦340M installments same day, bypassing approval threshold.' },
];

export const anomalyAlerts = [
  { id: 'ALT-001', type: 'Duplicate Payment', severity: 'High', amount: '₦340M', parties: 'Ministry of Health → TrueNorth Comms', date: '2024-01-15', ref: 'MOH-PAY-2024-TNC-001' },
  { id: 'ALT-002', type: 'Shell Company', severity: 'Critical', amount: '₦850M', parties: 'FMF → Eko Atlantic Consulting', date: '2024-04-22', ref: 'FMF-PAY-2024-EAC-001' },
  { id: 'ALT-003', type: 'Offshore Transfer', severity: 'Critical', amount: '₦500M', parties: 'Eko Atlantic → Offshore Clarity Holdings', date: '2024-05-10', ref: 'EAC-XFER-2024-OCH-001' },
  { id: 'ALT-004', type: 'Split Payment', severity: 'Medium', amount: '₦680M', parties: 'Ministry of Health → TrueNorth Comms', date: '2024-03-01', ref: 'MOH-PAY-2024-TNC-002' },
];
