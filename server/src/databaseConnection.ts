import oracledb, { Result } from 'oracledb'
import { oraclePassword } from './secrets'
import { Bus } from './updater'

// Table names:
//  - Autobus
//  - Przejazd

async function databaseConnect() {
  return await oracledb.getConnection({
    user: 'kw438800',
    password: oraclePassword,
    connectionString: 'https://labora.mimuw.edu.pl/LABS'
  })
}

export async function databaseInit() {
  // Connect
  let connection: oracledb.Connection

  // Create the tables
  // This will fail if tables already exist, but we don't care
  try {
    connection = await databaseConnect()

    await connection.execute(
      `CREATE TABLE Autobus (
        nr_pojazdu INT PRIMARY KEY,
        przewoznik VARCHAR(100) NOT NULL,
        zajezdnia VARCHAR(100) NOT NULL,
        producent VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        rok_produkcji INT NOT NULL,
        nr_rejestracyjny VARCHAR(7) NOT NULL,
        niska_podloga BOOL NOT NULL,
        zapowiadanie_przystankow BOOL NOT NULL,
        tablice_elektroniczne BOOL NOT NULL,
        cieple_guziki BOOL NOT NULL,
        monitoring BOOL NOT NULL,
        biletomat BOOL NOT NULL,
        klimatyzacja BOOL NOT NULL
      );`
    )

    await connection.execute(
      `CREATE TABLE Przejazd (
        id INT PRIMARY KEY,
        linia VARCHAR(5) NOT NULL,
        autobus NOT NULL REFERENCES Autobus,
        start DATETIME NOT NULL,
        koniec DATETIME,
        aktualna_pozycja_x DOUBLE(9, 7) NOT NULL,
        aktualna_pozycja_y DOUBLE(9, 7) NOT NULL
      );`
    )
  } catch (err) {
    console.error(err)
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }
}

export async function databaseExecute(query: string) : Promise<Result<unknown>> {
  let connection: oracledb.Connection
  let result: Result<unknown>

  try {
    connection = await databaseConnect()

    result = await connection.execute(query)
  } catch (err) {
    console.error(err)
  } finally {
    if (connection) {
      try {
        connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (result) {
    return new Promise((resolve) => resolve(result))
  } else {
    return new Promise((_resolve, reject) => reject("Failed to execute query"))
  }
}

export async function databaseInsertOrUpdateBuses(buses: Bus[]) {
  let connection: oracledb.Connection

  try {
    connection = await databaseConnect()

    buses.forEach((bus, index) => {
      connection.execute(
        `BEGIN
          INSERT INTO Autobus VALUES (
            ${bus.id},
            ${bus.owner},
            ${bus.depot},
            ${bus.manufacturer},
            ${bus.model},
            ${bus.year},
            ${bus.registration},
            ${bus.lowBed},
            ${bus.sound},
            ${bus.lcdPanels},
            ${bus.doorButtons},
            ${bus.cctv},
            ${bus.tickets},
            ${bus.climateControl}
          );
        EXCEPTION
          WHEN DUP_VAL_ON_INDEX THEN
            UPDATE mytable
            SET przewoznik               = ${bus.owner},
                zajezdnia                = ${bus.depot},
                producent                = ${bus.manufacturer},
                model                    = ${bus.model},
                rok_produkcji            = ${bus.year},
                nr_rejestracyjny         = ${bus.registration},
                niska_podloga            = ${bus.lowBed},
                zapowiadanie_przystankow = ${bus.sound},
                tablice_elektroniczne    = ${bus.lcdPanels},
                cieple_guziki            = ${bus.doorButtons},
                monitoring               = ${bus.cctv},
                biletomat                = ${bus.tickets},
                klimatyzacja             = ${bus.climateControl}
            WHERE id = 1;
        END;`
      )

      console.log('Inserted bus', index)
    })
  } catch (err) {
    console.error(err)
  } finally {
    if (connection) {
      try {
        connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }
}