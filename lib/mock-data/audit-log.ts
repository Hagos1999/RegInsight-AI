// Mock audit log — simulated blockchain chain of records

export interface AuditEntry {
  id: string;
  blockNum: number;
  hash: string;
  prevHash: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export const auditLog: AuditEntry[] = [
  { id: 'BLK-0001', blockNum: 1, hash: '0000a3f1c2d4e5b678901234567890123456789abcdef01', prevHash: '0000000000000000000000000000000000000000genesis', timestamp: '2024-01-10T08:00:00Z', user: 'system', role: 'System', action: 'GENESIS_BLOCK', entityType: 'System', entityId: 'GENESIS', details: 'RegInsight AI audit chain initialized', ipAddress: '127.0.0.1' },
  { id: 'BLK-0002', blockNum: 2, hash: '0001b4g2d3e6f789012345678901234567890abcdef02', prevHash: '0000a3f1c2d4e5b678901234567890123456789abcdef01', timestamp: '2024-01-15T09:12:34Z', user: 'adm.okonkwo', role: 'Admin', action: 'CONTRACT_CREATED', entityType: 'Contract', entityId: 'CON-2024-001', details: 'Awarded Abuja–Kaduna Expressway contract to Julius Berger PLC for ₦47.5B', ipAddress: '10.0.1.14' },
  { id: 'BLK-0003', blockNum: 3, hash: '0002c5h3e4f7a890123456789012345678901abcdef03', prevHash: '0001b4g2d3e6f789012345678901234567890abcdef02', timestamp: '2024-01-20T11:30:00Z', user: 'usr.ibrahim', role: 'Agency User', action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: 'DOC-2024-0045', details: 'CAC Certificate uploaded for Dantata & Sawoe Construction', ipAddress: '10.0.2.5' },
  { id: 'BLK-0004', blockNum: 4, hash: '0003d6i4f5g8b901234567890123456789012abcdef04', prevHash: '0002c5h3e4f7a890123456789012345678901abcdef03', timestamp: '2024-01-22T13:45:12Z', user: 'adm.okonkwo', role: 'Admin', action: 'PAYMENT_APPROVED', entityType: 'Payment', entityId: 'PAY-2024-001', details: 'Approved mobilization fee ₦9.5B for CON-2024-001 to Julius Berger', ipAddress: '10.0.1.14' },
  { id: 'BLK-0005', blockNum: 5, hash: '0004e7j5g6h9c012345678901234567890123abcdef05', prevHash: '0003d6i4f5g8b901234567890123456789012abcdef04', timestamp: '2024-02-01T08:00:00Z', user: 'aud.adeyemi', role: 'Auditor', action: 'COMPLIANCE_CHECKED', entityType: 'Parastatal', entityId: 'COM-005', details: 'Compliance audit initiated for NERC. VAT filing status flagged as Overdue.', ipAddress: '10.0.3.22' },
  { id: 'BLK-0006', blockNum: 6, hash: '0005f8k6h7i0d123456789012345678901234abcdef06', prevHash: '0004e7j5g6h9c012345678901234567890123abcdef05', timestamp: '2024-02-14T10:15:00Z', user: 'usr.obi', role: 'Agency User', action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: 'DOC-2024-0067', details: 'Tax clearance certificate uploaded for NPA – valid until 2025-01-31', ipAddress: '10.0.4.8' },
  { id: 'BLK-0007', blockNum: 7, hash: '0006g9l7i8j1e234567890123456789012345abcdef07', prevHash: '0005f8k6h7i0d123456789012345678901234abcdef06', timestamp: '2024-02-28T14:22:00Z', user: 'adm.okonkwo', role: 'Admin', action: 'ANOMALY_FLAGGED', entityType: 'Payment', entityId: 'PAY-2024-TNC-001', details: 'ALERT: Duplicate payment detected. Invoice MOH-INV-002 paid twice. Case ID: ANO-2024-001', ipAddress: '10.0.1.14' },
  { id: 'BLK-0008', blockNum: 8, hash: '0007h0m8j9k2f345678901234567890123456abcdef08', prevHash: '0006g9l7i8j1e234567890123456789012345abcdef07', timestamp: '2024-03-01T09:00:00Z', user: 'aud.adeyemi', role: 'Auditor', action: 'AUDIT_REPORT_GENERATED', entityType: 'Report', entityId: 'RPT-Q1-2024', details: 'Q1 2024 procurement audit report generated and sealed.', ipAddress: '10.0.3.22' },
  { id: 'BLK-0009', blockNum: 9, hash: '0008i1n9k0l3g456789012345678901234567abcdef09', prevHash: '0007h0m8j9k2f345678901234567890123456abcdef08', timestamp: '2024-03-15T11:00:00Z', user: 'adm.okonkwo', role: 'Admin', action: 'CONTRACT_CREATED', entityType: 'Contract', entityId: 'CON-2024-002', details: 'Awarded health care centre construction to Dantata & Sawoe for ₦12.8B', ipAddress: '10.0.1.14' },
  { id: 'BLK-0010', blockNum: 10, hash: '0009j2o0l1m4h567890123456789012345678abcdef10', prevHash: '0008i1n9k0l3g456789012345678901234567abcdef09', timestamp: '2024-03-20T13:00:00Z', user: 'usr.bello', role: 'Agency User', action: 'CONTRACT_STATUS_UPDATED', entityType: 'Contract', entityId: 'CON-2024-001', details: 'Contract status updated from Awarded to In Progress. Milestone 1 confirmed.', ipAddress: '10.0.2.11' },
  { id: 'BLK-0011', blockNum: 11, hash: '0010k3p1m2n5i678901234567890123456789abcdef11', prevHash: '0009j2o0l1m4h567890123456789012345678abcdef10', timestamp: '2024-04-01T08:30:00Z', user: 'aud.adeyemi', role: 'Auditor', action: 'SHELL_COMPANY_FLAGGED', entityType: 'Contractor', entityId: 'n8', details: 'ALERT: Eko Atlantic Consulting LLC flagged as potential shell company. Referred to EFCC.', ipAddress: '10.0.3.22' },
  { id: 'BLK-0012', blockNum: 12, hash: '0011l4q2n3o6j789012345678901234567890abcdef12', prevHash: '0010k3p1m2n5i678901234567890123456789abcdef11', timestamp: '2024-04-22T09:45:00Z', user: 'adm.okonkwo', role: 'Admin', action: 'PAYMENT_APPROVED', entityType: 'Payment', entityId: 'PAY-2024-EAC-001', details: 'Payment of ₦850M to Eko Atlantic Consulting LLC approved for OPL-245 consultancy.', ipAddress: '10.0.1.14' },
  { id: 'BLK-0013', blockNum: 13, hash: '0012m5r3o4p7k890123456789012345678901abcdef13', prevHash: '0011l4q2n3o6j789012345678901234567890abcdef12', timestamp: '2024-05-10T10:00:00Z', user: 'aud.adeyemi', role: 'Auditor', action: 'OFFSHORE_TRANSFER_DETECTED', entityType: 'Payment', entityId: 'EAC-XFER-2024-OCH-001', details: 'CRITICAL: ₦500M transferred from Eko Atlantic to BVI-registered Offshore Clarity Holdings. Frozen pending investigation.', ipAddress: '10.0.3.22' },
  { id: 'BLK-0014', blockNum: 14, hash: '0013n6s4p5q8l901234567890123456789012abcdef14', prevHash: '0012m5r3o4p7k890123456789012345678901abcdef13', timestamp: '2024-06-01T08:00:00Z', user: 'usr.ibrahim', role: 'Agency User', action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: 'DOC-2024-0112', details: 'VAT return Q1 2024 uploaded for NCC. FIRS reference: FIRS-NCC-VAT-Q1-2024', ipAddress: '10.0.2.5' },
  { id: 'BLK-0015', blockNum: 15, hash: '0014o7t5q6r9m012345678901234567890123abcdef15', prevHash: '0013n6s4p5q8l901234567890123456789012abcdef14', timestamp: '2024-06-15T14:15:00Z', user: 'adm.okonkwo', role: 'Admin', action: 'USER_ROLE_CHANGED', entityType: 'User', entityId: 'usr.obi', details: 'User usr.obi upgraded from Agency User to Senior Agency Officer by admin.okonkwo', ipAddress: '10.0.1.14' },
];
