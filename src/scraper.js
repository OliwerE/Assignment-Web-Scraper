/**
 * Module scraping data from the web.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
//import { JSDOM } from 'jsdom'

export class Scraper {
  constructor () {
      this.lastResponse // respons
  }

  async getScraper (url) { // kör node fetch med current url här!
    console.log('begins node fetch')

    const scraper = await fetch(url).then(response => {
      return response.text()
    }).then(text => {
      this.lastResponse = text
      console.log(this.lastResponse) // visar respons
    }).catch(err => {
      console.log('Node fetch (getScraper) error: ', err)
    })

  }

}