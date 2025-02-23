import React, { useEffect, useState } from "react";
import { useQuestions } from "./QuestionContext";
import AddQuestionModal from "./AddQuestionModal"; // Component thêm câu hỏi thủ công

const QuestionBank = ({ teacherId }) => {
  const { questions, fetchQuestions, updateQuestions } = useQuestions(); // Lấy danh sách câu hỏi từ context
  const [selectedQuestions, setSelectedQuestions] = useState([]); // Danh sách các câu hỏi được chọn
  const [showAddModal, setShowAddModal] = useState(false); // Hiển thị modal thêm câu hỏi

  // Lấy danh sách câu hỏi khi component được mount hoặc khi teacherId thay đổi
  useEffect(() => {
    // Chỉ gọi API nếu câu hỏi chưa có trong context
    if (questions.length === 0) {
      fetchQuestions(teacherId); // Lấy câu hỏi từ API
    }
  }, [teacherId, questions.length, fetchQuestions]); // Thêm `questions.length` để tránh gọi lại API liên tục

  // Xử lý chọn/deselect câu hỏi
  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId) // Bỏ chọn
        : [...prev, questionId] // Thêm vào danh sách chọn
    );
  };

  // Xử lý xóa các câu hỏi được chọn
  const handleDeleteQuestions = () => {
    if (selectedQuestions.length === 0) {
      alert("Vui lòng chọn ít nhất một câu hỏi để xóa.");
      return;
    }
  
    // Hiển thị cảnh báo
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedQuestions.length} câu hỏi không?`
    );
  
    if (!confirmDelete) {
      return; // Người dùng chọn hủy
    }
  
    // Gửi yêu cầu xóa
    fetch("http://localhost/react_api/delete_questions.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_ids: selectedQuestions }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Xóa thành công.");
          // ✅ Cập nhật danh sách câu hỏi ngay lập tức mà không cần gọi lại API
      updateQuestions(questions.filter(q => !selectedQuestions.includes(q.question_id)));

      setSelectedQuestions([]); // Reset danh sách chọn
        } else {
          alert("Xóa thất bại.");
        }
      })
      .catch((err) => console.error("Error deleting questions:", err));
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Ngân hàng câu hỏi</h4>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)} // Mở modal thêm câu hỏi thủ công
        >
          Thêm câu hỏi
        </button>
      </div>

      {questions.length > 0 ? (
        <table className="table table-striped table-responsive" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "2%" }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedQuestions(questions.map((q) => q.question_id)); // Chọn tất cả
                    } else {
                      setSelectedQuestions([]); // Bỏ chọn tất cả
                    }
                  }}
                />
              </th>
              <th style={{ width: "15%" }}>Tên câu hỏi</th>
              <th style={{ width: "25%" }}>Nội dung</th>
              <th style={{ width: "15%" }}>Các đáp án để lựa chọn</th>
              <th style={{ width: "10%" }}>Đáp án đúng</th>
              <th style={{ width: "7%" }}>Độ khó</th>
              <th style={{ width: "10%" }}>Trạng thái</th>
              <th style={{ width: "10%" }}>Ngày cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.question_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.question_id)}
                    onChange={() => handleSelectQuestion(question.question_id)}
                  />
                </td>
                <td>{question.question_title || "Không có tiêu đề"}</td>
                <td>{question.question_text}</td>
                <td
  style={{
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    padding: '0',
    maxWidth: '100%',
  }}
  onClick={(e) => e.stopPropagation()} // Chặn sự kiện click ra ngoài nếu cần
>
  <div className="d-flex">
    {question.answer_options?.map((option, index) => (
      <div key={index} className="mr-3 pl-1" style={{ flexShrink: 0 }}>
       <span class="mx-2">{option}</span>
      </div>
    ))}
  </div>
</td>

                <td>
                  {question.correct_answer_index !== null &&
                  question.answer_options?.[question.correct_answer_index]
                    ? `${
                        question.answer_options[question.correct_answer_index]
                      }`
                    : "Không xác định"}
                </td>
                <td>{question.difficulty_level}</td>
                <td>{question.status}</td>
                <td>{new Date(question.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có câu hỏi nào.</p>
      )}

      <button
        className="btn btn-danger mt-3"
        onClick={handleDeleteQuestions}
        disabled={selectedQuestions.length === 0} // Vô hiệu hóa nếu không có câu hỏi được chọn
      >
        Xóa câu hỏi
      </button>

      {showAddModal && (
        <AddQuestionModal
          teacherId={teacherId}
          onClose={() => setShowAddModal(false)} // Đóng modal
          onSuccess={() => fetchQuestions(teacherId)} // Cập nhật danh sách sau khi thêm thành công
        />
      )}
    </div>
  );
};

export default QuestionBank;
