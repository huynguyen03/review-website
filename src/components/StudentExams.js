import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";

import ExamSimulation from "./ExamSimulation";



const StudentExams = ({ userId }) => {
    const [selectedExam, setSelectedExam] = useState(null); // Chọn bài thi
  
  const [publicExams, setPublicExams] = useState([]); // Bài thi công khai
  const [enrolledExams, setEnrolledExams] = useState([]); // Bài thi đã tham gia
  const apiUrl = process.env.REACT_APP_API_BASE_URL;


  // Lấy danh sách bài thi công khai
  useEffect(() => {
    const fetchPublicExams = async () => {
      try {
        const response = await axios.get(`${apiUrl}/fetch_public_exams.php`);
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


  if (selectedExam) {
    return <ExamSimulation exam={selectedExam} studentId={userId} onBack={() => setSelectedExam(null)} />;
  }
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
                  <Button variant="info" onClick={() => setSelectedExam(exam)}>
                    Vào bài thi
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
                  <Button variant="primary" onClick={() => setSelectedExam(exam)}>
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
