import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/sanity.types'; // Ajusta la importación según tu tipo

interface WishlistState {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      
      addToWishlist: (product) => {
        const { wishlist } = get();
        // Evitar duplicados
        if (!wishlist.some((item) => item._id === product._id)) {
          set({ wishlist: [...wishlist, product] });
        }
      },

      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((item) => item._id !== productId) });
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item._id === productId);
      },
    }),
    {
      name: 'wishlist-storage', // Nombre para localStorage
    }
  )
);