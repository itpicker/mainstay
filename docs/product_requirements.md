# Mainstay: AI-Native Project Management Platform (v1.0)

## 1. Product Vision
Mainstay is an **AI-Human Collaboration Platform** designed to manage complex software projects. Unlike traditional tools, it treats AI Agents as first-class team members with specific roles (Manager, Developer, Designer), enforcing a strict workflow to prevent scope creep and ensure quality.

## 2. Core Workflows

### 2.1. Strict Stage-Gate Protocol ("Fix & Freeze")
To ensure project completion, the lifecycle is divided into two rigid phases:

1.  **Definition Phase (Planning)**
    - **Activity**: Requirements gathering, PRD generation, task breakdown.
    - **State**: Fluid (unlimited edits).
    - **Gate**: **"Sign-off & Freeze"**. The user must explicitly approve the plan.
2.  **Execution Phase (Development)**
    - **Activity**: AI Agents execute tasks based *only* on the frozen plan.
    - **State**: Rigid (Locked). New task creation is blocked.
    - **Change Management**: Modifications require a formal **Change Request (CR)**.

### 2.2. Human-in-the-Loop Validation
AI autonomy is bounded by human oversight.
- **Review Requests**: Agents cannot mark tasks as "Done" without human approval.
- **Inbox**: A centralized dashboard for all pending decisions (Approvals, Rejections, Feedback).
- **Project History**: A dedicated `Reviews` tab in each project tracks the decision log.

## 3. Key Modules

### 3.1. Organization & Hierarchy
- **Workspaces**: Top-level container supporting `Personal`, `Team`, and `Enterprise` types.
- **Projects**: Each project belongs to a workspace and contains its own agents, tasks, and artifacts.

### 3.2. Project Management Views
- **Table View (Default)**: High-density list for managing scope and dates.
- **Kanban**: Drag-and-drop workflow visualization.
- **Timeline**: Gantt-chart style visualization of schedule.
- **Artifacts**: File explorer for generated outputs (Code, PDFs, Images).
- **Reviews**: Decision history and active change requests.

### 3.3. Collaboration Features
- **Project Phase Header**: Visual indicator of the current lifecycle stage.
- **Change Request Modal**: Formal UI for submitting scope changes during Execution (Title, Description, Impact Analysis).

## 4. Technical Specifications
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (with Glassmorphism aesthetic)
- **Language**: TypeScript
- **Date Standardization**: Strict `YYYY. MM. DD.` format to prevent Server/Client hydration mismatches.
- **State Management**: React Hooks + Optimistic UI updates.

## 5. UI/UX Principles
- **"Premium" Aesthetic**: Dark mode default, subtle gradients, glass-card effects.
- **Keyboard Accessibility**: `ESC` key support for all modals.
- **Prevention**: Proactive alerts (e.g., blocking actions when Planning is frozen).
