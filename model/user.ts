import { Document, model, Schema } from "mongoose";
import bcrypt from 'bcryptjs';

const UserSchema = Schema({
  userId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  name : {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  }
})

interface IUserSchema extends Document {
  userId: string;
  accessToken: string;
  email: string;
  name: string;
  password: string;
}

const User = model<IUserSchema>("User", UserSchema);
export default User;

UserSchema.pre('save', async function(next) {
  // Hash the password before saving the user model
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error('Invalid login credentials');
  }
  return user;
};