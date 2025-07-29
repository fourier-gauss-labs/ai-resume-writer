'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, PencilIcon, Trash2, GraduationCap } from 'lucide-react';
import EditEducationModal from './editEducationModal';
import { DeleteEducationModal } from '../deleteEducationModal';

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface EducationFullViewProps {
    education: EducationItem[];
    onBack: () => void;
    onUpdateEducation?: (updatedEducation: EducationItem, originalEducation: EducationItem) => Promise<void>;
    onAddEducation?: (newEducation: EducationItem) => Promise<void>;
    onDeleteEducation?: (educationToDelete: EducationItem) => Promise<void>;
    isLoading?: boolean;
}

// Component for individual education entry in full view
function EducationEntryFull({ education, onEdit, onDelete }: {
    education: EducationItem;
    onEdit: (education: EducationItem) => void;
    onDelete: (education: EducationItem) => void;
}) {
    const formatDateRange = () => {
        const startDate = `${education.startDate.month} ${education.startDate.year}`;
        const endDate = `${education.endDate.month} ${education.endDate.year}`;
        return `${startDate} - ${endDate}`;
    };

    const handleEdit = () => {
        onEdit(education);
    };

    const handleDelete = () => {
        onDelete(education);
    };

    return (
        <div className="py-6">
            <div className="flex items-start space-x-4">
                {/* School logo placeholder */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>

                {/* Education details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* School name */}
                            <h3 className="font-semibold text-base text-foreground">
                                {education.school}
                            </h3>

                            {/* Degree */}
                            <div className="text-sm text-muted-foreground mt-1">
                                {education.degree}
                            </div>

                            {/* Date range */}
                            <div className="text-sm text-muted-foreground mt-2">
                                {formatDateRange()}
                            </div>

                            {/* Grade */}
                            {education.grade && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    GPA: {education.grade}
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                            {/* Edit button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={handleEdit}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>

                            {/* Delete button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EducationFullView({
    education,
    onBack,
    onUpdateEducation,
    onAddEducation,
    onDeleteEducation,
    isLoading = false
}: EducationFullViewProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<EducationItem | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        education: EducationItem | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        education: null,
        isDeleting: false,
    });

    const handleEditEducation = (education: EducationItem) => {
        setSelectedEducation(education);
        setIsEditModalOpen(true);
    };

    const handleAddEducation = () => {
        setSelectedEducation(null);
        setIsAddModalOpen(true);
    };

    const handleSaveEducation = async (updatedEducation: EducationItem) => {
        if (selectedEducation && onUpdateEducation) {
            await onUpdateEducation(updatedEducation, selectedEducation);
        }
    };

    const handleAddEducationEntry = async (newEducation: EducationItem) => {
        if (onAddEducation) {
            await onAddEducation(newEducation);
        }
    };

    const handleDeleteEducation = async (educationToDelete: EducationItem) => {
        if (onDeleteEducation) {
            await onDeleteEducation(educationToDelete);
        }
    };

    const handleShowDeleteConfirmation = (education: EducationItem) => {
        setDeleteConfirmation({
            isOpen: true,
            education: education,
            isDeleting: false,
        });
    };

    const handleConfirmedDelete = async () => {
        if (!deleteConfirmation.education) return;

        setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

        try {
            await handleDeleteEducation(deleteConfirmation.education);
            // Close the confirmation modal
            setDeleteConfirmation({
                isOpen: false,
                education: null,
                isDeleting: false,
            });
        } catch (error) {
            console.error("Error deleting education:", error);
            setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({
            isOpen: false,
            education: null,
            isDeleting: false,
        });
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedEducation(null);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedEducation(null);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded mb-6 w-1/4"></div>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-border rounded-lg p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-muted rounded"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-muted rounded w-1/2"></div>
                                        <div className="h-4 bg-muted rounded w-1/3"></div>
                                        <div className="h-4 bg-muted rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Sort education: most recent first
    const sortedEducation = [...(education || [])].sort((a, b) => {
        const aYear = parseInt(a.endDate.year);
        const bYear = parseInt(b.endDate.year);
        return bYear - aYear;
    });

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Back button */}
                            <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={onBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>

                            {/* Title */}
                            <h1 className="text-2xl font-semibold text-foreground">
                                Education
                            </h1>
                        </div>

                        {/* Add education button */}
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleAddEducation}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {sortedEducation.length > 0 ? (
                    <div className="border border-border rounded-lg bg-card p-6">
                        <div className="space-y-0 divide-y divide-border">
                            {sortedEducation.map((edu, index) => (
                                <EducationEntryFull key={index} education={edu} onEdit={handleEditEducation} onDelete={handleShowDeleteConfirmation} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No education yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Parse your documents or add your education manually.
                        </p>
                        <Button onClick={handleAddEducation}>
                            Add education
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Education Modal */}
            <EditEducationModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                education={selectedEducation}
                onSave={handleSaveEducation}
                isNew={false}
            />

            {/* Add Education Modal */}
            <EditEducationModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                education={null}
                onSave={handleAddEducationEntry}
                isNew={true}
            />

            {/* Delete Confirmation Modal */}
            <DeleteEducationModal
                isOpen={deleteConfirmation.isOpen}
                education={deleteConfirmation.education}
                onConfirm={handleConfirmedDelete}
                onCancel={handleDeleteCancel}
                isDeleting={deleteConfirmation.isDeleting}
            />
        </div>
    );
}
