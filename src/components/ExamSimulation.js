import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Button, Card, ListGroup, Row, Col } from "react-bootstrap";
import ScoreCalculator from "./ScoreCalculator";
import ReviewAnswers from "./ReviewAnswers";
import ExamResult from "./ExamResult"; // Thêm để hiển thị kết quả bài thi

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faServer } from '@fortawesome/free-solid-svg-icons'; // Import icon

const ExamSimulation = ({ exam, userRole, onBack, userId, examid }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.time_limit * 60);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResultPage, setShowResultPage] = useState(false);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [finalScore, setFinalScore] = useState(null); // Được sử dụng trong ScoreCalculator
  const [currentPage, setCurrentPage] = useState(1); // Trạng thái cho trang hiện tại
  const QUESTIONS_PER_PAGE = 2;  // Giới hạn số câu hỏi mỗi trang
  const [analysis, setAnalysis] = useState(null); // 🔹 Thêm state để lưu analysis từ ScoreCalculator
  const [isRandomExam, setIsRandomExam] = useState(false) // Trạng thái bài thi câu hỏi ngẫu nhiên
  const [isScoreCalculated, setIsScoreCalculated] = useState(false); // 🔹 Thêm state kiểm soát tính điểm
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResultSent, setIsResultSent] = useState(false);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const nameRole = userRole === "1" ? "teacher" : "users";

  const navigate = useNavigate();
  useEffect(() => {
    const storedIsRandomExam = localStorage.getItem('isRandomExam');
    if (storedIsRandomExam !== null && storedIsRandomExam !== isRandomExam) {
      setIsRandomExam(storedIsRandomExam); // Cập nhật trạng thái nếu giá trị khác nhau
    }
  }, []);


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
  }, [exam.exam_id]);

  // Hàm tải câu hỏi của bài thi (dùng cho cả bài thi thông thường và ngẫu nhiên)
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/fetch_exam_questions.php?exam_id=${exam.exam_id}`);

      if (!response.ok) {
        throw new Error(`Lỗi tải câu hỏi: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data);
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



  // useEffect(() => {
  //   checkExamType();
  // }, [checkExamType]); // Chạy một lần duy nhất khi component mount


  useEffect(() => {
    const savedAnswers = JSON.parse(localStorage.getItem('answers'));
    const savedStartTime = localStorage.getItem('startTime'); // Lưu thời gian bắt đầu
    const savedEndTime = localStorage.getItem('endTime'); // Lưu thời gian kết thúc (thời gian hết hạn)
    const savedIsStarted = JSON.parse(localStorage.getItem('isStarted'));

    if (savedAnswers) {
      setAnswers(savedAnswers);
    }
    if (savedStartTime && savedEndTime) {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = savedEndTime - currentTime; // ms

      setTimeLeft(remainingTime > 0 ? remainingTime : 0);
      setIsStarted(true); // đảm bảo đồng hồ chạy lại sau reload
    }
    if (savedIsStarted !== null) {
      setIsStarted(savedIsStarted);
    }
  }, []);
  // Khi bài thi bắt đầu, lấy câu hỏi phù hợp
  useEffect(() => {
    const checkAndFetchQuestions = async () => {
      try {
        await checkExamType(); // Đảm bảo kiểu bài thi đã được kiểm tra trước
  
        // Chỉ thực hiện tải câu hỏi khi kiểu bài thi đã được xác định
        if (isStarted) {
          const hasFetchedRandom = localStorage.getItem("randomFetched") === "true";
          if (isRandomExam && !hasFetchedRandom) {
            console.log("lấy câu hỏi ngẫu nhiên", hasFetchedRandom);
            await fetchRandomQuestions(); // Nếu bài thi lấy câu hỏi ngẫu nhiên, gọi API lấy câu hỏi từ ngân hàng
            localStorage.setItem('randomFetched', true); // ✅ Đánh dấu đã gọi API random
          } else {
            await fetchQuestions(); // Nếu bài thi bình thường, gọi API lấy câu hỏi như cũ
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra kiểu bài thi hoặc tải câu hỏi:", error);
      }
    };

    checkAndFetchQuestions();
  }, [checkExamType, isStarted, isRandomExam, fetchQuestions, fetchRandomQuestions]);


  const deleteClonedQuestions = async (examId) => {
    console.log("Kiểm tra random xóa", isRandomExam)
    const storedIsRandomExam = (localStorage.getItem('isRandomExam'));
    console.log("Kiểm tra random trước khi xóa local", storedIsRandomExam);
    if (!storedIsRandomExam) {
      console.log("isRandom is false, not proceeding with deletion.");
      return; // Nếu isRandom là false, thoát hàm
    }

    try {
      const response = await fetch(`${apiUrl}/delete_cloned_questions.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_id: examId }),
      });

      const data = await response.json();
      console.log("Kết quả xóa cloned questions:", data);
    } catch (error) {
      console.error("Lỗi khi xóa cloned questions:", error);
    }
  };
  // Hàm nhận điểm số & phân tích từ ScoreCalculator
  const handleScoreCalculated = (score, analysisData) => {
    console.log("📊 Điểm số cuối cùng:", score);
    console.log("📊 Phân tích bài thi:", analysisData);
    setFinalScore(score);
    setAnalysis(analysisData); // 🔹 Lưu phân tích vào state để truyền vào ExamResult
    setIsScoreCalculated(true); // 🔹 Đánh dấu rằng điểm đã được tính
  };
  const sendExamResult = useCallback(async (scoreDetails) => {
    if (isResultSent || !scoreDetails) return;
    try {
      const response = await fetch(`${apiUrl}/submit_exam_result.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: exam.exam_id,
          student_id: userId,
          score: scoreDetails.totalScore,
          correct_counts: scoreDetails.correctCounts,
          total_counts: scoreDetails.totalCounts,
          percentages: scoreDetails.percentages,
          answers: answers,
        }),
      });
      console.log("gửi điểm đi", exam.exam_id,
        userId,
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
  }, [isResultSent, exam.exam_id, userId, answers]); // ✅ Đã sửa


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
    



    deleteClonedQuestions(exam.exam_id);
    // Xóa thông tin bài thi từ localStorage
    localStorage.removeItem('startTime');
    localStorage.removeItem('endTime');
    localStorage.removeItem('timeLeft');
    localStorage.removeItem('isStarted');
    localStorage.removeItem('answers');
    localStorage.removeItem('randomFetched');
    localStorage.removeItem("currentExam");
    localStorage.removeItem("isRandomExam");


    setIsStarted(false);
    setIsSubmitted(true);
    setShowResultPage(true);

  }, [isSubmitted]); // ✅ Đã sửa

  const handleReviewAnswers = () => {
    setShowReviewPage(true);
  };


  // Cập nhật thời gian còn lại mỗi giây và xử lý sự kiện visibilitychange
  useEffect(() => {
    let timer;


    if (isStarted && timeLeft > 0) {
      // Khi bài thi bắt đầu, cập nhật thời gian mỗi giây
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const updatedTime = prevTime - 1;
          // Lưu thời gian vào localStorage
          localStorage.setItem('timeLeft', updatedTime);
          return updatedTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleFinalSubmit(); // Khi hết thời gian, nộp bài
    }
    // Dọn dẹp interval khi component unmount hoặc khi tab bị ẩn
    return () => {
      clearInterval(timer);

    };
  }, [isStarted, timeLeft]);


  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => {
      const updatedAnswers = { ...prev, [questionId]: answer };
      localStorage.setItem('answers', JSON.stringify(updatedAnswers));
      return updatedAnswers;
    });
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
  // Khởi động bài thi
  const handleStart = async () => {
    await checkExamType();
    console.log("trước khi bắt đầu làm bài ", isRandomExam)

    setIsStarted(true);
    const startTime = Math.floor(Date.now() / 1000); // Thời gian bắt đầu bài thi
    const endTime = startTime + exam.time_limit * 60; // Thời gian kết thúc (hết hạn)
    console.log("thời gian bắt đầu: ", startTime)
    console.log("thời gian kết thúc: ", endTime)


    // Lưu thời gian bắt đầu và kết thúc vào localStorage
    localStorage.setItem('isRandomExam', isRandomExam);

    localStorage.setItem('currentExam', JSON.stringify(exam));

    localStorage.setItem('startTime', startTime);
    localStorage.setItem('endTime', endTime);
    localStorage.setItem('isStarted', true);

  };

  const hanldeOnBackHome = () => {
    navigate(`/${nameRole}?section=home`);
  }

  // Hàm định dạng thời gian (m:ss)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
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
          onBackToHome={() => hanldeOnBackHome()}
          onReviewAnswers={handleReviewAnswers}
        />
      ) : (
        <Row>
          <Col md={9}>
            {!isStarted ? (
              <Card className="p-4">
                <h4 className="d-flex mb-3 justify-content-center">{exam.exam_name}</h4>
                {/* Thời gian */}
                <Row className="align-items-center mb-2">
                  <Col xs="auto">
                    <FontAwesomeIcon icon={faClock} style={{ fontSize: "24px" }} /> {/* Tăng kích thước icon */}
                  </Col>
                  <Col className="align-items-center">
                    <p style={{ fontSize: "18px", marginLeft: "8px", margin: 0 }}>
                      <strong>Thời gian:</strong> {exam.time_limit} phút
                    </p>
                  </Col>
                </Row>

                {/* Số câu hỏi */}
                <Row className="align-items-center mb-2">
                  <Col xs="auto">
                    <FontAwesomeIcon icon={faServer} style={{ fontSize: "24px" }} /> {/* Tăng kích thước icon */}
                  </Col>
                  <Col>
                    <p style={{ fontSize: "18px", marginLeft: "8px", margin: 0 }}>
                      <strong>Số câu hỏi:</strong> {exam.total_questions}
                    </p>
                  </Col>
                </Row>

                <Row className="mt-4">
                  {/* Cột Quay lại */}
                  <Col className="d-flex justify-content-start">
                    <Button variant="secondary" onClick={onBack}>Quay lại</Button>
                  </Col>

                  {/* Cột Bắt đầu */}
                  <Col className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleStart}>Bắt đầu</Button>
                  </Col>
                </Row>
              </Card>
            ) : (
              <Card className="p-4">
                <ListGroup>
                  {currentQuestions.map((q, index) => (
                    <ListGroup.Item key={q.question_id} className="mb-3 text-start">
                      <strong>Câu {(currentPage - 1) * QUESTIONS_PER_PAGE  + index + 1 }: {q.question_text}</strong>

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
              <Card className="p-3 text-left"> {/* Căn trái thông tin */}
                <h5><strong>{exam.exam_name}</strong></h5>
                <p>Thời gian còn lại:</p>
                <h2>{formatTime(timeLeft)}</h2>

                <div className="mt-3 d-flex flex-wrap justify-content-start"> {/* Căn trái các ô */}
                  {questions.map((q, index) => (
                    <div key={q.question_id} className="m-1">
                      <Button
                        variant={answers[q.question_id] ? "success" : "outline-primary"}
                        style={{
                          width: "28px",  // Giảm kích thước ô
                          height: "28px", // Giảm kích thước ô
                          borderRads: "10%", // Bo góc nhẹ
                          fontSize: "12px", // Giảm kích thước chữ bên trong
                          padding: "0", // Loại bỏ khoảng cách thêm
                        }}
                      >
                        {index + 1}
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-5"
                  variant="danger"
                  onClick={() => {
                    handleFinalSubmit();
                    
                  }}
                >
                  Nộp bài
                </Button>
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
          userId={localStorage.getItem("user_id")}
          userRole={userRole}
          onScoreCalculated={handleScoreCalculated}
        />
      )}
    </Container>
  );
};

export default ExamSimulation;
