"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Upload,
    Plus
} from "lucide-react";

interface RightSidePanelProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function RightSidePanel({ isOpen, onToggle }: RightSidePanelProps) {
    // Mock data for demonstration - will be replaced with real data from Firebase
    const mockFiles = [
        {
            id: "1",
            name: "Bill McCann Resume.pdf",
            uploadDate: "June 16, 2025",
            size: "101.5KB"
        },
        {
            id: "2",
            name: "Career Bullets.docx",
            uploadDate: "June 16, 2025",
            size: "18.7KB"
        }
    ];

    return (
        <>
            {/* Collapsible Panel */}
            <div
                className={`fixed top-0 right-0 h-full bg-background border-l border-border transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ width: '320px' }}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 className="text-lg font-semibold">My Files</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 space-y-2 border-b border-border">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                                // TODO: Implement parse functionality
                                console.log("Trigger parsing");
                            }}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Parse Documents
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                                // TODO: Open background form modal
                                console.log("Open background form");
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Background
                        </Button>
                    </div>

                    {/* Files List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-3">
                            {mockFiles.map((file) => (
                                <Card key={file.id} className="p-3">
                                    <div className="flex items-start space-x-3">
                                        <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {file.uploadDate}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {file.size}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {mockFiles.length === 0 && (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground">
                                        No files uploaded yet
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                            // TODO: Implement file upload
                                            console.log("Upload file");
                                        }}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Files
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Button when Panel is Closed */}
            {!isOpen && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onToggle}
                    className="fixed top-4 right-4 z-50 h-10 w-10 shadow-lg"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    );
}
