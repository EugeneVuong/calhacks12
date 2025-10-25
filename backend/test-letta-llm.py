"""
Test script for Letta LLM implementation.

This demonstrates how to use the LettaLLM with LiveKit Agents.
"""
import asyncio
import os
from dotenv import load_dotenv

# Import from your backend module
import sys
import os
import importlib.util
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Import module with hyphen in filename
spec = importlib.util.spec_from_file_location("letta_llm", "src/backend/letta-llm.py")
letta_llm_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(letta_llm_module)
LettaLLM = letta_llm_module.LettaLLM
from livekit.agents.llm import ChatContext, ChatRole

load_dotenv()


async def test_letta_llm():
    """Test the Letta LLM implementation."""
    
    # Get credentials from environment
    agent_id = "agent-ac1680d6-d3a4-409d-8116-38aef7247f4c"
    token = os.environ.get("LETTA_API_KEY")
    
    if not agent_id or not token:
        print("Error: Please set LETTA_AGENT_ID and LETTA_API_KEY environment variables")
        return
    
    print(f"Testing Letta LLM with agent: {agent_id}")
    
    # Create LLM instance
    llm = LettaLLM(agent_id=agent_id, token=token)
    
    # Create a chat context
    ctx = ChatContext()
    ctx.add_message(role="user", content="Hello! My name is Eugene.")
    
    # Create a chat stream
    stream = llm.chat(chat_ctx=ctx)
    
    print("\nResponse:")
    print("-" * 50)
    
    # Iterate over chunks
    async with stream:
        async for chunk in stream:
            if chunk.delta and chunk.delta.content:
                print(chunk.delta.content, end="", flush=True)
            
            # Print usage at the end
            if chunk.usage:
                print(f"\n\nUsage: {chunk.usage.total_tokens} total tokens")
                print(f"  - Prompt: {chunk.usage.prompt_tokens}")
                print(f"  - Completion: {chunk.usage.completion_tokens}")
    
    print("\n" + "-" * 50)
    print("Test completed!")


if __name__ == "__main__":
    asyncio.run(test_letta_llm())
