/**
 * The starting point of the application.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import * as application from './application.js'

function startScraper () {
    // hantera argument


    // skapa scraper
    const webScraper = new application.Application('https://cscloud6-127.lnu.se/scraper-site-1') // https://cscloud6-127.lnu.se/scraper-site-2

    //startar scraper
    webScraper.firstScrape() // ta bort hårdkodning!
}

startScraper()