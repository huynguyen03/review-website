import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";

import { Button, Card, Row, Col, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import ExamSimulation from "./ExamSimulation";
import ExamStatistics from "./ExamStatistics";



const ClassroomPractice = ({ classroomId, userId, roleId }) => {
  const [publicExams, setPublicExams] = useState([]); // Danh sách bài thi đã tạo
  const [examsClassrom, setExamsClassrom] = useState([]); // Danh sách bài thi đã thêm vào lớp học
  const [showModal, setShowModal] = useState(false);
  const [showExamSimulation, setShowExamSimulation] = useState(false);
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseContent, setExerciseContent] = useState("");
  const [showExamModal, setShowExamModal] = useState(false); // Modal hiển thị bài thi đã tạo
  const [selectedExam, setSelectedExam] = useState(null); // 🔹 Lưu bài thi được chọn
  const [showStats, setShowStats] = useState(false);// quản lý hiển thị thống kê điểm số
  const [loading, setLoading] = useState(false);



  // Fetch danh sách bài thi đã tạo từ API
  const fetchPublicExams = useCallback(async () => {
    setLoading(true)
    try {

      const response = await fetch(
        `http://localhost/react_api/fetch_completed_exams.php?user_id=${userId}`
      );
      const data = await response.json();
      setPublicExams(data); // Cập nhật bài thi đã tạo
      console.log("Bài thi lấy về từ CSDL", data, userId);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách bài thi đã tạo:", error);
    } finally {
      setLoading(false)

    }
  }, [userId]);

  // Fetch các bài thi đã thêm vào lớp học
  const fetchExamsForClassroom = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost/react_api/fetch_classroom_exams.php?classroom_id=${classroomId}`
      );
      setExamsClassrom(response.data || []); // Cập nhật bài thi đã thêm vào lớp học
      console.log("Các bài thi có trong lớp học", response.data)
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách bài thi đã thêm vào lớp học:", error);
    } finally {
      setLoading(false)

    }
  }, [classroomId]);
  // Gọi API lấy bài thi khi component mount
  useEffect(() => {
    fetchPublicExams(); // Lấy danh sách bài thi đã tạo
    fetchExamsForClassroom(); // Lấy các bài thi đã thêm vào lớp học
  }, [classroomId, userId, fetchPublicExams, fetchExamsForClassroom]); // Chạy lại khi `classroomId` hoặc `userId` thay đổi


  // ✅ Thêm bài thi đã tạo vào lớp học
  const handleAddExamToClassroom = async (examId) => {
    console.log("Lớp học ID:", classroomId, "Bài thi ID:", examId);
    setLoading(true)
    if (!examId) return;
    try {
      await axios.post("http://localhost/react_api/add_exam_to_classroom.php", {
        classroom_id: classroomId,
        exam_id: examId,
      });

      // Sau khi thêm bài thi, gọi lại để cập nhật danh sách bài thi trong lớp học
      fetchExamsForClassroom(); // Cập nhật danh sách bài thi đã thêm vào lớp học
      setShowExamModal(false); // Đóng modal
    } catch (error) {
      console.error("❌ Lỗi thêm bài thi vào lớp học:", error);
    } finally {
      setLoading(false)
    }
  };

  // ✅ Xóa bài thi đã thêm vào lớp học
  const handleDeleteExamFromClassroom = async (examId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài thi này khỏi lớp học?")) return;

    try {
      await axios.post("http://localhost/react_api/delete_exam_from_classroom.php", {
        classroom_id: classroomId,
        exam_id: examId,
      });

      // Sau khi xóa bài thi, cập nhật lại danh sách bài thi trong lớp học
      fetchExamsForClassroom();
    } catch (error) {
      console.error("❌ Lỗi khi xóa bài thi khỏi lớp học:", error);
    }
};

  // 🛑 Hàm chọn bài thi khi click "Thi thử"
  // const handleSelectExam = (exam) => {
  //   setSelectedExam(exam);
  //   navigate(`/teacher?section=my_quiz&action=exam&id=${exam.exam_id}`);
  // };

  const hanldeShowExamStatistics = (exam) => {
    setSelectedExam(exam);
    setShowStats(true);
  }


  if (selectedExam && showExamSimulation) {
    return <ExamSimulation exam={selectedExam} studentId={userId} onBack={() => setSelectedExam(null)} />;
  }
  return (
    <div>
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (showStats ? (
        <ExamStatistics examId={selectedExam.exam_id} onClose={() => setShowStats(false)} />

      ) : (

        <>
          <h3>Bài ôn luyện trong lớp</h3>
          {
            roleId === "2" ? (
              <>
                <h4>Bài thi của lớp học</h4>
                <Row>
                  {examsClassrom.length > 0 ? (
                    examsClassrom.map((exam) => (
                      <Col key={exam.exam_id} md={6} className="mb-3">
                        <Card>
                          <Card.Body>
                            <Card.Title>{exam.exam_name}</Card.Title>
                            {/* Điều hướng sang giao diện thi thử */}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {setSelectedExam(exam); setShowExamSimulation(true)}} // 🔹 Chọn bài thi trước khi điều hướng
                            >
                              Vào bài thi
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <p>📢 Chưa có bài thi nào được thêm vào lớp học.</p>
                  )}
                </Row>

              </>

            ) : (
              <>
                <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
                  + Thêm bài ôn luyện
                </Button>
                <Button variant="secondary" className="mb-3" onClick={() => setShowExamModal(true)}>
                  + Thêm bài thi đã tạo
                </Button>
                {/* Hiển thị các bài thi đã thêm vào lớp học */}
                <h4>Bài thi đã thêm vào lớp học</h4>
                <Row>
                  {examsClassrom.length > 0 ? (
                    examsClassrom.map((exam) => (
                      <Col key={exam.exam_id} md={6} className="mb-3">
                        <Card>
                          <Card.Body>
                            <Card.Title>{exam.exam_name}</Card.Title>
                            <Button variant="primary" onClick={() => hanldeShowExamStatistics(exam)}>📊 Thống kê điểm số</Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteExamFromClassroom(exam.exam_id)}
                            >
                              Xóa bài thi khỏi lớp học
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <p>📢 Chưa có bài thi nào được thêm vào lớp học.</p>
                  )}
                </Row>

                {/* Modal thêm bài ôn luyện */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Thêm bài ôn luyện</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group controlId="exerciseTitle">
                        <Form.Label>Tiêu đề bài ôn luyện</Form.Label>
                        <Form.Control
                          type="text"
                          value={exerciseTitle}
                          onChange={(e) => setExerciseTitle(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group controlId="exerciseContent">
                        <Form.Label>Nội dung bài ôn luyện</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={exerciseContent}
                          onChange={(e) => setExerciseContent(e.target.value)}
                        />
                      </Form.Group>

                      <Button variant="primary">Thêm bài ôn luyện</Button>
                    </Form>
                  </Modal.Body>
                </Modal>

                {/* Modal thêm bài thi đã tạo */}
                <Modal show={showExamModal} onHide={() => setShowExamModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Chọn bài thi đã tạo</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Row>
                      {Array.isArray(publicExams) && publicExams.length > 0 ? (
                        publicExams.map((exam) => (
                          <Col key={exam.exam_id} md={6} className="mb-3">
                            <Card>
                              <Card.Body>
                                <Card.Title>{exam.exam_name}</Card.Title>
                                <Button
                                  variant="primary"
                                  onClick={() => handleAddExamToClassroom(exam.exam_id)}
                                >
                                  Thêm vào lớp học
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <p>📢 Chưa có bài thi công khai nào.</p>
                      )}
                    </Row>
                  </Modal.Body>
                </Modal>
              </>
            )
          }
        </>
      )
      )}

    </div>
  );
};

export default ClassroomPractice;
