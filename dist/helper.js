"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.stringCheck=stringCheck,exports.errorBuild=errorBuild;function stringCheck(a){return!("string"!=typeof a)||!!(a instanceof String)}function errorBuild(a,b,c){return b?`\n ** (${a}) -> ${b}\n ** ${c}`:`\n ** (${a}) -> ${c}`}