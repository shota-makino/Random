/**
 * @file board
 */
import * as Dom from '../utils/dom.js';

import mergeOptions from '../utils/merge-options.js';
import log from '../utils/log.js';
import assign from 'object.assign';

import config from '../config.js';
import {Component} from '../videojs-classes.js';
import Mark from '../marker/mark.js';

/**
 * The board creates a new Notes object that goes along with a Mark object
 * 
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Component
 * @class Board
 */
class Board extends Component {
  constructor(player, options) {
    options = mergeOptions(Board.prototype.options_, options);
    super(player, options);
    
    this.vertical(!!this.options_.vertical);
    
    this.on('mousedown', this.handleMouseDown);
    this.on('touchstart', this.handleMouseDown);
    this.on('click', this.handleClick);
    
    this.activeMark = null; 
  }
  
  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl(tag = 'div', props = {}, attributes = {}) {
    props = assign(props, {
      className: `${Board.prototype.options_.className} ${this.buildCSSClass()}`
    });
    
    return super.createEl(tag, props, attributes);
  }
  
  /**
   * To be implemented by the child Board class
   * 
   * @param {Object} event Event object
   * @method handleClick
   */
  handleClick(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
  
  /**
   * To be implemented by the child Board class
   * 
   * @param {Object} event Event object
   * @method handleMouseDown
   */
  handleMouseDown(event) {
  }
  
  /**
   * To be implemented by the child Board class
   *
   * @param {Object} event Event object
   * @method handleMouseUp
   */
  handleMouseUp(event) {
  }
  
  /**
   * To be implemented by the child Board class
   *
   * @param {Event} event
   * @method handleMouseMove
   */
  handleMouseMove(event){
  }
  
  /**
   * Get percentage of video played
   *
   * @return {Number} Percentage played
   * @method getPercent
   */
  getPercent() {
    const percent = this.player_.currentTime() / this.player_.duration();

    return percent >= 1 ? 1 : percent;
  }
  
  /**
   * Calculate distance for slider
   *
   * @param {Object} event Event object
   * @method calculateDistance
   */
  calculateDistance(event) {
    const position = Dom.getPointerPosition(this.el_, event);

    if (this.vertical()) {
      return position.y;
    }
    return position.x;
  }
  
  /**
   * Gets the vertical status of slider bars from player's control bar
   * 
   * @method vertical()
   */
  vertical() {
    let controlBar = this.player_.getChild('controlBar');
    let progressControl = controlBar.getChild('progressControl');
    let seekBar = progressControl.getChild('seekBar');

    return seekBar.vertical();
  }
}

Board.prototype.options_ = config.Board;

Component.registerComponent('Board', Board)
export default Board;