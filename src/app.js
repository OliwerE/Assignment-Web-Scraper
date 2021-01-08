/**
 * The starting point of the application.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import isUrl from 'is-url'

import * as application from './application.js'

/**
 * Function starts the web scraper application.
 */
function startScraper () {
  let url // Url of the first page
  if (isUrl(process.argv[2])) {
    url = process.argv[2]
  } else if (process.argv[2] === undefined) {
    url = 'https://cscloud6-127.lnu.se/scraper-site-1'
  } else {
    throw new Error('The passed argument is not an url!')
  }

  const webScraper = new application.Application(url)
  webScraper.firstScrape() // Starts application
}

startScraper()
