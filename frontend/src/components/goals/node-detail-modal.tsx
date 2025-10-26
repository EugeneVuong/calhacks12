"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, BookOpen, HelpCircle, CheckCircle, XCircle } from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: string;
  description?: string;
}

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}

interface NodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    label: string;
    topic?: string;
    resources?: Resource[];
    quiz_questions?: QuizQuestion[];
    related_harder_topics?: string[];
    uuid?: string;
  } | null;
}

export function NodeDetailModal({ isOpen, onClose, nodeData }: NodeDetailModalProps) {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({});
  const [showResults, setShowResults] = React.useState(false);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const getScore = () => {
    if (!nodeData?.quiz_questions) return 0;
    let correct = 0;
    nodeData.quiz_questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const getScorePercentage = () => {
    if (!nodeData?.quiz_questions) return 0;
    return Math.round((getScore() / nodeData.quiz_questions.length) * 100);
  };

  if (!nodeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{nodeData.label}</DialogTitle>
          <DialogDescription>
            Explore resources and test your knowledge on this topic
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quiz ({nodeData.quiz_questions?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learning Resources</h3>
              {nodeData.resources && nodeData.resources.length > 0 ? (
                <div className="grid gap-4">
                  {nodeData.resources.map((resource, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {resource.description || "Click to explore this resource"}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {resource.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(resource.url, '_blank')}
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Resource
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No resources available for this topic yet.</p>
                </div>
              )}

              {nodeData.related_harder_topics && nodeData.related_harder_topics.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-3">Related Advanced Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {nodeData.related_harder_topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            {nodeData.quiz_questions && nodeData.quiz_questions.length > 0 ? (
              <div className="space-y-6">
                {!showResults ? (
                  <>
                    {nodeData.quiz_questions.map((question, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Question {index + 1}
                          </CardTitle>
                          <CardDescription>{question.question}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(question.options).map(([key, value]) => (
                            <label
                              key={key}
                              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedAnswers[index] === key
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={key}
                                checked={selectedAnswers[index] === key}
                                onChange={() => handleAnswerSelect(index, key)}
                                className="sr-only"
                              />
                              <span className="font-medium w-6 text-center">{key}.</span>
                              <span className="flex-1">{value}</span>
                            </label>
                          ))}
                        </CardContent>
                      </Card>
                    ))}

                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        {Object.keys(selectedAnswers).length} of {nodeData.quiz_questions.length} questions answered
                      </p>
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length !== nodeData.quiz_questions.length}
                        className="px-6"
                      >
                        Submit Quiz
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <Card className="bg-muted/50">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Quiz Results</CardTitle>
                        <CardDescription>
                          You scored {getScore()} out of {nodeData.quiz_questions.length} ({getScorePercentage()}%)
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {nodeData.quiz_questions.map((question, index) => {
                      const userAnswer = selectedAnswers[index];
                      const isCorrect = userAnswer === question.correct_answer;
                      
                      return (
                        <Card key={index} className={isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                            </div>
                            <CardDescription>{question.question}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              {Object.entries(question.options).map(([key, value]) => (
                                <div
                                  key={key}
                                  className={`p-3 rounded-lg border ${
                                    key === question.correct_answer
                                      ? 'border-green-300 bg-green-100'
                                      : key === userAnswer && !isCorrect
                                      ? 'border-red-300 bg-red-100'
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <span className="font-medium">{key}.</span> {value}
                                  {key === question.correct_answer && (
                                    <Badge className="ml-2" variant="default">Correct</Badge>
                                  )}
                                  {key === userAnswer && !isCorrect && (
                                    <Badge className="ml-2" variant="destructive">Your Answer</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Explanation:</p>
                              <p className="text-sm">{question.explanation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <div className="flex justify-center pt-4">
                      <Button onClick={resetQuiz} variant="outline">
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quiz questions available for this topic yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
