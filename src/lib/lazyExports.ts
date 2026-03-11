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
