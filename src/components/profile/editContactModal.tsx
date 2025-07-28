'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EditContactForm from '@/components/forms/editContactForm';

interface ContactInformation {
    fullName: string;
    email: string[];
    phones: string[];
}

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactInfo: ContactInformation | null;
    onSave: (updatedContact: ContactInformation) => Promise<void>;
}

export default function EditContactModal({
    isOpen,
    onClose,
    contactInfo,
    onSave
}: EditContactModalProps) {
    const handleSave = async (updatedContact: ContactInformation) => {
        await onSave(updatedContact);
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
            <Card className="relative w-full max-w-md mx-4 p-6 bg-background">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Edit contact info</h2>
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
                <EditContactForm
                    contactInfo={contactInfo}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isInitialized={isOpen}
                />
            </Card>
        </div>
    );
}