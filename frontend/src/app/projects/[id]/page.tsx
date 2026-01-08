'use client';

import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import { Task, Agent, Project } from '@/lib/types';
import { useParams } from 'next/navigation';
import { ProjectKanban } from '@/components/project/ProjectKanban';
import { ViewSwitcher, ProjectView } from '@/components/project/ViewSwitcher';
import { ProjectTable } from '@/components/project/ProjectTable';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectArtifacts } from '@/components/project/ProjectArtifacts';

const mockProject: Project = {
    id: '1',
    name: 'Website Redesign',
    description: 'Overhaul of the corporate website with new branding.',
    status: 'ACTIVE',
    createdAt: '2025-12-01',
    taskCount: 3,
    completedTaskCount: 1,
};

// Updated Mock Tasks with dates and artifacts
const initialTasks: Task[] = [
    {
        id: '101',
        projectId: '1',
        title: 'Define Brand Guidelines',
        description: 'Create color palette and typography.',
        status: 'DONE',
        priority: 'HIGH',
        assignedAgentId: '4',
        startDate: '2025-12-01',
        endDate: '2025-12-05',
        artifacts: [
            { id: 'a1', name: 'brand_guidelines.pdf', type: 'DOCUMENT', url: '#', createdAt: '2025-12-05' },
            { id: 'a2', name: 'logo_assets.zip', type: 'ARCHIVE', url: '#', createdAt: '2025-12-04' }
        ]
    },
    {
        id: '102',
        projectId: '1',
        title: 'Develop Home Page',
        description: 'Implement the landing page in Next.js.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedAgentId: '2',
        startDate: '2025-12-06',
        endDate: '2025-12-20',
        artifacts: [
            { id: 'a3', name: 'homepage_component.tsx', type: 'CODE', url: '#', createdAt: '2025-12-10' }
        ]
    },
    {
        id: '103',
        projectId: '1',
        title: 'Write Content',
        description: 'Draft copy for the about page.',
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: '2025-12-21',
        endDate: '2025-12-25'
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
    const [view, setView] = useState<ProjectView>('KANBAN');
    const params = useParams();

    const handleAssign = (taskId: string, agentId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, assignedAgentId: agentId } : t));
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/projects" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {mockProject.name}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                                {mockProject.status}
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-sm">{mockProject.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ViewSwitcher currentView={view} onViewChange={setView} />
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    <Link href={`/projects/${mockProject.id}/workflow`} className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
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
                    <ProjectKanban tasks={tasks} agents={mockAgents} onAssign={handleAssign} />
                )}
                {view === 'TABLE' && (
                    <ProjectTable tasks={tasks} agents={mockAgents} />
                )}
                {view === 'TIMELINE' && (
                    <ProjectTimeline tasks={tasks} />
                )}
                {view === 'ARTIFACTS' && (
                    <ProjectArtifacts tasks={tasks} />
                )}
            </div>
        </div>
    );
}
