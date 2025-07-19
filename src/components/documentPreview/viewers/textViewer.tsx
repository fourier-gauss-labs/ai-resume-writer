"use client";

import { useState, useEffect } from "react";
import { FileData } from "@/utils/fileUtils";

interface TextViewerProps {
    file: FileData;
}

export function TextViewer({ file }: TextViewerProps) {
    const [content, setContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTextContent = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('Fetching text content from:', file.url);
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.statusText}`);
                }

                const text = await response.text();
                console.log('Text content loaded:', text.length, 'characters');
                setContent(text);
            } catch (err) {
                console.error('Error loading text file:', err);
                setError(err instanceof Error ? err.message : "Failed to load text file");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTextContent();
    }, [file.url]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading text file...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 underline"
                    >
                        Open in new tab
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-6 bg-white overflow-auto">
            {!content || content.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    <p>This text file appears to be empty.</p>
                </div>
            ) : (
                <div className="max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 text-gray-900 p-4 rounded border overflow-auto">
                        {content}
                    </pre>
                </div>
            )}
        </div>
    );
}
