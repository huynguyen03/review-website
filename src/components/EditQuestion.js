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
    mutiple_choice_answer: "",
    code_answer: "", // Dành cho code_response
    short_answer: "", // Dành cho short_answer
  });
  const apiUrl = process.env.REACT_APP_API_BASE_URL;


  useEffect(() => {
    if (!questionId) return;
  
    const fetchQuestionData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/fetch_question.php?question_id=${questionId}`);
        if (response.data && !response.data.error) {
          setQuestionData((prevData) => ({
            ...prevData,
            ...response.data,
            answer_options: response.data.answer_options || ["", "", "", ""],
            code_answer: response.data.correct_answer_text || "",
            short_answer: response.data.correct_answer_text || "",
          }));
        } else {
          console.error("Error fetching question data:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching question data:", error);
      }
    };
  
    fetchQuestionData();
  }, [questionId]); // Không thêm `questionData`
  

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
      let response;
      if (questionId) {
        response = await axios.put(`${apiUrl}/update_question.php`, {
          question_id: questionId,
          teacher_id: teacherId,
          ...questionData,
        });
      } else {
        response = await axios.post(`${apiUrl}/add_question.php`, {
          teacher_id: teacherId,
          ...questionData,
        });
      }

      if (response.data.status === "success") {
        onQuestionUpdated(questionData);
        onHide();
      } else {
        console.error("Error saving question:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving question:", error);
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
              value={questionData.question_title || ""}
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
              value={questionData.question_text || ""}
              onChange={handleInputChange}
              placeholder="Nhập nội dung câu hỏi"
            />
          </Form.Group>

          {questionData.question_type === "multiple_choice" && (
            <Form.Group controlId="answer_options" className="mt-3">
              <Form.Label>Lựa chọn đáp án</Form.Label>
              {questionData.answer_options.map((option, index) => (
                <InputGroup className="mb-2" key={index}>
                  <InputGroup.Text>{`Đáp án ${index + 1}`}</InputGroup.Text>
                  <FormControl
                    type="text"
                    value={option || ""}
                    onChange={(e) => handleAnswerOptionsChange(e, index)}
                    placeholder={`Nhập đáp án ${index + 1}`}
                  />
                </InputGroup>
              ))}
            </Form.Group>
          )}

          {questionData.question_type === "code_response" && (
            <Form.Group controlId="code_answer" className="mt-3">
              <Form.Label>Đáp án dạng code</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="code_answer"
                value={questionData.code_answer || ""}
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
                value={questionData.short_answer || ""}
                onChange={handleInputChange}
                placeholder="Nhập đáp án ngắn"
              />
            </Form.Group>
          )}
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
