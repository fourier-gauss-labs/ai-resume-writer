"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RightSidePanel } from "@/components/rightSidePanel";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    return (
        <div className="h-full flex">
            {/* Main content area - takes remaining space */}
            <div className="flex-1 pr-4">
                {/* Large empty space for now - profile components will go here */}
                <div className="h-full bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                                Profile Content Area
                            </h2>
                            <p className="text-muted-foreground">
                                Profile components will be implemented here
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Panel - fixed width */}
            <RightSidePanel />
        </div>
    );
}
