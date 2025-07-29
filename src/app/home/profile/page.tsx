"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RightSidePanel } from "@/components/rightSidePanel";
import ContactInformationSection from "@/components/profile/contactInformationSection";
import ExperienceSection from "@/components/profile/experienceSection";
import ExperienceFullView from "@/components/profile/experienceFullView";
import EducationSection from "@/components/profile/educationSection";
import EducationFullView from "@/components/profile/educationFullView";
import CertificationSection from "@/components/profile/certificationSection";
import CertificationFullView from "@/components/profile/certificationFullView";
import { useStructuredHistory } from "@/hooks/useStructuredHistory";
import { storeStructuredHistoryHttp } from "@/utils/firebaseFunctions";
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

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

type ProfileView = 'main' | 'experience' | 'education' | 'certifications';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { data: hookData, isLoading, refetch } = useStructuredHistory();
    const [currentView, setCurrentView] = useState<ProfileView>('main');

    // Local state to manage immediate UI updates
    const [localData, setLocalData] = useState(hookData);

    // Update local data when hook data changes
    useEffect(() => {
        setLocalData(hookData);
    }, [hookData]);

    // Use localData for rendering, hookData changes will update localData
    const data = localData;

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    const handleShowExperience = () => {
        setCurrentView('experience');
    };

    const handleShowEducation = () => {
        setCurrentView('education');
    };

    const handleShowCertifications = () => {
        setCurrentView('certifications');
    };

    const handleBackToMain = () => {
        setCurrentView('main');
    };

    const handleUpdateJob = async (updatedJob: JobHistoryItem, originalJob: JobHistoryItem) => {
        try {
            // TODO: Implement API call to update job
            console.log('Updating job:', updatedJob, 'Original:', originalJob);

            // Immediately update local state for responsive UI
            setLocalData(prevData => ({
                ...prevData,
                jobHistory: prevData.jobHistory.map(job =>
                    (job.title === originalJob.title &&
                        job.company === originalJob.company &&
                        job.startDate.month === originalJob.startDate.month &&
                        job.startDate.year === originalJob.startDate.year) ? updatedJob : job
                )
            }));

            toast.success('Experience updated successfully!');
            await refetch(); // Refresh the data
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error('Failed to update experience');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleAddJob = async (newJob: JobHistoryItem) => {
        try {
            // TODO: Implement API call to add job
            console.log('Adding job:', newJob);

            // Immediately update local state for responsive UI
            setLocalData(prevData => ({
                ...prevData,
                jobHistory: [...prevData.jobHistory, newJob]
            }));

            toast.success('Experience added successfully!');
            await refetch(); // Refresh the data
        } catch (error) {
            console.error('Error adding job:', error);
            toast.error('Failed to add experience');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleDeleteJob = async (jobToDelete: JobHistoryItem) => {
        try {
            console.log('Deleting job:', jobToDelete);

            // Create updated data structure
            const updatedData = {
                ...localData,
                jobHistory: localData.jobHistory.filter(job =>
                    !(job.title === jobToDelete.title &&
                        job.company === jobToDelete.company &&
                        job.startDate.month === jobToDelete.startDate.month &&
                        job.startDate.year === jobToDelete.startDate.year)
                )
            };

            // Immediately update local state for responsive UI
            setLocalData(updatedData);

            // Persist to Firestore (only if we have contact information)
            if (user && updatedData.contactInformation) {
                const dataToStore = {
                    contactInformation: updatedData.contactInformation as unknown as Record<string, unknown>,
                    skills: updatedData.skills,
                    education: updatedData.education as unknown as Record<string, unknown>[],
                    certifications: updatedData.certifications as unknown as Record<string, unknown>[],
                    jobHistory: updatedData.jobHistory as unknown as Record<string, unknown>[]
                };
                await storeStructuredHistoryHttp(user.uid, dataToStore);
            }

            toast.success('Experience deleted successfully!');
            await refetch(); // Refresh the data from server
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Failed to delete experience');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleUpdateEducation = async (updatedEducation: EducationItem, originalEducation: EducationItem) => {
        try {
            // TODO: Implement API call to update education
            console.log('Updating education:', updatedEducation, 'Original:', originalEducation);

            // Immediately update local state for responsive UI
            setLocalData(prevData => ({
                ...prevData,
                education: prevData.education.map(edu =>
                    (edu.school === originalEducation.school &&
                        edu.degree === originalEducation.degree &&
                        edu.startDate.month === originalEducation.startDate.month &&
                        edu.startDate.year === originalEducation.startDate.year) ? updatedEducation : edu
                )
            }));

            toast.success('Education updated successfully!');
            await refetch(); // Refresh the data
        } catch (error) {
            console.error('Error updating education:', error);
            toast.error('Failed to update education');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleAddEducation = async (newEducation: EducationItem) => {
        try {
            // TODO: Implement API call to add education
            console.log('Adding education:', newEducation);

            // Immediately update local state for responsive UI
            setLocalData(prevData => ({
                ...prevData,
                education: [...prevData.education, newEducation]
            }));

            toast.success('Education added successfully!');
            await refetch(); // Refresh the data
        } catch (error) {
            console.error('Error adding education:', error);
            toast.error('Failed to add education');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleDeleteEducation = async (educationToDelete: EducationItem) => {
        try {
            console.log('Deleting education:', educationToDelete);

            // Create updated data structure
            const updatedData = {
                ...localData,
                education: localData.education.filter(edu =>
                    !(edu.school === educationToDelete.school &&
                        edu.degree === educationToDelete.degree)
                )
            };

            // Immediately update local state for responsive UI
            setLocalData(updatedData);

            // Persist to Firestore (only if we have contact information)
            if (user && updatedData.contactInformation) {
                const dataToStore = {
                    contactInformation: updatedData.contactInformation as unknown as Record<string, unknown>,
                    skills: updatedData.skills,
                    education: updatedData.education as unknown as Record<string, unknown>[],
                    certifications: updatedData.certifications as unknown as Record<string, unknown>[],
                    jobHistory: updatedData.jobHistory as unknown as Record<string, unknown>[]
                };
                await storeStructuredHistoryHttp(user.uid, dataToStore);
            }

            toast.success('Education deleted successfully!');
            await refetch(); // Refresh the data from server
        } catch (error) {
            console.error('Error deleting education:', error);
            toast.error('Failed to delete education');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleUpdateCertification = async (updatedCertification: CertificationItem, originalCertification: CertificationItem) => {
        try {
            console.log('Updating certification:', updatedCertification, 'Original:', originalCertification);

            // Create updated data structure
            const updatedData = {
                ...localData,
                certifications: localData.certifications.map(cert =>
                    (cert.certName === originalCertification.certName &&
                        cert.issuer === originalCertification.issuer &&
                        cert.issuedDate.month === originalCertification.issuedDate.month &&
                        cert.issuedDate.year === originalCertification.issuedDate.year) ? updatedCertification : cert
                )
            };

            // Immediately update local state for responsive UI
            setLocalData(updatedData);

            // Persist to Firestore (only if we have contact information)
            if (user && updatedData.contactInformation) {
                const dataToStore = {
                    contactInformation: updatedData.contactInformation as unknown as Record<string, unknown>,
                    skills: updatedData.skills,
                    education: updatedData.education as unknown as Record<string, unknown>[],
                    certifications: updatedData.certifications as unknown as Record<string, unknown>[],
                    jobHistory: updatedData.jobHistory as unknown as Record<string, unknown>[]
                };
                await storeStructuredHistoryHttp(user.uid, dataToStore);
            }

            toast.success('Certification updated successfully!');
            await refetch(); // Refresh the data from server
        } catch (error) {
            console.error('Error updating certification:', error);
            toast.error('Failed to update certification');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleAddCertification = async (newCertification: CertificationItem) => {
        try {
            console.log('Adding certification:', newCertification);

            // Create updated data structure
            const updatedData = {
                ...localData,
                certifications: [...localData.certifications, newCertification]
            };

            // Immediately update local state for responsive UI
            setLocalData(updatedData);

            // Persist to Firestore (only if we have contact information)
            if (user && updatedData.contactInformation) {
                const dataToStore = {
                    contactInformation: updatedData.contactInformation as unknown as Record<string, unknown>,
                    skills: updatedData.skills,
                    education: updatedData.education as unknown as Record<string, unknown>[],
                    certifications: updatedData.certifications as unknown as Record<string, unknown>[],
                    jobHistory: updatedData.jobHistory as unknown as Record<string, unknown>[]
                };
                await storeStructuredHistoryHttp(user.uid, dataToStore);
            }

            toast.success('Certification added successfully!');
            await refetch(); // Refresh the data from server
        } catch (error) {
            console.error('Error adding certification:', error);
            toast.error('Failed to add certification');
            // Revert local state on error
            setLocalData(hookData);
        }
    };

    const handleDeleteCertification = async (certificationToDelete: CertificationItem) => {
        try {
            console.log('Deleting certification:', certificationToDelete);

            // Create updated data structure
            const updatedData = {
                ...localData,
                certifications: localData.certifications.filter(cert =>
                    !(cert.certName === certificationToDelete.certName &&
                        cert.issuer === certificationToDelete.issuer)
                )
            };

            // Immediately update local state for responsive UI
            setLocalData(updatedData);

            // Persist to Firestore (only if we have contact information)
            if (user && updatedData.contactInformation) {
                const dataToStore = {
                    contactInformation: updatedData.contactInformation as unknown as Record<string, unknown>,
                    skills: updatedData.skills,
                    education: updatedData.education as unknown as Record<string, unknown>[],
                    certifications: updatedData.certifications as unknown as Record<string, unknown>[],
                    jobHistory: updatedData.jobHistory as unknown as Record<string, unknown>[]
                };
                await storeStructuredHistoryHttp(user.uid, dataToStore);
            }

            toast.success('Certification deleted successfully!');
            await refetch(); // Refresh the data from server
        } catch (error) {
            console.error('Error deleting certification:', error);
            toast.error('Failed to delete certification');
            // Revert local state on error
            setLocalData(hookData);
        }
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
                        <div className="space-y-4">
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
                            <EducationSection
                                education={data.education}
                                isLoading={isLoading}
                                onShowAllEducation={handleShowEducation}
                            />
                            <CertificationSection
                                certifications={data.certifications}
                                isLoading={isLoading}
                                onShowAllCertifications={handleShowCertifications}
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
                ) : currentView === 'education' ? (
                    <EducationFullView
                        education={data.education}
                        onBack={handleBackToMain}
                        onUpdateEducation={handleUpdateEducation}
                        onAddEducation={handleAddEducation}
                        onDeleteEducation={handleDeleteEducation}
                        isLoading={isLoading}
                    />
                ) : currentView === 'certifications' ? (
                    <CertificationFullView
                        certifications={data.certifications}
                        onBack={handleBackToMain}
                        onUpdateCertification={handleUpdateCertification}
                        onAddCertification={handleAddCertification}
                        onDeleteCertification={handleDeleteCertification}
                        isLoading={isLoading}
                    />
                ) : null}
            </div>

            {/* Right Side Panel - fixed width */}
            <RightSidePanel onDataRefresh={refetch} />
        </div>
    );
}
