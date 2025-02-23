import React from 'react';

const Home = () => {
  return (
    <div>
      <div className="main-banner position-relative text-white">
        <div className="container position-absolute top-50 start-50 translate-middle">
          <h2 className="display-4">Học tập và ôn luyện với các bài trắc nghiệm đa dạng và phong phú</h2>
          <p>Ôn luyện với hơn 50+ các bài trắc nghiệm được tuyển chọn</p>
          <a href="/" className="btn btn-primary">
            Ôn luyện ngay
          </a>
        </div>
      </div>
      <div className="container py-5">
        <div className="row text-center">
          <div className="col-lg-4">
            <div className="p-4 bg-light rounded shadow-sm">
              <p className="h4">Ôn Luyện</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="p-4 bg-light rounded shadow-sm">
              <p className="h4">Thi Thử</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="p-4 bg-light rounded shadow-sm">
              <p className="h4">Bài Thi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
