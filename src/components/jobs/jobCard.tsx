"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    BriefcaseIcon,
    EyeIcon,
    PencilIcon,
    DocumentTextIcon,
    DocumentIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import {
    Plus,
    Archive,
    MoreVertical
} from "lucide-react";

export interface JobData {
    id: string;
    company: string;
    title: string;
    applicationDeadline: string | null;
    status: 'interested' | 'applied' | 'interview' | 'completed';
    dateAdded: string; // ISO date string
    url: string | null;
    fullTextPath: string;
    // New fields for generated materials
    hasGeneratedResume?: boolean;
    hasGeneratedCoverLetter?: boolean;
    resumeId?: string;
    coverLetterId?: string;
}
interface JobCardProps {
    job: JobData;
    onView?: (job: JobData) => void;
    onEdit?: (job: JobData) => void;
    onOpen?: (job: JobData) => void;
    onGenerateResume?: (job: JobData) => void;
    onGenerateCoverLetter?: (job: JobData) => void;
    onViewResume?: (job: JobData) => void;
    onViewCoverLetter?: (job: JobData) => void;
    onArchive?: (job: JobData) => void;
    isDragging?: boolean;
    onDragStart?: (jobId: string) => void;
}

export function JobCard({
    job,
    onView,
    onEdit,
    onOpen,
    onGenerateResume,
    onGenerateCoverLetter,
    onViewResume,
    onViewCoverLetter,
    onArchive,
    isDragging = false,
    onDragStart
}: JobCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', job.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(job.id);
    };

    const handleDragEnd = () => {
        // Reset dragging state when drag ends
        onDragStart?.('');
    };

    // Generate dynamic menu items based on job state
    const getMenuItems = () => {
        type MenuItem = {
            label: string;
            icon: any;
            action: () => void;
        } | {
            separator: true;
        };

        const items: MenuItem[] = [
            {
                label: 'Edit',
                icon: PencilIcon,
                action: () => onEdit?.(job)
            },
            {
                label: 'View',
                icon: EyeIcon,
                action: () => onView?.(job)
            }
        ];

        // Add separator before material actions
        items.push({ separator: true });

        // Resume action - smart behavior
        if (job.hasGeneratedResume) {
            items.push({
                label: 'View Resume',
                icon: DocumentTextIcon,
                action: () => onViewResume?.(job)
            });
        } else {
            items.push({
                label: 'Resume',
                icon: Plus,
                action: () => onGenerateResume?.(job)
            });
        }

        // Cover letter action - smart behavior
        if (job.hasGeneratedCoverLetter) {
            items.push({
                label: 'View Cover Letter',
                icon: DocumentIcon,
                action: () => onViewCoverLetter?.(job)
            });
        } else {
            items.push({
                label: 'Letter',
                icon: Plus,
                action: () => onGenerateCoverLetter?.(job)
            });
        }

        // Add separator before destructive actions
        items.push({ separator: true });

        items.push({
            label: 'Archive',
            icon: Archive,
            action: () => onArchive?.(job)
        });

        return items;
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
            <div className="flex items-start space-x-3 pr-8">
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

            {/* Action menu button - top right */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-60 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {getMenuItems().map((item, index) => {
                        if ('separator' in item) {
                            return <DropdownMenuSeparator key={`separator-${index}`} />;
                        }

                        const IconComponent = item.icon;
                        return (
                            <DropdownMenuItem
                                key={item.label}
                                onClick={item.action}
                                className="flex items-center space-x-2"
                            >
                                <IconComponent className="h-4 w-4" />
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Visual indicators for generated materials */}
            {(job.hasGeneratedResume || job.hasGeneratedCoverLetter) && (
                <div className="absolute bottom-2 left-2 flex space-x-1">
                    {job.hasGeneratedResume && (
                        <div
                            className="w-2 h-2 bg-green-500 rounded-full"
                            title="Resume generated"
                        />
                    )}
                    {job.hasGeneratedCoverLetter && (
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            title="Cover letter generated"
                        />
                    )}
                </div>
            )}
        </Card>
    );
}
