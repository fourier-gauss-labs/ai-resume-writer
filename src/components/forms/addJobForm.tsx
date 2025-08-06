'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddJobFormProps {
    onSave: (jobData: { url?: string; jobAdText: string }) => Promise<void>;
    onCancel: () => void;
}

export default function AddJobForm({
    onSave,
    onCancel
}: AddJobFormProps) {
    const [formData, setFormData] = useState({
        url: '',
        jobAdText: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.jobAdText.trim()) {
            newErrors.jobAdText = 'Job advertisement text is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            const jobData = {
                url: formData.url.trim() || undefined,
                jobAdText: formData.jobAdText.trim()
            };

            await onSave(jobData);
            toast.success('Job opportunity added successfully!');
        } catch (error) {
            console.error('Error adding job:', error);
            toast.error('Failed to add job opportunity. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Field */}
            <div className="space-y-2">
                <Label htmlFor="url">Job Posting URL</Label>
                <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://company.com/careers/job-posting"
                />
            </div>

            {/* Divider with "or" */}
            <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <div className="px-4 text-sm text-gray-500 dark:text-gray-400 font-medium">or</div>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Job Ad Text Area */}
            <div className="space-y-2">
                <Label htmlFor="jobAdText">Job Advertisement Text</Label>
                <textarea
                    id="jobAdText"
                    value={formData.jobAdText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('jobAdText', e.target.value)}
                    placeholder="Paste the job advertisement text here. Our AI will extract the title, company, description, requirements, and other details automatically."
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                    required
                />
                {errors.jobAdText && <p className="text-sm text-red-500 mt-1">{errors.jobAdText}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI will automatically extract job title, company name, description, requirements, and deadline from this text.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="submit"
                    className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isSaving}
                >
                    {isSaving ? 'Processing...' : 'Add Job'}
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
