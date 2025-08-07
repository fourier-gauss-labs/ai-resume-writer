"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddJobModal from '@/components/jobs/addJobModal';
import { JobCard } from '@/components/jobs/jobCard';
import { JobPreviewModal } from '@/components/jobs/jobPreviewModal';
import EditJobModal from '@/components/jobs/editJobModal';
import { parseJobPostingHttp, getUserJobs, updateJobStatus, updateJob, ParsedJobData as JobData } from '@/utils/firebaseFunctions';
import { useAuth } from '@/context/authContext';
import { toast } from 'sonner';

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

    // Fetch jobs on component mount
    useEffect(() => {
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
                setJobs(userJobs);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                toast.error('Failed to load jobs');
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user) {
            fetchJobs();
        } else if (!loading && !user) {
            setIsLoading(false);
        }
    }, [user, loading]);

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
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
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
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
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
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
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
                                                        onView={handleViewJob}
                                                        onEdit={handleEditJob}
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
        </div>
    );
}