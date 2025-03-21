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
  const [isResultSent, setIsResultSent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const QUESTIONS_PER_PAGE = 2;  // Giới hạn số câu hỏi mỗi trang


  const [isScoreCalculated, setIsScoreCalculated] = useState(false); // 🔹 Thêm state kiểm soát tính điểm
  const [analysis, setAnalysis] = useState(null); // 🔹 Thêm state để lưu analysis từ ScoreCalculator
  const [isRandomExam, setIsRandomExam] = useState(false); // Trạng thái bài thi câu hỏi ngẫu nhiên


  const apiUrl = process.env.REACT_APP_API_BASE_URL;

 
// Hàm kiểm tra xem bài thi có lấy câu hỏi ngẫu nhiên không
const checkExamType = useCallback(async () => {
  try {
    const response = await fetch(`${apiUrl}/check_exam_type.php?exam_id=${exam.exam_id}`);
    
    if (!response.ok) {
      throw new Error(`Lỗi kiểm tra kiểu bài thi: ${response.status}`);
    }

    const data = await response.json();
    setIsRandomExam(data.is_random_question); // Giả sử API trả về { is_random: true/false }
    console.log('bài thì có random không: ', data.is_random_question)

  } catch (error) {
    console.error("Lỗi khi kiểm tra kiểu bài thi:", error);
  }

  // Hàm tải câu hỏi của bài thi (dùng cho cả bài thi thông thường và ngẫu nhiên)
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/fetch_exam_questions.php?exam_id=${exam.exam_id}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi tải câu hỏi: ${response.status}`);
      }
  
      const data = await response.json();
      setQuestions(data);
      console.log("Câu hỏi nhận về:", data);
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi:", error);
    }
  }, [exam.exam_id]);
// Hàm lấy câu hỏi ngẫu nhiên nếu bài thi có lấy câu hỏi từ ngân hàng
const fetchRandomQuestions = useCallback(async () => {
  try {
    const response = await fetch(`${apiUrl}/fetch_random_questions.php?exam_id=${exam.exam_id}`);
    
    if (!response.ok) {
      throw new Error(`Lỗi khi lấy câu hỏi ngẫu nhiên: ${response.status}`);
    }


    fetchQuestions();
  } catch (error) {
    console.error("Lỗi khi lấy và lưu câu hỏi ngẫu nhiên:", error);
  }
}, [exam.exam_id, fetchQuestions]);


  // Nhận điểm số từ ScoreCalculator (chỉ gọi khi nộp bài)
  const handleScoreCalculated = (scoreDetails) => {
    if (finalScore) return; // Nếu đã có điểm rồi, không cần gọi lại
    console.log("📊 Điểm số cuối cùng:", scoreDetails);
    setFinalScore(scoreDetails);
  };

  const sendExamResult = useCallback(async (scoreDetails) => { 
    if (isResultSent || !scoreDetails) return;
    try {
      const response = await fetch(`${apiUrl}/submit_exam_result.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: exam.exam_id,
          student_id: studentId,
          score: scoreDetails.totalScore,
          correct_counts: scoreDetails.correctCounts,
          total_counts: scoreDetails.totalCounts,
          percentages: scoreDetails.percentages,
          answers: answers,
        }),
      });
      console.log("gửi điểm đi", exam.exam_id,
         studentId,
        scoreDetails.totalScore,
         scoreDetails.correctCounts,
        scoreDetails.totalCounts,
         scoreDetails.percentages,
         answers,)

  
      const textResponse = await response.text();
      try {
        const result = JSON.parse(textResponse);
        if (result.success) {
          console.log("✅ Điểm đã lưu thành công!");
          setIsResultSent(true);
        } else {
          console.error("❌ Lỗi khi lưu điểm:", result.message);
        }
      } catch (jsonError) {
        console.error("🚨 API không trả về JSON hợp lệ! Phản hồi từ server:", textResponse);
      }
    } catch (error) {
      console.error("🚨 Lỗi khi gửi kết quả bài thi:", error);
    }
  }, [isResultSent, exam.exam_id, studentId, answers]); // ✅ Đã sửa
  
  // Gửi điểm lên API một lần duy nhất
  useEffect(() => {
    if (finalScore && !isResultSent) {
      sendExamResult(finalScore);
    }
  }, [finalScore, isResultSent, sendExamResult]);

  // Xử lý khi nộp bài
  const handleFinalSubmit = useCallback(() => { 
    if (isSubmitted) return;
    console.log("🔴 Nộp bài thi!");
    setIsStarted(false);
    setIsSubmitted(true);
    setShowResultPage(true);
  }, [isSubmitted]); // ✅ Đã sửa
  

// Tự động nộp bài khi hết giờ
useEffect(() => {
  if (!isStarted || isSubmitted) return;
  let timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        handleFinalSubmit();
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [isStarted, isSubmitted, handleFinalSubmit]); // ✅ Đã sửa



  // Ghi lại câu trả lời của học sinh
  const handleAnswerChange = (questionId, selectedOption) => {
    if (!isSubmitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    }
  };

  // Chuyển sang màn hình xem lại câu trả lời
  const handleReviewAnswers = () => setShowReviewPage(true);
  const handleBackToResult = () => setShowReviewPage(false);

  // Lọc danh sách câu hỏi theo trang
  const currentQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  useEffect(() => {
    checkExamType();
  }, [checkExamType]); // Chạy một lần duy nhất khi component mount
  
  // Khi bài thi bắt đầu, lấy câu hỏi phù hợp
  useEffect(() => {
  
    if (isStarted) {
  
      if (isRandomExam) {
        fetchRandomQuestions(); // Nếu bài thi lấy câu hỏi ngẫu nhiên, gọi API lấy câu hỏi từ ngân hàng
      } else {
        fetchQuestions(); // Nếu bài thi bình thường, gọi API lấy câu hỏi như cũ
      }
    }
  }, [checkExamType, isStarted, isRandomExam, fetchQuestions, fetchRandomQuestions]);
}, [exam.exam_id]);

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
              <Button
                className="mt-5"
                variant="danger"
                onClick={() => {
                  handleFinalSubmit();
                  deleteClonedQuestions(exam.exam_id);
                }}
              >Nộp bài</Button>
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

export default RealExam;
