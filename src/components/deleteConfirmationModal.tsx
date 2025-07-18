"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileData } from "@/utils/fileUtils";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    file: FileData | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    file,
    onConfirm,
    onCancel,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    if (!file) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="w-[30vw] max-w-none">
                <DialogHeader>
                    <DialogTitle>Delete File</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You have chosen to delete the file <span className="font-semibold">{file.name}</span>. This cannot be undone. Do you wish to continue?
                    </p>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            onClick={onConfirm}
                            className="w-32 bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Continue"}
                        </Button>
                        <Button
                            type="button"
                            onClick={onCancel}
                            className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
