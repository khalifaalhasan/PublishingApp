import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level = "info", message, data = {} } = body;

    // Mapping level dari client ke pino level
    if (typeof logger[level as keyof typeof logger] === "function") {
      (logger[level as keyof typeof logger] as any)(
        { clientData: data },
        `[CLIENT] ${message}`,
      );
    } else {
      logger.info({ clientData: data }, `[CLIENT] ${message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, "Gagal memproses log dari client");
    return NextResponse.json(
      { error: "Failed to process log" },
      { status: 400 },
    );
  }
}
