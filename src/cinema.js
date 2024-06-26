/**
 * Module for Cinema scraping.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

import { JSDOM } from 'jsdom'
import { Scraper } from './scraper.js'

/**
 * Class scrapes a cinema for all free times.
 */
export class Cinema {
  /**
   * Constructs the cinema object.
   *
   * @param {Array} possibleDays - An array with all potential days.
   * @param {string} firstPageLink - Link to the first page of the cinema.
   */
  constructor (possibleDays, firstPageLink) {
    this.scraper = new Scraper()

    this.possibleDays = possibleDays // All days to request movies from.
    this.cinemaFirstPageAbsoluteLink = firstPageLink
    this.cinemaRequestLinks = []
    this.cinemaPossibleDaysAllTimes = [] // All movies and times including fully booked.
    this.cinemaPossibleTimes = [] // All potential times checked with cinema and calendar.
  }

  /**
   * A method used to get the first http response and run the other calendar methods in the correct order.
   */
  async start () {
    await this.scraper.getScraper(this.cinemaFirstPageAbsoluteLink) // Awaits first page http response.
    this.getNumberOfMovies()
    await this.scrapePotentialCinemaDays()
    this.addPotentialTimesToArray()
  }

  /**
   * Creates an array with all movie alternatives.
   */
  getNumberOfMovies () {
    const cinemaDom = new JSDOM(this.scraper.lastResponse)
    const cinemaOption = Array.from(cinemaDom.window.document.querySelectorAll('option[value^="0"]'))

    // All movies
    const movies = cinemaOption.splice(3, cinemaOption.length)
    const numberOfMovies = movies.length
    this.movieNames = movies // used to access all movies outside this module.
    this.createCinemaAvailabilityLinks(numberOfMovies)
  }

  /**
   * Creates cinema links used to find free times for each movie.
   *
   * @param {number} numberOfMovies - Number of movies at the cinema.
   */
  createCinemaAvailabilityLinks (numberOfMovies) {
    const numberOfDays = this.possibleDays.length

    for (let i = 0; i < numberOfDays; i++) {
      const checkDay = this.possibleDays[i]

      // Some of the parts used to create the absolute link.
      const firstRequestPart = 'check?day=0'
      const thirdRequestPart = '&movie=0'

      for (let a = 1; a <= numberOfMovies; a++) { // Creates absolute links for each day and movie.
        const requestLink = this.cinemaFirstPageAbsoluteLink.concat('/', firstRequestPart, checkDay, thirdRequestPart, a)
        this.cinemaRequestLinks.push(requestLink)
      }
    }
  }

  /**
   * Scrapes all movies on each day.
   */
  async scrapePotentialCinemaDays () {
    for (let i = 0; i < this.cinemaRequestLinks.length; i++) {
      await this.scraper.getScraper(this.cinemaRequestLinks[i])
      const parseResponse = JSON.parse(this.scraper.lastResponse)
      this.cinemaPossibleDaysAllTimes = [...this.cinemaPossibleDaysAllTimes, ...parseResponse] // Adds saved response in an array.
    }
  }

  /**
   * Adds all potential times into an array.
   */
  addPotentialTimesToArray () {
    const numberOfTimes = this.cinemaPossibleDaysAllTimes.length
    for (let i = 0; i < numberOfTimes; i++) {
      if (this.cinemaPossibleDaysAllTimes[i].status === 1) { // If the alternative is not fully booked.
        this.cinemaPossibleTimes = this.cinemaPossibleTimes.concat(this.cinemaPossibleDaysAllTimes[i]) // Adds the alternative into an array of possible times.
      }
    }
  }
}
