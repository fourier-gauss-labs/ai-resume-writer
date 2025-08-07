'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EditJobForm from '@/components/forms/editJobForm';
import { JobData } from '@/components/jobs/jobCard';

interface EditJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobData | null;
    onSave: (jobId: string, updatedJob: Partial<JobData>) => Promise<void>;
}

export default function EditJobModal({
    isOpen,
    onClose,
    job,
    onSave
}: EditJobModalProps) {
    const handleSave = async (updatedJob: Partial<JobData>) => {
        if (job) {
            await onSave(job.id, updatedJob);
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen || !job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleCancel}
            />

            {/* Modal */}
            <Card className="relative w-full max-w-lg mx-4 p-6 bg-background max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Edit Job</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCancel}
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Form */}
                <EditJobForm
                    job={job}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </Card>
        </div>
    );
}
