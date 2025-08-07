'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { JobData } from '@/components/jobs/jobCard';

interface EditJobFormProps {
    job: JobData;
    onSave: (updatedJob: Partial<JobData>) => Promise<void>;
    onCancel: () => void;
}

export default function EditJobForm({ job, onSave, onCancel }: EditJobFormProps) {
    const [formData, setFormData] = useState({
        company: job.company,
        title: job.title,
        url: job.url || '',
        status: job.status,
        applicationDeadline: job.applicationDeadline
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        job.applicationDeadline ? new Date(job.applicationDeadline) : undefined
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStatusChange = (value: 'interested' | 'applied' | 'interview' | 'completed') => {
        setFormData(prev => ({
            ...prev,
            status: value
        }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setFormData(prev => ({
            ...prev,
            applicationDeadline: date ? format(date, 'yyyy-MM-dd') : null
        }));
    };

    const clearDate = () => {
        setSelectedDate(undefined);
        setFormData(prev => ({
            ...prev,
            applicationDeadline: null
        }));
    };

    const handleSave = async () => {
        // Validate required fields
        if (!formData.company.trim()) {
            toast.error('Company name is required');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Job title is required');
            return;
        }

        setIsLoading(true);

        try {
            const updates: Partial<JobData> = {
                company: formData.company.trim(),
                title: formData.title.trim(),
                url: formData.url.trim() || null,
                status: formData.status,
                applicationDeadline: formData.applicationDeadline
            };

            await onSave(updates);
            toast.success('Job updated successfully');
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error('Failed to update job');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Edit Job
                </h3>
            </div>

            {/* Company Name */}
            <div>
                <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Company Name *
                </Label>
                <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter company name"
                    className="w-full"
                />
            </div>

            {/* Job Title */}
            <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Job Title *
                </Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter job title"
                    className="w-full"
                />
            </div>

            {/* Job URL */}
            <div>
                <Label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Job URL
                </Label>
                <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="Enter job posting URL"
                    type="url"
                    className="w-full"
                />
            </div>

            {/* Status */}
            <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Status
                </Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Application Deadline */}
            <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Application Deadline
                </Label>
                <div className="flex space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {selectedDate && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearDate}
                            className="px-3"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Read-only Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Information
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div>Added: {new Date(job.dateAdded).toLocaleDateString()}</div>
                    <div>Job ID: {job.id}</div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
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
