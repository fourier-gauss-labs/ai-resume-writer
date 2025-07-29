"use client";

import { GenericDeleteModal } from './genericDeleteModal';

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface DeleteEducationModalProps {
    isOpen: boolean;
    education: EducationItem | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export function DeleteEducationModal({
    isOpen,
    education,
    onConfirm,
    onCancel,
    isDeleting = false
}: DeleteEducationModalProps) {
    if (!education) return null;

    const message = `You have chosen to delete the ${education.degree} from ${education.school}. This cannot be undone. Do you wish to continue?`;

    return (
        <GenericDeleteModal
            isOpen={isOpen}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isDeleting={isDeleting}
            title="Delete Education"
            message={message}
        />
    );
}
