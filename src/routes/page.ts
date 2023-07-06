import { Page } from "../models/Page";
import { privateRoute } from "../middlewares/auth";
import Register from "../models/Register";
import Joi from "joi";
import { Request, Response, Router } from "express";
import mongoose from "mongoose";

const router = Router();

const getPageSchema = Joi.object({
  pageId: Joi.string().required(),
});

const getPagesSchema = Joi.object({
  siteId: Joi.string().required(),
});

const createPageSchema = Joi.object({
  siteId: Joi.string().required(),
  name: Joi.string().required(),
});

const addRegisterSchema = Joi.object({
  registerId: Joi.string().required(),
});

const updatePageSchema = Joi.object({
  pageId: Joi.string().required(),
  name: Joi.string(),
  registers: Joi.array().items(Joi.string()),
  layout: Joi.array().items(
    Joi.object({
      registerId: Joi.string().required(),
      cols: Joi.number().required(),
      rows: Joi.number().required(),
      position: Joi.number().required(),
    })
  ),
});

const newLayoutEntrySchema = Joi.object({
  registerId: Joi.string().required(),
  cols: Joi.number().required(),
  rows: Joi.number().required(),
  position: Joi.number().required(),
});

router.get("/pages", privateRoute, async (req: Request, res: Response) => {
  try {
    getPagesSchema.validate(req.query);
    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }
    const pages = await Page.find({ siteId: req.query.siteId });
    return res.json(pages);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get(
  "/page/:pageId",
  privateRoute,
  async (req: Request, res: Response) => {
    try {
      getPageSchema.validate(req.params);
      if (!req.user) {
        return res.status(500).json({ message: "Internal server error" });
      }
      const page = await Page.findOne({
        _id: req.params.pageId,
      });

      return res.json(page);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/page/:pageId/registers",
  privateRoute,
  async (req: Request, res: Response) => {
    try {
      const pageId = req.params.pageId;

      if (!req.user) {
        return res.status(500).json({ message: "Internal server error" });
      }

      const page = await Page.findById(pageId);

      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      const registers = await Register.find({ _id: { $in: page.registers } });

      return res.json(registers);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/page/:pageId/register",
  privateRoute,
  async (req: Request, res: Response) => {
    try {
      addRegisterSchema.validate(req.body);

      const registerId = req.body.registerId;
      const pageId = req.params.pageId;

      if (!req.user) {
        return res.status(500).json({ message: "Internal server error" });
      }

      await Page.updateOne(
        {
          _id: pageId,
        },
        {
          $push: {
            registers: registerId as mongoose.Types.ObjectId,
          },
        }
      );

      return res.json({ message: "Register added to page" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/page/:pageId/layout",
  privateRoute,
  async (req: Request, res: Response) => {
    try {
      newLayoutEntrySchema.validate(req.body);

      const pageId = req.params.pageId;

      if (!req.user) {
        return res.status(500).json({ message: "Internal server error" });
      }

      await Page.updateOne(
        {
          _id: pageId,
        },
        {
          $push: {
            layout: req.body,
          },
        }
      );

      return res.json({ message: "Layout entry added to page" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post("/page", privateRoute, async (req: Request, res: Response) => {
  try {
    createPageSchema.validate(req.body);
    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }

    const page = await Page.create({
      siteId: req.body.siteId,
      name: req.body.name,
    });

    return res.json(page);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/page", privateRoute, async (req: Request, res: Response) => {
  try {
    updatePageSchema.validate(req.body);
    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }

    Page.updateOne(
      {
        _id: req.body.pageId,
      },
      {
        name: req.body.name,
        registers: req.body.registers,
        layout: req.body.layout,
      }
    );

    return res.json({ message: "Page updated" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
