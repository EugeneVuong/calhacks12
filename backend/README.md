# Lettuce AI Agent Integration

This project integrates Lettuce AI Agent with a modern web interface using LiveKit Agents, FastAPI, and Next.js.

## 🏗️ Architecture

```
Frontend (Next.js) ←→ Backend API (FastAPI) ←→ Lettuce LLM ←→ Lettuce API
```

- **Frontend**: Next.js chat interface with real-time streaming
- **Backend**: FastAPI server that bridges frontend and Lettuce
- **Lettuce LLM**: Custom LiveKit-compatible LLM implementation
- **Lettuce API**: Lettuce's AI agent service

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd calhacks12/backend

# Install dependencies
pip install -e .

# Copy environment template
cp env.example .env

# Edit .env with your Lettuce credentials
# LETTA_API_KEY=sk-let-your-api-key-here
# LETTA_AGENT_ID=agent-your-agent-id-here

# Start the API server
python start_server.py
```

### 2. Frontend Setup

```bash
cd calhacks12/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000/chat
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Lettuce API Configuration
LETTA_API_KEY=sk-let-your-api-key-here
LETTA_AGENT_ID=agent-your-agent-id-here

# Optional: Lettuce Base URL (defaults to https://api.letta.com)
LETTA_BASE_URL=https://api.letta.com

# Backend API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Getting Lettuce Credentials

1. Sign up at [Lettuce](https://letta.com)
2. Create an AI agent
3. Get your API key and agent ID from the dashboard

## 📡 API Endpoints

### POST `/chat`
Send a message and get a complete response.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Response:**
```json
{
  "content": "Hello! How can I help you today?",
  "usage": {
    "completion_tokens": 10,
    "prompt_tokens": 5,
    "total_tokens": 15
  }
}
```

### POST `/chat/stream`
Stream a response in real-time.

**Request:** Same as `/chat`

**Response:** Server-sent events with streaming content.

### GET `/health`
Check API health and agent status.

## 🎯 Features

- ✅ **Real-time Chat**: Stream responses from Lettuce AI
- ✅ **Error Handling**: Graceful error handling and user feedback
- ✅ **Message History**: Maintains conversation context
- ✅ **Responsive UI**: Modern, mobile-friendly interface
- ✅ **LiveKit Integration**: Compatible with LiveKit Agents framework
- ✅ **Type Safety**: Full TypeScript support

## 🔍 Troubleshooting

### Common Issues

1. **"LETTA_AGENT_ID and LETTA_API_KEY must be set"**
   - Ensure your `.env` file exists and contains valid credentials
   - Check that environment variables are loaded correctly

2. **"HTTP error! status: 401"**
   - Verify your `LETTA_API_KEY` is correct
   - Check that your API key has proper permissions

3. **"HTTP error! status: 404"**
   - Verify your `LETTA_AGENT_ID` is correct
   - Ensure the agent exists in your Lettuce dashboard

4. **Frontend can't connect to backend**
   - Check that the backend is running on port 8000
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check CORS settings in the API

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=DEBUG
```

## 🧪 Testing

### Test the Lettuce LLM directly:
```bash
cd calhacks12/backend
python src/backend/letta_test.py
```

### Test the API:
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

## 📚 Development

### Project Structure

```
calhacks12/
├── backend/
│   ├── src/backend/
│   │   ├── api.py          # FastAPI server
│   │   ├── letta.py        # Lettuce LLM implementation
│   │   ├── main.py         # LiveKit agent entrypoint
│   │   └── letta_test.py   # Test script
│   ├── start_server.py     # Server startup script
│   ├── env.example         # Environment template
│   └── pyproject.toml     # Python dependencies
└── frontend/
    ├── src/
    │   ├── app/chat/       # Chat page
    │   └── components/
    │       └── chatbox/    # Chat components
    └── package.json        # Node dependencies
```

### Adding Features

1. **New API endpoints**: Add to `api.py`
2. **UI components**: Add to `frontend/src/components/`
3. **LLM features**: Extend `letta.py`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
