'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface JobHistoryItem {
    title: string;
    company: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    currentlyWorking: boolean;
    jobDescription: string;
    accomplishments: string[];
}

interface ExperienceSectionProps {
    jobHistory: JobHistoryItem[];
    isLoading?: boolean;
}

export default function ExperienceSection({
    jobHistory,
    isLoading = false
}: ExperienceSectionProps) {
    const handleEdit = () => {
        toast.info("Edit functionality coming soon!");
    };

    if (isLoading) {
        return (
            <Card className="border border-border p-4 mb-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-3 w-1/3"></div>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="h-3 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Show the first job or a placeholder
    const firstJob = jobHistory && jobHistory.length > 0 ? jobHistory[0] : null;

    return (
        <Card className="border border-border p-4 mb-4">
            <div className="relative">
                {/* Header with edit button */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm">Experience</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-foreground hover:bg-muted"
                        onClick={handleEdit}
                    >
                        <PencilIcon className="h-3 w-3" />
                    </Button>
                </div>

                {firstJob ? (
                    <div className="flex items-start space-x-3">
                        {/* Job icon */}
                        <div className="flex-shrink-0">
                            <BriefcaseIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                        </div>

                        {/* Job details */}
                        <div className="flex-1 min-w-0">
                            {/* Job title - bold */}
                            <div className="font-semibold text-xs break-words">
                                {firstJob.title}
                            </div>

                            {/* Company */}
                            <div className="text-xs text-muted-foreground mt-1">
                                {firstJob.company}
                            </div>

                            {/* Date range */}
                            <div className="text-xs text-muted-foreground mt-1">
                                {firstJob.startDate.month} {firstJob.startDate.year} - {
                                    firstJob.currentlyWorking
                                        ? 'Present'
                                        : `${firstJob.endDate.month} ${firstJob.endDate.year}`
                                }
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground">
                        No work experience available. Parse your documents or add manually.
                    </div>
                )}

                {/* Show count if more than one job */}
                {jobHistory && jobHistory.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-2">
                        +{jobHistory.length - 1} more position{jobHistory.length > 2 ? 's' : ''}
                    </div>
                )}
            </div>
        </Card>
    );
}
