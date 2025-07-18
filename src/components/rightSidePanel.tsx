"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DocumentPlusIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BackgroundForm from "@/components/forms/backgroundForm";
import { FileCard } from "@/components/fileCard";
import { DeleteConfirmationModal } from "@/components/deleteConfirmationModal";
import { getUserFiles, deleteUserFile, FileData } from "@/utils/fileUtils";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";

export function RightSidePanel() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        file: FileData | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        file: null,
        isDeleting: false,
    });
    const { user } = useAuth();

    // Load files when component mounts or user changes
    useEffect(() => {
        const loadFiles = async () => {
            if (!user) {
                setUploadedFiles([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                console.log('Loading files for user:', user.uid);

                const files = await getUserFiles(user.uid);
                console.log('Loaded files:', files.length);
                setUploadedFiles(files);
            } catch (error) {
                console.error("Error loading files:", error);
                toast.error("Failed to load files");
                setUploadedFiles([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFiles();
    }, [user]);

    // Function to refresh file list
    const refreshFiles = async () => {
        if (!user) return;

        try {
            const files = await getUserFiles(user.uid);
            setUploadedFiles(files);
            toast.success("Files refreshed");
        } catch (error) {
            console.error("Error refreshing files:", error);
            toast.error("Failed to refresh files");
        }
    };

    // Handle file view
    const handleViewFile = (file: FileData) => {
        console.log("View file:", file.name);
        // Open file in new tab
        window.open(file.url, '_blank');
    };

    // Handle file delete - show confirmation modal
    const handleDeleteFile = (file: FileData) => {
        setDeleteConfirmation({
            isOpen: true,
            file: file,
            isDeleting: false,
        });
    };

    // Handle confirmed delete
    const handleConfirmedDelete = async () => {
        if (!user || !deleteConfirmation.file) {
            toast.error("You must be logged in to delete files");
            return;
        }

        setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

        try {
            await deleteUserFile(user.uid, deleteConfirmation.file.name);
            // Remove file from local state
            setUploadedFiles(prev => prev.filter(f => f.id !== deleteConfirmation.file!.id));
            toast.success("File deleted successfully");

            // Close the confirmation modal
            setDeleteConfirmation({
                isOpen: false,
                file: null,
                isDeleting: false,
            });
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Failed to delete file");
            setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
        }
    };

    // Handle delete cancellation
    const handleDeleteCancel = () => {
        setDeleteConfirmation({
            isOpen: false,
            file: null,
            isDeleting: false,
        });
    };

    // Handle modal close and refresh files
    const handleModalClose = () => {
        setIsModalOpen(false);
        // Refresh files after potential upload
        if (user) {
            refreshFiles();
        }
    };

    return (
        <>
            <div className="w-80 bg-background border-l border-border flex-shrink-0">
                <div className="h-full flex flex-col">
                    {/* Header with icon buttons */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">My Files</h2>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => {
                                        // Trigger refresh/parsing of historical documents
                                        refreshFiles();
                                    }}
                                >
                                    <ArrowPathIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <DocumentPlusIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Files content area */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground text-sm">Loading files...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {uploadedFiles.map((file) => (
                                    <FileCard
                                        key={file.id}
                                        file={file}
                                        onView={handleViewFile}
                                        onDelete={handleDeleteFile}
                                    />
                                ))}

                                {uploadedFiles.length === 0 && !isLoading && (
                                    <div className="h-32 bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-muted-foreground text-sm">
                                                {user ? "No files uploaded yet" : "Please log in to view files"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Background Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                <DialogContent className="w-[40vw] max-w-none max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Background</DialogTitle>
                    </DialogHeader>
                    <BackgroundForm
                        isSubmitting={false}
                        onCancel={handleModalClose}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                file={deleteConfirmation.file}
                onConfirm={handleConfirmedDelete}
                onCancel={handleDeleteCancel}
                isDeleting={deleteConfirmation.isDeleting}
            />
        </>
    );
}
