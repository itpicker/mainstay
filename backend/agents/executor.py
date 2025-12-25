from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

def executor_node(state: AgentState):
    llm = get_llm()
    
    # Extract the plan (last message from Planner)
    # The messages list: [User, Planner]
    plan_text = state["messages"][-1].content
    
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an executor agent. Your job is to simulate the execution of the plan provided.\n"
                "CRITICAL INSTRUCTION: You MUST match the language of the plan/context.\n"
                "- If the plan or user request is in Korean, your report MUST be in KOREAN.\n"
                "- If it is in English, use English.",
            ),
            ("human", "Execute this plan: {plan}"),
        ]
    )
    chain = prompt | llm
    response = chain.invoke({"plan": plan_text})
    return {"messages": [HumanMessage(content=response.content, name="Executor")]}
