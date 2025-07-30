'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { GenericDeleteModal } from '../genericDeleteModal';
import { toast } from 'sonner';

interface SkillsSectionProps {
    skills: string[];
    isLoading?: boolean;
    onAddSkill?: (newSkill: string | string[]) => Promise<void>;
    onDeleteSkill?: (skillToDelete: string) => Promise<void>;
}

export default function SkillsSection({
    skills,
    isLoading = false,
    onAddSkill,
    onDeleteSkill
}: SkillsSectionProps) {
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [newSkillInput, setNewSkillInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        skill: string | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        skill: null,
        isDeleting: false,
    });

    const handleAddSkill = () => {
        setIsAddingSkill(true);
        setNewSkillInput('');
    };

    const handleCancelAdd = () => {
        setIsAddingSkill(false);
        setNewSkillInput('');
    };

    const handleSubmitNewSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = newSkillInput.trim();

        if (!trimmedInput) return;

        // Split by comma and clean up each skill
        const inputSkills = trimmedInput
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);

        // Separate new skills from duplicates
        const newSkills: string[] = [];
        const duplicateSkills: string[] = [];

        inputSkills.forEach(skill => {
            const isDuplicate = skills.some(existingSkill =>
                existingSkill.toLowerCase() === skill.toLowerCase()
            );

            if (isDuplicate) {
                duplicateSkills.push(skill);
            } else {
                newSkills.push(skill);
            }
        });

        // Show messages for duplicates
        if (duplicateSkills.length > 0) {
            if (duplicateSkills.length === 1) {
                toast.info(`"${duplicateSkills[0]}" is already in your skills list`);
            } else {
                toast.info(`${duplicateSkills.length} skills were already in your list: ${duplicateSkills.join(', ')}`);
            }
        }

        if (newSkills.length === 0) {
            // All skills were duplicates
            handleCancelAdd();
            return;
        }

        setIsSubmitting(true);
        try {
            if (onAddSkill) {
                // Add all new skills in a single operation
                await onAddSkill(newSkills);
            }
            handleCancelAdd();
        } catch (error) {
            console.error('Error adding skills:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSkill = (skill: string) => {
        setDeleteConfirmation({
            isOpen: true,
            skill: skill,
            isDeleting: false,
        });
    };

    const handleConfirmedDelete = async () => {
        if (!deleteConfirmation.skill) return;

        setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

        try {
            if (onDeleteSkill) {
                await onDeleteSkill(deleteConfirmation.skill);
            }
            // Close the confirmation modal
            setDeleteConfirmation({
                isOpen: false,
                skill: null,
                isDeleting: false,
            });
        } catch (error) {
            console.error("Error deleting skill:", error);
            setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({
            isOpen: false,
            skill: null,
            isDeleting: false,
        });
    };

    if (isLoading) {
        return (
            <div className="border border-border rounded-lg bg-card">
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-6 bg-muted rounded w-1/4"></div>
                            <div className="h-5 w-5 bg-muted rounded"></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-6 bg-muted rounded w-16"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg bg-card">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        Skills
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={handleAddSkill}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                {skills.length > 0 || isAddingSkill ? (
                    <div className="space-y-3">
                        {/* Skills badges */}
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1 hover:bg-muted-foreground/20"
                                >
                                    <span>{skill}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                                        onClick={() => handleDeleteSkill(skill)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>

                        {/* Add skill form */}
                        {isAddingSkill && (
                            <form onSubmit={handleSubmitNewSkill} className="flex items-center gap-2">
                                <Input
                                    value={newSkillInput}
                                    onChange={(e) => setNewSkillInput(e.target.value)}
                                    placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                                    className="flex-1"
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    disabled={isSubmitting || !newSkillInput.trim()}
                                >
                                    {isSubmitting ? 'Adding...' : 'Add'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelAdd}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-muted-foreground mb-4">
                            <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <h3 className="text-sm font-medium text-foreground mb-2">
                                No skills yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Add your professional and technical skills to showcase your expertise. You can add multiple skills at once by separating them with commas.
                            </p>
                        </div>
                        <Button onClick={handleAddSkill}>
                            Add skill
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <GenericDeleteModal
                isOpen={deleteConfirmation.isOpen}
                onConfirm={handleConfirmedDelete}
                onCancel={handleDeleteCancel}
                isDeleting={deleteConfirmation.isDeleting}
                title="Delete Skill"
                message={
                    deleteConfirmation.skill
                        ? `You have chosen to delete the "${deleteConfirmation.skill}" skill. This cannot be undone. Do you wish to continue?`
                        : ""
                }
            />
        </div>
    );
}
