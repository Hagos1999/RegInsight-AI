// Mock compliance data — FIRS, CAC, BPP across parastatals

export interface ComplianceRecord {
  id: string;
  parastatal: string;
  ministry: string;
  taxCompliance: number; // 0-100%
  cacStatus: 'Active' | 'Pending Renewal' | 'Expired' | 'Under Review';
  vatFiling: 'Filed' | 'Overdue' | 'Exempt';
  citFiling: 'Filed' | 'Overdue' | 'Pending';
  whtRemittance: 'Compliant' | 'Partial' | 'Non-Compliant';
  nextDeadline: string;
  overallScore: number;
  monthlyData: { month: string; score: number }[];
}

export interface FilingDeadline {
  id: string;
  parastatal: string;
  type: 'VAT Return' | 'CIT Return' | 'WHT Remittance' | 'CAC Annual Return' | 'BPP Registration';
  dueDate: string;
  status: 'Submitted' | 'Due Soon' | 'Overdue' | 'Pending';
  penalty?: string;
}

export const complianceRecords: ComplianceRecord[] = [
  {
    id: 'COM-001',
    parastatal: 'Nigerian National Petroleum Corp (NNPC)',
    ministry: 'Ministry of Petroleum',
    taxCompliance: 94,
    cacStatus: 'Active',
    vatFiling: 'Filed',
    citFiling: 'Filed',
    whtRemittance: 'Compliant',
    nextDeadline: '2024-10-21',
    overallScore: 92,
    monthlyData: [
      { month: 'Apr', score: 88 }, { month: 'May', score: 91 }, { month: 'Jun', score: 90 },
      { month: 'Jul', score: 93 }, { month: 'Aug', score: 94 }, { month: 'Sep', score: 92 },
    ],
  },
  {
    id: 'COM-002',
    parastatal: 'Central Bank of Nigeria (CBN)',
    ministry: 'Ministry of Finance',
    taxCompliance: 98,
    cacStatus: 'Active',
    vatFiling: 'Exempt',
    citFiling: 'Filed',
    whtRemittance: 'Compliant',
    nextDeadline: '2024-11-30',
    overallScore: 97,
    monthlyData: [
      { month: 'Apr', score: 96 }, { month: 'May', score: 97 }, { month: 'Jun', score: 98 },
      { month: 'Jul', score: 97 }, { month: 'Aug', score: 98 }, { month: 'Sep', score: 97 },
    ],
  },
  {
    id: 'COM-003',
    parastatal: 'Nigerian Communications Commission (NCC)',
    ministry: 'Ministry of Communications',
    taxCompliance: 81,
    cacStatus: 'Active',
    vatFiling: 'Filed',
    citFiling: 'Pending',
    whtRemittance: 'Partial',
    nextDeadline: '2024-10-15',
    overallScore: 78,
    monthlyData: [
      { month: 'Apr', score: 72 }, { month: 'May', score: 75 }, { month: 'Jun', score: 80 },
      { month: 'Jul', score: 78 }, { month: 'Aug', score: 81 }, { month: 'Sep', score: 82 },
    ],
  },
  {
    id: 'COM-004',
    parastatal: 'Federal Inland Revenue Service (FIRS)',
    ministry: 'Ministry of Finance',
    taxCompliance: 99,
    cacStatus: 'Active',
    vatFiling: 'Filed',
    citFiling: 'Filed',
    whtRemittance: 'Compliant',
    nextDeadline: '2024-12-31',
    overallScore: 99,
    monthlyData: [
      { month: 'Apr', score: 98 }, { month: 'May', score: 99 }, { month: 'Jun', score: 99 },
      { month: 'Jul', score: 99 }, { month: 'Aug', score: 99 }, { month: 'Sep', score: 99 },
    ],
  },
  {
    id: 'COM-005',
    parastatal: 'Nigerian Electricity Regulatory Commission (NERC)',
    ministry: 'Ministry of Power',
    taxCompliance: 67,
    cacStatus: 'Pending Renewal',
    vatFiling: 'Overdue',
    citFiling: 'Overdue',
    whtRemittance: 'Non-Compliant',
    nextDeadline: '2024-10-01',
    overallScore: 55,
    monthlyData: [
      { month: 'Apr', score: 65 }, { month: 'May', score: 60 }, { month: 'Jun', score: 58 },
      { month: 'Jul', score: 55 }, { month: 'Aug', score: 52 }, { month: 'Sep', score: 55 },
    ],
  },
  {
    id: 'COM-006',
    parastatal: 'Nigeria Ports Authority (NPA)',
    ministry: 'Ministry of Transportation',
    taxCompliance: 85,
    cacStatus: 'Active',
    vatFiling: 'Filed',
    citFiling: 'Filed',
    whtRemittance: 'Compliant',
    nextDeadline: '2024-11-21',
    overallScore: 84,
    monthlyData: [
      { month: 'Apr', score: 80 }, { month: 'May', score: 82 }, { month: 'Jun', score: 83 },
      { month: 'Jul', score: 84 }, { month: 'Aug', score: 85 }, { month: 'Sep', score: 84 },
    ],
  },
  {
    id: 'COM-007',
    parastatal: 'Bank of Agriculture (BOA)',
    ministry: 'Ministry of Agriculture',
    taxCompliance: 44,
    cacStatus: 'Expired',
    vatFiling: 'Overdue',
    citFiling: 'Overdue',
    whtRemittance: 'Non-Compliant',
    nextDeadline: '2024-09-30',
    overallScore: 38,
    monthlyData: [
      { month: 'Apr', score: 50 }, { month: 'May', score: 46 }, { month: 'Jun', score: 42 },
      { month: 'Jul', score: 40 }, { month: 'Aug', score: 38 }, { month: 'Sep', score: 38 },
    ],
  },
  {
    id: 'COM-008',
    parastatal: 'National Water Resources Institute (NWRI)',
    ministry: 'Ministry of Water Resources',
    taxCompliance: 72,
    cacStatus: 'Active',
    vatFiling: 'Filed',
    citFiling: 'Pending',
    whtRemittance: 'Compliant',
    nextDeadline: '2024-10-21',
    overallScore: 70,
    monthlyData: [
      { month: 'Apr', score: 65 }, { month: 'May', score: 68 }, { month: 'Jun', score: 70 },
      { month: 'Jul', score: 72 }, { month: 'Aug', score: 72 }, { month: 'Sep', score: 73 },
    ],
  },
];

