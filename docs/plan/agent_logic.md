# Mainstay Agent Logic: Autonomous Team Collaboration

This document outlines how specialist agents think and interact to solve problems as a team.

## 1. Role-Specific Thinking
Agents are initialized with a "Specialist Persona" that dictates their priorities and logic:
- **Project Manager**: Focuses on task dependency, progress tracking, and user alignment.
- **Developer**: Focuses on code quality, environment setup, and tool building.
- **Researcher**: Focuses on web/documentation discovery and data validity.
- **Support Lead**: Focuses on user interaction and intent refinement.

## 2. The Collaborative Decision Loop
Agents follow a standardized cognitive process:
1. **Observation**: Read the current `Project Intelligence` (shared state).
2. **Specialist Assessment**: "As a [Role], what part of the goal can I solve now?"
3. **Collaboration Check**: "Do I need data from another specialist? (e.g., Researcher) or a tool from another? (e.g., Developer)"
4. **Action/Delegation**:
    - Perform a task using a tool.
    - Post a request for another specialist.
    - Trigger the Tool Designer if a capability is missing.
5. **Critique/Review**: Specialists review relevant outputs from others before marking a task complete.

## 3. Autonomous Process Discovery
Instead of a fixed sequence, the team builds a "Live Plan":
- **Initial Planning**: PM Agent drafts a high-level task list.
- **Just-in-Time Refining**: As specialists work, they add sub-tasks or branches to the plan.
- **Dynamic Routing**: If a specialist discovers that "Task A" is impossible without "Task C," they update the Goal DAG and notify the PM Agent.

## 4. Meta-Tooling Logic
When an agent encounters a "Skill Gap":
1. **Define**: Specify the interface (input/output) and the logic for the missing tool.
2. **Implementation Request**: Send a request to the Developer Specialist or the `Tool Designer Loop`.
3. **Verification**: Once built, the agent runs a test case.
4. **Integration**: The agent successfully completes its task using the new tool.
