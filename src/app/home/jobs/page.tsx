"use client";

export default function JobsPage() {
    return (
        <div className="flex flex-col min-h-screen p-6">
            <div className="max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Job Pipeline
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Job Application Workflow
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This is where your job application kanban board will be implemented.
                            Track your opportunities through: Interested → Applied → Interview → Completed
                        </p>

                        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-dashed border-blue-200 dark:border-blue-800">
                                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Interested</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Jobs you want to apply for</p>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-dashed border-yellow-200 dark:border-yellow-800">
                                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Applied</h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">Applications submitted</p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-dashed border-green-200 dark:border-green-800">
                                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Interview</h3>
                                <p className="text-sm text-green-700 dark:text-green-300">Interview scheduled/completed</p>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-dashed border-purple-200 dark:border-purple-800">
                                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Completed</h3>
                                <p className="text-sm text-purple-700 dark:text-purple-300">Offers, rejections, withdrawals</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Coming soon: Add jobs, track applications, generate tailored resumes and cover letters
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
