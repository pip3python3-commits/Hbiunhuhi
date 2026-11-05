// Registry of extra sets (worlds). Built-ins 'street' and 'court' live in world.js.
// To add a world: create sets/<name>.js exporting default { name, sky, build(kit) -> {group, update?(state,t,beat)} } and list it here.
import studio from './studio.js';
import lab from './lab.js';
export const EXTRA_SETS = [studio, lab];
