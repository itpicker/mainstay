import TaskInputForm from "@/components/TaskInputForm";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">New Task</h2>
                    <TaskInputForm />
                </div>

                {/* Placeholder for task list */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Tasks</h2>
                    <p className="text-gray-500">No active tasks yet.</p>
                </div>
            </div>
        </div>
    );
}
