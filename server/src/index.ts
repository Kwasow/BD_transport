import express from 'express'

const app = express()
const port = 3000

const BAD_REQUEST = 400

app.get('/getPositions', (req, res) => {
  const object = {
    requestType: 'getPositions'
  }
  
  res.send(object)
})

app.get('/getBuses', (req, res) => {
  const object = {
    requestType: 'getBuses'
  }

  res.send(object)
})

app.get('/getHistory', (req, res) => {
  if (!req.query.busId) {
    const object = {
      info: 'missing busId parameter',
      code: BAD_REQUEST
    }

    res.statusCode = BAD_REQUEST
    res.send(object)
    return
  }

  const object = {
    requestType: 'getHistory',
    busNumber: req.query.busId
  }

  res.send(object)
})

app.listen(port, () => {
  console.log('BD_transport server listening on port', port)
})