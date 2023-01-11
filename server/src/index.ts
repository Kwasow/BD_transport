import { databaseInit } from './databaseConnection'
import { startServer } from './server'
import { updateBuses } from './updater'

startServer()

async function main() {
  await databaseInit()
  updateBuses() 
}

main()