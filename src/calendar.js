/**
 * Module for Calendar scraping.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import { JSDOM } from 'jsdom'
import { Scraper } from './scraper.js'

/**
 * A class scraping calendars for days when everyone is free.
 */
export class Calendar {
  /**
   * Constructs the calendar object.
   *
   * @param {string} firstLink - An url used to scrape the first page of the calendar.
   */
  constructor (firstLink) {
    this.link = firstLink // start url of calendar.
    this.calendarPotentialDays = [] // All potential days.
    this.calendarFirstPageLinks = [] // Links to all calendars.
    this.calendarDays = [] // An array with all persons possible days.
    this.scraper = new Scraper()
  }

  /**
   * A method used to run the other calendar methods in the correct order.
   */
  async start () {
    await this.scraper.getScraper(this.link)
    this.getFirstLinks()
    await this.scrapeAllCalendars()
  }

  /**
   * Scrapes links from first page in calendar.
   */
  getFirstLinks () {
    const startDom = new JSDOM(this.scraper.lastResponse)
    const relativeLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.href) // Creates an array with all relative calendar links.

    for (let i = 0; i < relativeLinks.length; i++) { // Builds absolute links to all calendars.
      this.calendarFirstPageLinks[i] = this.link.concat(relativeLinks[i].slice(2))
    }
  }

  /**
   * Scrapes all free times in all calendars.
   */
  async scrapeAllCalendars () {
    for (let i = 0; i < this.calendarFirstPageLinks.length; i++) {
      await this.scraper.getScraper(this.calendarFirstPageLinks[i]) // Awaits http response.
      // Adds all days and day answers in two separate arrays
      const calendarDom = new JSDOM(this.scraper.lastResponse)
      const days = Array.from(calendarDom.window.document.querySelectorAll('th')) // Days
      const ifDayPossible = Array.from(calendarDom.window.document.querySelectorAll('td')) // Day answer

      const personDays = [] // A persons possible days.
      for (let i = 0; i < 3; i++) {
        const day = days[i].childNodes[0].nodeValue
        const dayAnswer = ifDayPossible[i].childNodes[0].nodeValue

        if (dayAnswer === 'ok' || dayAnswer === 'Ok' || dayAnswer === 'OK' || dayAnswer === 'oK') { // If the day is possible.
          personDays.push(day)
        }
      }
      this.calendarDays.push(personDays) // Adds array into another array (calendarDays).
      this.possibleDays()
    }
  }

  /**
   * Finds potential days.
   */
  possibleDays () {
    // Number of times each day is found in this.calendarDays. three equals potential day.
    let fridayCount = 0
    let saturdayCount = 0
    let sundayCount = 0

    for (let i = 0; i < this.calendarDays.length; i++) { // Finds all days that appears three times
      const arrayLength = this.calendarDays[i].length

      for (let a = 0; a < arrayLength; a++) {
        const indexDay = this.calendarDays[i][a] // A persons array with possible days.
        if (indexDay === 'Friday') {
          fridayCount += 1
        } else if (indexDay === 'Saturday') {
          saturdayCount += 1
        } else if (indexDay === 'Sunday') {
          sundayCount += 1
        }
      }
    }

    // Adds day number for each day that equals three into an array.
    if (fridayCount === 3) {
      this.calendarPotentialDays.push(5)
    }

    if (saturdayCount === 3) {
      this.calendarPotentialDays.push(6)
    }

    if (sundayCount === 3) {
      this.calendarPotentialDays.push(7)
    }
  }
}
