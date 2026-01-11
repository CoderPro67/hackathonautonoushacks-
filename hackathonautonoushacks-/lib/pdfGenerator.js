import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (formData, extractedData) => {
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

    autoTable(doc, {
        startY: 40,
        head: [['Field', 'Details']],
        body: entityRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: { 0: { cellWidth: 80 } }, // Give first column fixed width
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

    if (table14Rows.length === 0) {
        table14Rows.push(['No data extracted', '-', '-']);
    }

    autoTable(doc, {
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

    if (table15Rows.length === 0) {
        table15Rows.push(['No data extracted', '-', '-']);
    }

    autoTable(doc, {
        startY: finalY,
        head: [['S.No.', 'Product/Service', 'NIC Code', '% of Total Turnover']],
        body: table15Rows.map((row, index) => [index + 1, ...row]),
        theme: 'striped',
        headStyles: { fillColor: [52, 73, 94] },
        margin: { left: 14, right: 14 }
    });

    doc.save('BRSR_Section_A.pdf');
};
