### Email Settings

Cấu hình gửi email nằm trong `appsettings.json`. Tuy nhiên **bạn phải override trường `Password` bằng cách sau**:

- Với local: dùng `dotnet user-secrets`
- Với production: dùng biến môi trường `EmailSettings__Password`

Không commit App Password thật lên repo vì lý do bảo mật!
