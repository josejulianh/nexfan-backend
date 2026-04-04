import { db } from "../../infrastructure/database/postgres";
import { cache } from "../../infrastructure/cache/redis";
import { AppError } from "../../shared/middleware/error.middleware";
import { config } from "../../config/env";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export class AuthService {
  async register(data: { email: string; username: string; password: string; role: string }) {
    const existing = await db.query(
      "SELECT id FROM iam.users WHERE email = $1 OR username = $2",
      [data.email, data.username]
    );
    if (existing.rows.length > 0) throw new AppError(409, "Email or username already taken", "CONFLICT");

    const passwordHash = crypto.createHash("sha256").update(data.password).digest("hex");

    const result = await db.transaction(async (client) => {
      const user = await client.query(
        `INSERT INTO iam.users (email, username, password_hash, role, status, email_verified)
         VALUES ($1, $2, $3, $4, 'active', true) RETURNING id, email, username, role`,
        [data.email, data.username, passwordHash, data.role]
      );
      const u = user.rows[0];
      if (data.role === "creator") {
        await client.query(
          `INSERT INTO iam.creator_profiles (user_id, display_name) VALUES ($1, $2)`,
          [u.id, data.username]
        );
      } else {
        await client.query(
          `INSERT INTO iam.fan_profiles (user_id, display_name) VALUES ($1, $2)`,
          [u.id, data.username]
        );
      }
      return u;
    });

    const tokens = this.generateTokens(result.id, result.role);
    await cache.set(`refresh:${tokens.refreshToken}`, result.id, 60 * 60 * 24 * 30);
    return { user: result, ...tokens };
  }

  async login(email: string, password: string) {
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const result = await db.query(
      `SELECT id, email, username, role, status FROM iam.users
       WHERE email = $1 AND password_hash = $2 AND deleted_at IS NULL`,
      [email, passwordHash]
    );
    if (!result.rows[0]) throw new AppError(401, "Invalid credentials", "UNAUTHORIZED");
    if (result.rows[0].status !== "active") throw new AppError(403, "Account suspended", "FORBIDDEN");

    const user = result.rows[0];
    const tokens = this.generateTokens(user.id, user.role);
    await cache.set(`refresh:${tokens.refreshToken}`, user.id, 60 * 60 * 24 * 30);
    await db.query("UPDATE iam.users SET last_login_at = NOW() WHERE id = $1", [user.id]);
    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    const userId = await cache.get<string>(`refresh:${refreshToken}`);
    if (!userId) throw new AppError(401, "Invalid refresh token", "UNAUTHORIZED");
    const result = await db.query("SELECT id, role FROM iam.users WHERE id = $1", [userId]);
    if (!result.rows[0]) throw new AppError(401, "User not found", "UNAUTHORIZED");
    const tokens = this.generateTokens(result.rows[0].id, result.rows[0].role);
    await cache.del(`refresh:${refreshToken}`);
    await cache.set(`refresh:${tokens.refreshToken}`, userId, 60 * 60 * 24 * 30);
    return tokens;
  }

  async logout(refreshToken: string) {
    await cache.del(`refresh:${refreshToken}`);
  }

  private generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
    const refreshToken = crypto.randomBytes(32).toString("hex");
    return { accessToken, refreshToken };
  }
}
