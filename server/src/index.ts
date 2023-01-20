import { databaseInit } from './databaseConnection'
import { startServer } from './server'
import { updateBuses, updateBusesFromFile, updatePositions } from './updater'

// startServer()

async function main() {
  await databaseInit()
  // await updateBuses()
  // await updateBusesFromFile()
  await updatePositions();
}

main()
