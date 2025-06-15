# 📁 Cấu trúc dự án API ASP.NET Core Controller-based

---

## 📁 Abstractions

- Chứa các interface định nghĩa các hợp đồng (contract) mà các dịch vụ sẽ implement.
- **Ví dụ:** `IEmailSender.cs` định nghĩa giao diện gửi email.

---

## 📁 Bootstraping

- Dùng để cấu hình và đăng ký các dịch vụ vào DI Container.
- **Ví dụ:** `ApplicationServiceExtensions.cs` chứa các extension method để inject các service vào `IServiceCollection`.

---

## 📁 Common

- Chứa các lớp/tệp dùng chung cho toàn bộ dự án.
- **Ví dụ:** `Constants.cs` định nghĩa các hằng số dùng chung.

---

## 📁 Controllers

- Chứa các controller chính xử lý HTTP request/response.
- Mỗi controller tương ứng với 1 resource trong hệ thống.

---

## 📁 Data

- Chứa các thành phần liên quan đến truy xuất và thao tác với cơ sở dữ liệu. ( ở đây sử dụng EF )

### 📁 Entities

- Định nghĩa các entity tương ứng với bảng trong database.

### 📁 Migrations

- Chứa các migration file được tạo ra bởi Entity Framework.

### 📄 ApplicationDbContext.cs

- Là lớp đại diện cho DbContext chính của ứng dụng, kết nối đến database.

---

## 📁 Helpers

- Chứa các class tiện ích, hỗ trợ xử lý logic phụ (ví dụ: xử lý thời gian).
- **Ví dụ:** `DateTimeHelper.cs`.

---

## 📁 Mappers

- Chứa các lớp dùng để ánh xạ (map) dữ liệu giữa các model khác nhau (Entity ↔ DomainModel or DTO,...).
- **Ví dụ:** `UserMapper.cs`.

---

## 📁 Models

- Chứa các model phục vụ cho việc truyền nhận dữ liệu giữa client và server.

### 📁 DomainModels

- Chứa các model chính đại diện cho logic domain của hệ thống.

### 📁 RequestModels

- Chứa các model dùng để nhận dữ liệu từ request (input từ client).

### 📁 ResponseModels

- Chứa các model dùng để trả dữ liệu về cho client (output).

#### 📄 ApiResponse.cs

- Một lớp chuẩn hóa phản hồi API (trạng thái, thông báo, dữ liệu...), luôn sử dụng lớp này để trả về dữ liệu cho client.

#### 📄 PaginationResponse.cs

- Lớp dùng để phản hồi dữ liệu dạng phân trang.

---

## 📁 Properties

- Thư mục mặc định chứa file `launchSettings.json` để cấu hình môi trường khởi động cho dự án.

---

## 📁 Repository

- Chứa lớp tương tác trực tiếp với database (Data Access Layer), ở đây sẽ viết các repository, các repository sẽ dùng đến EF, và các service hay các controller sẽ dùng đến repository ( đáp dứng Dependency Inversion Principle -> chữ D trong SOLID, các repository cũng cần tạo ra interface trong _Abtraction_ )
- **Ví dụ:** `UserRepository.cs`

---

## 📁 Services

- Chứa các class thực thi logic nghiệp vụ của ứng dụng.
- Đây là nơi xử lý logic chính từ Controller chuyển xuống Repository.

---

## ✅ Ghi chú chung:

- Dự án sử dụng kiến trúc phân lớp: **Controller → Service → Repository**.
- Ưu tiên phân tách rõ ràng giữa dữ liệu truyền nhận (request/response) và dữ liệu nghiệp vụ (domain).
- Dùng Dependency Injection để dễ dàng test và mở rộng ứng dụng.

---

---

# 🧩 Cấu trúc thư mục dự án Frontend (React)

## 📁 apis

- Chứa các hàm gọi API
- Mỗi file đại diện cho một tập hợp API liên quan đến một resource (ví dụ: `userService.js`, `authService.js`).

---

## 📁 assets

- Chứa tài nguyên tĩnh như ảnh, font, biểu tượng (icon), video, v.v.
- Có thể chia nhỏ thành các thư mục con như `images`, `fonts`,...

---

## 📁 common

- Chứa các thành phần tái sử dụng nhưng **không liên quan đến UI**, như:
  - Constants
  - Config
  - Validation schemas
  - Custom enums...

---

## 📁 components

- Chứa các component React có thể tái sử dụng nhiều nơi trong ứng dụng (Button, Modal, Input,...).
- Thường được chia nhỏ theo loại hoặc module.

---

## 📁 hooks

- Chứa các custom hooks như `useDebounce`, `useAuth`, `usePagination`,...
- Mục tiêu: tái sử dụng logic và tách biệt khỏi component.

---

## 📁 lib

- Chứa các thư viện hoặc tiện ích bên ngoài (hoặc wrapper của chúng).
- Ví dụ: cấu hình axios, Firebase, dayjs, i18n,...

---

## 📁 pages

- Chứa các trang chính của ứng dụng (mỗi route tương ứng với một trang).
- Ví dụ: `LoginPage`, `HomePage`, `DashboardPage`,...

---

## 📁 providers

- Chứa các Context Providers hoặc wrappers như:
  - AuthProvider
  - ThemeProvider
  - ReduxProvider (nếu dùng)
- Dùng để cung cấp state hoặc context cho toàn ứng dụng.

---

## 📁 redux

- Chứa các slice, store, middleware nếu dùng Redux (RTK hoặc Redux thường).
- Cấu trúc thường là:
  - `store.js`
  - `slices/`
  - `middlewares/`

---

## 📁 routes

- Định nghĩa các route trong ứng dụng, có thể phân quyền (PrivateRoute, PublicRoute).
- Có thể kèm cấu hình lazy load, layout tương ứng cho từng route.

---

## 📁 utils

- Chứa các hàm tiện ích (helper function) như:
  - Format date, currency
  - Generate random ID
  - Debounce/throttle function,...
