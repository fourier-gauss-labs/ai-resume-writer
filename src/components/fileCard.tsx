"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import {
    DocumentIcon,
    TrashIcon,
    EyeIcon
} from "@heroicons/react/24/outline";

interface FileData {
    id: number;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
}

interface FileCardProps {
    file: FileData;
    onView?: (file: FileData) => void;
    onDelete?: (file: FileData) => void;
}

export function FileCard({ file, onView, onDelete }: FileCardProps) {
    return (
        <Card className="p-0 border border-border">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        <DocumentIcon className="h-5 w-5 text-blue-500" />
                        <div>
                            <CardTitle className="text-sm font-medium">
                                {file.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {file.type} • {file.size}
                            </p>
                        </div>
                    </div>
                    <CardAction>
                        <div className="flex space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onView?.(file)}
                            >
                                <EyeIcon className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() => onDelete?.(file)}
                            >
                                <TrashIcon className="h-3 w-3" />
                            </Button>
                        </div>
                    </CardAction>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                    Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                </p>
            </CardContent>
        </Card>
    );
}
