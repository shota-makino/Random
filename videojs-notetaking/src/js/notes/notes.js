/**
 * @file notes.js
 */

import * as Dom from '../utils/dom.js';
import * as Guid from '../utils/guid.js';

import mergeOptions from '../utils/merge-options.js';
import config from '../config.js';

/**
 * Models Notes object
 */
class Notes { 
  constructor(player, id, options) {
    if (typeof id === 'object') {
      this.options_ = mergeOptions(this.options_, id);
      id = null;
    }
    
    if (!id) {
      id = this.options_.id + '_' + Guid.newGUID();
    } else if (typeof id === 'string') {
      id = id + Guid.newGUID();
    }
    this.id_ = id;
  }
  
  /**
   * Returns the name of the class
   * 
   */
  static name() {
    return 'Notes';
  }
  
}

Notes.options_ = config.Notes;

export default Notes;