import React from "react";
import { Container, Card, Button, ListGroup } from "react-bootstrap";

const ExamResult = ({ score, onBackToHome, onReviewAnswers }) => {
  if (!score) return <p>Đang tải kết quả...</p>;

  // Mapping cấp độ câu hỏi với tên
  const levelNames = {
    1: "Biết",
    2: "Hiểu",
    3: "Vận dụng",
    4: "Vận dụng cao",
  };

  return (
    <Container>
      <Card className="p-4 text-center">
        <h3>Kết quả bài thi</h3>
        <h2>{score.totalScore.toFixed(2)} / 100</h2>
        <p>{score.totalScore >= 50 ? "🎉 Bạn đã vượt qua bài thi!" : "❌ Bạn chưa đạt yêu cầu, hãy cố gắng hơn!"}</p>

        <h4>📊 Phân tích kết quả theo cấp độ:</h4>
        <ListGroup>
          {[1, 2, 3, 4].map((level) => (
            <ListGroup.Item key={level}>
              <strong>{levelNames[level]}:</strong> {score.correctCounts[level]} / {score.totalCounts[level]} 
              ({score.percentages[level].toFixed(2)}%)
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="mt-4">
          <Button variant="success" className="m-2" onClick={onReviewAnswers}>
            🔍 Xem lại đáp án
          </Button>
          <Button variant="primary" className="m-2" onClick={onBackToHome}>
            ↩ Quay lại danh sách bài thi
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default ExamResult;
