"use client";

import { GenericDeleteModal } from './genericDeleteModal';

interface JobHistoryItem {
    title: string;
    company: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    currentlyWorking: boolean;
    jobDescription: string;
    accomplishments: string[];
}

interface DeleteExperienceModalProps {
    isOpen: boolean;
    job: JobHistoryItem | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export function DeleteExperienceModal({
    isOpen,
    job,
    onConfirm,
    onCancel,
    isDeleting = false
}: DeleteExperienceModalProps) {
    if (!job) return null;

    const message = `You have chosen to delete the ${job.title} position at ${job.company}. This cannot be undone. Do you wish to continue?`;

    return (
        <GenericDeleteModal
            isOpen={isOpen}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isDeleting={isDeleting}
            title="Delete Experience"
            message={message}
        />
    );
}
