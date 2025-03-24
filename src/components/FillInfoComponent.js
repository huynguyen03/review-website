import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';  // Dùng useNavigate và useLocation từ react-router-dom v6

const FillInfoComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Nhận thông tin từ state (được truyền qua navigate)
  const { idToken, email } = location.state || {};

  const [role, setRole] = useState('');
  const [school, setSchool] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Gửi dữ liệu nhập vào API để xử lý
    const response = await fetch('http://localhost/api/register-user.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, email, role, school }),
    });

    const data = await response.json();

    if (data.success) {
      // Nếu đăng ký thành công, chuyển hướng đến trang người dùng tương ứng
      if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      }
    } else {
      console.error('Error registering user');
    }
  };
console.log("Đã chuyển hướng sang trang điền thông tin")
  return (
    <div>
      <h2>Điền thông tin bổ sung</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học sinh</option>
          </select>
        </div>
        <div>
          <label>Trường học</label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </div>
        <button type="submit">Xác nhận</button>
      </form>
    </div>
  );
};

export default FillInfoComponent;
