import React from 'react';

const HeaderContent = () => (
    <div className="flex-grow-1 p-2">
        <div className="heading-content mb-4 d-flex align-items-center justify-content-between">
            {/* Phần tiêu đề */}
            <h1>Môn Tin Học</h1>

            {/* Ô tìm kiếm */}
            <div className="input-group" style={{ maxWidth: "300px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm bài thi ở đây"
                    style={{ width: "250px" }} // Điều chỉnh chiều rộng nếu cần
                />
                <button className="btn btn-primary">
                    <i className="fas fa-search"></i>
                </button>
            </div>
        </div>
    

        {/* <section>
          <div className="row">
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Ôn luyện môn Tin Học</h5>
                  <p className="card-text">Nguyễn Thanh Huy</p>
                  <div className="d-flex justify-content-between">
                    <span>
                      <i className="fas fa-thumbs-up me-1"></i>1k
                    </span>
                    <span>
                      <i className="fas fa-star me-1"></i>5
                    </span>
                    <span>
                      <i className="fas fa-eye me-1"></i>100k
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      
      </div>
);
export default HeaderContent;


