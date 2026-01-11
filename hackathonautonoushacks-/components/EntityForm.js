import React from 'react';
import { Building2, Calendar, FileText } from 'lucide-react';

export default function EntityForm({ formData, setFormData }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fields = [
        { name: 'cin', label: 'Corporate Identity Number (CIN)', type: 'text', icon: <FileText size={18} /> },
        { name: 'entityName', label: 'Name of the Entity', type: 'text', icon: <Building2 size={18} /> },
        { name: 'incorporationYear', label: 'Year of Incorporation', type: 'number', icon: <Calendar size={18} /> },
        { name: 'registeredOffice', label: 'Registered Office Address', type: 'text', icon: <Building2 size={18} /> },
        { name: 'paidUpCapital', label: 'Paid-up Capital (₹ Crores)', type: 'number', icon: <FileText size={18} /> },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <Building2 className="text-blue-600" />
                Entity Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                    <div key={field.name} className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            {field.icon}
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder || ''}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
