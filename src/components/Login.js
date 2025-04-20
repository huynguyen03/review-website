import React from 'react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import logoGG from "../assets/images/logo-gg.png";
import "../assets/styles/Login.css";

const clientId = '576703468358-oqv4ekrp6urmqfu7gshs62trv9tfn10o.apps.googleusercontent.com';

const Login = ({ handleDirectPage }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContent apiUrl={apiUrl} handleDirectPage={handleDirectPage} />
    </GoogleOAuthProvider>
  );
};

const LoginContent = ({ apiUrl, handleDirectPage }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        // Gửi access token về backend để xử lý và lấy thông tin người dùng
        const response = await fetch(`${apiUrl}/google-login.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
          credentials: 'same-origin',
        });

        const data = await response.json();

        if (data && data.user) {
          console.log("Chuyển hướng trang với dữ liệu:", data);
          handleDirectPage(data);
        } else {
          console.log("Không nhận được thông tin hợp lệ từ backend.");
        }
      } catch (error) {
        console.error("Lỗi trong quá trình xử lý đăng nhập:", error);
      }
    },
    onError: () => {
      console.error("Đăng nhập Google thất bại");
    },
    flow: 'implicit',
    scope: 'openid email profile',
  });

  return (
    <div className="d-flex justify-content-center align-items-center google-login-btn">
      <button
        onClick={() => login()}
        className="google-login-button btn d-flex align-items-center justify-content-center w-100"
      >
        <img src={logoGG} alt="Google logo" className="google-logo me-2" />
        Đăng nhập với Google
      </button>
    </div>
  );
};

export default Login;
