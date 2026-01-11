'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Task, Agent, Project, ProjectStage, ReviewRequest, ChangeRequest } from '@/lib/types';
import { mockPending, mockHistory, mockChanges } from '@/lib/mock-data';
import { ProjectKanban } from '@/components/project/ProjectKanban';
import { ViewSwitcher, ProjectView } from '@/components/project/ViewSwitcher';
import { ProjectTable } from '@/components/project/ProjectTable';
import { ProjectArtifacts } from '@/components/project/ProjectArtifacts';
import { CreateTaskModal } from '@/components/project/CreateTaskModal';
import { TaskDetailModal } from '@/components/project/TaskDetailModal';
import { ProjectReviews } from '@/components/project/ProjectReviews';
import { ChangeRequestModal } from '@/components/project/ChangeRequestModal';
import { TaskDependencyGraph } from '@/components/project/TaskDependencyGraph';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { PlanningChat } from '@/components/project/PlanningChat';
import { cn } from '@/lib/utils';
import { AgentChatWindow } from '@/components/project/AgentChatWindow';
import { ProjectService } from '@/lib/api/projects';

const initialStages: ProjectStage[] = [
    { id: 'todo', name: 'To Do', color: 'bg-slate-500' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', name: 'Review', color: 'bg-purple-500' },
    { id: 'done', name: 'Done', color: 'bg-green-500' },
];

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectAgents, setProjectAgents] = useState<Agent[]>([]);

    // UI State
    const [stages, setStages] = useState(initialStages);
    const [view, setView] = useState<ProjectView>('TABLE');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState<string>('todo');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isPlanningMode, setIsPlanningMode] = useState(false);
    const [ghostTasks, setGhostTasks] = useState<Task[]>([]);
    const [activeChatAgentId, setActiveChatAgentId] = useState<string | null>(null);
    const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);

    // Review State (Mock for now until API implemented)
    const [pendingRequests, setPendingRequests] = useState<ReviewRequest[]>(mockPending);
    const [reviewHistory, setReviewHistory] = useState<ReviewRequest[]>(mockHistory);
    const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(mockChanges);

    // Load Data
    useEffect(() => {
        const loadProjectData = async () => {
            setIsLoading(true);
            try {
                const [pData, tData, aData] = await Promise.all([
                    ProjectService.getProject(projectId),
                    ProjectService.getTasks(projectId),
                    ProjectService.getTeam(projectId)
                ]);

                // Mapper to align API fields to UI fields if necessary
                const mappedProject = {
                    ...pData,
                    name: (pData as any).title || pData.name, // Handle title vs name
                    createdAt: (pData as any).created_at, // Map snake_case to camelCase
                };

                setProject(mappedProject);
                setTasks(tData);
                setProjectAgents(aData);
            } catch (error) {
                console.error("Failed to load project details:", error);
                // Handle 404 or other errors
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) {
            loadProjectData();
        }
    }, [projectId]);

    // Handlers
    const handleAssign = async (taskId: string, agentId: string) => {
        try {
            const updatedTask = await ProjectService.updateTask(taskId, { assignedAgentId: agentId });
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
        } catch (error) {
            console.error("Failed to assign agent:", error);
        }
    };

    const handleUpdateAgent = (updatedAgent: Agent) => {
        setProjectAgents(projectAgents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    };

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

    const handleTaskMove = async (taskId: string, newStatus: string) => {
        // Optimistic update
        const originalTasks = [...tasks];
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await ProjectService.updateTask(taskId, { status: newStatus });
        } catch (error) {
            console.error("Failed to move task:", error);
            setTasks(originalTasks); // Revert
        }
    };

    const toggleAgentActivity = () => {
        if (!project) return;
        setProject(prev => prev ? ({
            ...prev,
            isAgentsActive: !prev.isAgentsActive
        }) : null);
        // Ideally save this state to backend via updateProject
    };

    const openCreateTaskModal = (status: string = 'todo') => {
        if (project?.isAgentsActive) {
            alert("Planning is locked while Agents are active. Please pause operations to modify the plan.");
            return;
        }
        setNewTaskStatus(status);
        setIsTaskModalOpen(true);
    };

    const handleCreateTask = async (taskData: {
        title: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        assignedAgentId?: string;
        subtasks?: { id: string; title: string; completed: boolean }[];
        startDate?: string;
        endDate?: string;
    }) => {
        try {
            const newTask = await ProjectService.createTask(projectId, {
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                status: newTaskStatus,
                assignedAgentId: taskData.assignedAgentId
                // Note: subtasks, dates not yet supported fully in backend create DTO, will add later
            });
            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Failed to create task:", error);
            alert("Failed to create task");
        }
    };

    const openTaskDetail = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const handleTaskUpdate = async (updatedTaskInput: Task) => {
        try {
            const updatedTask = await ProjectService.updateTask(updatedTaskInput.id, {
                title: updatedTaskInput.title,
                description: updatedTaskInput.description,
                status: updatedTaskInput.status,
                priority: updatedTaskInput.priority,
                assignedAgentId: updatedTaskInput.assignedAgentId
            });
            setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
            setSelectedTask(updatedTask);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const handleReviewAction = (requestId: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED', optionId?: string) => {
        // Mock implementation maintained for reviews until backend supports it
        const request = pendingRequests.find(r => r.id === requestId);
        if (!request) return;

        const updatedRequest = {
            ...request,
            status: action !== 'APPROVED' ? action : 'APPROVED' as const,
            selectedOptionId: optionId,
            feedback: optionId ? `Selected option: ${optionId}` : `Marked as ${action}`
        };

        setReviewHistory([updatedRequest, ...reviewHistory]);
        setPendingRequests(pendingRequests.filter(r => r.id !== requestId));

        const task = tasks.find(t => t.activeReviewRequestId === requestId);
        if (task) {
            // handleTaskUpdate({ ...task, activeReviewRequestId: undefined });
            // Should call API here
        }
    };

    const handleSubmitChangeRequest = (data: { title: string; description: string; impact: string }) => {
        console.log("Change Request Submitted:", data);
        alert("Change Request Submitted! Planning is now temporarily unlocked for review.");
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!project) {
        return <div className="text-center p-10">Project not found</div>;
    }

    return (
        <div className="flex flex-col h-full">
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
                    agents={projectAgents} // Use real agents
                    defaultStatus={newTaskStatus}
                />

                <TaskDetailModal
                    task={selectedTask}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    onUpdate={handleTaskUpdate}
                    agents={projectAgents}
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

                        {/* AI Planning Trigger */}
                        {(view === 'KANBAN' || view === 'TABLE') && (
                            <button
                                onClick={() => setIsPlanningMode(!isPlanningMode)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                                    isPlanningMode
                                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                )}
                                title={isPlanningMode ? 'Close AI Planner' : 'Plan with AI'}
                            >
                                <Sparkles className="h-4 w-4" />
                            </button>
                        )}

                        <Link href={`/projects/${project.id}/workflow`} className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                            View Workflow
                        </Link>
                        <button
                            onClick={toggleAgentActivity}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${project.isAgentsActive
                                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                }`}
                        >
                            {project.isAgentsActive ? (
                                <>
                                    <Pause className="h-4 w-4" /> Pause Project
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" /> Run Project
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* View Content */}
                <div className="flex-1 min-h-0 flex overflow-hidden">
                    {view === 'KANBAN' && (
                        <div className="flex-1 flex min-w-0">
                            <ProjectKanban
                                tasks={[...tasks, ...ghostTasks]}
                                agents={projectAgents}
                                stages={stages}
                                onAssign={handleAssign}
                                onCreateTask={openCreateTaskModal}
                                onTaskClick={openTaskDetail}
                                onAddStage={handleAddStage}
                                onUpdateStage={handleUpdateStage}
                                onDeleteStage={handleDeleteStage}
                                onMoveTask={handleTaskMove}
                            />
                            {isPlanningMode && (
                                <PlanningChat
                                    onClose={() => setIsPlanningMode(false)}
                                    onUpdateGhostTasks={setGhostTasks}
                                    onConfirmPlan={(newTasks) => {
                                        setTasks([...tasks, ...newTasks]);
                                        setGhostTasks([]);
                                        setIsPlanningMode(false);
                                        // TODO: Should bulk create tasks via API
                                    }}
                                />
                            )}
                        </div>
                    )}
                    {view === 'TABLE' && (
                        <div className="flex-1 flex min-w-0">
                            <ProjectTable
                                tasks={[...tasks, ...ghostTasks]}
                                agents={projectAgents}
                                stages={stages}
                                onTaskClick={openTaskDetail}
                                onCreateTask={openCreateTaskModal}
                                onUpdateStage={handleUpdateStage}
                                onDeleteStage={handleDeleteStage}
                            />
                            {isPlanningMode && (
                                <PlanningChat
                                    onClose={() => setIsPlanningMode(false)}
                                    onUpdateGhostTasks={setGhostTasks}
                                    onConfirmPlan={(newTasks) => {
                                        setTasks([...tasks, ...newTasks]);
                                        setGhostTasks([]);
                                        setIsPlanningMode(false);
                                        // TODO: Should bulk create tasks via API
                                    }}
                                />
                            )}
                        </div>
                    )}
                    {view === 'ARTIFACTS' && (
                        <ProjectArtifacts tasks={tasks} />
                    )}
                    {view === 'REVIEWS' && (
                        <ProjectReviews
                            projectId={project.id}
                            agents={projectAgents}
                            pendingRequests={pendingRequests}
                            history={reviewHistory}
                            changeRequests={changeRequests}
                            onAction={handleReviewAction}
                        />
                    )}
                    {view === 'TEAM' && (
                        <ProjectTeam
                            agents={projectAgents}
                            onUpdateAgent={handleUpdateAgent}
                            onMessage={(agent) => setActiveChatAgentId(agent.id)}
                        />
                    )}
                    {view === 'GRAPH' && (
                        <TaskDependencyGraph tasks={tasks} agents={projectAgents} />
                    )}
                </div>
            </div>

            {/* Global Chat Window */}
            {activeChatAgentId && (
                <AgentChatWindow
                    agent={projectAgents.find(a => a.id === activeChatAgentId)!}
                    onClose={() => setActiveChatAgentId(null)}
                />
            )}
        </div>
    );
}
