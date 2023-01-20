import { databaseInit } from './databaseConnection'
import { startServer } from './server'
import { updateBuses, updateBusesFromFile, updatePositions } from './updater'
import cron from 'node-cron'

async function updateEveryDay() {
  await updateBuses()
  await updateBusesFromFile()
}

async function updateEveryMinute() {
  await updatePositions()
}

async function main() {
  // startServer()
  await databaseInit()
  // await updateBuses()
  // await updateBusesFromFile()

  // Setup cron jobs
  // Run daily at 2:07 AM
  cron.schedule('7 2 * * *', updateEveryDay)
  // Run every 30 seconds
  cron.schedule('*/30  * * * * *', updateEveryMinute)
}

main()
