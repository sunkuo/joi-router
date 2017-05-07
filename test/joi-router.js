const express = require('express')
const request = require('supertest')
const Joi = require('joi')
require('../')

describe('Input validation', function () {
  it('should work well without validation', function (done) {
    const app = express()

    app.get('/tobi', function (req, res) {
      res.end('deleted tobi!')
    })

    request(app)
    .get('/tobi')
    .expect(200, 'deleted tobi!', done)
  })

  describe('query validation should work', function () {
    it('request should fail with wrong query', function (done) {
      const app = express()
      app.get('/tobi', {query: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }})
      request(app)
      .get('/tobi')
      .expect(400, done)
    })

    it('request should work with right query', function (done) {
      const app = express()
      app.get('/tobi', {query: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        res.end('success')
      })
      request(app)
      .get('/tobi')
      .query('userId=133')
      .expect(200, 'success', done)
    })
  })

  describe('params validation should work', function () {
    it('request should fail with wrong params', function (done) {
      const app = express()
      app.get('/tobi/:userId', {params: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }})
      request(app)
      .get('/tobi/1')
      .expect(400, done)
    })

    it('request should work with right params', function (done) {
      const app = express()
      app.get('/tobi/:userId', {params: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        res.end(req.params.userId)
      })
      request(app)
      .get('/tobi/123')
      .expect(200, '123', done)
    })
  })

  describe('body validation should work', function () {
    it('request should fail with wrong body', function (done) {
      const app = express()
      app.post('/tobi', {body: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        res.end('success')
      })
      request(app)
      .post('/tobi')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}))
      .expect(400, done)
    })

    it('request should work with right body', function (done) {
      const app = express()
      app.post('/tobi', {body: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        res.end(req.body.userId)
      })
      request(app)
      .post('/tobi')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({userId: 'sunkuo'}))
      .expect(200, 'sunkuo', done)
    })
  })

  describe('multiple location should work', function () {
    it('it should work with multiple locations', function (done) {
      const app = express()
      app.post('/tobi/:userId', {
        body: {
          content: Joi.string().alphanum().min(3).max(30).required()
        },
        query: {
          limit: Joi.number().integer().min(0).max(50)
        },
        params: {
          userId: Joi.string().alphanum().min(3).max(30).required()
        }
      }, (req, res, next) => {
        res.end(`${req.body.content} ${req.query.limit} ${req.params.userId}`)
      })
      request(app)
      .post('/tobi/sunkuo')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({content: 'Lorem'}))
      .query('limit=10')
      .expect(200, 'Lorem 10 sunkuo', done)
    })
  })

  describe('multiple validation schema part should work', function () {
    it('validation schema aside another validation schema should work', function (done) {
      const app = express()
      app.post('/tobi', {query: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }}, {body: {
        content: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        res.end('success')
      })
      request(app)
      .post('/tobi')
      .set('Content-Type', 'application/json')
      .query('userId=133')
      .send(JSON.stringify({content: 'Lorem'}))
      .expect(200, 'success', done)
    })

    it('validation schema away from another validation schema should work', function (done) {
      const app = express()
      app.post('/tobi', {query: {
        userId: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        next()
      }, {body: {
        content: Joi.string().alphanum().min(3).max(30).required()
      }}, (req, res, next) => {
        res.end('success')
      })
      request(app)
      .post('/tobi')
      .set('Content-Type', 'application/json')
      .query('userId=133')
      .send(JSON.stringify({content: 'Lorem'}))
      .expect(200, 'success', done)
    })
  })
})
