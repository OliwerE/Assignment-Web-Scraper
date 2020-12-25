/**
 * Module returning result to the user.
 *
 * @author Oliwer Ellréus <oe222ez@student.lnu.se>
 * @version 1.0.0
 */

export class Suggestion {
    constructor(suggestions) {
        this.suggestions = suggestions
        this.suggestionStrings = [] // array with strings
    }

    start () {
      console.log('Suggestions\n===========')
      this.buildSuggestionStrings()
    }

    buildSuggestionStrings () {
      for(let i = 0; i < this.suggestions.length; i++) {
        console.log(`* On ${this.suggestions[i].day}, "${this.suggestions[i].movie}" begins at ${this.suggestions[i].movieBegin}, and there is a free table to book between ${this.suggestions[i].tableHours}.`)
      }
    }
}