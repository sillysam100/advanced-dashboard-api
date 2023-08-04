import { Page } from "../../models/iiicontrol/Page";
import { privateRoute } from "../../middlewares/auth";
import Register from "../../models/iiicontrol/Register";
import Joi from "joi";
import { Request, Response, Router } from "express";
import mongoose, { Types } from "mongoose";

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

const moveRegisterSchema = Joi.object({
  direction: Joi.string().valid("right", "left").required(),
});

const updateLayoutSchema = Joi.array().items(
  Joi.object({
    registerId: Joi.string().required(),
    cols: Joi.number(),
    rows: Joi.number(),
    position: Joi.number(),
  })
);

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

router.put(
  "/page/:pageId/layout",
  privateRoute,
  async (req: Request, res: Response) => {
    try {
      updateLayoutSchema.validate(req.body);

      const pageId = req.params.pageId;

      if (!req.user) {
        return res.status(500).json({ message: "Internal server error" });
      }

      const updateQuery: Record<string, any> = {};
      for (const key of Object.keys(req.body)) {
        if (key !== "registerId") {
          updateQuery[`layout.$.${key}`] = req.body[key];
        }
      }

      const registerId = Types.ObjectId.isValid(req.body.registerId)
        ? new Types.ObjectId(req.body.registerId)
        : null;

      if (!registerId) {
        return res.status(400).json({ message: "Invalid registerId" });
      }

      // change your MongoDB query to include the position field
      await Page.updateOne(
        {
          _id: pageId,
          "layout.registerId": registerId,
        },
        {
          $set: updateQuery,
        }
      );

      return res.json({ message: "Layout updated" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put(
  "/page/:pageId/layout/:registerId/position",
  privateRoute,
  async (req: Request, res: Response) => {
    try {
      moveRegisterSchema.validate(req.body);
      const { pageId, registerId } = req.params;
      const { direction } = req.body;

      if (!req.user) {
        return res.status(500).json({ message: "Internal server error" });
      }

      const page = await Page.findOne({ _id: pageId });

      if (!page) {
        return res.status(400).json({ message: "Page not found" });
      }

      const layoutEntry = page.layout.find(
        (entry) => entry.registerId.toString() === registerId
      );

      if (!layoutEntry) {
        return res.status(400).json({ message: "Layout entry not found" });
      }

      const delta = direction === "right" ? 1 : -1;
      const newPosition = layoutEntry.position + delta;

      const affectedEntry = page.layout.find(
        (entry) => entry.position === newPosition
      );

      if (affectedEntry) {
        affectedEntry.position -= delta;
      }

      layoutEntry.position = newPosition;
      await page.save();

      return res.json({ message: "Layout updated" });
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
