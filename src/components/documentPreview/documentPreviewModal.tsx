"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileData } from "@/utils/fileUtils";
import { PreviewToolbar } from "./previewToolbar";
import { DocumentViewer } from "./documentViewer";

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileData | null;
}

export function DocumentPreviewModal({
    isOpen,
    onClose,
    file
}: DocumentPreviewModalProps) {
    console.log('=== DocumentPreviewModal ===');
    console.log('isOpen:', isOpen);
    console.log('file:', file);

    if (!file) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[85vw] h-[85vh] max-w-none p-0 flex flex-col">
                {/* Toolbar */}
                <PreviewToolbar
                    file={file}
                    onClose={onClose}
                />

                {/* Document viewer */}
                <div className="flex-1 overflow-hidden">
                    <DocumentViewer
                        file={file}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
