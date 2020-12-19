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
      this.firstPageLinks
      this.firstLinksCount = 0 // om = antal länkar på startsidan slutar applikationen
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
      this.firstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="https://"], a[href^="http://"], a[href^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.href)
      console.log(this.firstPageLinks)

      if(typeOfData === 'firstLinksCalendar') {
        console.log('KALENDER GET FIRST LINKS!')
      } else {
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
}