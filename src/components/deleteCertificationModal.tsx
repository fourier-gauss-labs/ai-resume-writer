'use client';

import { GenericDeleteModal } from './genericDeleteModal';

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
    if (!certification) return null;

    const message = `You have chosen to delete the ${certification.certName} certification from ${certification.issuer}. This cannot be undone. Do you wish to continue?`;

    return (
        <GenericDeleteModal
            isOpen={isOpen}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isDeleting={isDeleting}
            title="Delete Certification"
            message={message}
        />
    );
}