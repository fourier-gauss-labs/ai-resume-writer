"use client";

import { Button } from "@/components/ui/button";
import {
    XMarkIcon,
    PrinterIcon,
    ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { FileData } from "@/utils/fileUtils";

interface PreviewToolbarProps {
    file: FileData;
    onClose: () => void;
}

export function PreviewToolbar({ file, onClose }: PreviewToolbarProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            {/* File name and info */}
            <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold truncate max-w-md">
                    {file.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                    {file.type} • {file.size}
                </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    className="flex items-center space-x-1"
                >
                    <PrinterIcon className="h-4 w-4" />
                    <span>Print</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center space-x-1"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Download</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="flex items-center space-x-1"
                >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Close</span>
                </Button>
            </div>
        </div>
    );
}
