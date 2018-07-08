const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/user')
const token = require('./token')
const auth = require('./middleware/auth')

const uri = 'mongodb://localhost:27017/auth'

const app = express()
const PORT = 8080

app.use(bodyParser.json())

const findUserById = async (req, res, next) => {
  try {
    const id = req.token.user.id
    const user = await User.findById(id)
    req.user = user
    next()
  } catch (e) {
    next(e)
  }
}

app.get('/users/current', auth, findUserById, async (req, res, next) => {
  res.status(200).send({ user: req.user })
})

app.post('/login', async (req, res, next) => {
  // 1. get the email and password from the request body
  const { email, password } = req.body
  // 2. find a user that matches the email in the req body
  try {
    const doc = await User.findOne({ email })
    if (!doc) {
      // 3. if no user exists, send a 404 (not found) error
      next(new Error('not found'))
    }
    // 4. check to see if the passwords match
    try {
      const match = await doc.comparePassword(password)
      if (match) {
        const _token = token.create(doc)
        res.status(200).send({ token: _token })
      }
      // 6. if they don't match send back a 401 (unauthorized)
      next(new Error('unauthorized'))
    } catch (e) {
      next(e)
    }
  } catch (e) {
    next(e)
  }
})

app.post('/signup', async (req, res, next) => {
  // 1. get the email and password from the request body
  const { email, password } = req.body
  // 2. create an instance of the user model
  const user = new User({
    // 3. provide the email and password to the user model
    email,
    password
  })
  try {
    // 4. save it into our database
    const doc = await user.save()
    // 5. if we're successful, send back the saved user
    res.status(200).send(doc)
  } catch (e) {
    // 6. if we fail, send back an error
    next(e)
  }
})

app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok'
  })
})

app.listen(PORT, async () => {
  await mongoose.connect(uri)
  console.log(`Listening on ${PORT}`)
})
