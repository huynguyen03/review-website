import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"; // Biểu tượng mũi tên
import ClassroomPractice from "./ClassroomPractice";
import defaultExamImage from "../assets/images/logo/logo_transparent_blue.png";
import defaultClassroomImage from "../assets/images/defaut-classrooms.png";

import defaultAvtteacher from "../assets/images/avatar-defaut-teacher.png";

import { useSearch } from "./SearchContext"; // Import hook sử dụng tìm kiếm

import "../assets/styles/ExamCard.css"

const HomePage = ({ userId, roleId }) => {
  const [selectedExam, setSelectedExam] = useState(null); // Chọn bài thi
  const [publicExams, setPublicExams] = useState([]); // Danh sách bài thi công khai
  const [publicClassrooms, setPublicClassrooms] = useState([]); // Danh sách lớp học công khai
  const [joinedClassrooms, setJoinedClassrooms] = useState({}); // Trạng thái tham gia lớp học
  const [selectedClassroom, setSelectedClassroom] = useState(null); // Chọn lớp học
  const [showClassroom, setShowClassroom] = useState(false); // Vào lớp học
  const { searchQuery } = useSearch(); // Lấy dữ liệu tìm kiếm từ context
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();

  const nameRole = roleId === "1" ? "teacher" : "users";
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

  // Lấy danh sách lớp học công khai
  useEffect(() => {
    const fetchPublicClassrooms = async () => {
      try {
        const response = await axios.get(`${apiUrl}/fetch_public_classrooms.php`);
        console.log("Dữ liệu nhận về lớp học công khai: ", response)
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
        const response = await axios.get(`${apiUrl}/fetch_my_classrooms.php?user_id=${userId}`);
        if (Array.isArray(response.data)) {
          const joinedClassroomsMap = {};
          response.data.forEach((classroom) => {
            joinedClassroomsMap[classroom.classroom_id] = true;
          });
          setJoinedClassrooms(joinedClassroomsMap);
        }
        console.log("Lớp học bạn đã tham gia: ", joinedClassrooms)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học đã tham gia!", error);
      }
    };

    if (userId) {
      fetchJoinedClassrooms();
    }
  }, [userId]);


  // Lọc các bài thi dựa trên từ khóa tìm kiếm
  const filteredExams = publicExams.filter((exam) =>
    exam.exam_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClassrooms = publicClassrooms.filter((classroom) =>
    classroom.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Tham gia lớp học công khai
  const handleJoinClassroom = async (classroomId) => {
    if (!userId || !classroomId) {
      alert("Lỗi: Thiếu thông tin học sinh hoặc lớp học!");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/join_classroom.php`, {
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
    navigate(`/${nameRole}?section=my_classrooms&sub=exam_in_classroom&classroom_id=${classroom.classroom_id}`)
    
  };



  const handleStartExam = (selectedExam) => {
    // Lưu dữ liệu bài thi vào localStorage
    localStorage.setItem('currentExam', JSON.stringify(selectedExam));
    localStorage.setItem('userId', userId);
    // Điều hướng đến trang bài thi
    navigate(`/${nameRole}?section=exam&sub=taking_exam&exam_id=${selectedExam.exam_id}`);
  }


  return (
    <div>
      {/* Hiển thị ClassroomPractice nếu showClassroom là true */}
      
        <>
          {/* DANH SÁCH BÀI THI CÔNG KHAI */}
          <h2 className="mt-4 title">Bài thi công khai</h2>
          {filteredExams.length === 0 ? (
            <p>Không tìm thấy bài thi.</p>
          ) : (
            <>
              <Row className="mb-4">
                {filteredExams.slice(0, 3).map((exam) => (
                  <Col key={exam.exam_id} md={4} className="mb-3">
                    <Card className="exam-card shadow-lg">
                      <Card.Img variant="top" src={exam.image_url || defaultExamImage} className="card-image" />
                      <Card.Body>
                        <Card.Title>{exam.exam_name}</Card.Title>
                        <Card.Text>Thời gian làm bài: {exam.time_limit} phút</Card.Text>

                        <div className="d-flex justify-content-between">
                          <div className="rating">
                            <span className="text-warning">{`★ ${exam.rating}`}</span>
                          </div>
                            
                          <Button variant="primary" onClick={() =>  handleStartExam(exam)}>
                            Vào thi
                          </Button>
                        </div>
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
          )}
      {/* DANH SÁCH LỚP HỌC CÔNG KHAI */}
      <h2 className="mt-4 title">Lớp học công khai</h2>
      {filteredClassrooms.length === 0 ? (
        <p>Không tìm thấy lớp học.</p>
      ) : (
        <>
          <Row className="mb-4">
            {filteredClassrooms.slice(0, 3).map((classroom) => (
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
                  <div className="tag-classroom">Lớp học</div>

                    <Card.Title>{classroom.class_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Giáo viên: {classroom.fullname}</Card.Subtitle>
                    <Card.Text>Ngày tạo: {new Date(classroom.created_at).toLocaleString()}</Card.Text>
                    {/* Hiển thị số thành viên */}
                    <Card.Text className="text-muted">Số thành viên: {classroom.members_count}</Card.Text>

                    {joinedClassrooms[classroom.classroom_id] ? (
                      <Button variant="primary" onClick={() => handleEnterClassroom(classroom)}>
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

          <div className="text-center">
            <Button variant="link" className="text-muted">
              <FontAwesomeIcon icon={faArrowDown} /> Xem thêm bài thi
            </Button>
          </div>
        </>
      )}
        </>

      



    </div>
  );
};

export default HomePage;
