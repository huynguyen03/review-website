import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/styles/FillInfoComponent.css';  // Import file CSS


const FillInfoComponent = ({ user, onLogin}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  // Nhận thông tin từ state (được truyền qua navigate)
  const email = user.email;
  const fullname = user.name;

  const picture = user.picture;



  // Mặc định role_id là "2" (Học sinh)
  const [roleId, setRoleId] = useState(user.role_id || "2");
  const [school, setSchool] = useState('');
  const [classroom, setClassroom] = useState(''); // Lớp học cho học sinh
  const [staffCode, setStaffCode] = useState(''); // Mã cán bộ cho giáo viên

  // Xử lý khi gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gửi dữ liệu nhập vào API để xử lý
    const response = await fetch(`${apiUrl}/user_register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ register_type: "google",email, role_id: roleId, school, classroom, staffCode, fullname, picture }),
    });

    const data = await response.json();

    if (data.success || data.message) {
      onLogin(data.user)
      const user = data.user;
      // Nếu đăng ký thành công, chuyển hướng đến trang người dùng tương ứng
      if (roleId === '1') {
        console.log("Chuyển đến trang teacher");

        navigate('/teacher',{ state: { user } });
      } else if (roleId === '2') {
        console.log("Chuyển đến trang users");
        navigate('/users', { state: { user } });
      }
    } else {
      console.error('Error registering user');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-header">Điền thông tin bổ sung</h2>
      
      {/* Tab chuyển đổi giữa học sinh và giáo viên */}
      <div className="role-tabs">
  <button 
    className={`role-btn ${roleId === '2' ? 'active' : ''}`}
    onClick={() => setRoleId('2')} // Thay đổi role_id là học sinh
  >
    Học sinh
  </button>
  <button 
    className={`role-btn ${roleId === '1' ? 'active' : ''}`}
    onClick={() => setRoleId('1')} // Thay đổi role_id là giáo viên
  >
    Giáo viên
  </button>
</div>

      <form onSubmit={handleSubmit} className="form-fields">
        <div className="form-group">
          <label>Trường học</label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Nhập tên trường học"
          />
        </div>

        {/* Các trường nhập liệu khác nhau tùy thuộc vào role_id */}
        {roleId === '2' ? (
          <div className="form-group">
            <label>Lớp học</label>
            <input
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="Nhập lớp học"
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Mã cán bộ</label>
            <input
              type="text"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              placeholder="Nhập mã cán bộ"
            />
          </div>
        )}

        <button type="submit" className="submit-btn">Xác nhận</button>
      </form>
    </div>
  );
};

export default FillInfoComponent;
