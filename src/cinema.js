/**
 * Module for Cinema scraping.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import { JSDOM } from 'jsdom'
import {Scraper} from './scraper.js'




export class Cinema {
    constructor (cinemaFirstPageResponse, calendarPotentialDays, firstPageLink) {
      this.scraper = new Scraper()
      
      //this.cinemaFirstPageResponse = cinemaFirstPageResponse // startsida cinema  // ANVÄNDS EJ
      this.calendarPotentialDays = calendarPotentialDays // kalender möjliga dagar
      this.cinemaFirstPageAbsoluteLink = firstPageLink // absoluta länken till cinemas startsida
      this.cinemaRequestLinks = [] // links used to request movies from cinema.
      this.cinemaPossibleDaysAllTimes = [] // alla tider på de möjliga dagarna inkl fullbokade
      this.cinemaPossibleTimes = [] // alla möjliga tider som fungerar med kalender OCH cinema. obs ej kontrollerade med bord.
    }

    async start () {

      await this.scrapeCinemaFirstPage()
      this.getNumberOfMovies()
      // this.createCinemaAvailabilityLinks(movies, numberOfMovies) anropas via getNumberOfMovies!
      await this.scrapePotentialCinemaDays()
      this.addPotentialTimesToArray()

    }

    async scrapeCinemaFirstPage () {  // FLYTTA TILL BÖRJAN PÅ CINEMA MODUL!
      console.log('-----börjar skrapa cinema-----')
      
      // hämtar cinema sidans dom.
      await new Promise((resolve, reject) => {
        resolve(this.scraper.getScraper(this.cinemaFirstPageAbsoluteLink))
      }).then(() => {
        console.log('Got response from cinema page')
    })

    }

    getNumberOfMovies() {
      console.log('----current movies----')
      const cinemaDom = new JSDOM(this.scraper.lastResponse)
      //console.log(this.lastResponse)
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

        /*
        console.log('DEBUG--------------------------------------------------------------------')

        console.log(this.calendar.calendarPotentialDays)


        console.log('DEBUG-----------------------------------------------------------------------')
        */


        var checkDay = this.calendarPotentialDays[i - 1] // -1 pga index 0
        console.log('day: ', checkDay)
        console.log('number of movies: ', numberOfMovies)

        // skapa länk
        const firstRequestPart = 'check?day=0'
        const thirdRequestPart = '&movie=0'

        for (let a = 1; a <= numberOfMovies; a++) { // skapar alla relativa get länkar.        
        var requestLink = this.cinemaFirstPageAbsoluteLink.concat('/').concat(firstRequestPart).concat(checkDay).concat(thirdRequestPart).concat(a)
        this.cinemaRequestLinks.push(requestLink)
        //console.log(requestLink)
        }

        
      }
      console.log(this.cinemaRequestLinks)
    }

    async scrapePotentialCinemaDays () {
      console.log('-----scrape cinema days-----')

      for (let i = 0; i < this.cinemaRequestLinks.length; i++) { // BUGGEN??? nej?

        await new Promise((resolve, reject) => {
          resolve(this.scraper.getScraper(this.cinemaRequestLinks[i])) // FIX
        }).then(() => {
          console.log('A cinema get request resolved!')

          // spara alla objekt svar:

          const parseResponse = JSON.parse(this.scraper.lastResponse)

          console.log('-----------')
          //console.log(parseResponse)
          console.log('-----------')

          this.cinemaPossibleDaysAllTimes = [...this.cinemaPossibleDaysAllTimes, ...parseResponse] // combines new response with old results

          console.log('all days:')
          console.log(this.cinemaPossibleDaysAllTimes)

          // this.addPotentialTimesToArray() // var utanför innan BUGG HÄR! flyttad till start!


        })
      }
    }

    addPotentialTimesToArray () {
      console.log('------------lägg till möjliga tider---------')
      
      const numberOfTimes = this.cinemaPossibleDaysAllTimes.length
      console.log(numberOfTimes) // visar ibland 36 ist för 9 BUGG???

      for (let i = 0; i < numberOfTimes; i++) {
        if (this.cinemaPossibleDaysAllTimes[i].status === 1) { // om tiden är tillgänglig OBS ändrade till 1, 0 var fullbokat!
          this.cinemaPossibleTimes = this.cinemaPossibleTimes.concat(this.cinemaPossibleDaysAllTimes[i]) // lägger till dagen om den är möjlig i cinemaPossibleTimes
        }
      }

      console.log('---möjliga tider----')
      console.log(this.cinemaPossibleTimes)
      console.log('number of possible times: ', this.cinemaPossibleTimes.length)
      console.log('---möjliga tider----')
      

      //this.beginScrapingDinner() // gör från application.js

    }
}