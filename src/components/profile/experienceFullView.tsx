'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, PencilIcon } from 'lucide-react';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
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

interface ExperienceFullViewProps {
    jobHistory: JobHistoryItem[];
    onBack: () => void;
    isLoading?: boolean;
}

// Component for individual job entry in full view
function JobEntryFull({ job }: { job: JobHistoryItem }) {
    const formatDateRange = () => {
        const startDate = `${job.startDate.month} ${job.startDate.year}`;
        const endDate = job.currentlyWorking ? 'Present' : `${job.endDate.month} ${job.endDate.year}`;
        return `${startDate} - ${endDate}`;
    };

    const handleEdit = () => {
        toast.info(`Edit job: ${job.title} at ${job.company}`);
        // TODO: Open individual job edit modal
    };

    return (
        <div className="py-6">
            <div className="flex items-start space-x-4">
                {/* Company logo placeholder */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <BriefcaseIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>

                {/* Job details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* Job title */}
                            <h3 className="font-semibold text-base text-foreground">
                                {job.title}
                            </h3>

                            {/* Company */}
                            <div className="text-sm text-muted-foreground mt-1">
                                {job.company}
                            </div>

                            {/* Date range */}
                            <div className="text-sm text-muted-foreground mt-2">
                                {formatDateRange()}
                                {job.currentlyWorking && (
                                    <span className="text-sm text-green-600 ml-2">• Current</span>
                                )}
                            </div>
                        </div>

                        {/* Edit button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={handleEdit}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Job description */}
                    {job.jobDescription && (
                        <div className="text-sm text-foreground mt-4 leading-relaxed">
                            {job.jobDescription}
                        </div>
                    )}

                    {/* Accomplishments */}
                    {job.accomplishments && job.accomplishments.length > 0 && (
                        <div className="mt-4">
                            <ul className="text-sm text-foreground space-y-2">
                                {job.accomplishments.map((accomplishment, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-muted-foreground mr-3 mt-2">•</span>
                                        <span className="leading-relaxed">{accomplishment}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ExperienceFullView({
    jobHistory,
    onBack,
    isLoading = false
}: ExperienceFullViewProps) {
    const handleAddExperience = () => {
        toast.info("Add experience functionality coming soon!");
        // TODO: Open add experience modal
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded mb-6 w-1/4"></div>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-border rounded-lg p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-muted rounded"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-muted rounded w-1/2"></div>
                                        <div className="h-4 bg-muted rounded w-1/3"></div>
                                        <div className="h-4 bg-muted rounded w-1/4"></div>
                                        <div className="h-4 bg-muted rounded w-3/4"></div>
                                        <div className="h-4 bg-muted rounded w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Sort jobs: current jobs first, then by start date (most recent first)
    const sortedJobs = [...(jobHistory || [])].sort((a, b) => {
        // Current jobs first
        if (a.currentlyWorking && !b.currentlyWorking) return -1;
        if (!a.currentlyWorking && b.currentlyWorking) return 1;

        // Then by start year (most recent first)
        const aYear = parseInt(a.startDate.year);
        const bYear = parseInt(b.startDate.year);
        return bYear - aYear;
    });

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Back button */}
                            <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={onBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>

                            {/* Title */}
                            <h1 className="text-2xl font-semibold text-foreground">
                                Experience
                            </h1>
                        </div>

                        {/* Add experience button */}
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleAddExperience}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {sortedJobs.length > 0 ? (
                    <div className="border border-border rounded-lg bg-card p-6">
                        <div className="space-y-0 divide-y divide-border">
                            {sortedJobs.map((job, index) => (
                                <JobEntryFull key={index} job={job} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BriefcaseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            No work experience yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Parse your documents or add your work experience manually.
                        </p>
                        <Button onClick={handleAddExperience}>
                            Add experience
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
