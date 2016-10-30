/**
 * @file board
 */

import * as Dom from '../utils/dom.js';

import mergeOptions from '../utils/merge-options.js';
import log from '../utils/log.js';

import config from '../config.js';
import {Component} from '../videojs-classes.js';
import Board from './board.js';

class BoardSelect extends Board {
  constructor(player, options) {
    super(player, options);
    
    options = mergeOptions(BoardSelect.prototype.options_, options);
    
  }
  
  /**
   * Give the element button specific class names
   * 
   * @method buildCSSClass
   */
  buildCSSClass() {
    return `${BoardSelect.prototype.options_.className}`;
  }
  
  /**
   * Handles the click event by pulling all marks that correspond to selected time point
   * 
   * @param {Object} event Event object
   * @method handleClick
   */
  handleClick(event) {
    /* todo: mark function */
  }
  
  /**
   * Triggers the mark start event for a new active mark
   * 
   * @param {Object} event Event object
   * @method handleMouseDown
   */
  handleMouseDown(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  
  /**
   * Draws the highlighted segment by calling Marks API
   *
   * @param {Event} event
   * @method handleMouseMove
   */
  handleMouseMove(event){
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  
  /**
   * Triggers the mark end event for the active mark
   *
   * @param {Object} event Event object
   * @method handleMouseUp
   */
  handleMouseUp(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}

BoardSelect.prototype.options_ = config.BoardSelect;

Component.registerComponent('BoardSelect', BoardSelect)
export default BoardSelect;