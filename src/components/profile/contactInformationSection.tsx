'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { User } from 'firebase/auth';
import EditContactModal from './editContactModal';
import { storeStructuredHistoryHttp } from '@/utils/firebaseFunctions';

interface ContactInformation {
    fullName: string;
    email: string[];
    phones: string[];
    primaryEmailIndex?: number;
    primaryPhoneIndex?: number;
}

interface ContactInformationSectionProps {
    contactInfo: ContactInformation | null;
    user: User | null;
    isLoading?: boolean;
    onDataRefresh?: () => Promise<void>;
}

export default function ContactInformationSection({
    contactInfo,
    user,
    isLoading = false,
    onDataRefresh
}: ContactInformationSectionProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    // Handle setting primary email
    const handleSetPrimaryEmail = async (index: number) => {
        if (!user || !contactInfo) return;

        try {
            const updatedContact = {
                ...contactInfo,
                primaryEmailIndex: index
            };
            await handleSaveContact(updatedContact);
        } catch (error) {
            console.error('Error setting primary email:', error);
            toast.error('Failed to set primary email');
        }
    };

    // Handle setting primary phone
    const handleSetPrimaryPhone = async (index: number) => {
        if (!user || !contactInfo) return;

        try {
            const updatedContact = {
                ...contactInfo,
                primaryPhoneIndex: index
            };
            await handleSaveContact(updatedContact);
        } catch (error) {
            console.error('Error setting primary phone:', error);
            toast.error('Failed to set primary phone');
        }
    };

    const handleSaveContact = async (updatedContact: ContactInformation) => {
        if (!user) {
            toast.error('User not authenticated');
            return;
        }

        try {
            // Get the current full structured data to preserve other sections
            const currentDataResponse = await fetch(
                `https://us-central1-ai-resume-writer-46403.cloudfunctions.net/getStructuredHistoryHttp?userId=${user.uid}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!currentDataResponse.ok) {
                throw new Error('Failed to fetch current data');
            }

            const currentResult = await currentDataResponse.json();
            const currentData = currentResult.data || {};

            // Update only the contact information, preserving Firebase structure
            const updatedData = {
                ...currentData,
                contactInformation: {
                    contactInformation: {
                        fullName: updatedContact.fullName,
                        email: updatedContact.email,
                        phone: updatedContact.phones, // Note: Firebase expects "phone" not "phones"
                        address: currentData.contactInformation?.contactInformation?.address || '',
                        linkedinUrl: currentData.contactInformation?.contactInformation?.linkedinUrl || '',
                        portfolioUrl: currentData.contactInformation?.contactInformation?.portfolioUrl || '',
                        githubUrl: currentData.contactInformation?.contactInformation?.githubUrl || '',
                        primaryEmailIndex: updatedContact.primaryEmailIndex ?? 0,
                        primaryPhoneIndex: updatedContact.primaryPhoneIndex ?? 0
                    }
                }
            };

            // Save the updated data
            await storeStructuredHistoryHttp(user.uid, updatedData);

            // Refresh the data if callback provided
            if (onDataRefresh) {
                await onDataRefresh();
            }
        } catch (error) {
            console.error('Error updating contact information:', error);
            throw error; // Re-throw to let the modal handle it
        }
    };    // Determine the name to display
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
        <>
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
                                        {contactInfo.phones.map((phone, index) => {
                                            const isPrimary = (contactInfo.primaryPhoneIndex ?? 0) === index;
                                            return (
                                                <div key={index} className="flex items-center space-x-2 group">
                                                    <button
                                                        onClick={() => handleSetPrimaryPhone(index)}
                                                        className="flex-shrink-0 w-3 h-3 rounded-full border-2 transition-all duration-200 hover:scale-110"
                                                        style={{
                                                            backgroundColor: isPrimary ? '#22c55e' : 'transparent',
                                                            borderColor: isPrimary ? '#22c55e' : '#9ca3af'
                                                        }}
                                                        title={isPrimary ? 'Primary phone' : 'Click to set as primary'}
                                                    />
                                                    <div className="text-xs text-foreground">
                                                        {phone}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                                        {contactInfo.email.map((email, index) => {
                                            const isPrimary = (contactInfo.primaryEmailIndex ?? 0) === index;
                                            return (
                                                <div key={index} className="flex items-start space-x-2 group">
                                                    <button
                                                        onClick={() => handleSetPrimaryEmail(index)}
                                                        className="flex-shrink-0 w-3 h-3 rounded-full border-2 transition-all duration-200 hover:scale-110 mt-0.5"
                                                        style={{
                                                            backgroundColor: isPrimary ? '#22c55e' : 'transparent',
                                                            borderColor: isPrimary ? '#22c55e' : '#9ca3af'
                                                        }}
                                                        title={isPrimary ? 'Primary email' : 'Click to set as primary'}
                                                    />
                                                    <div className="text-xs text-foreground break-words">
                                                        {email}
                                                    </div>
                                                </div>
                                            );
                                        })}
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

            {/* Edit Contact Modal */}
            <EditContactModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                contactInfo={contactInfo}
                onSave={handleSaveContact}
            />
        </>
    );
}
