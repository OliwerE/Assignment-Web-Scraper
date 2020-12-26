/**
 * Module scraping data from the web.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
// import { JSDOM } from 'jsdom'

/**
 * A class scraping websites.
 */
export class Scraper {
  /**
   * Constructs the scraper object.
   */
  // constructor () { lint useless!
  // //this.lastResponse // respons // LINT ERROR PGA UTTRYCK!
  // }*

  /**
   * A method sending http get requests.
   *
   * @param {string} url - An url used to send a get request.
   * @param {string} cookie - Used to send a cookie in the body of the get request.
   */
  async getScraper (url, cookie) { // kör node fetch med current url här!
    // console.log('begins node fetch')

    await fetch(url, { // Sends user answer to server using fetch api.
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
   * A method used to send http post requests.
   *
   * @param {string} url - An url used to send a get request.
   * @param {object} login - An object used to send login credentials.
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
