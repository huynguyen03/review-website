import React from "react";
import { Container, Card, Button } from "react-bootstrap";

const ExamResult = ({ score, analysis, onBackToHome, onReviewAnswers }) => {
  const defaultStats = { correct: 0, total: 0 };
  const easyStats = analysis?.easy ?? defaultStats;
  const mediumStats = analysis?.medium ?? defaultStats;
  const hardStats = analysis?.hard ?? defaultStats;

  return (
    <Container>
      <Card className="p-4 text-center">
        <h3>Kết quả bài thi</h3>
        <h2>{score !== null ? score.toFixed(2) : 0} / 100</h2>
        <p>{score >= 50 ? "Bạn đã vượt qua bài thi!" : "Bạn chưa đạt yêu cầu, hãy cố gắng hơn!"}</p>

        <h4>Phân tích theo mức độ khó:</h4>
        <p><strong>Dễ:</strong> {easyStats.correct}/{easyStats.total} đúng</p>
        <p><strong>Trung bình:</strong> {mediumStats.correct}/{mediumStats.total} đúng</p>
        <p><strong>Khó:</strong> {hardStats.correct}/{hardStats.total} đúng</p>

        <Button variant="success" className="m-2" onClick={onReviewAnswers}>
          Xem lại đáp án
        </Button>
        <Button variant="primary" className="m-2" onClick={onBackToHome}>
          Quay lại danh sách bài thi
        </Button>
      </Card>
    </Container>
  );
};

export default ExamResult;
