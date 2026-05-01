import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { Restaurant } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Star, 
  Eye, 
  ExternalLink, 
  Trash2, 
  Utensils, 
  Zap,
  Users,
  BarChart4
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'restaurants'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setRestaurants(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleApprove = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'restaurants', id), { isApproved: !current });
      toast.success(`تم ${!current ? 'الموافقة على' : 'إلغاء الموافقة على'} المطعم`);
      fetchRestaurants();
    } catch (e) {
      toast.error("فشلت العملية");
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
     try {
      await updateDoc(doc(db, 'restaurants', id), { isFeatured: !current });
      toast.success(`تم تحديث حالة التمييز`);
      fetchRestaurants();
    } catch (e) {
      toast.error("فشلت العملية");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المطعم؟")) return;
    try {
      await deleteDoc(doc(db, 'restaurants', id));
      toast.success("تم حذف القائمة");
      fetchRestaurants();
    } catch (e) {
      toast.error("فشل الحذف");
    }
  };

  const handleSeedData = async () => {
    try {
      const sampleCategories = [
        { name: 'إيطالي', slug: 'italian', icon: '🍕' },
        { name: 'آسيوي', slug: 'asian', icon: '🍜' },
        { name: 'برجر', slug: 'burgers', icon: '🍔' }
      ];

      for (const cat of sampleCategories) {
        await addDoc(collection(db, 'categories'), cat);
      }

      const sampleRestaurant = {
        name: "لأوستيريا سوبريم",
        ownerId: auth.currentUser?.uid,
        description: "اختبر تجربة تناول طعام إيطالية أصيلة في قلب المدينة. الباستا لدينا محضرة يدوياً يومياً باستخدام وصفات تقليدية متوارثة عبر الأجيال.",
        cuisineType: "إيطالي",
        location: "وسط المدينة",
        address: "123 زقاق الباستا",
        phone: "+966 50 123 4567",
        whatsapp: "+966 50 123 4567",
        instagram: "https://instagram.com/losteria",
        logoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=200",
        coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7ed934c4a3?auto=format&fit=crop&q=80&w=1200",
        rating: 4.8,
        reviewCount: 124,
        views: 1200,
        phoneClicks: 45,
        whatsappClicks: 32,
        isApproved: true,
        isFeatured: true,
        plan: 'featured',
        menuItems: [
          { name: 'بيتزا مارجريتا', description: 'ريحان طازج، موتزاريلا، صلصة طماطم', price: 14 },
          { name: 'باستا الترفل', description: 'تاغلياتيل محلية الصنع مع كريمة الترفل الأسود', price: 24 }
        ],
        offers: [
          { title: 'ساعة السعادة', description: 'خصم 50% على جميع الكوكتيلات من 5-7 مساءً', discountBadge: 'خصم 50%' }
        ],
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'restaurants'), sampleRestaurant);
      toast.success("تم إدراج البيانات التجريبية!");
      fetchRestaurants();
    } catch (e) {
      console.error(e);
      toast.error("فشل إدراج البيانات");
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center">جاري تحميل لوحة الإدارة...</div>;

  const stats = {
    total: restaurants.length,
    pending: restaurants.filter(r => !r.isApproved).length,
    featured: restaurants.filter(r => r.isFeatured).length,
  };

  return (
    <div className="bg-gray-50 min-h-screen text-right">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white py-20 px-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-row-reverse items-center gap-4 mb-6">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-lg">
               <ShieldCheck size={32} />
            </div>
            <div className="text-right">
               <h1 className="text-4xl font-black uppercase tracking-tighter">مركز القيادة</h1>
               <p className="text-gray-400 font-medium">إدارة قوائم السوق، والموافقات، والترقيات المميزة.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
             <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-right">
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2 flex flex-row-reverse items-center gap-2">
                   <Utensils size={14} className="text-orange-500" /> إجمالي القوائم
                </p>
                <div className="text-4xl font-black font-sans">{stats.total}</div>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-right">
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2 flex flex-row-reverse items-center gap-2 text-yellow-500">
                   <Zap size={14} fill="currentColor" /> في انتظار الموافقة
                </p>
                <div className="text-4xl font-black font-sans">{stats.pending}</div>
             </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-right">
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2 flex flex-row-reverse items-center gap-2 text-cyan-500">
                   <Star size={14} fill="currentColor" /> أماكن مميزة
                </p>
                <div className="text-4xl font-black font-sans">{stats.featured}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Database View */}
      <div className="container mx-auto px-4 -mt-10 mb-24">
        <Card className="rounded-[2.5rem] border-0 shadow-2xl overflow-hidden bg-white">
           <CardHeader className="p-10 border-b border-gray-100 flex flex-col md:flex-row-reverse items-center justify-between gap-4">
              <div className="text-right">
                <CardTitle className="font-black text-2xl uppercase tracking-tighter">مخزون المطاعم</CardTitle>
                <p className="text-gray-400 font-medium">مراجعة وتعديل جميع ملفات المطاعم في النظام.</p>
              </div>
              <div className="flex flex-row-reverse gap-2">
                <Button variant="outline" className="font-bold border-orange-200 text-orange-600" onClick={handleSeedData}>
                   إدراج بيانات تجريبية
                </Button>
                <Button variant="outline" className="font-bold gap-2" onClick={fetchRestaurants}>
                   تحديث قاعدة البيانات
                </Button>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead>
                       <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">المطعم</th>
                          <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">الحالة</th>
                          <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">الوصول</th>
                          <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">الفئة</th>
                          <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">الإجراءات</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       <AnimatePresence>
                         {restaurants.map((res) => (
                            <motion.tr 
                              key={res.id} 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="group hover:bg-orange-50/30 transition-all font-medium"
                            >
                               <td className="px-10 py-8">
                                  <div className="flex flex-row-reverse items-center gap-4">
                                     <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-200">
                                        <img src={res.logoUrl || 'https://picsum.photos/seed/logo/200/200'} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="text-right">
                                        <h4 className="font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{res.name}</h4>
                                        <p className="text-xs text-gray-400">{res.cuisineType} • {res.location}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="flex justify-end">
                                    {res.isApproved ? (
                                       <Badge className="bg-green-100 text-green-700 border-0 flex flex-row-reverse gap-1.5 w-fit font-bold uppercase tracking-widest text-[9px]">
                                          <CheckCircle2 size={10} /> منشور
                                       </Badge>
                                    ) : (
                                       <Badge className="bg-yellow-100 text-yellow-700 border-0 flex flex-row-reverse gap-1.5 w-fit font-bold uppercase tracking-widest text-[9px]">
                                          <Zap size={10} /> يحتاج مراجعة
                                       </Badge>
                                    )}
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="flex flex-col items-end gap-1 font-sans">
                                     <div className="text-sm font-black flex flex-row-reverse items-center gap-1.5">
                                        <Eye size={14} className="text-gray-400" /> {res.views}
                                     </div>
                                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">تقييم {(res.rating ?? 0).toFixed(1)} / 5.0</div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="flex flex-row-reverse justify-start gap-2">
                                     <Badge variant="outline" className={`border-2 uppercase text-[9px] font-black ${res.isFeatured ? 'border-cyan-500 text-cyan-600' : 'border-gray-200 text-gray-400'}`}>
                                        {res.isFeatured ? 'مميز' : 'أساسي'}
                                     </Badge>
                                     <Badge variant="secondary" className="bg-gray-100 text-gray-600 uppercase text-[9px] font-black">
                                        {res.plan}
                                     </Badge>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-left">
                                  <div className="flex items-center justify-start gap-2">
                                     <Button 
                                       size="sm" 
                                       onClick={() => handleApprove(res.id, res.isApproved)}
                                       className={res.isApproved ? "bg-yellow-500 hover:bg-yellow-600 text-white font-bold flex-row-reverse" : "bg-green-600 hover:bg-green-700 text-white font-bold flex-row-reverse"}
                                     >
                                        {res.isApproved ? <XCircle size={14} className="ml-1" /> : <CheckCircle2 size={14} className="ml-1" />}
                                        {res.isApproved ? 'إيقاف' : 'موافقة'}
                                     </Button>
                                     <Button 
                                        size="icon" 
                                        variant="outline" 
                                        onClick={() => handleToggleFeatured(res.id, res.isFeatured)}
                                        className={res.isFeatured ? "text-cyan-600 border-cyan-200 bg-cyan-50" : "text-gray-400 border-gray-200"}
                                     >
                                        <Star size={16} fill={res.isFeatured ? "currentColor" : "none"} />
                                     </Button>
                                     <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(res.id)}>
                                        <Trash2 size={16} />
                                     </Button>
                                     <a href={`/restaurant/${res.id}`} target="_blank" className="p-2 text-gray-400 hover:text-orange-600">
                                        <ExternalLink size={16} />
                                     </a>
                                  </div>
                               </td>
                            </motion.tr>
                         ))}
                       </AnimatePresence>
                    </tbody>
                 </table>
                 {restaurants.length === 0 && (
                    <div className="p-20 text-center">
                       <BarChart4 size={48} className="mx-auto text-gray-200 mb-4" />
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">قاعدة البيانات فارغة.</p>
                    </div>
                 )}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
