type HltRecordLike = {
  token_name: string;
  erc20_identifier: string;
  submission_date: string;
  horse_microchip: string;
  num_tokens: number;
  token_price_nzd: number;
  total_issuance_value: number;
  horse_name: string;
  horse_country: string;
  horse_year: string;
  trainer_name: string;
  stable_location: string;
  owner_name: string;
  governing_body_name: string;
  governing_body_code: string;
  lease_length_months: number;
  lease_start_date: string;
  owner_stakes_split: number;
  investor_stakes_split: number;
  variations: string;
};

type InvestorUpdatePayloadLike = {
  horseId: string;
  horseName: string;
  headline: string;
  summary: string;
  body: string;
  asOfDate: string;
};

export const buildHltDocxBlob = async (
  record: HltRecordLike,
  helpers: {
    formalDate: (value: string) => string;
    humanDate: (value: string) => string;
  },
): Promise<Blob> => {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Horse Lease Token ("HLT") New Issuance Details')] }),
        new Paragraph(`1. Issuance Submission Date: ${helpers.formalDate(record.submission_date)}`),
        new Paragraph(`2. Token Name: ${record.token_name}`),
        new Paragraph(`   ERC20 blockchain identifier: ${record.erc20_identifier}`),
        new Paragraph(`3. Horse Microchip Number: ${record.horse_microchip || 'n/a'}`),
        new Paragraph('4. Token Issuance Particulars:'),
        new Paragraph(`   a. Number of Tokens issued: ${record.num_tokens}`),
        new Paragraph(`   b. Token Price: $${record.token_price_nzd.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
        new Paragraph(`   c. Total Issuance Value: $${record.total_issuance_value.toLocaleString('en-NZ')}`),
        new Paragraph(`5. Horse(s): ${record.horse_name} (${record.horse_country}) ${record.horse_year}`),
        new Paragraph(`6. Stable / Trainer: ${record.trainer_name}${record.stable_location ? `, ${record.stable_location}` : ''}`),
        new Paragraph(`7. Horse Asset Lease/Owner: ${record.owner_name}`),
        new Paragraph(`8. Governing Body: ${record.governing_body_name} (${record.governing_body_code})`),
        new Paragraph('9. Product commercial details:'),
        new Paragraph(`   a. HLT Lease period: ${record.lease_length_months} Months commencing ${helpers.humanDate(record.lease_start_date)}`),
        new Paragraph(`   b. Stakes Split: ${record.owner_stakes_split}/${record.investor_stakes_split} in favour of tokenholders.`),
        new Paragraph(`10. Variations: ${record.variations?.trim() || 'n/a'}`),
      ],
    }],
  });
  return Packer.toBlob(doc);
};

export const downloadHltPdfFromHtml = async (html: string, fileName: string): Promise<void> => {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-20000px';
  sandbox.style.top = '0';
  sandbox.style.width = '794px';
  sandbox.style.background = '#fff';
  sandbox.innerHTML = html;
  document.body.appendChild(sandbox);
  try {
    const page = (sandbox.querySelector('.page') as HTMLElement | null) ?? sandbox;
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, 0, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(fileName);
  } finally {
    document.body.removeChild(sandbox);
  }
};

export const buildInvestorUpdateDocxBlob = async (payload: InvestorUpdatePayloadLike): Promise<Blob> => {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const bodyBlocks = payload.body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: payload.headline, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ children: [new TextRun({ text: `${payload.horseName} (${payload.horseId}) - ${payload.asOfDate}`, bold: true })] }),
        new Paragraph({ text: payload.summary || 'No summary provided.' }),
        ...bodyBlocks.map((block) => new Paragraph({ text: block })),
      ],
    }],
  });
  return Packer.toBlob(doc);
};

// ─── DS Listing Document Builder ──────────────────────────────────────────────

type DsListingPayload = {
  horseName: string;
  countryCode: string;
  foalingDate: string;
  sex: string;
  colour: string;
  microchip: string;
  breedingUrl: string;
  sireName: string;
  damName: string;
  sireDisplayName: string;
  damDisplayName: string;
  sireDescription: string;
  damDescription: string;
  trainerName: string;
  stableName: string;
  contactName: string;
  trainerBio: string;
  trainerLocation: string;
  trainerFullAddress: string;
  horseIntro: string;
  narrativeHeadline: string;
  narrativeBody: string;
  earningsSentence: string;
  racingRecord: string;
  leaseDuration: number;
  leaseStartDate: string;
  leaseEndDate: string;
  searchTerms: string;
  detailSummary: string;
  offeringTitle: string;
  previewDetails: string;
  horseColour: string;
  horseDOB: string;
  ageName: string;
  pedigreeIntroBody: string;
  boilerplate: {
    why_tokenise_heading: string;
    why_tokenise_body: string;
    pedigree_intro: string;
    asset_type: string;
    promoted_default: string;
  };
  races: Array<{ date?: string; course?: string; position?: string; jockey?: string; replay_url?: string }>;
  currentStatus: string;
};

export const buildDsListingDocxBlob = async (payload: DsListingPayload): Promise<Blob> => {
  const {
    Document, HeadingLevel, Packer, Paragraph, TextRun,
    AlignmentType, LevelFormat,
    Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType,
  } = await import('docx');

  const p = payload;
  const raceCount = p.races.length;
  const lastRace = p.races[raceCount - 1];
  const racingRecordSummary = raceCount > 0
    ? `${raceCount} start${raceCount > 1 ? 's' : ''}`
    : p.racingRecord || 'Unraced — in preparation';

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
  const bulletRef = 'ds-bullets';
  const COL1 = 3200;
  const COL2 = 5826;

  function metaTable(rows: [string, string][]) {
    return new Table({
      width: { size: COL1 + COL2, type: WidthType.DXA },
      columnWidths: [COL1, COL2],
      rows: [
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, width: { size: COL1, type: WidthType.DXA }, shading: { fill: '2D3A4A', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: 'Field', bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: COL2, type: WidthType.DXA }, shading: { fill: '2D3A4A', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })] })] }),
          ],
        }),
        ...rows.map(([field, value], idx) =>
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: COL1, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: field, bold: true, font: 'Calibri', size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: COL2, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: value, font: 'Calibri', size: 20 })] })] }),
            ],
          }),
        ),
      ],
    });
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: bulletRef,
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Calibri', color: '1A1A2E' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Calibri', color: '2D3A4A' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: 'Calibri', color: '3D4F5F' },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        // SECTION 1: OFFERING HEADER
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 1: OFFERING HEADER', bold: true })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'offeringTitle: ', bold: true }), new TextRun(p.offeringTitle)] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'previewDetails: ', bold: true }), new TextRun(p.previewDetails)] }),

        // SECTION 2: FULL DETAILS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 2: FULL DETAILS (Marketing Copy)', bold: true })] }),

        // Intro
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${p.horseName}: Evolution Stables Next Offering` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.horseIntro || '[MISSING: horse_intro]')] }),

        // Why Tokenise (STATIC)
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${p.boilerplate.why_tokenise_heading}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.boilerplate.why_tokenise_body)] }),

        // About [Horse]
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} About ${p.horseName}` })] }),
        ...[
          `Sex: ${p.sex}`,
          `Age (DOB): ${p.ageName} (${p.horseDOB})`,
          `Sire: ${p.sireName}`,
          `Dam: ${p.damName}`,
          `Trainer: ${p.trainerName}`,
          `Location: ${p.trainerLocation}`,
          `Racing Record: ${racingRecordSummary}`,
        ].map((text) => new Paragraph({ numbering: { reference: bulletRef, level: 0 }, spacing: { after: 40 }, children: [new TextRun(text)] })),
        new Paragraph({ spacing: { after: 120 }, children: [] }),

        // Narrative
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${p.horseName}: ${p.narrativeHeadline || '[MISSING: headline]'}` })] }),
        ...p.narrativeBody.split(/\n{2,}/).filter(Boolean).map((block) =>
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun(block.trim())] })
        ),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: p.earningsSentence, italics: true })] }),

        // Trainer Profile
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} Trainer Profile: ${p.trainerName} — ${p.stableName}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.trainerBio || '[MISSING: trainer_bio]')] }),

        // SECTION 3: PEDIGREE BLOCK
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 3: PEDIGREE BLOCK', bold: true })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${p.boilerplate.pedigree_intro}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.pedigreeIntroBody)] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: `The Sire: ${p.sireDisplayName}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.sireDescription || '[MISSING: sire_description]')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: `The Dam: ${p.damDisplayName}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.damDescription || '[MISSING: dam_description]')] }),

        // SECTION 4: META KEYS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 4: META KEYS (Structured Data Fields)', bold: true })] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'These are the structured data fields that populate the Tokinvest platform listing.', italics: true, color: '666666' })] }),

        metaTable([
          ['promoted', p.boilerplate.promoted_default],
          ['horseRaceHistory', p.breedingUrl || ''],
          ['raceDescription', p.currentStatus || racingRecordSummary],
          ['result', lastRace?.position || 'N/A'],
          ['numberOfRunners', String(raceCount)],
          ['trainer', p.trainerName],
          ['jockey', lastRace?.jockey || 'TBD'],
          ['raceCourse', lastRace?.course || p.trainerLocation],
          ['horseTrainer', p.trainerName],
          ['horseType', p.sex],
          ['propertyLocation', p.trainerFullAddress],
          ['searchTerms', p.searchTerms],
          ['horseColour', p.horseColour],
          ['horseDOB', p.horseDOB],
          ['assetType', p.boilerplate.asset_type],
        ]),

        new Paragraph({ spacing: { before: 200, after: 80 }, children: [] }),

        // detailSummary sub-table
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'detailSummary' })] }),
        metaTable([
          ['Location', p.trainerLocation],
          ['Trainer', p.trainerName],
          ['Duration', `${p.leaseDuration} months${p.leaseStartDate ? ` (${p.leaseStartDate} to ${p.leaseEndDate})` : ''}`],
          ['Sire', p.sireName],
          ['Dam', p.damName],
          ['Microchip', p.microchip],
        ]),

        new Paragraph({ spacing: { before: 200, after: 80 }, children: [] }),

        // horsePedigree
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'horsePedigree' })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `The Sire: ${p.sireDisplayName}`, bold: true })] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun(p.sireDescription || '[MISSING: sire_description]')] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `The Dam: ${p.damDisplayName}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(p.damDescription || '[MISSING: dam_description]')] }),
      ],
    }],
  });

  return Packer.toBlob(doc);
};

export const downloadInvestorUpdatePdf = async (payload: InvestorUpdatePayloadLike, fileName: string): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = pdf.internal.pageSize.getWidth() - (margin * 2);
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 58;
  const writeWrapped = (text: string, size: number) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, width) as string[];
    for (const line of lines) {
      if (y > pageHeight - 52) {
        pdf.addPage();
        y = 58;
      }
      pdf.text(line, margin, y);
      y += size + 6;
    }
  };
  writeWrapped(payload.headline, 18);
  y += 4;
  writeWrapped(`${payload.horseName} (${payload.horseId}) - ${payload.asOfDate}`, 11);
  y += 8;
  writeWrapped(payload.summary || 'No summary provided.', 12);
  y += 8;
  writeWrapped(payload.body, 12);
  pdf.save(fileName);
};
