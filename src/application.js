/**
 * The application module for the web scraper.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import * as scraper from './scraper.js'
import * as suggestion from './suggestion.js'

export function importTests () {
    console.log('application imported')
    scraper.scraper()
    suggestion.suggestion()
}