"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    BriefcaseIcon,
    EyeIcon,
    PencilIcon
} from "@heroicons/react/24/outline";

export interface JobData {
    id: string;
    company: string;
    title: string;
    applicationDeadline: string | null;
    status: 'interested' | 'applied' | 'interview' | 'completed';
    dateAdded: string; // ISO date string
    url: string | null;
    fullTextPath: string;
}

interface JobCardProps {
    job: JobData;
    onView?: (job: JobData) => void;
    onEdit?: (job: JobData) => void;
    isDragging?: boolean;
    onDragStart?: (jobId: string) => void;
}

export function JobCard({ job, onView, onEdit, isDragging = false, onDragStart }: JobCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', job.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(job.id);
    };

    const handleDragEnd = () => {
        // Reset dragging state when drag ends
        onDragStart?.('');
    };

    return (
        <Card
            className={`relative p-4 border border-border cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:shadow-md hover:scale-105'
                }`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Main content with icon on left, text left-aligned */}
            <div className="flex items-start space-x-3">
                {/* Job icon */}
                <div className="flex-shrink-0">
                    <BriefcaseIcon className="h-8 w-8 text-blue-500" />
                </div>

                {/* Text content - left aligned */}
                <div className="flex-1 min-w-0">
                    {/* Company name - bold */}
                    <div className="font-semibold text-sm break-words">
                        {job.company}
                    </div>

                    {/* Job title */}
                    <div className="text-sm text-foreground mt-1 break-words">
                        {job.title}
                    </div>

                    {/* Date added */}
                    <div className="text-xs text-muted-foreground mt-1">
                        Added: {new Date(job.dateAdded).toLocaleDateString()}
                    </div>

                    {/* Application deadline if present */}
                    {job.applicationDeadline && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Deadline: {job.applicationDeadline}
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons positioned in bottom right */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-foreground hover:bg-muted"
                    onClick={() => onView?.(job)}
                    title="View job details"
                >
                    <EyeIcon className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-foreground hover:bg-muted"
                    onClick={() => onEdit?.(job)}
                    title="Edit job"
                >
                    <PencilIcon className="h-3 w-3" />
                </Button>
            </div>
        </Card>
    );
}
