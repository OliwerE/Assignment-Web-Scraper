/**
 * The application module for the web scraper.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */
import { JSDOM } from 'jsdom'
import { Scraper } from './scraper.js'

import { Calendar } from './calendar.js'
import { Cinema } from './cinema.js'
import { Restaurant } from './restaurant.js'
import { Suggestion } from './suggestion.js'

/**
 * The main class for the web scraper application
 */
export class Application {
  /**
   * Constructs the application object.
   *
   * @param {string} startUrl - The First url.
   */
  constructor (startUrl) {
    this.startUrl = startUrl // Url where the webscraper begins.
    this.alternatives = [] // An Array with all alternatives for sugestion module.

    this.scraper = new Scraper()
  }

  /**
   * Gets the first response using the first url.
   */
  async firstScrape () {
    await this.scraper.getScraper(this.startUrl) // Awaits http response.
    this.getFirstLinks()
  }

  /**
   * Creates dom from first response and extract links.
   */
  getFirstLinks () {
    const startDom = new JSDOM(this.scraper.lastResponse)
    this.firstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="https://"], a[href^="http://"]')).map(HTMLAnchorElement => HTMLAnchorElement.href) // Creates an array with all links on the first page.
    console.log('Scraping links...OK')
    this.scrapeFirstPageLinks()
  }

  /**
   * Creates an instance of the Calendar, Cinema and Restaurant.
   * Then scrapes all links.
   */
  async scrapeFirstPageLinks () {
    this.calendar = new Calendar(this.firstPageLinks[0]) // Creates new instance of the calendar class
    this.cinema = new Cinema(this.calendar.calendarPotentialDays, this.firstPageLinks[1])
    this.restaurant = new Restaurant(this.firstPageLinks[2])

    await this.calendar.start() // Scrapes calendar
    console.log('Scraping available days...OK')

    await this.cinema.start() // Scrapes cinema
    console.log('Scraping showtimes...OK')

    await this.restaurant.start() // Scrapes restaurant
    console.log('Scraping possible reservations...OK')
    this.findPossibleTimes()
  }

  /**
   * Finds possible times using calendar, cinema and restaurant.
   * Then creates an instance of the suggestion class and runs first method in the class.
   */
  findPossibleTimes () {
    const possibleMovies = this.cinema.cinemaPossibleTimes
    const restaurantPossibleTimes = this.restaurant.AllFreeTimes

    for (let i = 0; i < possibleMovies.length; i++) { // goes through movie alternatives.
      const movieDay = possibleMovies[i].day
      const movieTime = possibleMovies[i].time

      // Hour to search for in the restaurant alternatives
      const spliceMovieTime = movieTime.split(':')
      const spliceMovieTimeHour = Number(spliceMovieTime[0])

      const hourSearchForInRestaurant = spliceMovieTimeHour + 2 // Two hours after the movie begin

      // Tries to find a matching time at the restaurant
      for (let a = 0; a < restaurantPossibleTimes.length; a++) { // Goes through restaruant alternatives.
        const restaurantDay = restaurantPossibleTimes[a].day

        if (movieDay === restaurantDay) { // If the movie alternative and the restaurant alternative equals the same day.
          // Hour the restaurant booking begins.
          const restaurantHour = restaurantPossibleTimes[a].time.split('-')
          const firstRestaurantHour = Number(restaurantHour[0])

          if (firstRestaurantHour >= hourSearchForInRestaurant) { // If the restaurant booking is at least two hours after the movie begins.
            // changes day number to the name of the day.
            let day
            if (possibleMovies[i].day === '05') {
              day = 'Friday'
            } else if (possibleMovies[i].day === '06') {
              day = 'Saturday'
            } else if (possibleMovies[i].day === '07') {
              day = 'Sunday'
            }

            // Changes movie name from a number to the real name.
            const movieId = possibleMovies[i].movie
            const movieNumber = movieId.split('0')
            const movieIndex = Number(movieNumber[1]) - 1
            const movieName = this.cinema.movieNames[movieIndex].childNodes[0].nodeValue

            // Changes restaurant booking time to the exact format.
            const tableTimes = restaurantPossibleTimes[a].time
            const splitTableTimes = tableTimes.split('-')
            const altObjTime = splitTableTimes[0].concat(':00-', splitTableTimes[1], ':00')

            const newAlternative = { day: day, movie: movieName, movieBegin: movieTime, tableHours: altObjTime } // Creates a suggestion object.
            this.alternatives.push(newAlternative) // Adds suggestion object in an array.
          }
        }
      }
    }

    this.suggestion = new Suggestion(this.alternatives)
    this.suggestion.start() // Displays suggestions.
  }
}
