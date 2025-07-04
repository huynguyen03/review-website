import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Row, Col, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import ClassroomPractice from "./ClassroomPractice"
import defaultClassroomImage from "../assets/images/defaut-classrooms.png";
import defaultAvtteacher from "../assets/images/avatar-defaut-teacher.png";


const ManageClassrooms = ({ teacherId, roleId }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [className, setClassName] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showClassroom, setShowClassroom] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [members, setMembers] = useState([]);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  // ✅ Lấy danh sách lớp học
  const fetchClassrooms = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await axios.get(`${apiUrl}/fetch_my_classrooms.php?user_id=${teacherId}`);
      setClassrooms(response.data);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách lớp học:", error);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // ✅ Lấy danh sách thành viên của lớp
  const fetchMembers = async (classroomId) => {
    try {
      const response = await axios.get(`${apiUrl}/fetch_members.php?classroom_id=${classroomId}`);
      setMembers(response.data);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách thành viên:", error);
    }
  };

  const handleEnterClassroom = (classroom) => {
    console.log("ID lớp truyền", classroom.classroom_id)
    setSelectedClassroom(classroom);
    setShowClassroom(true);
    setShowDetails(false)
  }

  // ✅ Xử lý chọn lớp học
  const handleManageClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    setClassName(classroom.class_name);
    setRegistrationPassword(classroom.registration_password || "");
    setShowDetails(true);
    fetchMembers(classroom.classroom_id);
  };

  // ✅ Xử lý cập nhật lớp học
  const handleUpdateClass = async () => {
    // if (!selectedClassroom) return;

    try {
      await axios.post(`${apiUrl}/update_classroom.php`, {
        classroom_id: selectedClassroom.classroom_id,
        class_name: className,
        registration_password: registrationPassword,
      });

      setClassrooms((prev) =>
        prev.map((cls) =>
          cls.classroom_id === selectedClassroom.classroom_id
            ? { ...cls, class_name: className, registration_password: registrationPassword }
            : cls
        )
      );

      setShowDetails(false);
      alert("✅ Thông tin lớp học đã được cập nhật!");
    } catch (error) {
      console.error("❌ Lỗi cập nhật lớp học:", error);
    }
  };

  // ✅ Xử lý tạo lớp học
  const handleCreateClass = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!className || !teacherId) {
      alert("Vui lòng nhập đầy đủ tên lớp học và mã giảng viên.");
      return;
    }

    try {
      // Gửi yêu cầu tạo lớp học
      const response = await axios.post(`${apiUrl}/create_classroom.php`, {
        class_name: className,
        teacher_id: teacherId,
      });

      const newClassroom = response.data;

      // Cập nhật danh sách lớp học
      setClassrooms((prev) => [...prev, newClassroom]);

      setClassName(""); // Reset lại tên lớp
      alert("✅ Lớp học đã được tạo thành công!");
    } catch (error) {
      console.error("❌ Lỗi tạo lớp học:", error);
    }
  };

  // ✅ Xử lý xóa thành viên
  const handleKickMember = async (studentId) => {
    try {
      await axios.post(`${apiUrl}/kick_members.php`, {
        classroom_id: selectedClassroom.classroom_id,
        student_id: studentId,
      });

      setMembers((prev) => prev.filter((member) => member.student_id !== studentId));
      alert("✅ Đã xóa thành viên khỏi lớp học.");
    } catch (error) {
      console.error("❌ Lỗi xóa thành viên:", error);
    }
  };

  // ✅ Xử lý quay lại danh sách lớp
  const handleBackToList = () => {
    setSelectedClassroom(null);
    setShowDetails(false);
  };

  return (
    <div className="">



      {/* Danh sách lớp học */}
      {!showDetails && !showClassroom && (
        <div>
          <div className="content-container">
            <h2>Quản lý lớp học</h2>
            <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
              + Tạo lớp học mới
            </Button>
          </div>
          <div className="content-container">

          <h2 className="title">Lớp học của tôi</h2>
          <Row className="mb-4">
            {classrooms.map((classroom) => (
              <Col key={classroom.classroom_id} md={4} className="mb-3">
                <Card style={{ cursor: "pointer" }}>
                  <div
                    className="card-image">

                    <Card.Img
                      className="card-classroom-img-top"
                      variant="top"
                      src={classroom.image_url || defaultClassroomImage}
                    />
                  </div>
                  <img
                    src={classroom.teacher_image_url || defaultAvtteacher}

                    alt="Teacher Avatar"
                    className="teacher-avatar position-absolute"
                  />

                  <Card.Body>
                    <div class="tag-classroom">Lớp học</div>
                    <Card.Title>{classroom.class_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Giáo viên: {classroom.teacher_name}
                    </Card.Subtitle>
                    <Card.Text>Ngày tạo: {new Date(classroom.created_at).toLocaleString()}</Card.Text>
                    <Card.Text className="text-muted">Số thành viên: {classroom.members_count}</Card.Text>
                      <div className="w-100">

                    <Button className="w-100 mb-2" variant="primary" onClick={() => { handleEnterClassroom(classroom); navigate(`/teacher?section=manage_classrooms&sub=classroom`) }}>
                      Vào Lớp học
                    </Button>
                    <Button className="w-100 " variant="warning" onClick={() => handleManageClassroom(classroom)}>
                      Quản lý thành viên & Chỉnh sửa lớp
                    </Button>
                      </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        </div>
      )}
      {/* Hiển thị ClassroomPractice nếu showClassroomPractice là true */}
      {showClassroom && <ClassroomPractice classroomId={selectedClassroom.classroom_id} userId={teacherId} roleId={roleId} />}

      {/* Chi tiết lớp học */}
      {showDetails && selectedClassroom && (
        <div className="mt-4">
          <h3>Chi tiết lớp học</h3>
          <Form>
            <Form.Group controlId="className">
              <Form.Label>Tên lớp học</Form.Label>
              <Form.Control
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="registrationPassword">
              <Form.Label>Mật khẩu đăng ký</Form.Label>
              <Form.Control
                type="password"
                value={registrationPassword}
                onChange={(e) => setRegistrationPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="success" onClick={handleUpdateClass}>
              Lưu thay đổi
            </Button>
          </Form>

          {/* Danh sách thành viên */}
          <div className="mt-4">
            <h4>Danh sách thành viên</h4>
            {members.length > 0 ? (
              <ul>
                {members.map((member) => (
                  <li key={member.student_id}>
                    {member.fullname} - Đăng ký vào: {new Date(member.enrollment_date).toLocaleString()}
                    <Button variant="danger" onClick={() => handleKickMember(member.student_id)} className="ml-2">
                      Xóa
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>📢 Lớp này chưa có thành viên nào.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal tạo lớp học */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo lớp học mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="className">
              <Form.Label>Tên lớp học</Form.Label>
              <Form.Control
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Mật khẩu (nếu có)</Form.Label>
              <Form.Control
                type="password"
                value={registrationPassword}
                onChange={(e) => setRegistrationPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={() => handleCreateClass()}>
              Tạo lớp
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageClassrooms;
