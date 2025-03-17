import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuestions } from "./QuestionContext";
import AddQuestionModal from "./AddQuestionModal"; // Component thêm câu hỏi thủ công
import CategorySelect from "./CategorySelect"; // Component thêm câu hỏi thủ công

import EditQuestion from "./EditQuestion";



const QuestionBank = ({ teacherId }) => {
  const { questions, fetchQuestions, updateQuestions } = useQuestions(); // Lấy danh sách câu hỏi từ context
  const [selectedQuestions, setSelectedQuestions] = useState([]); // Danh sách các câu hỏi được chọn
  const [showAddModal, setShowAddModal] = useState(false); // Hiển thị modal thêm câu hỏi
  const [allQuestions, setAllQuestions] = useState([]); // Lưu tất cả câu hỏi
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Câu hỏi sau khi lọc
  const [categories, setCategories] = useState([]); // Danh sách danh mục
  const [selectedCategory, setSelectedCategory] = useState(""); // Danh mục được chọn

  const location = useLocation();

  // Lấy danh sách câu hỏi khi component được mount hoặc khi teacherId thay đổi
  // useEffect(() => {
  //   // Chỉ gọi API nếu câu hỏi chưa có trong context
  //   if (questions.length === 0) {
  //     fetchQuestions(teacherId); // Lấy câu hỏi từ API
  //   }
  // }, [teacherId, questions.length, fetchQuestions]); // Thêm `questions.length` để tránh gọi lại API liên tục

  useEffect(() => {
    // Kiểm tra nếu đang ở trang question_bank thì gọi API
    const searchParams = new URLSearchParams(location.search);
    const activeSection = searchParams.get("section");
    console.log("check section: ", activeSection)

    if (activeSection === "question_bank") {
      console.log("Đang foij api lấy câu hỏi...")
      fetchQuestions(teacherId);
    }
  }, [location.search, teacherId, fetchQuestions]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API lấy danh sách câu hỏi
        const questionRes = await fetch(`http://localhost/react_api/fetch_questions.php?teacher_id=${teacherId}`);
        const questionData = await questionRes.json();
        setAllQuestions(questionData);
        setFilteredQuestions(questionData); // Ban đầu hiển thị toàn bộ câu hỏi
        console.log("Toàn bộ câu hỏi: ", questionData)

        // Gọi API lấy danh sách danh mục
        const categoryRes = await fetch("http://localhost/react_api/get_categories.php");
        const categoryData = await categoryRes.json();
        setCategories(categoryData);

        console.log("Danh mục nhận về từ ngân hàng câu hỏi:", categoryData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [teacherId]);


  // Khi chọn danh mục, cập nhật danh sách câu hỏi hiển thị
  useEffect(() => {
    if (selectedCategory === "") {
      setFilteredQuestions(allQuestions); // Nếu không chọn danh mục, hiển thị tất cả
    } else {
      setFilteredQuestions(allQuestions.filter(q => q.category_id === Number(selectedCategory)));
      console.log("đã nhận được câu hỏi log")
    }
    console.log("Danh mục đã chọn: ", selectedCategory)

  }, [selectedCategory, allQuestions]);

  useEffect(() => {
    if (filteredQuestions === "") {
      console.log("Dữ liệu đã lọc được", filteredQuestions)
    }
  })

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


  const [editingQuestionId, setEditingQuestionId] = useState(null); // State lưu ID câu hỏi cần chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false); // Kiểm soát hiển thị modal chỉnh sửa

  const handleEditQuestions = () => {
    if (selectedQuestions.length === 0) {
      alert("Vui lòng chọn một câu hỏi để chỉnh sửa.");
      return;
    }
    if (selectedQuestions.length > 1) {
      alert("Chỉ chọn 1 câu hỏi để chỉnh sửa!!!");
      return;
    }

    setEditingQuestionId(selectedQuestions[0]); // Lưu ID câu hỏi cần chỉnh sửa
    setShowEditModal(true); // Mở modal chỉnh sửa
  };
//Hàm hiển thị danh mục



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
      {/* Dropdown chọn danh mục */}
      <div className="mb-3">
      <label htmlFor="categorySelect">Chọn danh mục:</label>
      <select
        id="categorySelect"
        className="form-control"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Tất cả</option>
        {/* Gọi component CategorySelect */}
        <CategorySelect categories={categories} questions={questions} />
      </select>
    </div>



      {filteredQuestions.length > 0 ? (
        <table className="table table-striped table-responsive table-bordered"  style={{ tableLayout: "fixed", width: "100%"}}>
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
              <th style={{ width: "10%" }}>Loại câu hỏi</th>
              <th style={{ width: "35%" }}>Nội dung</th>
              <th style={{ width: "15%" }}>Các đáp án để lựa chọn</th>
              <th style={{ width: "15%" }}>Đáp án đúng</th>
              <th style={{ width: "5%" }} class="text-center">Điểm</th>

              <th style={{ width: "7%" }} class="text-center">Độ khó</th>
              <th style={{ width: "7%" }} class="text-center">Trạng thái </th>
              <th style={{ width: "8%" }}>Ngày cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question) => (

              <tr key={question.question_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.question_id)}
                    onChange={() => handleSelectQuestion(question.question_id)}
                  />
                </td>
                <td>{question.question_type}</td>
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
                        <span className="mx-2">{option}</span>
                      </div>
                    ))}
                  </div>
                </td>

                <td>{question.correct_answer_text}</td>
                <td class="text-center">{question.score}</td>
                <td class="text-center">{question.difficulty_level}</td>
                <td class="text-center">{question.status}</td>
                <td class="text-center">{new Date(question.updated_at).toLocaleDateString()}</td>
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

      <button
        className="btn btn-warning mt-3"
        onClick={handleEditQuestions}
        disabled={selectedQuestions.length === 0} // Vô hiệu hóa nếu không có câu hỏi được chọn
      >
        Chỉnh sửa câu hỏi
      </button>

      {showAddModal && (
        <AddQuestionModal
          teacherId={teacherId} // Đảm bảo truyền đúng teacherId
          onClose={() => setShowAddModal(false)} // Đóng modal khi hoàn thành
          onSuccess={() => {
            fetchQuestions(); // Cập nhật danh sách câu hỏi sau khi thêm mới
            setShowAddModal(false);
          }}
        />
      )}


      <EditQuestion
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingQuestionId(null); // Reset ID sau khi đóng
        }}
        questionId={editingQuestionId}
        teacherId={teacherId}
        onQuestionUpdated={(updatedQuestion) => {
          updateQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
              q.question_id === updatedQuestion.question_id ? updatedQuestion : q
            )
          );
          setShowEditModal(false);
          setEditingQuestionId(null); // Reset ID sau khi cập nhật
        }}
      />

    </div>

  );
};

export default QuestionBank;
