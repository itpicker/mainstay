"use client";

import { useState } from "react";

export default function TaskInputForm() {
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [resultHistory, setResultHistory] = useState<string[]>([]);
    const [finalResult, setFinalResult] = useState<string>("");
    const [showLogs, setShowLogs] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setResultHistory([]);
        setFinalResult("");

        try {
            const response = await fetch("http://localhost:8000/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit task");
            }

            const data = await response.json();
            setStatus("success");
            setFinalResult(data.final_result || "");
            setResultHistory(data.execution_logs || []);
            setDescription("");
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Describe your task
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        className="w-full px-4 py-3 border border-blue-100 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white/50 backdrop-blur-sm transition-all"
                        placeholder="e.g. 제주도 여행 계획 짜줘 (Korean support enabled)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className={`w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-semibold text-white 
                ${status === "submitting" ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}
                transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]`}
                    >
                        {status === "submitting" ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </span>
                        ) : "Start Task"}
                    </button>
                </div>

                {status === "success" && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center shadow-sm">
                        <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Task completed successfully!
                    </div>
                )}
                {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                        Something went wrong. Please try again.
                    </div>
                )}
            </form>

            {finalResult && (
                <div className="mt-8 space-y-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Final Result
                            </h3>
                        </div>
                        <div className="p-8 text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                            {finalResult}
                        </div>
                    </div>

                    {resultHistory.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowLogs(!showLogs)}
                                className="text-sm font-semibold text-gray-500 hover:text-blue-600 flex items-center transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                            >
                                <svg className={`w-4 h-4 mr-1.5 transition-transform duration-200 ${showLogs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                {showLogs ? "Hide Execution Logs" : "Show Execution Logs"}
                            </button>

                            {showLogs && (
                                <div className="mt-3 bg-gray-900 rounded-xl p-5 font-mono text-xs text-blue-300 overflow-x-auto shadow-inner border border-gray-800 animate-slide-down">
                                    <ul className="space-y-3">
                                        {resultHistory.map((log, index) => (
                                            <li key={index} className="border-b border-gray-800 last:border-0 pb-3 last:pb-0 opacity-80 hover:opacity-100 transition-opacity">
                                                <span className="text-gray-600 mr-2">[{index + 1}]</span>
                                                {log}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
