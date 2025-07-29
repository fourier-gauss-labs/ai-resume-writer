'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface EditCertificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    certification: CertificationItem | null;
    onSave: (certification: CertificationItem) => Promise<void>;
    isNew: boolean;
}

export default function EditCertificationModal({
    isOpen,
    onClose,
    certification,
    onSave,
    isNew
}: EditCertificationModalProps) {
    const [formData, setFormData] = useState<CertificationItem>({
        certName: '',
        issuer: '',
        issuedDate: { month: '', year: '' },
        credentialId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (certification) {
                setFormData(certification);
            } else {
                setFormData({
                    certName: '',
                    issuer: '',
                    issuedDate: { month: '', year: '' },
                    credentialId: ''
                });
            }
        }
    }, [isOpen, certification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Remove credentialId if it's empty
            const dataToSave = {
                ...formData,
                credentialId: formData.credentialId?.trim() || undefined
            };

            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error('Error saving certification:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof CertificationItem, value: string) => {
        if (field === 'issuedDate') return; // Handle date separately

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (field: 'month' | 'year', value: string) => {
        setFormData(prev => ({
            ...prev,
            issuedDate: {
                ...prev.issuedDate,
                [field]: value
            }
        }));
    };

    if (!isOpen) return null;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                        {isNew ? 'Add certification' : 'Edit certification'}
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-6 w-6"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Certification Name */}
                    <div>
                        <label htmlFor="certName" className="block text-sm font-medium text-foreground mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="certName"
                            value={formData.certName}
                            onChange={(e) => handleInputChange('certName', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., AWS Certified Solutions Architect"
                            required
                        />
                    </div>

                    {/* Issuing Organization */}
                    <div>
                        <label htmlFor="issuer" className="block text-sm font-medium text-foreground mb-1">
                            Issuing organization <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="issuer"
                            value={formData.issuer}
                            onChange={(e) => handleInputChange('issuer', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., Amazon Web Services"
                            required
                        />
                    </div>

                    {/* Issue Date */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Issue date <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={formData.issuedDate.month}
                                onChange={(e) => handleDateChange('month', e.target.value)}
                                className="px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Month</option>
                                {months.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={formData.issuedDate.year}
                                onChange={(e) => handleDateChange('year', e.target.value)}
                                className="px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year.toString()}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Credential ID */}
                    <div>
                        <label htmlFor="credentialId" className="block text-sm font-medium text-foreground mb-1">
                            Credential ID
                        </label>
                        <input
                            type="text"
                            id="credentialId"
                            value={formData.credentialId || ''}
                            onChange={(e) => handleInputChange('credentialId', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., AWS-ASA-12345"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
