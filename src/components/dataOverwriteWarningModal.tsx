"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type WarningType = 'upload-and-parse' | 'refresh-parsing';

interface DataOverwriteWarningModalProps {
    isOpen: boolean;
    type: WarningType;
    fileName?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
}

export function DataOverwriteWarningModal({
    isOpen,
    type,
    fileName,
    onConfirm,
    onCancel,
    isProcessing = false
}: DataOverwriteWarningModalProps) {
    const getTitle = () => {
        switch (type) {
            case 'upload-and-parse':
                return 'Parse New Document';
            case 'refresh-parsing':
                return 'Refresh Profile Data';
            default:
                return 'Warning';
        }
    };

    const getMessage = () => {
        switch (type) {
            case 'upload-and-parse':
                return (
                    <>
                        <p className="text-sm text-muted-foreground mb-3">
                            You are about to parse <span className="font-semibold">{fileName}</span> and update your profile data.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-amber-600">Warning:</span> This will overwrite any manual changes you&apos;ve made to your profile information. 
                            The new document data will replace your current profile data.
                        </p>
                    </>
                );
            case 'refresh-parsing':
                return (
                    <>
                        <p className="text-sm text-muted-foreground mb-3">
                            You are about to re-parse all your uploaded documents and refresh your profile data.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-amber-600">Warning:</span> This will overwrite any manual changes you&apos;ve made to your profile information. 
                            All profile data will be regenerated from your uploaded documents.
                        </p>
                    </>
                );
            default:
                return null;
        }
    };

    const getConfirmText = () => {
        switch (type) {
            case 'upload-and-parse':
                return isProcessing ? 'Parsing...' : 'Parse Document';
            case 'refresh-parsing':
                return isProcessing ? 'Refreshing...' : 'Refresh Data';
            default:
                return 'Continue';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="w-[35vw] max-w-none">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {getMessage()}

                    <div className="flex justify-end space-x-4 pt-2">
                        <Button
                            type="button"
                            onClick={onConfirm}
                            className="w-36 bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={isProcessing}
                        >
                            {getConfirmText()}
                        </Button>
                        <Button
                            type="button"
                            onClick={onCancel}
                            className="w-32 bg-gray-500 hover:bg-gray-600 text-white"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
