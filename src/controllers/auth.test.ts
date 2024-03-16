import supertest from 'supertest'
import app, { authRoute } from '../app'
import { StatusCodes } from 'http-status-codes'

describe('POST /register', () => {
  const route = `${authRoute}/register`

  test('should allow user to register name, username, password and return JWT token', async () => {
    const response = await supertest(app).post(route).send({
      name: 'anna',
      username: 'anna@gmail.com',
      password: 'secret',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body).toHaveProperty('token')
    expect(response.body.message).toBe('Successfully registered user')
  })

  test('should not allow user to register if username given is not a valid email', async () => {
    const response = await supertest(app).post(route).send({
      name: 'anna',
      username: 'anna',
      password: 'secret',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe('Please provide a valid email')
  })

  test('should not allow user to register if username given already exists', async () => {
    const response = await supertest(app).post(route).send({
      name: 'anna',
      username: 'anna@gmail.com',
      password: 'secret',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe('Username already exists')
  })

  test('should not allow user to register if password given is less than 6 characters', async () => {
    const response = await supertest(app).post(route).send({
      name: 'peter',
      username: 'peter@gmail.com',
      password: '12345',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe('Password must be at least 6 characters')
  })

  test('should not allow user to register if email already exists in database and password given is less than 6 characters', async () => {
    const response = await supertest(app).post(route).send({
      name: 'anna',
      username: 'anna@gmail.com',
      password: '12345',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe(
      'Username already exists, Password must be at least 6 characters'
    )
  })

  test('should give proper message when certain fields are missing', async () => {
    const response = await supertest(app).post(route).send({
      username: 'new@gmail.com',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe(
      'Please enter name, Please enter password, Password must be at least 6 characters'
    )
  })
})

describe('POST /login', () => {
  const route = `${authRoute}/login`

  test('should allow user to login given the correct username and password', async () => {
    const response = await supertest(app).post(route).send({
      username: 'anna@gmail.com',
      password: 'secret',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body).toHaveProperty('token')
  })

  test('should not allow user to login if any given credentials are wrong', async () => {
    const response = await supertest(app).post(route).send({
      username: 'unregistered@gmail.com',
      password: 'wrongPassword',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body.message).toBe('Invalid credentials')
  })

  test('should not allow user to login if given password is incorrect', async () => {
    const response = await supertest(app).post(route).send({
      username: 'anna@gmail.com',
      password: 'wrongPassword',
    })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body.message).toBe('Invalid credentials')
  })

  test('should give proper message when certain fields are missing', async () => {
    const response = await supertest(app).post(route).send({})

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe(
      'Please enter username, Please provide a valid email, Please enter password'
    )
  })
})
