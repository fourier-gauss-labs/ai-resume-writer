"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { JobData } from "@/components/jobs/jobCard";
import { JobPreviewToolbar } from "./jobPreviewToolbar";
import { JobTextViewer } from "./jobTextViewer";

interface JobPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobData | null;
}

export function JobPreviewModal({
    isOpen,
    onClose,
    job
}: JobPreviewModalProps) {
    console.log('=== JobPreviewModal ===');
    console.log('isOpen:', isOpen);
    console.log('job:', job);

    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[85vw] h-[85vh] max-w-none p-0 flex flex-col">
                {/* Toolbar */}
                <JobPreviewToolbar
                    job={job}
                    onClose={onClose}
                />

                {/* Job text viewer */}
                <div className="flex-1 overflow-hidden">
                    <JobTextViewer job={job} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
