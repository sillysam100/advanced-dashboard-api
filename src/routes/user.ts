import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { UserRole } from "../models/User";
import { privateRoute } from "../middlewares/auth";
import Joi from "joi";

const router = express.Router();

const newUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  organizationId: Joi.string().required(),
});

const newUserRoleSchema = Joi.object({
  name: Joi.string().valid("observe", "edit", "admin").required(),
  actions: Joi.array().items(Joi.string().valid("observe", "edit")).required(),
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
      { id: user.id, organizationId: user.organizationId, role: user.role },
      process.env.JWT_SECRET as string
    );

    return res.json({
      token,
      user: { userId: user.id, username: username, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/user/register", async (req, res) => {
  const { error } = newUserSchema.validate(req.body);

  const { username, password, organizationId, userRoleId } = req.body;

  try {
    const user = await User.create({
      username,
      password,
      organizationId,
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
  return res.json({ message: "Token is valid." });
});

router.get("/user/roles", privateRoute, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }
    const roles = await UserRole.find({ _id: req.user.userRoleId });
    return res.json(roles);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/user/role", privateRoute, async (req, res) => {
  try {
    const { error, value } = newUserRoleSchema.validate(req.body);

    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }

    if (error) {
      return res
        .status(400)
        .json({ message: "Bad request", error: error.details[0].message });
    }

    const role = await UserRole.create(value);

    return res.json(role);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user/role/:roleId", privateRoute, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }

    const role = await UserRole.findOne({ _id: req.params.roleId });

    return res.json(role);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
