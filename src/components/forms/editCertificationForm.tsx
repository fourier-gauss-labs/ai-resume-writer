'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface EditCertificationFormProps {
    certification?: CertificationItem | null;
    onSave: (certification: CertificationItem) => Promise<void>;
    onCancel: () => void;
    onDelete?: (certification: CertificationItem) => Promise<void>;
    isNew?: boolean;
}

export default function EditCertificationForm({
    certification,
    onSave,
    onCancel,
    onDelete,
    isNew = false
}: EditCertificationFormProps) {
    const [formData, setFormData] = useState<CertificationItem>({
        certName: '',
        issuer: '',
        issuedDate: { month: '', year: '' },
        credentialId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
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
    }, [certification]);

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
        } catch (error) {
            console.error('Error saving certification:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!certification || !onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(certification);
        } catch (error) {
            console.error('Error deleting certification:', error);
        } finally {
            setIsDeleting(false);
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

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                    {isNew ? 'Add certification' : 'Edit certification'}
                </h2>
                {!isNew && onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Certification Name */}
                <div className="space-y-2">
                    <Label htmlFor="certName">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="certName"
                        value={formData.certName}
                        onChange={(e) => handleInputChange('certName', e.target.value)}
                        placeholder="e.g., AWS Certified Solutions Architect"
                        required
                    />
                </div>

                {/* Issuing Organization */}
                <div className="space-y-2">
                    <Label htmlFor="issuer">
                        Issuing organization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="issuer"
                        value={formData.issuer}
                        onChange={(e) => handleInputChange('issuer', e.target.value)}
                        placeholder="e.g., Amazon Web Services"
                        required
                    />
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                    <Label>
                        Issue date <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={formData.issuedDate.month}
                            onChange={(e) => handleDateChange('month', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="space-y-2">
                    <Label htmlFor="credentialId">
                        Credential ID
                    </Label>
                    <Input
                        id="credentialId"
                        value={formData.credentialId || ''}
                        onChange={(e) => handleInputChange('credentialId', e.target.value)}
                        placeholder="e.g., AWS-ASA-12345"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting || isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isDeleting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
