import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Card, ListGroup, Row, Col } from "react-bootstrap";
import ScoreCalculator from "./ScoreCalculator";
import ReviewAnswers from "./ReviewAnswers";
import ExamResult from "./ExamResult";

const RealExam = ({ exam, studentId, onBack }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.time_limit * 60);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResultPage, setShowResultPage] = useState(false);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 4;

  // Fetch danh sách câu hỏi
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost/react_api/fetch_exam_questions.php?exam_id=${exam.exam_id}`);
      if (!response.ok) throw new Error(`Lỗi tải câu hỏi: ${response.status}`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi:", error);
    }
  }, [exam.exam_id]);

  useEffect(() => {
    if (isStarted) fetchQuestions();
  }, [isStarted, fetchQuestions]);

  // Nhận điểm số từ ScoreCalculator
  const handleScoreCalculated = async (score) => {
    console.log(`🏆 Điểm số nhận được: ${score}`);
    setFinalScore(score);
    await sendExamResult(score); // Gửi điểm lên API sau khi tính xong
  };

  // Gửi điểm lên API
  const sendExamResult = async (score) => {
    try {
      const response = await fetch("http://localhost/react_api/submit_exam_result.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: exam.exam_id,
          student_id: studentId,
          score: score,
          answers: answers, // Lưu đáp án đã chọn
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Lỗi khi lưu điểm:", result.message);
      } else {
        console.log("✅ Điểm đã lưu thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi kết quả bài thi:", error);
    }
  };

  // Nộp bài
  const handleFinalSubmit = () => {
    setIsStarted(false);
    setShowResultPage(true);
    setIsSubmitted(true);
  };

  // Chuyển sang màn hình xem lại câu trả lời
  const handleReviewAnswers = () => {
    setShowReviewPage(true);
  };

  // Quay lại màn hình kết quả
  const handleBackToResult = () => {
    setShowReviewPage(false);
  };

  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  // Ghi lại câu trả lời của học sinh
  const handleAnswerChange = (questionId, selectedOption) => {
    if (!isSubmitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    }
  };

  const currentQuestions = questions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

  return (
    <Container fluid>
      {showReviewPage ? (
        <ReviewAnswers
          questions={questions}
          answers={answers}
          onBackToResult={handleBackToResult}
        />
      ) : showResultPage ? (
        <>
          <ExamResult
            score={finalScore}
            onBackToHome={onBack}
            onReviewAnswers={handleReviewAnswers}
          />
          {/* Gọi ScoreCalculator để tính điểm sau khi nộp bài */}
          <ScoreCalculator
            answers={answers}
            questions={questions}
            examId={exam.exam_id}
            studentId={studentId}
            userRole="student"
            onScoreCalculated={handleScoreCalculated}
          />
        </>
      ) : (
        <Row>
          <Col md={9}>
            {!isStarted ? (
              <Card className="p-4">
                <h3>{exam.exam_name}</h3>
                <p><strong>Thời gian:</strong> {exam.time_limit} phút</p>
                <Button variant="secondary" onClick={onBack}>Quay lại</Button>{" "}
                <Button variant="primary" onClick={() => setIsStarted(true)}>Bắt đầu</Button>
              </Card>
            ) : (
              <Card className="p-4">
                <ListGroup>
                  {currentQuestions.map((q, index) => (
                    <ListGroup.Item key={q.question_id} className="mb-3 text-start">
                      <strong>Câu {index + 1}: {q.question_text}</strong>
                      <div className="mt-2 d-flex flex-column">
                        {q.answer_options?.map((option, optionIndex) => (
                          <Button
                            key={`${q.question_id}-${optionIndex}`}
                            variant={answers[q.question_id] === option ? "success" : "outline-primary"}
                            className="mb-2 text-start"
                            style={{ width: "auto", maxWidth: "300px" }}
                            onClick={() => handleAnswerChange(q.question_id, option)}
                            disabled={isSubmitted}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="pagination-controls mt-3 d-flex justify-content-between align-items-center">
                  <Button variant="secondary" onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1}>
                    Trang trước
                  </Button>
                  <span>Trang {currentPage}</span>
                  <Button variant="secondary" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage * QUESTIONS_PER_PAGE >= questions.length}>
                    Trang tiếp theo
                  </Button>
                </div>
              </Card>
            )}
          </Col>

          {isStarted && (
            <Col md={3}>
              <Card className="p-3 text-center">
                <h5><strong>{exam.exam_name}</strong></h5>
                <p>Thời gian còn lại:</p>
                <h2>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</h2>
                <Button className="mt-5" variant="danger" onClick={handleFinalSubmit}>Nộp bài</Button>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default RealExam;
