/**
 * @file board
 */

import * as Dom from '../utils/dom.js';

import mergeOptions from '../utils/merge-options.js';
import log from '../utils/log.js';

import config from '../config.js';
import {Component} from '../videojs-classes.js';
import Board from './board.js';

class BoardCreate extends Board {
  constructor(player, options) {
    super(player, options);
    
    options = mergeOptions(BoardCreate.prototype.options_, options);
    this.mark = player.notetaking_.marks;
  }
  
  /**
   * Give the element button specific class names
   * 
   * @method buildCSSClass
   */
  buildCSSClass() {
    return `${BoardCreate.prototype.options_.className}`;
  }
  
  /**
   * Selects a mark from mark list
   * 
   * @param {Object} event Event object
   * @method handleClick
   */
  handleClick(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  
  /**
   * Triggers the mark start event for a new active mark
   * 
   * @param {Object} event Event object
   * @method handleMouseDown
   */
  handleMouseDown(event) {
    const doc = this.mark.el_.ownerDocument;
    
    event.preventDefault();
    Dom.blockTextSelection();
    
    this.on(doc, 'mousemove', this.handleMouseMove);
    this.on(doc, 'mouseup', this.handleMouseUp);
    this.on(doc, 'touchend', this.handleMouseUp);

    let startPoint = this.calculateDistance(event);
    
    this.mark.startActiveMark(startPoint);
    this.handleMouseMove(event);
  }
  
  /**
   * Draws the highlighted segment by calling Marks API
   *
   * @param {Event} event
   * @method handleMouseMove
   */
  handleMouseMove(event){
    let progress = this.calculateDistance(event);
    this.mark.drawActiveMark(progress);
  }
  
  /**
   * Triggers the mark end event for the active mark
   *
   * @param {Object} event Event object
   * @method handleMouseUp
   */
  handleMouseUp(event) {
    const doc = this.mark.el_.ownerDocument;
    
    Dom.unblockTextSelection();
    
    this.off(doc, 'mousemove', this.handleMouseMove);
    this.off(doc, 'mouseup', this.handleMouseUp);
    this.off(doc, 'touchend', this.handleMouseUp);
    
    let endPoint = this.calculateDistance(event);
    this.mark.endActiveMark(endPoint);
  }
}

BoardCreate.prototype.options_ = config.BoardCreate;

Component.registerComponent('BoardCreate', BoardCreate)
export default BoardCreate;