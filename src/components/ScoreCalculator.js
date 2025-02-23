import React, { useEffect, useState } from "react";
import ExamResult from "./ExamResult";

const ScoreCalculator = ({ answers, questions, onScoreCalculated }) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let correctAnswers = 0;

    questions.forEach((q) => {
      if (!Array.isArray(q.answer_options) || q.answer_options.length === 0) return;
      if (q.correct_answer_index === null || q.correct_answer_index < 0 || q.correct_answer_index >= q.answer_options.length) return;

      const correctAnswer = q.answer_options[q.correct_answer_index].trim().toLowerCase();
      if (answers[q.question_id]?.trim().toLowerCase() === correctAnswer) {
        correctAnswers++;
      }
    });

    // Tính điểm
    const calculatedScore = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    console.log(`🎯 Điểm số tính được: ${calculatedScore.toFixed(2)}`);

    setScore(calculatedScore);
    onScoreCalculated(calculatedScore);
  }, [answers, questions, onScoreCalculated]);

  // return <ExamResult score={score} />;
};

export default ScoreCalculator;
