import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthModalOpen: false,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user });
        
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (profile) {
          set({ profile });
        }
      } else {
        set({ user: null, profile: null });
      }
    } catch (e) {
      console.error("Error fetching user:", e);
    } finally {
      set({ isLoading: false });
    }
  },
  
  signOut: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      set({ user: null, profile: null });
    } catch (e) {
      console.error("Error signing out:", e);
    }
  }
}));
