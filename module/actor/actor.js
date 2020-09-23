/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class EndlessVoidActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    // Make modifications to data here. For example:
    
    //Reset the vigilance
    data.attributes.vigilance.mod = null;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [p, pot] of Object.entries(data.potentials)) {
      // Calculate the modifier using d20 rules.
      pot.mod = Math.floor((pot.value - 10) / 2);

      if(pot.isVigilance) {
        if(!(data.attributes.vigilance.mod) || pot.mod >= data.attributes.vigilance.mod) {
          data.attributes.vigilance.mod = pot.mod;
        }
      }
    }
  }
}