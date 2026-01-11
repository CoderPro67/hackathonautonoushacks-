import React, { useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, isProcessing }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.pdf')) {
            return true;
        }
        return false;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(validateFile);

            if (validFiles.length > 0) {
                updateFiles([...selectedFiles, ...validFiles]);
            }

            if (validFiles.length !== files.length) {
                alert('Some files were invalid and skipped. Please upload PDF or Excel files.');
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(validateFile);

            if (validFiles.length > 0) {
                updateFiles([...selectedFiles, ...validFiles]);
            }

            if (validFiles.length !== files.length) {
                alert('Some files were invalid and skipped. Please upload PDF or Excel files.');
            }
        }
    };

    const updateFiles = (newFiles) => {
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        updateFiles(newFiles);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <Upload className="text-blue-600" />
                Document Upload
            </h2>

            <div
                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all mb-4 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className={`w-12 h-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-lg font-medium text-gray-700 mb-1">Drag & Drop Annual Reports</p>
                <p className="text-sm text-gray-500 mb-4">Support for PDF, XLSX, XLS (Multiple files allowed)</p>
                <label className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                    Browse Files
                    <input type="file" className="hidden" onChange={handleChange} accept=".pdf,.xlsx,.xls" multiple />
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                                    <File size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isProcessing && (
                <div className="mt-4 flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">Processing {selectedFiles.length} documents with Gemini AI...</span>
                </div>
            )}
        </div>
    );
}
