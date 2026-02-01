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

        // Make the print view visible and positioned for capture
        printElement.style.display = 'block';
        printElement.style.position = 'absolute';
        printElement.style.left = '0';
        printElement.style.top = '0';
        printElement.style.width = '210mm'; // A4 width
        printElement.style.zIndex = '-9999'; // Behind everything but visible for rendering

        // Wait for charts and images to fully render
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Capture the element as canvas with high quality
        const canvas = await html2canvas(printElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: printElement.scrollWidth,
            height: printElement.scrollHeight,
            windowWidth: printElement.scrollWidth,
            windowHeight: printElement.scrollHeight
        });

        // Hide the print view
        printElement.style.display = '';
        printElement.style.position = '';
        printElement.style.left = '';
        printElement.style.top = '';
        printElement.style.width = '';
        printElement.style.zIndex = '';

        // Create PDF from canvas
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate dimensions to fit A4 (accounting for 2x scale)
        const ratio = pdfWidth / (canvasWidth / 2);
        const imgWidth = pdfWidth;
        const imgHeight = (canvasHeight / 2) * ratio;

        // Handle multi-page PDF if content is too long
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

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
