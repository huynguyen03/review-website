import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import useNavigate từ React Router
import "../assets/styles/LearningProcess.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'; // Import biểu tượng fa-arrow-right

const LearningProcessStudent = ({ classroomId, userId, roleId }) => {
  const [learningProcess, setLearningProcess] = useState(null);
  const [exams, setExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate(); // Khởi tạo hook useNavigate để điều hướng trang

  const nameRole = roleId === "1" ? "teacher" : "users";

  useEffect(() => {
    if (classroomId && userId) {
      fetchLearningProcess();
      fetchCompletedExams(); // Lấy thông tin các bài thi đã hoàn thành
    }
  }, [classroomId, userId]);

  // Hàm gọi API để lấy tiến trình học
  const fetchLearningProcess = async () => {
    try {
      const data = {
        user_id: userId,
        classroom_id: classroomId,
        role_id: roleId,
      };

      const response = await fetch(`${apiUrl}/fetch_learning_processes.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi lấy thông tin tiến trình học");
      }

      const responseData = await response.json();
      setLearningProcess(responseData);
      console.log("Tiến trình lấy từ CSDL", responseData);
      fetchExams(responseData.process_id);
    } catch (error) {
      console.error("Lỗi khi gọi API với fetch:", error);
    }
  };

  // Hàm gọi API để lấy bài thi trong tiến trình
  const fetchExams = async (processId) => {
    try {
      const response = await axios.get(`${apiUrl}/fetch_exam_learning_process.php`, {
        params: {
          process_id: processId,
        },
      });
      console.log("bài thi nhận về data: ", response.data);

      if (response && response.data) {
        console.log("bài thi nhận về exam: ", response.data);
        const sortedExams = response.data.sort((a, b) => a.order_in_process - b.order_in_process);
        setExams(sortedExams); // Lưu bài thi vào state exams
      } else {
        setExams([]); // Nếu không có bài thi, đặt mảng exams là rỗng
      }
    } catch (error) {
      console.error("Lỗi khi lấy bài thi từ API", error);
    }
  };

  // Hàm gọi API để lấy bài thi đã hoàn thành
  const fetchCompletedExams = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/fetch_completed_exams.php?user_id=${userId}&classroom_id=${classroomId}`
      );
      setCompletedExams(response.data.completedExams || []);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bài thi đã hoàn thành", error);
    }
  };

  const isExamUnlocked = (examOrder) => {
    // Nếu bài thi là bài thi đầu tiên, thì luôn mở khóa
    if (examOrder === 1) {
      return true;
    }
    // Nếu bài thi có thứ tự lớn hơn 1, kiểm tra số bài thi đã hoàn thành
    return completedExams.length >= examOrder - 1;
  };

  // Hàm điều hướng đến bài thi khi nhấn "Làm bài"
  const handleStartExam = (selectedExam) => {
    // Lưu dữ liệu bài thi vào localStorage
    localStorage.setItem('currentExam', JSON.stringify(selectedExam));

    localStorage.setItem('userId', userId);
    // Điều hướng đến trang bài thi
    navigate(`/${nameRole}?section=exam&sub=taking_exam&exam_id=${selectedExam.exam_id}`);
  }

  return (
    <div className="custom-learning-process">
      <h2 className="title">Tiến trình ôn luyện</h2>
      {learningProcess ? (
        <>
          {/* Hiển thị các bài thi trong tiến trình */}
          <div className="custom-exam-wrapper">
            <div className="custom-exam-container">
              {exams.length > 0 ? (
                exams.map((exam) => {
                  const isUnlocked = isExamUnlocked(exam.order_in_process); // Kiểm tra bài thi có mở khóa không
                  return (
                    <div
                      key={exam.exam_id}
                      className={`custom-exam-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <Card className="shadow-lg">
                        <Card.Body>
                          <Card.Title>{exam.exam_name}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            Tỷ lệ đạt được: {exam.rate}%
                          </Card.Subtitle>
                          <Button
                            variant={isUnlocked ? "primary" : "secondary"} // Nút bật nếu bài thi đã mở khóa
                            size="lg"
                            block
                            disabled={!isUnlocked} // Nếu bài thi chưa mở khóa, không cho phép nhấn
                            onClick={() => handleStartExam(exam)} // Điều hướng đến bài thi
                          >
                            Vào bài thi
                          </Button>
                        </Card.Body>
                      </Card>
                      {/* <FontAwesomeIcon icon={faArrowRight} /> */}
                    </div>
                  );
                })
              ) : (
                <p>Không có bài thi trong tiến trình này.</p>
              )}
            </div>
          </div>

          {/* Thông tin chi tiết tiến trình */}
          <div className="process-info">
            <h5>Thông tin tiến trình</h5>
            <p>{learningProcess.process_description}</p>
          </div>
        </>
      ) : (
        <p>Đang tải thông tin tiến trình...</p>
      )}
    </div>
  );
};

export default LearningProcessStudent;
