import cheerio from "cheerio"
import rp from "request-promise"
import { databaseInsertOrUpdateBuses } from "./databaseConnection"

const apiKey = "7ee8dab5-1fa9-4baa-bc9a-44e053b87edf"
const requestURL = "https://api.um.warszawa.pl/api/action/busestrams_get/?resource_id=f2e5503e-927d-4ad3-9500-4ab9e55deb59&limit=5&apikey="
  + apiKey + "&type=1&q=2"

const busBankURL_start = "https://www.ztm.waw.pl/baza-danych-pojazdow/page/"
const busBankURL_end = "/?ztm_traction=1&ztm_make&ztm_model&ztm_year&ztm_registration&ztm_vehicle_number&ztm_carrier&ztm_depot"

export type Bus = {
  id: number,
  manufacturer: string,
  model: string,
  year: number,
  registration: string,
  owner: string,
  depot: string,

  tickets: Boolean,
  lowBed: Boolean,
  climateControl: Boolean,
  sound: Boolean,
  lcdPanels: Boolean,
  doorButtons: Boolean,
  cctv: Boolean,
}

async function getNumberOfBusPages(): Promise<number> {
  // return new Promise((resolve, reject) => {
  //   rp(busBankURL_start + 1 + busBankURL_end)
  //     .then((html => {
  //       const $ = cheerio.load(html);
  //       const list = $("div.grid-pager > nav > ul > li > a").map((i, x) => $(x).attr("href")).toArray()

  //       list.sort((a, b) => a.localeCompare(b))

  //       const pageNumberPattern = /\d+/g

  //       resolve(parseInt(list[list.length - 1].match(pageNumberPattern)[0]))
  //     }))
  //     .catch((err) => reject(err))
  // });
  return new Promise((resolve) => resolve(1))
}

async function getBusesOnPage(url: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    rp(url)
      .then((html) => {
        const $ = cheerio.load(html);
        const list = $(".grid-row-active").map((i, x) => $(x).attr("href")).toArray()

        resolve(list)
      })
      .catch((err) => reject(err))
  })
}

async function getBusLinks(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    getNumberOfBusPages()
      .then((numberOfPages) => {
        let pageLinks: string[] = []
        for (let i = 1; i <= numberOfPages; i++) {
          pageLinks.push(busBankURL_start + i + busBankURL_end)
        }

        const requests = pageLinks.map((link) => {
          return getBusesOnPage(link)
            .then((parial) => parial)
        })
    
        Promise.all(requests)
          .then((results) => resolve(results.flat(1)))
          .catch((err) => reject(err))
      })
      .catch((err) => {
        reject(err);
      })
  })
}

async function getBus(url): Promise<Bus> {
  return new Promise((resolve, reject) => {
    rp(url)
      .then(async (html) => {
        const $ = cheerio.load(html);
        
        const list = $("div.vehicle-details-entry-value").map((i, x) => {
          const tmp: any = $(x.children).first()[0]
          return tmp.data
        }).toArray()

        const bus: Bus = {
          manufacturer: list[0],
          model: list[1],
          year: parseInt(list[2]),
          registration: list[4],
          id: parseInt(list[5]),
          owner: list[6],
          depot: list[7],

          tickets: list[8] === "dostępny",
          lowBed: list[9].includes("niska podłoga"),
          climateControl: list[9].includes("klimatyzacja"),
          sound: list[9].includes("zapowiadanie przystanków"),
          lcdPanels: list[9].includes("tablice elektroniczne"),
          doorButtons: list[9].includes("ciepłe guziki"),
          cctv: list[9].includes("monitoring")
        }

        resolve(bus)
      })
      .catch((err) => reject(err))
  })
}

const timer = (ms) => new Promise( res => setTimeout(res, ms))

async function getBuses() : Promise<Bus[]> {
  return new Promise((resolve, reject) => {
    getBusLinks()
      .then((result) => {
        const requests = result.map((link, i) => {
          return timer(i * 1000)
            .then(() => {
              return getBus(link)
                .then((bus) => {
                  console.log("Got bus: ", i)
                  return bus;
              })
            })
        })

        Promise.all(requests)
          .then((buses) => resolve(buses))
          .catch((err) => reject(err))
      })
      .catch((err) => reject(err))
  })
}

export async function updateBuses() {  
  getBuses()
    .then((res) => {
      databaseInsertOrUpdateBuses(res)
    })
    .catch((err) => {
      console.error("Error getting buses")
      console.error(err)
    })
}

export function updatePositions() {
  console.error("updatePositions(): NOT IMPLEMENTED");
}