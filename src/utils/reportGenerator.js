import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- BRAND COLORS ---
const ORANGE = [249, 115, 22];
const SLATE_900 = [15, 23, 42];
const SLATE_700 = [51, 65, 85];
const SLATE_500 = [100, 116, 139];
const SLATE_200 = [226, 232, 240];
const EMERALD = [16, 185, 129];
const ROSE = [244, 63, 94];
const WHITE = [255, 255, 255];

// --- CALCULATOR PDF (Premium Design) ---
export const generateCalculatorPDF = (toolName, inputs, result) => {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.width;
    const height = doc.internal.pageSize.height;

    // ===== TOP ACCENT BAR =====
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, width, 5, 'F');

    // ===== LEFT SIDEBAR ACCENT =====
    doc.setFillColor(...SLATE_900);
    doc.rect(0, 5, 6, height - 5, 'F');

    // ===== BRANDING HEADER =====
    doc.setFontSize(26);
    doc.setTextColor(...SLATE_900);
    doc.setFont('helvetica', 'bold');
    doc.text('Orange Finance', 18, 25);

    doc.setFontSize(10);
    doc.setTextColor(...ORANGE);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCIAL INTELLIGENCE REPORT', 18, 32);

    // Report type badge
    doc.setFillColor(...SLATE_900);
    doc.roundedRect(width - 72, 14, 58, 16, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.text('FY 2025-26', width - 68, 24);

    // Divider
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.5);
    doc.line(18, 40, width - 14, 40);

    // ===== REPORT TITLE =====
    doc.setFontSize(20);
    doc.setTextColor(...SLATE_900);
    doc.setFont('helvetica', 'bold');
    doc.text(`${toolName} Analysis`, 18, 55);

    doc.setFontSize(9);
    doc.setTextColor(...SLATE_500);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}  •  Source: fin.swinfosystems.online`, 18, 62);

    // ===== RESULTS HERO SECTION =====
    // Background card
    doc.setFillColor(255, 247, 237); // orange-50
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, 70, width - 28, 52, 4, 4, 'FD');

    // Section title
    doc.setFontSize(8);
    doc.setTextColor(...ORANGE);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECTION SUMMARY', 24, 82);

    // Three key metrics in a row
    const colWidth = (width - 56) / 3;

    // Metric 1: Total Invested
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_500);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Invested', 24, 92);
    doc.setFontSize(16);
    doc.setTextColor(...SLATE_900);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${Math.round(result.invested).toLocaleString()}`, 24, 101);

    // Metric 2: Estimated Returns
    const col2X = 24 + colWidth;
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_500);
    doc.setFont('helvetica', 'normal');
    doc.text('Est. Returns', col2X, 92);
    doc.setFontSize(16);
    doc.setTextColor(...EMERALD);
    doc.setFont('helvetica', 'bold');
    doc.text(`+ Rs. ${Math.round(result.returns).toLocaleString()}`, col2X, 101);

    // Metric 3: Maturity Value
    const col3X = col2X + colWidth;
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_500);
    doc.setFont('helvetica', 'normal');
    doc.text('Net Maturity Value', col3X, 92);
    doc.setFontSize(16);
    doc.setTextColor(...SLATE_900);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${Math.round(result.netTotal || result.total || 0).toLocaleString()}`, col3X, 101);

    // Tax Row (below metrics, within the card)
    doc.setFontSize(9);
    doc.setTextColor(...ROSE);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estimated Tax: Rs. ${Math.round(result.tax || 0).toLocaleString()}`, 24, 114);

    const returnPercent = result.invested > 0 ? ((result.returns / result.invested) * 100).toFixed(1) : '0';
    doc.setTextColor(...EMERALD);
    doc.text(`Total Growth: ${returnPercent}%`, col2X, 114);

    // ===== INPUT PARAMETERS TABLE =====
    let yPos = 135;
    doc.setFontSize(12);
    doc.setTextColor(...SLATE_900);
    doc.setFont('helvetica', 'bold');
    doc.text('Calculation Parameters', 18, yPos);

    // Small underline accent
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(1.5);
    doc.line(18, yPos + 2, 65, yPos + 2);

    const inputRows = Object.entries(inputs).map(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        return [label, String(value)];
    });

    autoTable(doc, {
        startY: yPos + 8,
        margin: { left: 18, right: 14 },
        head: [['Parameter', 'Value']],
        body: inputRows,
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: { top: 4, bottom: 4, left: 8, right: 8 },
            textColor: SLATE_700,
        },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: SLATE_900,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 5, bottom: 5, left: 8, right: 8 },
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 65, textColor: SLATE_900 },
            1: { halign: 'right' }
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === data.table.columns.length - 1) {
                doc.setDrawColor(240, 240, 240);
                doc.line(
                    data.table.settings.margin.left,
                    data.cell.y + data.cell.height,
                    width - data.table.settings.margin.right,
                    data.cell.y + data.cell.height
                );
            }
        }
    });

    // ===== YEAR-WISE PROJECTIONS =====
    if (result.projections && result.projections.length > 0) {
        yPos = (doc.lastAutoTable?.finalY || 200) + 16;

        if (yPos > height - 80) {
            doc.addPage();
            yPos = 30;
            // Re-draw sidebar accent on new page
            doc.setFillColor(...SLATE_900);
            doc.rect(0, 0, 6, height, 'F');
        }

        doc.setFontSize(12);
        doc.setTextColor(...SLATE_900);
        doc.setFont('helvetica', 'bold');
        doc.text('Growth Projection (Year-wise)', 18, yPos);
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(1.5);
        doc.line(18, yPos + 2, 75, yPos + 2);

        const projData = result.projections.map(p => [
            `Year ${p.year}`,
            `Rs. ${Math.round(p.invested).toLocaleString()}`,
            `Rs. ${Math.round(p.total - p.invested).toLocaleString()}`,
            `Rs. ${Math.round(p.total).toLocaleString()}`,
            p.invested > 0 ? `+${(((p.total - p.invested) / p.invested) * 100).toFixed(1)}%` : '-'
        ]);

        autoTable(doc, {
            startY: yPos + 8,
            margin: { left: 18, right: 14 },
            head: [['Period', 'Invested', 'Returns', 'Total Value', 'Growth']],
            body: projData,
            theme: 'striped',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: SLATE_900, textColor: WHITE, fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { fontStyle: 'bold' },
                2: { textColor: EMERALD },
                4: { textColor: EMERALD, fontStyle: 'bold', halign: 'right' }
            }
        });
    }

    // ===== DISCLAIMER =====
    const lastY = doc.lastAutoTable?.finalY || 200;
    let disclaimerY = lastY + 20;

    if (disclaimerY > height - 50) {
        doc.addPage();
        disclaimerY = 30;
        doc.setFillColor(...SLATE_900);
        doc.rect(0, 0, 6, height, 'F');
    }

    // Disclaimer box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, disclaimerY - 4, width - 28, 28, 3, 3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...SLATE_500);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Disclaimer: These calculations are based on the parameters provided and assume constant returns. Tax calculations follow FY 2025-26 Indian IT Act rules. Actual market returns and tax liability may vary based on your income slab and applicable surcharges. This is an informational tool and not financial/tax advice. Past performance does not guarantee future results.';
    const splitText = doc.splitTextToSize(disclaimer, width - 42);
    doc.text(splitText, 20, disclaimerY + 2);

    // ===== FOOTER (all pages) =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(...SLATE_200);
        doc.setLineWidth(0.3);
        doc.line(18, height - 18, width - 14, height - 18);

        // Footer text
        doc.setFontSize(7);
        doc.setTextColor(...SLATE_500);
        doc.setFont('helvetica', 'normal');
        doc.text('Orange Finance • Secure Financial Intelligence • fin.swinfosystems.online', 18, height - 12);
        doc.text(`Page ${i} of ${pageCount}`, width - 14, height - 12, { align: 'right' });
    }

    doc.save(`${toolName.replace(/\s+/g, '_')}_Report.pdf`);
};

// --- EMAIL HELPER ---
export const generateEmailLink = (subject, body) => {
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
