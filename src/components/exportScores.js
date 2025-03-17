export const exportScores = (examData) => {
    // Thêm UTF-8 BOM để tránh lỗi font
    const BOM = "\uFEFF";
  
    const csvContent = [
      ["STT", "Học sinh", "Điểm số", "Thời gian", "Mức độ 1 (%)", "Mức độ 2 (%)", "Mức độ 3 (%)", "Mức độ 4 (%)"],
      ...examData.map((student, index) => [
        index + 1,
        student.fullname,  // Đổi từ student_id sang fullname
        student.score,
        new Date(student.submission_time).toLocaleString("vi-VN"),  // Format thời gian chuẩn tiếng Việt
        student.percent_1,
        student.percent_2,
        student.percent_3,
        student.percent_4,
      ]),
    ]
      .map((row) => row.join(","))  // Nếu Excel bị lỗi phân tách, thử đổi `,` thành `;`
      .join("\n");
  
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `diem_so_bai_thi_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  