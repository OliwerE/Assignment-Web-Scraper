/**
 * Module scraping data from the web.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

export class Scraper {
  constructor () {
      this.currentUrl // adress
      this.lastResponse // respons
  }

  startScraping (url, typeOfData) {
      this.currentUrl = url
      console.log('Scraper, scraping begins from', url)
      this.getScraper(typeOfData)
  }

  async getScraper (typeOfData) { // kör node fetch med current url här!
    console.log('begins node fetch')

    const scraper = await fetch(this.currentUrl).then(response => {
      return response.text()
    }).then(text => {
      this.lastResponse = text
      console.log(this.lastResponse) // visar respons
      if (typeOfData === 'firstLinks') {
      this.getFirstLinks() // gör bättre lösning?
      } else if (typeOfData === 'firstLinksCalendar') {
        this.getFirstLinks(typeOfData) // gör bättre lösning?
        } else if (typeOfData === 'links') {
        console.log('HÄMTAT!! links')
        this.processLinks()
      }
    }).catch(err => {
      console.log('fel!', err)
    })

  }



}