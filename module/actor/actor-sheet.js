import {ENDLESSVOID} from '../config.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class EndlessVoidActorSheet extends ActorSheet {
  /**
   * The set of Potential Scores used within the system
   * @type {Object}
   */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["endlessvoid", "sheet", "actor"],
      template: "systems/endlessvoid/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.config = ENDLESSVOID;
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }

    // Potentials
    for ( let [p, pot] of Object.entries(data.actor.data.potentials)) {
      pot.label = ENDLESSVOID.potentials[p];
    }

    // Skill Sets
    for ( let [s, skl] of Object.entries(data.actor.data.skillsets)) {
      skl.label = ENDLESSVOID.skillSets[s];
      if(data.actor.data.skillSetPotential){
        for(let [id, skill] of Object.entries(skl.skills)){
          skill.ability = data.actor.data.skillSetPotential;
        }
      }
    }

    this._prepareSkills(data.actor);

    return data;
  }
  
  /**
   * Prepare skill checks.
   * @param actorData
   * @private
   */
  _prepareSkills(actorData) {
    const data = actorData.data;
    let round = Math.floor;
    for (let [grpId, grp] of Object.entries(data.potentials)) {
      if(!grp.skills)
        continue;

      for(let [id, skl] of Object.entries(grp.skills)) {
        this._prepareSkill(id, skl, data);
      }
    }

    for(let [id, skillSet] of Object.entries(data.skillsets)){
      for(let [skId, skill] of Object.entries(skillSet.skills)){
        this._prepareSkill(skId, skill, data);
      }
    }
  }

  _prepareSkill(id, skl, data) {
    skl.value = parseFloat(skl.value || 0);

    // Compute modifier
    if(skl.ability)
      skl.mod = data.potentials[skl.ability].mod || 0;
    else
      skl.mod = 0;

    skl.total = skl.mod + skl.value;
    skl.icon = this._getProficiencyIcon(skl.value);
    skl.hover = ENDLESSVOID.proficiencyLevels[skl.value];
    skl.label = ENDLESSVOID.skills[id];

    // Compute passive bonus
    skl.passive = 10 + skl.total;

    return 0;
  }

  _getProficiencyIcon(level) {
    const icons = {
      0: '<i class="far fa-circle"></i>',
      1: '<i class="fa fa-adjust"></i>',
      2: '<i class="fa fa-circle"></i>',
      4: '<i class="fa fa-check-circle"></i>',
      8: '<i class="fa fa-check"></i>'
    };
    return icons[level];
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.skill-proficiency').on("click contextmenu", this._onCycleSkillProficiency.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle cycling proficiency in a Skill
   * @param {Event} event   A click or contextmenu event which triggered the handler
   * @private
   */
  _onCycleSkillProficiency(event) {
    event.preventDefault();
    const field = $(event.currentTarget).siblings('input[type="hidden"]');

    // Get the current level and the array of levels
    const level = parseFloat(field.val());
    const levels = [0, 1, 2, 4, 8];
    let idx = levels.indexOf(level);

    // Toggle next level - forward on click, backwards on right
    if ( event.type === "click" ) {
      field.val(levels[(idx === levels.length - 1) ? 0 : idx + 1]);
    } else if ( event.type === "contextmenu" ) {
      field.val(levels[(idx === 0) ? levels.length - 1 : idx - 1]);
    }

    // Update the field value and save the form
    this._onSubmit(event);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

}
