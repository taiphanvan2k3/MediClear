import { useMutation } from "@tanstack/react-query";
import { loginWithGoogleApi, logoutApi } from "../api/firebaseApi";
import { useAuthStore, useUIStore } from "../store";

export function useAuthMutations() {
  const setUser = useAuthStore((state) => state.setUser);
  const setCachedAccessToken = useAuthStore((state) => state.setCachedAccessToken);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);

  const loginMutation = useMutation({
    mutationFn: () => loginWithGoogleApi(),
    onSuccess: (data) => {
      setUser(data.user);
      setCachedAccessToken(data.accessToken);
    },
    onError: (err: any) => {
      console.error("Lỗi đăng nhập Google:", err);
      setAlertMessage("Đăng nhập bằng tài khoản Google không thành công. Vui lòng thử lại!");
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      setUser(null);
      setCachedAccessToken(null);
    },
    onError: (err: any) => {
      console.error("Lỗi đăng xuất:", err);
    }
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
}
