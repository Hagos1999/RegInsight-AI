// Rule-based AI document processor — regex + keyword extraction to simulate NLP

export type EntityType = 'amount' | 'date' | 'org' | 'taxid' | 'risk' | 'cacid' | 'person';

export interface ExtractedEntity {
  text: string;
  type: EntityType;
  start: number;
  end: number;
  confidence: number;
  label: string;
}

export interface ProcessingResult {
  entities: ExtractedEntity[];
  summary: {
    amounts: string[];
    dates: string[];
    organizations: string[];
    taxIds: string[];
    cacIds: string[];
    riskKeywords: string[];
    persons: string[];
  };
  riskScore: number;
  riskFlags: string[];
  documentType: string;
  confidence: number;
}

// Regex patterns
const PATTERNS = {
  // Nigerian currency amounts: ₦47.5B, N12,000,000, NGN 500,000
  amount: /(?:₦|NGN|N)\s*[\d,]+(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M|bn|mn))?|[\d,]+(?:\.\d+)?\s*(?:Naira|naira)/gi,
  // Dates in various formats
  date: /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\b/gi,
  // FIRS tax ID patterns
  taxId: /FIRS[-\s]?[A-Z]{2,5}[-\s]?\d{4,8}[-\s]?\d{4}|TIN[-:\s]?\d{8,12}|\b\d{8}-\d{4}\b/gi,
  // CAC registration numbers
  cacId: /RC[-\s]?\d{4,8}|BN[-\s]?\d{6,10}|CAC\/\w{2,4}\/\d{6}/gi,
  // Nigerian government organizations
  organizations: [
    'Ministry of Works', 'Ministry of Finance', 'Ministry of Health', 'Ministry of Education',
    'Ministry of Power', 'Ministry of Transportation', 'Ministry of Interior', 'Ministry of Justice',
    'Ministry of Agriculture', 'Ministry of Petroleum', 'Ministry of Communications',
    'FIRS', 'Federal Inland Revenue Service', 'CAC', 'Corporate Affairs Commission',
    'BPP', 'Bureau of Public Procurement', 'NNPC', 'CBN', 'Central Bank of Nigeria',
    'NCC', 'NERC', 'NPA', 'Nigeria Ports Authority', 'EFCC', 'ICPC',
    'Julius Berger', 'Dantata', 'Costain', 'Andela', 'Zinox', 'Chams',
    'Federal Government of Nigeria', 'FGN', 'National Assembly', 'Senate',
  ],
  // Nigerian person name patterns (common prefixes + capitalized names)
  persons: /(?:Alhaji|Alhaja|Chief|Dr\.?|Prof\.?|Engr\.?|Arc\.?|Barr\.?|Hon\.?|Sen\.?|Rep\.?)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[A-Z][a-z]+\s+(?:[A-Z]\.\s+)?[A-Z][a-z]+\s*(?:Jr\.?|Sr\.?|II|III)?/g,
  // Risk keywords
  riskKeywords: [
    'shell company', 'offshore', 'BVI', 'duplicate', 'inflated', 'fictitious',
    'fraudulent', 'irregular', 'unauthorized', 'kickback', 'bribery', 'corruption',
    'non-existent', 'ghost worker', 'phantom', 'overpriced', 'over-invoiced',
    'suspicious', 'unverified', 'anonymous', 'undisclosed', 'concealed',
  ],
};

const NIGERIAN_ORGS_REGEX = new RegExp(
  PATTERNS.organizations.map(o => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'gi'
);

function detectDocumentType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('contract') || lower.includes('agreement') || lower.includes('procurement')) return 'Procurement Contract';
  if (lower.includes('tax') || lower.includes('vat') || lower.includes('cit') || lower.includes('wht')) return 'Tax Filing';
  if (lower.includes('registration') || lower.includes('incorporated') || lower.includes('cac')) return 'CAC Registration';
  if (lower.includes('audit') || lower.includes('financial statement')) return 'Audit Report';
  if (lower.includes('invoice') || lower.includes('payment')) return 'Invoice/Payment Document';
  return 'General Document';
}

function calculateRiskScore(text: string, riskFound: string[]): number {
  let score = 0;
  const lower = text.toLowerCase();
  riskFound.forEach(kw => {
    const criticalTerms = ['shell company', 'bvi', 'offshore', 'kickback', 'bribery', 'phantom', 'ghost worker'];
    score += criticalTerms.some(ct => kw.toLowerCase().includes(ct)) ? 25 : 15;
  });
  // Additional risk signals
  if (lower.includes('urgent') && lower.includes('single source')) score += 20;
  if (lower.includes('waiver') || lower.includes('deviation')) score += 15;
  return Math.min(score, 100);
}

