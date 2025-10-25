# Memory AI SDK 



import uuid
import logging
from typing import List, Any, LiteralString
from livekit.agents import llm
from livekit.agents.llm.chat_context import ChatContext, ChatItem
from livekit.agents.types import APIConnectOptions, DEFAULT_API_CONNECT_OPTIONS
from livekit.agents._exceptions import APIError  # LiveKit's error type
import requests
import json

logger = logging.getLogger(__name__)


class LettaLLM(llm.LLM):
    """Echo LLM that mirrors LiveKit message-handling semantics (no pruning, no fallback)."""

    def __init__(self, agent_id: str, token: str, base_url: str = "https://api.letta.com"):
        super().__init__()
        self.agent_id = agent_id
        self.token = token
        self.base_url = base_url.rstrip("/")
        logger.info(f"LettaLLM initialized with agent_id: {agent_id}")

    @property
    def model(self) -> str:
        return "letta-agent"

    @property
    def provider(self) -> str:
        return "letta"

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        tools: List[Any] | None = None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        **kwargs,
    ) -> "LettaLLMStream":
        # LiveKit forwards the ChatContext untouched; do the same.
        return LettaLLMStream(
            llm=self,
            chat_ctx=chat_ctx,
            tools=tools or [],
            conn_options=conn_options,
        )

    @property
    def supports_vision(self) -> bool:
        return False

    @property
    def supports_functions(self) -> bool:
        return False

    async def aclose(self) -> None:
        logger.debug("LettaLLM closed")


class LettaLLMStream(llm.LLMStream):
    def __init__(
        self,
        *,
        llm: LettaLLM,
        chat_ctx: ChatContext,
        tools: List[Any],
        conn_options: APIConnectOptions,
    ):
        super().__init__(llm=llm, chat_ctx=chat_ctx, tools=tools, conn_options=conn_options)

    async def _run(self) -> None:
        request_id = str(uuid.uuid4())
        message = self._extract_last_user_text()

        # LiveKit doesn't invent a reply on empty last user turn.
        # Many providers 400 here; surface it as a non-retryable APIError.
        if not (message or "").strip():
            raise APIError("Empty user message", retryable=False)

        response = await self.ask_letta(message)
        
        # Extract assistant message and usage from the response
        assistant_content = response.get("assistant_message", "")
        usage_info = response.get("usage", {})

        # Stream the response word-by-word like a provider delta stream
        words = assistant_content.split() if assistant_content else []

        # Emit token-like deltas; base class metrics/TTFT handling mirrors LiveKit.
        for i, w in enumerate(words):
            chunk = llm.ChatChunk(
                id=request_id,
                delta=llm.ChoiceDelta(content=(w + (" " if i < len(words) - 1 else ""))),
            )
            await self._event_ch.send(chunk)

        # Final usage chunk with actual token usage from Letta API
        final = llm.ChatChunk(
            id=request_id,
            usage=llm.CompletionUsage(
                completion_tokens=usage_info.get("completion_tokens", 0),
                prompt_tokens=usage_info.get("prompt_tokens", 0),
                total_tokens=usage_info.get("total_tokens", 0),
            ),
        )
        await self._event_ch.send(final)

    async def ask_letta(self, prompt: str) -> dict:
        url = f"https://api.letta.com/v1/agents/{self._llm.agent_id}/messages"
        headers = {
            "Authorization": f"Bearer {self._llm.token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        response = requests.post(url, headers=headers, json=payload)
        response_data = response.json()
        
        # Extract assistant message and usage information
        assistant_message = None
        assistant_content = None
        usage_info = response_data.get("usage", {})
        
        # Find the assistant message in the messages array
        messages = response_data.get("messages", [])
        for msg in messages:
            if msg.get("message_type") == "assistant_message":
                assistant_message = msg
                assistant_content = msg.get("content", "")
                break
        
        return {
            "assistant_message": assistant_content if assistant_content else None,
            "full_message": assistant_message,
            "usage": {
                "completion_tokens": usage_info.get("completion_tokens", 0),
                "prompt_tokens": usage_info.get("prompt_tokens", 0),
                "total_tokens": usage_info.get("total_tokens", 0),
            }
        }

    def _extract_last_user_text(self) -> str:
        """Return text for the most recent USER message; keep content shapes intact."""
        try:
            msgs = list(self._chat_ctx.items)
            for m in reversed(msgs):
                if m.role == "user":
                    return self._to_text(m.content)
            return ""
        except Exception as e:
            logger.error(f"Error extracting last user text: {e}")
            return ""

    def _to_text(self, content: Any) -> str:
        """Mimic tolerant provider behavior: accept str or a parts list/dict and join text."""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            out = []
            for part in content:
                if isinstance(part, str):
                    out.append(part)
                elif isinstance(part, dict):
                    # Common OpenAI-style part: {"type": "text", "text": "..."}
                    if part.get("type") == "text":
                        out.append(part.get("text", ""))
            return "".join(out)
        if isinstance(content, dict) and content.get("type") == "text":
            return content.get("text", "")
        return str(content)

