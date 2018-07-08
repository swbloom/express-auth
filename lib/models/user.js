// require mongoose
const mongoose = require('mongoose')
// grab Schema off of mongoose
const Schema = mongoose.Schema

// require bcrypt
const bcrypt = require('bcrypt')

// define user schema:
const userSchema = new Schema({
  // email: unique string required
  email: { type: String, required: true, unique: true },
  // password: string required
  password: { type: String, required: true }
})

// 1. before a user is saved:
userSchema.pre('save', async function (next) {
  const user = this
  // 2. if it's a new user OR the user's password has changed
  if (user.isModified('password') || user.isNew) {
    try {
      // 3. hash their password
      const hash = await bcrypt.hash(user.password, 10)
      // 4. set their password to be equal to the hash
      user.password = hash
      next()
    } catch (e) {
      next(e)
    }
  }
  // 5. otherwise (not new user/password hasn't changed)
  // 6. carry on
  next()
})

userSchema.methods.comparePassword = function (password) {
  const user = this
  // password = the password that comes from the request body
  // user.password = the stored hashed password in the database
  return bcrypt.compare(password, user.password)
}

// instantiate model
const User = mongoose.model('User', userSchema)

// export it
module.exports = User
