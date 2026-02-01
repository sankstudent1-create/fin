import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures the premium print view and converts it to a high-quality PDF
 */
export const capturePrintViewAsPDF = async (fileName = 'Financial_Report.pdf') => {
    try {
        const printElement = document.querySelector('.print-view');

        if (!printElement) throw new Error('Print view element not found');

        // Ensure we are at the top for capture
        window.scrollTo(0, 0);

        // Wait for components (especially charts) to layout and render
        // Use a long timeout to ensure complete rendering
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Measure the element
        const rect = printElement.getBoundingClientRect();
        const width = rect.width || 794; // Fallback to A4 width at 96dpi
        const height = rect.height;

        if (!height || height < 10) {
            throw new Error(`Print view has invalid height: ${height}. Ensure content is rendered.`);
        }

        const canvas = await html2canvas(printElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            windowWidth: width,
            windowHeight: height,
            allowTaint: true,
            onclone: (clonedDoc) => {
                // You can modify the cloned DOM here if needed
                const el = clonedDoc.querySelector('.print-view');
                if (el) {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                }
            }
        });

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        if (!canvasWidth || !canvasHeight) {
            throw new Error('Canvas capture resulted in zero dimensions');
        }

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

        // Calculate dimensions to fit A4 (accounting for 2x scale)
        const ratio = pdfWidth / (canvasWidth / 2);
        const imgWidth = pdfWidth;
        const imgHeight = (canvasHeight / 2) * ratio;

        // Check for NaN or Infinity
        if (!isFinite(imgWidth) || !isFinite(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
            throw new Error(`Invalid PDF dimensions: ${imgWidth}x${imgHeight}`);
        }

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        // Multi-page logic
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
        }

        const blob = pdf.output('blob');
        return new File([blob], fileName, { type: 'application/pdf' });

    } catch (error) {
        console.error('Error capturing print view:', error);
        throw error;
    }
};

export const captureCalculatorAsPDF = async (calcTitle) => {
    const fileName = `${calcTitle.replace(/\s+/g, '_')}_Analysis.pdf`;
    return await capturePrintViewAsPDF(fileName);
};

export const captureReportAsPDF = async (filterLabel) => {
    const fileName = `Financial_Report_${filterLabel.toString().replace(/\s+/g, '_')}.pdf`;
    return await capturePrintViewAsPDF(fileName);
};
