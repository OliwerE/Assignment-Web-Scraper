/**
 * The application module for the web scraper.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

//import * as Scraper from './scraper.js'
import * as suggestion from './suggestion.js'

import { JSDOM } from 'jsdom'

import {Scraper} from './scraper.js'

export class Application extends Scraper {
    constructor (startUrl) {
      super()
      this.startUrl = startUrl
      this.firstPageLinks // länkarna på första sidan
      this.firstLinksCount = 0 // om = antal länkar på startsidan slutar applikationen
      this.calendarFirstPageLinks
      //this.scraper = new scraper.Scraper() // instans av scraper
    }

    firstScrape () {
      console.log('calls scraper')
      this.startScraping(this.startUrl, 'firstLinks')


    }

    getFirstLinks(typeOfData) { // tar ut första länkarna på startsidan
      console.log('getFIRSTLinks startar')
      const startDom = new JSDOM(this.lastResponse)
      console.log('first links')
      

      if(typeOfData === 'firstLinksCalendar') {
        this.calendarFirstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.href)
        console.log('KALENDER GET FIRST LINKS!')
        this.scrapeAllCalendars()
      } else {
      this.firstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="https://"], a[href^="http://"]')).map(HTMLAnchorElement => HTMLAnchorElement.href)
      console.log(this.firstPageLinks)
      this.beginScrapingAllPages()
      }

      }

      beginScrapingAllPages () {
        console.log('-------beginScrapingAllPages-------')

        // alla sidor delar skrapas separat pga olika struktur.
        this.beginScrapeCalendar()
        //this.scrapeCinema()
        //this.scrapeDinner()
      }

      beginScrapeCalendar () {
        this.startScraping(this.firstPageLinks[0], 'firstLinksCalendar') // hårdkoda vilken länk i array???
      }

      scrapeAllCalendars () {
        console.log('-----starts scrapeAllCalendars------')
        console.log(this.calendarFirstPageLinks) // måste skapa absoluta länkar av dessa!
      }
}