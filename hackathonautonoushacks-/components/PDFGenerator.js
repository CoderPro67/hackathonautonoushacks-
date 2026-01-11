import React from 'react';
import { Download, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PDFGenerator({ onGenerate, isReady, isGenerating, error }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate Compliance Report</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
                Review your data above. Once ready, click the button below to generate the Section A PDF.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            <button
                onClick={onGenerate}
                disabled={!isReady || isGenerating}
                className={`
          flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-lg shadow-lg transition-all
          ${isReady
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
        `}
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Verify generatePDF
                    </>
                )}
            </button>

            {!isReady && !error && (
                <p className="mt-4 text-sm text-orange-500 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    Please complete the form and extract data first
                </p>
            )}
        </div>
    );
}
