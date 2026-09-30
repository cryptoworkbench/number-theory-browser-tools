/* NT.layout — shared diagram layouts: Euclidean nested squares and
   recursive factor trees.

   RED-phase stub (TDD): the load-time NT.core guard is real, but the
   exported member set is intentionally empty so checks/layout.check.js's
   key-set assertion fails first, before any other assertion runs. Filled
   in during the GREEN commit.
*/
(function () {
  "use strict";

  var NT = window.NT = window.NT || {};

  if (!NT.core) {
    throw new Error('assets/nt-layout.js needs assets/nt-core.js loaded before it');
  }

  NT.layout = Object.freeze({});
})();
