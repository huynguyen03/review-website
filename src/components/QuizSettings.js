import React, { useState, useEffect,useCallback  } from "react";
import { Container, Button, Form, Spinner, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

const QuizSettings = ({ examId, onBack , userId}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    exam_name: "",
    time_limit: 30, // Mặc định 30 phút
    max_attempts: 3, // Mặc định 3 lần
  });

  const [showModal, setShowModal] = useState(false); // Modal thêm câu hỏi
  const [availableQuestions, setAvailableQuestions] = useState([]); // Ngân hàng câu hỏi

  // 🔹 Lấy thông tin bài thi & danh sách câu hỏi
  useEffect(() => {
    fetchQuizDetails();
    fetchExamQuestions();
  }, [examId]);

  // 🛑 Lấy thông tin bài thi
  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`http://localhost/react_api/get_quizz.php?exam_id=${examId}`);
      const data = await response.json();
      // setQuizData(data); DỮ liệu chưa cần đến
      setFormData({
        exam_name: data.exam_name || "",
        time_limit: data.time_limit || 30,
        max_attempts: data.max_attempts || 3,
      });
    } catch (error) {
      console.error("Lỗi khi tải thông tin bài thi:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🛑 Lấy danh sách câu hỏi đã thêm vào bài thi
  const fetchExamQuestions = async () => {
    try {
    
      const response = await fetch(`http://localhost/react_api/fetch_exam_questions.php?exam_id=${examId}`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({teacder_id: userId}),
      }
      );
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi của bài thi:", error);
    }
  };

  // 🛑 Lấy danh sách câu hỏi từ ngân hàng câu hỏi
  const fetchAvailableQuestions = async () => {
    try {
      const response = await fetch(`http://localhost/react_api/fetch_questions.php?teacher_id=${userId}`);
      const data = await response.json();
      setAvailableQuestions(data);
    } catch (error) {
      console.error("Lỗi khi tải ngân hàng câu hỏi:", error);
    }
  };

  // 🛑 Lưu thay đổi bài thi
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("http://localhost/react_api/update_quiz.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exam_id: examId, ...formData }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Cập nhật thành công!");
      } else {
        alert("Lỗi khi cập nhật: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài thi:", error);
    } finally {
      setSaving(false);
    }
  };

  // 🛑 Xóa câu hỏi khỏi bài thi
  const handleRemoveQuestion = async (questionId) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi bài thi không?")) return;

    try {
      const response = await fetch("http://localhost/react_api/remove_question_from_exam.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exam_id: examId, question_id: questionId }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Đã xóa câu hỏi khỏi bài thi!");
        fetchExamQuestions();
      } else {
        alert("Lỗi khi xóa: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa câu hỏi:", error);
    }
  };

  // 🛑 Thêm câu hỏi vào bài thi
  const handleAddQuestion = async (question) => {
    try {
      const response = await fetch("http://localhost/react_api/add_question_to_exam.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exam_id: examId, question_id: question.question_id }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Đã thêm câu hỏi vào bài thi!");
        fetchExamQuestions();
      } else {
        alert("Lỗi khi thêm: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm câu hỏi:", error);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Tùy chỉnh bài thi</h2>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Tên bài thi</Form.Label>
          <Form.Control
            type="text"
            value={formData.exam_name}
            onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Thời gian làm bài (phút)</Form.Label>
          <Form.Control
            type="number"
            value={formData.time_limit}
            onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value, 10) })}
          />
        </Form.Group>

        
      </Form>

      <h3 className="mt-4">Danh sách câu hỏi</h3>
      <Button variant="success" className="mb-3" onClick={() => { setShowModal(true); fetchAvailableQuestions(); }}>
        <FontAwesomeIcon icon={faPlus} /> Thêm câu hỏi
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Loại</th>
            <th>Câu Hỏi</th>
            <th>Đáp án</th>
            <th>Thao tác</th>
            <th>Mức độ</th>

          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.question_id}>
              <td>{q.question_type}</td>
              <td>{q.question_text}</td>
              <td>{q.correct_answer_text}</td>
              <td>{q.difficulty_level}</td>


              <td>
                <Button variant="danger" size="sm" onClick={() => handleRemoveQuestion(q.question_id)}>
                  <FontAwesomeIcon icon={faTrash} /> Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>

      {/* Modal thêm câu hỏi */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chọn câu hỏi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {availableQuestions.map((q) => (
            <Button key={q.question_id} className="mb-2 d-block" onClick={() => handleAddQuestion(q)}>
              {q.question_title}
            </Button>
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default QuizSettings;
