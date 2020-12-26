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
export class Application extends Scraper { // ta bort extends Scraper när allt är flyttat till moduler
  /**
   * Constructs the application object.
   *
   * @param {string} startUrl - The First url.
   */
  constructor (startUrl) {
    super()

    // // // = lint error ta bort dessa (men tydligare att förklara här??)
    // //this.calendar // instans av calendar modul
    // //this.cinema // instans av cinema modul
    // //this.restaurant // instans av restaurant modul
    // //this.suggestion // displays suggestions

    this.startUrl = startUrl
    // //this.firstPageLinks // länkarna på första sidan
    this.firstLinksCount = 0 // om = antal länkar på startsidan slutar applikationen
    // //this.calendarFirstPageLinks

    this.alternatives = [] // array med alternativobjekt (för suggestion.js)

    // this.scraper = new scraper.Scraper() // instans av scraper
  }

  /**
   * Gets the first response using the first url.
   */
  async firstScrape () {
    // console.log('calls scraper first links')

    // promise väntar på första url html skrapas
    await new Promise((resolve, reject) => {
      resolve(this.getScraper(this.startUrl))
    }).then(() => {
      // console.log('first links resolved!')
      this.getFirstLinks()
    })
  }

  /**
   * Creates dom from first response and extract links.
   */
  getFirstLinks () { // tar ut första länkarna på startsidan och kalender (om typeOfData är firstLinksCalendar)
    // console.log('getFIRSTLinks startar')
    const startDom = new JSDOM(this.lastResponse)
    // console.log('first links')

    this.firstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="https://"], a[href^="http://"]')).map(HTMLAnchorElement => HTMLAnchorElement.href)
    // console.log(this.firstPageLinks)

    console.log('Scraping links...OK')

    this.beginScrapeCalendar()
  }

  /**
   * Creates an instance of the Calendar class and runs first method, then calls next method in this class.
   */
  async beginScrapeCalendar () {
    this.calendar = new Calendar(this.firstPageLinks[0]) // skapar instans av calendar

    // console.log('------------------------------start kalender-------------------')
    await new Promise((resolve, reject) => { // fungerar nu!
      resolve(this.calendar.start())
    }).then(() => {
      console.log('Scraping available days...OK')

      // starta cinema skrapning här:

      this.scrapeCinema()
    })
  }

  /**
   * Creates an instance of the Cinema class and runs first method, then calls next method in this class.
   */
  async scrapeCinema () {
    this.cinema = new Cinema(this.calendar.calendarPotentialDays, this.firstPageLinks[1])

    // gör om till promise???
    // this.cinema.start() // get response, calendarPotentialDays, startsidan länk

    // console.log('------------------------------start CINEMA-------------------')
    await new Promise((resolve, reject) => { // fungerar nu!
      resolve(this.cinema.start())
    }).then(() => {
      // console.log('-----CINEMA module finished!!-----')
      console.log('Scraping showtimes...OK')
      // starta cinema skrapning här:

      this.scrapeRestaurant()
    })
  }

  /**
   * Creates an instance of the Restaurant class and runs first method, then calls next method in this class.
   */
  async scrapeRestaurant () {
    // console.log('----------------------begin restaurant------------------------')
    // this.scrapeDinnerFirstPage()

    this.restaurant = new Restaurant(this.firstPageLinks[2])

    // gör om till promise???
    // this.cinema.start() // get response, calendarPotentialDays, startsidan länk

    await new Promise((resolve, reject) => { // fungerar nu!
      resolve(this.restaurant.start())
    }).then(() => {
      // console.log('-----RESTAURANT module finished!!-----')
      console.log('Scraping possible reservations...OK')
      this.findPossibleTimes()
    })
  }

  /**
   * Finds possible times using calendar, cinema and restaurant.
   * Then creates an instance of the suggestion class and runs first method in the class.
   */
  findPossibleTimes () {
    // console.log('------------- Alla möjliga tider ------------------')

    const possibleMovies = this.cinema.cinemaPossibleTimes
    const restaurantPossibleTimes = this.restaurant.AllFreeTimes

    // console.log(possibleMovies)
    // console.log(restaurantPossibleTimes)

    // hitta tider som skulle fungera

    // console.log('---- letar möjliga tider ----')
    for (let i = 0; i < possibleMovies.length; i++) {
      // console.log('film: ', i)

      const movieDay = possibleMovies[i].day
      const movieTime = possibleMovies[i].time

      // console.log(movieDay, movieTime)

      // timme att söka efter:

      const spliceMovieTime = movieTime.split(':')
      const spliceMovieTimeHour = Number(spliceMovieTime[0])
      // console.log(spliceMovieTimeHour)

      const hourSearchForInRestaurant = spliceMovieTimeHour + 2

      // console.log('hour search for: ', hourSearchFor)

      // hitta fungerande tid i restaurant:

      for (let a = 0; a < restaurantPossibleTimes.length; a++) {
        // console.log(i)

        const restaurantDay = restaurantPossibleTimes[a].day

        if (movieDay === restaurantDay) { // om dagarna matchar! testad FUNGERAR!
          // console.log('-----------test---------')

          // start tid restaurang
          const restaurantHour = restaurantPossibleTimes[a].time.split('-')
          const firstRestaurantHour = Number(restaurantHour[0])
          // console.log(/*'firstRestaurantHour: ', */firstRestaurantHour)

          // console.log(/*'cinema 2 hours after: ', */hourSearchForInRestaurant)
          // console.log('-------------------------')

          if (firstRestaurantHour >= hourSearchForInRestaurant) { // måste vara lika? eller mer än 2h möjligt??
            // dag i textsträng
            let day
            if (possibleMovies[i].day === '05') {
              day = 'Friday'
            } else if (possibleMovies[i].day === '06') {
              day = 'Saturday'
            } else if (possibleMovies[i].day === '07') {
              day = 'Sunday'
            }

            // film namn
            const movieId = possibleMovies[i].movie
            const movieNumber = movieId.split('0')
            const movieIndex = Number(movieNumber[1]) - 1
            const movieName = this.cinema.movieNames[movieIndex].childNodes[0].nodeValue

            // table times

            const tableTimes = restaurantPossibleTimes[a].time
            const splitTableTimes = tableTimes.split('-')
            const altObjTime = splitTableTimes[0].concat(':00-', splitTableTimes[1], ':00')

            const newAlternative = { day: day, movie: movieName, movieBegin: movieTime, tableHours: altObjTime } // gör om movie till string av riktiga namnet, ändra format tablehour timmar till : och 00
            this.alternatives.push(newAlternative)
          }
        }
      }
    }

    // console.log(this.alternatives)
    // gå till suggestion.js

    this.suggestion = new Suggestion(this.alternatives)
    this.suggestion.start()

    // console.log(this.cinema.movieNames[2].childNodes[0].nodeValue) // filmnamnen!
  }
}
