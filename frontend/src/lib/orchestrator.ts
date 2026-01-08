import { Task, AgentMessage, TaskStatus } from './types';

export class AgentOrchestrator {

    /**
     * Checks if a task can be started based on its dependencies.
     * @param task The task to check.
     * @param allTasks All tasks in the project (to lookup dependency status).
     * @returns Object containing allowed status and list of blocking task IDs.
     */
    static checkDependencies(task: Task, allTasks: Task[]): { allowed: boolean; blockingTaskIds: string[] } {
        if (!task.dependencies || task.dependencies.length === 0) {
            return { allowed: true, blockingTaskIds: [] };
        }

        const blockingTaskIds = task.dependencies.filter(depId => {
            const depTask = allTasks.find(t => t.id === depId);
            // Valid dependency and not done
            return depTask && depTask.status !== 'done';
        });

        if (blockingTaskIds.length > 0) {
            return { allowed: false, blockingTaskIds };
        }

        return { allowed: true, blockingTaskIds: [] };
    }

    /**
     * Identifies tasks that should be unlocked (status changed from BLOCKED -> TODO) 
     * when a specific task is completed.
     * @param completedTaskId The ID of the task just completed.
     * @param allTasks All tasks in the project.
     * @returns List of tasks that are now unblocked.
     */
    static getUnlockableTasks(completedTaskId: string, allTasks: Task[]): Task[] {
        // Find tasks that depend on the completed task
        const dependentTasks = allTasks.filter(t => t.dependencies?.includes(completedTaskId));

        const unlockableTasks: Task[] = [];

        for (const task of dependentTasks) {
            // Check if ALL dependencies for this task are now met
            // We simulate the state where completedTaskId IS done (because it just finished)
            // But we need to check its *other* dependencies.

            const otherDependencies = task.dependencies?.filter(d => d !== completedTaskId) || [];
            const areOthersDone = otherDependencies.every(depId => {
                const dep = allTasks.find(t => t.id === depId);
                return dep?.status === 'done';
            });

            if (areOthersDone) {
                unlockableTasks.push(task);
            }
        }

        return unlockableTasks;
    }

    /**
     * Generates a HANDOFF message when dependencies are resolved.
     */
    static generateHandoffMessage(unblockedTask: Task, fromAgentId: string): AgentMessage {
        return {
            id: crypto.randomUUID(),
            fromAgentId: fromAgentId, // The agent who finished the blocking task
            toAgentId: unblockedTask.assignedAgentId || 'BROADCAST',
            projectId: unblockedTask.projectId,
            taskId: unblockedTask.id,
            type: 'HANDOFF',
            content: `Dependency resolved. Task "${unblockedTask.title}" is now ready to start.`,
            timestamp: new Date().toISOString(),
            read: false
        };
    }
}
