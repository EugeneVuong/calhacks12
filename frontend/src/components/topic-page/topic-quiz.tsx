"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";

interface QuizQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

interface TopicQuizProps {
  questions: QuizQuestion[];
  topic: string;
}

interface QuizState {
  currentQuestion: number;
  answers: { [key: number]: string };
  showResults: boolean;
  score: number;
}

export function TopicQuiz({ questions, topic }: TopicQuizProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showResults: false,
    score: 0,
  });

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>
            No quiz questions available for this topic yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestion]: answer
      }
    }));
  };

  const handleNext = () => {
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      // Calculate score
      let score = 0;
      questions.forEach((question, index) => {
        if (quizState.answers[index] === question.correct_answer) {
          score++;
        }
      });
      
      setQuizState(prev => ({
        ...prev,
        showResults: true,
        score: score
      }));
    }
  };

  const handlePrevious = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
    }
  };

  const handleRestart = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      showResults: false,
      score: 0,
    });
  };

  const currentQuestion = questions[quizState.currentQuestion];
  const selectedAnswer = quizState.answers[quizState.currentQuestion];
  const isLastQuestion = quizState.currentQuestion === questions.length - 1;

  if (quizState.showResults) {
    const percentage = Math.round((quizState.score / questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {isPassing ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isPassing ? "Congratulations!" : "Keep Learning!"}
            </CardTitle>
            <CardDescription>
              You scored {quizState.score} out of {questions.length} ({percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Badge variant={isPassing ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {isPassing ? "Passed" : "Needs Improvement"}
                </Badge>
              </div>
              <Button onClick={handleRestart} variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review Questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Your Answers</h3>
          {questions.map((question, index) => {
            const userAnswer = quizState.answers[index];
            const isCorrect = userAnswer === question.correct_answer;
            
            return (
              <Card key={index} className={isCorrect ? "border-green-200" : "border-red-200"}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <CardTitle className="text-base">{question.question}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = question[`option_${option.toLowerCase()}` as keyof QuizQuestion] as string;
                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = question.correct_answer === option;
                        
                        return (
                          <div
                            key={option}
                            className={`p-2 rounded border ${
                              isCorrectAnswer 
                                ? 'bg-green-100 border-green-300' 
                                : isUserAnswer && !isCorrectAnswer
                                ? 'bg-red-100 border-red-300'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="font-medium">{option}.</span> {optionText}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800">Explanation:</p>
                      <p className="text-sm text-blue-700">{question.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Quiz: {topic}</h2>
        <p className="text-muted-foreground">
          Test your knowledge with these interactive questions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Question {quizState.currentQuestion + 1} of {questions.length}</CardTitle>
            <Badge variant="outline">
              {Math.round(((quizState.currentQuestion + 1) / questions.length) * 100)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
            
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {[
                { value: 'A', text: currentQuestion.option_a },
                { value: 'B', text: currentQuestion.option_b },
                { value: 'C', text: currentQuestion.option_c },
                { value: 'D', text: currentQuestion.option_d },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{option.value}.</span> {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={quizState.currentQuestion === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
