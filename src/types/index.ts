export type UserRole = 'customer' | 'restaurant_owner' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: any;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface Offer {
  title: string;
  description: string;
  discountBadge?: string;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  cuisineType: string;
  location: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  logoUrl: string;
  coverImageUrl: string;
  galleryImages: string[];
  menuItems: MenuItem[];
  offers: Offer[];
  openingHours: Record<string, string>;
  rating: number;
  reviewCount: number;
  views: number;
  phoneClicks: number;
  whatsappClicks: number;
  isApproved: boolean;
  isFeatured: boolean;
  plan: 'free' | 'featured' | 'homepage_featured';
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: any;
}
