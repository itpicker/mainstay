'use client';

import { Activity, CheckCircle, Clock, Folder } from 'lucide-react';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ProjectService } from '@/lib/api/projects';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ProjectService.getAllProjects();
        // Map API response to UI type if key names mismatch (API uses title, UI uses name)
        const mappedProjects = data.map((p: any) => ({
          ...p,
          name: p.title,
          workspaceId: 'default', // Default workspace for now
          taskCount: 0, // Not yet returned by API
          completedTaskCount: 0
        }));
        setProjects(mappedProjects);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const activeProjects = projects.filter(p => p.status !== 'COMPLETED').length;
  // const completedTasks = ... (API doesn't return total completed tasks yet across all projects easily without fetching each)

  const stats = [
    { name: 'Active Projects', value: activeProjects.toString(), icon: Folder, change: 'Running now' },
    // { name: 'Tasks Completed', value: '0', icon: CheckCircle, change: 'Waiting for agents' }, // Placeholder until we have task aggregation
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your autonomous workforce.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 rounded-xl relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 relative z-10">{stat.change}</p>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </div>
        ))}
        {/* Static placeholder for now */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Agents Active</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 relative z-10">Awaiting dispatch</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-semibold mb-4 text-lg">Recent Projects</h3>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects yet.</div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-xl h-fit">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-3">
            <Link href="/projects/new" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
              <span className="text-sm font-medium">Create New Project</span>
              <Activity className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
