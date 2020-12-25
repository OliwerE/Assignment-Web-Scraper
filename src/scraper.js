/**
 * Module scraping data from the web.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
// import { JSDOM } from 'jsdom'

/**
 *
 */
export class Scraper {
  /**
   *
   */
  constructor () {
    this.lastResponse // respons
  }

  /**
   * @param url
   * @param cookie
   */
  async getScraper (url, cookie) { // kör node fetch med current url här!
    // console.log('begins node fetch')

    const scraper = await fetch(url, { // Sends user answer to server using fetch api.
      method: 'get',
      headers: {
        cookie: cookie
      }
    }).then(response => {
      return response.text()
    }).then(text => {
      this.lastResponse = text
      // console.log(this.lastResponse) // visar respons
    }).catch(err => {
      console.log('Node fetch (getScraper) error: ', err)
    })
  }

  /**
   * @param url
   * @param login
   */
  async postLoginScraper (url, login) { // kör node fetch med current url här!
    // console.log('begins post scraper')

    await fetch(url, {
      method: 'post',
      redirect: 'allow',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(login)
    }).then(response => {
      // console.log(response.headers.get('set-cookie'))
      /// /console.log('-----')
      // console.log(response.headers.get('location'))

      return response
    }).then(response => {
      this.lastResponse = [response.headers.get('location'), response.headers.get('set-cookie')] // array med relativ url till bokning och en aktiv session cookie
    }).catch(err => {
      console.error('an error has occurred (post)')
      console.error(err)
    })
  }
}
