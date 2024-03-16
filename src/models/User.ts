import { Model, Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface IUser {
  name: string
  username: string
  password: string
}

interface IUserMethods {
  comparePassword: (inputPassword: string) => boolean
  createJwtToken: () => string
}

type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide name'],
  },
  username: {
    type: String,
    required: [true, 'Please provide username'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
})

userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (inputPassword: string) {
  const isMatch = await bcrypt.compare(inputPassword, this.password)
  return isMatch
}

userSchema.methods.createJwtToken = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  )
}

const User = model<IUser, UserModel>('User', userSchema)

export default User
