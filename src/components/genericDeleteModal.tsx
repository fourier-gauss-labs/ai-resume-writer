"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GenericDeleteModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
    title: string;
    message: string;
}

export function GenericDeleteModal({
    isOpen,
    onConfirm,
    onCancel,
    isDeleting = false,
    title,
    message
}: GenericDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="w-[30vw] max-w-none">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {message}
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
