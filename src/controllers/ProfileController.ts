import { Request, Response } from 'express'
import User from '../models/User';
import { hashPassword, isPasswordCorrect } from '../utils/auth';

export class ProfileController {
  static updateProfile = async (req: Request, res: Response) => {
    const { email, name } = req.body;
    
    const userExist = await User.findOne({ email })

    if ( userExist && userExist.id.toString() !== req.user.id.toString() ) {
      const error = new Error('Ese email ya esta registrado')
      res.status(409).json({error: error.message})
      return
    }
    
    req.user.name = name;
    req.user.email = email;
    
    try {
      await req.user.save();
      res.json({msg: "Perfil Actualizado correctamente"})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static updatePassword = async (req: Request, res: Response) => {
    const { current_password, new_password } = req.body

    try {
      const user = await User.findById(req.user.id);
      
      const compare = await isPasswordCorrect(current_password, user.password)

      if ( !compare ) {
        const error = new Error('El password actual es incorrecto')
        res.status(401).json({error: error.message})
        return
      }

      user.password = await hashPassword(new_password)

      await user.save();
      res.json({msg: "Password actualizado correctamente"})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }
}