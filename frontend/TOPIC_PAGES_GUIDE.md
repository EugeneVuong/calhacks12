# Topic-Based Pages with AI Chatbot Integration

This guide explains how to build and use topic-based pages with integrated AI chatbot functionality in your Next.js application.

## 🚀 Features

### Core Components
- **TopicPage**: Main component that displays comprehensive topic information
- **TopicChatbot**: AI-powered chatbot specialized for each topic
- **TopicResources**: Curated learning resources and materials
- **TopicQuiz**: Interactive quizzes to test knowledge
- **TopicSkillTree**: Visual learning path and skill progression

### Key Features
- ✅ Dynamic routing for any topic (`/topic/[topic]`)
- ✅ AI chatbot with topic-specific context
- ✅ Interactive quizzes with explanations
- ✅ Learning resource management
- ✅ Skill tree visualization
- ✅ Progress tracking
- ✅ Responsive design

## 📁 File Structure

```
src/
├── components/
│   └── topic-page/
│       ├── index.tsx              # Export all components
│       ├── topic-page.tsx        # Main topic page component
│       ├── topic-chatbot.tsx     # AI chatbot integration
│       ├── topic-resources.tsx   # Learning resources display
│       ├── topic-quiz.tsx        # Interactive quiz component
│       └── topic-skill-tree.tsx   # Learning path visualization
├── app/
│   ├── api/
│   │   └── topics/
│   │       └── [topic]/
│   │           └── route.ts       # API endpoint for topic data
│   └── topic/
│       ├── page.tsx              # Topics discovery page
│       └── [topic]/
│           └── page.tsx           # Dynamic topic page
```

## 🛠 Usage

### 1. Basic Topic Page

```tsx
import { TopicPage } from "@/components/topic-page";

// Use with topic name
<TopicPage topic="Machine Learning" />

// Use with pre-loaded data
<TopicPage 
  topic="Machine Learning" 
  initialData={topicData} 
/>
```

### 2. Navigation Integration

The sidebar has been updated to include a "Topics" section:

```tsx
// In app-sidebar.tsx
{
  title: "Topics",
  url: "/topic",
  icon: BookOpen,
  isActive: pathname.startsWith("/topic"),
}
```

### 3. API Integration

The system includes a mock API endpoint at `/api/topics/[topic]` that returns structured topic data:

```typescript
interface TopicData {
  topic: string;
  summary: string;
  key_concepts: string[];
  prerequisites: string[];
  difficulty_level: string;
  estimated_hours: number;
  resources: LearningResource[];
  subtopics: string[];
  current_trends: string[];
  career_applications: string[];
  quiz_questions?: QuizQuestion[];
  related_harder_topics?: string[];
}
```

## 🎯 How It Works

### 1. Topic Discovery
- Visit `/topic` to browse available topics
- Search and filter by categories
- View popular topics with difficulty levels

### 2. Dynamic Topic Pages
- Navigate to `/topic/[topic-name]` for any topic
- Example: `/topic/machine%20learning`
- Automatically loads topic data and displays comprehensive information

### 3. AI Chatbot Integration
- Each topic page includes a specialized AI chatbot
- Chatbot has context about the specific topic
- Provides topic-specific assistance and guidance
- Uses your existing Letta AI integration

### 4. Interactive Learning
- **Resources Tab**: Curated learning materials
- **Quiz Tab**: Interactive knowledge testing
- **Skill Tree Tab**: Learning path visualization
- **AI Chat Tab**: Topic-specific AI assistance

## 🔧 Customization

### Adding New Topics

1. **Update Mock Data** (in `/api/topics/[topic]/route.ts`):
```typescript
const mockTopicData: Record<string, TopicData> = {
  "your-new-topic": {
    topic: "Your New Topic",
    summary: "Topic description...",
    // ... rest of the data structure
  }
};
```

2. **Add to Static Generation** (in `/app/topic/[topic]/page.tsx`):
```typescript
export async function generateStaticParams() {
  const commonTopics = [
    // ... existing topics
    "your-new-topic"
  ];
  // ...
}
```

### Customizing Components

Each component is modular and can be customized:

```tsx
// Customize the chatbot
<TopicChatbot 
  topic={topic}
  topicData={topicData}
  // Add custom props as needed
/>

// Customize resources display
<TopicResources 
  resources={topicData.resources}
  // Add custom styling or behavior
/>
```

## 🔗 Backend Integration

### Current Implementation
- Uses mock data for demonstration
- API endpoint structure ready for backend integration

### Production Integration
To connect with your Python backend:

1. **Update API Route** (`/app/api/topics/[topic]/route.ts`):
```typescript
// Replace mock data with actual backend call
const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/topics/${topic}`);
const data = await backendResponse.json();
```

2. **Backend Endpoint** (Python):
```python
# Create endpoint that returns TopicData structure
@app.get("/api/topics/{topic}")
async def get_topic_data(topic: str):
    # Use your existing SkillTreeCourseAgent
    agent = EnhancedSkillTreeCourseAgent(topic)
    analysis = agent.research_topic_structured(topic)
    return analysis
```

## 🎨 Styling and Theming

The components use your existing UI library (shadcn/ui) and are fully customizable:

- Consistent with your app's design system
- Responsive design for all screen sizes
- Dark/light mode support
- Customizable color schemes

## 📱 Mobile Responsiveness

All components are mobile-optimized:
- Responsive grid layouts
- Touch-friendly interactions
- Optimized chat interface
- Mobile navigation

## 🚀 Next Steps

1. **Test the Implementation**:
   - Visit `/topic` to see the topics page
   - Try `/topic/machine%20learning` for a specific topic
   - Test the AI chatbot functionality

2. **Connect to Backend**:
   - Update the API route to call your Python backend
   - Implement real topic data fetching
   - Add authentication if needed

3. **Enhance Features**:
   - Add user progress tracking
   - Implement topic recommendations
   - Add social features (sharing, discussions)
   - Create topic collections

4. **Deploy**:
   - Test in production environment
   - Monitor performance and usage
   - Gather user feedback for improvements

## 🐛 Troubleshooting

### Common Issues

1. **Topic Not Found**: Check if the topic exists in mock data or backend
2. **Chatbot Not Working**: Verify Letta AI integration and API keys
3. **Styling Issues**: Ensure all UI components are properly imported
4. **Routing Issues**: Check Next.js dynamic routing configuration

### Debug Tips

- Check browser console for errors
- Verify API endpoints are working
- Test with different topic names
- Check network requests in dev tools

## 📚 Examples

### Example Topic URLs
- `/topic/machine%20learning`
- `/topic/data%20structures`
- `/topic/web%20development`

### Example Usage in Components
```tsx
// In any component
import Link from "next/link";

<Link href="/topic/machine%20learning">
  Learn Machine Learning
</Link>
```

This system provides a complete solution for building topic-based learning pages with AI chatbot integration, making it easy to create educational content that's both informative and interactive.
