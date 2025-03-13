import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";

import ExamSimulation from "./ExamSimulation";
import ClassroomPractice from "./ClassroomPractice";




const HomePage = ({ userId, roleId }) => {
  const [selectedExam, setSelectedExam] = useState(null); // Chọn bài thi
  const [publicExams, setPublicExams] = useState([]); // Danh sách bài thi công khai
  const [publicClassrooms, setPublicClassrooms] = useState([]); // Danh sách lớp học công khai
  const [joinedClassrooms, setJoinedClassrooms] = useState({}); // Trạng thái tham gia lớp học
  const [selectedClassroom, setSelectedClassroom] = useState(null);//chọn lớp học
    
    const [showClassroom, setShowClassroom] = useState(false);//vào lớp học

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

  // Lấy danh sách lớp học công khai
  useEffect(() => {
    const fetchPublicClassrooms = async () => {
      try {
        const response = await axios.get("http://localhost/react_api/fetch_public_classrooms.php");
        setPublicClassrooms(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách Lớp học công khai!", error);
      }
    };
    fetchPublicClassrooms();
  }, []);

  // Kiểm tra xem học sinh đã tham gia vào lớp học nào chưa
  useEffect(() => {
    const fetchJoinedClassrooms = async () => {
      try {
        const response = await axios.get(`http://localhost/react_api/fetch_my_classrooms.php?user_id=${userId}`);
        if (Array.isArray(response.data)) {
          const joinedClassroomsMap = {};
          response.data.forEach((classroom) => {
            joinedClassroomsMap[classroom.classroom_id] = true;
          });
          setJoinedClassrooms(joinedClassroomsMap);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học đã tham gia!", error);
      }
    };

    if (userId) {
      fetchJoinedClassrooms();
    }
  }, [userId]);

  // Tham gia lớp học công khai
  const handleJoinClassroom = async (classroomId) => {
    if (!userId || !classroomId) {
      alert("Lỗi: Thiếu thông tin học sinh hoặc lớp học!");
      return;
    }

    try {
      const response = await axios.post("http://localhost/react_api/join_classroom.php", {
        student_id: userId,
        classroom_id: classroomId,
      });

      if (response.data.success) {
        alert("Bạn đã tham gia Lớp học thành công!");

        // Cập nhật trạng thái tham gia lớp học để đổi nút thành "Vào lớp học"
        setJoinedClassrooms((prev) => ({
          ...prev,
          [classroomId]: true,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tham gia Lớp học!", error);
      alert(error.response?.data?.error || "Không thể tham gia lớp học!");
    }
  };


  const handleEnterClassroom = (classroom) => {
    console.log("ID lớp truyền", classroom.classroom_id)
    setSelectedClassroom(classroom);
    setShowClassroom(true)
  }
  if (selectedExam) {
    return <ExamSimulation exam={selectedExam} studentId={userId} onBack={() => setSelectedExam(null)} />;
  }

  return (
    <div>
      {/* Hiển thị ClassroomPractice nếu showClassroomPractice là true */}
      {showClassroom ? (
        <ClassroomPractice classroomId={selectedClassroom.classroom_id} userId={userId} roleId={roleId} />
      ) : (
        <>
          {/* DANH SÁCH BÀI THI CÔNG KHAI */}
          <h2 className="mt-4">Bài thi công khai</h2>
          {publicExams.length === 0 ? (
            <p>Không có bài thi công khai.</p>
          ) : (
            <Row>
              {publicExams.map((exam) => (
                <Col key={exam.exam_id} md={4} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{exam.exam_name}</Card.Title>
                      <Card.Text>Thời gian làm bài: {exam.time_limit} phút</Card.Text>
                      <Button variant="primary" onClick={() => setSelectedExam(exam)}>
                        Vào bài thi
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* DANH SÁCH LỚP HỌC CÔNG KHAI */}
          <h2 className="mt-4">Lớp học công khai</h2>
          {publicClassrooms.length === 0 ? (
            <p>Không có lớp học công khai.</p>
          ) : (
            <Row>
              {publicClassrooms.map((classroom) => (
                <Col key={classroom.classroom_id} md={4} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{classroom.class_name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">Giáo viên: {classroom.teacher_name}</Card.Subtitle>
                      <Card.Text>Ngày tạo: {new Date(classroom.created_at).toLocaleString()}</Card.Text>

                      {/* Kiểm tra xem học sinh đã tham gia lớp học chưa */}
                      {joinedClassrooms[classroom.classroom_id] ? (
                        <Button variant="primary" onClick={() => handleEnterClassroom(classroom.classroom_id)}>
                          Vào lớp học
                        </Button>
                      ) : (
                        <Button variant="info" onClick={() => handleJoinClassroom(classroom.classroom_id)}>
                          Đăng ký Lớp học này
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
        )
      }

    </div>
  );
};

export default HomePage;
