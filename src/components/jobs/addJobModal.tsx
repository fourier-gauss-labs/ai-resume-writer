'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddJobForm from '@/components/forms/addJobForm';

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (jobData: { url?: string; jobAdText: string }) => Promise<void>;
}

export default function AddJobModal({
    isOpen,
    onClose,
    onSave
}: AddJobModalProps) {
    const handleSave = async (jobData: { url?: string; jobAdText: string }) => {
        await onSave(jobData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[50vw] max-w-none max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Add New Job Opportunity
                    </DialogTitle>
                </DialogHeader>

                <AddJobForm
                    onSave={handleSave}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
