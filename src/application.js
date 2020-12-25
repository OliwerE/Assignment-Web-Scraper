/**
 * The application module for the web scraper.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */
import {JSDOM} from 'jsdom'
import {Scraper} from './scraper.js'

import {Calendar} from './calendar.js'
import {Cinema} from './cinema.js'
import {Restaurant} from './restaurant.js'
import {Suggestion} from './suggestion.js'

export class Application extends Scraper { // ta bort extends Scraper när allt är flyttat till moduler
    constructor (startUrl) {
      super()

      this.calendar // instans av calendar modul
      this.cinema // instans av cinema modul
      this.restaurant // instans av restaurant modul
      this.suggestion // displays suggestions


      this.startUrl = startUrl
      this.firstPageLinks // länkarna på första sidan
      this.firstLinksCount = 0 // om = antal länkar på startsidan slutar applikationen
      this.calendarFirstPageLinks

      this.alternatives = [] // array med alternativobjekt (för suggestion.js)

      //this.scraper = new scraper.Scraper() // instans av scraper
    }

    async firstScrape () {
    console.log('calls scraper first links')

    

    // promise väntar på första url html skrapas
    await new Promise((resolve, reject) => {
      resolve(this.getScraper(this.startUrl))
    }).then(() => {
      console.log('first links resolved!')
      this.getFirstLinks()
    })
    
  }

    getFirstLinks(typeOfData) { // tar ut första länkarna på startsidan och kalender (om typeOfData är firstLinksCalendar)
      console.log('getFIRSTLinks startar')
      const startDom = new JSDOM(this.lastResponse)
      console.log('first links')
      

      if(typeOfData === 'firstLinksCalendar') { // kan ta bort if satsen?? är flyttad till calendar module
        const relativeLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.href)
        console.log('KALENDER GET FIRST LINKS!')
        //this.scrapeAllCalendars()

        //bygg absoluta länkar här:
        console.log('number of links:', relativeLinks.length)

        this.calendarFirstPageLinks = []
        
        for (let i = 0; i < relativeLinks.length; i++) {
          console.log('calendar link: ', i)
          this.calendarFirstPageLinks[i] = this.firstPageLinks[0].concat(relativeLinks[i].slice(2)) // creates absolute link
        }
      } else {
      this.firstPageLinks = Array.from(startDom.window.document.querySelectorAll('a[href^="https://"], a[href^="http://"]')).map(HTMLAnchorElement => HTMLAnchorElement.href)
      console.log(this.firstPageLinks)
      this.beginScrapingAllPages()
      }

      }

      beginScrapingAllPages () {  // GLÖMT FORTSÄTTA MED DENNA!!
        console.log('-------beginScrapingAllPages-------')

        // alla sidor delar skrapas separat pga olika struktur.
        this.beginScrapeCalendar() // skrape cinema börjar via denna! i slutet!


        //.scrapeCinema() 
        //this.scrapeDinner()
      }

      async beginScrapeCalendar () {
        this.calendar = new Calendar(this.firstPageLinks[0]) // skapar instans av calendar
      
     console.log('------------------------------start kalender-------------------')
      await new Promise((resolve, reject) => { // fungerar nu!
      resolve(this.calendar.start())
    }).then(() => {
      console.log('-----Calendar module finished!!-----')

      // starta cinema skrapning här:

      this.scrapeCinema()

    })  
    }
      
    
      async scrapeCinema () {

        this.cinema = new Cinema(this.lastResponse, this.calendar.calendarPotentialDays, this.firstPageLinks[1])

        // gör om till promise???
        //this.cinema.start() // get response, calendarPotentialDays, startsidan länk

        console.log('------------------------------start CINEMA-------------------')
        await new Promise((resolve, reject) => { // fungerar nu!
        resolve(this.cinema.start())
      }).then(() => {
        console.log('-----CINEMA module finished!!-----')
  
        // starta cinema skrapning här:
  
        this.scrapeRestaurant()
      })          
      }

      async scrapeRestaurant () {
        console.log('----------------------begin restaurant------------------------')
        //this.scrapeDinnerFirstPage()

        this.restaurant = new Restaurant(this.firstPageLinks[2])

        // gör om till promise???
        //this.cinema.start() // get response, calendarPotentialDays, startsidan länk


        await new Promise((resolve, reject) => { // fungerar nu!
        resolve(this.restaurant.start())
      }).then(() => {
        console.log('-----RESTAURANT module finished!!-----')
  
        this.findPossibleTimes()
  
      }) 
      }

      findPossibleTimes () {
        console.log('------------- Alla möjliga tider ------------------')

        const possibleMovies = this.cinema.cinemaPossibleTimes
        const restaurantPossibleTimes = this.restaurant.AllFreeTimes

        console.log(possibleMovies)
        console.log(restaurantPossibleTimes)

        // hitta tider som skulle fungera

        console.log('---- letar möjliga tider ----')
        for (let i = 0; i < possibleMovies.length; i++) {
          //console.log('film: ', i)

          var movieDay = possibleMovies[i].day
          var movieTime = possibleMovies[i].time
          
          //console.log(movieDay, movieTime)

          // timme att söka efter:

          var spliceMovieTime = movieTime.split(':')
          var spliceMovieTimeHour = Number(spliceMovieTime[0])
          //console.log(spliceMovieTimeHour)

          var hourSearchForInRestaurant = spliceMovieTimeHour + 2

          //console.log('hour search for: ', hourSearchFor)

          // hitta fungerande tid i restaurant:

          for (let a = 0; a < restaurantPossibleTimes.length; a++) {
            //console.log(i)

            var restaurantDay = restaurantPossibleTimes[a].day


            if (movieDay === restaurantDay) { // om dagarna matchar! testad FUNGERAR!
              //console.log('-----------test---------')


            // start tid restaurang
            var restaurantHour = restaurantPossibleTimes[a].time.split('-')
            var firstRestaurantHour = Number(restaurantHour[0])
            //console.log(/*'firstRestaurantHour: ', */firstRestaurantHour)

            //console.log(/*'cinema 2 hours after: ', */hourSearchForInRestaurant)
            //console.log('-------------------------')


            if (firstRestaurantHour >= hourSearchForInRestaurant){ // måste vara lika? eller mer än 2h möjligt??

              // dag i textsträng
              var day
              if (possibleMovies[i].day === '05') {
                day = 'Friday'
              } else if (possibleMovies[i].day === '06') {
                day = 'Saturday'
              } else if (possibleMovies[i].day === '07') {
                day = 'Sunday'
              }

              // film namn
              var movieId = possibleMovies[i].movie
              var movieNumber = movieId.split('0')
              var movieIndex = Number(movieNumber[1]) - 1
              var movieName = this.cinema.movieNames[movieIndex].childNodes[0].nodeValue

              // table times

              var tableTimes = restaurantPossibleTimes[a].time
              var splitTableTimes = tableTimes.split('-')
              var altObjTime = splitTableTimes[0].concat(':00-', splitTableTimes[1], ':00')


              var newAlternative = {day: day, movie: movieName, movieBegin: movieTime, tableHours: altObjTime} // gör om movie till string av riktiga namnet, ändra format tablehour timmar till : och 00
              this.alternatives.push(newAlternative)

            }
           }
          }




        }

        console.log(this.alternatives)
        // gå till suggestion.js

        this.suggestion = new Suggestion(this.alternatives)
        this.suggestion.start()

        // console.log(this.cinema.movieNames[2].childNodes[0].nodeValue) // filmnamnen!

      }
}
