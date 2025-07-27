"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RightSidePanel } from "@/components/rightSidePanel";
import ContactInformationSection from "@/components/profile/contactInformationSection";
import ExperienceSection from "@/components/profile/experienceSection";
import { useStructuredHistory } from "@/hooks/useStructuredHistory";

export default function ProfilePage() {
    console.log('=== ProfilePage render ===');
    const { user, loading } = useAuth();
    const router = useRouter();
    const { data, isLoading } = useStructuredHistory();

    console.log('Profile page - user:', user?.uid);
    console.log('Profile page - data:', data);
    console.log('Profile page - isLoading:', isLoading);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    return (
        <div className="h-full flex">
            {/* Main content area - takes remaining space */}
            <div className="flex-1 pr-4">
                <div className="p-4">
                    {/* Profile sections */}
                    <div className="space-y-0">
                        <ContactInformationSection
                            contactInfo={data.contactInformation}
                            user={user}
                            isLoading={isLoading}
                        />
                        <ExperienceSection
                            jobHistory={data.jobHistory}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Right Side Panel - fixed width */}
            <RightSidePanel />
        </div>
    );
}
