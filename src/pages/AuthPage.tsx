import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Store, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage() {
  const { signIn, user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedRole = searchParams.get('role') as any;
  const [role, setRole] = useState<any>(requestedRole || 'customer');

  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'restaurant_owner') navigate('/dashboard');
      else if (profile.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-200">
              <UtensilsCrossed size={32} />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">مرحباً بك</CardTitle>
              <CardDescription className="text-gray-500">
                انضم إلى سوق المطاعم الرائد
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-right">
            {!requestedRole && (
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">المتابعة كـ:</Label>
                <RadioGroup defaultValue={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
                    <Label
                      htmlFor="customer"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-orange-50 hover:text-orange-900 peer-data-[state=checked]:border-orange-600 [&:has([data-state=checked])]:border-orange-600 cursor-pointer transition-all"
                    >
                      <UserIcon className="mb-3 h-6 w-6" />
                      <span className="text-sm font-bold">زائر</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="restaurant_owner" id="owner" className="peer sr-only" />
                    <Label
                      htmlFor="owner"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-orange-50 hover:text-orange-900 peer-data-[state=checked]:border-orange-600 [&:has([data-state=checked])]:border-orange-600 cursor-pointer transition-all"
                    >
                      <Store className="mb-3 h-6 w-6" />
                      <span className="text-sm font-bold">مالك مطعم</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            <Button 
              onClick={() => signIn(role)} 
              className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 h-12 text-base font-semibold shadow-sm group transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 ml-3" />
              تسجيل الدخول باستخدام جوجل
            </Button>
          </CardContent>
          <CardFooter className="text-center justify-center">
            <p className="text-xs text-gray-400 max-w-[240px]">
              باستمرارك، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
