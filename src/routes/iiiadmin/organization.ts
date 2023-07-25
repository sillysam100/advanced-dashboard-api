import { IOrganization } from "../../interfaces/iiicontrol/Organization";
import mongoose, { Schema, Document } from "mongoose";
import { Organization } from "../../models/iiicontrol/Organization";
import Joi from "joi";
import { Router } from "express";
import { privateRoute } from "../../middlewares/auth";

const router = Router();

const newOrganizationSchema = Joi.object({
  name: Joi.string().required(),
});

router.post("/organization/new", privateRoute, async (req, res) => {
  try {
    const organization = new Organization({ name: req.body.name });
    await organization.save();
    return res.json(organization);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/organization", privateRoute, async (req, res) => {
  try {
    if (!req.user)
      return res.status(500).json({ message: "Internal server error" });

    const organizations = await Organization.find({
      _id: req.user.organizationId,
    });
    return res.json(organizations);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
