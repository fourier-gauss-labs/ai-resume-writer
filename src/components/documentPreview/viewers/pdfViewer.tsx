"use client";

import { useState, useEffect } from "react";
import { FileData } from "@/utils/fileUtils";

interface PdfViewerProps {
    file: FileData;
}

export function PdfViewer({ file }: PdfViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
    }, [file.url]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setError("Failed to load PDF. Please try downloading the file instead.");
    };

    return (
        <div className="w-full h-full relative bg-gray-50">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading PDF...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center">
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
            )}

            <object
                data={file.url}
                type="application/pdf"
                className="w-full h-full"
                onLoad={handleLoad}
                onError={handleError}
            >
                <embed
                    src={file.url}
                    type="application/pdf"
                    className="w-full h-full"
                />
            </object>
        </div>
    );
}
