import type { Request, Response } from "express"
import User from '../models/User'
import { hashPassword, isPasswordCorrect } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { password, email } = req.body
    try {
      const user = new User(req.body)
      
      //* Verifica si el usuario ya Existe.
      const userExists = await User.findOne({email: email})
      if (userExists) {
        const error = new Error('El email ya Existe')
        res.status(409).json({error: error.message})
        return
      }

      //* Hashear Password
      user.password = await hashPassword(password)

      //* Guardamos el token
      const token = new Token()
      token.token = generateToken();
      token.user = user.id

      //* Enviar el Email con el Token
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })
      
      //* Guardamos los elementos
      await Promise.allSettled([user.save(), token.save()])
      
      res.send({msg: 'Cuenta creada, revisa tu email para confirmar la cuenta'})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const token = await Token.findOne({token: req.body.token})

      if (!token) {
        const error = new Error('El token no existe o ya expiro, solicite uno nuevo');
        res.status(404).json({error: error.message})
        return
      }
      
      const user = await User.findById(token.user)

      if ( !user ) {
        const error = new Error('El usuario no Existe')
        res.status(404).json({error: error.message})
        return
      }
      
      user.confirmed = true;

      await Promise.allSettled([token.deleteOne(), user.save()])
      
      res.json({msg: "Cuenta confirmada"})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }

  static login = async (req: Request, res: Response) => {
    try {
      const { password } = req.body

      //* Revisamos el password
      const compare = await isPasswordCorrect(password, req.user.password)
      if (!compare) {
        const error = new Error('El Password es incorrecto')
        res.status(401).json({error: error.message})
        return
      } 

      const jwt = generateJWT({id: req.user.id}) 

      res.json({msg: 'Session iniciada correctamente', jwt})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      if( req.user.confirmed ) {
        const error = new Error("El usuario ya esta confirmado")
        res.status(403).json({error: error.message})
        return
      }

      const token = new Token()
      token.token = generateToken();
      token.user = req.user.id

      AuthEmail.sendConfirmationEmail({
        email: req.user.email,
        name: req.user.name,
        token: token.token
      })

      await token.save();
      res.json({ msg: "Revisa tu email y Confirma tu cuenta"})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }
  
  static requestForgotPasswordCode = async (req: Request, res: Response) => {
    try {
      const token = new Token();
      token.token = generateToken();
      token.user = req.user.id;
      
      await token.save();

      //* Enviar el email de cambio de password
      AuthEmail.sendPasswordResetToken({
        email: req.user.email,
        name: req.user.name,
        token: token.token
      })
      res.json({msg: "Te hemos enviado un email con las instrucciones"})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }

  static confirmChangePasswordCode = async (req: Request, res: Response) => {
    try {
      const token = await Token.findOne({token: req.body.token})

      if (!token) {
        const error = new Error('El token no existe o ya expiro, solicite uno nuevo');
        res.status(404).json({error: error.message})
        return
      }
      
      const user = await User.findById(token.user)
      
      if ( !user ) {
        const error = new Error('El usuario no Existe')
        res.status(404).json({error: error.message})
        return
      }

      if ( !user.confirmed ) {
        const error = new Error('La cuenta no ha sido confirmada, Solicite un token de confirmación')
        res.status(401).json({error: error.message})
        return
      }

      res.json({msg: "Token valido, Cambie su Password"})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }

  static createNewPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    try {
      const token = await Token.findOne({token: req.params.token})
      
      if (!token) {
        const error = new Error('El token no existe o ya expiro, solicite uno nuevo');
        res.status(404).json({error: error.message})
        return
      }

      const user = await User.findById(token.user);
      
      if ( !user ) {
        const error = new Error('El usuario no Existe')
        res.status(404).json({error: error.message})
        return
      }

      if ( !user.confirmed ) {
        const error = new Error('La cuenta no ha sido confirmada, Solicite un token de confirmación')
        res.status(401).json({error: error.message})
        return
      }

      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), token.deleteOne()]);
      res.json({msg: 'Contraseña cambiada correctamente'})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }
  
  static user = async (req: Request, res: Response) => {
    res.json(req.user);
    return
  }

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if ( !user ) {
        const error = new Error('El usuario no Existe')
        res.status(404).json({error: error.message})
        return
      }

      const compare = await isPasswordCorrect(password, user.password)

      if (!compare) {
        const error = new Error('El Password es incorrecto')
        res.status(401).json({error: error.message})
        return
      } 

      res.json({msg: "Password Correcto"})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }
}