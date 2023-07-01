import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { privateRoute } from '../middlewares/auth';

const router = express.Router();

router.post('/user/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);

        return res.json({ token, user: { userId: user._id, username } });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/user/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.create({ username, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);

        return res.json({ token });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/user/logout', (req, res) => {
    return res.json({ message: 'You are now logged out.' });
});

router.post('/user/validate', privateRoute, (req, res) => {
    return res.json({ message: 'Token is valid.' });
});

export default router;
