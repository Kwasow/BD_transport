import express from 'express'
import { databaseConnect } from './databaseConnection'
import oracledb from 'oracledb'

const app = express()
const port = 2710

const INTERNAL_ERROR = 500
const BAD_REQUEST = 400
const OK_REQUEST = 200

type BusPosition = {
  busId: number,
  line: string,
  startTime: string,
  positionX: number,
  positionY: number
}

app.get('/getPositions', async (req, res) => {
  const resultBuses = new Array<BusPosition>()
  let error = false;

  let connection: oracledb.Connection

  try {
    connection = await databaseConnect()
    
    const rowsResponse = await connection.execute(
      `SELECT * FROM Przejazd WHERE czas_koniec IS NULL`
    )

    const rows = rowsResponse.rows

    for (const row of rows) {
      resultBuses.push({
        busId: row[2],
        line: row[1],
        startTime: row[3],
        positionX: row[5],
        positionY: row[6]
      })
    }

  } catch (err) {
    console.error(err)
    error = true
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (error) {
    const object = {
      code: INTERNAL_ERROR,
      info: 'internal server error'
    }
  } else {
    const object = {
      code: OK_REQUEST,
      numberOfBuses: resultBuses.length,
      buses: resultBuses
    }

    res.send(object)
  }
})

app.get('/getBuses', (req, res) => {
  const object = {
    requestType: 'getBuses'
  }

  res.send(object)
})

app.get('/getBus', (req, res) => {
  if (!req.query.busId) {
    const object = {
      info: 'missing busId parameter',
      code: BAD_REQUEST
    }

    res.statusCode = BAD_REQUEST
    res.send(object)
    return
  }
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

export function startServer() {
  app.listen(port, () => {
    console.log('BD_transport server listening on port', port)
  })
}
