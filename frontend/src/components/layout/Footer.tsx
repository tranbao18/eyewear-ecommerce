import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-6">MẮT KÍNH</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Chúng tôi mang đến những chiếc kính mát và kính cận thiết kế hiện đại, chất lượng cao với mức giá vô cùng hợp lý. Phù hợp cho mọi khuôn mặt và phong cách sống.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Danh Mục</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/products?category=kinh-ram" className="hover:text-white transition-colors">Kính Râm Nam/Nữ</Link></li>
              <li><Link href="/products?category=kinh-can" className="hover:text-white transition-colors">Gọng Kính Cận</Link></li>
              <li><Link href="/products?category=phu-kien" className="hover:text-white transition-colors">Phụ Kiện Kính</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Bộ Sưu Tập Mới</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Hỗ Trợ</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">Câu Hỏi Thường Gặp</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Chính Sách Giao Hàng</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Đổi Trả & Bảo Hành</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Điều Khoản Dịch Vụ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider">Liên Hệ</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 text-white" />
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0 text-white" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0 text-white" />
                <span>hello@matkinh.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 MẮT KÍNH. Bản quyền thuộc về MẮT KÍNH.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white">Visa</span>
            <span className="cursor-pointer hover:text-white">Mastercard</span>
            <span className="cursor-pointer hover:text-white">MoMo</span>
            <span className="cursor-pointer hover:text-white">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
