import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures the premium print view and converts it to a high-quality PDF
 * This uses the same beautiful design as the Download PDF feature
 */
export const capturePrintViewAsPDF = async (fileName = 'Financial_Report.pdf') => {
    try {
        // Get the print view element
        const printElement = document.querySelector('.print-view');

        if (!printElement) {
            throw new Error('Print view not found');
        }

        // Make the print view visible temporarily
        const originalDisplay = printElement.style.display;
        printElement.style.display = 'block';

        // Wait for any images/charts to render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture the element as canvas with high quality
        const canvas = await html2canvas(printElement, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            windowHeight: printElement.scrollHeight
        });

        // Restore original display
        printElement.style.display = originalDisplay;

        // Create PDF from canvas
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

        // Return as File object for sharing
        const blob = pdf.output('blob');
        return new File([blob], fileName, { type: 'application/pdf' });

    } catch (error) {
        console.error('Error capturing print view:', error);
        throw error;
    }
};

/**
 * Captures calculator print view as PDF
 */
export const captureCalculatorAsPDF = async (calcTitle) => {
    const fileName = `${calcTitle.replace(/\s+/g, '_')}_Analysis.pdf`;
    return await capturePrintViewAsPDF(fileName);
};

/**
 * Captures financial report print view as PDF
 */
export const captureReportAsPDF = async (filterLabel) => {
    const fileName = `Financial_Report_${filterLabel.replace(/\s+/g, '_')}.pdf`;
    return await capturePrintViewAsPDF(fileName);
};
