'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface EditCertificationFormProps {
    certification: CertificationItem | null;
    onSave: (updatedCertification: CertificationItem) => Promise<void>;
    onCancel: () => void;
    isNew?: boolean;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years from 1960 to current year + 5
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1959 }, (_, i) => (currentYear + 5 - i).toString());

export default function EditCertificationForm({
    certification,
    onSave,
    onCancel,
    isNew = false
}: EditCertificationFormProps) {
    const [formData, setFormData] = useState<CertificationItem>({
        certName: '',
        issuer: '',
        issuedDate: { month: '', year: '' },
        credentialId: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (certification) {
            setFormData(certification);
        }
    }, [certification]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.certName.trim()) {
            newErrors.certName = 'Certification name is required';
        }

        if (!formData.issuer.trim()) {
            newErrors.issuer = 'Issuer is required';
        }

        if (!formData.issuedDate.month) {
            newErrors.issuedMonth = 'Issue month is required';
        }

        if (!formData.issuedDate.year) {
            newErrors.issuedYear = 'Issue year is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors below');
            return;
        }

        setIsSaving(true);

        try {
            await onSave(formData);
            toast.success(isNew ? 'Certification added successfully!' : 'Certification updated successfully!');
        } catch (error) {
            console.error('Error saving certification:', error);
            toast.error('Failed to save certification');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof CertificationItem, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDateChange = (subField: 'month' | 'year', value: string) => {
        setFormData(prev => ({
            ...prev,
            issuedDate: { ...prev.issuedDate, [subField]: value }
        }));
        // Clear related errors
        const errorKey = `issued${subField.charAt(0).toUpperCase() + subField.slice(1)}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Certification Name */}
            <div className="space-y-2">
                <Label htmlFor="certName">Certification Name *</Label>
                <Input
                    id="certName"
                    value={formData.certName}
                    onChange={(e) => handleInputChange('certName', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className={errors.certName ? 'border-red-500' : ''}
                />
                {errors.certName && <p className="text-sm text-red-500">{errors.certName}</p>}
            </div>

            {/* Issuer */}
            <div className="space-y-2">
                <Label htmlFor="issuer">Issuer *</Label>
                <Input
                    id="issuer"
                    value={formData.issuer}
                    onChange={(e) => handleInputChange('issuer', e.target.value)}
                    placeholder="e.g. Amazon Web Services (AWS)"
                    className={errors.issuer ? 'border-red-500' : ''}
                />
                {errors.issuer && <p className="text-sm text-red-500">{errors.issuer}</p>}
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
                <Label>Issue Date *</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Select
                            value={formData.issuedDate.month}
                            onValueChange={(value) => handleDateChange('month', value)}
                        >
                            <SelectTrigger className={errors.issuedMonth ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month} value={month}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.issuedMonth && <p className="text-sm text-red-500 mt-1">{errors.issuedMonth}</p>}
                    </div>
                    <div>
                        <Select
                            value={formData.issuedDate.year}
                            onValueChange={(value) => handleDateChange('year', value)}
                        >
                            <SelectTrigger className={errors.issuedYear ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.issuedYear && <p className="text-sm text-red-500 mt-1">{errors.issuedYear}</p>}
                    </div>
                </div>
            </div>

            {/* Credential ID */}
            <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input
                    id="credentialId"
                    value={formData.credentialId}
                    onChange={(e) => handleInputChange('credentialId', e.target.value)}
                    placeholder="e.g. AWS-ASA-123456 (optional)"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="submit"
                    className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={isSaving}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
