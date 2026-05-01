import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Search, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle,
  UtensilsCrossed
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
          <UtensilsCrossed size={22} />
        </div>
        <span className="font-bold text-xl tracking-tight hidden sm:block">
          سوق <span className="text-orange-600">المطاعم</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link to="/restaurants" className="hover:text-orange-600 transition-colors">تصفح</Link>
        <Link to="/#offers" className="hover:text-orange-600 transition-colors">العروض</Link>
        <Link to="/#categories" className="hover:text-orange-600 transition-colors">الفئات</Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-10 w-10 rounded-full focus:outline-none transition-transform active:scale-95">
              <Avatar className="h-10 w-10 border-2 border-orange-50 cursor-pointer">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {user.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal text-right">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-[10px] uppercase font-bold text-orange-600 mt-1 tracking-wider">{profile?.role === 'admin' ? 'مدير' : 'صاحب مطعم'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile?.role === 'restaurant_owner' && (
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-right justify-end">
                  <span>لوحة التحكم</span>
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              )}
              {profile?.role === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="text-right justify-end">
                  <span>لوحة المسؤول</span>
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/profile')} className="text-right justify-end">
                <span>الملف الشخصي</span>
                <UserIcon className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 text-right justify-end">
                <span>تسجيل الخروج</span>
                <LogOut className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/auth?role=restaurant_owner" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-orange-700 hover:text-orange-800 hover:bg-orange-50 font-semibold">
                أعلن معنا
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 shadow-md">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-right">
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center gap-2 mb-6 justify-end">
              <span className="font-bold text-lg tracking-tight">
                سوق <span className="text-orange-600">المطاعم</span>
              </span>
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                <UtensilsCrossed size={18} />
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              المنصة الرائدة لاكتشاف أفضل تجارب الطعام، وأحدث العروض، والقوائم اللذيذة في مدينتك.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">المنصة</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link to="/restaurants" className="hover:text-orange-600">تصفح المطاعم</Link></li>
              <li><Link to="/#offers" className="hover:text-orange-600">العروض الخاصة</Link></li>
              <li><Link to="/#categories" className="hover:text-orange-600">أنواع المأكولات</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">للملاك</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link to="/auth?role=restaurant_owner" className="hover:text-orange-600">أضف مطعمك</Link></li>
              <li><Link to="/advertising" className="hover:text-orange-600">خطط الإعلان</Link></li>
              <li><Link to="/dashboard" className="hover:text-orange-600">لوحة تحكم المالك</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">اتصل بنا</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li>support@restaurantsouq.com</li>
              <li>+1 (555) 000-Souq</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row-reverse justify-between items-center gap-4">
          <p className="text-gray-400 text-xs font-medium">© 2026 سوق المطاعم. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6 text-xs text-gray-400 font-medium">
            <Link to="/privacy" className="hover:text-gray-600">سياسة الخصوصية</Link>
            <Link to="/terms" className="hover:text-gray-600">شروط الخدمة</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};
