import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import ExamSimulation from "./ExamSimulation"; // Import giao diện thi thử

const QuizList = ({ onCreateQuiz, userRole }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null); // Lưu bài thi được chọn
  const [loading, setLoading] = useState(false); // 🛠 Thêm trạng thái loading

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("http://localhost/react_api/get_quizzes.php");
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài thi:", error);
    }
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
        fetchQuizzes(); // Cập nhật danh sách sau khi xóa
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
    <Container>
      {!selectedExam ? (
        <>
          <h2>Bài tập của tôi</h2>
          <Button variant="primary" className="mb-3" onClick={onCreateQuiz}>
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
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => setSelectedExam(quiz)}
                      >
                        Thi thử
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
      ) : (
        <ExamSimulation 
          exam={selectedExam} 
          userRole={userRole} 
          onBack={() => setSelectedExam(null)} 
        />
      )}
    </Container>
  );
};

export default QuizList;
