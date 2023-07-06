import express from "express";
import { privateRoute } from "../middlewares/auth";
import Site from "../models/Sites";
import Joi from "joi";
import { Request, Response } from "express";

const router = express.Router();

const getSiteSchema = Joi.object({
  siteId: Joi.string().required(),
});

const createSiteSchema = Joi.object({
  name: Joi.string().required(),
});

router.get("/sites", privateRoute, async (req: Request, res: Response) => {
  if (!req.user)
    return res.status(500).json({ message: "Internal server error" });

  try {
    const sites = await Site.find({ userId: req.user.id });

    return res.json(sites);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/site", privateRoute, async (req: Request, res: Response) => {
  try {
    const { error, value } = getSiteSchema.validate(req.query);

    if (!req.user)
      return res.status(500).json({ message: "Internal server error" });

    if (error) {
      return res
        .status(400)
        .json({ message: "Bad request", error: error.details[0].message });
    }

    const sites = await Site.findOne({
      _id: value.siteId,
      userId: req.user.id,
    });

    return res.json(sites);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/site", privateRoute, async (req: Request, res: Response) => {
  try {
    const { error, value } = createSiteSchema.validate(req.body);

    if (!req.user)
      return res.status(500).json({ message: "Internal server error" });

    if (error) {
      return res
        .status(400)
        .json({ message: "Bad request", error: error.details[0].message });
    }

    const site = await Site.create({name: value.name, userId: req.user.id});

    return res.json(site);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
