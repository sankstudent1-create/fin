import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- CALCULATOR PDF ---
export const generateCalculatorPDF = (toolName, inputs, result) => {
    const doc = new jsPDF();
    const orange = [249, 115, 22];
    const gray = [75, 85, 99];

    // 1. Brand Header
    doc.setFillColor(...orange);
    doc.rect(0, 0, 210, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Fin", 14, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("by Swinfosystems", 24, 16);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${toolName} Report`, 140, 15, { align: 'left' });

    // 2. Info Section
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`Source: fin.swinfosystems.online`, 14, 40);

    // 3. Projections Snapshot (Cards Layout)
    doc.setFillColor(255, 247, 237); // Light orange bg
    doc.roundedRect(14, 50, 182, 35, 3, 3, 'F');
    doc.setDrawColor(...orange);
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);

    doc.setTextColor(...orange);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ESTIMATED PROJECTION", 20, 58);

    // Snapshot Values
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text("Total Invested", 20, 68);
    doc.text("Est. Returns", 80, 68);
    doc.text("Total Value", 140, 68);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rs ${Math.round(result.invested).toLocaleString()}`, 20, 78);
    doc.setTextColor(...orange);
    doc.text(`+ Rs ${Math.round(result.returns).toLocaleString()}`, 80, 78);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rs ${Math.round(result.total).toLocaleString()}`, 140, 78);

    // 4. Input Parameters Table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Calculation Parameters", 14, 100);

    const inputRows = Object.entries(inputs).map(([key, value]) => [
        key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
        value
    ]);

    autoTable(doc, {
        startY: 105,
        head: [['Parameter', 'Selected Value']],
        body: inputRows,
        theme: 'grid',
        headStyles: { fillColor: gray, fontSize: 10, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
        margin: { left: 14, right: 14 }
    });

    // 5. Disclaimer & Footer
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    const disclaimer = "Disclaimer: These calculations are based on the parameters provided and assume constant returns. Actual market returns may vary. This is an informational tool and not financial advice.";
    doc.text(doc.splitTextToSize(disclaimer, 180), 14, finalY);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, 280, 196, 280);
    doc.setFont("helvetica", "normal");
    doc.text("Orange Finance • Secure • Private • Efficient", 105, 287, { align: 'center' });

    doc.save(`${toolName.replace(/\s+/g, '_')}_Report.pdf`);
};

// --- EMAIL HELPER ---
export const generateEmailLink = (subject, body) => {
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
