"use client";

export function RightSidePanel() {
    return (
        <div className="w-80 bg-background border-l border-border flex-shrink-0">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">My Files</h2>
                </div>

                {/* Empty content area for now */}
                <div className="flex-1 p-4">
                    <div className="h-full bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground text-sm">
                                File controls will be implemented here
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
