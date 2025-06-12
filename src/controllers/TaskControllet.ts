import type { Request, Response } from 'express'
import Task from '../models/Task'

export class TaskController {
  static createTask = async ( req: Request, res: Response ) => {
    //* La validacion del project esta en el middleware de "project.ts"
    
    try {
      //* Creamos una Tarea con lo ingresado en req.body
      const task = new Task(req.body)
      //* Le agregamos el id del Projecto asociado.
      task.project = req.project.id

      //* Le agregamos al Proyecto el Id de la Tarea nueva.
      req.project.tasks.push(task.id)

      //* Almacenamos las operaciones en la db.
      await Promise.allSettled([task.save(), req.project.save()])
      res.json({msg: "Tarea creada correctamente", task})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static getProjectTask = async ( req: Request, res: Response ) => {
    try {
      //* Va a buscar en el diccionario de "Task" todas las tareas que tengan el como id de proyecto "req.project.id".
      //* El populate('project') hace que se ademas en el campo de project en vez de traerse solo el ObjectId, se traiga toda la información de el proyecto.
      const tasks = await Task.find({project: req.project.id}).populate('project')

      res.status(200).json({tasks})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static getProjectTaskById = async ( req: Request, res: Response ) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({path: "completedBy.user", model: "User", select: '_id name email'})
        .populate({path: "notes", model: "Note", populate: {path: 'createdBy', model: "User", select: '_id name email'}})
      res.json({msg: "Tarea encontrada", task, manager: req.project.manager})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static updatedTask = async (req: Request, res: Response ) => {
    try {
      req.task.name = req.body.name || req.task.name;
      req.task.description = req.body.description || req.task.description;
      req.task.status = req.body.status || req.task.status;
      req.task.completedBy = req.user.id;

      await req.task.save()
      res.send({msg: "Tarea actualizada correctamente", task: req.task})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static deleteTask = async (req: Request, res: Response) => {
    try {
      //* Quitamos de las tareas del proyecto la tarea que estamos eliminando.
      req.project.tasks = req.project.tasks.filter( task => task.toString() !== req.task.id.toString() )
      
      await Promise.allSettled([req.task.deleteOne(), req.project.save()])

      res.json({msg: "Tarea eliminada correctamente"})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})      
    }
  }

  static updatedTaskStatus = async ( req: Request, res: Response ) => {
    try {
      const { status } = req.body;

      req.task.status = status;

      const data = {
        user: req.user.id,
        status
      }

      req.task.completedBy.push(data)

      await req.task.save();

      res.send({msg: 'Estado Actualizado'})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})      
    }
  }
}