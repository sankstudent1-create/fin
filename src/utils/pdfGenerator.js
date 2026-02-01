import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateFinancialReport = (transactions, stats, userProfile, filterLabel) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // -- Colors --
  const ORANGE = [249, 115, 22]; // #f97316
  const GRAY = [75, 85, 99];     // #4b5563
  const LIGHT_GRAY = [229, 231, 235];

  // -- Header --
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 4, 'F'); // Top orange bar

  // Title
  doc.setFontSize(22);
  doc.setTextColor(...ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.text("Orange Finance", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text("Financial Report", 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 31);
  doc.text(`Period: ${filterLabel}`, 14, 36);

  // User Info (Right aligned)
  if (userProfile?.user_metadata?.full_name) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(userProfile.user_metadata.full_name, pageWidth - 14, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text(userProfile.email || '', pageWidth - 14, 26, { align: 'right' });
  }

  // Draw Line
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(14, 42, pageWidth - 14, 42);

  // -- Summary Cards --
  let yPos = 55;
  const cardWidth = (pageWidth - 28 - 10) / 3; // 3 cards with 10mm gap total (5+5)
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

  drawCard(14, 'Income', stats.income, [16, 185, 129]); // Green
  drawCard(14 + cardWidth + 5, 'Expense', stats.expense, [239, 68, 68]); // Red
  drawCard(14 + (cardWidth + 5) * 2, 'Net Balance', stats.balance, [249, 115, 22]); // Orange

  // -- Chart Placeholder (Optional text for now) --
  // Note: jspdf doesn't easily convert DOM charts to image without html2canvas, 
  // which can be heavy. We will stick to data tables for clarity in this version.

  // -- Transactions Table --
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
    columnStyles: {
      0: { cellWidth: 30 },
      3: { cellWidth: 25, halign: 'center' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === 'INCOME') {
                data.cell.styles.textColor = [16, 185, 129];
            } else {
                data.cell.styles.textColor = [239, 68, 68];
            }
        }
    }
  });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Fin - Secure Personal Finance Tracker', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  doc.save(`Fin_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
