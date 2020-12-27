/**
 * Module displaying results to the user.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

/**
 * A class displaying suggestions to the end-user.
 */
export class Suggestion {
  /**
   * Builds the suggestion class.
   *
   * @param {Array} suggestions - An array with suggestion objects.
   */
  constructor (suggestions) {
    this.suggestions = suggestions
  }

  /**
   * Start method of the suggestion class.
   */
  start () {
    console.log('\nSuggestions\n===========')
    this.buildSuggestionStrings()
  }

  /**
   * Builds suggestions and displays them in the terminal.
   */
  buildSuggestionStrings () {
    for (let i = 0; i < this.suggestions.length; i++) {
      console.log(`* On ${this.suggestions[i].day}, "${this.suggestions[i].movie}" begins at ${this.suggestions[i].movieBegin}, and there is a free table to book between ${this.suggestions[i].tableHours}.`)
    }
  }
}
