import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, AlertTriangle, FileCheck, Loader2, Download, ArrowLeft } from 'lucide-react';
import { verifyBRSRData } from '../lib/caVerifier';
import { generatePDF } from '../lib/pdfGenerator';

export default function Verification() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Retrieve data from storage
        const storedData = sessionStorage.getItem('brsrData');
        if (!storedData) {
            router.push('/');
            return;
        }

        const parsedData = JSON.parse(storedData);
        setData(parsedData);

        // Auto-start verification
        verifyData(parsedData);
    }, [router]);

    const verifyData = async ({ formData, extractedData, userApiKey }) => {
        try {
            const result = await verifyBRSRData(formData, extractedData, userApiKey);
            setVerificationResult(result);
        } catch (err) {
            console.error(err);
            setError('Audit Service Unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (data) {
            generatePDF(data.formData, data.extractedData);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Head>
                <title>CA Verification | BRSR Generator</title>
            </Head>

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Editor
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" />
                        CA Verification Module
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Auditing Document...</h2>
                        <p className="text-gray-500">Our AI Chartered Accountant is reviewing your BRSR filing for compliance.</p>
                    </div>
                ) : error ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                            Retry Audit
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Verdict Card */}
                        <div className={`p-8 rounded-xl shadow-sm border-l-4 ${verificationResult?.verificationStatus === 'VERIFIED'
                            ? 'bg-green-50 border-green-500'
                            : 'bg-orange-50 border-orange-500'
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${verificationResult?.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    {verificationResult?.verificationStatus === 'VERIFIED' ? <FileCheck size={32} /> : <AlertTriangle size={32} />}
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold mb-2 ${verificationResult?.verificationStatus === 'VERIFIED' ? 'text-green-800' : 'text-orange-800'
                                        }`}>
                                        {verificationResult?.verificationStatus === 'VERIFIED' ? 'Audit Status: VERIFIED' : 'Audit Status: NEEDS REVIEW'}
                                    </h2>
                                    <p className="text-gray-700 italic border-l-2 border-gray-300 pl-4 py-1 mb-4">
                                        "{verificationResult?.caNote}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-gray-500" />
                                Auditor's Observations
                            </h3>
                            {verificationResult?.auditorComments?.length > 0 ? (
                                <ul className="space-y-3">
                                    {verificationResult.auditorComments.map((comment, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                                            {comment}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No specific issues flagged.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Review Inputs
                            </button>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={handleDownload}
                                    disabled={verificationResult?.verificationStatus !== 'VERIFIED'}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${verificationResult?.verificationStatus === 'VERIFIED'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl transform hover:scale-105'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Download size={20} />
                                    Download Certified Report
                                </button>
                                {verificationResult?.verificationStatus !== 'VERIFIED' && (
                                    <p className="text-xs text-red-500 font-medium">
                                        * Compliance Report locked. Address audit issues to download.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
