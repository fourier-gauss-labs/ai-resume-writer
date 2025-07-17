"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RightSidePanel } from "@/components/rightSidePanel";
import {
    Home,
    Settings,
    FileText,
    User
} from "lucide-react";

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("profile");

    const navigationItems = [
        { id: "home", label: "Home", icon: Home, href: "/home" },
        { id: "settings", label: "Settings", icon: Settings, href: "/home/settings" },
        { id: "background", label: "Background", icon: FileText, href: "/home/background" },
        { id: "profile", label: "Profile", icon: User, href: "/home/profile" }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Left Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border">
                <div className="p-4">
                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-2 mb-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">M</span>
                        </div>
                        <span className="font-semibold text-lg">Marcus</span>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;

                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    <Icon className="h-4 w-4 mr-3" />
                                    {item.label}
                                </Button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div
                className={`ml-64 transition-all duration-300 ${isRightPanelOpen ? 'mr-80' : 'mr-0'
                    }`}
            >
                <div className="p-6">
                    {children}
                </div>
            </div>

            {/* Right Side Panel */}
            <RightSidePanel
                isOpen={isRightPanelOpen}
                onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)}
            />
        </div>
    );
}
