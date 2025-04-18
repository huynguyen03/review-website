import React, { useState, useEffect } from "react";
import { Button, Form, Spinner, Alert } from "react-bootstrap";
import defautAvtUser from "../assets/images/avartar_defaul_1.png"
import axios from "axios";

const AccountInfo = ({ userId }) => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "", // Mật khẩu cũ
    newPassword: "", // Mật khẩu mới
    confirmPassword: "", // Xác nhận mật khẩu mới
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    axios
      .get(`${apiUrl}/get_user_info.php?user_id=${userId}`)
      .then((response) => {
        const { username, email, fullname } = response.data;
        setUserData({ fullname, username, email, password: "", newPassword: "", confirmPassword: "" });
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
      });
  }, [userId]);

  const handleSave = () => {
    setIsLoading(true);

    // Kiểm tra mật khẩu cũ
    if (userData.password) {
      axios
        .post(`${apiUrl}/verify_password.php`, {
          user_id: userId,
          password: userData.password, // Mã hóa mật khẩu cũ
        })
        .then((response) => {
          if (response.data.success) {
            if (userData.newPassword === userData.confirmPassword) {
              const updatedData = { ...userData };

              axios
                .post(`${apiUrl}/update_user_info.php`, {
                  user_id: userId,
                  username: userData.username,
                  email: userData.email,
                  password: updatedData.newPassword || userData.password,
                })
                .then((response) => {
                  if (response.data.success) {
                    setIsUpdated(true);
                  } else {
                    alert("Failed to update account info.");
                  }
                })
                .catch((error) => {
                  console.error("Error updating account info:", error);
                  alert("Error occurred while updating.");
                })
                .finally(() => {
                  setIsLoading(false);
                });
            } else {
              setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
              setIsLoading(false);
            }
          } else {
            setCurrentPasswordError("Mật khẩu cũ không chính xác.");
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error verifying current password:", error);
          alert("Lỗi xác minh mật khẩu cũ.");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      alert("Vui lòng nhập mật khẩu cũ.");
    }
  };

  return (
    <div className="account-info-container">
      <div className="header d-flex align-items-center mb-4">
        <div className="avatar me-3">
          <img src={defautAvtUser} alt="avatar" className="rounded-circle" style={{ width: "80px", height: "80px" }}/>
        </div>
        <div className="user-info" style={{alignItems: "center"}}>
          <h2>{userData.fullname}</h2>
          <p>{userData.email}</p>
        </div>
      </div>

      {isUpdated && <Alert variant="success">Thông tin đã được cập nhật!</Alert>}
      {currentPasswordError && <Alert variant="danger">{currentPasswordError}</Alert>}
      {passwordError && <Alert variant="danger">{passwordError}</Alert>}

      <Form>
        <Form.Group controlId="formUsername">
          <Form.Label>Tên đăng nhập</Form.Label>
          <Form.Control
            type="text"
            value={userData.username}
            onChange={(e) =>
              setUserData((prevState) => ({ ...prevState, username: e.target.value }))
            }
            disabled
            className="mb-3"
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={userData.email}
            onChange={(e) =>
              setUserData((prevState) => ({ ...prevState, email: e.target.value }))
            }
            disabled
            className="mb-3"
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Mật khẩu cũ</Form.Label>
          <Form.Control
            type="password"
            value={userData.password}
            onChange={(e) =>
              setUserData((prevState) => ({ ...prevState, password: e.target.value }))
            }
            className="mb-3"
          />
        </Form.Group>

        <Form.Group controlId="formNewPassword">
          <Form.Label>Mật khẩu mới</Form.Label>
          <Form.Control
            type="password"
            value={userData.newPassword}
            onChange={(e) =>
              setUserData((prevState) => ({ ...prevState, newPassword: e.target.value }))
            }
            className="mb-3"
          />
        </Form.Group>

        <Form.Group controlId="formConfirmPassword">
          <Form.Label>Xác nhận mật khẩu mới</Form.Label>
          <Form.Control
            type="password"
            value={userData.confirmPassword}
            onChange={(e) =>
              setUserData((prevState) => ({ ...prevState, confirmPassword: e.target.value }))
            }
            className="mb-3"
          />
        </Form.Group>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading}
          className="w-100"
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" /> Đang lưu...
            </>
          ) : (
            "Lưu thông tin"
          )}
        </Button>
      </Form>
    </div>
  );
};

export default AccountInfo;
