import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Row, Col, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import ClassroomPractice from "./ClassroomPractice"

const ManageClassrooms = ({ teacherId, roleId }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [className, setClassName] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showClassroom, setShowClassroom] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [members, setMembers] = useState([]);

  const navigate = useNavigate();
  // ✅ Lấy danh sách lớp học
  const fetchClassrooms = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await axios.get(`http://localhost/react_api/fetch_my_classrooms.php?user_id=${teacherId}`);
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
      const response = await axios.get(`http://localhost/react_api/fetch_members.php?classroom_id=${classroomId}`);
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
      await axios.post(`http://localhost/react_api/update_classroom.php`, {
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
    const response = await axios.post(`http://localhost/react_api/create_classroom.php`, {
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
      await axios.post(`http://localhost/react_api/kick_members.php`, {
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
    <div>
      <Button variant="secondary" onClick={handleBackToList} className="mb-3">
        ← Quay lại
      </Button>


      {/* Danh sách lớp học */}
      {!showDetails && !showClassroom &&(
        <div>
          <h2>Quản lý lớp học</h2>
          <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
            + Tạo lớp học mới
          </Button>

          <Row>
            {classrooms.map((classroom) => (
              <Col key={classroom.classroom_id} md={4} className="mb-3">
                <Card style={{ cursor: "pointer" }}>
                  <Card.Body>
                    <Card.Title>{classroom.class_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Giáo viên: {classroom.teacher_name}
                    </Card.Subtitle>
                    <Card.Text>Ngày tạo: {new Date(classroom.created_at).toLocaleString()}</Card.Text>
                    <Button variant="primary" onClick={() => {handleEnterClassroom(classroom); navigate(`/teacher?section=manage_classrooms&sub=classroom`)}}>
                          Vào Lớp học
                      </Button>
                    <Button variant="warning" onClick={() => handleManageClassroom(classroom)}>
                      Quản lý thành viên & Chỉnh sửa lớp
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
{/* Hiển thị ClassroomPractice nếu showClassroomPractice là true */}
{showClassroom && <ClassroomPractice classroomId={selectedClassroom.classroom_id} userId={teacherId} roleId={roleId}/>}
    
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
