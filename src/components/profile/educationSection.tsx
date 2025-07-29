'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, GraduationCap } from 'lucide-react';

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface EducationSectionProps {
    education: EducationItem[];
    isLoading?: boolean;
    onShowAllEducation: () => void;
}

// Component for individual education entry in main view
function EducationEntryPreview({ education }: { education: EducationItem }) {
    const formatDateRange = () => {
        const startDate = `${education.startDate.month} ${education.startDate.year}`;
        const endDate = `${education.endDate.month} ${education.endDate.year}`;
        return `${startDate} - ${endDate}`;
    };

    return (
        <div className="py-4">
            <div className="flex items-start space-x-4">
                {/* School logo placeholder */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>

                {/* Education details */}
                <div className="flex-1 min-w-0">
                    {/* School name */}
                    <h3 className="font-semibold text-base text-foreground">
                        {education.school}
                    </h3>

                    {/* Degree */}
                    <div className="text-sm text-muted-foreground mt-1">
                        {education.degree}
                    </div>

                    {/* Date range */}
                    <div className="text-sm text-muted-foreground mt-2">
                        {formatDateRange()}
                    </div>

                    {/* Grade */}
                    {education.grade && (
                        <div className="text-sm text-muted-foreground mt-1">
                            GPA: {education.grade}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EducationSection({
    education,
    isLoading = false,
    onShowAllEducation
}: EducationSectionProps) {

    if (isLoading) {
        return (
            <div className="border border-border rounded-lg bg-card p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-muted rounded"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-muted rounded w-1/2"></div>
                                    <div className="h-4 bg-muted rounded w-1/3"></div>
                                    <div className="h-4 bg-muted rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Sort education: most recent first
    const sortedEducation = [...(education || [])].sort((a, b) => {
        const aYear = parseInt(a.endDate.year);
        const bYear = parseInt(b.endDate.year);
        return bYear - aYear;
    });

    return (
        <div className="border border-border rounded-lg bg-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Education</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={onShowAllEducation}
                >
                    <PencilIcon className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            {sortedEducation.length > 0 ? (
                <div className="space-y-0 divide-y divide-border">
                    {sortedEducation.map((edu, index) => (
                        <EducationEntryPreview key={index} education={edu} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        No education yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Parse your documents or add your education manually.
                    </p>
                    <Button onClick={onShowAllEducation}>
                        Add education
                    </Button>
                </div>
            )}
        </div>
    );
}