export function processDocument(text: string): ProcessingResult {
  const entities: ExtractedEntity[] = [];

  // Extract amounts
  const amounts: string[] = [];
  let m: RegExpExecArray | null;
  const amtRegex = new RegExp(PATTERNS.amount.source, 'gi');
  while ((m = amtRegex.exec(text)) !== null) {
    amounts.push(m[0]);
    entities.push({ text: m[0], type: 'amount', start: m.index, end: m.index + m[0].length, confidence: 0.95, label: 'Currency Amount' });
  }

  // Extract dates
  const dates: string[] = [];
  const dateRegex = new RegExp(PATTERNS.date.source, 'gi');
  while ((m = dateRegex.exec(text)) !== null) {
    dates.push(m[0]);
    entities.push({ text: m[0], type: 'date', start: m.index, end: m.index + m[0].length, confidence: 0.92, label: 'Date' });
  }

  // Extract tax IDs
  const taxIds: string[] = [];
  const taxRegex = new RegExp(PATTERNS.taxId.source, 'gi');
  while ((m = taxRegex.exec(text)) !== null) {
    taxIds.push(m[0]);
    entities.push({ text: m[0], type: 'taxid', start: m.index, end: m.index + m[0].length, confidence: 0.97, label: 'Tax ID (FIRS/TIN)' });
  }

  // Extract CAC IDs
  const cacIds: string[] = [];
  const cacRegex = new RegExp(PATTERNS.cacId.source, 'gi');
  while ((m = cacRegex.exec(text)) !== null) {
    cacIds.push(m[0]);
    entities.push({ text: m[0], type: 'cacid', start: m.index, end: m.index + m[0].length, confidence: 0.96, label: 'CAC Registration' });
  }

  // Extract organizations
  const organizations: string[] = [];
  const orgRegex = new RegExp(NIGERIAN_ORGS_REGEX.source, 'gi');
  while ((m = orgRegex.exec(text)) !== null) {
    if (!organizations.includes(m[0])) organizations.push(m[0]);
    entities.push({ text: m[0], type: 'org', start: m.index, end: m.index + m[0].length, confidence: 0.88, label: 'Organization' });
  }

  // Extract risk keywords
  const riskFound: string[] = [];
  PATTERNS.riskKeywords.forEach(kw => {
    const kwIdx = text.toLowerCase().indexOf(kw);
    if (kwIdx !== -1) {
      riskFound.push(kw);
      entities.push({ text: text.substring(kwIdx, kwIdx + kw.length), type: 'risk', start: kwIdx, end: kwIdx + kw.length, confidence: 0.85, label: 'Risk Indicator' });
    }
  });

  // Extract persons
  const persons: string[] = [];
  const personRegex = new RegExp(PATTERNS.persons.source, 'g');
  while ((m = personRegex.exec(text)) !== null) {
    const name = m[0].trim();
    if (name.length > 5 && !organizations.some(o => o.toLowerCase().includes(name.toLowerCase()))) {
      if (!persons.includes(name)) persons.push(name);
      entities.push({ text: name, type: 'person', start: m.index, end: m.index + name.length, confidence: 0.75, label: 'Person Name' });
    }
  }

  // Remove duplicates and sort by position
  const seen = new Set<string>();
  const uniqueEntities = entities.filter(e => {
    const key = `${e.start}-${e.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.start - b.start);

  const riskScore = calculateRiskScore(text, riskFound);
  const riskFlags: string[] = [];
  if (riskFound.length > 0) riskFlags.push(`${riskFound.length} risk keyword(s) detected: ${riskFound.slice(0, 3).join(', ')}`);
  if (taxIds.length === 0 && !text.toLowerCase().includes('exempt')) riskFlags.push('No FIRS Tax ID found — document may be incomplete');
  if (cacIds.length === 0) riskFlags.push('No CAC registration number found');
  if (amounts.length > 5) riskFlags.push('High number of financial amounts — review for split payments');

  return {
    entities: uniqueEntities,
    summary: { amounts: [...new Set(amounts)], dates: [...new Set(dates)], organizations: [...new Set(organizations)], taxIds: [...new Set(taxIds)], cacIds: [...new Set(cacIds)], riskKeywords: riskFound, persons: [...new Set(persons)] },
    riskScore,
    riskFlags,
    documentType: detectDocumentType(text),
    confidence: Math.round((uniqueEntities.reduce((sum, e) => sum + e.confidence, 0) / Math.max(uniqueEntities.length, 1)) * 100),
  };
}

// Sample documents for demo
export const sampleDocuments = [
  {
    name: 'Abuja-Kaduna Road Contract.txt',
    type: 'contract',
    content: `FEDERAL REPUBLIC OF NIGERIA
MINISTRY OF WORKS & HOUSING
CONTRACT AGREEMENT

Contract No: CON-2024-001
Date: 15 March 2024

This agreement is entered into between the Federal Government of Nigeria, represented by the Ministry of Works & Housing (hereinafter "the Government") and Julius Berger Nigeria PLC (RC-12345, FIRS-JBN-00234-2024) hereinafter "the Contractor".

SCOPE OF WORKS
The Contractor shall undertake the rehabilitation of the Abuja–Kaduna Expressway covering 190km of dual carriageway, 12 bridges, and drainage infrastructure.

CONTRACT SUM
The total contract value is ₦47,500,000,000 (Forty-Seven Billion, Five Hundred Million Naira) only.

Payment Schedule:
- Mobilization Fee: ₦9,500,000,000 payable upon signing (20%)
- Milestone 1: ₦9,500,000,000 payable by 30 June 2024
- Milestone 2: ₦9,500,000,000 payable by 31 December 2024
- Milestone 3: ₦9,500,000,000 payable by 30 June 2025
- Final Payment: ₦9,500,000,000 on completion by 30 September 2025

PARTIES
Represented by: Engr. Ahmed Bello Matawalle (Director, Federal Public Works)
Contractor Representative: Dr. Lars Richter (Managing Director, Julius Berger Nigeria PLC)

Signed at Abuja on 15 March 2024.

FIRS Tax Clearance: FIRS-JBN-00234-2024
CAC Registration: RC-12345
BPP Certification: BPP-CON-2024-8821`,
  },
  {
    name: 'FIRS VAT Return Q1 2024.txt',
    type: 'tax',
    content: `FEDERAL INLAND REVENUE SERVICE
VALUE ADDED TAX (VAT) RETURN FORM 002

Taxpayer: Nigerian Communications Commission (NCC)
Tax Identification Number: TIN-20033456782
FIRS Reference: FIRS-NCC-00445-2024
Period: January 2024 – March 2024 (Q1)
Due Date: 21 April 2024
Filing Date: 18 April 2024

VAT COMPUTATION
Total Sales (Output VAT): ₦8,240,000,000
VAT on Sales (7.5%): ₦618,000,000
Total Purchases (Input VAT): ₦1,200,000,000
VAT on Purchases (7.5%): ₦90,000,000
Net VAT Payable: ₦528,000,000

PAYMENT DETAILS
Payment Reference: FIRS-PAY-NCC-Q1-2024-00112
Amount Paid: ₦528,000,000
Payment Date: 18 April 2024
Bank: First Bank of Nigeria

Signed by: Alhaji Usman Danbatta (Executive Vice Chairman, NCC)
TIN: TIN-20033456782
Date: 18 April 2024`,
  },
  {
    name: 'CAC Registration - Eko Atlantic Consulting.txt',
    type: 'registration',
    content: `CORPORATE AFFAIRS COMMISSION
CERTIFICATE OF INCORPORATION

Company Name: EKO ATLANTIC CONSULTING LLC
Registration Number: RC-99001
Date of Incorporation: 08 March 2024

Registered Office: No. 14B Victoria Island, Lagos (unverified)
Business Type: Limited Liability Company
Nature of Business: Offshore Oil & Gas Consultancy

DIRECTORS
1. Mr. John Emeka Okafor (Sole Director)
   Nationality: Nigerian / British

SHARE CAPITAL
Authorized Share Capital: ₦10,000,000
Issued Share Capital: ₦10,000,000

RELATED ENTITY
Offshore Clarity Holdings Ltd (BVI Company No. 1928374)
Suspected beneficial owner linked to director

NOTE: This company was awarded Federal contract FMF-PAY-2024-EAC-001 worth ₦850,000,000 on 22 April 2024, just 45 days after incorporation. This pattern is consistent with shell company behavior. Referred to EFCC on 01 May 2024.

FIRS TIN: TIN-99001234567
WHT Status: Non-Compliant`,
  },
];
