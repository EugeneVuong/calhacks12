import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Clock, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

const popularTopics = [
  {
    name: "Machine Learning",
    description: "Learn algorithms and statistical models for AI systems",
    difficulty: "intermediate",
    hours: 120,
    category: "AI & Data Science"
  },
  {
    name: "Data Structures",
    description: "Master fundamental data organization techniques",
    difficulty: "beginner",
    hours: 80,
    category: "Computer Science"
  },
  {
    name: "Web Development",
    description: "Build modern web applications with latest technologies",
    difficulty: "beginner",
    hours: 200,
    category: "Development"
  },
  {
    name: "Python Programming",
    description: "Learn Python from basics to advanced concepts",
    difficulty: "beginner",
    hours: 100,
    category: "Programming"
  },
  {
    name: "System Design",
    description: "Design scalable and distributed systems",
    difficulty: "advanced",
    hours: 150,
    category: "Software Engineering"
  },
  {
    name: "React",
    description: "Build interactive user interfaces with React",
    difficulty: "intermediate",
    hours: 60,
    category: "Frontend"
  }
];

const categories = [
  "All",
  "AI & Data Science",
  "Computer Science", 
  "Development",
  "Programming",
  "Software Engineering",
  "Frontend"
];

export default function TopicsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Learning Topics</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Discover comprehensive learning paths with AI-powered assistance and interactive content.
        </p>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search topics..." 
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Topics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTopics.map((topic, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {topic.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      topic.difficulty === 'beginner' ? 'default' : 
                      topic.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                    }
                  >
                    {topic.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{topic.hours} hours</span>
                    </div>
                    <Badge variant="outline">{topic.category}</Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button asChild className="flex-1">
                      <Link href={`/topic/${encodeURIComponent(topic.name)}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Start Learning
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Why Learn with Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Comprehensive Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access curated resources, interactive quizzes, and structured learning paths.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">AI-Powered Learning</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get personalized assistance and instant answers to your questions with our AI tutor.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Track Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor your learning journey with detailed progress tracking and skill assessments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
