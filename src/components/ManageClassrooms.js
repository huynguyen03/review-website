import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Modal, Form } from "react-bootstrap";
import axios from "axios";

const ManageClassrooms = ({ teacherId }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [className, setClassName] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState(""); // Mật khẩu đăng ký
  const [showModal, setShowModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null); // Lưu thông tin lớp học được chọn
  const [showDetails, setShowDetails] = useState(false); // Điều khiển việc hiển thị chi tiết lớp học
  const [members, setMembers] = useState([]); // Thành viên của lớp học

  // Lấy danh sách các lớp học từ API
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.get(`http://localhost/react_api/fetch_my_classrooms.php?teacher_id=${teacherId}`);
        setClassrooms(response.data);
      } catch (error) {
        console.error("Lỗi không thể lấy dữ liệu các lớp học!", error);
      }
    };

    if (teacherId) {
      fetchClassrooms();
    }
  }, [teacherId]);

  // Hàm chỉnh sửa thông tin lớp học
  const handleUpdateClass = async () => {
    if (!selectedClassroom) {
      return;
    }

    try {
      const response = await axios.post(`http://localhost/react_api/update_classroom.php`, {
        
        classroom_id: selectedClassroom.classroom_id,
        class_name: className,
        registration_password: registrationPassword,
      });
      console.log(response.data)
      // Cập nhật lại thông tin lớp học sau khi sửa
      setClassrooms(
        classrooms.map((classroom) =>
          classroom.classroom_id === selectedClassroom.classroom_id
            ? { ...classroom, class_name: className, registration_password: registrationPassword }
            : classroom
        )
      );
      setShowDetails(false);
      alert("Thông tin lớp học đã được cập nhật!");
    } catch (error) {
      console.error("Error updating class", error);
    }
  };

  // Hàm lấy danh sách thành viên của lớp học
  const handleManageMembers = async () => {
    if (!selectedClassroom) {
      return;
    }

    try {
      const response = await axios.get(`http://localhost/react_api/fetch_members.php?classroom_id=${selectedClassroom.classroom_id}`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members", error);
    }
  };

  // Hàm kick thành viên khỏi lớp học
  const handleKickMember = async (studentId) => {
    try {
      await axios.post(`http://localhost/react_api/kick_members.php`, {
        classroom_id: selectedClassroom.classroom_id,
        student_id: studentId,
      });
      setMembers(members.filter((member) => member.student_id !== studentId)); // Xóa thành viên khỏi danh sách
      alert("Đã xóa thành viên khỏi lớp học.");
    } catch (error) {
      console.error("Error kicking member", error);
    }
  };

  // Xử lý click vào nút "Quản lý thành viên & Chỉnh sửa lớp"
  const handleManageClassroom = (classroom) => {
    setSelectedClassroom(classroom); // Set lớp học đã chọn
    setClassName(classroom.class_name);
    setRegistrationPassword(classroom.registration_password || ""); // Set mật khẩu lớp học hiện tại
    setShowDetails(true); // Hiển thị chi tiết lớp học và ẩn các tính năng quản lý lớp học
    handleManageMembers(); // Lấy danh sách thành viên của lớp học
  };

  // Hàm quay lại danh sách lớp học
  const handleBackToList = () => {
    setSelectedClassroom(null); // Reset lớp học đã chọn
    setShowDetails(false); // Ẩn chi tiết lớp học và hiển thị lại các tính năng quản lý lớp học
  };

  return (
    <div>
      {/* Phím quay lại ở đầu trang */}
      <Button variant="secondary" onClick={handleBackToList} className="mb-3">
        Quay lại
      </Button>

      <h2>Quản lý lớp học</h2>

      {/* Button để hiển thị modal tạo lớp */}
      {!showDetails && (
        <div>
          <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
            Tạo lớp học mới
          </Button>

          <Row>
            {classrooms.map((classroom) => (
              <Col key={classroom.classroom_id} md={4} className="mb-3">
                <Card style={{ cursor: "pointer" }}>
                  <Card.Body>
                    <Card.Title>{classroom.class_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Giáo viên: {classroom.teacher_name}</Card.Subtitle>
                    <Card.Text>
                      Ngày tạo: {new Date(classroom.created_at).toLocaleString()}
                    </Card.Text>
                    <Button variant="warning" onClick={() => handleManageClassroom(classroom)} className="mr-2">
                      Quản lý thành viên & Chỉnh sửa lớp
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Hiển thị chi tiết lớp học và thành viên nếu đã chọn lớp */}
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
                placeholder="Nhập tên lớp học"
              />
            </Form.Group>

            <Form.Group controlId="registrationPassword">
              <Form.Label>Mật khẩu đăng ký</Form.Label>
              <Form.Control
                type="password"
                value={registrationPassword}
                onChange={(e) => setRegistrationPassword(e.target.value)}
                placeholder="Nhập mật khẩu đăng ký lớp học (nếu có)"
              />
            </Form.Group>

            <Button variant="success" onClick={handleUpdateClass}>
              Cập nhật thông tin lớp học
            </Button>
          </Form>

          {/* Hiển thị danh sách thành viên nếu đang quản lý thành viên */}
          <div className="mt-4">
            <h4>Danh sách thành viên</h4>
            <ul>
              {members.length > 0 ? (
                members.map((member) => (
                  <li key={member.student_id}>
                    {member.fullname} - Đăng ký vào: {new Date(member.enrollment_date).toLocaleString()}
                    <Button variant="danger" onClick={() => handleKickMember(member.student_id)} className="ml-2">
                      Xóa khỏi lớp
                    </Button>
                  </li>
                ))
              ) : (
                <p>Chưa có thành viên nào.</p>
              )}
            </ul>
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
                placeholder="Nhập tên lớp học"
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Mật khẩu (nếu có)</Form.Label>
              <Form.Control
                type="password"
                value={registrationPassword}
                onChange={(e) => setRegistrationPassword(e.target.value)}
                placeholder="Nhập mật khẩu lớp (nếu có)"
              />
            </Form.Group>

            <Button variant="primary" onClick={handleUpdateClass}>
              Tạo lớp
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageClassrooms;
