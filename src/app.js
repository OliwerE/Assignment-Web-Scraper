/**
 * The starting point of the application.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import isUrl from 'is-url'

import * as application from './application.js'

function startScraper () {
    // hantera argument
    if (isUrl(process.argv[2])){
      // skapa scraper
      const webScraper = new application.Application(process.argv[2]) // npm start https://cscloud6-127.lnu.se/scraper-site-1  // npm start https://cscloud6-127.lnu.se/scraper-site-2
      //startar scraper
      webScraper.firstScrape()
    } else {
        throw new Error('The passed argument is not an url!')
    }




}

startScraper()