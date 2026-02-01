import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const createPDF = (transactions, stats, userProfile, filterLabel) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  const ORANGE = [249, 115, 22];
  const GRAY = [75, 85, 99];
  const LIGHT_GRAY = [229, 231, 235];

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 4, 'F');

  doc.setFontSize(22);
  doc.setTextColor(...ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.text("Orange Finance", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text("Financial Intelligence Report", 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 31);
  doc.text(`Period: ${filterLabel}`, 14, 36);

  if (userProfile?.user_metadata?.full_name) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(userProfile.user_metadata.full_name, pageWidth - 14, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text(userProfile.email || '', pageWidth - 14, 26, { align: 'right' });
  }

  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(14, 42, pageWidth - 14, 42);

  let yPos = 55;
  const cardWidth = (pageWidth - 28 - 10) / 3;
  const cardHeight = 25;

  const drawCard = (x, title, value, color) => {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(title.toUpperCase(), x + 5, yPos + 8);
    doc.setFontSize(14);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs ${value.toLocaleString()}`, x + 5, yPos + 18);
  };

  drawCard(14, 'Income', stats.income, [16, 185, 129]);
  drawCard(14 + cardWidth + 5, 'Expense', stats.expense, [239, 68, 68]);
  drawCard(14 + (cardWidth + 5) * 2, 'Net Balance', stats.balance, [249, 115, 22]);

  yPos += 40;
  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.title,
    t.category,
    t.type.toUpperCase(),
    `Rs ${t.amount.toLocaleString()}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: ORANGE, textColor: 255 },
    columnStyles: { 0: { cellWidth: 30 }, 3: { cellWidth: 25, halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 3) {
        data.cell.styles.textColor = data.cell.raw === 'INCOME' ? [16, 185, 129] : [239, 68, 68];
      }
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Fin - Secure Personal Finance Tracker • fin.swinfosystems.online', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  return doc;
};

export const generateFinancialReport = (transactions, stats, userProfile, filterLabel) => {
  const doc = createPDF(transactions, stats, userProfile, filterLabel);
  doc.save(`Fin_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const getPDFFile = (transactions, stats, userProfile, filterLabel) => {
  const doc = createPDF(transactions, stats, userProfile, filterLabel);
  const blob = doc.output('blob');
  return new File([blob], `Financial_Report_${Date.now()}.pdf`, { type: 'application/pdf' });
};

export const getCalcPDFFile = (title, data, result, userProfile) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const ORANGE = [249, 115, 22];

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 4, 'F');

  doc.setFontSize(22);
  doc.setTextColor(...ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.text("Orange Finance", 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(50);
  doc.text(`${title} Analysis`, 14, 32);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated for: ${userProfile?.user_metadata?.full_name || userProfile?.email}`, 14, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45);

  doc.autoTable({
    startY: 55,
    head: [['Field', 'Value']],
    body: [
      ['Investment Amount', `Rs ${parseFloat(data.amount).toLocaleString()}`],
      ['Duration', `${data.duration} Years`],
      ['Expected Return', `${data.rate || '7.1'}%`],
      ['', ''],
      ['Total Invested', `Rs ${Math.round(result.invested).toLocaleString()}`],
      ['Wealth Created', `Rs ${Math.round(result.returns).toLocaleString()}`],
      ['Estimated Tax', `Rs ${Math.round(result.tax).toLocaleString()}`],
      ['Net Maturity Value', `Rs ${Math.round(result.netTotal).toLocaleString()}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: ORANGE },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { halign: 'right' } }
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Verified by Orange Finance • fin.swinfosystems.online', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

  const blob = doc.output('blob');
  return new File([blob], `${title.replace(/\s+/g, '_')}_Result.pdf`, { type: 'application/pdf' });
};
