import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';



const Login = () => {

  const navigate = useNavigate();  // Hook dùng để chuyển hướng
  const handleLoginSuccess = (response) => {
    console.log("Đăng nhập thành công");
    // Lấy ID token từ response
    const idToken = response.credential;  // Đây là ID token, không phải code
console.log("ID token là: ", idToken);
    // Gửi ID token đến backend (PHP)
    fetch('http://localhost/api/google-login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: idToken }), // Gửi ID token thay vì code
        credentials: 'same-origin' // hoặc 'include' tùy thuộc vào yêu cầu
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Xử lý dữ liệu trả về từ backend
         // Nếu đăng ký thành công hoặc email đã tồn tại, chuyển hướng tới trang nhập thông tin
         if (data.success) {
          navigate('/fill-info', {
            state: { idToken: idToken, email: data.email } // Truyền thông tin qua state
          });
        }
      })
      .catch(error => console.error('Error:', error));
  }

  const handleLoginFailure = (error) => {
    console.error('Login Failed:', error);
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginFailure}
      />
    </div>
  );
};

export default Login;
