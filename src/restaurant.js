/**
 * Module for Restaurant scraping.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import { JSDOM } from 'jsdom'
import { Scraper } from './scraper.js'

/**
 *
 */
export class Restaurant {
  /**
   * @param firstPageLink
   */
  constructor (firstPageLink) {
    this.firstPageLink = firstPageLink
    this.scraper = new Scraper()

    this.absoluteZekeLogin // absoluta länken för att skicka post request till login
    this.getRequestDataZeke // array med zeke booking länk och session cookie
    this.zekeAllTimes // Alla tider zekes bar tider, även fullbokade
    this.AllFreeTimes = [] // array med alla möjliga tider i separata objekt
  }

  /**
   *
   */
  async start () {
    await this.scrapeDinnerFirstPage()
    await this.getZekeSessionToken()
    this.modifyPostResponse()
    await this.scrapeDinnerBooking()
    this.getAllZekeBookingTimes()
  }

  /**
   *
   */
  async scrapeDinnerFirstPage () {
    // console.log('scrapeDinnerFirstPage')

    await new Promise((resolve, reject) => {
      resolve(this.scraper.getScraper(this.firstPageLink)) // skrapar första sidan i zeke's bar
    }).then(() => {
      // console.log('A zeke get request resolved!')

      // build dom
      const zekeStart = new JSDOM(this.scraper.lastResponse)

      // extract login relative link
      const loginPostLinkAction = Array.from(zekeStart.window.document.querySelectorAll('form[action^="./"')).map(HTMLAnchorElement => HTMLAnchorElement.action)

      // build login link
      const relativeSpliced = loginPostLinkAction[0].slice(2)
      this.absoluteZekeLogin = this.firstPageLink.concat(relativeSpliced)

      // console.log(this.absoluteZekeLogin)
    })
  }

  /**
   *
   */
  async getZekeSessionToken () {
    // console.log('----- get zeke session token -----')

    const loginInfo = { // flytta???
      username: 'zeke',
      password: 'coys'
    }

    await new Promise((resolve, reject) => {
      resolve(this.scraper.postLoginScraper(this.absoluteZekeLogin, loginInfo)) // skrapar första sidan i zeke's bar
    }).then(() => {
      // console.log('------post response----')
      // console.log(this.scraper.lastResponse)
      // console.log(this.lastResponse.headers.get('set-cookie') )
      // console.log('------post response----')
      // this.modifyPostResponse()
    })
  }

  /**
   *
   */
  modifyPostResponse () {
    const relativeUrl = this.scraper.lastResponse[0]
    const responseCookie = this.scraper.lastResponse[1]

    // create absolute url

    const absoluteUrl = this.firstPageLink.concat(relativeUrl)
    // console.log(absoluteUrl)

    // extract cookie

    const splitCookie = responseCookie.split('; ')
    const fixedCookie = splitCookie[0]

    // console.log(fixedCookie)

    this.getRequestDataZeke = [absoluteUrl, fixedCookie]

    // this.scrapeDinnerBooking()
  }

  /**
   *
   */
  async scrapeDinnerBooking () {
    // console.log('----- Scrape dinner booking begins -----')

    await new Promise((resolve, reject) => {
      resolve(this.scraper.getScraper(this.getRequestDataZeke[0], this.getRequestDataZeke[1])) // skrapar första sidan i zeke's bar
    }).then(() => {
      // console.log('------booking response----')
      // console.log(this.scraper.lastResponse)
      // console.log('------/booking response----')
      // this.getAllZekeBookingTimes()
    })
  }

  /**
   *
   */
  getAllZekeBookingTimes () { // inkl fullbokade
    // console.log('------getAllZekeBookingTimes-----')
    const zekeBookingDom = new JSDOM(this.scraper.lastResponse)

    // const potentialTimes = Array.from(zekeBookingDom.window.document.querySelectorAll('div[class^="WordSection2"] span')) // WordSection2, 4, 6 är tiderna!

    this.zekeAllTimes = []
    for (let i = 5; i < 8; i++) { // 5-7 = fre-sön
      // console.log(i)

      let wordSectionNumber
      if (i === 5) {
        wordSectionNumber = 2
      } else if (i === 6) {
        wordSectionNumber = 4
      } else if (i === 7) {
        wordSectionNumber = 6
      }
      const AllTimes = Array.from(zekeBookingDom.window.document.querySelectorAll('div[class^="WordSection' + wordSectionNumber + '"] span')) // WordSection2, 4, 6 är tiderna!

      this.zekeAllTimes = this.zekeAllTimes.concat(AllTimes)

      // console.log(AllTimes)
    }
    // console.log('------all nodes------')
    // console.log(this.zekeAllTimes)
    // console.log('allnodes length: ', this.zekeAllTimes.length)
    // console.log('------all nodes------')

    // gör om till strings:
    const freeCount = 0
    for (let i = 0; i < this.zekeAllTimes.length; i++) {
      // console.log(i)

      /*
          let splitted = this.zekeAllTimes[i].childNodes[0].nodeValue.split(' F')
          console.log(splitted)
          */

      const splitted = this.zekeAllTimes[i].childNodes[0].nodeValue.split(' ')
      // console.log(splitted[12]) // [12] = tiden, [13] = om free eller fully

      const ifFree = splitted[13].split('\n') // tiden i textsträng

      // console.log(ifFree[0]) // Free eller Fully (fullbokat)

      /*
          if (splitted[1] === 'ree\n          ') { // om bord är ledigt
            freeCount += 1

          } */

      if (ifFree[0] === 'Free') { // Alla möjliga tider
        // console.log('!!!')
        var freeDay
        if (i <= 3 && i >= 0) { // om fredag
          freeDay = '05'
        } else if (i <= 7 && i > 3) { // om lördag
          freeDay = '06'
        } else if (i <= 11 && i > 7) { // om söndag
          freeDay = '07'
        }
        const potentialTime = { time: splitted[12], day: freeDay }
        this.AllFreeTimes.push(potentialTime)
      }
    }

    // console.log('antal möjliga alternativ: ', freeCount)

    // console.log(this.AllFreeTimes)
    // console.log('antal ev möjliga tider: ', this.AllFreeTimes.length)

    // console.log('------getAllZekeBookingTimes-----')
  }
}
