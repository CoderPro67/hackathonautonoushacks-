import * as XLSX from 'xlsx';

// pdfjs-dist is large and can cause issues during server-side build.
// We only need it on the client side for parsing files.

export const parseDocument = async (file) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        return await parsePDF(file);
    } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
    ) {
        return await parseExcel(file);
    } else {
        throw new Error('Unsupported file format');
    }
};

const parsePDF = async (file) => {
    try {
        // Dynamic import to avoid build-time issues
        const pdfjsLib = await import('pdfjs-dist');

        if (typeof window !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 50);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        return fullText;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF. ' + error.message);
    }
};

const parseExcel = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        let fullText = '';

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            fullText += `--- Sheet: ${sheetName} ---\n`;
            jsonData.forEach(row => {
                fullText += row.join(' ') + '\n';
            });
            fullText += '\n';
        });

        return fullText;
    } catch (error) {
        console.error('Error parsing Excel:', error);
        throw new Error('Failed to extract text from Excel. ' + error.message);
    }
};
