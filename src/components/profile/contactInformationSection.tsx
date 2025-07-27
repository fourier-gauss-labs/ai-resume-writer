'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { User } from 'firebase/auth';

interface ContactInformation {
    fullName: string;
    email: string[];
    phones: string[];
}

interface ContactInformationSectionProps {
    contactInfo: ContactInformation | null;
    user: User | null;
    isLoading?: boolean;
}

export default function ContactInformationSection({
    contactInfo,
    user,
    isLoading = false
}: ContactInformationSectionProps) {
    console.log('=== ContactInformationSection render ===');
    console.log('contactInfo:', contactInfo);
    console.log('user:', user);
    console.log('isLoading:', isLoading);

    const handleEdit = () => {
        toast.info("Edit functionality coming soon!");
    };

    // Determine the name to display
    const displayName = contactInfo?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Name Not Available';

    if (isLoading) {
        return (
            <Card className="border border-border p-4 mb-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-3 w-1/3"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border border-border p-4 mb-4">
            <div className="relative">
                {/* Header with name and edit button - no section title */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm">
                        {displayName}
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-foreground hover:bg-muted"
                        onClick={handleEdit}
                    >
                        <PencilIcon className="h-3 w-3" />
                    </Button>
                </div>

                {/* Contact details - side by side layout */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Phone numbers column */}
                    <div className="space-y-2">
                        {contactInfo?.phones && contactInfo.phones.length > 0 ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">Phone</span>
                                </div>
                                <div className="pl-6 space-y-1">
                                    {contactInfo.phones.map((phone, index) => (
                                        <div key={index} className="text-xs text-foreground">
                                            {phone}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <PhoneIcon className="h-4 w-4" />
                                <span className="text-xs">No phone number</span>
                            </div>
                        )}
                    </div>

                    {/* Email addresses column */}
                    <div className="space-y-2">
                        {contactInfo?.email && contactInfo.email.length > 0 ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">Email</span>
                                </div>
                                <div className="pl-6 space-y-1">
                                    {contactInfo.email.map((email, index) => (
                                        <div key={index} className="text-xs text-foreground break-words">
                                            {email}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : user?.email ? (
                            // Fallback to user's auth email if no parsed email
                            <>
                                <div className="flex items-center space-x-2">
                                    <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">Email</span>
                                </div>
                                <div className="pl-6">
                                    <div className="text-xs text-foreground break-words">
                                        {user.email}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <EnvelopeIcon className="h-4 w-4" />
                                <span className="text-xs">No email address</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
