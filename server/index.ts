import { createApp } from "./app";
import { config } from "./config/env";
import type { Server } from "http";

let server: Server | null = null;

async function bootstrap() {
  try {
    const app = await createApp();

    server = app.listen(config.port, config.host, () => {
      console.log(`\n🌿 MediClear Server đang chạy tại http://${config.host}:${config.port}`);
      console.log(`⚡ Môi trường: ${config.nodeEnv.toUpperCase()}`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal: string) => {
      console.log(`\n[Server] Nhận tín hiệu ${signal}. Đang đóng kết nối an toàn...`);
      if (server) {
        server.close(() => {
          console.log("[Server] Đã đóng toàn bộ kết nối. Bye! 👋");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
  } catch (error) {
    console.error("[Server] Lỗi nghiêm trọng khi khởi động server:", error);
    process.exit(1);
  }
}

bootstrap();
