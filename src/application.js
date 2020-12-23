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
import {Cinema} from './cinema.js'

export class Application extends Scraper {
    constructor (startUrl) {
      super()

      this.calendar // instans av calendar modul
      this.cinema // instans av cinema modul


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
  
        this.beginScrapingDinner()
  
      })          
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