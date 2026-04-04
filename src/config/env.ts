import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),
  db: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || "5432"),
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
  },
  redis: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    tls: process.env.REDIS_TLS === "true",
  },
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    accountId: process.env.AWS_ACCOUNT_ID!,
  },
  ivs: {
    hdChannelArn: process.env.IVS_HD_CHANNEL_ARN!,
    channel360Arn: process.env.IVS_360_CHANNEL_ARN!,
    chatRoomArn: process.env.IVS_CHAT_ROOM_ARN!,
  },
  opensearch: { endpoint: process.env.OPENSEARCH_ENDPOINT! },
  eventbridge: { bus: process.env.EVENTBRIDGE_BUS || "nexfan-events" },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
};
