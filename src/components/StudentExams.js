import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentExams = ({ studentId }) => {
  const [publicExams, setPublicExams] = useState([]); // Bài thi công khai
  const [enrolledExams, setEnrolledExams] = useState([]); // Bài thi đã tham gia
  const navigate = useNavigate();

  // Lấy danh sách bài thi công khai
  useEffect(() => {
    const fetchPublicExams = async () => {
      try {
        const response = await axios.get("http://localhost/react_api/fetch_public_exams.php");
        setPublicExams(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi công khai!", error);
      }
    };
    fetchPublicExams();
  }, []);

  // Lấy danh sách bài thi mà sinh viên đã tham gia
  useEffect(() => {
    const fetchEnrolledExams = async () => {
      try {
        const response = await axios.get(`http://localhost/react_api/fetch_completed_exams.php?user_id=${studentId}`);
        if (Array.isArray(response.data)) {
          setEnrolledExams(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi đã tham gia!", error);
      }
    };

    if (studentId) {
      fetchEnrolledExams();
    }
  }, [studentId]);

  // Tham gia bài thi công khai
  const handleJoinExam = async (examId) => {
    if (!studentId || !examId) {
      alert("Lỗi: Thiếu thông tin học sinh hoặc bài thi!");
      return;
    }

    try {
      const response = await axios.post("http://localhost/react_api/join_exam.php", {
        student_id: studentId,
        exam_id: examId,
      });

      if (response.data.success) {
        alert("Bạn đã đăng ký bài thi thành công!");

        // Cập nhật danh sách bài thi đã tham gia để đổi nút thành "Vào bài thi"
        const joinedExam = publicExams.find((exam) => exam.exam_id === examId);
        setEnrolledExams((prev) => [...prev, joinedExam]);

        // Loại bỏ bài thi khỏi danh sách công khai
        setPublicExams((prev) => prev.filter((exam) => exam.exam_id !== examId));
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký bài thi!", error);
      alert(error.response?.data?.error || "Không thể đăng ký bài thi!");
    }
  };

  // Vào bài thi (chuyển trang)
  const handleEnterExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div>
      <h2>Bài thi công khai</h2>

      {/* Danh sách bài thi công khai */}
      <Row>
        {publicExams.length === 0 ? (
          <p>Không có bài thi công khai.</p>
        ) : (
          publicExams.map((exam) => (
            <Col key={exam.exam_id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{exam.exam_name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Thời gian: {exam.time_limit} phút</Card.Subtitle>
                  <Card.Text>Ngày tạo: {new Date(exam.created_at).toLocaleString()}</Card.Text>
                  <Button variant="info" onClick={() => handleJoinExam(exam.exam_id)}>
                    Đăng ký bài thi
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <h2 className="mt-4">Bài thi của tôi</h2>

      {/* Danh sách bài thi đã tham gia */}
      <Row>
        {enrolledExams.length === 0 ? (
          <p>Bạn chưa tham gia bài thi nào.</p>
        ) : (
          enrolledExams.map((exam) => (
            <Col key={exam.exam_id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{exam.exam_name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Thời gian: {exam.time_limit} phút</Card.Subtitle>
                  <Card.Text>Ngày tham gia: {new Date(exam.enrolled_at).toLocaleString()}</Card.Text>
                  <Button variant="primary" onClick={() => handleEnterExam(exam.exam_id)}>
                    Vào bài thi
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default StudentExams;
