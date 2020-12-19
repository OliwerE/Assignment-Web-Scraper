/**
 * The application module for the web scraper.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import * as scraper from './scraper.js'
import * as suggestion from './suggestion.js'

export class Application {
    constructor (startUrl) {
        this.startUrl = startUrl
        this.scraper = new scraper.Scraper() // instans av scraper
    }

    startScraper () {
        console.log('calls scraper')
        this.scraper.startScraping(this.startUrl)
    }
}