export const filingDeadlines: FilingDeadline[] = [
  { id: 'FD-001', parastatal: 'NERC', type: 'VAT Return', dueDate: '2024-10-01', status: 'Overdue', penalty: '₦500,000 + 10% p.a.' },
  { id: 'FD-002', parastatal: 'NCC', type: 'WHT Remittance', dueDate: '2024-10-15', status: 'Due Soon' },
  { id: 'FD-003', parastatal: 'NCC', type: 'CIT Return', dueDate: '2024-10-15', status: 'Pending' },
  { id: 'FD-004', parastatal: 'NNPC', type: 'VAT Return', dueDate: '2024-10-21', status: 'Due Soon' },
  { id: 'FD-005', parastatal: 'NWRI', type: 'CAC Annual Return', dueDate: '2024-10-21', status: 'Due Soon' },
  { id: 'FD-006', parastatal: 'BOA', type: 'CIT Return', dueDate: '2024-09-30', status: 'Overdue', penalty: '₦1,000,000 + 5% p.a.' },
  { id: 'FD-007', parastatal: 'BOA', type: 'CAC Annual Return', dueDate: '2024-09-30', status: 'Overdue', penalty: '₦50,000 per month' },
  { id: 'FD-008', parastatal: 'NPA', type: 'VAT Return', dueDate: '2024-11-21', status: 'Pending' },
  { id: 'FD-009', parastatal: 'FIRS', type: 'CIT Return', dueDate: '2024-12-31', status: 'Pending' },
  { id: 'FD-010', parastatal: 'CBN', type: 'VAT Return', dueDate: '2024-11-30', status: 'Pending' },
];

export const overallMetrics = {
  avgCompliance: 76,
  filedOnTime: 68,
  overdueFilings: 6,
  expiredRegistrations: 1,
  pendingRenewals: 2,
  totalPenaltiesAccrued: '₦6.75M',
  complianceChange: +3.2,
};
