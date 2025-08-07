"use client";

import { useState, useEffect } from "react";
import { JobData } from "@/components/jobs/jobCard";
import { getJobTextFromStorage } from "@/utils/firebaseFunctions";

interface JobTextViewerProps {
    job: JobData;
}

export function JobTextViewer({ job }: JobTextViewerProps) {
    const [content, setContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobTextContent = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('Fetching job text content for:', job.company, '-', job.title);
                console.log('Full text path:', job.fullTextPath);

                const text = await getJobTextFromStorage(job.fullTextPath);
                console.log('Job text content loaded:', text.length, 'characters');
                setContent(text);
            } catch (err) {
                console.error('Error loading job text file:', err);
                setError(err instanceof Error ? err.message : "Failed to load job text");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobTextContent();
    }, [job.fullTextPath, job.company, job.title]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading job text...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <p className="text-xs text-muted-foreground">
                        Job: {job.company} - {job.title}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-6 bg-white overflow-auto">
            {!content || content.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    <p>This job posting appears to have no text content.</p>
                </div>
            ) : (
                <div className="max-w-none">
                    {/* Job header info */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                        </h2>
                        <p className="text-md text-gray-700 mb-2">
                            {job.company}
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                            <div>Added: {new Date(job.dateAdded).toLocaleDateString()}</div>
                            {job.applicationDeadline && (
                                <div>Deadline: {job.applicationDeadline}</div>
                            )}
                            {job.url && (
                                <div>
                                    URL: <a
                                        href={job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 underline"
                                    >
                                        {job.url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job text content */}
                    <div className="max-w-none">
                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 text-gray-900 p-4 rounded border overflow-auto">
                            {content}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
