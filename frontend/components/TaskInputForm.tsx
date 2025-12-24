"use client";

import { useState } from "react";

export default function TaskInputForm() {
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

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

            await response.json();
            setStatus("success");
            setDescription("");
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Describe your task
                </label>
                <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g. Research the latest trends in AI agents..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${status === "submitting" ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            transition duration-150 ease-in-out`}
                >
                    {status === "submitting" ? "Analyzing..." : "Start Task"}
                </button>
            </div>

            {status === "success" && (
                <div className="p-3 bg-green-100 text-green-700 rounded-md">
                    Task registered successfully!
                </div>
            )}
            {status === "error" && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                    Something went wrong. Please try again.
                </div>
            )}
        </form>
    );
}
