import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { z } from "zod";

const registerSchema = z.object({
  email:    z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  role:     z.enum(["fan", "creator"]).default("fan"),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

export class AuthController {
  private svc = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await this.svc.register(data);
      res.status(201).json({ data: result });
    } catch (err) { next(err); }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.svc.login(data.email, data.password);
      res.json({ data: result });
    } catch (err) { next(err); }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.svc.refresh(refreshToken);
      res.json({ data: result });
    } catch (err) { next(err); }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      await this.svc.logout(refreshToken);
      res.json({ data: { message: "Logged out" } });
    } catch (err) { next(err); }
  };
}
