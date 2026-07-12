import "server-only";
import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // bỏ ký tự dễ nhầm (0/O, 1/l/I)

/**
 * Sinh mật khẩu mặc định ngẫu nhiên riêng cho từng tài khoản mới (thay vì hằng số cố định).
 * Vẫn hiển thị ngay cho người vừa đăng ký (đúng UX đã chốt ở project-brief.md câu 17),
 * nhưng không còn là 1 chuỗi giống nhau cho MỌI tài khoản — chặn kiểu tấn công "thử mật khẩu
 * mặc định cố định trên mọi số điện thoại mà không cần đăng ký trước".
 */
export function generateDefaultPassword(length = 10): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomInt(ALPHABET.length)];
  }
  return result;
}
