import { i18n } from '../../lib/utilities.js'
import { Maneuvers } from './maneuver.js'

// lazy-initialized varaible for the html template
let html = null

/**
 * This class is used as a namespace for Show Art
 * static methods. It has no constructor.
 *
 * @namespace ManeuverHUDButton
 */
export default class ManeuverHUDButton {
  static async getInnerHtml() {
    if (html == null) {
      html = await renderTemplate('systems/gurps/templates/maneuver-hud.hbs', Maneuvers)
    }
    return html
  }
  /**
   * Handles the click or contextmenu events for tile/token art buttons
   *
   * @static
   * @param {Event} event - The triggering event.
   * @param {string} image - The file path of the image to display.
   * @param {string} title - The name to display in the popup title bar.
   * @memberof ShowArt
   */
  static buttonEventHandler(event, image, title) {
    const pop = this.createImagePopup(image, title)
    if (event.shiftKey && game.user.isGM) pop.shareImage()
  }
  /**
   * Creates and renders and ImagePopout
   * with a specific image and title.
   * the image is set to sharable.
   *
   * @static
   * @param {string} image - The file path of the image to display.
   * @param {string} title - The name to display in the popup title bar.
   * @return {ImagePopout} The instance of the ImagePopout.
   * @memberof ShowArt
   */
  static createImagePopup(image, title) {
    return new MultiMediaPopout(image, {
      title,
      shareable: true,
    }).render(true)
  }
  /**
   * Retrieves the Actor associated with a given token.
   *
   * @static
   * @param {Token} token - The Token to look for the Actor of.
   * @return {Actor} The associated Actor.
   * @memberof ShowArt
   */
  static getTokenActor(token) {
    return game.actors.get(token.actorId)
  }
  /**
   * @typedef {Object} titles
   * @property {string} actor - The title for the Actor
   * @property {string} token - The title for the Token
   *
   * Determin the correct image titles for either the token,
   * or the associated Actor.
   *
   * @static
   * @param {Token} token - The Token to get the title of.
   * @param {Actor} actor - The Actor to get the title of.
   * @return {titles} The titles for actor and token.
   * @memberof ShowArt
   */
  static getTokenTitles(token, actor) {
    const M = CONST.TOKEN_DISPLAY_MODES,
      dn = token.displayName

    if (dn == M.ALWAYS || dn == M.HOVER)
      return {
        actor: token.actorData.name || actor.name,
        token: token.name,
      }

    return {
      actor: game.i18n.localize('TKNHAB.ActorImg'),
      token: game.i18n.localize('TKNHAB.TokenImg'),
    }
  }
  /**
   * @typedef {Object} images
   * @property {string} actor - The image for the Actor
   * @property {string} token - The image for the Token
   *
   * Determin the correct image paths for either the token,
   * or the associated Actor.
   *
   * @static
   * @param {Token} token - The Token to get the path of.
   * @param {Actor} actor - The Actor to get the path of.
   * @return {images} The paths of the actor and token images.
   * @memberof ShowArt
   */
  static getTokenImages(token, actor) {
    const mystery = 'icons/svg/mystery-man.svg'
    const synthActor = token.actorData

    let actorImg = synthActor.img || actor.data.img
    let tokenImg = token.img

    const am = actorImg === mystery
    const tm = tokenImg === mystery

    if (!(am && tm)) {
      actorImg = am ? tokenImg : actorImg
      tokenImg = tm ? actorImg : tokenImg
    }

    return { actor: actorImg, token: tokenImg }
  }
  /**
   * Create the HTML elements for the HUD button
   * including the Font Awesome icon and tooltop.
   *
   * @static
   * @return {Element} The `<div>` element that is used as the HUD button.
   * @memberof ShowArt
   */
  static async createButton() {
    let button = document.createElement('div')

    button.classList.add('control-icon')
    button.classList.add('maneuver-open')
    button.setAttribute('data-action', 'maneuver')
    button.title = i18n('GURPS.setManeuver', 'Set Maneuver')
    button.innerHTML = await ManeuverHUDButton.getInnerHtml()
    return button
  }

  /**
   * Adds the button to the Token HUD,
   * and attaches event listeners.
   *
   * @static
   * @param {TokenHUD} hud - The HUD object, not used.
   * @param {jQuery} html - The jQuery reference to the HUD HTML.
   * @param {Token} token - The data for the Token.
   * @memberof ShowArt
   */
  static async prepTokenHUD(hud, html, token) {
    const actor = this.getTokenActor(token)
    const images = this.getTokenImages(token, actor)
    const titles = this.getTokenTitles(token, actor)
    const artButton = await this.createButton()

    // $(artButton)
    //   .click(event => this.buttonEventHandler(event, images.actor, titles.actor))
    //   .contextmenu(event => this.buttonEventHandler(event, images.token, titles.token))

    html.find('div.right').append(artButton)

    html.find('.status-maneuvers .effect-control').click(ev => {
      let key = $(ev.currentTarget).attr('data-status-id')
      console.log(key)

      actor.updateManeuver(key)
    })
  }
}
