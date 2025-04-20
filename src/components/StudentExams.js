import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import defaultExamImage from "../assets/images/logo/logo_transparent_blue.png";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"; // Biểu tượng mũi tên



const StudentExams = ({ userId }) => {
  const [currentExam, setCurrentExam] = useState(null);
  const [enrolledExams, setEnrolledExams] = useState([]); // Bài thi đã tham gia
  const [examResults, setExamResults] = useState([]);
    const [visibleExams, setVisibleExams] = useState(6); // số bài thi hiển thị ban đầu
  
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();

  const nameRole = userId === "1" ? "teacher" : "users";
  useEffect(() => {
    const savedExam = localStorage.getItem("currentExam");
    if (savedExam) {
      try {
        setCurrentExam(JSON.parse(savedExam));
      } catch (e) {
        console.error("Không đọc được dữ liệu currentExam:", e);
      }
    }
  }, []);

  // Lấy danh sách bài thi công khai


  // Lấy danh sách bài thi mà sinh viên đã tham gia
  useEffect(() => {
    const fetchEnrolledExams = async () => {
      try {
        const response = await axios.get(`${apiUrl}/fetch_completed_exams.php?user_id=${userId}`);
        if (Array.isArray(response.data)) {
          setEnrolledExams(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi đã tham gia!", error);
      }
    };

    if (userId) {
      fetchEnrolledExams();
    }
  }, [userId]);


  const handleLoadExamMore = () => {
    setVisibleExams(prev => prev + 6); // mỗi lần nhấn hiển thị thêm 3 bài
  };

  const handleStartExam = (selectedExam) => {
    // Lưu dữ liệu bài thi vào localStorage
    localStorage.setItem('currentExam', JSON.stringify(selectedExam));

    localStorage.setItem('userId', userId);
    // Điều hướng đến trang bài thi
    navigate(`/${nameRole}?section=exam&sub=taking_exam&exam_id=${selectedExam.exam_id}`);
  }


  const handleViewResult = async (examId) => {
    try {
      const response = await axios.get(`${apiUrl}/fetch_exam_results.php?exam_id=${examId}&user_id=${userId}`);
      setExamResults(response.data); // Lưu kết quả bài thi vào state
      // Sau đó, có thể điều hướng người dùng tới trang kết quả
      navigate(`/${nameRole}?section=exam&sub=statistic&exam_id=${examId}`);
    } catch (error) {
      console.error("Lỗi khi lấy kết quả bài thi", error);
    }
  };
  return (
    <div>

      {currentExam && (
        <div className="bg-warning p-4 rounded shadow mb-4">
          <h2 className="h5 title">Bạn đang làm dở một bài thi</h2>
          <p><strong>{currentExam.exam_name}</strong></p>
          <p>Thời gian làm bài: {currentExam.time_limit} phút</p>
          <Button
            variant="primary"
            onClick={() => handleStartExam(currentExam)}
          >
            Tiếp tục thi
          </Button>
        </div>
      )}

      {/* DANH SÁCH BÀI THI SSAX LÀM */}
      <h2 className="mt-4 title">Bài thi đã làm</h2>
      {enrolledExams.length === 0 ? (
        <p>Không có bài thi nào đã được làm.</p>
      ) : (
        <>
          <Row className="mb-4">
            {enrolledExams.slice(0, visibleExams).map((exam) => (
              <Col key={exam.exam_id} md={4} className="mb-3">
                <Card className="exam-card shadow-lg">
                  <Card.Img variant="top" src={exam.image_url || defaultExamImage} className="card-image" />
                  <Card.Body>
                  <div class="tag-exam">Bài thi</div>
                    <Card.Title>{exam.exam_name}</Card.Title>
                    <Card.Text>Thời gian làm bài: {exam.time_limit} phút</Card.Text>

                    <div className="d-flex justify-content-between">
                      <div className="rating">
                        <span className="text-warning">{`${exam.rating || 0}★ ${exam.rating === undefined ? '(0 đánh giá)' : ""}`}</span>
                      </div>
                    </div>
                      {/* Thêm các nút nằm dưới */}
          <div className="d-flex justify-content-between flex-column mt-3">
            <Button
              variant="primary"
              className="w-100 mb-2"
              onClick={() => handleViewResult(exam.exam_id)}
            >
              Xem thống kê kết quả
            </Button>
            <Button
              variant="primary"
              className="w-12"
              onClick={() => handleStartExam(exam)}
            >
              Vào thi lại
            </Button>
          </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {visibleExams < enrolledExams.length && (
                  <div className="text-center">
                    <Button variant="link" className="text-muted" onClick={handleLoadExamMore}>
                      <FontAwesomeIcon icon={faArrowDown} /> Xem thêm bài thi
                    </Button>
                  </div>
                )}
        </>
      )}
    </div>

  );


};

export default StudentExams;
