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

import {Calendar} from './calendar.js'

export class Application extends Scraper {
    constructor (startUrl) {
      super()

      this.calendar 


      this.startUrl = startUrl
      this.firstPageLinks // länkarna på första sidan
      this.firstLinksCount = 0 // om = antal länkar på startsidan slutar applikationen
      this.calendarFirstPageLinks
      this.calendarDays // alla personers möjliga dagar i separata arrayer
      this.calendarPotentialDays = [] // möjliga dagar enligt kalender
      this.cinemaRequestLinks = [] // links used to request movies from cinema.
      this.cinemaPossibleDaysAllTimes = [] // alla tider på de möjliga dagarna inkl fullbokade
      this.cinemaPossibleTimes = [] // alla möjliga tider som fungerar med kalender OCH cinema. obs ej kontrollerade med bord.
      this.absoluteZekeLogin // absoluta länken för att skicka post request till login
      this.getRequestDataZeke // array med zeke booking länk och session cookie
      this.zekeAllTimes // Alla tider zekes bar tider, även fullbokade
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

      test() {

      }

      async scrapeAllCalendars () {

      }

      possibleDays () {

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
        const numberOfDays = this.calendar.calendarPotentialDays.length
        console.log(numberOfDays)

        for (let i = 1; i <= numberOfDays; i++) {
          console.log('potential day: ', i)

          /*
          console.log('DEBUG--------------------------------------------------------------------')

          console.log(this.calendar.calendarPotentialDays)


          console.log('DEBUG-----------------------------------------------------------------------')
          */


          var checkDay = this.calendar.calendarPotentialDays[i - 1] // -1 pga index 0
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

        for (let i = 0; i < this.cinemaRequestLinks.length; i++) { // BUGGEN???

          await new Promise((resolve, reject) => {
            resolve(this.getScraper(this.cinemaRequestLinks[i]))
          }).then(() => {
            console.log('A cinema get request resolved!')

            // spara alla objekt svar:

            const parseResponse = JSON.parse(this.lastResponse)

            console.log('-----------')
            //console.log(parseResponse)
            console.log('-----------')

            this.cinemaPossibleDaysAllTimes = [...this.cinemaPossibleDaysAllTimes, ...parseResponse] // combines new response with old results

            console.log(this.cinemaPossibleDaysAllTimes)

            this.addPotentialTimesToArray() // var utanför innan


          })}
        
        // this.addPotentialTimesToArray()
      }

      addPotentialTimesToArray () {
        console.log('------------lägg till möjliga tider---------')
        
        const numberOfTimes = this.cinemaPossibleDaysAllTimes.length
        console.log(numberOfTimes) // visar ibland 36 ist för 9 BUGG???

        for (let i = 0; i < numberOfTimes; i++) {
          if (this.cinemaPossibleDaysAllTimes[i].status === 0) { // om tiden är tillgänglig
            this.cinemaPossibleTimes = this.cinemaPossibleTimes.concat(this.cinemaPossibleDaysAllTimes[i]) // lägger till dagen om den är möjlig i cinemaPossibleTimes
          }
        }

        console.log('---möjliga tider----')
        console.log(this.cinemaPossibleTimes)
        console.log('number of possible times: ', this.cinemaPossibleTimes.length)
        console.log('---möjliga tider----')
        

        this.beginScrapingDinner()

      }

      beginScrapingDinner () {
        console.log('beginScrapingDinner')
        this.scrapeDinnerFirstPage()
      }

      async scrapeDinnerFirstPage () {
        console.log('scrapeDinnerFirstPage')

        await new Promise((resolve, reject) => {
          resolve(this.getScraper(this.firstPageLinks[2])) // skrapar första sidan i zeke's bar
        }).then(() => {
          console.log('A zeke get request resolved!')

          //build dom
          const zekeStart = new JSDOM(this.lastResponse)

          // extract login relative link
          const loginPostLinkAction = Array.from(zekeStart.window.document.querySelectorAll('form[action^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.action)
          
          // build login link
          const relativeSpliced = loginPostLinkAction[0].slice(2)
          this.absoluteZekeLogin = this.firstPageLinks[2].concat(relativeSpliced)
          
          console.log(this.absoluteZekeLogin)

          this.getZekeSessionToken()

        })

      }

      async getZekeSessionToken () {
        console.log('----- get zeke session token -----')

        const loginInfo = { // flytta???
          "username": "zeke",
          "password": "coys"
        }

        await new Promise((resolve, reject) => {
          resolve(this.postLoginScraper(this.absoluteZekeLogin, loginInfo)) // skrapar första sidan i zeke's bar
        }).then(() => {
          console.log('------post response----')
          console.log(this.lastResponse)
          //console.log(this.lastResponse.headers.get('set-cookie') )
          console.log('------post response----')
          this.modifyPostResponse()
        })
      }

      modifyPostResponse () {
        const relativeUrl = this.lastResponse[0]
        const responseCookie = this.lastResponse[1]

        // create absolute url

        const absoluteUrl = this.firstPageLinks[2].concat(relativeUrl)
        console.log(absoluteUrl)

        // extract cookie

        const splitCookie = responseCookie.split('; ')
        const fixedCookie = splitCookie[0]

        console.log(fixedCookie)

        this.getRequestDataZeke = [absoluteUrl, fixedCookie]

        this.scrapeDinnerBooking()
      }

      async scrapeDinnerBooking () {
        console.log('----- Scrape dinner booking begins -----')

        await new Promise((resolve, reject) => {
          resolve(this.getScraper(this.getRequestDataZeke[0], this.getRequestDataZeke[1])) // skrapar första sidan i zeke's bar
        }).then(() => {
          console.log('------booking response----')
          //console.log(this.lastResponse)
          console.log('------/booking response----')
          this.getAllZekeBookingTimes()
        })
      }

      getAllZekeBookingTimes () { // inkl fullbokade
        console.log('------getAllZekeBookingTimes-----')
        const zekeBookingDom = new JSDOM(this.lastResponse)

        //const potentialTimes = Array.from(zekeBookingDom.window.document.querySelectorAll('div[class^="WordSection2"] span')) // WordSection2, 4, 6 är tiderna!


        this.zekeAllTimes = []
        for (let i = 5; i < 8; i++) { // 5-7 = fre-sön
          //console.log(i)



          let wordSectionNumber
          if (i === 5) {
            wordSectionNumber = 2
          } else if (i === 6) {
            wordSectionNumber = 4
          } else if (i === 7) {
            wordSectionNumber = 6
          }
          var AllTimes = Array.from(zekeBookingDom.window.document.querySelectorAll('div[class^="WordSection' + wordSectionNumber + '"] span')) // WordSection2, 4, 6 är tiderna!

          this.zekeAllTimes = this.zekeAllTimes.concat(AllTimes)


          //console.log(AllTimes)


        }
        console.log('------all nodes------')
        console.log(this.zekeAllTimes)
        console.log('allnodes length: ', this.zekeAllTimes.length)
        console.log('------all nodes------')

        // gör om till strings:
        let freeCount = 0
        for (let i = 0; i < this.zekeAllTimes.length; i++) {
          //console.log(i)

          let splitted = this.zekeAllTimes[i].childNodes[0].nodeValue.split(' F')
          console.log(splitted)

          
          if (splitted[1] === 'ree\n          ') { // om bord är ledigt
            freeCount += 1
            
          }
          


        }

        console.log('antal möjliga alternativ: ', freeCount)



        console.log('------getAllZekeBookingTimes-----')
      }
}