import Link from "next/link";

const policies = [
  { id: "bao-mat", title: "Chính sách bảo mật", body: "BLANWHI – BNW chỉ thu thập thông tin cần thiết để xử lý đơn hàng, giao hàng, thanh toán và hỗ trợ khách hàng. Thông tin được bảo vệ, không bán hoặc cung cấp cho bên thứ ba ngoài các đơn vị thanh toán, vận chuyển và cơ quan có thẩm quyền theo quy định pháp luật." },
  { id: "phan-anh-khieu-nai", title: "Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại", body: "Khách hàng gửi phản ánh, yêu cầu hoặc khiếu nại qua Hotline 0866561480. BLANWHI – BNW tiếp nhận, xác minh, phản hồi tiến độ và đề xuất phương án giải quyết dựa trên chứng từ mua hàng, tình trạng sản phẩm và quy định pháp luật áp dụng." },
  { id: "gia", title: "Chính sách về giá", body: "Giá niêm yết trên website là giá bán của hàng hóa tại thời điểm khách xác nhận đặt hàng. Mọi khoản giảm giá, phí vận chuyển và tổng tiền thanh toán được hiển thị rõ trong bước thanh toán trước khi khách đặt hàng." },
  { id: "thanh-toan", title: "Chính sách về thanh toán", body: "Website chỉ hiển thị phương thức thanh toán đang hoạt động. Với chuyển khoản, khách thanh toán đúng tên người thụ hưởng, số tài khoản, ngân hàng và nội dung đơn hàng được hiển thị tại trang thanh toán." },
  { id: "giao-hang", title: "Chính sách về giao hàng", body: "Khách chọn phương thức giao hàng và xem phí giao hàng trước khi đặt hàng. Trạng thái và mã vận đơn (khi có) được cập nhật trong mục Đơn hàng của tôi. Thời gian nhận phụ thuộc địa chỉ, đơn vị vận chuyển và điều kiện thực tế." },
  { id: "doi-tra-hoan-tien", title: "Chính sách về đổi trả hàng và hoàn tiền", body: "Yêu cầu đổi trả cần được gửi kèm mã đơn, hình ảnh và tình trạng sản phẩm. BLANWHI – BNW kiểm tra điều kiện áp dụng, thông báo phương án nhận lại hàng, đổi hàng hoặc hoàn tiền và thời hạn xử lý cho khách hàng." },
  { id: "quyen-nghia-vu", title: "Quyền và nghĩa vụ của các bên", body: "Khách hàng có quyền nhận thông tin trung thực, lựa chọn hàng hóa, thanh toán và khiếu nại; đồng thời có nghĩa vụ cung cấp thông tin giao nhận chính xác và thanh toán theo thỏa thuận. BLANWHI – BNW có nghĩa vụ cung cấp đúng thông tin, xử lý đơn, bảo vệ dữ liệu và giải quyết phản ánh; có quyền từ chối giao dịch có dấu hiệu gian lận hoặc vi phạm pháp luật." }
];

export default function PolicyPage() {
  return <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 22px 80px", fontFamily: "Arial, sans-serif", color: "#111" }}>
    <Link href="/" style={{ color: "#111", textDecoration: "none", fontSize: 13 }}>← TRỞ VỀ WEBSITE</Link>
    <header style={{ borderBottom: "2px solid #111", padding: "42px 0 28px" }}>
      <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>BLANWHI – BNW</p>
      <h1 style={{ margin: "12px 0 0", fontSize: "clamp(34px,7vw,72px)", lineHeight: 1 }}>Chính sách hoạt động của website</h1>
    </header>
    <nav aria-label="Danh mục chính sách" style={{ display: "grid", gap: 8, padding: "24px 0", borderBottom: "1px solid #ccc" }}>
      {policies.map((item) => <a key={item.id} href={"#" + item.id} style={{ color: "#111", lineHeight: 1.5 }}>{item.title}</a>)}
    </nav>
    {policies.map((item) => <section key={item.id} id={item.id} style={{ scrollMarginTop: 24, padding: "34px 0", borderBottom: "1px solid #ddd" }}>
      <h2 style={{ margin: "0 0 14px", fontSize: "clamp(22px,4vw,34px)", lineHeight: 1.2 }}>{item.title}</h2>
      <p style={{ margin: 0, maxWidth: 850, color: "#444", fontSize: 16, lineHeight: 1.75 }}>{item.body}</p>
    </section>)}
    <section style={{ marginTop: 38, padding: 24, background: "#f4f4f2", lineHeight: 1.7 }}>
      <strong>HỘ KINH DOANH BLANWHI – BNW</strong><br />
      Địa chỉ: 282/19/6 Bùi Hữu Nghĩa, Phường 2, Quận Bình Thạnh, Thành phố Hồ Chí Minh<br />
      Mã số HKD: 079093030935 do UBND Quận Bình Thạnh cấp ngày 16/09/2022<br />
      Chủ hộ kinh doanh: Nguyễn Việt Thắng<br />Hotline: <a href="tel:0866561480">0866561480</a>
    </section>
  </main>;
}
