"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddJobModal from '@/components/jobs/addJobModal';
import { JobCard } from '@/components/jobs/jobCard';
import { JobPreviewModal } from '@/components/jobs/jobPreviewModal';
import EditJobModal from '@/components/jobs/editJobModal';
import { DocumentPreviewModal } from '@/components/documentPreview';
import { GenericDeleteModal } from '@/components/genericDeleteModal';
import { parseJobPostingHttp, getUserJobs, updateJobStatus, updateJob, ParsedJobData } from '@/utils/firebaseFunctions';
import { useAuth } from '@/context/authContext';
import { toast } from 'sonner';
import { FileData } from '@/utils/fileUtils';

// Use ParsedJobData as the main type
type JobData = ParsedJobData;

export default function JobsPage() {
    const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
    const [jobs, setJobs] = useState<JobData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, loading } = useAuth();

    // Preview modal state
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        job: JobData | null;
    }>({
        isOpen: false,
        job: null,
    });

    // Edit modal state
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        job: JobData | null;
    }>({
        isOpen: false,
        job: null,
    });

    // Drag and drop state
    const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Document preview modal state
    const [documentPreview, setDocumentPreview] = useState<{
        isOpen: boolean;
        file: FileData | null;
    }>({
        isOpen: false,
        file: null,
    });

    // Resume deletion confirmation modal state
    const [deleteResumeConfirmation, setDeleteResumeConfirmation] = useState<{
        isOpen: boolean;
        job: JobData | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        job: null,
        isDeleting: false,
    });

    // Fetch jobs on component mount
    useEffect(() => {
        fetchJobs();
    }, [user, loading]);

    // Centralized function to fetch jobs
    const fetchJobs = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        // Wait a moment to ensure auth token is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            setIsLoading(true);
            console.log('Fetching jobs for user:', user.uid);
            const userJobs = await getUserJobs(user.uid);
            console.log('Fetched jobs:', userJobs);
            setJobs(userJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to refresh jobs from server
    const refreshJobs = async () => {
        console.log('Refreshing jobs from server...');
        await fetchJobs();
    };

    const handleAddJob = async (jobData: { url?: string; jobAdText: string }) => {
        if (!user) {
            toast.error('You must be logged in to add jobs');
            return;
        }

        try {
            const result = await parseJobPostingHttp(user.uid, jobData.jobAdText, jobData.url);
            console.log('Job added successfully:', result.jobData);
            toast.success(`Added "${result.jobData.title}" at "${result.jobData.company}" to your pipeline`);

            // Add the new job to local state
            setJobs(prevJobs => [result.jobData, ...prevJobs]);

        } catch (error) {
            console.error('Error adding job:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                toast.error(error.message);
            } else {
                toast.error('Failed to add job. Please try again.');
            }
            throw error; // Re-throw so the form can handle it
        }
    };

    const handleViewJob = (job: JobData) => {
        console.log('View job:', job);
        setPreviewModal({
            isOpen: true,
            job: job,
        });
    };

    const handlePreviewClose = () => {
        setPreviewModal({
            isOpen: false,
            job: null,
        });
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (status: string) => {
        setDragOverColumn(status);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDragStart = (jobId: string) => {
        setDraggedJobId(jobId);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: 'interested' | 'applied' | 'interview' | 'completed') => {
        e.preventDefault();

        const jobId = e.dataTransfer.getData('text/plain');
        if (!jobId || !user) return;

        try {
            // Find the job being moved
            const job = jobs.find(j => j.id === jobId);
            if (!job || job.status === targetStatus) return;

            // Update in Firestore
            await updateJobStatus(user.uid, jobId, targetStatus);

            // Update local state
            setJobs(prevJobs =>
                prevJobs.map(j =>
                    j.id === jobId ? { ...j, status: targetStatus } : j
                )
            );

            toast.success(`Moved "${job.title}" to ${targetStatus}`);
        } catch (error) {
            console.error('Error moving job:', error);
            toast.error('Failed to move job');
        }

        setDraggedJobId(null);
        setDragOverColumn(null);
    };

    const handleEditJob = (job: JobData) => {
        console.log('Edit job:', job);
        setEditModal({
            isOpen: true,
            job: job,
        });
    };

    const handleEditClose = () => {
        setEditModal({
            isOpen: false,
            job: null,
        });
    };

    const handleJobUpdate = async (jobId: string, updatedJobData: Partial<JobData>) => {
        if (!user) return;

        try {
            // Update in Firestore
            await updateJob(user.uid, jobId, updatedJobData);

            // Update local state
            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job.id === jobId
                        ? { ...job, ...updatedJobData }
                        : job
                )
            );

            toast.success('Job updated successfully');
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error('Failed to update job');
        }
    };

    // New action handlers for the enhanced JobCard
    const handleOpenJob = (job: JobData) => {
        // Open job (default action when clicking card)
        handleViewJob(job);
    };

    const handleGenerateResume = async (job: JobData) => {
        if (!user) {
            toast.error('You must be logged in to generate resumes');
            return;
        }

        try {
            toast.loading(`Generating resume for ${job.company} - ${job.title}...`, { id: 'gen-resume' });

            // Get the necessary imports - skip structured history for now to avoid Firebase errors
            const { generateResumeHttp } = await import('@/utils/firebaseFunctions');

            // For now, skip the Firebase call that's causing issues and use professional template
            console.log('Creating resume with professional template...');
            toast.info('Creating professional resume from your profile', { id: 'gen-resume', duration: 3000 });

            // Generate resume content from user profile
            const { profileService } = await import('@/services/profileService');
            const { ResumeContentGenerator } = await import('@/services/resumeContentGenerator');

            console.log('Fetching user profile for resume generation...');
            const userProfile = await profileService.getUserProfile();

            // Check if profile is ready for resume generation
            const readiness = await profileService.getProfileReadiness();
            if (!readiness.isReady) {
                throw new Error(`Profile incomplete for resume generation. Missing: ${readiness.missing.join(', ')}`);
            }

            console.log('Generating resume content from profile data...');
            const resumeContent = ResumeContentGenerator.generateResumeContent(
                userProfile
                // TODO: In Phase 2, fetch job description from fullTextPath for tailoring
            );

            const resumeRequest = {
                templateId: 'ats-friendly-single-column',
                content: resumeContent
            };

            // Generate the actual PDF
            console.log('Calling generateResumeHttp with profile-based content...');
            const result = await generateResumeHttp(resumeRequest);

            if (!result.success) {
                throw new Error(result.error || 'Resume generation failed');
            }

            // Update job to mark as having generated resume
            await handleJobUpdate(job.id, {
                hasGeneratedResume: true,
                resumeId: `resume-${job.id}-${Date.now()}`
            });

            // Refresh jobs to ensure UI reflects the updated state
            await refreshJobs();

            toast.success(`Resume generated for ${job.company}!`, { id: 'gen-resume' });
        } catch (error) {
            console.error('Error generating resume:', error);

            // Provide more specific error messages based on the error type
            let errorMessage = 'Unknown error occurred';

            if (error instanceof Error) {
                if (error.message.includes('User not authenticated') || error.message.includes('log in')) {
                    errorMessage = 'Please log in to generate resumes';
                } else if (error.message.includes('No profile data found') || error.message.includes('upload your resume')) {
                    errorMessage = 'No profile data found. Please upload your resume or enter your information in Settings first.';
                } else if (error.message.includes('Profile incomplete')) {
                    errorMessage = error.message; // This already has good messaging from profileService
                } else if (error.message.includes('Access denied') || error.message.includes('permission')) {
                    errorMessage = 'Access denied. Please check your account permissions or try logging out and back in.';
                } else if (error.message.includes('network') || error.message.includes('offline')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (error.message.includes('Resume generation failed') || error.message.includes('LaTeX')) {
                    errorMessage = 'Resume generation service is unavailable. Please try again later.';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(`Failed to generate resume: ${errorMessage}`, { id: 'gen-resume' });
        }
    };

    const handleGenerateCoverLetter = async (job: JobData) => {
        if (!user) {
            toast.error('You must be logged in to generate cover letters');
            return;
        }

        try {
            toast.info(`Generating cover letter for ${job.company} - ${job.title}...`);

            // TODO: Implement cover letter generation

            // For now, simulate the process
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update job to mark as having generated cover letter
            await handleJobUpdate(job.id, {
                hasGeneratedCoverLetter: true,
                coverLetterId: `cover-${job.id}-${Date.now()}`
            });

            // Refresh jobs to ensure UI reflects the updated state
            await refreshJobs();

            toast.success(`Cover letter generated for ${job.company}!`);
        } catch (error) {
            console.error('Error generating cover letter:', error);
            toast.error('Failed to generate cover letter');
        }
    };

    const handleViewResume = async (job: JobData) => {
        if (!job.hasGeneratedResume && !job.resumeId) {
            toast.error('No resume generated for this job yet');
            return;
        }

        try {
            toast.loading('Loading resume...', { id: 'resume-view' });

            // Get the necessary imports
            const { generateResumeHttp } = await import('@/utils/firebaseFunctions');
            const { profileService } = await import('@/services/profileService');
            const { ResumeContentGenerator } = await import('@/services/resumeContentGenerator');

            // Generate fresh resume with professional template using actual profile data
            console.log('Generating fresh resume from user profile...');

            // Generate resume content from user profile
            console.log('Fetching user profile for resume regeneration...');
            const userProfile = await profileService.getUserProfile();

            // Check if profile is ready for resume generation
            const readiness = await profileService.getProfileReadiness();
            if (!readiness.isReady) {
                throw new Error(`Profile incomplete for resume generation. Missing: ${readiness.missing.join(', ')}`);
            }

            console.log('Generating resume content from profile data...');
            const resumeContent = ResumeContentGenerator.generateResumeContent(
                userProfile
                // TODO: In Phase 2, fetch job description from fullTextPath for tailoring
            );

            const resumeRequest = {
                templateId: 'ats-friendly-single-column',
                content: resumeContent
            };

            console.log('Generating PDF with profile-based content...');
            const result = await generateResumeHttp(resumeRequest); if (result.success && result.pdfBase64) {
                // Convert base64 to blob URL for preview
                const binaryString = atob(result.pdfBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);

                // Create FileData object for the document preview modal
                const pdfFile: FileData = {
                    id: job.resumeId || `resume-${job.id}`,
                    name: `Resume-${job.company}-${job.title}.pdf`,
                    type: 'pdf',
                    uploadDate: new Date().toISOString(),
                    size: `${Math.round(bytes.length / 1024)} KB`,
                    url: blobUrl
                };

                setDocumentPreview({
                    isOpen: true,
                    file: pdfFile
                });

                toast.success('Resume loaded', { id: 'resume-view' });
            } else {
                throw new Error('PDF generation failed');
            }

        } catch (error) {
            console.error('Error viewing resume:', error);
            toast.error('Failed to load resume', { id: 'resume-view' });
        }
    };

    const handleViewCoverLetter = async (job: JobData) => {
        if (!job.hasGeneratedCoverLetter && !job.coverLetterId) {
            toast.error('No cover letter generated for this job yet');
            return;
        }

        try {
            toast.loading('Loading cover letter...', { id: 'cover-view' });

            // For now, we'll generate a fresh PDF since we don't have storage yet
            // In the future, this would retrieve from Firebase Storage

            const { generateResumeHttp } = await import('@/utils/firebaseFunctions');

            // Generate a cover letter PDF (using same template for now)
            const testData = {
                templateId: 'ats-friendly-single-column',
                content: {
                    personalInfo: {
                        name: 'Cover Letter for ' + job.company,
                        email: 'user@example.com',
                        phone: '(555) 123-4567',
                        location: 'San Francisco, CA'
                    },
                    summary: `Dear ${job.company} Hiring Team,\n\nI am writing to express my interest in the ${job.title} position. This cover letter has been tailored specifically for your company and role requirements.`,
                    experience: [
                        {
                            title: 'Relevant Experience Highlight',
                            company: 'Previous Role',
                            duration: 'Experience Period',
                            bullets: [
                                'Key achievements relevant to this position',
                                'Skills and accomplishments that match job requirements'
                            ]
                        }
                    ],
                    education: [],
                    skills: [],
                    certifications: []
                }
            };

            const result = await generateResumeHttp(testData);

            if (result.success && result.pdfBase64) {
                // Convert base64 to blob URL for preview
                const binaryString = atob(result.pdfBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);

                // Create FileData object for the document preview modal
                const pdfFile: FileData = {
                    id: job.coverLetterId || `cover-${job.id}`,
                    name: `Cover-Letter-${job.company}-${job.title}.pdf`,
                    type: 'pdf',
                    uploadDate: new Date().toISOString(),
                    size: `${Math.round(bytes.length / 1024)} KB`,
                    url: blobUrl
                };

                setDocumentPreview({
                    isOpen: true,
                    file: pdfFile
                });

                toast.success('Cover letter loaded', { id: 'cover-view' });
            } else {
                throw new Error('PDF generation failed');
            }

        } catch (error) {
            console.error('Error viewing cover letter:', error);
            toast.error('Failed to load cover letter', { id: 'cover-view' });
        }
    };

    const handleArchiveJob = async (job: JobData) => {
        if (!user) return;

        try {
            // TODO: Implement archiving logic
            toast.info(`Archived ${job.company} - ${job.title}`);
        } catch (error) {
            console.error('Error archiving job:', error);
            toast.error('Failed to archive job');
        }
    };

    const handleRegenerateResume = async (job: JobData) => {
        if (!user) {
            toast.error('You must be logged in to regenerate resumes');
            return;
        }

        // For now, just use the working generate function to avoid LaTeX errors
        // This ensures it works, and we can enhance it later
        await handleGenerateResume(job);
    };

    const handleRemoveResume = async (job: JobData) => {
        if (!user) {
            toast.error('You must be logged in to remove resumes');
            return;
        }

        // Show confirmation modal
        setDeleteResumeConfirmation({
            isOpen: true,
            job: job,
            isDeleting: false,
        });
    };

    const handleConfirmDeleteResume = async () => {
        const job = deleteResumeConfirmation.job;
        if (!job || !user) return;

        setDeleteResumeConfirmation(prev => ({ ...prev, isDeleting: true }));

        try {
            toast.loading(`Removing resume for ${job.company}...`, { id: 'remove-resume' });

            // Import Firebase deleteField function
            const { deleteField } = await import('firebase/firestore');

            // Update job to remove resume flags using deleteField for resumeId
            await handleJobUpdate(job.id, {
                hasGeneratedResume: false,
                resumeId: deleteField() as any
            });

            // Refresh jobs to ensure UI reflects the updated state
            await refreshJobs();

            toast.success(`Resume removed for ${job.company}!`, { id: 'remove-resume' });

            // Close the confirmation modal
            setDeleteResumeConfirmation({
                isOpen: false,
                job: null,
                isDeleting: false,
            });
        } catch (error) {
            console.error('Error removing resume:', error);
            toast.error('Failed to remove resume', { id: 'remove-resume' });

            setDeleteResumeConfirmation(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleCancelDeleteResume = () => {
        setDeleteResumeConfirmation({
            isOpen: false,
            job: null,
            isDeleting: false,
        });
    };

    // Filter jobs by status
    const interestedJobs = jobs.filter(job => job.status === 'interested');
    const appliedJobs = jobs.filter(job => job.status === 'applied');
    const interviewJobs = jobs.filter(job => job.status === 'interview');
    const completedJobs = jobs.filter(job => job.status === 'completed'); return (
        <div className="h-full flex">
            {/* Main content area - takes remaining space */}
            <div className="flex-1 pr-4 h-full">
                <div className="p-4 h-full">
                    <div className="h-full">
                        <Card className="border border-border p-4 h-full relative">
                            {/* Add Job Button */}
                            <Button
                                onClick={() => setIsAddJobModalOpen(true)}
                                size="icon"
                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>

                            <div className="h-full flex flex-col">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Job Application Workflow
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Track your opportunities through: Interested → Applied → Interview → Completed
                                    </p>
                                </div>

                                <div className="grid grid-cols-4 gap-4 flex-1">
                                    <div
                                        className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 flex flex-col transition-all ${dragOverColumn === 'interested' ? 'border-blue-400 dark:border-blue-600 bg-blue-100 dark:bg-blue-900/40 shadow-lg' : 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragEnter={() => handleDragEnter('interested')}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, 'interested')}
                                    >
                                        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Interested</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">Jobs you want to apply for</p>
                                        <div className="flex-1 border-t border-blue-200 dark:border-blue-800 pt-2 space-y-2 overflow-y-auto">
                                            {isLoading ? (
                                                <div className="text-center text-sm text-muted-foreground">Loading jobs...</div>
                                            ) : interestedJobs.length > 0 ? (
                                                interestedJobs.map((job) => (
                                                    <JobCard
                                                        key={job.id}
                                                        job={job}
                                                        onOpen={handleOpenJob}
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
                                                        onGenerateResume={handleGenerateResume}
                                                        onGenerateCoverLetter={handleGenerateCoverLetter}
                                                        onViewResume={handleViewResume}
                                                        onViewCoverLetter={handleViewCoverLetter}
                                                        onRegenerateResume={handleRegenerateResume}
                                                        onRemoveResume={handleRemoveResume}
                                                        onArchive={handleArchiveJob}
                                                        onDragStart={handleDragStart}
                                                        isDragging={draggedJobId === job.id}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-center text-sm text-muted-foreground">No jobs yet</div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={`bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 flex flex-col transition-all ${dragOverColumn === 'applied' ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-900/40 shadow-lg' : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragEnter={() => handleDragEnter('applied')}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, 'applied')}
                                    >
                                        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Applied</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">Applications submitted</p>
                                        <div className="flex-1 border-t border-yellow-200 dark:border-yellow-800 pt-2 space-y-2 overflow-y-auto">
                                            {appliedJobs.length > 0 ? (
                                                appliedJobs.map((job) => (
                                                    <JobCard
                                                        key={job.id}
                                                        job={job}
                                                        onOpen={handleOpenJob}
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
                                                        onGenerateResume={handleGenerateResume}
                                                        onGenerateCoverLetter={handleGenerateCoverLetter}
                                                        onViewResume={handleViewResume}
                                                        onViewCoverLetter={handleViewCoverLetter}
                                                        onRegenerateResume={handleRegenerateResume}
                                                        onRemoveResume={handleRemoveResume}
                                                        onArchive={handleArchiveJob}
                                                        onDragStart={handleDragStart}
                                                        isDragging={draggedJobId === job.id}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-center text-sm text-muted-foreground">No applications yet</div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={`bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 flex flex-col transition-all ${dragOverColumn === 'interview' ? 'border-green-400 dark:border-green-600 bg-green-100 dark:bg-green-900/40 shadow-lg' : 'hover:bg-green-100 dark:hover:bg-green-900/30'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragEnter={() => handleDragEnter('interview')}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, 'interview')}
                                    >
                                        <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Interview</h3>
                                        <p className="text-sm text-green-700 dark:text-green-300 mb-4">Interview scheduled/completed</p>
                                        <div className="flex-1 border-t border-green-200 dark:border-green-800 pt-2 space-y-2 overflow-y-auto">
                                            {interviewJobs.length > 0 ? (
                                                interviewJobs.map((job) => (
                                                    <JobCard
                                                        key={job.id}
                                                        job={job}
                                                        onOpen={handleOpenJob}
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
                                                        onGenerateResume={handleGenerateResume}
                                                        onGenerateCoverLetter={handleGenerateCoverLetter}
                                                        onViewResume={handleViewResume}
                                                        onViewCoverLetter={handleViewCoverLetter}
                                                        onRegenerateResume={handleRegenerateResume}
                                                        onRemoveResume={handleRemoveResume}
                                                        onArchive={handleArchiveJob}
                                                        onDragStart={handleDragStart}
                                                        isDragging={draggedJobId === job.id}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-center text-sm text-muted-foreground">No interviews yet</div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={`bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 flex flex-col transition-all ${dragOverColumn === 'completed' ? 'border-purple-400 dark:border-purple-600 bg-purple-100 dark:bg-purple-900/40 shadow-lg' : 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragEnter={() => handleDragEnter('completed')}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, 'completed')}
                                    >
                                        <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Completed</h3>
                                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">Offers, rejections, withdrawals</p>
                                        <div className="flex-1 border-t border-purple-200 dark:border-purple-800 pt-2 space-y-2 overflow-y-auto">
                                            {completedJobs.length > 0 ? (
                                                completedJobs.map((job) => (
                                                    <JobCard
                                                        key={job.id}
                                                        job={job}
                                                        onOpen={handleOpenJob}
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
                                                        onGenerateResume={handleGenerateResume}
                                                        onGenerateCoverLetter={handleGenerateCoverLetter}
                                                        onViewResume={handleViewResume}
                                                        onViewCoverLetter={handleViewCoverLetter}
                                                        onRegenerateResume={handleRegenerateResume}
                                                        onRemoveResume={handleRemoveResume}
                                                        onArchive={handleArchiveJob}
                                                        onDragStart={handleDragStart}
                                                        isDragging={draggedJobId === job.id}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-center text-sm text-muted-foreground">No completed jobs yet</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add Job Modal */}
            <AddJobModal
                isOpen={isAddJobModalOpen}
                onClose={() => setIsAddJobModalOpen(false)}
                onSave={handleAddJob}
            />

            {/* Job Preview Modal */}
            <JobPreviewModal
                isOpen={previewModal.isOpen}
                job={previewModal.job}
                onClose={handlePreviewClose}
            />

            {/* Edit Job Modal */}
            <EditJobModal
                isOpen={editModal.isOpen}
                job={editModal.job}
                onClose={handleEditClose}
                onSave={handleJobUpdate}
            />

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={documentPreview.isOpen}
                file={documentPreview.file}
                onClose={() => {
                    // Clean up blob URL to prevent memory leaks
                    if (documentPreview.file?.url.startsWith('blob:')) {
                        URL.revokeObjectURL(documentPreview.file.url);
                    }
                    setDocumentPreview({ isOpen: false, file: null });
                }}
            />

            {/* Delete Resume Confirmation Modal */}
            <GenericDeleteModal
                isOpen={deleteResumeConfirmation.isOpen}
                onConfirm={handleConfirmDeleteResume}
                onCancel={handleCancelDeleteResume}
                isDeleting={deleteResumeConfirmation.isDeleting}
                title="Remove Resume"
                message={
                    deleteResumeConfirmation.job
                        ? `Are you sure you want to remove the resume for ${deleteResumeConfirmation.job.company} - ${deleteResumeConfirmation.job.title}? This action cannot be undone. You'll need to generate a new resume if you want one later.`
                        : ""
                }
            />
        </div>
    );
}