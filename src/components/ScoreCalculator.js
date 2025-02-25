import { useEffect } from "react";

const ScoreCalculator = ({ answers, questions, onScoreCalculated }) => {
  useEffect(() => {
    let correctCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalCorrectAnswers = 0;

    questions.forEach((q) => {
      if (!Array.isArray(q.answer_options) || q.answer_options.length === 0) return;
      if (q.correct_answer_index === null || q.correct_answer_index < 0 || q.correct_answer_index >= q.answer_options.length) return;

      const correctAnswer = q.answer_options[q.correct_answer_index].trim().toLowerCase();
      const selectedAnswer = answers[q.question_id]?.trim().toLowerCase();
      const difficultyLevel = q.difficulty_level || 2; // Mặc định là 2 (Hiểu) nếu không có giá trị

      totalCounts[difficultyLevel]++; // Đếm tổng số câu theo mức độ

      if (selectedAnswer === correctAnswer) {
        correctCounts[difficultyLevel]++; // Đếm số câu đúng theo mức độ
        totalCorrectAnswers++;
      }
    });

    // Tính tổng điểm
    const calculatedScore = questions.length > 0 ? (totalCorrectAnswers / questions.length) * 100 : 0;

    console.log(`🎯 Điểm số tính được: ${calculatedScore.toFixed(2)}`);
    console.log("📊 Chi tiết số câu đúng theo mức độ:", correctCounts);

    // Gửi dữ liệu lên ExamResult
    onScoreCalculated({
      totalScore: calculatedScore,
      correctCounts,
      totalCounts,
      percentages: {
        1: totalCounts[1] ? (correctCounts[1] / totalCounts[1]) * 100 : 0,
        2: totalCounts[2] ? (correctCounts[2] / totalCounts[2]) * 100 : 0,
        3: totalCounts[3] ? (correctCounts[3] / totalCounts[3]) * 100 : 0,
        4: totalCounts[4] ? (correctCounts[4] / totalCounts[4]) * 100 : 0,
      },
    });

  }, [answers, questions, onScoreCalculated]); // ✅ Không còn lỗi ESLint

  return null; // Không cần render giao diện, chỉ cần tính toán và gửi dữ liệu
};

export default ScoreCalculator;
