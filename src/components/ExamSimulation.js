import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Card, ListGroup, Row, Col } from "react-bootstrap";
import ScoreCalculator from "./ScoreCalculator";
import ReviewAnswers from "./ReviewAnswers";
import ExamResult from "./ExamResult"; // Thêm để hiển thị kết quả bài thi

const ExamSimulation = ({ exam, userRole, onBack }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.time_limit * 60);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResultPage, setShowResultPage] = useState(false);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [finalScore, setFinalScore] = useState(null); // Được sử dụng trong ScoreCalculator
  const [analysis, setAnalysis] = useState(null); // 🔹 Thêm state để lưu analysis từ ScoreCalculator
  const [isScoreCalculated, setIsScoreCalculated] = useState(false); // 🔹 Thêm state kiểm soát tính điểm
  const [currentPage, setCurrentPage] = useState(1); // Trạng thái cho trang hiện tại
  const QUESTIONS_PER_PAGE = 4;  // Giới hạn số câu hỏi mỗi trang

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost/react_api/fetch_exam_questions.php?exam_id=${exam.exam_id}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi tải câu hỏi: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data);
      console.log("câu hỏi nhận về khi gọi lấy câu hỏi bài thi: ", data)
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi:", error);
    }
  }, [exam.exam_id]);

  useEffect(() => {
    if (isStarted) {
      fetchQuestions();
    }
  }, [isStarted, fetchQuestions]);

  // Hàm nhận điểm số & phân tích từ ScoreCalculator
  const handleScoreCalculated = (score, analysisData) => {
    console.log("📊 Điểm số cuối cùng:", score);
    console.log("📊 Phân tích bài thi:", analysisData);
    setFinalScore(score);
    setAnalysis(analysisData); // 🔹 Lưu phân tích vào state để truyền vào ExamResult
    setIsScoreCalculated(true); // 🔹 Đánh dấu rằng điểm đã được tính
  };

  // Định nghĩa `handleFinalSubmit` trước khi gọi trong `useEffect`
  const handleFinalSubmit = useCallback(async () => {
    setIsStarted(false);
    setShowResultPage(true);
    setIsScoreCalculated(false); // 🔹 Reset để tính điểm mới
    if (userRole === "student") {
      try {
        const response = await fetch("http://localhost/react_api/submit_exam_result.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam_id: exam.exam_id,
            student_id: localStorage.getItem("user_id"),
            answers,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          alert("Lỗi khi lưu kết quả: " + result.message);
        }
      } catch (error) {
        console.error("Lỗi khi gửi kết quả bài thi:", error);
      }
    }
  }, [exam.exam_id, userRole, answers]);

  const handleReviewAnswers = () => {
    setShowReviewPage(true);
  };

  // Quay lại trang kết quả bài thi
  // const handleBackToResult = () => {
  //   setShowReviewPage(false);
  // };

  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, handleFinalSubmit]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextPage = () => {
    if (currentPage * QUESTIONS_PER_PAGE < questions.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const currentQuestions = questions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

  return (
    <Container fluid>
      {showReviewPage ? (
        <ReviewAnswers
          questions={questions}
          answers={answers}
          onBackToResult={() => setShowReviewPage(false)}
        />
      ) : showResultPage ? (
        <ExamResult
          score={finalScore}
          analysis={analysis}
          onBackToHome={onBack}
          onReviewAnswers={handleReviewAnswers}
        />
      ) : (
        <Row>
          <Col md={9}>
            {!isStarted ? (
              <Card className="p-4 ">
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
        {q.question_type === "multiple_choice" ? (
          q.answer_options?.map((option, optionIndex) => (
            <Button
              key={`${q.question_id}-${optionIndex}`}
              variant={answers[q.question_id] === option ? "success" : "outline-primary"}
              className="mb-2 text-start"
              style={{ width: "auto", maxWidth: "300px" }}
              onClick={() => handleAnswerChange(q.question_id, option)}
            >
              {option}
            </Button>
          ))
        ) : (
          <div className="mt-2">
            <label htmlFor={`answer-${q.question_id}`} className="form-label">Đáp án của bạn là:</label>
            <input
              type="text"
              id={`answer-${q.question_id}`}
              className="form-control"
              value={answers[q.question_id] || ""}
              onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              style={{ maxWidth: "300px" }}
            />
          </div>
        )}
      </div>
    </ListGroup.Item>
  ))}
</ListGroup>

                <div className="pagination-controls mt-3 d-flex justify-content-between align-items-center">
                  <Button
                    variant="secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Trang trước
                  </Button>
                  <div className="d-flex align-items-center">
                    <span>Trang {currentPage}</span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleNextPage}
                    disabled={currentPage * QUESTIONS_PER_PAGE >= questions.length}
                  >
                    Trang tiếp theo
                  </Button>
                </div>
              </Card>
            )}
          </Col>

          {/* Sidebar chỉ hiển thị khi đang làm bài */}
          {isStarted && (
            <Col md={3}>
              <Card className="p-3 text-center">
                <h5><strong>{exam.exam_name}</strong></h5>
                <p>Thời gian còn lại:</p>
                <h2>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</h2>

                <div className="mt-3 d-flex flex-wrap justify-content-center">
                  {questions.map((q, index) => (
                    <Button
                      key={q.question_id}
                      variant={answers[q.question_id] ? "success" : "outline-primary"}
                      className="m-1"
                      style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <Button className="mt-5" variant="danger" onClick={handleFinalSubmit}>Nộp bài</Button>
              </Card>
            </Col>
          )}
        </Row>
      )}
      {showResultPage && !isScoreCalculated && (
        <ScoreCalculator
          answers={answers}
          questions={questions}
          examId={exam.exam_id}
          studentId={localStorage.getItem("user_id")}
          userRole={userRole}
          onScoreCalculated={handleScoreCalculated}
        />
      )}
    </Container>
  );
};

export default ExamSimulation;
