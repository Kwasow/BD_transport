import oracledb, { connectionClass, Result } from 'oracledb'
import { oraclePassword } from './secrets'
import { Bus } from './updater'

// Table names:
//  - Autobus
//  - Przejazd

export async function databaseConnect() {
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
        nr_rejestracyjny VARCHAR(10) NOT NULL,
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

export function boolToInt(bool: Boolean): number {
  return bool ? 1 : 0
}
