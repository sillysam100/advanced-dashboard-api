import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const privateRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }

    req.user = user;
    next();
  });
};
