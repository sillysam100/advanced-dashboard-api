import express from 'express';
import { privateRoute } from '../middlewares/auth';
import Site from '../models/Sites';
import Joi from 'joi';
import { ISite } from '../interfaces/Site';

const router = express.Router();

const getSitesSchema = Joi.object({
    userId: Joi.string().required(),
});

const getSiteSchema = Joi.object({
    userId: Joi.string().required(),
    siteId: Joi.string().required(),
});

const createSiteSchema = Joi.object({
    name: Joi.string().required(),
    userId: Joi.string().required(),
});

router.get('/sites', privateRoute, async (req, res) => {
    try {
        const { error, value } = getSitesSchema.validate(req.query);
        
        if (error) {
            return res.status(400).json({ message: 'Bad request', error: error.details[0].message });
        }
        
        const sites = await Site.find({ userId: value.userId });

        return res.json(sites);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/site', privateRoute, async (req, res) => {
    try {
        const { error, value } = getSiteSchema.validate(req.query);
        
        if (error) {
            return res.status(400).json({ message: 'Bad request', error: error.details[0].message });
        }
        
        const sites = await Site.findOne({ _id: value.siteId, userId: value.userId });

        return res.json(sites);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/site', privateRoute, async (req, res) => {
    try {
        const { error, value } = createSiteSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: 'Bad request', error: error.details[0].message });
        }

        const site = await Site.create(value as ISite);

        return res.json(site);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
