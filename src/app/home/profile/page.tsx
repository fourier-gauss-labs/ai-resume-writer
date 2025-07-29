"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RightSidePanel } from "@/components/rightSidePanel";
import ContactInformationSection from "@/components/profile/contactInformationSection";
import ExperienceSection from "@/components/profile/experienceSection";
import ExperienceFullView from "@/components/profile/experienceFullView";
import { useStructuredHistory } from "@/hooks/useStructuredHistory";
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

type ProfileView = 'main' | 'experience';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { data, isLoading, refetch } = useStructuredHistory();
    const [currentView, setCurrentView] = useState<ProfileView>('main');

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    const handleShowExperience = () => {
        setCurrentView('experience');
    };

    const handleBackToMain = () => {
        setCurrentView('main');
    };

    const handleUpdateJob = async (updatedJob: JobHistoryItem, originalJob: JobHistoryItem) => {
        // TODO: Implement API call to update job
        console.log('Updating job:', updatedJob, 'Original:', originalJob);
        toast.success('Experience updated successfully!');
        await refetch(); // Refresh the data
    };

    const handleAddJob = async (newJob: JobHistoryItem) => {
        // TODO: Implement API call to add job
        console.log('Adding job:', newJob);
        toast.success('Experience added successfully!');
        await refetch(); // Refresh the data
    };

    const handleDeleteJob = async (jobToDelete: JobHistoryItem) => {
        // TODO: Implement API call to delete job
        console.log('Deleting job:', jobToDelete);
        toast.success('Experience deleted successfully!');
        await refetch(); // Refresh the data
    };

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    return (
        <div className="h-full flex">
            {/* Main content area - takes remaining space */}
            <div className="flex-1 pr-4">
                {currentView === 'main' ? (
                    <div className="p-4">
                        {/* Profile sections */}
                        <div className="space-y-0">
                            <ContactInformationSection
                                contactInfo={data.contactInformation}
                                user={user}
                                isLoading={isLoading}
                                onDataRefresh={refetch}
                            />
                            <ExperienceSection
                                jobHistory={data.jobHistory}
                                isLoading={isLoading}
                                onDataRefresh={refetch}
                                onShowAllExperiences={handleShowExperience}
                            />
                        </div>
                    </div>
                ) : currentView === 'experience' ? (
                    <ExperienceFullView
                        jobHistory={data.jobHistory}
                        onBack={handleBackToMain}
                        onUpdateJob={handleUpdateJob}
                        onAddJob={handleAddJob}
                        onDeleteJob={handleDeleteJob}
                        isLoading={isLoading}
                    />
                ) : null}
            </div>

            {/* Right Side Panel - fixed width */}
            <RightSidePanel onDataRefresh={refetch} />
        </div>
    );
}
