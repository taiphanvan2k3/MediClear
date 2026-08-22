export async function createCalendarReminderApi(params: {
  accessToken: string;
  medName: string;
  timeStr: string;
  userDisplayName: string;
}): Promise<any> {
  const { accessToken, medName, timeStr, userDisplayName } = params;

  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  if (startTime < now) {
    startTime.setDate(startTime.getDate() + 1);
  }
  const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

  const event = {
    summary: `💊 Nhắc uống thuốc: ${medName}`,
    description: `Lịch nhắc uống thuốc hàng ngày từ Trợ lý Y tế AI dành cho ${userDisplayName}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    recurrence: ["RRULE:FREQ=DAILY"],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 10 },
        { method: "email", minutes: 30 }
      ]
    }
  };

  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Không thể tạo lịch nhắc trên Google Calendar.");
  }

  return await res.json();
}
