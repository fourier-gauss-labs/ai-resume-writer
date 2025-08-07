"use client";

import { Button } from "@/components/ui/button";
import {
    XMarkIcon,
    PrinterIcon
} from "@heroicons/react/24/outline";
import { JobData } from "@/components/jobs/jobCard";

interface JobPreviewToolbarProps {
    job: JobData;
    onClose: () => void;
}

export function JobPreviewToolbar({ job, onClose }: JobPreviewToolbarProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleOpenOriginal = () => {
        if (job.url) {
            window.open(job.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            {/* Job info */}
            <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold truncate max-w-md">
                    {job.title}
                </h2>
                <span className="text-sm text-muted-foreground">
                    {job.company}
                </span>
                <span className="text-xs text-muted-foreground">
                    Added: {new Date(job.dateAdded).toLocaleDateString()}
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

                {job.url && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenOriginal}
                        className="flex items-center space-x-1"
                    >
                        <span>🔗</span>
                        <span>Original</span>
                    </Button>
                )}

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
