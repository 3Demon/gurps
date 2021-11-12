////////////////////////////////////////
// Added to color the rollable parts of the character sheet. Stevil...
////////////////////////////////////////
import { objectToArray } from '../../lib/utilities.js'
import { addColorWheelsToSettings } from './color-character-sheet.js'
import {
  SYSTEM_NAME,
  SETTING_COLOR_CHARACTER_SHEET_DATA,
  SETTING_DEFAULT_COLOR_BACKGROUND,
  SETTING_DEFAULT_COLOR_TEXT,
  SETTING_DEFAULT_COLOR_BACKGROUND_HOVER,
  SETTING_DEFAULT_COLOR_TEXT_HOVER
} from '../../lib/miscellaneous-settings.js'

export let updateSheets = function() {
  for (const actor of game.actors.contents) 
    if (actor.permission >= CONST.ENTITY_PERMISSIONS.OBSERVER) // Return true if the current game user has observer or owner rights to an actor
      actor.render()     
}

export default class ColorCharacterSheetSettings extends FormApplication {
  static getSheetColors() {
    let colorData = game.settings.get(SYSTEM_NAME, SETTING_COLOR_CHARACTER_SHEET_DATA)
    let results = objectToArray(colorData.colors)
    return results
  }

  constructor(options = {}) {
    super(options)
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'color-sheets',
      template: 'systems/gurps/templates/color-character-sheet/color-character-sheet.html',
      resizeable: true,
      minimizable: false,
      width: 550,
      height: 550,
      title: 'Color Character Sheet',
      closeOnSubmit: true,
      onLoad: addColorWheelsToSettings(),
      //onclose: value => updateSheets()
    })
  }

  /**
   * @override
   */
  getData(options) {
    const data = super.getData(options)
    data.colorData = ColorCharacterSheetSettings.getSheetColors()
    data.allColors = this._htmlColorCharacterSheet
    return data
  }

  /**
   * @returns {Array} an array of all colors settings.
   * Each entry contains the character sheet's Area Name, Rollable ID, Background Color, Hover Color, & Text Color.
   *
   * Entry:
   * {
   *   color_override: Boolean,
   *   area: String,
   *   rollable_css: String,
   *   background_color: String,
   *   hover_color: String,
   *   text_color: String
   * }
   */
  get _htmlColorCharacterSheet() {
    // let allColors = Array.from(game.journal)

    let colorData = game.settings.get(SYSTEM_NAME, SETTING_COLOR_CHARACTER_SHEET_DATA)
    let htmlColorCharacterSheet = objectToArray(colorData.colors)

    let results = htmlColorCharacterSheet.map(it => {
      return { color_override: it.color_override, area: it.area, rollable_css: it.rollable_css, color_background: it.color_background, color_text: it.color_text, color_hover: it.color_hover, color_hover_text: it.color_hover_text, default_color_background: SETTING_DEFAULT_COLOR_BACKGROUND, default_color_text: SETTING_DEFAULT_COLOR_TEXT, default_color_hover: SETTING_DEFAULT_COLOR_BACKGROUND_HOVER, default_color_hover_text: SETTING_DEFAULT_COLOR_TEXT_HOVER }
    })
    return results
  }

  /**
  * @override
  */
  _updateObject(event, formData) {
  }
}
