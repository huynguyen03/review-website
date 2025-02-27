import React from "react";
import { Container, Card, ListGroup, Button } from "react-bootstrap";

const ReviewAnswers = ({ questions, answers, onBackToResult }) => {
  console.log("câu hỏi: ", questions, "Đáp án: ",answers);
  return (
    <Container>
      <Card className="p-4">
        <h3 className="text-center">Xem lại đáp án</h3>
        <ListGroup>
          {questions.map((q, index) => {
            const userAnswer = answers[q.question_id] !== undefined ? answers[q.question_id] : "Chưa trả lời";
            const correctAnswer = q.correct_answer_text || "Không có dữ liệu";
            console.log("Đáp án đúng",correctAnswer)

            // Kiểm tra nếu câu trả lời của người dùng đúng hay sai
            const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

            return (
              <ListGroup.Item
                key={q.cloned_question_id}
                className={`mb-2 text-start ${isCorrect ? "text-success" : "text-danger"}`}
              >
                <strong>Câu {index + 1}: {q.question_text}</strong>
                <p><strong>Đáp án của bạn:</strong> {userAnswer}</p>
                <p><strong>Đáp án đúng:</strong> {correctAnswer}</p>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={onBackToResult}>
            Quay lại kết quả bài thi
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default ReviewAnswers;
