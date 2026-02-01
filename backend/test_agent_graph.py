from backend.agents.graph import get_graph
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool
from langchain_core.messages import HumanMessage
import os
import uuid

# MOCK ENV for Testing if not set
if not os.getenv("DATABASE_URL"):
    print("Warning: DATABASE_URL not set. Test might fail or run stateless.")

db_uri = os.getenv("DATABASE_URL")

def test_memory():
    thread_id = str(uuid.uuid4())
    print(f"--- Starting Memory Test (Thread: {thread_id}) ---")
    
    # Run 1: Tell name
    print("\n[Run 1] User: 'Hi, my name is Minho.'")
    inputs_1 = {"messages": [HumanMessage(content="Hi, my name is Minho.")]}
    config = {"configurable": {"thread_id": thread_id}}
    
    with ConnectionPool(conninfo=db_uri, kwargs={"autocommit": True}) as pool:
        checkpointer = PostgresSaver(pool)
        checkpointer.setup()

    with ConnectionPool(conninfo=db_uri) as pool:
        checkpointer = PostgresSaver(pool)
        graph = get_graph(checkpointer=checkpointer)
        
        for event in graph.stream(inputs_1, config=config):
            for node, values in event.items():
                if "messages" in values:
                    print(f"[{node}]: {values['messages'][-1].content}")

    # Run 2: Ask name (New Graph Instance, Same Thread ID)
    print("\n[Run 2] User: 'What is my name?'")
    inputs_2 = {"messages": [HumanMessage(content="What is my name?")]}
    
    with ConnectionPool(conninfo=db_uri) as pool:
        checkpointer = PostgresSaver(pool)
        graph = get_graph(checkpointer=checkpointer)
        
        for event in graph.stream(inputs_2, config=config):
            for node, values in event.items():
                if "messages" in values:
                    print(f"[{node}]: {values['messages'][-1].content}")
                    
    print("\n--- Memory Test Finished ---")

if __name__ == "__main__":
    test_memory()
