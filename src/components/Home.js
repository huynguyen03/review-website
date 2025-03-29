import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import Footer from './Footer';

// Import các hình ảnh
import banner1 from '../assets/images/banner/banner-1.jpg';
import banner2 from '../assets/images/banner/banner-2.jpg';
import banner3 from '../assets/images/banner/banner-3.jpg';
import banner4 from '../assets/images/banner/banner-4.jpg';
import banner5 from '../assets/images/banner/banner-5.jpg';
import studyOnline from '../assets/images/study-online.png';
import ExamCardIcon from '../assets/images/exam-card.png';
import ReviewCardIcon from '../assets/images/onluyen-icon.png';




import "../assets/styles/Home.css";

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    banner1,
    banner2,
    banner3,
    banner4,
    banner5
  ];

  // Tự động chuyển banner sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Chuyển đến banner cụ thể khi nhấn vào banner nhỏ
  const goToBanner = (index) => {
    setCurrentBanner(index);
  };

  // Điều khiển chuyển banner qua trái, phải
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div>
      <div className="main-banner position-relative text-white">
        <div className="banner-container" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
          {banners.map((banner, index) => (
            <div key={index} className="banner-item">
              <img src={banner} alt={`banner-${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Nút điều khiển */}
        <div className="prev" onClick={prevBanner}>‹</div>
        <div className="next" onClick={nextBanner}>›</div>
      </div>

      {/* Các banner nhỏ bên dưới */}
      <div className="small-banners">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            alt={`small-banner-${index + 1}`}
            className={index === currentBanner ? "active" : ""}
            onClick={() => goToBanner(index)}
          />
        ))}
      </div>
      <Container className="mt-5">
        {/* Phần nội dung nằm ngang */}
        <Row className="header-content align-items-center">
          <Col md={6} className="text-left text-md-left">
            <h1 style={{ fontSize: "4rem" }} >Dành cho học sinh Lớp 10 - Lớp 12</h1>
            <p>Onluyen.vn – Học mọi lúc, mọi nơi</p>
          </Col>
          <Col md={6}>
            <img src={studyOnline} alt="Study Online" className="img-fluid" />
          </Col>
        </Row>

        <Row className="feature-confirmation align-items-center w-100">
          <Col className="text-center">
            <h1 style={{ fontSize: "4rem" }} >Đảm bảo tính năng</h1>
            <p>Đáp ứng đầy đủ tính năng - một trang web ôn luyện chất lượng, uy tín.</p>
          </Col>
          
        </Row>

        <Row className="justify-content-center">
          {/* Card 1 */}
          <Col md={4} className="mb-4">
            <Card className="custom-card">
              <Card.Body className="d-flex flex-column flex-column">

                <div className="card-header">
                  <img src={ExamCardIcon} alt="Bài thi" className="custom-card-img" />
                  <div className="ml-3">
                    <Card.Title className='custom-card-title'>Bài thi</Card.Title>
                  </div>
                </div>

                <div className="content ml-3">
                  <Card.Title className='custom-card-title-content'>Bài thi đa dạng</Card.Title>
                  <Card.Text> Các bài thi đa dạng, các câu hỏi cũng thuộc nhiều dạng khác nhau mang lại tính mới mẻ. </Card.Text>
                  <Card.Title className='custom-card-title-content'>Câu hỏi theo mức độ</Card.Title>
                  <Card.Text> Câu hỏi được sàn lọc kỹ theo từng mức độ nhằm đánh giá đúng trình độ của mỗi học sinh tham gia. </Card.Text>
                  <Card.Title className='custom-card-title-content'>Bài thi bám sát đề thi THPT quốc gia</Card.Title>
                  <Card.Text> Ma trận và câu hỏi được lựa chọn bám sát theo đề thi THPY quốc gia mới định hướng rèn làm quen với đề thi. </Card.Text>
                  <Button variant="primary">Xem chi tiết</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* Card 2 */}
          <Col md={4} className="mb-4">
          <Card className="custom-card">
              <Card.Body className="d-flex flex-column flex-column">

                <div className="card-header">
                  <img src={ReviewCardIcon} alt="Ôn luyện" className="custom-card-img" />
                  <div className="ml-3">
                    <Card.Title className='custom-card-title'>Ôn luyện</Card.Title>
                  </div>
                </div>

                <div className="content ml-3">
                  <Card.Title className='custom-card-title-content'>Ôn luyện nhanh chóng</Card.Title>
                  <Card.Text> Các bài ôn luyện được thiết kế sẳn với nhiều sự lựa chọn phù hợp với học sinh THPT</Card.Text>
                  <Card.Title className='custom-card-title-content'>Ôn luyện theo cây tiến trình</Card.Title>
                  <Card.Text> Cài bài ôn luyện được liên kết với nhau với mức đọ từ dể đến khó. Người học có thể dể dàng tiếp cần mới nhiều mức độ câu hỏi khác nhau </Card.Text>
                  <Card.Title className='custom-card-title-content'>Thống kê sau ôn luyện</Card.Title>
                  <Card.Text> Quá trình ôn luyện sẽ đước thông kê chi tiết. Từ điểm số, tỷ lệ trả lời đúng theo mức độ, ma trận đề đều được thể hiện một cách trực quan</Card.Text>
                  <Button variant="primary">Xem chi tiết</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* Card 3 */}
          <Col md={4} className="mb-4">
          <Card className="custom-card">
              <Card.Body className="d-flex flex-column flex-column">

                <div className="card-header">
                  <img src={ExamCardIcon} alt="Bài thi" className="custom-card-img" />
                  <div className="ml-3">
                    <Card.Title className='custom-card-title'>Lớp học</Card.Title>
                  </div>
                </div>

                <div className="content ml-3">
                  <Card.Title className='custom-card-title-content'>Dể quản lý</Card.Title>
                  <Card.Text> Giáo viên hoàn toàn có thể quan lý học sinh tham gia lớp học. Kiểm soát tiến độ hoàn thành của mỗi học sinh bên trong lớp học.</Card.Text>
                  <Card.Title className='custom-card-title-content'>Quản lý điểm số</Card.Title>
                  <Card.Text> Điểm số của mỗi học sinh trong lớp học được quản lý chặc chẻ. Hoàn toàn có thể chấm điểm trực hoặc xuất file điểm nhanh chóng. </Card.Text>
                  <Card.Title className='custom-card-title-content'>Đảm bảo tính riêng tư</Card.Title>
                  <Card.Text> Các bải thi, tiến trình ôn luyện trong lớp chỉ hiển thị tỏng lớp học của giáo viên.</Card.Text>
                  <Button variant="primary">Xem chi tiết</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
        <Footer/>
    </div>
  );
};

export default Home;
