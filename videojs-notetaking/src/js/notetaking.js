/* 
 *  videojs-notetaking architecture 
 *    - setup.js: setup and initializing first DOM element for the notetaking plugin
 *    - notetaking.js: outlines the NoteTaking class 
 *    - notes.js: outlines the Notes class
 *    - live-feed.js: outlines the LiveFeed class, which constructs the DOM elements for display
 *    - notes-dialog.js: outlines the NotesDialog class
 *   
 */

import videojs from 'video.js';

import document from 'global/document';
import window from 'global/window';

import * as Dom from './utils/dom.js';
import * as Fn from './utils/fn.js';
import * as Obj from './utils/object.js';
import log from './utils/log.js';
import mergeOptions from './utils/merge-options.js';
import config from './config.js';

import Notes from './notes/notes.js';
import Board from './board/board.js';
import MarkerToggle from './marker/marker-toggle.js'
import DisableControl from './disable-control.js';

class NoteTaking {
  constructor(player, options) {
    options = mergeOptions(this.options_, options);
    this.player = player;
    this.player.notetaking_ = this.player.notetaking_ || {};
    
    if (options.id === 'string'){
      this.id = options.id;
    }
    
    // Keeps track of the notes objects for possibility that one notetaking object 
    // connects to 2 or more different notes objects
    if (!this.notes_) {
      this.notes_ = {};
    }
    
    // Separate the Mark and the DisableControl options from config
    const markerToggleOptions = options.MarkerToggle;
    const disableControlOptions = options.DisableControl;
    
    // Register and add the control bar to the player only once and on constructor
    const notetaking = this.player.notetaking_; 
    
    notetaking.disableControl = this.addDisableControl(disableControlOptions);
    notetaking.markerToggle = this.addMarkerToggle(markerToggleOptions);
  }
 
  addDisableControl(options) {    
    if (this.player && this.player.controlBar) {
      var controlBar = this.player.controlBar;
      
      if (controlBar.progressControl) {
        let progressControl = controlBar.progressControl;
        
        var disableControl = progressControl.addChild('disableControl', {});
        return disableControl;
      }
    }
  }
  
  addMarkerToggle(options){
    if (this.player && this.player.controlBar) {
      var controlBar = this.player.controlBar;
            
      var markerToggle = controlBar.addChild('markerToggle', options);
      return markerToggle;
    }
  }
  
  registerNotes(el) {    
    // Checks if the el is already in notes_
    if (!this.notes_[el]) {
      this.notes_[el] = new Notes(this.player, mergeOptions({}, this.options.Notes));
      if (!Dom.hasElClass(el, 'vjs-notetaking')) {
        Dom.addElClass(el, 'vjs-notetaking'); 
      }
    } else {
      log.warn('The notes element is already registered.');
    }
  }
  
  findInChildrenTree(){
    
  }
}

NoteTaking.prototype.options_ = config;

export default NoteTaking;