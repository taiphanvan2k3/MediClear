import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "firebase/auth";
import { UserProfile, DEFAULT_PROFILE } from "../types";

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  cachedAccessToken: string | null;
  setCachedAccessToken: (token: string | null) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  customConditionInput: string;
  setCustomConditionInput: (val: string) => void;

  toggleCondition: (cond: string) => void;
  addCustomCondition: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      cachedAccessToken: null,
      setCachedAccessToken: (cachedAccessToken) => set({ cachedAccessToken }),
      userProfile: DEFAULT_PROFILE,
      setUserProfile: (profileOrFn) =>
        set((state) => ({
          userProfile: typeof profileOrFn === "function" ? profileOrFn(state.userProfile) : profileOrFn
        })),
      customConditionInput: "",
      setCustomConditionInput: (val) => set({ customConditionInput: val }),

      toggleCondition: (cond) => {
        const { userProfile } = get();
        const exists = userProfile.conditions.includes(cond);
        const updatedConditions = exists
          ? userProfile.conditions.filter((c) => c !== cond)
          : [...userProfile.conditions, cond];
        set({ userProfile: { ...userProfile, conditions: updatedConditions } });
      },

      addCustomCondition: () => {
        const { customConditionInput, userProfile } = get();
        if (!customConditionInput.trim()) return;
        const tag = customConditionInput.trim();
        if (!userProfile.conditions.includes(tag)) {
          set({
            userProfile: { ...userProfile, conditions: [...userProfile.conditions, tag] },
            customConditionInput: ""
          });
        } else {
          set({ customConditionInput: "" });
        }
      }
    }),
    {
      name: "mediClear_auth_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile
      })
    }
  )
);
