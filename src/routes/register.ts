import express from 'express';
import Register from '../models/Register';
import { privateRoute } from '../middlewares/auth';
import joi from 'joi';
import Site from '../models/Sites';

const router = express.Router();

const getRegistersSchema = joi.object({
    userId: joi.string().required(),
    siteId: joi.string().required(),
});

const createRegisterSchema = joi.object({
    name: joi.string().required(),
    siteId: joi.string().required(),
    userId: joi.string().required(),
    controlType: joi.string().valid('read', 'write').required(),
});


router.get('/registers', privateRoute, async (req, res) => {
    try {
        const { error, value } = getRegistersSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ message: 'Bad request', error: error.details[0].message });
        }
        const registers = await Site.findOne({ _id: value.siteId, userId: value.userId }).populate('registers');
        return res.json(registers);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }    
});

router.post('/register', privateRoute, async (req, res) => {
    try {
        const { error, value } = createRegisterSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Bad request', error: error.details[0].message });
        }
        const register = await Register.create({ name: value.name, userId: value.userId, controlType: value.controlType });
        await Site.updateOne({ _id: value.siteId, userId: value.userId }, { $push: { registers: register._id } });
        return res.json(register);
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;