import type { Request, Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const {email} = req.body

    const user = await User.findOne({email}).select('_id email name')

    if (!user) {
      const error = new Error('Usuario no Encontrado')
      res.status(404).json({error: error.message})
      return
    }

    res.json({msg: "Usuario Encontrado", user})
  }

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body

    const user = await User.findById(id).select('_id')

    if (!user) {
      const error = new Error('Usuario no Encontrado')
      res.status(404).json({error: error.message})
      return
    }

    if (req.project.team.some( team => team.toString() === user.id.toString())) {
      const error = new Error('Ese Usuario ya existe en el Proyecto')
      res.status(409).json({error: error.message})
      return
    }

    if (req.project.manager.toString() === user.id.toString()) {
      const error = new Error('El Manager no puede ser agregado como Colaborador')
      res.status(409).json({error: error.message})
      return
    }
    
    req.project.team.push(user.id)

    req.project.save()
    res.json({ msg: 'Usuario agregado correctamente' })
  }

  static getProjectTeam = async (req:Request, res: Response) => {
    const users = await Project.findById(req.project.id).populate({
      path: 'team',
      select: '_id email name'
    })
    
    res.json({ msg: 'Usuario del proyecto', users: users })
  }

  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params
    
    try {
      if (!req.project.team.some( team => team.toString() === userId.toString())) {
        const error = new Error('El Usuario no se encuentra en el proyecto')
        res.status(409).json({error: error.message})
        return
      }

      req.project.team = req.project.team.filter( team => team.toString() !== userId.toString() )

      await req.project.save()
      res.json({msg: 'Usuario fue expulsado del proyecto Correctamente'})
    } catch (error) {
      res.status(500).json('Hubo un error')
    }
  }
}