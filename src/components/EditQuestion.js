import React, { useState, useEffect } from "react";
import { Form, Button, Modal, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";

const EditQuestion = ({ show, onHide, questionId = null, teacherId, onQuestionUpdated }) => {
  const [questionData, setQuestionData] = useState({
    question_title: "",
    question_text: "",
    answer_options: ["", "", "", ""], // Mặc định 4 lựa chọn
    correct_answer_index: 0,
    difficulty_level: 1,
    status: "draft",
    question_type: "multiple_choice",
  });

  // Khi có questionId, lấy dữ liệu câu hỏi từ API
  useEffect(() => {
    if (!questionId) return; // Nếu không có questionId => chế độ tạo mới

    const fetchQuestionData = async () => {
        if (!questionId) return; // Nếu không có questionId, bỏ qua
      
        try {
          const response = await axios.get(`http://localhost/react_api/fetch_question.php?question_id=${questionId}`);
          if (response.data && !response.data.error) {
            setQuestionData(response.data);
          } else {
            console.error("Error fetching question data:", response.data.error);
          }
        } catch (error) {
          console.error("Error fetching question data:", error);
        }
      };
      

    fetchQuestionData();
  }, [questionId]);

  // Cập nhật dữ liệu khi người dùng chỉnh sửa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Cập nhật danh sách đáp án
  const handleAnswerOptionsChange = (e, index) => {
    const updatedOptions = [...questionData.answer_options];
    updatedOptions[index] = e.target.value;
    setQuestionData((prevData) => ({
      ...prevData,
      answer_options: updatedOptions,
    }));
  };

  // Lưu câu hỏi (Dùng chung cho Cập Nhật & Thêm Mới)
  const handleSave = async () => {
    try {
      let response;
  
      if (questionId) {
        // Cập nhật câu hỏi cũ
        response = await axios.put("http://localhost/react_api/update_question.php", {
          question_id: questionId,
          teacher_id: teacherId,
          ...questionData,
        });
      } else {
        // Thêm câu hỏi mới
        response = await axios.post("http://localhost/react_api/add_question.php", {
          teacher_id: teacherId,
          ...questionData,
        });
      }
  
      console.log("API Response: ", response.data);  // Kiểm tra dữ liệu trả về từ API
  
      if (response.data.status === "success") {
        onQuestionUpdated(questionData); // Cập nhật câu hỏi mới
        onHide(); // Đóng modal
      } else {
        console.error("Error saving question:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving question:", error);  // In toàn bộ lỗi
      alert("Có lỗi xảy ra. Hãy kiểm tra Console để biết thêm chi tiết.");
    }
  };
  
  

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{questionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="question_title">
            <Form.Label>Tiêu đề câu hỏi</Form.Label>
            <Form.Control
              type="text"
              name="question_title"
              value={questionData.question_title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề câu hỏi"
            />
          </Form.Group>

          <Form.Group controlId="question_text" className="mt-3">
            <Form.Label>Nội dung câu hỏi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="question_text"
              value={questionData.question_text}
              onChange={handleInputChange}
              placeholder="Nhập nội dung câu hỏi"
            />
          </Form.Group>

          <Form.Group controlId="answer_options" className="mt-3">
            <Form.Label>Lựa chọn đáp án</Form.Label>
            {questionData.answer_options.map((option, index) => (
              <InputGroup className="mb-2" key={index}>
                <InputGroup.Text>{`Đáp án ${index + 1}`}</InputGroup.Text>
                <FormControl
                  type="text"
                  value={option}
                  onChange={(e) => handleAnswerOptionsChange(e, index)}
                  placeholder={`Nhập đáp án ${index + 1}`}
                />
              </InputGroup>
            ))}
          </Form.Group>

          <Form.Group controlId="correct_answer_index" className="mt-3">
            <Form.Label>Đáp án đúng</Form.Label>
            <Form.Control
              as="select"
              name="correct_answer_index"
              value={questionData.correct_answer_index}
              onChange={handleInputChange}
            >
              {questionData.answer_options.map((_, index) => (
                <option key={index} value={index}>
                  {`Đáp án ${index + 1}`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="difficulty_level" className="mt-3">
            <Form.Label>Mức độ khó</Form.Label>
            <Form.Control
              as="select"
              name="difficulty_level"
              value={questionData.difficulty_level}
              onChange={handleInputChange}
            >
              <option value="1">Dễ</option>
              <option value="2">Trung bình</option>
              <option value="3">Khó</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="status" className="mt-3">
            <Form.Label>Trạng thái câu hỏi</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={questionData.status}
              onChange={handleInputChange}
            >
              <option value="draft">Nháp</option>
              <option value="published">Công khai</option>
              <option value="archived">Lưu trữ</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="question_type" className="mt-3">
            <Form.Label>Loại câu hỏi</Form.Label>
            <Form.Control
              as="select"
              name="question_type"
              value={questionData.question_type}
              onChange={handleInputChange}
            >
              <option value="multiple_choice">Trắc nghiệm</option>
              <option value="fill_in_the_blank">Điền vào chỗ trống</option>
              <option value="essay">Tự luận</option>
              <option value="matching">Ghép đôi</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
        <Button variant="primary" onClick={handleSave}>
          {questionId ? "Lưu thay đổi" : "Thêm câu hỏi"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditQuestion;
