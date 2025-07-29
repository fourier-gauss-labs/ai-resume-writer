'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditCertificationForm from '../forms/editCertificationForm';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface EditCertificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    certification: CertificationItem | null;
    onSave: (updatedCertification: CertificationItem) => Promise<void>;
    isNew?: boolean;
}

export default function EditCertificationModal({
    isOpen,
    onClose,
    certification,
    onSave,
    isNew = false
}: EditCertificationModalProps) {
    const handleSave = async (updatedCertification: CertificationItem) => {
        await onSave(updatedCertification);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[50vw] max-w-none max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isNew ? 'Add Certification' : 'Edit Certification'}
                    </DialogTitle>
                </DialogHeader>

                <EditCertificationForm
                    certification={certification}
                    onSave={handleSave}
                    onCancel={onClose}
                    isNew={isNew}
                />
            </DialogContent>
        </Dialog>
    );
}
