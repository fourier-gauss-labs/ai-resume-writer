'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface DeleteCertificationModalProps {
    isOpen: boolean;
    certification: CertificationItem | null;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    isDeleting: boolean;
}

export function DeleteCertificationModal({
    isOpen,
    certification,
    onConfirm,
    onCancel,
    isDeleting
}: DeleteCertificationModalProps) {
    if (!isOpen || !certification) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                        Delete certification
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                        Are you sure you want to delete this certification? This action cannot be undone.
                    </p>

                    {/* Certification preview */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <div className="font-medium text-sm text-foreground">
                            {certification.certName}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {certification.issuer}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Issued {certification.issuedDate.month} {certification.issuedDate.year}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 p-6 pt-0">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="text-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="text-sm"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
