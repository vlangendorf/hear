import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Player } from '../types';

interface ExportPdfOptions {
  elementId?: string;
  fieldTitle?: string;
  teams: (Player | null)[][];
  teamLeaderName: string;
  targetObjective: string;
}

export async function exportTeamListToPdf({
  elementId = 'main-team-window',
  fieldTitle = 'CAMPO PRIMARIO',
  teams,
  teamLeaderName,
  targetObjective,
}: ExportPdfOptions): Promise<void> {
  const totalAssigned = teams.flat().filter(Boolean).length;
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. Try to capture the screen element for a visual page in the PDF
  const element = document.getElementById(elementId);
  
  // Create landscape PDF (A4 is 297mm x 210mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  let capturedCanvas: HTMLCanvasElement | null = null;
  if (element) {
    try {
      capturedCanvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1600,
      });
    } catch (err) {
      console.warn('html2canvas capture warning:', err);
    }
  }

  // If visual capture succeeded, put the visual screen capture on Page 1
  if (capturedCanvas) {
    const imgData = capturedCanvas.toDataURL('image/png');
    const imgWidth = pageWidth - 16; // 8mm margin each side
    const imgHeight = (capturedCanvas.height * imgWidth) / capturedCanvas.width;

    // Header banner on Page 1
    pdf.setFillColor(37, 99, 235); // #2563eb
    pdf.rect(0, 0, pageWidth, 16, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${fieldTitle} — 8 TIMES (40 VAGAS) | ${totalAssigned}/40 Escalados`, 10, 10.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Líder: ${teamLeaderName}  |  Alvo: ${targetObjective}  |  Gerado em: ${dateStr} às ${timeStr}`, pageWidth - 10, 10.5, { align: 'right' });

    // Center image vertically in available space or scale to fit
    const availableHeight = pageHeight - 20;
    const finalHeight = Math.min(imgHeight, availableHeight);
    const finalWidth = (capturedCanvas.width * finalHeight) / capturedCanvas.height;
    const posX = (pageWidth - finalWidth) / 2;
    const posY = 18;

    pdf.addImage(imgData, 'PNG', posX, posY, finalWidth, finalHeight);

    // Add Page 2 for Detailed Formatted Table
    pdf.addPage('a4', 'landscape');
  }

  // PAGE: Structured, crisp vector table of the 8 teams + class counters
  // Header
  pdf.setFillColor(30, 64, 175); // Dark blue
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${fieldTitle} — LISTA GERAL DE ESCALAÇÃO (40 VAGAS)`, 10, 12);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Líder: ${teamLeaderName}   |   Alvo: ${targetObjective}   |   Escalados: ${totalAssigned}/40   |   Data: ${dateStr} ${timeStr}`, 10, 17);

  // 8 Teams Grid Layout on PDF
  const marginX = 10;
  const startY = 26;
  const colWidth = 33; // 8 * 33 = 264mm + 7*1.5 spacing = ~275mm
  const colGap = 2;
  const rowHeight = 7.2;

  teams.forEach((slots, tIdx) => {
    const x = marginX + tIdx * (colWidth + colGap);
    let y = startY;

    // Team Header Box
    pdf.setFillColor(37, 99, 235);
    pdf.roundedRect(x, y, colWidth, 7, 1, 1, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    const filledCount = slots.filter(Boolean).length;
    pdf.text(`TIME ${tIdx + 1} (${filledCount}/5)`, x + colWidth / 2, y + 4.8, { align: 'center' });

    y += 8.5;

    // 5 Slots
    slots.forEach((p, sIdx) => {
      // Slot container
      if (p) {
        // Role color bar / background
        pdf.setFillColor(245, 248, 255);
        pdf.setDrawColor(191, 219, 254);
        pdf.roundedRect(x, y, colWidth, rowHeight, 1, 1, 'FD');

        // Player Name
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        pdf.setTextColor(15, 23, 42);
        const leaderPrefix = p.isLeader ? '★ ' : '';
        const displayName = `${leaderPrefix}${sIdx + 1}. ${p.name}`;
        pdf.text(displayName.slice(0, 18), x + 1.5, y + 2.8);

        // Job Class & Role
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.8);
        pdf.setTextColor(71, 85, 105);
        const shortClass = p.jobClass.split('/')[0].trim();
        pdf.text(`${shortClass} (${p.role})`, x + 1.5, y + 5.2);

        // Progression stats if present
        const pwr = p.power !== undefined ? p.power : p.powerAndGlory;
        if (p.featherLevel !== undefined || pwr !== undefined || p.glory !== undefined || p.mountLevel !== undefined) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(4.8);
          pdf.setTextColor(2, 132, 199);
          const parts: string[] = [];
          if (p.featherLevel !== undefined) parts.push(`Pen:${p.featherLevel}`);
          if (pwr !== undefined) parts.push(`Pod:${pwr}`);
          if (p.glory !== undefined) parts.push(`Gló:${p.glory}`);
          if (p.mountLevel !== undefined) parts.push(`M:${p.mountLevel}`);
          pdf.text(parts.join(' | ').slice(0, 24), x + 1.5, y + 7.4);
        }
      } else {
        // Empty slot
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(x, y, colWidth, rowHeight, 1, 1, 'FD');

        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`${sIdx + 1}. [Vago]`, x + 2, y + 4.5);
      }

      y += rowHeight + 1.2;
    });

    // Class breakdown for this team
    const classCounts: Record<string, number> = {};
    slots.forEach((p) => {
      if (p) {
        const short = p.jobClass.split('/')[0].trim();
        classCounts[short] = (classCounts[short] || 0) + 1;
      }
    });

    const entries = Object.entries(classCounts);
    pdf.setFillColor(240, 249, 255);
    pdf.setDrawColor(186, 230, 253);
    const boxH = Math.max(16, 6 + entries.length * 3.5);
    pdf.roundedRect(x, y + 1, colWidth, boxH, 1, 1, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(3, 105, 161);
    pdf.text(`Classes T${tIdx + 1}:`, x + 1.5, y + 4.5);

    let cy = y + 8;
    if (entries.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(6);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Sem jogadores', x + 2, cy);
    } else {
      entries.slice(0, 5).forEach(([cName, cCount]) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.2);
        pdf.setTextColor(51, 65, 85);
        pdf.text(cName.slice(0, 14), x + 2, cy);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`x${cCount}`, x + colWidth - 2, cy, { align: 'right' });
        cy += 3.3;
      });
    }
  });

  // Bottom Summary on Page 2: Role and Class totals
  const roleTotals = { Tank: 0, Healer: 0, DPS: 0, Suporte: 0 };
  const allClassTotals: Record<string, number> = {};
  teams.flat().forEach((p) => {
    if (p) {
      if (p.role in roleTotals) {
        roleTotals[p.role as keyof typeof roleTotals] += 1;
      }
      const short = p.jobClass.split('/')[0].trim();
      allClassTotals[short] = (allClassTotals[short] || 0) + 1;
    }
  });

  const bottomY = 158;
  pdf.setFillColor(239, 246, 255);
  pdf.setDrawColor(191, 219, 254);
  pdf.roundedRect(10, bottomY, pageWidth - 20, 42, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 58, 138);
  pdf.text('RESUMO GERAL DAS CLASSES E FUNÇÕES', 14, bottomY + 6);

  // Role badges
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text(
    `Total: ${totalAssigned}/40 Vagas  |  🛡️ Tanks: ${roleTotals.Tank}   |   💚 Healers: ${roleTotals.Healer}   |   ⚔️ DPS: ${roleTotals.DPS}   |   ✨ Suporte: ${roleTotals.Suporte}`,
    14,
    bottomY + 12
  );

  // All active classes badges
  const classList = Object.entries(allClassTotals).sort((a, b) => b[1] - a[1]);
  let cx = 14;
  let cy = bottomY + 18;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);

  classList.forEach(([clsName, clsCount]) => {
    const text = `${clsName}: ${clsCount}`;
    const txtWidth = pdf.getTextWidth(text) + 6;

    if (cx + txtWidth > pageWidth - 16) {
      cx = 14;
      cy += 5.5;
    }

    if (cy < bottomY + 38) {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(186, 230, 253);
      pdf.roundedRect(cx, cy - 3.5, txtWidth, 4.5, 1, 1, 'FD');
      pdf.setTextColor(3, 105, 161);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, cx + 3, cy);
      cx += txtWidth + 2.5;
    }
  });

  // Footer note
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Documento gerado automaticamente pelo Sistema de Raide Ragnarok · ${fieldTitle} · Página 1/2`,
    pageWidth / 2,
    pageHeight - 4,
    { align: 'center' }
  );

  // ----------------------------------------------------
  // PAGE 2: TABELA DETALHADA DOS JOGADORES COM ATRIBUTOS
  // ----------------------------------------------------
  pdf.addPage([297, 210], 'landscape');

  // Background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header Banner
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 20, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${fieldTitle} — TABELA DETALHADA DE ATRIBUTOS`, 14, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Líder: ${teamLeaderName}   |   Alvo: ${targetObjective}   |   Vagas Ocupadas: ${totalAssigned}/40`,
    14,
    16.5
  );

  // Two tables side by side:
  // Left: Times 1 a 4 (20 slots)
  // Right: Times 5 a 8 (20 slots)
  const drawSubTable = (startX: number, startTeamIdx: number, endTeamIdx: number) => {
    const tableWidth = 132;
    let tableY = 26;

    // Table Header
    pdf.setFillColor(30, 58, 138);
    pdf.roundedRect(startX, tableY, tableWidth, 7, 1, 1, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);

    pdf.text('Time', startX + 1.5, tableY + 4.8);
    pdf.text('Nick', startX + 14, tableY + 4.8);
    pdf.text('Classe', startX + 40, tableY + 4.8);
    pdf.text('Penas', startX + 70, tableY + 4.8);
    pdf.text('Poder', startX + 84, tableY + 4.8);
    pdf.text('Glória', startX + 100, tableY + 4.8);
    pdf.text('Montaria', startX + 116, tableY + 4.8);

    tableY += 7;

    for (let t = startTeamIdx; t <= endTeamIdx; t++) {
      const teamSlots = teams[t] || [];
      teamSlots.forEach((p, sIdx) => {
        const isEven = (t * 5 + sIdx) % 2 === 0;
        pdf.setFillColor(isEven ? 255 : 241, isEven ? 255 : 245, isEven ? 255 : 249);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(startX, tableY, tableWidth, 6.2, 'FD');

        if (p) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(30, 58, 138);
          pdf.text(`T${t + 1}·V${sIdx + 1}`, startX + 1.5, tableY + 4.2);

          pdf.setTextColor(15, 23, 42);
          const lead = p.isLeader ? '★ ' : '';
          pdf.text(`${lead}${p.name}`.slice(0, 14), startX + 14, tableY + 4.2);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.8);
          pdf.setTextColor(71, 85, 105);
          pdf.text(p.jobClass.split('/')[0].trim().slice(0, 14), startX + 40, tableY + 4.2);

          // Penas
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(2, 132, 199);
          pdf.text(p.featherLevel !== undefined ? String(p.featherLevel) : '-', startX + 70, tableY + 4.2);

          // Poder
          pdf.setTextColor(180, 83, 9);
          const pwr = p.power !== undefined ? p.power : p.powerAndGlory;
          pdf.text(pwr !== undefined ? String(pwr).slice(0, 8) : '-', startX + 84, tableY + 4.2);

          // Glória
          pdf.setTextColor(126, 34, 206);
          pdf.text(p.glory !== undefined ? String(p.glory).slice(0, 8) : '-', startX + 100, tableY + 4.2);

          // Montaria
          pdf.setTextColor(4, 120, 87);
          pdf.text(p.mountLevel !== undefined ? String(p.mountLevel) : '-', startX + 116, tableY + 4.2);
        } else {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(6.8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`T${t + 1}·V${sIdx + 1}`, startX + 1.5, tableY + 4.2);
          pdf.text('[Vaga Livre]', startX + 14, tableY + 4.2);
          pdf.text('-', startX + 40, tableY + 4.2);
          pdf.text('-', startX + 70, tableY + 4.2);
          pdf.text('-', startX + 84, tableY + 4.2);
          pdf.text('-', startX + 100, tableY + 4.2);
          pdf.text('-', startX + 116, tableY + 4.2);
        }

        tableY += 6.2;
      });
    }
  };

  drawSubTable(12, 0, 3);
  drawSubTable(152, 4, 7);

  // Footer note page 2
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Relatório de Atributos de Raide: Nível de Penas, Poder, Glória, Nível da Montaria · Página 2/2`,
    pageWidth / 2,
    pageHeight - 4,
    { align: 'center' }
  );

  // Save the PDF
  const safeLeader = teamLeaderName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeTitle = fieldTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${safeTitle}_${safeLeader}_40_Vagas.pdf`);
}
