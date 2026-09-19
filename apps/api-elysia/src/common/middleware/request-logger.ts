import { appLogger } from "@common/logger";
import { Elysia } from "elysia";

export const requestLogger = () =>
  new Elysia()
    .derive(() => {
      return { log: appLogger };
    })
    .onRequest(({ store }) => {
      (store as any).startTime = Date.now();
    })
    .onAfterResponse(({ request, set, store }) => {
      const url = new URL(request.url);
      const startTime = (store as any).startTime;
      const durationMs = startTime ? Date.now() - startTime : 0;

      const status = typeof set.status === "number" ? set.status : 200;
      const message = `${status} ${request.method} ${url.pathname} (${durationMs}ms)`;

      if (status >= 500) {
        appLogger.error(message);
      } else if (status >= 400) {
        appLogger.warn(message);
      } else {
        appLogger.info(message);
      }
    })
    .onError(({ error, request }) => {
      const url = new URL(request.url);
      appLogger.error(
        `Error processing ${request.method} ${url.pathname}: ${error.message}`,
      );
    });
