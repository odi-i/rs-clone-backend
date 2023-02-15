import Express from 'express';
import { ObjectId } from 'mongoose';
const User = require('../model/User');
var bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

const generateAccessToken = (id: ObjectId) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: '48h' });
};

class authController {
  async registration(req: Express.Request, res: Express.Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Registration error', errors });
      }
      const { username, password, dateCreation } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res.status(400).json({ message: 'User has been already exist' });
      }
      const hashPassword = bcrypt.hashSync(password, 5);
      const user = new User({
        username,
        password: hashPassword,
        dateCreation,
      });
      await user.save();
      return res.json({ message: 'Registration successful' });
    } catch (error) {
      res.status(400).json({ message: 'Registration error' });
    }
  }

  async login(req: Express.Request, res: Express.Response) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: `User hasn't been found` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: `Password is not correct` });
      }
      const token = generateAccessToken(user._id);
      return res.json({ token });
    } catch (error) {
      res.status(400).json({ message: 'Login error' });
    }
  }

  async getUsers(req: Express.Request, res: Express.Response) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(400).json({ message: 'Set user error' });
    }
  }
}

module.exports = new authController();
