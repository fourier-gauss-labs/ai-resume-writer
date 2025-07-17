import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            {/* Dialog content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className }: DialogContentProps) {
    return (
        <div className={cn(
            "bg-background rounded-lg shadow-lg border p-6 w-full max-w-md mx-4",
            className
        )}>
            {children}
        </div>
    );
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className }: DialogTitleProps) {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h2>
    );
}
