'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EditExperienceForm from '@/components/forms/editExperienceForm';

interface JobHistoryItem {
    title: string;
    company: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    currentlyWorking: boolean;
    jobDescription: string;
    accomplishments: string[];
}

interface EditExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobHistoryItem | null;
    onSave: (updatedJob: JobHistoryItem) => Promise<void>;
    isNew?: boolean;
}

export default function EditExperienceModal({
    isOpen,
    onClose,
    job,
    onSave,
    isNew = false
}: EditExperienceModalProps) {
    const handleSave = async (updatedJob: JobHistoryItem) => {
        await onSave(updatedJob);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleCancel}
            />

            {/* Modal */}
            <Card className="relative w-full max-w-2xl mx-4 p-6 bg-background max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">
                        {isNew ? 'Add experience' : 'Edit experience'}
                    </h2>
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
                <EditExperienceForm
                    job={job}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isNew={isNew}
                />
            </Card>
        </div>
    );
}
