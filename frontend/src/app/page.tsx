'use client';

import { Activity, CheckCircle, Clock } from 'lucide-react';
import { Project } from '@/lib/types';
import Link from 'next/link';

// Mock stats
const stats = [
  { name: 'Active Projects', value: '3', icon: Activity, change: '+1 from last week' },
  { name: 'Tasks Completed', value: '25', icon: CheckCircle, change: '+12% efficiency' },
  { name: 'Avg. Turnaround', value: '4h', icon: Clock, change: '-30m improvement' },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your autonomous workforce.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-xl h-64 flex flex-col items-center justify-center text-center text-muted-foreground border-dashed border-2 border-white/5">
          <Activity className="h-10 w-10 mb-2 opacity-50" />
          <p>Activity Graph Placeholder</p>
          <span className="text-xs">Visualization of agent actions over time</span>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-3">
            <Link href="/projects/new" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
              <span className="text-sm font-medium">Draft New Project</span>
              <Activity className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <button className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group w-full text-left">
              <span className="text-sm font-medium">Review Pending Tasks</span>
              <CheckCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
