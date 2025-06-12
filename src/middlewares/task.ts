import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: ITask
    }
  }
}

export async function taskExist( req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    
    if ( !task ) {
      const error = new Error('Tarea no encontrada')
      res.status(404).json({error: error.message})
      return
    };

    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({error: "Hubo un Error"})      
  }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
  try {
    if ( req.task.project.toString() !== req.project.id.toString() ) {
      const error = new Error('Acción no valida');
      res.status(400).json({error: error.message});
      return;
    };

    next()
  } catch (error) {
    res.status(500).json({error: "Hubo un Error"})     
  }
}

export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
  if ( req.project.manager.toString() !== req.user.id.toString() ) {
      const error = new Error('Acción no valida');
      res.status(400).json({error: error.message});
      return;
  }
  next()
}