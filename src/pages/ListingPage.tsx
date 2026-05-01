import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Restaurant } from '@/src/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, SlidersHorizontal, ChevronDown, ListFilter, Grid, Utensils, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CUISINES = ['الكل', 'إيطالي', 'آسيوي', 'برجر', 'صحي', 'حلويات', 'قهوة', 'مكسيكي', 'فرنسي'];
const LOCATIONS = ['الكل', 'وسط المدينة', 'الجانب الغربي', 'النهاية الشرقية', 'نورث هيلز', 'منطقة المطار'];

export default function ListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const initialCuisine = searchParams.get('cuisine') || 'الكل';
  const initialLocation = searchParams.get('location') || 'الكل';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState({
    cuisine: initialCuisine,
    location: initialLocation,
    rating: 0,
    openNow: false,
    hasOffers: false,
  });

  const [sortBy, setSortBy] = useState('المميز');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'restaurants'), where('isApproved', '==', true));
        
        // Firestore has limited query capabilities for complex filters without indexes
        // For MVP, we'll fetch all approved and filter in-memory for speed and simplicity
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
        setRestaurants(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                           r.description.toLowerCase().includes(search.toLowerCase()) ||
                           r.cuisineType.toLowerCase().includes(search.toLowerCase());
      
      const matchesCuisine = filters.cuisine === 'الكل' || r.cuisineType.toLowerCase() === filters.cuisine.toLowerCase();
      const matchesLocation = filters.location === 'الكل' || r.location === filters.location;
      const matchesRating = r.rating >= filters.rating;
      const matchesOffers = !filters.hasOffers || (r.offers && r.offers.length > 0);
      
      return matchesSearch && matchesCuisine && matchesLocation && matchesRating && matchesOffers;
    }).sort((a, b) => {
      if (sortBy === 'الأعلى تقييم') return b.rating - a.rating;
      if (sortBy === 'الأحدث') return b.createdAt - a.createdAt;
      if (sortBy === 'الأكثر مشاهدة') return b.views - a.views;
      if (sortBy === 'المميز') {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
      }
      return 0;
    });
  }, [restaurants, search, filters, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen pb-24 text-right">
      {/* Header / Search Area */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
             <div className="space-y-4">
                <div className="flex flex-row-reverse items-center gap-3 text-orange-600 font-bold uppercase tracking-widest text-xs">
                   <Utensils size={16} />
                   استكشف المطاعم
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                  {search ? `نتائج البحث عن "${search}"` : 'جميع المطاعم'}
                </h1>
                <p className="text-gray-500 font-medium font-sans">تم العثور على {filteredRestaurants.length} مكاناً متميزاً بالقرب منك.</p>
             </div>

             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                  <Input 
                    placeholder="ابحث عن أسماء المطاعم أو المأكولات..." 
                    className="pr-12 h-14 bg-gray-50 border-gray-100 rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 text-right"
                    value={search}
                    onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), search: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                   <DropdownMenu>
                      <DropdownMenuTrigger className="h-14 px-6 rounded-2xl gap-2 font-bold border border-gray-200 bg-white flex flex-row-reverse items-center justify-center hover:bg-gray-50 focus:outline-none transition-all active:scale-95">
                         <MapPin size={18} className="text-orange-600" />
                         {filters.location === 'الكل' ? 'في كل مكان' : filters.location}
                         <ChevronDown size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 text-right">
                        {LOCATIONS.map(loc => (
                          <DropdownMenuItem key={loc} onClick={() => setFilters(f => ({ ...f, location: loc }))} className="justify-end">
                            {loc}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                   </DropdownMenu>

                   <DropdownMenu>
                      <DropdownMenuTrigger className="h-14 px-6 rounded-2xl gap-2 font-bold border border-gray-200 bg-white flex flex-row-reverse items-center justify-center hover:bg-gray-50 focus:outline-none transition-all active:scale-95">
                         <SlidersHorizontal size={18} className="text-orange-600" />
                         {filters.cuisine === 'الكل' ? 'جميع المأكولات' : filters.cuisine}
                         <ChevronDown size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 text-right">
                        {CUISINES.map(c => (
                          <DropdownMenuItem key={c} onClick={() => setFilters(f => ({ ...f, cuisine: c }))} className="justify-end">
                            {c}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 border-l border-gray-100 pl-8 hidden lg:block">
            <div className="space-y-10 sticky top-24">
              <div>
                <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest flex flex-row-reverse items-center gap-2">
                   <ListFilter size={16} className="text-orange-600" />
                   فلاتر سريعة
                </h4>
                <div className="space-y-3">
                  <FilterLabel 
                    label="مفتوح الآن" 
                    active={filters.openNow} 
                    onClick={() => setFilters(f => ({ ...f, openNow: !f.openNow }))} 
                  />
                  <FilterLabel 
                    label="عروض خاصة" 
                    active={filters.hasOffers} 
                    onClick={() => setFilters(f => ({ ...f, hasOffers: !f.hasOffers }))} 
                  />
                </div>
              </div>

              <div>
                <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest flex flex-row-reverse items-center gap-2">
                   التقييم
                </h4>
                <div className="space-y-3">
                  {[4.5, 4, 3, 0].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setFilters(f => ({ ...f, rating: val }))}
                      className={`flex flex-row-reverse items-center gap-2 text-sm font-bold w-full transition-all ${filters.rating === val ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${filters.rating === val ? 'bg-orange-600 border-orange-600' : 'border-gray-200'}`}>
                        {filters.rating === val && <Check size={12} className="text-white" />}
                      </div>
                      <span className="font-sans">{val === 0 ? 'أي تقييم' : `${val}+ نجوم`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings */}
          <div className="lg:col-span-3">
            <div className="flex flex-row-reverse justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}
                  >
                    <ListFilter size={18} />
                  </button>
               </div>

               <div className="flex flex-row-reverse items-center gap-4">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">ترتيب حسب:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="font-black text-gray-900 gap-1 uppercase tracking-tighter hover:bg-gray-50 underline decoration-orange-300 decoration-2 underline-offset-4 flex flex-row-reverse items-center focus:outline-none py-2 px-3 rounded-lg transition-all active:scale-95">
                         {sortBy} <ChevronDown size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="text-right">
                       {['المميز', 'الأعلى تقييم', 'الأحدث', 'الأكثر مشاهدة'].map(opt => (
                         <DropdownMenuItem key={opt} onClick={() => setSortBy(opt)} className="justify-end">
                            {opt}
                         </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[1,2,3,4].map(i => <div key={i} className="h-96 bg-white animate-pulse rounded-3xl border border-gray-100" />)}
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "flex flex-col gap-6"}>
                <AnimatePresence mode="popLayout">
                  {filteredRestaurants.map((res, i) => (
                    <motion.div
                      key={res.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      {viewMode === 'grid' ? <ListingCard res={res} /> : <ListingRow res={res} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">لم يتم العثور على مطاعم</h3>
                <p className="text-gray-500 font-medium">حاول ضبط الفلاتر أو شروط البحث.</p>
                <Button variant="outline" className="mt-8 font-bold" onClick={() => {
                  setFilters({ cuisine: 'الكل', location: 'الكل', rating: 0, openNow: false, hasOffers: false });
                  setSearchParams({});
                }}>
                  مسح جميع الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ res }: { res: Restaurant }) {
  return (
    <Link to={`/restaurant/${res.id}`} className="group text-right">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white group-hover:-translate-y-1">
        <div className="relative h-60">
           <img 
            src={res.coverImageUrl || 'https://picsum.photos/seed/res/800/600'} 
            alt={res.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900 border-0 font-bold backdrop-blur-sm">
            {res.cuisineType}
          </Badge>
          <div className="absolute bottom-4 right-4 flex flex-row-reverse items-center gap-1.5 text-white font-black">
              <Star size={14} fill="#facc15" stroke="#facc15" />
              <span className="font-sans">{res.rating.toFixed(1)}</span>
          </div>
        </div>
        <CardContent className="p-5">
           <h3 className="font-black text-lg text-gray-900 mb-1 truncate group-hover:text-orange-600 transition-colors uppercase tracking-tight">{res.name}</h3>
           <p className="text-gray-500 text-sm flex flex-row-reverse items-center gap-1 font-medium truncate mb-4">
              <MapPin size={14} className="text-orange-600" />
              {res.location}
           </p>
           <div className="flex flex-row-reverse justify-start gap-2 font-sans">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 text-[10px] font-bold">$$ • {res.cuisineType}</Badge>
              {res.offers?.length > 0 && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 text-[10px] font-black uppercase tracking-widest">{res.offers.length} عروض</Badge>}
           </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListingRow({ res }: { res: Restaurant }) {
    return (
        <Link to={`/restaurant/${res.id}`} className="group text-right">
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white group-hover:bg-gray-50">
                <CardContent className="p-0 flex flex-row-reverse h-40">
                    <div className="w-48 h-full flex-shrink-0 font-sans">
                         <img 
                            src={res.coverImageUrl || 'https://picsum.photos/seed/res/800/600'} 
                            alt={res.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex flex-row-reverse justify-between items-start">
                                <h3 className="font-black text-xl text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tighter">{res.name}</h3>
                                <div className="flex flex-row-reverse items-center gap-1 font-black text-gray-900 font-sans">
                                    <Star size={18} fill="#facc15" stroke="#facc15" />
                                    <span>{res.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm font-medium flex flex-row-reverse items-center gap-1 mt-1">
                                <MapPin size={14} /> {res.location}
                            </p>
                        </div>
                        <div className="flex flex-row-reverse justify-start gap-2">
                            <Badge variant="outline" className="border-gray-200 text-gray-500">{res.cuisineType}</Badge>
                            {res.offers?.length > 0 && <Badge className="bg-orange-600 text-white border-0 font-bold tracking-widest uppercase">عروض متاحة</Badge>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function FilterLabel({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-row-reverse items-center gap-2 text-sm font-bold w-full transition-all ${active ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${active ? 'bg-orange-600 border-orange-600' : 'border-gray-200'}`}>
        {active && <Check size={12} className="text-white" />}
      </div>
      {label}
    </button>
  );
}
