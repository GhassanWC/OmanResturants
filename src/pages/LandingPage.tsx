import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Utensils, Star, ArrowRight, Zap, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Restaurant, Category } from '@/src/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { name: 'إيطالي', icon: '🍕', slug: 'italian' },
  { name: 'آسيوي', icon: '🍜', slug: 'asian' },
  { name: 'برجر', icon: '🍔', slug: 'burgers' },
  { name: 'صحي', icon: '🥗', slug: 'healthy' },
  { name: 'حلويات', icon: '🍰', slug: 'desserts' },
  { name: 'قهوة', icon: '☕', slug: 'coffee' },
];

export default function LandingPage() {
  const [featured, setFeatured] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'restaurants'),
          where('isApproved', '==', true),
          where('isFeatured', '==', true),
          limit(3)
        );
        const snap = await getDocs(q);
        setFeatured(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col text-right">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="input_file_0.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-8 px-5 py-2 text-white border-white/30 bg-white/10 backdrop-blur-md text-xs font-black tracking-[0.2em] uppercase">
              المنصة الأولى لاكتشاف المطاعم في منطقتك
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1] tracking-tight">
              تذوق <br /> 
              <span className="text-orange-500 font-serif italic">الإبداع في كل طبق</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              نقوم بربطك بأرقى تجارب الطعام والمطاعم الأكثر تميزاً، مباشرة من هاتفك إلى مائدتك.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto group">
              <div className="flex flex-col md:flex-row items-center bg-white/10 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/20 shadow-2xl transition-all focus-within:bg-white shadow-orange-950/20">
                <div className="flex-1 flex items-center w-full px-4">
                  <Search size={22} className="text-orange-500" />
                  <Input 
                    type="text" 
                    placeholder="ابحث عن مطعم أو نوع طعام..." 
                    className="border-0 focus-visible:ring-0 text-xl h-16 bg-transparent placeholder:text-gray-400 text-right w-full font-bold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto h-16 px-12 rounded-3xl bg-orange-600 hover:bg-orange-700 text-xl font-black shadow-xl shadow-orange-600/40 transition-all active:scale-95">
                  ابدأ الاستكشاف
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs md:text-sm font-black text-white/80 uppercase tracking-widest">
                <span className="text-orange-400">شائع الآن:</span>
                {['ستيك هاوس', 'سوشي بار', 'مطاعم عائلية'].map(tag => (
                  <button key={tag} onClick={() => setSearchQuery(tag)} className="hover:text-white transition-colors border-b border-white/20 pb-0.5">
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-90 mb-4 h-12">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-row-reverse justify-between items-end mb-12">
            <div className="text-right">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">تصفح الفئات</h2>
              <p className="text-gray-500 font-medium">استكشف المطاعم حسب تخصصات مأكولاتها</p>
            </div>
            <Link to="/restaurants">
              <Button variant="ghost" className="text-orange-600 font-bold hover:bg-orange-50 gap-2 flex-row-reverse">
                عرض كل المأكولات <ArrowRight size={18} className="rotate-180" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/restaurants?cuisine=${cat.slug}`}>
                  <Card className="group hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 transition-all cursor-pointer overflow-hidden border-gray-100">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                      <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-right">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
              تم اختيارها لك بعناية
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">المطاعم المميزة</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">جرب المطاعم الأكثر شهرة والأعلى تقييماً على منصتنا.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-[450px] animate-pulse border border-gray-100 shadow-sm" />
              ))
            ) : featured.length > 0 ? (
              featured.map((rest, i) => (
                <RestaurantCard key={rest.id} restaurant={rest} i={i} />
              ))
            ) : (
                <p className="col-span-full text-center text-gray-400 italic py-12">لا توجد مطاعم مميزة بعد. ابقَ على اطلاع!</p>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link to="/restaurants">
              <Button size="lg" className="bg-gray-900 hover:bg-black text-white px-10 h-14 rounded-xl font-bold shadow-xl">
                استكشف كل المطاعم
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Owner CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-600 -z-10" />
        <div className="container mx-auto px-4 relative text-right">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                نمِّ عمل مطعمك <br />
                التجاري معنا.
              </h2>
              <div className="space-y-6 mb-10">
                 <div className="flex flex-row-reverse items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">عزز ظهورك</h4>
                    <p className="text-orange-100">ضع مطعمك أمام آلاف المتسوقين الجائعين كل شهر.</p>
                  </div>
                </div>
                <div className="flex flex-row-reverse items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">زيادة الزوار</h4>
                    <p className="text-orange-100">حول زوار الملف الشخصي عبر الإنترنت إلى عملاء حقيقيين عبر الواتساب والهاتف.</p>
                  </div>
                </div>
              </div>
              <Link to="/auth?role=restaurant_owner">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-10 h-16 rounded-2xl font-black text-xl shadow-2xl">
                  ابدأ الإعلان الآن
                </Button>
              </Link>
            </div>
            <div className="relative">
               <motion.div 
                 initial={{ rotate: 12, scale: 0.8, opacity: 0 }}
                 whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                 className="bg-white rounded-[40px] p-4 shadow-3xl shadow-black/20"
               >
                 <img 
                   src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000" 
                   alt="Restaurant Dashboard Preview" 
                   className="rounded-[28px] w-full"
                   referrerPolicy="no-referrer"
                 />
               </motion.div>
                {/* Decorative floating elements */}
                <div className="absolute -bottom-6 -right-6 bg-yellow-400 p-6 rounded-3xl shadow-xl animate-bounce">
                  <Star fill="currentColor" className="text-white" size={32} />
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const RestaurantCard: React.FC<{ restaurant: Restaurant, i: number }> = ({ restaurant, i }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="group text-right"
    >
      <Link to={`/restaurant/${restaurant.id}`}>
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={restaurant.coverImageUrl || 'https://picsum.photos/seed/rest/800/600'} 
              alt={restaurant.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900 border-0 font-bold backdrop-blur-md">
              {restaurant.cuisineType}
            </Badge>

            {restaurant.isFeatured && (
               <Badge className="absolute top-4 left-4 bg-orange-600 text-white border-0 font-black flex gap-1 shadow-lg shadow-orange-600/30">
                <Zap size={12} fill="currentColor" /> مميز
              </Badge>
            )}

            <div className="absolute bottom-4 right-4 flex flex-row-reverse items-center gap-1.5 text-white font-black text-lg">
               <Star size={18} fill="#facc15" stroke="#facc15" />
               <span>{restaurant.rating.toFixed(1)}</span>
               <span className="text-xs font-medium text-white/70">({restaurant.reviewCount} تقييم)</span>
            </div>
          </div>
          <CardContent className="p-6 relative">
            <div className="absolute -top-10 left-6 w-16 h-16 bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white">
               <img src={restaurant.logoUrl || 'https://picsum.photos/seed/logo/200/200'} alt="logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{restaurant.name}</h3>
            <div className="flex flex-row-reverse items-center gap-2 text-gray-500 text-sm mb-4 font-medium">
               <MapPin size={16} className="text-orange-600" />
               <span>{restaurant.location}</span>
            </div>
            
            <div className="flex flex-row-reverse justify-end gap-2">
              <div className="flex flex-row-reverse items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">
                <Clock size={12} />
                مفتوح الآن
              </div>
              {restaurant.offers?.length > 0 && (
                <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100">
                  {restaurant.offers.length} عروض
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
