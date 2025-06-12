import { Request, Response, NextFunction } from "express";
import User, { type IUser } from '../models/User'
import Token from '../models/Token'
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export async function getUserByEmail(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;

  try {
    const user = await User.findOne({email}) 
  
    if ( !user ) {
      const error = new Error('El usuario no Existe')
      res.status(404).json({error: error.message})
      return
    }
  
    req.user = user;
    next()
  } catch (error) {
    res.status(500).json('Hubo un error')
  }
}

export async function checkConfirmedAccount(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user.confirmed){
      //* Creamos un nuevo token
      const token = new Token();
      token.token = generateToken();
      token.user = req.user.id

      //* Enviar el Email con el Token
      AuthEmail.sendConfirmationEmail({
        email: req.user.email,
        name: req.user.name,
        token: token.token
      })

      await token.save()
      const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmación')
      res.status(401).json({error: error.message})
      return
    }

    next()
  } catch (error) {
    res.status(500).json('Hubo un error')
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization
  if (!bearer) {
    const error = new Error('No Autorizado');
    res.status(401).json({error: error.message})
    return 
  }

  const token = bearer.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (typeof decoded === 'object' && decoded.id) {
      const user = await User.findById(decoded.id).select('_id name email')
      if (user) {
        req.user = user;
        
        next();
      } else {
        res.status(500).json({error: 'Token No Valido'})
      }
    }
  } catch (error) {
    res.status(500).json({error: 'Token No Valido'})
  }
}