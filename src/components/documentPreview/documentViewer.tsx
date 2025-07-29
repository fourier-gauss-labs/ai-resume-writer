"use client";

import { FileData } from "@/utils/fileUtils";
import { PdfViewer } from "./viewers/pdfViewer";
import { TextViewer } from "./viewers/textViewer";
import { DocxViewer } from "./viewers/docxViewer";

interface DocumentViewerProps {
    file: FileData;
}

export function DocumentViewer({ file }: DocumentViewerProps) {
    const getViewer = () => {
        const fileType = file.type.toLowerCase();
        console.log('=== DocumentViewer ===');
        console.log('File name:', file.name);
        console.log('File type (original):', file.type);
        console.log('File type (lowercase):', fileType);

        switch (fileType) {
            case 'pdf':
                console.log('Using PdfViewer');
                return <PdfViewer file={file} />;
            case 'txt':
            case 'md':
                console.log('Using TextViewer');
                return <TextViewer file={file} />;
            case 'docx':
            case 'doc':
                console.log('Using DocxViewer');
                return <DocxViewer file={file} />;
            default:
                console.log('No suitable viewer found');
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center p-4">
                            <p className="text-sm text-muted-foreground mb-2">
                                Preview not available for this file type: {file.type}
                            </p>
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
    };

    return (
        <div className="w-full h-full">
            {getViewer()}
        </div>
    );
}
