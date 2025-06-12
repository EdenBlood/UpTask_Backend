import type { Request, Response } from "express"
import Project from "../models/Project"
import mongoose from "mongoose"

//* Se Utilizan Clases para solo importar una sola clase y no muchas funciones.
export class ProjectController {
  //* Le colocamos "static" porque un metodo estatico no necesita ser Instanciado.
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body)
    //* Nos asignamos como Managers.
    project.manager = req.user.id

    try {
      await project.save();
      
      res.send({msg: "Proyecto Creado Correctamente", project})
    } catch (error) {
      console.log(error)
    }
  }
  
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      //* Traemos todos los Proyectos - @model.find({})
      //* $or condiciones
      //* Le decimos que se traiga solo los proyectos en los cuales el "Manager" coincide con el del usuario autenticado
      const project = await Project.find({
        $or: [ 
          {manager: {$in: req.user.id}},
          {team: {$in: req.user.id}}
        ]
      })
  
      res.send({msg: "Todos los Proyectos", project})
    } catch (error) {
      console.log(error)
    }
  }

  static getProjectById = async (req:  Request, res: Response) => {
    const { id } = req.params

    try {
      const project = await Project.findById(id)
        .populate('tasks')
        .populate({
          path: 'tasks',
          populate: {
            path: 'completedBy.user',
            model: 'User',
            select: '_id email name'
          }
        })

      if(!project) {
        const error = new Error('Proyecto no encontrado')
        res.status(404).json({error: error.message})
        return
      }
      
      if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id.toString())) {
        const error = new Error('Proyecto no encontrado')
        res.status(404).json({error: error.message})
        return
      }
  
      res.send({msg: "Proyecto encontrado", project})
    } catch (error) {
      console.log(error)
    }
  }

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName || req.project.projectName;
      req.project.clientName = req.body.clientName || req.project.clientName;
      req.project.description = req.body.description || req.project.description;
      
      await req.project.save()

      res.status(200).json({ msg: "Proyecto actualizado", project: req.project})
    } catch (error) {
      console.log(error)
    }
  }

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne()
      
      res.json({ msg: "Proyecto eliminado correctamente"})
    } catch (error) {
      console.log(error)
    }
  }
}