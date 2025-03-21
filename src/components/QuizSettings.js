import React, { useState, useEffect } from "react";
import { Container, Button, Form, Spinner, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

const QuizSettings = ({ examId, onBack, userId }) => {
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

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // 🔹 Lấy thông tin bài thi & danh sách câu hỏi
  useEffect(() => {
    fetchQuizDetails();
    fetchExamQuestions();
  }, [examId]);

  // 🛑 Lấy thông tin bài thi
  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/get_quizz.php?exam_id=${examId}`);
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

      const response = await fetch(`${apiUrl}/fetch_exam_questions.php?exam_id=${examId}`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacder_id: userId }),
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
      const response = await fetch(`${apiUrl}/fetch_questions.php?teacher_id=${userId}`);
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
      const response = await fetch(`${apiUrl}/update_quiz.php`, {
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
      const response = await fetch(`${apiUrl}/remove_question_from_exam.php`, {
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
      const response = await fetch(`${apiUrl}/add_question_to_exam.php`, {
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
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // ✅ Kiểm tra nếu `over` tồn tại, nếu không thì return sớm
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.question_id === active.id);
      const newIndex = questions.findIndex((q) => q.question_id === over.id);

      // ✅ Kiểm tra nếu cả oldIndex và newIndex đều hợp lệ
      if (oldIndex !== -1 && newIndex !== -1) {
        setQuestions(arrayMove(questions, oldIndex, newIndex));
      }
    }
  };

  const arrayMove = (array, fromIndex, toIndex) => {
    const result = [...array];
    const [movedItem] = result.splice(fromIndex, 1);  // Xóa phần tử ở vị trí fromIndex
    result.splice(toIndex, 0, movedItem);  // Thêm phần tử đã xóa vào vị trí toIndex
    return result;
  };
  const handleEditQuestion = (updatedQuestion) => {
    // Cập nhật câu hỏi sau khi chỉnh sửa
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.question_id === updatedQuestion.question_id
          ? updatedQuestion
          : question
      )
    );
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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questions.map((q) => q.question_id)} strategy={verticalListSortingStrategy}>
                  <Table striped bordered hover>
        <thead>
          <tr>
            <th style={{ width: "3%", textAlign: "center" }}>☰</th>
            <th style={{ width: "10%" }}>Loại Câu Hỏi</th>
            <th style={{ width: "15%" }}>Câu Hỏi</th>
            <th style={{ width: "20%" }}>Đáp Án Đúng</th>
            <th style={{ width: "7%" }}>Điểm</th>

            <th style={{ width: "7%" }}>Trạng Thái</th>
            <th style={{ width: "7%" }}>Ngày Cập Nhật</th>
            <th style={{ width: "10%" }}>Thao Tác</th> {/* Không kéo thả */}

          </tr>
        </thead>
        <tbody>


          {questions.map((question) => (
            <SortableItem
              key={question.question_id}
              question={question}
              onEdit={handleEditQuestion}  // Truyền hàm chỉnh sửa từ cha
              onRemove={handleRemoveQuestion}  // Truyền hàm xóa từ cha
              teacherId={1}  // Giả sử teacherId là 1
            >

            </SortableItem>
          ))}
        </tbody>
      </Table>
      </SortableContext>
              </DndContext>

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
