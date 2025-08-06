"use client";

import { Card } from '@/components/ui/card';

export default function JobsPage() {
    return (
        <div className="h-full flex">
            {/* Main content area - takes remaining space */}
            <div className="flex-1 pr-4 h-full">
                <div className="p-4 h-full">
                    <div className="h-full">
                        <Card className="border border-border p-4 h-full">
                            <div className="h-full flex flex-col">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Job Application Workflow
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Track your opportunities through: Interested → Applied → Interview → Completed
                                    </p>
                                </div>

                                <div className="grid grid-cols-4 gap-4 flex-1">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 flex flex-col">
                                        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Interested</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">Jobs you want to apply for</p>
                                        <div className="flex-1 border-t border-blue-200 dark:border-blue-800 pt-2">
                                            {/* Job cards will go here */}
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 flex flex-col">
                                        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Applied</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">Applications submitted</p>
                                        <div className="flex-1 border-t border-yellow-200 dark:border-yellow-800 pt-2">
                                            {/* Job cards will go here */}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 flex flex-col">
                                        <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Interview</h3>
                                        <p className="text-sm text-green-700 dark:text-green-300 mb-4">Interview scheduled/completed</p>
                                        <div className="flex-1 border-t border-green-200 dark:border-green-800 pt-2">
                                            {/* Job cards will go here */}
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 flex flex-col">
                                        <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Completed</h3>
                                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">Offers, rejections, withdrawals</p>
                                        <div className="flex-1 border-t border-purple-200 dark:border-purple-800 pt-2">
                                            {/* Job cards will go here */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}