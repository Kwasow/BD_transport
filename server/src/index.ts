import { databaseInit } from './databaseConnection'
import { startServer } from './server'
import { updateBuses, updateBusesFromFile } from './updater'

startServer()

async function main() {
  await databaseInit()
  // updateBuses() 
  updateBusesFromFile()
}

main()