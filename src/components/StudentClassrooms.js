import React, { useState, useEffect } from "react";
import  { useNavigate } from "react-router-dom";

import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"; // Biểu tượng mũi tên
import defaultExamImage from "../assets/images/logo/logo_transparent_blue.png";
import defaultClassroomImage from "../assets/images/defaut-classrooms.png";

import defaultAvtteacher from "../assets/images/avatar-defaut-teacher.png";
import ClassroomPractice from "./ClassroomPractice";


const StudentClassrooms = ({ userId, roleId }) => {
  const [enrolledClassrooms, setEnrolledClassrooms] = useState([]); // Lớp học đã tham gia
  const [selectedClassroom, setSelectedClassroom] = useState(null);//chọn lớp học

  const [showClassroom, setShowClassroom] = useState(false);//vào lớp học
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const nameRole = roleId === "1" ? "teacher" : "users";


  // Lấy danh sách Lớp học mà sinh viên đã tham gia
  useEffect(() => {
    const fetchEnrolledClassrooms = async () => {
      try {
        const response = await axios.get(`${apiUrl}/fetch_my_classrooms.php?user_id=${userId}`);
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



  // Vào lớp học (chuyển trang)
  const handleEnterClassroom = (classroom) => {
    console.log("ID lớp truyền", classroom.classroom_id);
    navigate(`/${nameRole}?section=my_classrooms&sub=exam_in_classroom&classroom_id=${classroom.classroom_id}`)
    
    
  }



  return (
    <div>
      {/* Hiển thị ClassroomPractice nếu showClassroomPractice là true */}
      

        <>
          <h2 className="title">Lớp học của tôi</h2>
          <Row className="mb-4">
            {enrolledClassrooms.slice(0, 3).map((classroom) => (
              <Col key={classroom.classroom_id} md={4} className="mb-3">
                <Card className="exam-card shadow-lg position-relative">
                  <div
                    className="card-image">

                    <Card.Img
                      variant="top"
                      src={classroom.image_url || defaultClassroomImage}
                    />
                  </div>
                  {/* Thêm ảnh đại diện giáo viên */}
                  <img
                    src={classroom.teacher_image_url || defaultAvtteacher}

                    alt="Teacher Avatar"
                    className="teacher-avatar position-absolute"
                  />
                  <Card.Body>
                  <div class="tag-classroom">Lớp học</div>
                    <Card.Title>{classroom.class_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Giáo viên: {classroom.teacher_name}</Card.Subtitle>
                    <Card.Text>Ngày tạo: {new Date(classroom.created_at).toLocaleString()}</Card.Text>
                    {/* Hiển thị số thành viên */}
                    <Card.Text className="text-muted">Số thành viên: {classroom.members_count}</Card.Text>

                    {
                      <Button variant="primary" onClick={() => handleEnterClassroom(classroom)}>
                        Vào lớp học
                      </Button>
                    }
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center">
            <Button variant="link" className="text-muted">
              <FontAwesomeIcon icon={faArrowDown} /> Xem thêm bài thi
            </Button>
          </div>
        </>
      
    </div>
  )
}
export default StudentClassrooms;
