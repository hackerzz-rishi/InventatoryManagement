import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6)
});

const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6),
  email: Joi.string().email().required(),
  role_id: Joi.string().valid('ROLE_OFFICE', 'ROLE_SALES').required()
});

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      status: 'error',
      message: error.details[0].message 
    });
  }
  next();
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      status: 'error',
      message: error.details[0].message 
    });
  }
  next();
};