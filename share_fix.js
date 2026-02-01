// Replace the handleShare function in App.jsx with this:

const handleShare = async (calcTitle = null, calcData = null, calcResult = null) => {
    setIsSharing(true);
    const isCalc = !!calcTitle;
    const filterLabel = isCalc ? calcTitle : (filterType === 'monthly' ? (filterMonth === 'all' ? t('all_time') : `${monthNames[filterMonth]} ${filterYear}`) : `${startDate} ${t('to')} ${endDate}`);

    // Give UI time to show loader and stabilize canvas if needed
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        let shareText = '';
        let pdfFile = null;

        if (isCalc) {
            shareText = `📊 ${calcTitle} Analysis Result\nVerified by Orange Finance: fin.swinfosystems.online`;
            pdfFile = getCalcPDFFile(calcTitle, calcData, calcResult, session.user);
        } else {
            shareText = `📈 Financial Report: ${filterLabel}\nVerified by Orange Finance: fin.swinfosystems.online`;
            pdfFile = getPDFFile(filteredTx, stats, session.user, filterLabel);
        }

        // Check if device supports file sharing (mobile devices)
        const canShareFiles = navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] });

        if (canShareFiles) {
            // MOBILE: Use native device share with PDF attachment
            try {
                await navigator.share({
                    files: [pdfFile],
                    title: isCalc ? `${calcTitle} Result` : `Financial Report - ${filterLabel}`,
                    text: shareText,
                });
                console.log('✅ Shared successfully via native share');
            } catch (shareErr) {
                if (shareErr.name === 'AbortError') {
                    console.log('User cancelled share');
                } else {
                    console.error('Native share failed:', shareErr);
                    // Fallback to text-only share
                    await navigator.share({
                        title: isCalc ? `${calcTitle} Result` : `Financial Report - ${filterLabel}`,
                        text: shareText + "\n\nVisit fin.swinfosystems.online to download PDF",
                    });
                }
            }
        } else {
            // DESKTOP: Download PDF first, then open email with instructions
            console.log('📧 Desktop mode: Downloading PDF and opening email');

            // Trigger PDF download
            const url = URL.createObjectURL(pdfFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Wait a moment for download to start
            await new Promise(resolve => setTimeout(resolve, 500));

            // Open email with instructions to attach the downloaded PDF
            const subject = isCalc ? `${t('calc_subject')}: ${calcTitle}` : `${t('financial_report_subject')}: ${filterLabel}`;
            const body = `${shareText}\n\n📎 Please attach the PDF file that was just downloaded to your computer.\n\nFile name: ${pdfFile.name}`;
            window.location.href = generateEmailLink(subject, body);
        }
    } catch (err) {
        console.error("Sharing failed:", err);

        // Final fallback: just download the PDF
        try {
            const pdfFile = isCalc
                ? getCalcPDFFile(calcTitle, calcData, calcResult, session.user)
                : getPDFFile(filteredTx, stats, session.user, filterLabel);

            const url = URL.createObjectURL(pdfFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert(t('pdf_downloaded') || 'PDF downloaded! You can now share it manually.');
        } catch (downloadErr) {
            console.error("Download failed:", downloadErr);
            alert(t('share_failed') || 'Sharing failed. Please try again.');
        }
    } finally {
        setIsSharing(false);
    }
};
