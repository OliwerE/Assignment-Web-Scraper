/**
 * Module for Restaurant scraping.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import { JSDOM } from 'jsdom'
import { Scraper } from './scraper.js'

/**
 * Class sign in and scrapes a restaurant.
 */
export class Restaurant {
  /**
   * Constructs the restaurant object.
   *
   * @param {string} firstPageLink - The first link to the restaurant.
   */
  constructor (firstPageLink) {
    this.firstPageLink = firstPageLink // First page of the restaurant.
    this.scraper = new Scraper()
    this.AllFreeTimes = [] // An array with all free times.
  }

  /**
   * A method used to run the other calendar methods in the correct order.
   */
  async start () {
    await this.scrapeDinnerFirstPage()
    await this.getZekeSessionToken()
    this.modifyPostResponse()
    await this.scrapeDinnerBooking()
    this.getAllZekeBookingTimes()
  }

  /**
   * Scrapes the first page of the restaurant and builds an absolute link for the form post action.
   */
  async scrapeDinnerFirstPage () {
    await new Promise((resolve, reject) => {
      resolve(this.scraper.getScraper(this.firstPageLink)) // Scrapes the first page of the restaurant.
    }).then(() => {
      // builds dom
      const zekeStart = new JSDOM(this.scraper.lastResponse)

      // extract login relative link
      const loginPostLinkAction = Array.from(zekeStart.window.document.querySelectorAll('form[action^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.action)

      // builds absolute login link
      const relativeSpliced = loginPostLinkAction[0].slice(2)
      this.absoluteZekeLogin = this.firstPageLink.concat(relativeSpliced)
    })
  }

  /**
   * Method gets a new session cookie and the relative url to the booking page.
   */
  async getZekeSessionToken () {
    const loginInfo = { // Restaurant login credentials.
      username: 'zeke',
      password: 'coys'
    }

    await new Promise((resolve, reject) => {
      resolve(this.scraper.postLoginScraper(this.absoluteZekeLogin, loginInfo)) // Posts login credentials to the absolute login url.
    })
  }

  /**
   * Formats the session cookie and builds an absolute link to the booking page.
   */
  modifyPostResponse () {
    const relativeUrl = this.scraper.lastResponse[0]
    const responseCookie = this.scraper.lastResponse[1]

    const absoluteUrl = this.firstPageLink.concat(relativeUrl)

    // Extract cookie
    const splitCookie = responseCookie.split('; ')
    const fixedCookie = splitCookie[0]

    this.getRequestDataZeke = [absoluteUrl, fixedCookie] // An array with the absolute url and an active session cookie for the booking page.
  }

  /**
   * Scrapes the restaurant booking page.
   */
  async scrapeDinnerBooking () {
    await new Promise((resolve, reject) => {
      resolve(this.scraper.getScraper(this.getRequestDataZeke[0], this.getRequestDataZeke[1]))
    })
  }

  /**
   * Method saves all free booking times into an array with objects.
   */
  getAllZekeBookingTimes () {
    const zekeBookingDom = new JSDOM(this.scraper.lastResponse)

    this.zekeAllTimes = []
    for (let i = 5; i < 8; i++) { // Saves all restaurant times in an array.
      let wordSectionNumber // Used to select elements in the dom. 5-7  = day of the week.
      if (i === 5) {
        wordSectionNumber = 2
      } else if (i === 6) {
        wordSectionNumber = 4
      } else if (i === 7) {
        wordSectionNumber = 6
      }
      const AllTimes = Array.from(zekeBookingDom.window.document.querySelectorAll('div[class^="WordSection' + wordSectionNumber + '"] span'))

      this.zekeAllTimes = this.zekeAllTimes.concat(AllTimes) // Adds all times into an array.
    }

    for (let i = 0; i < this.zekeAllTimes.length; i++) {
      const splitted = this.zekeAllTimes[i].childNodes[0].nodeValue.split(' ')
      const ifFree = splitted[13].split('\n') // If the time is free.

      if (ifFree[0] === 'Free') {
        let freeDay
        if (i <= 3 && i >= 0) { // If Friday
          freeDay = '05'
        } else if (i <= 7 && i > 3) { // If Saturday
          freeDay = '06'
        } else if (i <= 11 && i > 7) { // If Sunday
          freeDay = '07'
        }
        const potentialTime = { time: splitted[12], day: freeDay } // An object representing a potential time.
        this.AllFreeTimes.push(potentialTime)
      }
    }
  }
}
