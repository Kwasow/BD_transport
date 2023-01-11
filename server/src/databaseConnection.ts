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
    connectionString: 'labora.mimuw.edu.pl/LABS'
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
        przewoznik VARCHAR(60) NOT NULL,
        zajezdnia VARCHAR(60) NOT NULL,
        producent VARCHAR(60) NOT NULL,
        model VARCHAR(60) NOT NULL,
        rok_produkcji INT NOT NULL,
        nr_rejestracyjny VARCHAR(8) NOT NULL,
        niska_podloga NUMBER(1) NOT NULL,
        zapowiadanie_przystankow NUMBER(1) NOT NULL,
        tablice_elektroniczne NUMBER(1) NOT NULL,
        cieple_guziki NUMBER(1) NOT NULL,
        monitoring NUMBER(1) NOT NULL,
        biletomat NUMBER(1) NOT NULL,
        klimatyzacja NUMBER(1) NOT NULL
      )`
    )

    await connection.execute(
      `CREATE TABLE Przejazd (
        id INT PRIMARY KEY,
        linia VARCHAR(5) NOT NULL,
        autobus NOT NULL REFERENCES Autobus,
        czas_start TIMESTAMP NOT NULL,
        czas_koniec TIMESTAMP,
        aktualna_pozycja_x DOUBLE PRECISION NOT NULL,
        aktualna_pozycja_y DOUBLE PRECISION NOT NULL
      )`
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

function boolToInt(bool: Boolean): number {
  return bool ? 1 : 0
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
            '${bus.owner}',
            '${bus.depot}',
            '${bus.manufacturer}',
            '${bus.model}',
            ${bus.year},
            '${bus.registration}',
            ${boolToInt(bus.lowBed)},
            ${boolToInt(bus.sound)},
            ${boolToInt(bus.lcdPanels)},
            ${boolToInt(bus.doorButtons)},
            ${boolToInt(bus.cctv)},
            ${boolToInt(bus.tickets)},
            ${boolToInt(bus.climateControl)}
          );
        EXCEPTION
          WHEN DUP_VAL_ON_INDEX THEN
            UPDATE Autobus
            SET przewoznik               = '${bus.owner}',
                zajezdnia                = '${bus.depot}',
                producent                = '${bus.manufacturer}',
                model                    = '${bus.model}',
                rok_produkcji            = ${bus.year},
                nr_rejestracyjny         = '${bus.registration}',
                niska_podloga            = ${boolToInt(bus.lowBed)},
                zapowiadanie_przystankow = ${boolToInt(bus.sound)},
                tablice_elektroniczne    = ${boolToInt(bus.lcdPanels)},
                cieple_guziki            = ${boolToInt(bus.doorButtons)},
                monitoring               = ${boolToInt(bus.cctv)},
                biletomat                = ${boolToInt(bus.tickets)},
                klimatyzacja             = ${boolToInt(bus.climateControl)}
            WHERE nr_pojazdu = ${bus.id};
        END;`
      )

      console.log('Inserted bus', index)
    })
  } catch (err) {
    console.error(err)
  } finally {
    if (connection) {
      try {
        await connection.commit()
        await connection.close()
      } catch (err) {
        console.error(err)
      }
    }
  }

  return new Promise((resolve) => resolve);
}