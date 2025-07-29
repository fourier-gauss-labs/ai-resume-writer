'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, Award } from 'lucide-react';

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface CertificationSectionProps {
    certifications: CertificationItem[];
    isLoading?: boolean;
    onShowAllCertifications?: () => void;
}

// Component for individual certification entry
function CertificationEntry({ certification }: { certification: CertificationItem }) {
    const formatDate = () => {
        return `${certification.issuedDate.month} ${certification.issuedDate.year}`;
    };

    return (
        <div className="py-3">
            <div className="flex items-start space-x-3">
                {/* Certification icon */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center">
                        <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                {/* Certification details */}
                <div className="flex-1 min-w-0">
                    {/* Certification name */}
                    <h4 className="font-medium text-sm text-foreground">
                        {certification.certName}
                    </h4>

                    {/* Issuer */}
                    <div className="text-sm text-muted-foreground mt-1">
                        {certification.issuer}
                    </div>

                    {/* Issue date */}
                    <div className="text-sm text-muted-foreground mt-1">
                        Issued {formatDate()}
                    </div>

                    {/* Credential ID if available */}
                    {certification.credentialId && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Credential ID: {certification.credentialId}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CertificationSection({
    certifications,
    isLoading = false,
    onShowAllCertifications
}: CertificationSectionProps) {

    if (isLoading) {
        return (
            <div className="border border-border rounded-lg bg-card">
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-6 bg-muted rounded w-1/3"></div>
                            <div className="h-5 w-5 bg-muted rounded"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-muted rounded"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-2/3"></div>
                                        <div className="h-4 bg-muted rounded w-1/2"></div>
                                        <div className="h-3 bg-muted rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Sort certifications by issue date (most recent first)
    const sortedCertifications = [...(certifications || [])].sort((a, b) => {
        const aYear = parseInt(a.issuedDate.year);
        const bYear = parseInt(b.issuedDate.year);
        if (aYear !== bYear) return bYear - aYear;

        // If same year, sort by month
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const aMonth = months.indexOf(a.issuedDate.month);
        const bMonth = months.indexOf(b.issuedDate.month);
        return bMonth - aMonth;
    });

    // Show first 3 certifications only
    const displayedCertifications = sortedCertifications.slice(0, 3);
    const hasMoreCertifications = sortedCertifications.length > 3;

    return (
        <div className="border border-border rounded-lg bg-card">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        Licenses & certifications
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => onShowAllCertifications && onShowAllCertifications()}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                {sortedCertifications.length > 0 ? (
                    <>
                        {/* Certification entries */}
                        <div className="space-y-0 divide-y divide-border">
                            {displayedCertifications.map((certification, index) => (
                                <CertificationEntry key={index} certification={certification} />
                            ))}
                        </div>

                        {/* Show all certifications link (when has more than 3) */}
                        {hasMoreCertifications && onShowAllCertifications && (
                            <div className="pt-3 border-t border-border mt-3">
                                <button
                                    onClick={onShowAllCertifications}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center"
                                >
                                    Show all {sortedCertifications.length} certification{sortedCertifications.length !== 1 ? 's' : ''} →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-foreground mb-2">
                            No certifications yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Add your professional certifications and licenses to showcase your expertise.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
