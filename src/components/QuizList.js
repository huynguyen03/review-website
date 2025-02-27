import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import ExamSimulation from "./ExamSimulation";
import QuizSettings from "./QuizSettings"; 
import CreateQuiz from "./CreateQuiz"; 

const QuizList = ({ userRole }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null); // 🔹 Lưu bài thi được chọn
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const section = queryParams.get("section");
  const action = queryParams.get("action");

  useEffect(() => {
    if (section === "my_quiz") {
      fetchQuizzes();
    }
  }, [section]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("http://localhost/react_api/get_quizzes.php");
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài thi:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🛑 Hàm chọn bài thi khi click "Thi thử"
  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    navigate(`/teacher?section=my_quiz&action=exam&id=${exam.exam_id}`);
  };

  // 🛑 Hàm xóa bài thi
  const handleDeleteQuiz = async (exam_id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài thi này không?")) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost/react_api/delete_quiz.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exam_id }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Bài thi đã được xóa thành công!");
        fetchQuizzes(); 
      } else {
        alert("Lỗi khi xóa bài thi: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa bài thi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        {/* Nội dung chính */}
        <Col md={9}>
          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : action === "create_quiz" ? (
            <CreateQuiz 
            teacherId={localStorage.getItem("user_id")} 
            onQuizCreated={fetchQuizzes} 
            onBack={() => navigate("/teacher?section=my_quiz")} 
            />
          ) : action === "exam" ? (
            selectedExam ? ( // 🔹 Chỉ render khi đã chọn bài thi
              <ExamSimulation exam={selectedExam} userRole={userRole} onBack={() => navigate("/teacher?section=my_quiz")} />
            ) : (
              <Alert variant="danger" className="mt-5">
                <p>Bài thi không tồn tại hoặc chưa được chọn.</p>
                <Button variant="secondary" onClick={() => navigate("/teacher?section=my_quiz")}>
                  Quay lại danh sách bài thi
                </Button>
              </Alert>
            )
          ) : action === "settings" ? (
            <QuizSettings examId={queryParams.get("id")} onBack={() => navigate("/teacher?section=my_quiz")} />
          ) : (
            <>
              <h2>Bài tập của tôi</h2>
              <Button 
                variant="primary" 
                className="mb-3" 
                onClick={() => navigate("/teacher?section=my_quiz&action=create_quiz")}
              >
                + Tạo bài thi mới
              </Button>

              <Row>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <Col md={4} key={quiz.exam_id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <div className="quiz-thumbnail bg-light" style={{ height: "150px" }}></div>
                          <Card.Title>{quiz.exam_name}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            Người tạo: {quiz.created_by_name || "Không rõ"}
                          </Card.Subtitle>
                          <Card.Subtitle className="mb-2 text-muted">
                            Người cập nhật: {quiz.updated_by_name || "Chưa cập nhật"}
                          </Card.Subtitle>

                          {/* Điều hướng sang giao diện thi thử */}
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleSelectExam(quiz)} // 🔹 Chọn bài thi trước khi điều hướng
                          >
                            Thi thử
                          </Button>

                          {/* Điều hướng sang giao diện tùy chỉnh bài thi */}
                          <Button 
                            variant="warning" 
                            size="sm" 
                            className="ms-2"
                            onClick={() => navigate(`/teacher?section=my_quiz&action=settings&id=${quiz.exam_id}`)}
                          >
                            Tùy chỉnh
                          </Button>

                          {/* 🛑 Nút Xóa bài thi */}
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="ms-2"
                            onClick={() => handleDeleteQuiz(quiz.exam_id)}
                            disabled={loading}
                          >
                            {loading ? "Đang xóa..." : "Xóa"}
                          </Button>

                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <p>Chưa có bài thi nào.</p>
                )}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default QuizList;
