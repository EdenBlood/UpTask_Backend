import type { Request, Response} from 'express'
import Note, { INote } from '../models/Note'
import { Types } from 'mongoose'

type NoteParams = {
  noteId: Types.ObjectId;
}

export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body

    const note = new Note()

    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    req.task.notes.push(note.id)
    
    try {
      await Promise.allSettled([note.save(), req.task.save()])
      res.json({msg: "Nota creada Correctamente"})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static getNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({task: req.task.id, manager: req.project.manager})

      res.json({msg: "Notas Encontradas", notes})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params;
    try {
      const note = await Note.findById(noteId)

      if (!note) {
        const error = new Error('La nota no existe');
        res.status(404).json({error: error.message})
        return
      }

      if (req.project.manager.toString() !== req.user.id.toString() && req.user.id.toString() !== note.createdBy.toString()) {
        const error = new Error('Solo el Manager o quien la creo pueden eliminar una Nota');
        res.status(409).json({error: error.message})
        return
      }

      req.task.notes = req.task.notes.filter( taskNote => taskNote.toString() !== note.id.toString())

      await Promise.allSettled([req.task.save(), note.deleteOne()])
      res.json({msg: "Nota Eliminada"})
    } catch (error) {
      res.status(500).json({error: "Hubo un Error"})
    }
  }
}