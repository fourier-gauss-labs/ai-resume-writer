'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, PencilIcon, Trash2, Award } from 'lucide-react';
import { GenericDeleteModal } from '../genericDeleteModal';
import EditCertificationModal from './editCertificationModal';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface CertificationFullViewProps {
    certifications: CertificationItem[];
    onBack: () => void;
    onUpdateCertification?: (updatedCertification: CertificationItem, originalCertification: CertificationItem) => Promise<void>;
    onAddCertification?: (newCertification: CertificationItem) => Promise<void>;
    onDeleteCertification?: (certificationToDelete: CertificationItem) => Promise<void>;
    isLoading?: boolean;
}

// Component for individual certification entry in full view
function CertificationEntryFull({ certification, onEdit, onDelete }: {
    certification: CertificationItem;
    onEdit: (certification: CertificationItem) => void;
    onDelete: (certification: CertificationItem) => void;
}) {
    const formatDate = () => {
        return `${certification.issuedDate.month} ${certification.issuedDate.year}`;
    };

    const handleEdit = () => {
        onEdit(certification);
    };

    const handleDelete = () => {
        onDelete(certification);
    };

    return (
        <div className="py-6">
            <div className="flex items-start space-x-4">
                {/* Certification icon */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <Award className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>

                {/* Certification details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* Certification name */}
                            <h3 className="font-semibold text-base text-foreground">
                                {certification.certName}
                            </h3>

                            {/* Issuer */}
                            <div className="text-sm text-muted-foreground mt-1">
                                {certification.issuer}
                            </div>

                            {/* Issue date */}
                            <div className="text-sm text-muted-foreground mt-2">
                                Issued {formatDate()}
                            </div>

                            {/* Credential ID if available */}
                            {certification.credentialId && (
                                <div className="text-sm text-muted-foreground mt-2">
                                    <span className="font-medium">Credential ID:</span> {certification.credentialId}
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

export default function CertificationFullView({
    certifications,
    onBack,
    onUpdateCertification,
    onAddCertification,
    onDeleteCertification,
    isLoading = false
}: CertificationFullViewProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCertification, setSelectedCertification] = useState<CertificationItem | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        certification: CertificationItem | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        certification: null,
        isDeleting: false,
    });

    const handleEditCertification = (certification: CertificationItem) => {
        setSelectedCertification(certification);
        setIsEditModalOpen(true);
    };

    const handleAddCertification = () => {
        setSelectedCertification(null);
        setIsAddModalOpen(true);
    };

    const handleSaveCertification = async (updatedCertification: CertificationItem) => {
        if (selectedCertification && onUpdateCertification) {
            await onUpdateCertification(updatedCertification, selectedCertification);
        }
    };

    const handleAddNewCertification = async (newCertification: CertificationItem) => {
        if (onAddCertification) {
            await onAddCertification(newCertification);
        }
    };

    const handleDeleteCertification = async (certificationToDelete: CertificationItem) => {
        if (onDeleteCertification) {
            await onDeleteCertification(certificationToDelete);
        }
    };

    const handleShowDeleteConfirmation = (certification: CertificationItem) => {
        setDeleteConfirmation({
            isOpen: true,
            certification: certification,
            isDeleting: false,
        });
    };

    const handleConfirmedDelete = async () => {
        if (!deleteConfirmation.certification) return;

        setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

        try {
            await handleDeleteCertification(deleteConfirmation.certification);
            // Close the confirmation modal
            setDeleteConfirmation({
                isOpen: false,
                certification: null,
                isDeleting: false,
            });
        } catch (error) {
            console.error("Error deleting certification:", error);
            setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({
            isOpen: false,
            certification: null,
            isDeleting: false,
        });
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedCertification(null);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedCertification(null);
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

    // Sort certifications by issue date (most recent first)
    const sortedCertifications = [...(certifications || [])].sort((a, b) => {
        const aYear = parseInt(a.issuedDate.year);
        const bYear = parseInt(b.issuedDate.year);
        if (aYear !== bYear) return bYear - aYear;

        // If same year, sort by month
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const aMonth = months.indexOf(a.issuedDate.month);
        const bMonth = months.indexOf(b.issuedDate.month);
        return bMonth - aMonth;
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
                                Licenses & certifications
                            </h1>
                        </div>

                        {/* Add certification button */}
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleAddCertification}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {sortedCertifications.length > 0 ? (
                    <div className="border border-border rounded-lg bg-card p-6">
                        <div className="space-y-0 divide-y divide-border">
                            {sortedCertifications.map((certification, index) => (
                                <CertificationEntryFull
                                    key={index}
                                    certification={certification}
                                    onEdit={handleEditCertification}
                                    onDelete={handleShowDeleteConfirmation}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No certifications yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Add your professional certifications and licenses to showcase your expertise.
                        </p>
                        <Button onClick={handleAddCertification}>
                            Add certification
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <GenericDeleteModal
                isOpen={deleteConfirmation.isOpen}
                onConfirm={handleConfirmedDelete}
                onCancel={handleDeleteCancel}
                isDeleting={deleteConfirmation.isDeleting}
                title="Delete Certification"
                message={
                    deleteConfirmation.certification
                        ? `You have chosen to delete the ${deleteConfirmation.certification.certName} certification from ${deleteConfirmation.certification.issuer}. This cannot be undone. Do you wish to continue?`
                        : ""
                }
            />

            {/* Edit Certification Modal */}
            <EditCertificationModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                certification={selectedCertification}
                onSave={handleSaveCertification}
                isNew={false}
            />

            {/* Add Certification Modal */}
            <EditCertificationModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                certification={null}
                onSave={handleAddNewCertification}
                isNew={true}
            />
        </div>
    );
}
