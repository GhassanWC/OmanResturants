import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Restaurant, MenuItem, Offer } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/src/components/ImageUpload';
import { 
  Plus, 
  Trash2, 
  Save, 
  BarChart3, 
  Settings, 
  Eye, 
  MessageCircle, 
  PhoneCall, 
  ChefHat, 
  Tag, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Store,
  MapPin,
  Zap,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function OwnerDashboard() {
  const { user, profile } = useAuth();
  const [restaurant, setRestaurant] = useState<Partial<Restaurant> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          setRestaurant({ id: doc.id, ...doc.data() });
        } else {
          // Initialize empty if doesn't exist
          setRestaurant({
            ownerId: user.uid,
            name: '',
            description: '',
            cuisineType: '',
            location: '',
            address: '',
            phone: '',
            whatsapp: '',
            instagram: '',
            logoUrl: '',
            coverImageUrl: '',
            galleryImages: [],
            menuItems: [],
            offers: [],
            openingHours: {
                'monday': '09:00 - 22:00',
                'tuesday': '09:00 - 22:00',
                'wednesday': '09:00 - 22:00',
                'thursday': '09:00 - 22:00',
                'friday': '09:00 - 23:00',
                'saturday': '10:00 - 23:00',
                'sunday': '10:00 - 21:00'
            },
            rating: 5,
            reviewCount: 0,
            views: 0,
            phoneClicks: 0,
            whatsappClicks: 0,
            isApproved: false,
            isFeatured: false,
            plan: 'free',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [user]);

  const handleSave = async () => {
    if (!restaurant || !user) return;
    setSaving(true);
    try {
      if (restaurant.id) {
        await updateDoc(doc(db, 'restaurants', restaurant.id), {
          ...restaurant,
          updatedAt: serverTimestamp()
        });
        toast.success("Profile updated successfully!");
      } else {
        const newDocRef = doc(collection(db, 'restaurants'));
        await setDoc(newDocRef, {
          ...restaurant,
          id: newDocRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setRestaurant({ ...restaurant, id: newDocRef.id });
        toast.success("Restaurant profile created! Awaiting admin approval.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
    setRestaurant(prev => ({
      ...prev!,
      menuItems: [...(prev?.menuItems || []), { name: '', description: '', price: 0 }]
    }));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    const updated = [...(restaurant?.menuItems || [])];
    updated[index] = { ...updated[index], [field]: value };
    setRestaurant(prev => ({ ...prev!, menuItems: updated }));
  };

  const removeMenuItem = (index: number) => {
    setRestaurant(prev => ({
      ...prev!,
      menuItems: prev?.menuItems?.filter((_, i) => i !== index)
    }));
  };

  const addOffer = () => {
    setRestaurant(prev => ({
      ...prev!,
      offers: [...(prev?.offers || []), { title: '', description: '' }]
    }));
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center">جاري تحميل لوحة التحكم...</div>;

  return (
    <div className="bg-gray-50 min-h-screen text-right">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse justify-between items-end gap-6">
            <div className="space-y-2 text-right">
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-bold px-3 py-1 uppercase tracking-widest text-[10px]">لوحة تحكم المالك</Badge>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex flex-row-reverse items-center gap-3">
                <Store size={32} className="text-orange-600" />
                إدارة {restaurant?.name || 'مطعمك'}
              </h1>
              <p className="text-gray-500 font-medium">تحكم في ملفك الشخصي العام، وشاهد التحليلات، وحدث قائمتك.</p>
            </div>
            <Button 
               onClick={handleSave} 
               disabled={saving}
               className="bg-orange-600 hover:bg-orange-700 text-white font-black h-16 px-10 rounded-2xl shadow-xl shadow-orange-600/20 gap-3 text-lg flex-row-reverse"
            >
              {saving ? 'جاري الحفظ...' : <><Save size={22} /> حفظ جميع التغييرات</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Stats Bar */}
          <div className="lg:col-span-full grid grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard label="إجمالي مشاهدات الملف الشخصي" value={restaurant?.views || 0} icon={<Eye className="text-blue-600" />} change="+12%" />
             <StatCard label="نقرات واتساب" value={restaurant?.whatsappClicks || 0} icon={<MessageCircle className="text-green-600" />} change="+5%" />
             <StatCard label="نقرات الهاتف" value={restaurant?.phoneClicks || 0} icon={<PhoneCall className="text-orange-600" />} change="+8%" />
             <StatCard label="حالة الموافقة" value={restaurant?.isApproved ? 'منشور' : 'قيد الانتظار'} icon={<CheckCircle2 className={restaurant?.isApproved ? 'text-green-600' : 'text-yellow-600'} />} accent={restaurant?.isApproved ? 'bg-green-100' : 'bg-yellow-100'} />
          </div>

          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-4">
                <Button variant="ghost" className="w-full justify-end font-black uppercase text-xs tracking-widest h-14 rounded-xl hover:bg-white hover:shadow-sm flex-row-reverse">
                   <Settings className="ml-3 text-orange-600" size={18} /> الإعدادات العامة
                </Button>
                <Button variant="ghost" className="w-full justify-end font-black uppercase text-xs tracking-widest h-14 rounded-xl hover:bg-white hover:shadow-sm flex-row-reverse">
                   <ChefHat className="ml-3 text-orange-600" size={18} /> محرر القائمة
                </Button>
                <Button variant="ghost" className="w-full justify-end font-black uppercase text-xs tracking-widest h-14 rounded-xl hover:bg-white hover:shadow-sm flex-row-reverse">
                   <TrendingUp className="ml-3 text-orange-600" size={18} /> تفاصيل التحليلات
                </Button>
             </div>
          </div>

          <div className="lg:col-span-3 space-y-12">
             <Tabs defaultValue="info" className="w-full">
                <TabsList className="bg-transparent h-auto mb-8 gap-4 border-b border-gray-200 rounded-none w-full justify-end p-0 flex-row-reverse">
                   <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent font-black uppercase text-xs tracking-widest h-12 px-6">المعلومات الأساسية</TabsTrigger>
                   <TabsTrigger value="images" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent font-black uppercase text-xs tracking-widest h-12 px-6">الصور</TabsTrigger>
                   <TabsTrigger value="menu" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent font-black uppercase text-xs tracking-widest h-12 px-6">أصناف القائمة</TabsTrigger>
                   <TabsTrigger value="offers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent font-black uppercase text-xs tracking-widest h-12 px-6">العروض</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-10 focus-visible:ring-0">
                   <Card className="rounded-[2rem] border-0 shadow-sm">
                      <CardContent className="p-10 space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                            <div className="space-y-3">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">اسم المطعم</Label>
                               <Input 
                                 placeholder="مثال: بيلا إيطاليا" 
                                 className="h-12 rounded-xl focus:ring-orange-600/10 border-gray-100 text-right" 
                                 value={restaurant?.name} 
                                 onChange={(e) => setRestaurant({...restaurant!, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">نوع المأكولات</Label>
                               <Input 
                                 placeholder="مثال: إيطالي، سوشي، إلخ" 
                                 className="h-12 rounded-xl border-gray-100 text-right" 
                                 value={restaurant?.cuisineType}
                                 onChange={(e) => setRestaurant({...restaurant!, cuisineType: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">وصف المطعم</Label>
                               <Textarea 
                                 placeholder="صف أجواء مطعمك، وأطباقك المميزة، والجو العام..." 
                                 className="min-h-[150px] rounded-2xl border-gray-100 font-serif text-lg leading-relaxed pt-4 text-right"
                                 value={restaurant?.description}
                                 onChange={(e) => setRestaurant({...restaurant!, description: e.target.value})}
                                />
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                   
                   <Card className="rounded-[2rem] border-0 shadow-sm">
                      <CardHeader className="px-10 pt-10 text-right">
                         <CardTitle className="uppercase font-black text-xl flex flex-row-reverse items-center gap-3">
                           <MapPin className="text-orange-600" /> الموقع والتواصل
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 pt-6 space-y-8 text-right">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">الحي/المدينة</Label>
                               <Input 
                                 placeholder="مثال: وسط المدينة" 
                                 className="h-12 rounded-xl border-gray-100 text-right"
                                 value={restaurant?.location}
                                 onChange={(e) => setRestaurant({...restaurant!, location: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">العنوان الكامل</Label>
                               <Input 
                                 placeholder="123 شارع الطعام، الحي" 
                                 className="h-12 rounded-xl border-gray-100 text-right"
                                 value={restaurant?.address}
                                 onChange={(e) => setRestaurant({...restaurant!, address: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-3">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">رقم الهاتف</Label>
                               <Input 
                                 placeholder="+966 50 000 0000" 
                                 className="h-12 rounded-xl border-gray-100 text-right font-sans"
                                 value={restaurant?.phone}
                                 onChange={(e) => setRestaurant({...restaurant!, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                               <Label className="font-black text-xs uppercase tracking-widest text-gray-400">رقم واتساب</Label>
                               <Input 
                                 placeholder="+966 50 000 0000" 
                                 className="h-12 rounded-xl border-gray-100 text-right font-sans"
                                 value={restaurant?.whatsapp}
                                 onChange={(e) => setRestaurant({...restaurant!, whatsapp: e.target.value})}
                                />
                            </div>
                        </div>
                      </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="images" className="space-y-10 focus-visible:ring-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <ImageUpload 
                      label="شعار المطعم" 
                      path="logos" 
                      currentUrl={restaurant?.logoUrl}
                      onUpload={(url) => setRestaurant({...restaurant!, logoUrl: url})}
                    />
                    <ImageUpload 
                      label="صورة الغلاف" 
                      path="covers" 
                      currentUrl={restaurant?.coverImageUrl}
                      onUpload={(url) => setRestaurant({...restaurant!, coverImageUrl: url})}
                    />
                  </div>
                  <Card className="rounded-[2rem] border-0 shadow-sm p-10 text-right">
                     <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">صور المعرض</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-row-reverse">
                        {restaurant?.galleryImages?.map((img, i) => (
                           <div key={i} className="relative h-32 rounded-2xl overflow-hidden group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setRestaurant({...restaurant!, galleryImages: restaurant?.galleryImages?.filter((_, idx) => idx !== i)})}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X size={14} />
                              </button>
                           </div>
                        ))}
                        <button className="h-32 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:bg-orange-50 hover:border-orange-400 transition-all text-gray-400 hover:text-orange-600 group">
                           <Plus size={24} className="group-hover:scale-125 transition-transform" />
                           <span className="text-[10px] font-black uppercase mt-1">إضافة صورة</span>
                           <input type="file" className="hidden" />
                        </button>
                     </div>
                  </Card>
                </TabsContent>

                <TabsContent value="menu" className="space-y-8 focus-visible:ring-0 text-right">
                   <div className="flex flex-row-reverse justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
                      <div className="text-right">
                        <h3 className="text-xl font-black uppercase tracking-tight">قائمة طعامك الرقمية</h3>
                        <p className="text-gray-400 font-medium">أضف أطباقك المميزة لجذب العملاء.</p>
                      </div>
                      <Button onClick={addMenuItem} className="bg-orange-100 text-orange-600 hover:bg-orange-200 font-black px-6 gap-2 flex-row-reverse">
                         <Plus size={18} /> إضافة طبق
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {restaurant?.menuItems?.map((item, i) => (
                        <Card key={i} className="rounded-3xl border-gray-100 hover:border-orange-200 transition-all overflow-hidden text-right">
                           <CardContent className="p-6 space-y-6">
                              <div className="flex flex-row-reverse justify-between items-start">
                                 <Badge className="bg-gray-100 text-gray-500 font-bold uppercase tracking-widest text-[9px] font-sans">DISH #{i+1}</Badge>
                                 <button onClick={() => removeMenuItem(i)} className="text-gray-300 hover:text-red-600 transition-colors">
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                              <div className="space-y-4">
                                 <Input 
                                   placeholder="اسم الطبق" 
                                   className="h-10 rounded-xl text-right"
                                   value={item.name}
                                   onChange={(e) => updateMenuItem(i, 'name', e.target.value)}
                                  />
                                 <Textarea 
                                   placeholder="وصف قصير..." 
                                   className="rounded-xl h-20 text-right"
                                   value={item.description}
                                   onChange={(e) => updateMenuItem(i, 'description', e.target.value)}
                                  />
                                 <div className="flex flex-row-reverse items-center gap-2 font-sans">
                                     <span className="font-bold text-gray-400">$</span>
                                     <Input 
                                       type="number" 
                                       placeholder="السعر" 
                                       className="h-10 rounded-xl text-right"
                                       value={item.price}
                                       onChange={(e) => updateMenuItem(i, 'price', parseFloat(e.target.value))}
                                      />
                                 </div>
                              </div>
                           </CardContent>
                        </Card>
                      ))}
                      {restaurant?.menuItems?.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                           <ChefHat size={48} className="mx-auto text-gray-200 mb-4" />
                           <p className="text-gray-400 font-medium">لا توجد أصناف في القائمة بعد. ابدأ بإضافة طبق!</p>
                        </div>
                      )}
                   </div>
                </TabsContent>

                <TabsContent value="offers" className="space-y-8 focus-visible:ring-0 text-right">
                  <div className="flex flex-row-reverse justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
                      <div className="text-right">
                        <h3 className="text-xl font-black uppercase tracking-tight">العروض النشطة</h3>
                        <p className="text-gray-400 font-medium">روج لعروضك الخاصة واكسب المزيد من الزوار.</p>
                      </div>
                      <Button onClick={addOffer} className="bg-orange-600 text-white hover:bg-orange-700 font-black px-6 gap-2 flex-row-reverse">
                         <Plus size={18} /> إنشاء عرض
                      </Button>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-6">
                     {restaurant?.offers?.map((offer, i) => (
                        <Card key={i} className="rounded-3xl border-dashed border-orange-200 bg-orange-50/20 text-right">
                           <CardContent className="p-8 flex flex-col md:flex-row-reverse gap-8 font-sans">
                              <div className="flex-1 space-y-4 text-right font-sans">
                                 <Input 
                                   placeholder="عنوان العرض (مثال: خصم 50% على البرجر أيام الجمعة)" 
                                   className="h-12 rounded-xl bg-white text-right"
                                   value={offer.title}
                                   onChange={(e) => {
                                      const updated = [...(restaurant?.offers || [])];
                                      updated[i] = { ...updated[i], title: e.target.value };
                                      setRestaurant({...restaurant!, offers: updated});
                                   }}
                                  />
                                 <Textarea 
                                   placeholder="تفاصيل العرض وشروطه..." 
                                   className="rounded-xl h-24 bg-white text-right"
                                   value={offer.description}
                                   onChange={(e) => {
                                      const updated = [...(restaurant?.offers || [])];
                                      updated[i] = { ...updated[i], description: e.target.value };
                                      setRestaurant({...restaurant!, offers: updated});
                                   }}
                                  />
                              </div>
                              <div className="w-full md:w-64">
                                 <ImageUpload 
                                    label="صورة العرض" 
                                    path="offers" 
                                    currentUrl={offer.imageUrl}
                                    onUpload={(url) => {
                                       const updated = [...(restaurant?.offers || [])];
                                       updated[i] = { ...updated[i], imageUrl: url };
                                       setRestaurant({...restaurant!, offers: updated});
                                    }}
                                 />
                              </div>
                           </CardContent>
                        </Card>
                      ))}
                   </div>
                </TabsContent>
             </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, change, accent = 'bg-white' }: { label: string, value: any, icon: React.ReactNode, change?: string, accent?: string }) {
  return (
    <Card className={`rounded-[2rem] border-0 shadow-sm ${accent} overflow-hidden group text-right`}>
      <CardContent className="p-8">
         <div className="flex flex-row-reverse justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-300">
               {icon}
            </div>
            {change && (
               <Badge className="bg-green-50 text-green-600 border-0 font-bold flex flex-row-reverse gap-1 font-sans">
                 <TrendUp size={12} /> {change}
               </Badge>
            )}
         </div>
         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</h4>
         <p className="text-3xl font-black text-gray-900 tracking-tighter font-sans">{value}</p>
      </CardContent>
    </Card>
  );
}

function TrendUp({ size }: { size: number }) {
  return <TrendingUp size={size} /> ;
}
