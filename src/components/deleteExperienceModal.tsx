"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface JobHistoryItem {
    title: string;
    company: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    currentlyWorking: boolean;
    jobDescription: string;
    accomplishments: string[];
}

interface DeleteExperienceModalProps {
    isOpen: boolean;
    job: JobHistoryItem | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export function DeleteExperienceModal({
    isOpen,
    job,
    onConfirm,
    onCancel,
    isDeleting = false
}: DeleteExperienceModalProps) {
    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="w-[30vw] max-w-none">
                <DialogHeader>
                    <DialogTitle>Delete Experience</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You have chosen to delete the <span className="font-semibold">{job.title}</span> position at <span className="font-semibold">{job.company}</span>. This cannot be undone. Do you wish to continue?
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
