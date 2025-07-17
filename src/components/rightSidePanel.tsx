"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DocumentPlusIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BackgroundForm from "@/components/forms/backgroundForm";

export function RightSidePanel() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

                    {/* Files content area for now */}
                    <div className="flex-1 p-4">
                        <div className="h-full bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-sm">
                                    File list will be implemented here
                                </p>
                            </div>
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
