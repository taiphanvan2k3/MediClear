import { useMutation } from "@tanstack/react-query";
import { createCalendarReminderApi } from "../api/calendarApi";
import { useAuthStore, useUIStore } from "../store";

export function useCalendarReminder() {
  const user = useAuthStore((state) => state.user);
  const cachedAccessToken = useAuthStore((state) => state.cachedAccessToken);
  const userProfile = useAuthStore((state) => state.userProfile);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);
  const setConfirmDialog = useUIStore((state) => state.setConfirmDialog);

  const mutation = useMutation({
    mutationFn: (params: { medName: string; timeStr: string }) => {
      if (!cachedAccessToken) {
        throw new Error("Chưa có quyền truy cập Google Calendar. Vui lòng đăng nhập lại!");
      }
      const userGreeting = userProfile.userTitle || "Bác";
      const userDisplayName = userProfile.nickname || (user?.displayName ? user.displayName : userGreeting);

      return createCalendarReminderApi({
        accessToken: cachedAccessToken,
        medName: params.medName,
        timeStr: params.timeStr,
        userDisplayName
      });
    },
    onSuccess: (_, variables) => {
      const aiTitle = userProfile.aiTitle || "Cháu";
      setAlertMessage(
        `🎉 Tuyệt vời! ${aiTitle} đã tạo thành công Lịch nhắc uống thuốc "${variables.medName}" lúc ${variables.timeStr} hàng ngày trên Google Calendar!`
      );
    },
    onError: (err: any) => {
      console.error("Calendar Sync Error:", err);
      setAlertMessage(err.message || "Lỗi kết nối khi tạo lịch nhắc. Vui lòng kiểm tra lại!");
    }
  });

  const setCalendarReminder = (medName: string, timeStr: string, onRequireLogin: () => void) => {
    const userGreeting = userProfile.userTitle || "Bác";
    if (!user) {
      setConfirmDialog({
        message: `${userGreeting} cần đăng nhập Google để tự động tạo lịch nhắc trên Lịch Google Calendar. Bác/Bạn có muốn đăng nhập ngay không?`,
        onConfirm: () => {
          setConfirmDialog(null);
          onRequireLogin();
        }
      });
      return;
    }

    if (!cachedAccessToken) {
      setAlertMessage("Đang cấp quyền ghi Lịch Google... Vui lòng đăng nhập lại để xác nhận quyền Calendar.");
      onRequireLogin();
      return;
    }

    mutation.mutate({ medName, timeStr });
  };

  return {
    ...mutation,
    setCalendarReminder,
    isSettingReminder: mutation.isPending
  };
}
