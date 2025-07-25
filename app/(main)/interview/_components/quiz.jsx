"use client"
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useFetch from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react"
import React from 'react'
import { HashLoader } from "react-spinners";
import { toast } from "sonner";
import QuizResult from "./quiz-result";

export default function Quiz () {

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn : generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn : saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  console.log(resultData);

  useEffect(() => {
    if(quizData){
        setAnswers(new Array(quizData.length).fill(null));
    }
  },  [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext =() => {
    if(currentQuestion< quizData.length-1){
        setCurrentQuestion(currentQuestion + 1);
        setShowExplanation(false);
    }else{
        finishQuiz();
    }
  }
  const calculateScore = () => {
  let correct = 0;
  console.log("--- Starting Score Calculation ---"); // To see the start

  answers.forEach((answer, index) => {
    const userAnswer = String(answer).trim();
    const correctAnswer = String(quizData[index].correctAnswer).trim();

    // This log will show us exactly what is being compared
    console.log(
      `Q${index + 1}: Comparing user answer: "${userAnswer}" | Correct answer: "${correctAnswer}" | Match: ${userAnswer === correctAnswer}`
    );

    if (userAnswer === correctAnswer) {
      correct++;
    }
  });

  const finalScore = (correct / quizData.length) * 100;
  console.log(`--- Final Score: ${finalScore} (${correct}/${quizData.length}) ---`); // To see the result
  
  return finalScore;
};

  const finishQuiz = async () => {
    const score = calculateScore();
    try{
        await saveQuizResultFn(quizData, answers, score)
        toast.success("Quiz submitted successfully");
    }catch(error){
        toast.error(error.message || "Something went wrong");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuizFn();
    setResultData(null);
  };

  if(generatingQuiz){
    return <HashLoader className="mt-4" width={"100%"} color="gray"/>;
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if(!quizData){
    return(
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>Ready to test your knowledge?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Quiz contains 10 questions specific to your industry and skills.
                    Take your time and choose the best answer.
                    Best of luck !
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button className="w-50" onClick={generateQuizFn}>Start Quiz</Button>
            </CardFooter>
        </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
            <CardHeader>
                <CardTitle>Question {currentQuestion + 1} of {quizData.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-lg font-medium">
                    {question.question}
                </p>
                <RadioGroup className="space-y-2"
                    onValueChange={handleAnswer}
                    value={answers[currentQuestion]}
                >
                    {question.options.map((option, index) => {
                        return(
                        <div className="flex items-center space-x-2" key={index}>
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`}>{option}</Label>
                        </div>
                    );
                    })}
                </RadioGroup>
                {showExplanation && 
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-medium">Explanation</p>
                    <p className="text-muted-foreground">{question.explanation}</p>
                </div>}
            </CardContent>
            <CardFooter className="flex justify-between">
                {!showExplanation && (
                <Button
                    onClick={() => setShowExplanation(true)}
                    variant="outline"
                    disabled={!answers[currentQuestion]}
                >
                    Show Explanation
                </Button>
        )}
                <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion] || savingResult}
                    className="ml-auto"
                    >
                    {savingResult && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {currentQuestion < quizData.length - 1
                        ? "Next Question"
                        : "Finish Quiz"}
                </Button>
                
            </CardFooter>
        </Card>
  )
}
