import { SYSTEM_NAME } from '../../lib/miscellaneous-settings.js'
import { i18n } from '../../lib/utilities.js'
import { EffectModifierPopout } from './effect-modifier-popout.js'

export class EffectModifierControl {
  static SETTING_SHOW_EFFECTMODIFIERS = 'tokentools-show-effectmods'
  static EffectModName = 'GURPSEffectsMod'

  constructor() {
    this._showPopup = false
    this.token = null

    Hooks.once('init', this._registerSetting.bind(this))
    Hooks.on('renderSceneControls', this._createEffectModifierButton.bind(this))
    Hooks.on('controlToken', this._controlToken.bind(this))
    Hooks.on('updateToken', this._updateToken.bind(this))
    Hooks.on('createActiveEffect', this._createActiveEffect.bind(this))
    Hooks.once('ready', () => (this._ui = new EffectModifierPopout(null, this)))
    Hooks.on('closeEffectModifierPopout', () => (this.showPopup = false))
  }

  get showPopup() {
    return this._showPopup
  }

  set showPopup(b) {
    if (b !== this.showPopup) this.togglePopup()
  }

  togglePopup(closeOptions) {
    this._showPopup = !this._showPopup

    // show the token control as active
    let toggle = $.find('[data-control=token] ol > li[data-tool=GURPSEffectsMod]')
    toggle[0].classList.toggle('active')

    this.toggleEffectModifierPopup(closeOptions)
  }

  _registerSetting() {
    game.settings.register(SYSTEM_NAME, EffectModifierControl.SETTING_SHOW_EFFECTMODIFIERS, {
      name: i18n('GURPS.settingTokenToolsShowEffectMods', 'Show Effect Modifiers'),
      hint: i18n('GURPS.settingHintTokenToolsShowEffectMods', 'Enable the token Effect Modifiers popup window.'),
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => console.log(`${EffectModifierControl.SETTING_SHOW_EFFECTMODIFIERS} : ${value}`),
    })
  }

  _createEffectModifierButton(control, html, data) {
    const name = EffectModifierControl.EffectModName
    let existing = html.find(`li.control-tool.toggle[data-tool=GURPSEffectsMod]`)

    if (this.shouldUseEffectModifierPopup() && existing.length === 0) {
      const title = i18n('GURPS.tokenToolsTitle')
      const icon = 'fas fa-list-alt'
      const active = this.showPopup
      const btn = $(
        `<li class="control-tool toggle ${
          active ? 'active' : ''
        }" title="${title}" data-tool="${name}"><i class="${icon}"></i></li>`
      )

      let self = this
      btn.on('click', _ => self.togglePopup())

      let list = html.find('[data-control=token] ol')
      list.append(btn)
    }
  }

  _createActiveEffect(effect, _, __) {
    let effectID = effect?.parent.id
    let sharedStateID = this.token?.actor.id
    console.log(`_createActiveEffect: effect id: ${effectID}, token actor id: ${sharedStateID}`)
    if (effect?.parent.id === this.token?.actor.id) this._ui.render(false)
  }

  _updateToken(tokenDocument) {
    let tokenID = tokenDocument.object?.id
    let sharedStateID = this.token?.id
    console.log(`_updateToken: token id: ${tokenID}, token actor id: ${sharedStateID}`)
    if (tokenDocument.object === this.token) this._ui.render(false)
  }

  _controlToken(token, isControlled) {
    let sharedStateID = this.token?.id
    console.log(`controlToken: isControlled: ${isControlled}, token: ${token?.id}, current token: ${sharedStateID}`)
    if (isControlled) this.token = token
    else if (this.token === token) this.token = null

    this._ui.setToken(this.token)

    // FIXME Yet another crappy hack ... no idea why when switching from one token to another we end up in the
    // "no token selected" state. This fixes that problem.
    let self = this
    setTimeout(() => self._ui.render(false), 250)
  }

  async close(options) {
    if (this.showPopup) this.togglePopup(options)
  }

  shouldUseEffectModifierPopup() {
    return game.settings.get(SYSTEM_NAME, EffectModifierControl.SETTING_SHOW_EFFECTMODIFIERS)
  }

  toggleEffectModifierPopup(closeOptions) {
    if (this.showPopup) {
      this._ui.setToken(this.token)
      this._ui.render(true)
    } else {
      this._ui.closeApp(closeOptions)
    }
  }
}
