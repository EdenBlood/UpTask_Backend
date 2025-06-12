import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string,
  password: string,
  email: string,
  confirmed: boolean
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    require: true,
  },
  
  email: {
    type: String,
    require: true,
    lowercase: true,
    unique: true
  },
  
  confirmed: {
    type: Boolean,
    default: false
  },
})

const User = mongoose.model<IUser>('User', userSchema)

export default User;