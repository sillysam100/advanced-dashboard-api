import express from "express";
import Register from "../models/Register";
import { privateRoute } from "../middlewares/auth";
import joi from "joi";
import Site from "../models/Sites";

const router = express.Router();

const getRegistersSchema = joi.object({
  siteId: joi.string().required(),
});

const createRegisterSchema = joi.object({
  name: joi.string().required(),
  controlType: joi.string().valid("read", "write").required(),
  unit: joi.string().when("controlType", {
    is: "read",
    then: joi.required(),
  }),
});

router.get("/registers", privateRoute, async (req, res) => {
  if (!req.user) {
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const { error, value } = getRegistersSchema.validate(req.query);
    if (error) {
      return res
        .status(400)
        .json({ message: "Bad request", error: error.details[0].message });
    }
    const registers = await Site.findOne({
      _id: value.siteId,
      organizationId: req.user.organizationId,
    }).populate("registers");
    return res.json(registers);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", privateRoute, async (req, res) => {
  if (!req.user) {
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const { error, value } = createRegisterSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Bad request", error: error.details[0].message });
    }
    const register = await Register.create({
      name: value.name,
      organizationId: req.user.organizationId,
      controlType: value.controlType,
      unit: value.unit,
    });
    return res.json(register);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
