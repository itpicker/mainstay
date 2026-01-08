'use client';

import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Task, Agent, Project, ProjectStage, TaskStatus, ReviewRequest, ChangeRequest } from '@/lib/types';
import { mockPending, mockHistory, mockChanges } from '@/lib/mock-data';
import { ProjectKanban } from '@/components/project/ProjectKanban';
import { ViewSwitcher, ProjectView } from '@/components/project/ViewSwitcher';
import { ProjectTable } from '@/components/project/ProjectTable';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectArtifacts } from '@/components/project/ProjectArtifacts';
import { CreateTaskModal } from '@/components/project/CreateTaskModal';
import { TaskDetailModal } from '@/components/project/TaskDetailModal';
import { ProjectReviews } from '@/components/project/ProjectReviews';
import { ProjectPhaseHeader } from '@/components/project/ProjectPhaseHeader';
import { ChangeRequestModal } from '@/components/project/ChangeRequestModal';

const initialStages: ProjectStage[] = [
    { id: 'todo', name: 'To Do', color: 'bg-slate-500' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', name: 'Review', color: 'bg-purple-500' },
    { id: 'done', name: 'Done', color: 'bg-green-500' },
];

const mockProject: Project = {
    id: '1',
    workspaceId: 'ws-toss',
    name: 'Website Redesign',
    description: 'Overhaul of the corporate website with new branding.',
    status: 'ACTIVE',
    lifecycle: 'PLANNING', // Initial state
    isPlanningFrozen: false,
    createdAt: '2025-12-01',
    taskCount: 3,
    completedTaskCount: 1,
    stages: initialStages
};

// Updated Mock Tasks with dates and artifacts
const initialTasks: Task[] = [
    {
        id: '101',
        projectId: '1',
        title: 'Define Brand Guidelines',
        description: 'Create color palette and typography.',
        status: 'done',
        priority: 'HIGH',
        assignedAgentId: '4',
        startDate: '2025-12-01',
        endDate: '2025-12-05',
        artifacts: [
            { id: 'a1', name: 'brand_guidelines.pdf', type: 'DOCUMENT', url: '#', createdAt: '2025-12-05' },
            { id: 'a2', name: 'logo_assets.zip', type: 'ARCHIVE', url: '#', createdAt: '2025-12-04' }
        ],
        subtasks: [
            { id: 's1', title: 'Research competitors', completed: true },
            { id: 's2', title: 'Draft color palette', completed: true },
            { id: 's3', title: 'Select typography', completed: true },
        ],
        activeReviewRequestId: 'rev-1' // Linked to Brand Guidelines PDF Review
    },
    {
        id: '102',
        projectId: '1',
        title: 'Develop Home Page',
        description: 'Implement the landing page in Next.js.',
        status: 'in_progress',
        priority: 'HIGH',
        assignedAgentId: '2',
        startDate: '2025-12-06',
        endDate: '2025-12-20',
        artifacts: [
            { id: 'a3', name: 'homepage_component.tsx', type: 'CODE', url: '#', createdAt: '2025-12-10' }
        ],
        subtasks: [
            { id: 's4', title: 'Setup layout', completed: true },
            { id: 's5', title: 'Implement hero section', completed: false },
            { id: 's6', title: 'Add responsive styles', completed: false },
        ],
        activeReviewRequestId: 'rev-2' // Linked to Database Architecture Decision
    },
    {
        id: '103',
        projectId: '1',
        title: 'Write Content',
        description: 'Draft copy for the about page.',
        status: 'todo',
        priority: 'MEDIUM',
        startDate: '2025-12-21',
        endDate: '2025-12-25',
        subtasks: []
    },
];

const mockAgents: Agent[] = [
    { id: '1', name: 'Alpha-1', role: 'MANAGER', status: 'BUSY', capabilities: [] },
    { id: '2', name: 'Beta-Dev', role: 'DEVELOPER', status: 'IDLE', capabilities: [] },
    { id: '3', name: 'Gamma-Res', role: 'RESEARCHER', status: 'IDLE', capabilities: [] },
    { id: '4', name: 'Delta-Des', role: 'DESIGNER', status: 'OFFLINE', capabilities: [] },
];

export default function ProjectDetailsPage() {
    const [tasks, setTasks] = useState(initialTasks);
    const [stages, setStages] = useState(initialStages);
    const [view, setView] = useState<ProjectView>('TABLE');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState<string>('todo');
    const [project, setProject] = useState(mockProject);

    // New state for task details
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const params = useParams();

    const handleAssign = (taskId: string, agentId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, assignedAgentId: agentId } : t));
    };

    // Stage Management Handlers
    const handleAddStage = (name: string) => {
        const newStage: ProjectStage = {
            id: name.toLowerCase().replace(/\s+/g, '_'),
            name: name,
            color: 'bg-slate-500' // Default color
        };
        setStages([...stages, newStage]);
    };

    const handleUpdateStage = (stageId: string, newName: string) => {
        setStages(stages.map(s => s.id === stageId ? { ...s, name: newName } : s));
    };

    const handleDeleteStage = (stageId: string) => {
        setStages(stages.filter(s => s.id !== stageId));
    };

    const handleTaskMove = (taskId: string, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const openCreateTaskModal = (status: string = 'todo') => {
        if (project.isPlanningFrozen) {
            alert("Planning is frozen. You must submit a Change Request to add new tasks during Execution.");
            return;
        }
        setNewTaskStatus(status);
        setIsTaskModalOpen(true);
    };

    const handleCreateTask = (taskData: {
        title: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        assignedAgentId?: string;
        subtasks?: { id: string; title: string; completed: boolean }[];
        startDate?: string;
        endDate?: string;
    }) => {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            projectId: mockProject.id,
            title: taskData.title,
            description: taskData.description,
            status: newTaskStatus,
            priority: taskData.priority,
            assignedAgentId: taskData.assignedAgentId,
            startDate: taskData.startDate,
            endDate: taskData.endDate,
            subtasks: taskData.subtasks || [],
            createdAt: new Date().toISOString()
        } as any;

        setTasks([...tasks, newTask]);
    };

    const openTaskDetail = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        setSelectedTask(updatedTask);
    };

    // Review State (Lifted Up)
    const [pendingRequests, setPendingRequests] = useState<ReviewRequest[]>(mockPending);
    const [reviewHistory, setReviewHistory] = useState<ReviewRequest[]>(mockHistory);
    const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(mockChanges);

    const handleReviewAction = (requestId: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED', optionId?: string) => {
        const request = pendingRequests.find(r => r.id === requestId);
        if (!request) return;

        // Move to history
        const updatedRequest = {
            ...request,
            status: action !== 'APPROVED' ? action : 'APPROVED' as const, // Fix type error
            selectedOptionId: optionId,
            feedback: optionId ? `Selected option: ${optionId}` : `Marked as ${action}`
        };

        setReviewHistory([updatedRequest, ...reviewHistory]);
        setPendingRequests(pendingRequests.filter(r => r.id !== requestId));

        // Update task status if needed
        const task = tasks.find(t => t.activeReviewRequestId === requestId);
        if (task) {
            handleTaskUpdate({ ...task, activeReviewRequestId: undefined });
        }
    };

    const handleFreezePlanning = () => {
        setProject({
            ...project,
            lifecycle: 'EXECUTION',
            isPlanningFrozen: true,
            planningFrozenAt: new Date().toISOString()
        });
    };

    const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);

    const handleRequestChange = () => {
        setIsChangeRequestOpen(true);
    };

    const handleSubmitChangeRequest = (data: { title: string; description: string; impact: string }) => {
        console.log("Change Request Submitted:", data);
        // Here we would typically save to backend
        alert("Change Request Submitted! Planning is now temporarily unlocked for review.");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Phase Header - Global for Project */}
            <ProjectPhaseHeader
                project={project}
                onFreezePlanning={handleFreezePlanning}
                onRequestChange={handleRequestChange}
            />

            <ChangeRequestModal
                isOpen={isChangeRequestOpen}
                onClose={() => setIsChangeRequestOpen(false)}
                onSubmit={handleSubmitChangeRequest}
            />

            <div className="space-y-6 h-full flex flex-col p-6 pt-2">
                <CreateTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleCreateTask}
                    agents={mockAgents}
                    defaultStatus={newTaskStatus}
                />

                <TaskDetailModal
                    task={selectedTask}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    onUpdate={handleTaskUpdate}
                    agents={mockAgents}
                    reviewRequests={pendingRequests}
                    onReviewAction={handleReviewAction}
                />

                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/projects" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                {project.name}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                                    {project.status}
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm">{project.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ViewSwitcher currentView={view} onViewChange={setView} />
                        <div className="w-px h-8 bg-white/10 mx-1" />
                        <Link href={`/projects/${project.id}/workflow`} className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                            View Workflow
                        </Link>
                        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                            <Play className="h-4 w-4" /> Run Project
                        </button>
                    </div>
                </div>

                {/* View Content */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {view === 'KANBAN' && (
                        <ProjectKanban
                            tasks={tasks}
                            agents={mockAgents}
                            stages={stages}
                            onAssign={handleAssign}
                            onCreateTask={openCreateTaskModal}
                            onTaskClick={openTaskDetail}
                            onAddStage={handleAddStage}
                            onUpdateStage={handleUpdateStage}
                            onDeleteStage={handleDeleteStage}
                            onMoveTask={handleTaskMove}
                        />
                    )}
                    {view === 'TABLE' && (
                        <ProjectTable
                            tasks={tasks}
                            agents={mockAgents}
                            stages={stages}
                            onTaskClick={openTaskDetail}
                            onCreateTask={openCreateTaskModal}
                            onUpdateStage={handleUpdateStage}
                            onDeleteStage={handleDeleteStage}
                        />
                    )}
                    {view === 'TIMELINE' && (
                        <ProjectTimeline tasks={tasks} />
                    )}
                    {view === 'ARTIFACTS' && (
                        <ProjectArtifacts tasks={tasks} />
                    )}
                    {view === 'REVIEWS' && (
                        <ProjectReviews
                            projectId={project.id}
                            agents={mockAgents}
                            pendingRequests={pendingRequests}
                            history={reviewHistory}
                            changeRequests={changeRequests}
                            onAction={handleReviewAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
