import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  site: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  debug: true, // Enable debug mode to see more detailed logs
  characteristics: ["userId"], // Only track by userId
  rules: [
    // Rate limiting specifically for collection creation
    tokenBucket({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      refillRate: 2, // 10 collections
      interval: 3600, // per hour
      capacity: 2, // maximum burst capacity
      characteristics: ["userId"], // Apply rate limit per user
    }),
  ],
});

// Add debug logging
if (process.env.NODE_ENV !== "production") {
  console.log("Arcjet configuration:", {
    key: process.env.ARCJET_KEY ? "Set" : "Not Set",
    site: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    mode: process.env.NODE_ENV,
    characteristics: ["userId"],
  });
}

export default aj;