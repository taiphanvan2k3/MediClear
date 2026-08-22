import { useMutation } from "@tanstack/react-query";
import { saveUserProfileToFirestore } from "../api/firebaseApi";
import { UserProfile } from "../types";
import { useAuthStore, useUIStore } from "../store";

export function useProfileMutations() {
  const user = useAuthStore((state) => state.user);
  const userProfile = useAuthStore((state) => state.userProfile);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);

  const saveProfileMutation = useMutation({
    mutationFn: async (overrideProfile?: UserProfile) => {
      const targetProfile = overrideProfile || userProfile;
      if (user) {
        await saveUserProfileToFirestore(user.uid, targetProfile);
      }
      return targetProfile;
    },
    onSuccess: (targetProfile) => {
      setUserProfile(targetProfile);
      setAlertMessage(
        `Đã cập nhật cấu hình thông tin cá nhân! ${targetProfile.aiTitle} sẽ xưng hô là "${targetProfile.aiTitle}" và gọi là "${targetProfile.userTitle}" theo đúng cài đặt.`
      );
    },
    onError: (err: any) => {
      console.error("Lỗi khi lưu profile:", err);
      setAlertMessage("Lưu cấu hình không thành công, vui lòng thử lại sau nhé!");
    }
  });

  return {
    saveProfile: saveProfileMutation.mutate,
    isSavingProfile: saveProfileMutation.isPending,
    isProfileSavedSuccess: saveProfileMutation.isSuccess
  };
}
