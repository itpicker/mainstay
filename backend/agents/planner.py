from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

def planner_node(state: AgentState):
    llm = get_llm()
    
    # Extract the original user request
    user_request = state["messages"][0].content
    
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful AI planner. Your goal is to create a concise plan for the user's task.\n"
                "CRITICAL INSTRUCTION: You MUST allow the user's language to dictate your response language.\n"
                "- If the user asks in Korean, you MUST respond in KOREAN.\n"
                "- If the user asks in English, respond in English.\n"
                "Do not respond in English if the user asks in Korean.",
            ),
            ("human", "{task}"),
        ]
    )
    chain = prompt | llm
    
    response = chain.invoke({"task": user_request})
    
    return {"messages": [HumanMessage(content=response.content, name="Planner")]}
