/**
 * @file mark.js
 */

import * as Dom from '../utils/dom.js';
import * as Guid from '../utils/guid.js';

import mergeOptions from '../utils/merge-options.js';
import log from '../utils/log.js';

import config from '../config.js';
import {Component} from '../videojs-classes.js';

/**
 * Private global variables
 */
var _startTimes = [];
var _endTimes = [];
var _markIDs = [];

var _guids = 0;


/**
 * Overlays element over the player seek bar in order to inhibit triggering of seek bar events
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @Mark
 */
class Mark extends Component {
  constructor(player, options) {
    super(player, options);
    this.player_ = player;
    if (player && player.id && player.id()) {
      this.id_ = `${player.id()}_mark_${Guid.newGUID()}`;
    }  
    
    this.activeMark = null;
  }
  
  /**
   * Creates the parent element for holding all marks
   */
  createEl() {
    return Dom.createEl('ul', {
      className: this.options_.className
    });
  }
  
  /** 
   * Gets the markup for creating the mark
   */
  getMarkup() {
    return {
      tag: 'li',
      properties: {
        startPoint: 0,
        className: this.options_.activeClassName
      },
      attributes: {
        id: this.options_.idPrefix + (_guids++).toString()
      }
    }
  }
  
  /**
   * Creates a new mark at a 
   */
  createNewMark(point) {
    const childNodes = this.contentEl().children;
    const refNode = childNodes[childNodes.length] || null;
    
    let markup = this.getMarkup();
    markup.properties.startPoint = point;
    let el = Dom.createEl(markup.tag, markup.properties, markup.attributes);
    
    let activeMark = this.contentEl().insertBefore(el, refNode);
    
    return activeMark
  }
  
  deleteNewMark() {
    
  }
  
  /**
   * Handles the creation of a new mark
   *
   * @param {Number} time Start time of mark
   * @method newActiveMark
   */
  startActiveMark(point) {
    let time = this.player_.duration() * point;
    
    this.setMarkStartTime(time);
    this.activeMark = this.createNewMark(point);
    
    this.activeMark.style.left = (point * 100).toFixed(2) + '%';
  }
  
  /**
   * Draws the active 
   */
  drawActiveMark(progress) {
    const mark = this.activeMark;

    if (!mark) {
      return;
    }

    // Protect against no duration and other division issues
    if (typeof progress !== 'number' ||
        progress !== progress ||
        progress < 0 ||
        progress === Infinity) {
      progress = 0;
    }
    
    let offSetPercent = (progress - this.activeMark.startPoint);
    // Convert to a percentage for setting
    const percentage = (offSetPercent * 100).toFixed(2) + '%';
    
    // Set the new bar width or height
    if (this.vertical()) {
      mark.style.height = percentage;
    } else {
      mark.style.width = percentage;
    }
  }
  
  /**
   * Handles the end of a new mark
   *
   * @param {Number} time End time of mark
   * @method handleStart
   */
  endActiveMark(point) {
    
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
  
  setMarkStartTime(time) {
    _startTimes.push(time);
  }
  
  endMarkStartTime(time) {
    _endTimes.push(time);
  }
}

Mark.prototype.options_ = config.Mark;

Component.registerComponent('Mark', Mark);
export default Mark;