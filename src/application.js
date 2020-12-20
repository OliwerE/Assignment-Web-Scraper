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
        this.beginScrapeCalendar()
        //this.scrapeCinema()
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

        var possibleDays = {}

        for(let i = 0; i < this.calendarFirstPageLinks.length; i++) {
          var personPossibleDays = []
          console.log('skrapa kalender länk', i)

          await new Promise((resolve, reject) => {
            resolve(this.getScraper(this.calendarFirstPageLinks[i]))
          }).then(() => {
            console.log('person', i, 'calendar scraped!')
          })
        }

      }
}