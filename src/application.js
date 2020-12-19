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
      //this.scraper = new scraper.Scraper() // instans av scraper
    }

    firstScrape () {
      console.log('calls scraper')
      this.startScraping(this.startUrl, 'firstLinks')

    }

    getFirstLinks() { // tar ut första länkarna på startsidan
      console.log('getFIRSTLinks startar')
      const startDom = new JSDOM(this.lastResponse)
      console.log('first links')
      this.firstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="https://"], a[href^="http://"]')).map(HTMLAnchorElement => HTMLAnchorElement.href)
      console.log(this.firstPageLinks)

      this.beginScrapingAllPages()

      }

      beginScrapingAllPages () {
        console.log('-------beginScrapingAllPages-------')
        console.log('antal sidor att skrapa: ', this.firstPageLinks.length)
      }
}