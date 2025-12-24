from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

def planner_node(state: AgentState):
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a planner. specific task: {task}. steps so far: {messages}. "
                "Provide a step-by-step plan or the next step to execute. "
                "Keep it concise.",
            ),
        ]
    )
    chain = prompt | llm
    
    # Extract the last user message as the main task context if needed
    response = chain.invoke({"task": "Achieve the user request", "messages": state["messages"]})
    
    return {"messages": [HumanMessage(content=response.content, name="Planner")]}
