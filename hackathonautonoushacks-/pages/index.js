import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FileText, Shield, Sparkles } from 'lucide-react';
import EntityForm from '../components/EntityForm';
import FileUpload from '../components/FileUpload';
import PDFGenerator from '../components/PDFGenerator';
import { parseDocument } from '../lib/documentParser';
import { extractDataFromText } from '../lib/geminiExtractor';
import { generatePDF } from '../lib/pdfGenerator';

export default function Home() {
    const router = useRouter();
    const [formData, setFormData] = useState({});
    const [extractedData, setExtractedData] = useState({ table14: [], table15: [] });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [userApiKey, setUserApiKey] = useState('');
    const [error, setError] = useState(null);

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) {
            setError(null);
            setExtractedData({ table14: [], table15: [] });
            return;
        }

        setIsProcessing(true);
        setError(null);
        let allTable14 = [];
        let allTable15 = [];

        try {
            for (const file of files) {
                const text = await parseDocument(file);
                // Pass the userApiKey if present
                const data = await extractDataFromText(text, userApiKey);

                if (data.table14) allTable14 = [...allTable14, ...data.table14];
                if (data.table15) allTable15 = [...allTable15, ...data.table15];

                // Add a smart delay between files to avoid rate limits (Quota: ~5 RPM)
                // If there are more files to process, wait 12 seconds.
                if (files.indexOf(file) < files.length - 1) {
                    console.log("Waiting to respect API rate limits...");
                    await new Promise(resolve => setTimeout(resolve, 12000));
                }
            }

            setExtractedData({ table14: allTable14, table15: allTable15 });
        } catch (err) {
            console.error(err);
            if (err.message.includes('API Key')) {
                setShowSettings(true); // Auto-open settings if key error
            }
            setError(err.message || 'Failed to process documents');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGeneratePDF = () => {
        try {
            // Save state for verification
            const sessionData = { formData, extractedData, userApiKey };
            sessionStorage.setItem('brsrData', JSON.stringify(sessionData));

            // Redirect to CA Verification
            router.push('/verification');
        } catch (err) {
            console.error(err);
            setError('Failed to initiate verification');
        }
    };

    const loadSampleData = () => {
        setFormData({
            cin: 'L12345MH2023PLC123456',
            entityName: 'Acme Sustainable Solutions Ltd.',
            incorporationYear: '2010',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
            <Head>
                <title>BRSR Generator | AI-Powered Compliance</title>
                <meta name="description" content="Generate BRSR Section A reports with Gemini AI" />
            </Head>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="text-blue-600" />
                            API Configuration
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            If the server API key is missing, please enter your Google Gemini API Key below.
                            It will be used only for this session.
                        </p>
                        <input
                            type="password"
                            placeholder="Enter Gemini API Key (AIza...)"
                            value={userApiKey}
                            onChange={(e) => setUserApiKey(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Shield size={20} />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            AutoComplainceMate
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <Shield size={14} />
                            API Config
                        </button>
                        <button
                            onClick={loadSampleData}
                            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            Load Sample Data
                        </button>
                        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                            <Sparkles size={12} />
                            <span></span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Introduction */}
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">AutoComplainceMate</h2>
                        <p className="text-gray-500">
                            Seamlessly extract business activity data from your Annual Reports and generate compliance ready documents instantly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Entity Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <EntityForm formData={formData} setFormData={setFormData} />
                        </div>

                        {/* Right Column: Upload & Generate */}
                        <div className="space-y-6 sticky top-24 self-start">
                            <FileUpload
                                onFileSelect={handleFileSelect}
                                isProcessing={isProcessing}
                            />

                            {/* Extraction Preview (Optional, showing status) */}
                            {extractedData.table14.length > 0 && (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-700">
                                    <p className="font-semibold flex items-center gap-2">
                                        <Shield size={16} />
                                        Data Extracted Successfully
                                    </p>
                                    <p className="text-sm mt-1 opacity-80">
                                        Found {extractedData.table14.length} business activities and {extractedData.table15.length} products.
                                    </p>
                                </div>
                            )}

                            <PDFGenerator
                                onGenerate={handleGeneratePDF}
                                isReady={Object.keys(formData).length > 2 && (extractedData.table14.length > 0 || extractedData.table15.length > 0)}
                                isGenerating={false}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
