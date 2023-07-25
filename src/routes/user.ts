import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { privateRoute } from "../middlewares/auth";
import Joi from "joi";

const router = express.Router();

const newUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  organizationId: Joi.string().required(),
});

router.post("/user/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, organizationId: user.organizationId },
      process.env.JWT_SECRET as string
    );

    return res.json({
      token,
      user: { userId: user.id, username: username},
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/user/register", async (req, res) => {
  const { error } = newUserSchema.validate(req.body);

  const { username, password, organizationId, roleId } = req.body;

  try {
    const user = await User.create({
      username,
      password,
      organizationId,
      roleId: roleId,
    });

    return res.json({ message: "User created successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/user/logout", (req, res) => {
  return res.json({ message: "You are now logged out." });
});

router.post("/user/validate", privateRoute, (req, res) => {
  return res.json({
    user: {
      userId: req.user?.id,
      role: req.user?.role,
      username: req.user?.username,
    },
  });
});

export default router;
