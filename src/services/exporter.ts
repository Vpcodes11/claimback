import jsPDF from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { GeneratedLetter } from '../types';

export class ExporterService {
  /**
   * Export letter to DOCX format
   */
  async exportToDocx(letter: GeneratedLetter): Promise<void> {
    const lines = letter.content_markdown.split('\n');
    const docChildren: Paragraph[] = [];

    // Header
    docChildren.push(
      new Paragraph({
        text: letter.title.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    docChildren.push(
      new Paragraph({
        text: `Subject: ${letter.subject}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );

    // Parse markdown lines into docx paragraphs
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        docChildren.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        continue;
      }

      if (line.startsWith('### ')) {
        docChildren.push(
          new Paragraph({
            text: line.replace('### ', ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.startsWith('#### ')) {
        docChildren.push(
          new Paragraph({
            text: line.replace('#### ', ''),
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 150, after: 80 },
          })
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const cleanItem = line.substring(2).replace(/\*\*/g, '');
        docChildren.push(
          new Paragraph({
            text: `• ${cleanItem}`,
            spacing: { after: 60 },
          })
        );
      } else if (line.startsWith('> ')) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace('> ', ''),
                italics: true,
              }),
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: 720 },
          })
        );
      } else {
        // Regular paragraph with bold clean up
        const cleanText = line.replace(/\*\*/g, '');
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText,
                bold: line.startsWith('**') && line.endsWith('**'),
              }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letter.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export letter to PDF format
   */
  exportToPdf(letter: GeneratedLetter): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    let y = 50;

    // Title Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(letter.title, margin, y);
    y += 24;

    // Recipient & Subject
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Recipient: ${letter.recipient}`, margin, y);
    y += 15;
    doc.text(`Subject: ${letter.subject}`, margin, y);
    y += 18;

    // Divider
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Body text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    const lines = letter.content_markdown.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Check for page overflow
      if (y > 720) {
        doc.addPage();
        y = 50;
      }

      if (!line) {
        y += 8;
        continue;
      }

      if (line.startsWith('### ') || line.startsWith('#### ')) {
        const headerText = line.replace(/#{3,4}\s*/, '');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(headerText, margin, y);
        y += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const itemText = '• ' + line.substring(2).replace(/\*\*/g, '');
        const splitItem = doc.splitTextToSize(itemText, maxLineWidth - 15);
        for (const splitLine of splitItem) {
          if (y > 720) {
            doc.addPage();
            y = 50;
          }
          doc.text(splitLine, margin + 10, y);
          y += 14;
        }
      } else {
        const cleanLine = line.replace(/\*\*/g, '');
        const splitText = doc.splitTextToSize(cleanLine, maxLineWidth);
        for (const splitLine of splitText) {
          if (y > 720) {
            doc.addPage();
            y = 50;
          }
          doc.text(splitLine, margin, y);
          y += 14;
        }
      }
    }

    doc.save(`${letter.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}

export const exporter = new ExporterService();
