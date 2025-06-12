import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from '../models/Project'

//* Le agregamos a el Request el Type de "IProject" para poder pasar project al siguiente middleware mediante "req.project".
//* Usamos interface porque se comporta como un PATCH y no elimina todos los types que tiene "Request", sino que le agrega el type nuevo. Si usara "type" en vez de "interface" se borraria todo lo que contiene "Request" y solo tendria lo que yo le pase. 
declare global {
  namespace Express {
    interface Request {
      project: IProject,
    }
  }
}

export async function projectExist(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params
    
    const project = await Project.findById(projectId)

    if (!project) {
      const error = new Error('Proyecto no encontrado')
      res.status(404).json({error: error.message})
      return
    }
    req.project = project;
    next()
  } catch (error) {
    res.status(500).json({error: "Hubo un Error"})
  }
}