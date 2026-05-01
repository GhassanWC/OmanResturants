import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { Restaurant, Review } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Instagram, 
  Clock, 
  Star, 
  Share2, 
  Heart, 
  ChevronRight,
  ExternalLink,
  Utensils,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from "sonner";

export default function RestaurantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'restaurants', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Restaurant;
          setRestaurant(data);
          
          // Increment views
          await updateDoc(docRef, { views: increment(1) });

          // Fetch reviews
          const reviewsQ = query(collection(db, 'restaurants', id, 'reviews'), orderBy('createdAt', 'desc'), limit(10));
          const reviewsSnap = await getDocs(reviewsQ);
          setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center">جاري تحميل تفاصيل المطعم...</div>;
  if (!restaurant) return <div className="h-screen w-full flex items-center justify-center">المطعم غير موجود</div>;

  const trackClick = async (type: 'phone' | 'whatsapp') => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'restaurants', id), { 
        [type === 'phone' ? 'phoneClicks' : 'whatsappClicks']: increment(1) 
      });
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="bg-white min-h-screen text-right">
      {/* Hero Header */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          src={restaurant.coverImageUrl || 'https://picsum.photos/seed/hero/1920/1080'} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12">
           <div className="container mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row-reverse items-end gap-6 md:gap-10"
              >
                <div className="w-24 h-24 md:w-40 md:h-40 bg-white p-2 rounded-[2rem] shadow-2xl overflow-hidden shrink-0 border-4 border-white transform -mb-4 md:-mb-12">
                   <img src={restaurant.logoUrl || 'https://picsum.photos/seed/logo/400/400'} alt="logo" className="w-full h-full object-cover rounded-[1.5rem]" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-1 space-y-3 pb-4">
                  <div className="flex flex-row-reverse flex-wrap items-center gap-3">
                    <Badge className="bg-orange-600 text-white border-0 font-black tracking-widest">{restaurant.cuisineType}</Badge>
                    {restaurant.isFeatured && <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 border-0 font-black">الأفضل مبيعاً</Badge>}
                    <div className="flex flex-row-reverse items-center gap-1.5 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black">
                       <Star size={14} fill="#facc15" stroke="#facc15" />
                       <span className="font-sans">{restaurant.rating.toFixed(1)} ({restaurant.reviewCount} تقييم)</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">{restaurant.name}</h1>
                  <p className="text-white/80 font-medium text-lg flex flex-row-reverse items-center gap-2">
                    <MapPin size={20} className="text-orange-500" />
                    {restaurant.address}، {restaurant.location}
                  </p>
                </div>

                <div className="flex gap-2 pb-4">
                  <Button size="icon" variant="secondary" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-orange-600 border-0">
                    <Heart size={20} />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-orange-600 border-0">
                    <Share2 size={20} />
                  </Button>
                </div>
              </motion.div>
           </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Info & Tabs */}
          <div className="lg:col-span-2 space-y-16">
             {/* Description */}
             <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex flex-row-reverse items-center gap-3">
                   عن المطعم
                   <div className="h-1 flex-1 bg-orange-100 rounded-full" />
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-serif">
                  {restaurant.description}
                </p>
             </div>

             {/* Content Tabs */}
             <Tabs defaultValue="menu" onValueChange={setActiveTab} className="bg-white">
                <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl h-16 w-full mb-10 overflow-x-auto justify-end no-scrollbar flex-row-reverse">
                   <TabsTrigger value="menu" className="flex-1 md:flex-none uppercase font-black text-xs tracking-widest h-full rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm px-8">القائمة</TabsTrigger>
                   <TabsTrigger value="offers" className="flex-1 md:flex-none uppercase font-black text-xs tracking-widest h-full rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm px-8">عروض خاصة</TabsTrigger>
                   <TabsTrigger value="gallery" className="flex-1 md:flex-none uppercase font-black text-xs tracking-widest h-full rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm px-8">المعرض</TabsTrigger>
                   <TabsTrigger value="reviews" className="flex-1 md:flex-none uppercase font-black text-xs tracking-widest h-full rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm px-8">التقييمات</TabsTrigger>
                </TabsList>

                <TabsContent value="menu" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {restaurant.menuItems?.length > 0 ? restaurant.menuItems.map((item, i) => (
                      <div key={i} className="flex flex-row-reverse gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={item.imageUrl || 'https://picsum.photos/seed/dish/200/200'} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="py-1 text-right">
                          <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase">{item.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                          <span className="font-black text-orange-600 font-sans">${item.price}</span>
                        </div>
                      </div>
                    )) : (
                       <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                         <Utensils size={32} className="mx-auto mb-4" />
                         <p>يتم تحديث القائمة حالياً. يرجى الاتصال بالمطعم لمزيد من التفاصيل.</p>
                       </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="offers">
                   <div className="space-y-6">
                      {restaurant.offers?.length > 0 ? restaurant.offers.map((offer, i) => (
                        <Card key={i} className="overflow-hidden border-orange-200 bg-orange-50/20 border-dashed">
                           <CardContent className="p-0 flex flex-col md:flex-row-reverse">
                             <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden">
                                <img src={offer.imageUrl || 'https://picsum.photos/seed/offer/400/400'} alt={offer.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             </div>
                             <div className="p-8 flex-1 text-right">
                                <Badge className="mb-4 bg-orange-600 text-white border-0 font-bold px-3 py-1">عرض خاص</Badge>
                                <h4 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">{offer.title}</h4>
                                <p className="text-gray-600 font-medium">{offer.description}</p>
                                {offer.discountBadge && (
                                  <div className="mt-6 flex flex-row-reverse items-center gap-2 text-orange-700 font-black italic">
                                     <Zap size={20} fill="currentColor" /> {offer.discountBadge}
                                  </div>
                                )}
                             </div>
                           </CardContent>
                        </Card>
                      )) : (
                        <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <AlertCircle size={32} className="mx-auto mb-4" />
                          <p>لا توجد عروض نشطة حالياً. ابقَ على اطلاع!</p>
                        </div>
                      )}
                   </div>
                </TabsContent>

                <TabsContent value="gallery">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {restaurant.galleryImages?.length > 0 ? restaurant.galleryImages.map((img, i) => (
                       <motion.div 
                         key={i} 
                         whileHover={{ scale: 1.05 }}
                         className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm cursor-pointer border border-gray-100"
                        >
                         <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       </motion.div>
                     )) : (
                        <div className="col-span-full py-24 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <ImageIcon size={32} className="mx-auto mb-4" />
                          <p>معرض الصور فارغ.</p>
                        </div>
                      )}
                   </div>
                </TabsContent>

                <TabsContent value="reviews">
                   <div className="space-y-10">
                     <div className="flex flex-row-reverse items-center justify-between">
                        <h3 className="text-xl font-black uppercase text-gray-900">تعليقات العملاء</h3>
                        <Button variant="outline" className="font-bold border-orange-200 text-orange-600 hover:bg-orange-50">اكتب تقييماً</Button>
                     </div>
                     
                     <div className="space-y-8">
                       {reviews.map(review => (
                          <div key={review.id} className="flex flex-row-reverse gap-6 p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                            <Avatar className="h-14 w-14 border-2 border-white shadow-sm shrink-0">
                               <AvatarImage src={review.userPhoto} />
                               <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">{review.userName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 text-right flex-1">
                               <div className="flex flex-row-reverse items-center gap-3">
                                  <h4 className="font-bold text-gray-900">{review.userName}</h4>
                                  <div className="flex items-center gap-0.5 text-yellow-500">
                                     {Array.from({ length: 5 }).map((_, i) => (
                                         <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                     ))}
                                  </div>
                               </div>
                               <p className="text-gray-600 italic font-medium">"{review.comment}"</p>
                               <span className="text-xs text-gray-400 font-bold uppercase tracking-tight font-sans">{(review.createdAt?.toDate() as Date)?.toLocaleDateString()}</span>
                            </div>
                          </div>
                       ))}
                       {reviews.length === 0 && <p className="text-center text-gray-400 py-12">لا توجد تقييمات بعد. كن أول من يشاركنا رأيه!</p>}
                     </div>
                   </div>
                </TabsContent>
             </Tabs>
          </div>

          {/* Right Column: Contact & Sidebar */}
          <div className="space-y-8">
             <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-gray-900 text-white overflow-hidden sticky top-24">
                <CardHeader className="p-10 pb-0 text-right">
                   <CardTitle className="text-3xl font-black uppercase tracking-tighter font-sans">تواصل واحجز</CardTitle>
                   <p className="text-gray-400 font-medium">تواصل مباشرة للحجز أو الاستفسار</p>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                   <div className="grid grid-cols-1 gap-4">
                      <a 
                        href={`tel:${restaurant.phone}`}
                        onClick={() => trackClick('phone')}
                        className="h-16 w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-600/20 gap-3 flex flex-row-reverse items-center justify-center transition-all active:scale-95"
                      >
                         {restaurant.phone} <Phone size={24} />
                      </a>
                      <a 
                        href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g,'')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => trackClick('whatsapp')}
                        className="h-16 w-full rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-lg shadow-xl shadow-green-500/20 gap-3 flex flex-row-reverse items-center justify-center transition-all active:scale-95"
                      >
                         راسلنا عبر واتساب <MessageSquare size={24} />
                      </a>
                   </div>
                   
                   <div className="pt-8 space-y-6 border-t border-white/10 text-right">
                      <div>
                         <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex flex-row-reverse items-center gap-2">
                           <Clock size={14} className="text-orange-500" />
                           ساعات العمل
                         </h5>
                         <div className="space-y-3 font-sans">
                           {Object.entries(restaurant.openingHours || {}).map(([day, hours]) => (
                             <div key={day} className="flex flex-row-reverse justify-between text-sm font-bold border-b border-white/5 pb-2">
                               <span className="text-gray-400">{{'monday':'الاثنين','tuesday':'الثلاثاء','wednesday':'الأربعاء','thursday':'الخميس','friday':'الجمعة','saturday':'السبت','sunday':'الأحد'}[day.toLowerCase()] || day}</span>
                               <span className="text-orange-400">{hours}</span>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="flex flex-row-reverse gap-4 pt-4">
                         {restaurant.instagram && (
                            <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                               <Instagram size={24} />
                            </a>
                         )}
                         <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address + ' ' + restaurant.location)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                            <ExternalLink size={24} />
                         </a>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Offers Card (Floating if space permits or just static) */}
             {restaurant.offers?.length > 0 && (
                <div className="bg-orange-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group text-right">
                   <div className="absolute top-0 left-0 p-4">
                      <Zap size={40} className="text-white/20 rotate-12 group-hover:rotate-0 transition-all duration-500 shrink-0" />
                   </div>
                   <h4 className="text-3xl font-black uppercase tracking-tighter mb-2">عروض مستمرة</h4>
                   <p className="text-orange-100 font-medium text-sm mb-6">لا تفوت هذه العروض الحصرية المتاحة اليوم!</p>
                   <Button variant="secondary" className="w-full bg-white text-orange-600 font-bold rounded-xl" onClick={() => setActiveTab('offers')}>
                      كشف الخصومات
                   </Button>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
