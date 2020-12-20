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
      this.firstPageLinks // länkarna på första sidan
      this.firstLinksCount = 0 // om = antal länkar på startsidan slutar applikationen
      this.calendarFirstPageLinks
      this.calendarDays // alla personers möjliga dagar i separata arrayer
      this.calendarPotentialDays = [] // möjliga dagar enligt kalender
      this.cinemaRequestLinks = [] // links used to request movies from cinema.
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
      

      if(typeOfData === 'firstLinksCalendar') {
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

      beginScrapingAllPages () {
        console.log('-------beginScrapingAllPages-------')

        // alla sidor delar skrapas separat pga olika struktur.
        this.beginScrapeCalendar() // skrape cinema börjar via denna! i slutet!
        //.scrapeCinema() 
        //this.scrapeDinner()
      }

      async beginScrapeCalendar () {

      // promise väntar på första sidan i kalender html
      await new Promise((resolve, reject) => {
        resolve(this.getScraper(this.firstPageLinks[0]))
      }).then(() => {
        console.log('first links CALENDAR resolved!, starts creating links!')
        this.getFirstLinks('firstLinksCalendar')
    }).then (() => {
      console.log('personal calendar links created!')
      this.scrapeAllCalendars()
    })
      }

      async scrapeAllCalendars () {
        console.log('-----starts scrapeAllCalendars------')
        console.log(this.calendarFirstPageLinks) // måste skapa absoluta länkar av dessa!
        console.log(this.calendarFirstPageLinks.length)


        this.calendarDays  = [] // array with all persons possible days
        for(let i = 0; i < this.calendarFirstPageLinks.length; i++) {
          console.log('skrapa kalender länk', i)

          await new Promise((resolve, reject) => {
            resolve(this.getScraper(this.calendarFirstPageLinks[i]))
          }).then(() => {
            console.log('person', i, 'calendar scraped!')

            // lägg till alla dagar i array:
            const calendarDom = new JSDOM(this.lastResponse)
            const days = Array.from(calendarDom.window.document.querySelectorAll('th'))//.map(HTMLAnchorElement => HTMLAnchorElement.href) // 'a[href^="./"'
            const ifDayPossible = Array.from(calendarDom.window.document.querySelectorAll('td'))//.map(HTMLAnchorElement => HTMLAnchorElement.href) // 'a[href^="./"'
            
            // Name FUNGERAR INTE
            var personName = calendarDom.window.document.querySelector('h2').childNodes[0].nodeValue // vänd??
            console.log(personName)



            var personDays = [] // dagar från en person
            for (let i = 0; i < 3; i++) {

              var day = days[i].childNodes[0].nodeValue
              var dayAnswer = ifDayPossible[i].childNodes[0].nodeValue
              console.log(day)
              console.log(dayAnswer)


              if (dayAnswer === '--' || dayAnswer === '-') { // fungerar inte med !== måste använda === och ha else sats FIXA
                console.log('find another day!')

              } else {
                console.log('found day!')
                personDays.push(day)
              }
            }
            this.calendarDays.push(personDays) // fungerar inte utanför

            this.possibleDays()
          })

          
          //console.log([...new Set(this.calendarDays)])
          //break //debug endast första kalendern!
        }
      }

      possibleDays () {
        console.log('---possibleDays startar----')
        console.log('dagar som de olika personerna kan:')
        console.log(this.calendarDays)

        // dagarna antal ggr (gör om till objekt??)
        var fridayCount = 0
        var saturdayCount = 0
        var sundayCount = 0

        // gå igenom arrayer ta reda på vilka dagar som förekommer 3 ggr:

        for (let i = 0; i < this.calendarDays.length; i++) { // loop igenom alla arrayer i array och räkna antal ggr varje dag förekommer. 3ggr = alla kan!
          //console.log(i)
          var arrayLength = this.calendarDays[i].length
          //console.log(arrayLength)

          for (let a = 0; a < arrayLength; a++) {
            var indexDay = this.calendarDays[i][a] // a day in a persons array
            //console.log(indexDay)
            if (indexDay === 'Friday') {
              fridayCount += 1
            } else if (indexDay === 'Saturday') {
              saturdayCount += 1
          } else if (indexDay === 'Sunday') {
            sundayCount += 1
          }

          }
        }
        console.log('friday: ', fridayCount, 'saturday: ', saturdayCount, 'sunday: ', sundayCount)

        //välj ut möjliga dagar: SKAPA BÄTTRE LÖSNING!!

        if (fridayCount === 3) {
          this.calendarPotentialDays.push(5) // dagar i cinema motsvarar veckodagens siffra!
        }

        if (saturdayCount === 3) {
          this.calendarPotentialDays.push(6) // dagar i cinema motsvarar veckodagens siffra!
        }

        if (sundayCount === 3) {
          this.calendarPotentialDays.push(7) // dagar i cinema motsvarar veckodagens siffra!
        }

        /*
        if (fridayCount !== 3 && saturdayCount !== 3 && sundayCount !== 3) {
          throw new Error('ingen dag möjlig!')
        }
        */

        console.log(this.calendarPotentialDays)

        this.scrapeCinema()
      }

      async scrapeCinema () {
        console.log('-----börjar skrapa cinema-----')
        const cinemaLink = this.firstPageLinks[1]
        
        // hämtar cinema sidans dom.
        await new Promise((resolve, reject) => {
          resolve(this.getScraper(cinemaLink))
        }).then(() => {
          console.log('Got dom from cinema page')
          this.getCurrentMovies()
      })


        // skapa textsträng för get request dag och film

        // 

      }

      getCurrentMovies () {
        console.log('----current movies----')

        const cinemaDom = new JSDOM(this.lastResponse)
        const cinemaOption = Array.from(cinemaDom.window.document.querySelectorAll('option[value^="0"]'))//.map(HTMLAnchorElement => HTMLAnchorElement.href)

        // All movies
        const movies = cinemaOption.splice (3, cinemaOption.length)
        const numberOfMovies = movies.length

        console.log('number of movies: ', numberOfMovies)

        this.createCinemaAvailabilityLinks(movies, numberOfMovies)
      }

      createCinemaAvailabilityLinks (movies, numberOfMovies) {
        console.log('----createCinemaAvailabilityLinks----')
        const numberOfDays = this.calendarPotentialDays.length
        console.log(numberOfDays)

        for (let i = 1; i <= numberOfDays; i++) {
          console.log('potential day: ', i)
          var checkDay = this.calendarPotentialDays[i - 1] // -1 pga index 0
          console.log('day: ', checkDay)
          console.log('number of movies: ', numberOfMovies)

          // skapa länk
          const firstRequestPart = 'check?day=0'
          const thirdRequestPart = '&movie=0'

          for (let a = 1; a <= numberOfMovies; a++) { // skapar alla relativa get länkar.
          var requestLink = this.firstPageLinks[1].concat('/').concat(firstRequestPart).concat(checkDay).concat(thirdRequestPart).concat(a)
          this.cinemaRequestLinks.push(requestLink)
          //console.log(requestLink)
          }

          
        }
        console.log(this.cinemaRequestLinks)
        this.scrapePotentialCinemaDays()
      }
      
      async scrapePotentialCinemaDays () {
        console.log('-----scrape cinema days-----')

        for (let i = 0; i < this.cinemaRequestLinks.length; i++) {

          await new Promise((resolve, reject) => {
            resolve(this.getScraper(this.cinemaRequestLinks[i]))
          }).then(() => {
            console.log('A cinema get request resolved!')
          })

        }

      }
}