# Mainstay Data & State Schema: Collaboration Intelligence

The following schemas define how project context and specialist interactions are stored and shared.

## 1. Project Intelligence (Shared State)
A centralized state object that all specialists can read from and contribute to.

```python
class ProjectState(TypedDict):
    project_id: str
    messages: Annotated[list[AnyMessage], add_messages] # Collaboration history
    team: List[Dict]                                    # Active specialists (Hired agents)
    goal_dag: Dict[str, Any]                           # Live task graph with status
    knowledge_base: Dict[str, Any]                      # Shared findings and data
    execution_logs: List[str]                          # Professional activity logs
    active_specialist: str                             # Specialist currently in control
```

## 2. Specialist Configuration
Metadata defining an agent's persona and base capabilities.

```json
{
  "role": "Developer",
  "persona": "Efficient, security-conscious, follows PEP8",
  "base_tools": ["terminal", "python_sandbox", "file_manager"],
  "specialty_description": "Can write complex logic and debug system errors."
}
```

## 3. Dynamic Task Schema (Goal DAG)
How tasks are represented within the collaborative plan.

```json
{
  "task_id": "T001",
  "title": "Analyze competitor API",
  "assignee": "Researcher",
  "status": "pending | In-progress | completed | blocked",
  "dependencies": [],
  "output": "JSON object with competitor endpoints",
  "reviewers": ["PM", "Developer"]
}
```

## 4. Meta-Tool Metadata
Structure for tools generated during the project.

```json
{
  "tool_id": "custom_data_parser_v1",
  "author": "Developer Agent",
  "purpose": "Parses non-standard CSV formats for the Analyst",
  "code_path": "backend/tools/dynamic/parser.py",
  "verified_by": "Support Lead"
}
```
