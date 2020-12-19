/**
 * Module scraping data from the web.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'

export class Scraper {
  constructor () {
      this.currentUrl // adress
      this.lastResponse // respons
  }

  startScraping (url) {
      this.currentUrl = url
      console.log('Scraper, scraping begins from', url)
      this.getScraper()
  }

  async getScraper () { // kör node fetch med current url här!
    console.log('begins node fetch')

    const scraper = await fetch(this.currentUrl).then(response => {
      return response.text()
    }).then(text => {
      this.lastResponse = text
      console.log(this.lastResponse) // visar respons

    }).catch(err => {
      console.log('fel!', err)
    })

  }

}