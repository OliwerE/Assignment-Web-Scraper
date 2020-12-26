/**
 * Module for Calendar scraping.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import { JSDOM } from 'jsdom'
import { Scraper } from './scraper.js'

// import webScraper from './app.js'

// import * as application from './application.js'

/**
 * A class scraping calendars for days when everyone is free.
 */
export class Calendar {
  /**
   * Constructs the calendar object.
   *
   * @param {string} link - An url used to scrape the first page of the calendar.
   */
  constructor (link) {
    this.link = link
    this.calendarPotentialDays = [] // möjliga dagar enligt kalender
    this.scraper = new Scraper()

    // flyttade från application.js
    // //this.calendarDays // alla personers möjliga dagar i separata arrayer // DENNA GAV LINT ERROR pga "uttryck"
    this.calendarPotentialDays = [] // möjliga dagar enligt kalender
  }

  /**
   * A method used to run the other calendar methods in the correct order.
   */
  async start () {
    // console.log('calendar class started')

    // await saknades på async funk! LÖST!
    await this.scraper.getScraper(this.link)
    this.getFirstLinks()
    await this.scrapeAllCalendars()
  }

  /**
   * Scrapes links from first page in calendar.
   */
  getFirstLinks () {
    // console.log('getFIRSTLinks startar')
    const startDom = new JSDOM(this.scraper.lastResponse)
    // console.log('first links')

    const relativeLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.href)
    // console.log('KALENDER GET FIRST LINKS!')
    // this.scrapeAllCalendars()

    // bygg absoluta länkar här:
    // console.log('number of links:', relativeLinks.length)

    this.calendarFirstPageLinks = []

    for (let i = 0; i < relativeLinks.length; i++) {
      // console.log('calendar link: ', i)
      this.calendarFirstPageLinks[i] = this.link.concat(relativeLinks[i].slice(2)) // creates absolute link
    }
  }

  /**
   * Scrapes all free times in all calendars.
   */
  async scrapeAllCalendars () {
    // console.log('-----starts scrapeAllCalendars------')
    // console.log(this.calendarFirstPageLinks) // måste skapa absoluta länkar av dessa!
    // console.log(this.calendarFirstPageLinks.length)

    this.calendarDays = [] // array with all persons possible days
    for (let i = 0; i < this.calendarFirstPageLinks.length; i++) {
      // console.log('skrapa kalender länk', i)

      await new Promise((resolve, reject) => { // gör om till "bara" await getscraper ?? utan promise
        resolve(this.scraper.getScraper(this.calendarFirstPageLinks[i]))
      }).then(() => {
        // await this.scraper.getScraper(this.calendarFirstPageLinks[i])

        // console.log('person', i, 'calendar scraped!')

        // lägg till alla dagar i array:
        const calendarDom = new JSDOM(this.scraper.lastResponse)
        const days = Array.from(calendarDom.window.document.querySelectorAll('th'))// .map(HTMLAnchorElement => HTMLAnchorElement.href) // 'a[href^="./"'
        const ifDayPossible = Array.from(calendarDom.window.document.querySelectorAll('td'))// .map(HTMLAnchorElement => HTMLAnchorElement.href) // 'a[href^="./"'

        // Name FUNGERAR INTE
        // const personName = calendarDom.window.document.querySelector('h2').childNodes[0].nodeValue // vänd??
        // console.log(personName)

        const personDays = [] // dagar från en person
        for (let i = 0; i < 3; i++) {
          const day = days[i].childNodes[0].nodeValue
          const dayAnswer = ifDayPossible[i].childNodes[0].nodeValue
          // console.log(day)
          // console.log(dayAnswer)

          if (dayAnswer === '--' || dayAnswer === '-') { // fungerar inte med !== måste använda === och ha else sats FIXA
            // console.log('find another day!')

          } else {
            // console.log('found day!')
            personDays.push(day)
          }
        }
        this.calendarDays.push(personDays) // fungerar inte utanför

        // console.log('SCRAPE ALL CALENDARS SLUT')
        this.possibleDays()
      })

      // console.log([...new Set(this.calendarDays)])
      // break //debug endast första kalendern!
    }
  }

  /**
   * Finds potential days.
   */
  possibleDays () {
    // console.log('---possibleDays startar----')
    // console.log('dagar som de olika personerna kan:')
    // console.log(this.calendarDays)

    // dagarna antal ggr (gör om till objekt??)
    let fridayCount = 0
    let saturdayCount = 0
    let sundayCount = 0

    // gå igenom arrayer ta reda på vilka dagar som förekommer 3 ggr:

    for (let i = 0; i < this.calendarDays.length; i++) { // loop igenom alla arrayer i array och räkna antal ggr varje dag förekommer. 3ggr = alla kan!
      // console.log(i)
      const arrayLength = this.calendarDays[i].length
      // console.log(arrayLength)

      for (let a = 0; a < arrayLength; a++) {
        const indexDay = this.calendarDays[i][a] // a day in a persons array
        // console.log(indexDay)
        if (indexDay === 'Friday') {
          fridayCount += 1
        } else if (indexDay === 'Saturday') {
          saturdayCount += 1
        } else if (indexDay === 'Sunday') {
          sundayCount += 1
        }
      }
    }
    // console.log('friday: ', fridayCount, 'saturday: ', saturdayCount, 'sunday: ', sundayCount)

    // välj ut möjliga dagar: SKAPA BÄTTRE LÖSNING!!

    if (fridayCount === 3) {
      this.calendarPotentialDays.push(5) // dagar i cinema motsvarar veckodagens siffra!
    }

    if (saturdayCount === 3) {
      this.calendarPotentialDays.push(6) // dagar i cinema motsvarar veckodagens siffra!
    }

    if (sundayCount === 3) {
      this.calendarPotentialDays.push(7) // dagar i cinema motsvarar veckodagens siffra!
    }

    /*
    if (fridayCount !== 3 && saturdayCount !== 3 && sundayCount !== 3) {
      throw new Error('ingen dag möjlig!')
    }
    */

    // console.log(this.calendarPotentialDays)

    // console.log('-----slut calendar modul-----')
    // this.scrapeCinema() // LÖS PÅ ANNAT SÄTT FÖR ATT FORTSÄTTA!
  }
}
