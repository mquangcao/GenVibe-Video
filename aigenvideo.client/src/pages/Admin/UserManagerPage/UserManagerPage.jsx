
function UserManagerPage() {
    return (
    <div className="flex flex-1 flex-col gap-4 p-4">
          <h1 className="text-3xl font-bold">Chào mừng đến với Dashboard</h1>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow">
              <h3 className="text-lg font-medium">Thống kê</h3>
              <p className="text-3xl font-bold mt-2">1,234</p>
              <p className="text-muted-foreground">Người dùng hoạt động</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow">
              <h3 className="text-lg font-medium">Doanh thu</h3>
              <p className="text-3xl font-bold mt-2">$12,345</p>
              <p className="text-muted-foreground">Tháng này</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow">
              <h3 className="text-lg font-medium">Đơn hàng</h3>
              <p className="text-3xl font-bold mt-2">567</p>
              <p className="text-muted-foreground">Đang xử lý</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Người dùng #{item} đã đăng ký</p>
                    <p className="text-sm text-muted-foreground">2 giờ trước</p>
                  </div>
                  <button className="rounded bg-primary px-3 py-1 text-primary-foreground">Xem</button>
                </div>
              ))}
            </div>
          </div>
        </div>
  )
}


export default UserManagerPage