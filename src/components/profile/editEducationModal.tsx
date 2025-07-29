'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditEducationForm from '../forms/editEducationForm';

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface EditEducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    education: EducationItem | null;
    onSave: (updatedEducation: EducationItem) => Promise<void>;
    isNew?: boolean;
}

export default function EditEducationModal({
    isOpen,
    onClose,
    education,
    onSave,
    isNew = false
}: EditEducationModalProps) {
    const handleSave = async (updatedEducation: EducationItem) => {
        await onSave(updatedEducation);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[50vw] max-w-none max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isNew ? 'Add Education' : 'Edit Education'}
                    </DialogTitle>
                </DialogHeader>

                <EditEducationForm
                    education={education}
                    onSave={handleSave}
                    onCancel={onClose}
                    isNew={isNew}
                />
            </DialogContent>
        </Dialog>
    );
}
