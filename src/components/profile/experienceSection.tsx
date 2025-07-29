'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

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
    onDataRefresh?: () => Promise<void>;
    onShowAllExperiences?: () => void;
}

interface JobEntryProps {
    job: JobHistoryItem;
    showFullDescription?: boolean;
}

// Component for individual job entry
function JobEntry({ job, showFullDescription = false }: JobEntryProps) {
    const [isExpanded, setIsExpanded] = useState(showFullDescription);

    const formatDateRange = () => {
        const startDate = `${job.startDate.month} ${job.startDate.year}`;
        const endDate = job.currentlyWorking ? 'Present' : `${job.endDate.month} ${job.endDate.year}`;
        return `${startDate} - ${endDate}`;
    };

    const shouldShowSeeMore = () => {
        if (showFullDescription) return false;
        const descriptionLength = job.jobDescription?.length || 0;
        const accomplishmentsLength = job.accomplishments?.length || 0;
        return descriptionLength > 150 || accomplishmentsLength > 2;
    };

    const getTruncatedDescription = () => {
        if (isExpanded || showFullDescription) return job.jobDescription;
        return job.jobDescription?.length > 150
            ? job.jobDescription.substring(0, 150) + '...'
            : job.jobDescription;
    };

    const getDisplayedAccomplishments = () => {
        if (isExpanded || showFullDescription) return job.accomplishments || [];
        return (job.accomplishments || []).slice(0, 2);
    };

    return (
        <div className="flex items-start space-x-3 py-3">
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
                        <h4 className="font-semibold text-sm text-foreground">
                            {job.title}
                        </h4>

                        {/* Company */}
                        <div className="text-sm text-muted-foreground mt-0.5">
                            {job.company}
                        </div>

                        {/* Date range */}
                        <div className="text-xs text-muted-foreground mt-1">
                            {formatDateRange()}
                            {job.currentlyWorking && (
                                <span className="text-xs text-green-600 ml-2">• Current</span>
                            )}
                        </div>
                    </div>
                </div>                {/* Job description */}
                {job.jobDescription && (
                    <div className="text-sm text-foreground mt-3">
                        {getTruncatedDescription()}
                    </div>
                )}

                {/* Accomplishments */}
                {job.accomplishments && job.accomplishments.length > 0 && (
                    <div className="mt-3">
                        <ul className="text-sm text-foreground space-y-1">
                            {getDisplayedAccomplishments().map((accomplishment, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-muted-foreground mr-2 mt-1.5">•</span>
                                    <span>{accomplishment}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Hidden accomplishments indicator */}
                        {!isExpanded && !showFullDescription && (job.accomplishments.length > 2) && (
                            <div className="text-xs text-muted-foreground mt-1 ml-4">
                                +{job.accomplishments.length - 2} more accomplishment{job.accomplishments.length > 3 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}

                {/* See more/less toggle */}
                {shouldShowSeeMore() && !showFullDescription && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-muted-foreground hover:text-foreground mt-2 font-medium"
                    >
                        {isExpanded ? 'see less' : '...see more'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ExperienceSection({
    jobHistory,
    isLoading = false,
    onDataRefresh,
    onShowAllExperiences
}: ExperienceSectionProps) {
    const handleEditSection = () => {
        if (onShowAllExperiences) {
            onShowAllExperiences();
        }
    }; if (isLoading) {
        return (
            <Card className="border border-border p-4 mb-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-muted rounded"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                    <div className="h-3 bg-muted rounded w-1/3"></div>
                                    <div className="h-3 bg-muted rounded w-1/4"></div>
                                    <div className="h-3 bg-muted rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
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

    const displayedJobs = sortedJobs.slice(0, 5);
    const hasMoreJobs = sortedJobs.length > 5;

    return (
        <>
            <Card className="border border-border p-4 mb-4">
                <div className="relative">
                    {/* Header with edit button */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-foreground">Experience</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={handleEditSection}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    {sortedJobs.length > 0 ? (
                        <div>
                            {/* Job entries */}
                            <div className="space-y-0 divide-y divide-border">
                                {displayedJobs.map((job, index) => (
                                    <JobEntry
                                        key={index}
                                        job={job}
                                    />
                                ))}
                            </div>

                            {/* Show all experiences link */}
                            {hasMoreJobs && (
                                <div className="pt-3 border-t border-border mt-3">
                                    <button
                                        onClick={() => onShowAllExperiences && onShowAllExperiences()}
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center"
                                    >
                                        Show all {sortedJobs.length} experience{sortedJobs.length !== 1 ? 's' : ''} →
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground py-8 text-center">
                            No work experience available. Parse your documents or add manually.
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
}
