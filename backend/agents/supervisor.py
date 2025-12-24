from typing import Literal
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers.openai_functions import JsonOutputFunctionsParser
from langchain_core.output_parsers import JsonOutputParser
from backend.agents.state import AgentState
from backend.llm_factory import get_llm
import json

# Members of the agent team
members = ["Planner", "Executor"]
system_prompt = (
    "You are a supervisor tasked with managing a conversation between the"
    " following workers: {members}. Given the following user request,"
    " respond with the worker to act next. Each worker will perform a"
    " task and respond with their results and status. When finished,"
    " respond with FINISH."
    "\n\nRespond in JSON format with a single key 'next' and value being one of {options}."
)

options = ["FINISH"] + members

def supervisor_node(state: AgentState):
    llm = get_llm()
    
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
            (
                "system",
                "Who should act next? Select one of: {options}",
            ),
        ]
    ).partial(options=str(options), members=", ".join(members))

    # Adapt for Ollama which might not support function calling as strictly
    # We will ask for JSON output
    
    chain = prompt | llm | JsonOutputParser()
    
    try:
        result = chain.invoke(state)
        # Handle cases where LLM might return a list or slightly different structure
        if isinstance(result, list): 
             result = result[0]
        next_step = result.get("next")
        if next_step not in options:
            next_step = "FINISH" # Fallback
    except Exception as e:
        print(f"Supervisor Error: {e}")
        # Fallback logic or retry could go here
        next_step = "Planner" # Default to Planner if confused

    return {"next_step": next_step}
