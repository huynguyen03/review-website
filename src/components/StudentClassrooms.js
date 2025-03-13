import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import ClassroomPractice from "./ClassroomPractice";


const StudentClassrooms = ({ userId , roleId}) => {
  const [publicClassrooms, setPublicClassrooms] = useState([]); // Lớp học công khai
  const [enrolledClassrooms, setEnrolledClassrooms] = useState([]); // Lớp học đã tham gia
    const [selectedClassroom, setSelectedClassroom] = useState(null);//chọn lớp học
  
  const [showClassroom, setShowClassroom] = useState(false);//vào lớp học


  // Lấy danh sách Lớp học công khai
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

  // Lấy danh sách Lớp học mà sinh viên đã tham gia
  useEffect(() => {
    const fetchEnrolledClassrooms = async () => {
      try {
        const response = await axios.get(`http://localhost/react_api/fetch_my_classrooms.php?user_id=${userId}`);
        if (Array.isArray(response.data)) {
          setEnrolledClassrooms(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách Lớp học đã tham gia!", error);
      }
    };

    if (userId) {
      fetchEnrolledClassrooms();
    }
  }, [userId]);

  // Tham gia lớp học công khai
  const handleJoinClassroom = async (classroomId) => {
    console.log("id người dùng và id lớp học muốn đk", userId, classroomId)

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

        // Cập nhật danh sách lớp học đã tham gia để đổi nút thành "Vào Lớp học"
        const joinedClass = publicClassrooms.find((c) => c.classroom_id === classroomId);
        setEnrolledClassrooms((prev) => [...prev, joinedClass]);

        // Loại bỏ lớp học khỏi danh sách công khai
        setPublicClassrooms((prev) => prev.filter((c) => c.classroom_id !== classroomId));
      }
    } catch (error) {
      console.error("Lỗi khi tham gia Lớp học!", error);
      alert(error.response?.data?.error || "Không thể tham gia lớp học!");
    }
  };

  // Vào lớp học (chuyển trang)
  const handleEnterClassroom = (classroom) => {
    console.log("ID lớp truyền", classroom.classroom_id)
    setSelectedClassroom(classroom);
    setShowClassroom(true)
  }

  return (
    <div>
      {/* Hiển thị ClassroomPractice nếu showClassroomPractice là true */}
      {showClassroom ? (
        <ClassroomPractice classroomId={selectedClassroom.classroom_id} userId={userId} roleId={roleId}/>
      ) : (

        <>
        <h2>Lớp học của tôi</h2>

      <Row>
        {enrolledClassrooms.length === 0 ? (
          <p>Bạn chưa tham gia lớp học nào.</p>
        ) : (
          enrolledClassrooms.map((classroom) => (
            <Col key={classroom.classroom_id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{classroom.class_name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Giáo viên: {classroom.teacher_name}</Card.Subtitle>
                  <Card.Text>Ngày tham gia: {new Date(classroom.enrolled_at).toLocaleString()}</Card.Text>
                  <Button variant="primary" onClick={() => { handleEnterClassroom(classroom) }}>
                    Vào Lớp học
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <h2 className="mt-4">Lớp học công khai</h2>

      {/* Danh sách Lớp học công khai */}
      <Row>
        {publicClassrooms.length === 0 ? (
          <p>Không có lớp học công khai.</p>
        ) : (
          publicClassrooms.map((classroom) => (
            <Col key={classroom.classroom_id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{classroom.class_name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Giáo viên: {classroom.teacher_name}</Card.Subtitle>
                  <Card.Text>Ngày tạo: {new Date(classroom.created_at).toLocaleString()}</Card.Text>
                  <Button variant="info" onClick={() => handleJoinClassroom(classroom.classroom_id)}>
                    Đăng ký Lớp học này
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      </>
  )}
    </div>
  )
}
  export default StudentClassrooms;
