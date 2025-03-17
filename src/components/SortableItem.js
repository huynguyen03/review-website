import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAlt, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable"; // Import useSortable từ @dnd-kit
import EditQuestion from "./EditQuestion";  // Import EditQuestion component

const SortableItem = ({ question, onEdit, onRemove, teacherId, index }) => {
  const [isEditing, setIsEditing] = useState(false);  // Trạng thái cho chỉnh sửa tại ô
  const [editingField, setEditingField] = useState(null);  // Trường nào đang được chỉnh sửa
  const [questionData, setQuestionData] = useState(question);  // Lưu trữ dữ liệu câu hỏi
  const [showModal, setShowModal] = useState(false);  // Trạng thái cho modal

  // Hàm thay đổi giá trị khi chỉnh sửa tại ô
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  

  // Lưu dữ liệu khi nhấn "Enter" hoặc click ra ngoài
  const handleSaveInPlace = () => {
    onEdit(questionData);  // Gọi hàm chỉnh sửa từ cha
    setIsEditing(false);
  };

  // Hiển thị modal chỉnh sửa
  const handleShowModal = () => {
    setShowModal(true);
  };

  // Đóng modal
  const handleHideModal = () => {
    setShowModal(false);
  };

  // Hàm xử lý khi câu hỏi được lưu qua modal
  const handleQuestionUpdated = (updatedQuestion) => {
    setQuestionData(updatedQuestion);  // Cập nhật dữ liệu câu hỏi từ modal
    onEdit(updatedQuestion);  // Gọi hàm chỉnh sửa từ cha
    setShowModal(false);  // Đóng modal
  };

  // Xử lý nhấn vào ô để sửa đáp án đúng
  const handleEditAnswerOptions = () => {
    setEditingField("answer_options");
    setIsEditing(true);
  };

  // Sử dụng useSortable để quản lý kéo thả
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: questionData.question_id,
  });

  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    transition,
  };

  return (
    <>
      {/* Modal chỉnh sửa câu hỏi */}
      <EditQuestion
        show={showModal}
        onHide={handleHideModal}
        questionId={questionData.question_id}
        teacherId={teacherId}
        onQuestionUpdated={handleQuestionUpdated}
      />

      {/* Câu hỏi được render dưới dạng bảng */}
      <tr ref={setNodeRef} style={style}>
        <td style={{ width: "40px", textAlign: "center", cursor: "grab" }} {...attributes} {...listeners}>
          <FontAwesomeIcon icon={faArrowsAlt} />
        </td>

        {/* loại câu hỏi */}
        <td>{questionData.question_type}</td>

        {/* Nội dung câu hỏi - có thể chỉnh sửa tại chỗ */}
        <td
          onClick={() => {
            setEditingField("question_text");
            setIsEditing(true);
          }}
        >
          {isEditing && editingField === "question_text" ? (
            <textarea
              name="question_text"
              value={questionData.question_text}
              onChange={handleInputChange}
              onBlur={handleSaveInPlace}
              autoFocus
            />
          ) : (
            questionData.question_text
          )}
        </td>

        {/* Đáp án đúng */}
        <td onClick={handleEditAnswerOptions}>
          {isEditing && editingField === "answer_options" ? (
            <Form.Control
              as="select"
              name="correct_answer_index"
              value={questionData.correct_answer_index}
              onChange={handleInputChange}
              onBlur={handleSaveInPlace}
            >
              {questionData.answer_options.map((option, index) => (
                <option key={index} value={index}>
                  {option}
                </option>
              ))}
            </Form.Control>
          ) : (
            questionData.answer_options[questionData.correct_answer_index]
          )}
        </td>

        {/* Điểm */}
        <td
          onClick={() => {
            setEditingField("score");
            setIsEditing(true);
          }}
        >
          {isEditing && editingField === "score" ? (
            <input
              type="number"
              name="score"
              value={questionData.score}
              onChange={handleInputChange}
              onBlur={handleSaveInPlace}
              autoFocus
            />
          ) : (
            questionData.score
          )}
        </td>

        {/* Trạng thái */}
        <td>{questionData.status}</td>

        {/* Ngày cập nhật */}
        <td>{new Date(questionData.updated_at).toLocaleDateString()}</td>

        {/* Thao tác */}
        <td>
          <Button variant="warning" size="sm" onClick={handleShowModal}>
            <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
          </Button>{" "}
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onRemove(questionData.question_id);
            }}
          >
            <FontAwesomeIcon icon={faTrash} /> Gỡ
          </Button>
        </td>
      </tr>
    </>
  );
};

export default SortableItem;
