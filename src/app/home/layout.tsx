"use client";

import { ReactNode, useState } from "react";
import TopBanner from "@/components/topBanner"; // Import the TopBanner component
import SidePanel from "@/components/sidePanel"; // Import the SidePanel component

const menuItems = [
    { name: "Home", href: "/home" },
    { name: "Settings", href: "/home/settings" },
    { name: "Background", href: "/home/background" },
];

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true); // Default to true

    const toggleSidePanel = () => {
        setIsSidePanelOpen((prev) => {
            return !prev;
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Banner */}
            <TopBanner toggleSidePanel={toggleSidePanel} />

            {/* Main Layout */}
            <div className="flex flex-1">
                {/* Side Navigation */}
                <SidePanel isSidePanelOpen={isSidePanelOpen} menuItems={menuItems} />

                {/* Main Content */}
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}