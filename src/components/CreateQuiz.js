import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Table, Container, Row, Col, Button, Modal, InputGroup, FormControl, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAlt, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import EditQuestion from "./EditQuestion";  // Import EditQuestion
import RandomQuestionSelector from "./RandomQuestionSelector";  // Import EditQuestion



const SortableItem = ({ question, onEdit, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.question_id });

  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ width: "40px", textAlign: "center", cursor: "grab" }} {...attributes} {...listeners}>
        <FontAwesomeIcon icon={faArrowsAlt} />
      </td>
      <td>{question.question_type}</td>
      <td>{question.question_title}</td>
      <td>{question.answer_options?.[question.correct_answer_index] || "N/A"}</td>
      <td>{question.status}</td>
      <td>{new Date(question.updated_at).toLocaleDateString()}</td>
      <td>
        <Button variant="warning" size="sm" onClick={() => onEdit(question.question_id)}>
          <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
        </Button>{" "}
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(question.question_id); }}>
          <FontAwesomeIcon icon={faTrash} /> Gỡ
        </Button>
      </td>
    </tr>
  );
};



const CreateQuiz = ({ teacherId, onQuizCreated }) => {
  const [quizName, setQuizName] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false); // Bật/Tắt mật khẩu
  const [password, setPassword] = useState(""); // Lưu mật khẩu
  const [isPublic, setIsPublic] = useState(true); // Trạng thái public/private
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]); // Lưu danh mục câu hỏi
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isRandomQuestion, setIsrandomQuestion] = useState(false)
  const [randomQuestionData, setRandomQuestionData] = useState(null); // lưu tạm ma trận đợi gọi tạo bài thi



  useEffect(() => {
    const fetchQuestionsAndCategories  = async () => {
      try {
        const response = await fetch(`http://localhost/react_api/fetch_questions.php?teacher_id=${teacherId}`);
        const data = await response.json();
        setQuestions(data);
        setFilteredQuestions(data);

        const categoriesResponse = await fetch("http://localhost/react_api/get_categories.php"); // Giả sử có endpoint để lấy danh mục
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        // console.log("Danh mục: ", categories)
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestionsAndCategories();
  }, [teacherId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const filtered = questions.filter((q) =>
      q.question_title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredQuestions(filtered);
  };
  // const handleRandomQuestionChange = (categoryId, count) => {
  //   setRandomQuestions((prev) => ({
  //     ...prev,
  //     [categoryId]: count,
  //   }));
  // };
  const handleReceiveQuestionMatrix = (matrix) => {
    setRandomQuestionData(matrix); // Chỉ lưu dữ liệu, chưa gọi handleCreateQuiz
  };
  
  const handleCreateQuiz = async (matrix) => {
    console.log(matrix)
    if (!quizName || !timeLimit || (selectedQuestions.length === 0 && isRandomQuestion === false)) {
      alert("Vui lòng nhập đầy đủ thông tin và chọn ít nhất một câu hỏi.");
      return;
    }
    const payload = {
      quiz_name: quizName,
      time_limit: timeLimit,
      teacher_id: localStorage.getItem("user_id"), // Lưu ID người tạo bài thi
      selected_questions: selectedQuestions,
      questions_matrix: matrix,
      is_Random_Question: isRandomQuestion,
      is_password_protected: isPasswordProtected, // Truyền trạng thái mật khẩu
      password: isPasswordProtected ? password : null, // Chỉ gửi mật khẩu nếu bật
      is_public: isPublic, // Truyền trạng thái public/private
    };

    try {
      const response = await fetch("http://localhost/react_api/create_quiz.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert("Bài thi đã được lưu thành công!");
        setQuizName(""); 
        setTimeLimit(""); 
        setSelectedQuestions([]);
        onQuizCreated(); // Gọi hàm cập nhật danh sách bài thi
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      alert("Đã xảy ra lỗi khi lưu bài thi.");
    }
  }

  const handleQuestionSelect = (question) => {
    setSelectedQuestions((prev) => {
      const alreadySelected = prev.some((q) => q.question_id === question.question_id);
      return alreadySelected ? prev.filter((q) => q.question_id !== question.question_id) : [...prev, question];
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // ✅ Kiểm tra nếu `over` tồn tại, nếu không thì return sớm
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = selectedQuestions.findIndex((q) => q.question_id === active.id);
      const newIndex = selectedQuestions.findIndex((q) => q.question_id === over.id);

      // ✅ Kiểm tra nếu cả oldIndex và newIndex đều hợp lệ
      if (oldIndex !== -1 && newIndex !== -1) {
        setSelectedQuestions(arrayMove(selectedQuestions, oldIndex, newIndex));
      }
    }
  };



  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions((prevQuestions) => {

      const updatedQuestions = prevQuestions.filter((q) => q.question_id !== questionId);

      return updatedQuestions;
    });
  };



  // Mở modal chỉnh sửa khi nhấn "Chỉnh sửa"
  const handleEditQuestion = (questionId) => {
    setEditingQuestionId(questionId);
  };

  // Cập nhật câu hỏi sau khi chỉnh sửa
  const handleQuestionUpdated = (updatedQuestion) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.question_id === updatedQuestion.question_id ? updatedQuestion : q))
    );
    setEditingQuestionId(null); // Đóng modal sau khi cập nhật
  };

  return (
    <Container>
      <h2 className="mt-4">Tạo Bài Thi</h2>

      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="quizName">
              <Form.Label>Tên Bài Thi</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên bài thi"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="timeLimit">
              <Form.Label>Thời gian làm bài (phút)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập thời gian"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Bật/Tắt mật khẩu bài thi */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Check
              type="checkbox"
              label="Bảo vệ bằng mật khẩu"
              checked={isPasswordProtected}
              onChange={() => setIsPasswordProtected(!isPasswordProtected)}
            />
          </Col>
          {isPasswordProtected && (
            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={isPasswordProtected}
                />
              </Form.Group>
            </Col>
          )}
        </Row>

        {/* Chọn trạng thái Public/Private */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Trạng thái bài thi</Form.Label>
              <div>
                <Form.Check
                  inline
                  label="Công khai (Public)"
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                <Form.Check
                  inline
                  label="Riêng tư (Private)"
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      
      </Form>

      <Row className="mb-3">
        <Col>
          <Button 
            variant="secondary" 
            onClick={() => {setShowModal(true); setIsrandomQuestion(false)}}
            >
            Thêm câu hỏi từ ngân hành câu hỏi
          </Button>
          <Button 
            variant="secondary" 
            className="mx-5" 

            onClick={() => {setShowModal(false); setIsrandomQuestion(true); setSelectedQuestions([])}}>
            Thêm câu hỏi ngẩu nhiên theo ma trận
          </Button>
        </Col>
      </Row>
      {/* Hiển thị form khi nút "Thêm câu hỏi ngẫu nhiên" được nhấn */}
      {/* Hiển thị giao diện khi nút được nhấn */}
      {isRandomQuestion && ( 
        <RandomQuestionSelector
          categories={categories}
          onAddRandomQuestions={handleReceiveQuestionMatrix}
        />
      )}

      {/* Modal Ngân hàng câu hỏi */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ngân hàng câu hỏi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <FormControl placeholder="Tìm kiếm câu hỏi" value={searchQuery} onChange={handleSearchChange} />
          </InputGroup>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Chọn</th>
                <th>Loại Câu Hỏi</th>
                <th>Câu Hỏi</th>
                <th>Đáp Án Đúng</th>
                <th>Trạng Thái</th>
                <th>Ngày Cập Nhật</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question) => (
                <tr key={question.question_id} onClick={() => handleQuestionSelect(question)} style={{ cursor: "pointer" }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.some((q) => q.question_id === question.question_id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleQuestionSelect(question);
                      }}
                    />
                  </td>
                  <td>{question.question_type}</td>
                  <td>{question.question_title}</td>
                  <td>{question.answer_options?.[question.correct_answer_index] || "N/A"}</td>
                  <td>{question.status}</td>
                  <td>{new Date(question.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="primary" onClick={() => setShowModal(false)}>Xác nhận thêm câu hỏi</Button>
        </Modal.Body>
      </Modal>

      {selectedQuestions.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedQuestions.map((q) => q.question_id)} strategy={verticalListSortingStrategy}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ width: "40px", textAlign: "center" }}>☰</th>
                  <th>Loại Câu Hỏi</th>
                  <th>Câu Hỏi</th>
                  <th>Đáp Án Đúng</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Cập Nhật</th>
                  <th>Thao Tác</th> {/* Không kéo thả */}
                </tr>
              </thead>
              <tbody>
                {selectedQuestions.map((question) => (
                  <SortableItem
                    key={question.question_id}
                    question={question}
                    onEdit={handleEditQuestion}
                    onRemove={handleRemoveQuestion}
                  />
                ))}
              </tbody>
            </Table>
          </SortableContext>
        </DndContext>
      )}
<Button 
  variant="success" 
  className="mt-3"
  onClick={() => handleCreateQuiz(randomQuestionData)}
>
  Lưu và tạo bài thi
</Button>


      {/* Hiển thị modal chỉnh sửa nếu có câu hỏi cần chỉnh sửa */}
      {editingQuestionId && (
        <EditQuestion
          show={!!editingQuestionId}
          onHide={() => setEditingQuestionId(null)}
          questionId={editingQuestionId}
          teacherId={teacherId}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}
    </Container>
  );
};

export default CreateQuiz;
