const { jsPDF } = require('jspdf'); // Node adapter needed usually? jsPDF works in node now with limitations
require('jspdf-autotable'); // This might need global.window hack in node

// Polyfill for jspdf in node if needed, but modern jspdf has better node support.
// However, autotable relies on DOM sometimes. 
// A common workaround is:
// global.window = { document: { createElementNS: () => { return {} } } };
// global.navigator = {};
// But let's try standard import first. "jspdf" generic export.

exports.generatePDF = async (req, res) => {
    // NOTE: Server-side PDF generation with jsPDF+AutoTable in pure Node can be flaky due to DOM dependencies.
    // We will attempt standard usage. If it fails, we might need a headless browser or pdfkit.
    // For this demo, we assume the environment supports it or we use a basic layout.

    // Implementation note: jsPDF 2.5+ has partial Node support but AutoTable is primarily clientside.
    // Verification Strategy: If this endpoint issues errors, we will fallback to a simpler PDF or advise client-side gen.
    // BUT the user asked for this endpoint.

    try {
        const { formData, extractedData } = req.body;

        // Polyfill attempt if needed
        if (typeof window === 'undefined') {
            global.window = {
                document: {
                    createElementNS: () => { return {} }
                }
            };
            global.navigator = {};
        }

        const doc = new jsPDF();

        // HEADING
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION A: GENERAL DISCLOSURES', 105, 20, { align: 'center' });

        // I. Details of the listed entity
        doc.setFontSize(12);
        doc.text('I. Details of the listed entity', 14, 35);

        const entityRows = [
            ['1. Corporate Identity Number (CIN) of the Listed Entity', formData.cin || '-'],
            ['2. Name of the Listed Entity', formData.entityName || '-'],
            ['3. Year of incorporation', formData.incorporationYear || '-'],
        ];

        doc.autoTable({
            startY: 40,
            head: [['Field', 'Details']],
            body: entityRows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            columnStyles: { 0: { cellWidth: 80 } },
            margin: { left: 14, right: 14 }
        });

        let finalY = doc.lastAutoTable.finalY + 15;

        // II. Products/services
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('II. Products/services', 14, finalY);
        finalY += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('14. Details of business activities (accounting for 90% of turnover):', 14, finalY);
        finalY += 5;

        // Table 14
        const table14Data = extractedData.table14 || [];
        const table14Rows = table14Data.map(item => [
            item.mainActivity || '-',
            item.description || '-',
            (item.turnoverPercentage || 0) + '%'
        ]);

        if (table14Rows.length === 0) table14Rows.push(['No data', '-', '-']);

        doc.autoTable({
            startY: finalY,
            head: [['S.No.', 'Main Activity', 'Description of Business Activity', '% of Turnover']],
            body: table14Rows.map((row, index) => [index + 1, ...row]),
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] },
            margin: { left: 14, right: 14 }
        });

        finalY = doc.lastAutoTable.finalY + 15;

        // Table 15
        doc.text('15. Products/Services sold by the entity (accounting for 90% of turnover):', 14, finalY);
        finalY += 5;

        const table15Data = extractedData.table15 || [];
        const table15Rows = table15Data.map(item => [
            item.productService || '-',
            item.nicCode || '-',
            (item.turnoverPercentage || 0) + '%'
        ]);

        if (table15Rows.length === 0) table15Rows.push(['No data', '-', '-']);

        doc.autoTable({
            startY: finalY,
            head: [['S.No.', 'Product/Service', 'NIC Code', '% of Total Turnover']],
            body: table15Rows.map((row, index) => [index + 1, ...row]),
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] },
            margin: { left: 14, right: 14 }
        });

        // Output as buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=BRSR_Section_A.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error("PDF Gen Error:", error);
        res.status(500).json({ error: 'PDF Generation failed' });
    }
};
