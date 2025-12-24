from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from backend.agents.state import AgentState
from backend.llm_factory import get_llm

def executor_node(state: AgentState):
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an executor. Execute the actions required based on the plan. "
                "For now, simulate execution and report success. Context: {messages}",
            ),
        ]
    )
    chain = prompt | llm
    response = chain.invoke({"messages": state["messages"]})
    return {"messages": [HumanMessage(content=response.content, name="Executor")]}
