'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ContactInformation {
    fullName: string;
    email: string[];
    phones: string[];
}

interface EditContactFormProps {
    contactInfo: ContactInformation | null;
    onSave: (updatedContact: ContactInformation) => Promise<void>;
    onCancel: () => void;
    isInitialized?: boolean;
}

export default function EditContactForm({
    contactInfo,
    onSave,
    onCancel,
    isInitialized = false
}: EditContactFormProps) {
    const [formData, setFormData] = useState<ContactInformation>({
        fullName: '',
        email: [''],
        phones: ['']
    });
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form data when component mounts or contactInfo changes
    useEffect(() => {
        if (isInitialized && contactInfo) {
            setFormData({
                fullName: contactInfo.fullName || '',
                email: contactInfo.email.length > 0 ? [...contactInfo.email] : [''],
                phones: contactInfo.phones.length > 0 ? [...contactInfo.phones] : ['']
            });
        }
    }, [isInitialized, contactInfo]);

    const handleFullNameChange = (value: string) => {
        setFormData(prev => ({ ...prev, fullName: value }));
    };

    const handleEmailChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            email: prev.email.map((email, i) => i === index ? value : email)
        }));
    };

    const handlePhoneChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            phones: prev.phones.map((phone, i) => i === index ? value : phone)
        }));
    };

    const addEmail = () => {
        setFormData(prev => ({
            ...prev,
            email: [...prev.email, '']
        }));
    };

    const removeEmail = (index: number) => {
        if (formData.email.length > 1) {
            setFormData(prev => ({
                ...prev,
                email: prev.email.filter((_, i) => i !== index)
            }));
        }
    };

    const addPhone = () => {
        setFormData(prev => ({
            ...prev,
            phones: [...prev.phones, '']
        }));
    };

    const removePhone = (index: number) => {
        if (formData.phones.length > 1) {
            setFormData(prev => ({
                ...prev,
                phones: prev.phones.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSave = async () => {
        // Validate required fields
        if (!formData.fullName.trim()) {
            toast.error('Full name is required');
            return;
        }

        // Filter out empty emails and phones
        const cleanedData = {
            fullName: formData.fullName.trim(),
            email: formData.email.filter(email => email.trim()),
            phones: formData.phones.filter(phone => phone.trim())
        };

        try {
            setIsLoading(true);
            await onSave(cleanedData);
            toast.success('Contact information updated successfully');
        } catch (error) {
            console.error('Error saving contact information:', error);
            toast.error('Failed to save contact information');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                    Full name*
                </Label>
                <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                />
            </div>

            {/* Email Addresses */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Email addresses</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addEmail}
                        className="h-6 px-2 text-xs"
                    >
                        + Add
                    </Button>
                </div>
                <div className="space-y-2">
                    {formData.email.map((email, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Input
                                value={email}
                                onChange={(e) => handleEmailChange(index, e.target.value)}
                                placeholder="email@example.com"
                                type="email"
                                className="flex-1"
                            />
                            {formData.email.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEmail(index)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Phone Numbers */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Phone numbers</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addPhone}
                        className="h-6 px-2 text-xs"
                    >
                        + Add
                    </Button>
                </div>
                <div className="space-y-2">
                    {formData.phones.map((phone, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Input
                                value={phone}
                                onChange={(e) => handlePhoneChange(index, e.target.value)}
                                placeholder="(555) 123-4567"
                                type="tel"
                                className="flex-1"
                            />
                            {formData.phones.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePhone(index)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="min-w-[80px]"
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
    );
}
