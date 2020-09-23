
/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 */
export const _getInitiativeFormula = function(combatant) {
  const actor = combatant.actor;
  if ( !actor ) return "2d10";
  const vigilance = actor.data.data.attributes.vigilance;
  const parts = [vigilance.value + vigilance.dice, vigilance.mod];
  var val = parts.filter(p => p).join(" + ")
  return val;
};