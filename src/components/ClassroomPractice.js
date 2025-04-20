import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, Row, Col, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import defaultExamImage from "../assets/images/logo/logo_transparent_blue.png";

import LearningProcessStudent from "./LearningProcessStudent";
import LearningProcess from "./LearningProcess";


import ExamStatistics from "./ExamStatistics";

import "../assets/styles/ExamCard.css"

const ClassroomPractice = ({ classroomId, userId, roleId }) => {
  const [publicExams, setPublicExams] = useState([]); // Danh sách bài thi đã tạo
  const [examsClassrom, setExamsClassrom] = useState([]); // Danh sách bài thi đã thêm vào lớp học
  const [showModalLearnningProcess, setShowModalLearnningProcess] = useState(false);
  const [showExamSimulation, setShowExamSimulation] = useState(false);
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseContent, setExerciseContent] = useState("");
  const [showExamModal, setShowExamModal] = useState(false); // Modal hiển thị bài thi đã tạo
  const [selectedExam, setSelectedExam] = useState(null); // 🔹 Lưu bài thi được chọn
  const [showStats, setShowStats] = useState(false);// quản lý hiển thị thống kê điểm số
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const nameRole = roleId === "1" ? "teacher" : "users";

  // Fetch danh sách bài thi đã tạo từ API
  const fetchPublicExams = useCallback(async () => {
    setLoading(true)
    try {

      const response = await fetch(
        `${apiUrl}/fetch_completed_exams.php?user_id=${userId}`
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
        `${apiUrl}/fetch_classroom_exams.php?classroom_id=${classroomId}`
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
      await axios.post(`${apiUrl}/add_exam_to_classroom.php`, {
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
      await axios.post(`${apiUrl}/delete_exam_from_classroom.php`, {
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

  const hanldeShowLearnningProcess = () => {
    console.log("Đã chọn tọa tiến trình bài thi");
    setShowModalLearnningProcess(true)

  }
  const handleStartExam = (selectedExam) => {
    // Lưu dữ liệu bài thi vào localStorage
    localStorage.setItem('currentExam', JSON.stringify(selectedExam));
    localStorage.setItem('userId', userId);
    // Điều hướng đến trang bài thi
    navigate(`/${nameRole}?section=exam&sub=taking_exam&exam_id=${selectedExam.exam_id}`);
  }
  return (
    <div className="">
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (showStats ? (
        <ExamStatistics userId={userId} examId={selectedExam.exam_id} onClose={() => setShowStats(false)} />

      ) : (

        <>
          {
            roleId === "2" ? (
              <>
                <h4 className="title">Bài thi của lớp học</h4>
                <Row className="mb-4">
                  {examsClassrom.length > 0 ? (
                    examsClassrom.map((exam) => (

                      <Col key={exam.exam_id} md={4} className="mb-3">
                        <Card className="exam-card shadow-lg">
                          <Card.Img variant="top" src={exam.image_url || defaultExamImage} className="card-image" />
                          <Card.Body>
                            <div class="tag-exam">Bài thi</div>

                            <Card.Title>{exam.exam_name}</Card.Title>
                            <Card.Text>Thời gian làm bài: {exam.time_limit} phút</Card.Text>

                            <div className="d-flex justify-content-between">
                              <div className="rating">
                                <span className="text-warning">{`★ ${exam.rating}`}</span>
                              </div>

                              <Button variant="primary" onClick={() => { setSelectedExam(exam); handleStartExam(exam) }}>
                                Vào thi
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                    ))
                  ) : (
                    <p>📢 Chưa có bài thi nào được thêm vào lớp học.</p>
                  )}


                  <LearningProcessStudent classroomId={classroomId} userId={userId} roleId={roleId} />
                </Row>

              </>

            ) : (
              <div style={{ marfin_bottom: "32px" }}>

                {/* Hiển thị các bài thi đã thêm vào lớp học */}
                <h3 className='h3-header title'>Thêm bài thi vào lớp học</h3>
                <div className='d-flex gap-2 '>
                  <h4>Bài thi đã thêm vào lớp học</h4>
                  <Button variant="secondary" className="mb-3" onClick={() => setShowExamModal(true)}>
                    + Thêm bài thi đã tạo
                  </Button>
                </div>
                <Row className="mb-4">
                  {examsClassrom.length > 0 ? (
                    examsClassrom.map((exam) => (
                      <Col key={exam.exam_id} md={3} className="mb-3">
                        <Card className="exam-card shadow-lg">
                          <Card.Img variant="top" src={exam.image_url || defaultExamImage} className="card-image" />
                          <Card.Body>
                            <div class="tag-exam">Bài thi</div>


                            <Card.Title>{exam.exam_name}</Card.Title>
                            <div className="d-flex justify-content-between flex-column">

                              <Button className="px-3" variant="primary" onClick={() => hanldeShowExamStatistics(exam)}>📊 Thống kê điểm số</Button>
                              <Button
                                variant="danger"
                                onClick={() => handleDeleteExamFromClassroom(exam.exam_id)}
                              >
                                Gỡ bài thi
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <p>📢 Chưa có bài thi nào được thêm vào lớp học.</p>
                  )}
                </Row>

                {/* Hiển thị LearningProcess khi showLearningProcess là true */}

                {/* <LearningProcess userId={userId} roleId={roleId}/> */}


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
              </div>
            )
          }
        </>
      )
      )}

    </div>
  );
};

export default ClassroomPractice;
