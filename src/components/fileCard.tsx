"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DocumentIcon,
    DocumentTextIcon,
    DocumentArrowDownIcon,
    TrashIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import { FileData } from "@/utils/fileUtils";

interface FileCardProps {
    file: FileData;
    onView?: (file: FileData) => void;
    onDelete?: (file: FileData) => void;
}

// Function to get the appropriate icon based on file type
const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'pdf':
            return <DocumentIcon className="h-8 w-8 text-red-500" />;
        case 'docx':
        case 'doc':
            return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
        case 'txt':
            return <DocumentArrowDownIcon className="h-8 w-8 text-gray-500" />;
        default:
            return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
};

export function FileCard({ file, onView, onDelete }: FileCardProps) {
    return (
        <Card className="relative p-4 border border-border">
            {/* Main content with icon on left, text left-aligned */}
            <div className="flex items-start space-x-3">
                {/* File icon */}
                <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                </div>

                {/* Text content - left aligned */}
                <div className="flex-1 min-w-0">
                    {/* File name - bold */}
                    <div className="font-semibold text-sm break-words">
                        {file.name}
                    </div>

                    {/* File details */}
                    <div className="text-xs text-muted-foreground mt-1">
                        {file.type} • {file.size}
                    </div>

                    {/* Upload date */}
                    <div className="text-xs text-muted-foreground mt-1">
                        Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Action buttons positioned in bottom right */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-foreground hover:bg-muted"
                    onClick={() => onView?.(file)}
                >
                    <EyeIcon className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-foreground hover:bg-muted"
                    onClick={() => onDelete?.(file)}
                >
                    <TrashIcon className="h-3 w-3" />
                </Button>
            </div>
        </Card>
    );
}
