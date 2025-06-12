import mongoose, {Schema, Document, PopulatedDoc, Types } from 'mongoose'
import Task, { ITask } from './Task'
import { IUser } from './User'
import Note from './Note'

//* El Type o inteface del Schema
// export type ProjectType = Document & {} //* Type
export interface IProject extends Document { //* Interface
  projectName: string
  clientName: string
  description: string,
  tasks: PopulatedDoc<ITask & Document>[]
  manager: PopulatedDoc<IUser & Document>
  team: PopulatedDoc<IUser & Document>[]
}

//* Creamos la estructura del Schema de MongoDB
const ProjectSchema: Schema = new Schema({
  projectName: {
    type: String,
    required: true,
    trim: true,
  },

  clientName: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    require: true,
    trim: true
  },

  tasks: [
    {
      type: Types.ObjectId,
      ref: 'Task'
    }
  ],

  manager: {
    type: Types.ObjectId,
    ref: 'User'
  },

  team: [
    {
      type: Types.ObjectId,
      ref: 'User'
    }
  ]
  
}, {timestamps: true}) //* Agrega el cuando fue creado y modificado.

//* Middleware
ProjectSchema.pre('deleteOne', {document: true, query: false}, async function() {
  const projectId = this._id
  if(!projectId) return;

  const tasks = await Task.find({project: projectId})
  for( const task of tasks) {
    await Note.deleteMany({ task: task.id })
  }
  
  await Task.deleteMany({project: projectId})
})

//* Creamos el Modelo de nombre "Project" con el Schema "ProjectSchema" y le asociamos el Type "ProjectType".
const Project = mongoose.model<IProject>('Project', ProjectSchema)

export default Project;