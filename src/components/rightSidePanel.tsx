"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DocumentPlusIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BackgroundForm from "@/components/forms/backgroundForm";
import { FileCard } from "@/components/fileCard";

export function RightSidePanel() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock data for uploaded files - this will be replaced with real data later
    const uploadedFiles = [
        {
            id: 1,
            name: "Resume_2024.pdf",
            type: "PDF",
            uploadDate: "2024-12-15",
            size: "245 KB"
        },
        {
            id: 2,
            name: "Cover_Letter_TechCorp.docx",
            type: "DOCX",
            uploadDate: "2024-12-14",
            size: "89 KB"
        },
        {
            id: 3,
            name: "Portfolio_Projects.pdf",
            type: "PDF",
            uploadDate: "2024-12-10",
            size: "1.2 MB"
        }
    ];

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
                                        // TODO: Implement parse functionality
                                        console.log("Trigger parsing historical documents");
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
                        <div className="space-y-3">
                            {uploadedFiles.map((file) => (
                                <FileCard
                                    key={file.id}
                                    file={file}
                                    onView={(file) => {
                                        console.log("View file:", file.name);
                                    }}
                                    onDelete={(file) => {
                                        console.log("Delete file:", file.name);
                                    }}
                                />
                            ))}

                            {uploadedFiles.length === 0 && (
                                <div className="h-32 bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground text-sm">
                                            No files uploaded yet
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="w-[40vw] max-w-none max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Background</DialogTitle>
                    </DialogHeader>
                    <BackgroundForm
                        isSubmitting={isSubmitting}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
