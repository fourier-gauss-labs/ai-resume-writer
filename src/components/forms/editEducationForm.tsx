'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface EditEducationFormProps {
    education: EducationItem | null;
    onSave: (updatedEducation: EducationItem) => Promise<void>;
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

export default function EditEducationForm({
    education,
    onSave,
    onCancel,
    isNew = false
}: EditEducationFormProps) {
    const [formData, setFormData] = useState<EducationItem>({
        school: '',
        degree: '',
        startDate: { month: '', year: '' },
        endDate: { month: '', year: '' },
        grade: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (education) {
            setFormData(education);
        }
    }, [education]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.school.trim()) {
            newErrors.school = 'School name is required';
        }

        if (!formData.degree.trim()) {
            newErrors.degree = 'Degree is required';
        }

        if (!formData.startDate.month) {
            newErrors.startMonth = 'Start month is required';
        }

        if (!formData.startDate.year) {
            newErrors.startYear = 'Start year is required';
        }

        if (!formData.endDate.month) {
            newErrors.endMonth = 'End month is required';
        }

        if (!formData.endDate.year) {
            newErrors.endYear = 'End year is required';
        }

        // Validate date logic
        if (formData.startDate.month && formData.startDate.year &&
            formData.endDate.month && formData.endDate.year) {
            const startDate = new Date(parseInt(formData.startDate.year), months.indexOf(formData.startDate.month));
            const endDate = new Date(parseInt(formData.endDate.year), months.indexOf(formData.endDate.month));

            if (startDate >= endDate) {
                newErrors.dateRange = 'End date must be after start date';
            }
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
            toast.success(isNew ? 'Education added successfully!' : 'Education updated successfully!');
        } catch (error) {
            console.error('Error saving education:', error);
            toast.error('Failed to save education');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof EducationItem, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate', subField: 'month' | 'year', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [subField]: value }
        }));
        // Clear related errors
        const errorKey = field === 'startDate' ? `start${subField.charAt(0).toUpperCase() + subField.slice(1)}` : `end${subField.charAt(0).toUpperCase() + subField.slice(1)}`;
        if (errors[errorKey] || errors.dateRange) {
            setErrors(prev => ({ ...prev, [errorKey]: '', dateRange: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* School */}
            <div className="space-y-2">
                <Label htmlFor="school">School *</Label>
                <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    placeholder="e.g. University of California, Berkeley"
                    className={errors.school ? 'border-red-500' : ''}
                />
                {errors.school && <p className="text-sm text-red-500">{errors.school}</p>}
            </div>

            {/* Degree */}
            <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    placeholder="e.g. Bachelor of Science in Computer Science"
                    className={errors.degree ? 'border-red-500' : ''}
                />
                {errors.degree && <p className="text-sm text-red-500">{errors.degree}</p>}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
                <Label>Start Date *</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Select
                            value={formData.startDate.month}
                            onValueChange={(value) => handleDateChange('startDate', 'month', value)}
                        >
                            <SelectTrigger className={errors.startMonth ? 'border-red-500' : ''}>
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
                        {errors.startMonth && <p className="text-sm text-red-500 mt-1">{errors.startMonth}</p>}
                    </div>
                    <div>
                        <Select
                            value={formData.startDate.year}
                            onValueChange={(value) => handleDateChange('startDate', 'year', value)}
                        >
                            <SelectTrigger className={errors.startYear ? 'border-red-500' : ''}>
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
                        {errors.startYear && <p className="text-sm text-red-500 mt-1">{errors.startYear}</p>}
                    </div>
                </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
                <Label>End Date *</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Select
                            value={formData.endDate.month}
                            onValueChange={(value) => handleDateChange('endDate', 'month', value)}
                        >
                            <SelectTrigger className={errors.endMonth ? 'border-red-500' : ''}>
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
                        {errors.endMonth && <p className="text-sm text-red-500 mt-1">{errors.endMonth}</p>}
                    </div>
                    <div>
                        <Select
                            value={formData.endDate.year}
                            onValueChange={(value) => handleDateChange('endDate', 'year', value)}
                        >
                            <SelectTrigger className={errors.endYear ? 'border-red-500' : ''}>
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
                        {errors.endYear && <p className="text-sm text-red-500 mt-1">{errors.endYear}</p>}
                    </div>
                </div>
                {errors.dateRange && <p className="text-sm text-red-500">{errors.dateRange}</p>}
            </div>

            {/* Grade/GPA */}
            <div className="space-y-2">
                <Label htmlFor="grade">Grade/GPA</Label>
                <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder="e.g. 3.8, Magna Cum Laude, First Class"
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
