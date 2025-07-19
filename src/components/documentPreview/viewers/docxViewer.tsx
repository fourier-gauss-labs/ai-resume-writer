"use client";

import { useState, useEffect } from "react";
import { FileData } from "@/utils/fileUtils";

interface DocxViewerProps {
    file: FileData;
}

export function DocxViewer({ file }: DocxViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string>("");

    useEffect(() => {
        const renderDocx = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('Fetching DOCX file from:', file.url);
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                console.log('DOCX file loaded, size:', arrayBuffer.byteLength, 'bytes');

                // Dynamic import to handle client-side rendering
                const mammoth = await import('mammoth');

                // Convert DOCX to HTML
                const result = await mammoth.convertToHtml({ arrayBuffer });
                console.log('DOCX converted to HTML successfully');

                if (result.messages.length > 0) {
                    console.warn('Mammoth conversion messages:', result.messages);
                }

                setHtmlContent(result.value);
            } catch (err) {
                console.error('Error rendering DOCX:', err);
                setError(err instanceof Error ? err.message : "Failed to render DOCX file");
            } finally {
                setIsLoading(false);
            }
        };

        renderDocx();
    }, [file.url]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading Word document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="mb-6">
                        <svg
                            className="w-16 h-16 mx-auto text-red-500 mb-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Preview Error</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        💾 Download file instead
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white overflow-auto">
            <div className="docx-viewer-container p-6 max-w-4xl mx-auto">
                <div
                    className="docx-content bg-white shadow-sm border rounded-lg p-8"
                    style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: '1.6',
                        color: '#374151'
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </div>
    );
}
