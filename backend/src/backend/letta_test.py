import asyncio, os
from openai import AsyncOpenAI
from dotenv import load_dotenv
load_dotenv()

BASE_URL = "https://api.letta.com/v1"  # don't include /chat/completions here
MODEL = "agent-5da76546-028c-4add-89e5-5639c5566e0c"

# put your sk-let-... token in an env var to avoid hardcoding secrets
# e.g. export LETTA_API_KEY="sk-let-…"

async def main():
    client = AsyncOpenAI(
        base_url=BASE_URL,
        api_key=os.environ["LETTA_API_KEY"],
        # default_headers={"X-Custom": "value"},  # if your provider needs extra headers
    )

    # --- streaming ---
    stream = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": "Hello"}],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            print(delta.content, end="", flush=True)
    await stream.close()
    print()


if __name__ == "__main__":
    asyncio.run(main())
