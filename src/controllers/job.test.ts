import supertest from 'supertest'
import app, { authRoute, jobRoute } from '../app'
import { StatusCodes } from 'http-status-codes'

test('should not allow user without bearer token to access the URI', async () => {
  const response = await supertest(app).get(jobRoute)

  expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  expect(response.body.message).toBe(
    'No token provided, invalid authentication'
  )
})

let token = ''
let jobId = ''

async function loginUser() {
  const response = await supertest(app).post(`${authRoute}/register`).send({
    name: 'test',
    username: 'test@gmail.com',
    password: 'secret',
  })

  token = response.body.token
}

beforeAll(loginUser)

describe('POST /', () => {
  test('should allow user to create job given the valid fields', async () => {
    const response = await supertest(app)
      .post(jobRoute)
      .auth(token, { type: 'bearer' })
      .send({ company: 'Google', position: 'intern' })

    jobId = response.body.job._id

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.message).toBe('Successfully created job')
    expect(response.body).toHaveProperty('job')
  })

  test('should not allow user to create job if any fields are missing', async () => {
    const response = await supertest(app)
      .post(jobRoute)
      .auth(token, { type: 'bearer' })
      .send({})

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe(
      'Please provide company name, Please provide job position'
    )
  })
})

describe('GET /', () => {
  test('should', async () => {
    const response = await supertest(app)
      .get(jobRoute)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body).toHaveProperty('jobs')
    expect(response.body.jobs).toEqual([
      expect.objectContaining({ company: 'Google', position: 'intern' }),
    ])
  })
})

describe('GET /:id', () => {
  test('should query and return the job if given the correct id and by the user who created it', async () => {
    const response = await supertest(app)
      .get(`${jobRoute}/${jobId}`)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body).toHaveProperty('job')
  })

  test('should return error message when a not existing but valid id format is given', async () => {
    const response = await supertest(app)
      .get(`${jobRoute}/65f4d82cd4a82e7205269aa0`)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(
      'No job found with id 65f4d82cd4a82e7205269aa0'
    )
  })

  test('should return error message when an invalid id is given', async () => {
    const response = await supertest(app)
      .get(`${jobRoute}/${1}`)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe('No item found with id 1')
  })
})

describe('PATCH /:id', () => {
  test('should query and update the job if given the correct id and by the user who created it', async () => {
    const response = await supertest(app)
      .patch(`${jobRoute}/${jobId}`)
      .send({ company: 'Netflix', position: 'junior developer' })
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.message).toBe('Successfully updated job')
    expect(response.body.job).toEqual(
      expect.objectContaining({
        company: 'Netflix',
        position: 'junior developer',
      })
    )
  })

  test('should return error message when a not existing but valid id format is given', async () => {
    const response = await supertest(app)
      .patch(`${jobRoute}/65f4d82cd4a82e7205269aa0`)
      .send({ company: 'Netflix', position: 'junior developer' })
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(
      'No job found with id 65f4d82cd4a82e7205269aa0'
    )
  })

  test('should return error message when an invalid id is given', async () => {
    const response = await supertest(app)
      .patch(`${jobRoute}/${1}`)
      .send({ company: 'Netflix', position: 'junior developer' })
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe('No item found with id 1')
  })
})

describe('DELETE /:id', () => {
  test('should query and delete the job if given the correct id and by the user who created it', async () => {
    const response = await supertest(app)
      .delete(`${jobRoute}/${jobId}`)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.message).toBe('Successfully deleted job')
  })

  test('should return error message when a not existing but valid id format is given', async () => {
    const response = await supertest(app)
      .delete(`${jobRoute}/65f4d82cd4a82e7205269aa0`)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(
      'No job found with id 65f4d82cd4a82e7205269aa0'
    )
  })

  test('should return error message when an invalid id is given', async () => {
    const response = await supertest(app)
      .delete(`${jobRoute}/${1}`)
      .auth(token, { type: 'bearer' })

    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe('No item found with id 1')
  })
})
