'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface JobHistoryItem {
    title: string;
    company: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    currentlyWorking: boolean;
    jobDescription: string;
    accomplishments: string[];
}

interface EditExperienceFormProps {
    job: JobHistoryItem | null;
    onSave: (updatedJob: JobHistoryItem) => Promise<void>;
    onCancel: () => void;
    isNew?: boolean;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const employmentTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Freelance',
    'Volunteer'
];

// Generate years from 1990 to current year + 1
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, i) => (currentYear + 1 - i).toString());

export default function EditExperienceForm({
    job,
    onSave,
    onCancel,
    isNew = false
}: EditExperienceFormProps) {
    const [formData, setFormData] = useState<JobHistoryItem>({
        title: '',
        company: '',
        startDate: { month: '', year: '' },
        endDate: { month: '', year: '' },
        currentlyWorking: false,
        jobDescription: '',
        accomplishments: ['']
    });
    const [employmentType, setEmploymentType] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form data when component mounts or job changes
    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                company: job.company || '',
                startDate: {
                    month: job.startDate?.month || '',
                    year: job.startDate?.year || ''
                },
                endDate: {
                    month: job.endDate?.month || '',
                    year: job.endDate?.year || ''
                },
                currentlyWorking: job.currentlyWorking || false,
                jobDescription: job.jobDescription || '',
                accomplishments: job.accomplishments?.length > 0 ? [...job.accomplishments] : ['']
            });
        }
    }, [job]);

    const handleInputChange = (field: keyof JobHistoryItem, value: string | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (type: 'startDate' | 'endDate', field: 'month' | 'year', value: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleCurrentlyWorkingChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            currentlyWorking: checked,
            // Clear end date if currently working
            endDate: checked ? { month: '', year: '' } : prev.endDate
        }));
    };

    const handleAccomplishmentChange = (index: number, value: string) => {
        const newAccomplishments = [...formData.accomplishments];
        newAccomplishments[index] = value;
        setFormData(prev => ({ ...prev, accomplishments: newAccomplishments }));
    };

    const addAccomplishment = () => {
        setFormData(prev => ({
            ...prev,
            accomplishments: [...prev.accomplishments, '']
        }));
    };

    const removeAccomplishment = (index: number) => {
        if (formData.accomplishments.length > 1) {
            const newAccomplishments = formData.accomplishments.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, accomplishments: newAccomplishments }));
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error('Job title is required');
            return false;
        }
        if (!formData.company.trim()) {
            toast.error('Company name is required');
            return false;
        }
        if (!formData.startDate.month || !formData.startDate.year) {
            toast.error('Start date is required');
            return false;
        }
        if (!formData.currentlyWorking && (!formData.endDate.month || !formData.endDate.year)) {
            toast.error('End date is required when not currently working');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Filter out empty accomplishments
            const cleanedAccomplishments = formData.accomplishments
                .map(acc => acc.trim())
                .filter(acc => acc.length > 0);

            const jobData: JobHistoryItem = {
                ...formData,
                accomplishments: cleanedAccomplishments
            };

            await onSave(jobData);
            toast.success(isNew ? 'Experience added successfully!' : 'Experience updated successfully!');
        } catch (error) {
            console.error('Error saving experience:', error);
            toast.error('Failed to save experience');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Title field */}
            <div>
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                    Title *
                </Label>
                <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="mt-1"
                />
            </div>

            {/* Employment type */}
            <div>
                <Label htmlFor="employment-type" className="text-sm font-medium text-foreground">
                    Employment type
                </Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                        {employmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Company field */}
            <div>
                <Label htmlFor="company" className="text-sm font-medium text-foreground">
                    Company or organization *
                </Label>
                <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="mt-1"
                />
            </div>

            {/* Location field */}
            <div>
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                    Location
                </Label>
                <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="mt-1"
                />
            </div>

            {/* Currently working checkbox */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="currently-working"
                    checked={formData.currentlyWorking}
                    onChange={(e) => handleCurrentlyWorkingChange(e.target.checked)}
                    className="rounded border-border"
                />
                <Label htmlFor="currently-working" className="text-sm font-medium text-foreground">
                    I am currently working in this role
                </Label>
            </div>

            {/* Start date */}
            <div>
                <Label className="text-sm font-medium text-foreground">
                    Start date *
                </Label>
                <div className="flex space-x-4 mt-1">
                    <div className="flex-1">
                        <Select
                            value={formData.startDate.month}
                            onValueChange={(value) => handleDateChange('startDate', 'month', value)}
                        >
                            <SelectTrigger>
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
                    </div>
                    <div className="flex-1">
                        <Select
                            value={formData.startDate.year}
                            onValueChange={(value) => handleDateChange('startDate', 'year', value)}
                        >
                            <SelectTrigger>
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
                    </div>
                </div>
            </div>

            {/* End date */}
            {!formData.currentlyWorking && (
                <div>
                    <Label className="text-sm font-medium text-foreground">
                        End date *
                    </Label>
                    <div className="flex space-x-4 mt-1">
                        <div className="flex-1">
                            <Select
                                value={formData.endDate.month}
                                onValueChange={(value) => handleDateChange('endDate', 'month', value)}
                            >
                                <SelectTrigger>
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
                        </div>
                        <div className="flex-1">
                            <Select
                                value={formData.endDate.year}
                                onValueChange={(value) => handleDateChange('endDate', 'year', value)}
                            >
                                <SelectTrigger>
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
                        </div>
                    </div>
                </div>
            )}

            {/* Job description */}
            <div>
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                </Label>
                <textarea
                    id="description"
                    value={formData.jobDescription}
                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                    placeholder="Describe your role and responsibilities..."
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
            </div>

            {/* Accomplishments */}
            <div>
                <Label className="text-sm font-medium text-foreground">
                    Key accomplishments
                </Label>
                <div className="space-y-3 mt-2">
                    {formData.accomplishments.map((accomplishment, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <Input
                                value={accomplishment}
                                onChange={(e) => handleAccomplishmentChange(index, e.target.value)}
                                placeholder={`Accomplishment ${index + 1}`}
                                className="flex-1"
                            />
                            {formData.accomplishments.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                                    onClick={() => removeAccomplishment(index)}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={addAccomplishment}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add accomplishment
                    </Button>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-border">
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
