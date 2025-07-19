"use client";

import { FileData } from "@/utils/fileUtils";

interface DocxViewerProps {
    file: FileData;
}

export function DocxViewer({ file }: DocxViewerProps) {
    const handleOpenInNewTab = () => {
        window.open(file.url, '_blank', 'noopener,noreferrer');
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 max-w-md">
                <div className="mb-6">
                    <svg
                        className="w-20 h-20 mx-auto text-blue-500 mb-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                </div>

                <h3 className="text-xl font-semibold mb-3 text-gray-800">Microsoft Word Document</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Word document preview is not yet available in the browser. Choose an option below to view the document content.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleOpenInNewTab}
                        className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        📄 Open in new tab
                    </button>

                    <button
                        onClick={handleDownload}
                        className="block w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        💾 Download file
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                    The document will open in your default application or download to your device.
                </p>
            </div>
        </div>
    );
}
