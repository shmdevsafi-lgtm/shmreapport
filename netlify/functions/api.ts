import serverless from "serverless-http";

import { createServer } from "../../server";

const expressHandler = serverless(createServer(), {
  // Donne à Express le corps JSON déjà décodé, quel que soit l'encodage Netlify
  request(req: any, event: any) {
    let raw = event.body;
    if (typeof raw === "string" && event.isBase64Encoded) {
      raw = Buffer.from(raw, "base64").toString("utf8");
    }
    if (typeof raw === "string" && raw.length > 0) {
      try {
        req.body = JSON.parse(raw);
      } catch {
        // Corps non JSON : la validation de route le rejettera.
      }
    } else if (raw && typeof raw === "object") {
      req.body = raw;
    }
  },
});

export const handler = (event: any, context: any) => {
  const headers = {
    ...(event.headers || {}),
    "content-type":
      event.headers?.["content-type"] || event.headers?.["Content-Type"] || "application/json",
  };
  return expressHandler({ ...event, headers }, context);
};
