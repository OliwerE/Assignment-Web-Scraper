/**
 * Module scraping data from the web.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'

/**
 * A class scraping webpages.
 */
export class Scraper {
  /**
   * A method sending http get requests using node-fetch.
   *
   * @param {string} url - An url used to send a get request.
   * @param {string} cookie - Used to send a cookie in the body of the get request.
   */
  async getScraper (url, cookie) {
    await fetch(url, {
      method: 'get',
      headers: {
        cookie: cookie
      }
    }).then(response => {
      return response.text()
    }).then(text => {
      this.lastResponse = text
    }).catch(err => {
      console.log(err)
      throw new Error('An error has occurred (getScraper)')
    })
  }

  /**
   * A method used to send http post requests using node-fetch.
   *
   * @param {string} url - An url used to send a get request.
   * @param {object} login - An object used to send login credentials.
   */
  async postLoginScraper (url, login) {
    await fetch(url, {
      method: 'post',
      redirect: 'allow',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(login)
    }).then(response => {
      return response
    }).then(response => {
      this.lastResponse = [response.headers.get('location'), response.headers.get('set-cookie')] // An array with a relative url to the next page and an active session cookie.
    }).catch(err => {
      console.log(err)
      throw new Error('An error has occurred (postLoginScraper)')
    })
  }
}
