import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Login from "./Login"

const AuthForm = ({ onClose, onLogin }) => {
  const navigate = useNavigate(); // Điều hướng
  const [isRegister, setIsRegister] = useState(false); // true: Đăng ký, false: Đăng nhập
  const [formData, setFormData] = useState({
    register_type: "normal",
    fullname: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "2", // Mặc định là học sinh
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const apiUrl = process.env.REACT_APP_API_BASE_URL;


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDirectPage = (data) => {
    console.log("thông tin nhận về đề chuyển hướng trang: ", data);
    const user = data.user;
    console.log("thông tin user nhận về đề chuyển hướng trang: ", user)

    if (!data.success) {
      onLogin(user); // Gửi thông tin người dùng lên App
      setTimeout(() => {
        onClose(); // Tắt form

        console.log("Chuyển đến điền vai trò"); // Lỗi nếu vai trò không xác định
        navigate("/fill-info", { state: { user } })

      }, 150);

    } else {
      localStorage.setItem("user_id", user.user_id);//Lưu ID nguòi

      console.log("User_id là: ", user.user_id);
      const roleId = user.role_id; // Lấy role_id từ thông tin người dùng
      onLogin(user); // Gửi thông tin người dùng lên App
      console.log("Đăng nhập thành công:", user); // Log thông tin người dùng
      // Đăng nhập thành công -> Kiểm tra vai trò để điều hướng
      setTimeout(() => {
        onClose(); // Tắt form

        if (roleId === "1") {
          console.log("Đang chuyển hướng...");
          navigate("/teacher", { state: { user } }); // Giáo viên
        } else if (roleId === "2") {
          navigate("/users", { state: { user } }); // Học sinh
        } else if (roleId === "3") {
          navigate("/admin", { state: { user } }); // Admin
        } else {
          setErrorMessage("Lỗi vai trò không tồn tại");
        }
      }, 150);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        isRegister
          ? `${apiUrl}/user_register.php`
          : `${apiUrl}/user_login.php`,
        formData
      );

      console.log("Phản hồi từ server:", response.data);

      if (response.data.error) {
        setErrorMessage(response.data.error);
      } else {
        setSuccessMessage(response.data.message);

        if (isRegister) {
          // Đăng ký thành công -> Chuyển sang form đăng nhập
          setTimeout(() => {
            setSuccessMessage(""); // Xóa thông báo thành công
            setIsRegister(false); // Chuyển sang form đăng nhập
          }, 1500);
        } else {
          handleDirectPage(response.data);
        }
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setErrorMessage("Lỗi kết nối đến server. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="position-relative">
      {/* Biểu tượng đóng */}
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 m-3"
        aria-label="Close"
        onClick={onClose}
      ></button>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded shadow-lg"
        style={{ width: isRegister ? "700px" : "500px", overflowY: "auto", maxHeight: "600px" }}
      >
        <h3 className="text-center mb-3">
          {isRegister ? "Thành viên đăng ký" : "Đăng nhập"}
        </h3>
        <p className="text-center text-muted mb-4">
          {isRegister
            ? "Cùng nhau đăng kí để tham gia khóa học "
            : "Chào mừng bạn quay lại!"}
        </p>

        {errorMessage && (
          <div className="alert alert-danger text-center">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="alert alert-success text-center">{successMessage}</div>
        )}

        <div className="row">
          {isRegister ? (
            <>
              <div className="col-md-6 mb-3">
                <label htmlFor="fullname" className="form-label">
                  Tên đầy đủ
                </label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  className="form-control"
                  placeholder="VD: Nguyễn Thanh Huy"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-control"
                  placeholder="VD: thanhhuy123"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="VD: email@domain.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="role_id" className="form-label">
                  Vai trò
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  className="form-select"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="2">Học sinh</option>
                  <option value="1">Giáo viên</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="password_confirmation" className="form-label">
                  Nhập lại mật khẩu
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="col-md-12 mb-3">
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-control"
                  placeholder="VD: thanhhuy123"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>

          )
          }




        </div>

        <button type="submit" className="btn btn-primary w-100 mb-2">
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </button>

        {!isRegister && (
          <>
            <div className="col-md-12 mb-3 d-flex w-100 justify-content-center">Hoặc</div>

            <div className="col-md-12 mb-3">
              <Login handleDirectPage={handleDirectPage} />
            </div>
          </>
        )}

        <button
          type="button"
          className="btn btn-link w-100"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Đăng ký"}
        </button>
      </form>
    </div>
  );

};

export default AuthForm;
