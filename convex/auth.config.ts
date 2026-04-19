import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL ?? "https://grateful-dragon-149.convex.site",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
