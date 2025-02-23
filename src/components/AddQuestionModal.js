import React, { useState } from "react";

const AddQuestionModal = ({ teacherId, onClose, onSuccess }) => {
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");

  const handleAddQuestion = () => {
    if (!questionText || !correctAnswer) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Gửi yêu cầu thêm câu hỏi
    fetch("http://localhost/react_api/add_question.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teacher_id: teacherId,
        question_title: questionTitle,
        question_text: questionText,
        correct_answer: correctAnswer,
        difficulty_level: difficultyLevel,
        category_id: categoryId,
        status,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Thêm câu hỏi thành công.");
          onSuccess(); // Gọi callback cập nhật danh sách
          onClose(); // Đóng modal
        } else {
          alert("Thêm câu hỏi thất bại.");
        }
      })
      .catch((err) => console.error("Error adding question:", err));
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Thêm câu hỏi</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Tiêu đề câu hỏi"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
            />
            <textarea
              className="form-control mb-2"
              placeholder="Nội dung câu hỏi"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Đáp án đúng"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Độ khó (1-5)"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="ID danh mục"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
            <select
              className="form-select mb-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Nháp</option>
              <option value="published">Công khai</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-primary" onClick={handleAddQuestion}>
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;
