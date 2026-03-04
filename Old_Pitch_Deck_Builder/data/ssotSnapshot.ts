type LeaseSnapshot = {
  lease_id: string;
  horse_id: string;
  horse_name: string;
  start_date: string;
  end_date: string;
  token_price_nzd: number;
  total_issuance_value_nzd: number;
  lease_status: string;
};

type IntakeSnapshot = {
  intake_id: string;
  breeding_url: string;
  parse_status: string;
  parsed_horse_name: string;
};

type DocumentSnapshot = {
  document_id: string;
  source_reference: string;
  file_path: string;
  path_status: 'ok' | 'missing';
};

export const ssotData: {
  snapshotDate: string;
  horses: Array<{ horse_id: string; horse_name: string }>;
  leases: LeaseSnapshot[];
  intakeQueue: IntakeSnapshot[];
  documents: DocumentSnapshot[];
  hltDraft: {
    draftId: string;
    createdAt: string;
    status: string;
    horseName: string;
    hltNarrative: string;
  };
} = {
  snapshotDate: '2026-03-03',
  horses: [
    { horse_id: 'HRS-001', horse_name: 'First Gear' },
    { horse_id: 'HRS-002', horse_name: 'Prudentia' },
  ],
  leases: [
    {
      lease_id: 'LSE-001',
      horse_id: 'HRS-001',
      horse_name: 'First Gear',
      start_date: '2025-07-01',
      end_date: '2026-06-30',
      token_price_nzd: 240,
      total_issuance_value_nzd: 4800,
      lease_status: 'active',
    },
    {
      lease_id: 'LSE-002',
      horse_id: 'HRS-002',
      horse_name: 'Prudentia',
      start_date: '2026-01-01',
      end_date: '2027-06-30',
      token_price_nzd: 292.5,
      total_issuance_value_nzd: 5850,
      lease_status: 'active',
    },
  ],
  intakeQueue: [
    {
      intake_id: 'INT-001',
      breeding_url: 'https://loveracing.nz/Breeding/428364/First-Gear-NZ-2021.aspx',
      parse_status: 'parsed',
      parsed_horse_name: 'First Gear',
    },
    {
      intake_id: 'INT-002',
      breeding_url: 'https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx',
      parse_status: 'parsed',
      parsed_horse_name: 'Prudentia',
    },
  ],
  documents: [
    {
      document_id: 'DOC-001',
      source_reference: 'PDS - First Gear - 04-09-2025.docx',
      file_path: '/home/evo/projects/SSOT_Build/Horse_First_Gear/PDS - First Gear - 04-09-2025.docx',
      path_status: 'ok',
    },
    {
      document_id: 'DOC-002',
      source_reference: 'Syndicate Agreement - First Gear - 01-09-2025.docx',
      file_path: '/home/evo/projects/SSOT_Build/Horse_First_Gear/Syndicate Agreement - First Gear - 01-09-2025.docx',
      path_status: 'ok',
    },
    {
      document_id: 'DOC-003',
      source_reference: 'Horse Lease Reward VA Whitepaper - 18 July 2025.pdf',
      file_path: '/home/evo/projects/SSOT_Build/Horse_First_Gear/Horse Lease Reward VA Whitepaper - 18 July 2025.pdf',
      path_status: 'ok',
    },
    {
      document_id: 'DOC-004',
      source_reference: 'Prudentia - PDS - 22Feb2026.docx',
      file_path: '/home/evo/projects/SSOT_Build/Horse_Prudentia/Prudentia - PDS - 22Feb2026.docx',
      path_status: 'ok',
    },
    {
      document_id: 'DOC-005',
      source_reference: 'Prudentia - Syndicate Agreement - 22Feb2026 (1).docx',
      file_path: '/home/evo/projects/SSOT_Build/Horse_Prudentia/Prudentia - Syndicate Agreement - 22Feb2026 (1).docx',
      path_status: 'ok',
    },
    {
      document_id: 'DOC-006',
      source_reference: 'Horse Lease Reward VA Whitepaper -Issuance3 - 14Jan2026.docx',
      file_path: '/home/evo/projects/SSOT_Build/Horse_Prudentia/Horse Lease Reward VA Whitepaper -Issuance3 - 14Jan2026.docx',
      path_status: 'ok',
    },
    {
      document_id: 'DOC-007',
      source_reference: 'HLT Issuance Details - Preduntia 21Feb2026.docx',
      file_path: '/home/evo/projects/SSOT_Build/Horse_Prudentia/HLT Issuance Details - Preduntia 21Feb2026.docx',
      path_status: 'ok',
    },
  ],
  hltDraft: {
    draftId: 'HLT-20260303094601-a3924b0f',
    createdAt: '2026-03-03T09:46:01.021Z',
    status: 'draft',
    horseName: 'Prudentia',
    hltNarrative: 'test narrative',
  },
};
