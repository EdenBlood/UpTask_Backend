import mongoose, { Document, Schema, Types } from 'mongoose';
import Note from './Note';

//* Creamos un objeto con los posibles estados de una tarea.
//* Usamos `as const` para que TypeScript trate los valores como literales (por ejemplo: 'pending' en vez de solo string).
const taskStatus = {
  PENDING: 'pending',
  ON_HOLD: 'onHold',
  IN_PROGRESS: 'inProgress',
  UNDER_REVIEW: 'underReview',
  COMPLETED: 'completed'
} as const //* as const le dice a TypeScript: “no son strings cualquiera, son exactamente esos valores”.

//* Esto crea un tipo `TaskStatus` con todos los valores posibles del objeto `taskStatus`.
//* Es decir, TaskStatus es igual a: 'pending' | 'onHold' | 'inProgress' | 'underReview' | 'completed'
//* Sirve para que TypeScript nos avise si usamos un estado inválido.
export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

//* Esta es la estructura que tendrá cada tarea en TypeScript.
//* Extendemos `Document` porque estamos usando Mongoose.
//* Así, TypeScript sabe que cada tarea tendrá esos campos.
export interface ITask extends Document {
  name: string,
  description: string,
  project: Types.ObjectId, //* Relación con un proyecto (MongoDB lo guarda como ObjectId)
  status: TaskStatus //* Solo puede tener uno de los valores definidos en taskStatus
  completedBy: {
    user: Types.ObjectId,
    status: TaskStatus,
    date?: Date
  }[],
  notes: Types.ObjectId[]
}

export const TaskSchema = new Schema({
  name : {
    type: String,
    trim: true,
    require: true,
  },

  description: {
    type: String,
    trim: true,
    require: true
  },

  //* Relación con el modelo de "Projects". `ref` nos dice con qué colección se relaciona.
  project: {
    type: Types.ObjectId,
    ref: 'Project'
  },

  //* Solo puede tomar los valores que estén dentro de `taskStatus`.
  //* Si no se especifica, usará 'pending' como valor por defecto.
  status: {
    type: String,
    enum: Object.values(taskStatus),
    default: taskStatus.PENDING
  },

  completedBy: [
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
        default: null
      },
      status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
      },
      date: {
        type: Date,
        default: () => new Date()
      }
    }
  ],

  notes: [
    {
      type: Types.ObjectId,
      ref: "Note"
    }
  ]
}, {timestamps: true}) 

//* Middleware
TaskSchema.pre('deleteOne', {document: true, query: false}, async function() {
  const taskId = this._id
  if(!taskId) return;
  await Note.deleteMany({task: taskId})
})

const Task = mongoose.model<ITask>('Task', TaskSchema)

export default Task;