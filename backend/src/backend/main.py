import os
import sys

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from letta_client import Letta, VoiceSleeptimeManagerUpdate


from livekit import agents
from livekit.agents import AgentSession, Agent, AutoSubscribe
from livekit.plugins import (
    openai,
    deepgram,
    tavus,
)
import openai as openai_client
load_dotenv()


async def entrypoint(ctx: agents.JobContext):
    agent_id = os.environ.get('LETTA_AGENT_ID')
    
    
    session = AgentSession(     
        # llm=openai.LLM(model=agent_id, api_key=os.getenv('LETTA_API_KEY'), base_url="https://api.letta.com/v1/chat/completions/"),
        llm=openai.LLM(model=agent_id, client=openai_client.AsyncOpenAI(api_key=os.getenv('LETTA_API_KEY'), base_url="https://api.letta.com/v1/chat/completions/")),
        stt=deepgram.STT(),
        tts=deepgram.TTS(),
    )

    # avatar = tavus.AvatarSession(
    #     replica_id="your-replica-id",
    #     persona_id="your-persona-id",
    #     api_key=os.getenv('TAVUS_API_KEY'),
    #     # Optional: avatar_participant_name="Tavus-avatar-agent"
    # )

    # await avatar.start(session, room=ctx.room)

    await session.start(
        room=ctx.room,
        agent=Agent(instructions=""), # instructions should be set in the Letta agent
    )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    handle = session.generate_reply(user_input="Hello! What is your name?")
    
    # Wait a bit to see if we get any response
    import asyncio
    await asyncio.sleep(5)
    print("✓ Waiting for LLM response...")

if __name__ == "__main__":
    # check that agent exists
    client = Letta(token=os.getenv('LETTA_API_KEY'))

    # create the Letta agent
    agent = client.agents.create(
        name="low_latency_voice_agent_demo",
        agent_type="voice_convo_agent",
        memory_blocks=[
            {"value": "Name: ?", "label": "human"},
            {"value": "You are a helpful assistant.", "label": "persona"},
        ],
        model="openai/gpt-4o-mini", # Use 4o-mini for speed
        embedding="openai/text-embedding-3-small",
        enable_sleeptime=True,
        initial_message_sequence = [],
    )
    print(f"Created agent id {agent.id}")

    # configure the sleep-time agent 
    group_id = agent.multi_agent_group.id
    max_message_buffer_length = agent.multi_agent_group.max_message_buffer_length
    min_message_buffer_length = agent.multi_agent_group.min_message_buffer_length
    print(f"Group id: {group_id}, max_message_buffer_length: {max_message_buffer_length},  min_message_buffer_length: {min_message_buffer_length}")
    # change it to be more frequent
    group = client.groups.modify(
        group_id=group_id,
        manager_config=VoiceSleeptimeManagerUpdate(
            max_message_buffer_length=10,
            min_message_buffer_length=6,
        )
    )

    # update the sleep-time agent model 
    sleeptime_agent_id = [agent_id for agent_id in group.agent_ids if agent_id != agent.id][0]
    client.agents.modify(
        agent_id=sleeptime_agent_id,
        model="anthropic/claude-sonnet-4-20250514"
    )

    # Set the agent id in environment variable so it's accessible in the worker process
    os.environ['LETTA_AGENT_ID'] = agent.id
    print(f"Agent id: {agent.id}")

    # Now that LETTA_AGENT_ID is set, run the worker app
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))