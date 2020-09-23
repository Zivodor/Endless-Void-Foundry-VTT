// Import Modules
import { ENDLESSVOID } from "./config.js";
import { EndlessVoidActor } from "./actor/actor.js";
import { EndlessVoidActorSheet } from "./actor/actor-sheet.js";
import { EndlessVoidItem } from "./item/item.js";
import { EndlessVoidItemSheet } from "./item/item-sheet.js";
import { _getInitiativeFormula } from "./combat.js";

Hooks.once('init', async function() {

  game.endlessvoid = {
    applications: {
      EndlessVoidActor,
      EndlessVoidItem,
    },
    config: ENDLESSVOID,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative.formula = "@attributes.vigilance.value@attributes.vigilance.dice + @attributes.vigilance.mod";

  Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  CONFIG.ENDLESSVOID = ENDLESSVOID;

  // Define custom Entity classes
  CONFIG.Actor.entityClass = EndlessVoidActor;
  CONFIG.Item.entityClass = EndlessVoidItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("endlessvoid", EndlessVoidActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("endlessvoid", EndlessVoidItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
});