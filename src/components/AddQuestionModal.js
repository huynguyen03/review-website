import React, { useState } from "react";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";

const AddQuestionModal = ({ teacherId, onClose, onSuccess }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [questionData, setQuestionData] = useState({
    question_title: "",
    question_text: "",
    answer_options: ["", "", "", ""], // Mặc định 4 lựa chọn
    correct_answer_index: 0,
    difficulty_level: 1,
    category_id: 1,
    status: "draft",
    question_type: "multiple_choice",
    code_answer: "", // Dành cho code_response
    short_answer: "", // Dành cho short_answer
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAnswerOptionsChange = (e, index) => {
    const updatedOptions = [...questionData.answer_options];
    updatedOptions[index] = e.target.value;
    setQuestionData((prevData) => ({
      ...prevData,
      answer_options: updatedOptions,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${apiUrl}/add_question.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          ...questionData,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        alert("Thêm câu hỏi thành công.");
        onSuccess();
        onClose();
      } else {
        alert("Thêm câu hỏi thất bại.");
      }
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm câu hỏi</Modal.Title>
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

          <Form.Group controlId="question_type" className="mt-3">
            <Form.Label>Loại câu hỏi</Form.Label>
            <Form.Control
              as="select"
              name="question_type"
              value={questionData.question_type}
              onChange={handleInputChange}
            >
              <option value="multiple_choice">Trắc nghiệm</option>
              <option value="code_response">Lập trình</option>
              <option value="short_answer">Câu trả lời ngắn</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="category_id" className="mt-3">
            <Form.Label>Chọn danh mục</Form.Label>
            <Form.Control
              as="select"
              name="category_id"
              value={questionData.category_id || ""}
              onChange={handleInputChange}
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="1">Toán</option>
              <option value="2">Lập trình</option>
              <option value="3">Lịch sử</option>
              {/* Thêm các danh mục khác nếu có */}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="difficulty_level" className="mt-3">
            <Form.Label>Độ khó</Form.Label>
            <Form.Control
              as="select"
              name="difficulty_level"
              value={questionData.difficulty_level}
              onChange={handleInputChange}
            >
              <option value="1">Biết</option>
              <option value="2">Hiểu</option>
              <option value="3">Vận dụng</option>
              <option value="3">Vận dụng cao</option>

            </Form.Control>
          </Form.Group>

          {questionData.question_type === "multiple_choice" && (
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
          )}
          {questionData.question_type === "multiple_choice" && (
            <Form.Group controlId="correct_answer_index" className="mt-3">
              <Form.Label>Chọn đáp án đúng</Form.Label>
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
          )}
          {questionData.question_type === "code_response" && (
            <Form.Group controlId="code_answer" className="mt-3">
              <Form.Label>Đáp án dạng code</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="code_answer"
                value={questionData.code_answer}
                onChange={handleInputChange}
                placeholder="Nhập đoạn code đúng"
              />
            </Form.Group>
          )}

          {questionData.question_type === "short_answer" && (
            <Form.Group controlId="short_answer" className="mt-3">
              <Form.Label>Đáp án ngắn</Form.Label>
              <Form.Control
                type="text"
                name="short_answer"
                value={questionData.short_answer}
                onChange={handleInputChange}
                placeholder="Nhập đáp án ngắn"
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <Button variant="primary" onClick={handleSave}>Thêm</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddQuestionModal;
