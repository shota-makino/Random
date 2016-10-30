import videojs from 'video.js';

import document from 'global/document';
import window from 'global/window';
import NoteTaking from './notetaking.js';

import log from './utils/log.js';
import * as Guid from './utils/guid.js';
import * as Dom from './utils/dom.js';

import defaults from './config.js';

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
const onPlayerReady = (player, options) => {
  // Checks for required parameters
  if (typeof player === 'undefined'){
    log.error('The player parameter is required for vjs-notetaking.');
    return;
  }
  
  if (typeof options === 'undefined'){
    log.error('The options parameter is required for vjs-notetaking.');
    return; 
  }
  
  // Adds plugin class to player element
  player.addClass('vjs-notetaking');
  
  // Checks if notetaking object is already associated with the player
  if (!player.notetaking_) {
    log('Attaching wrapper for notetaking...');
    player.notetaking_ = new NoteTaking(player, options)
  }
   
  var id = options.id;

  var el = null;

  if (id) {
    el = Dom.getEl(id);
  }
  /*
  if (el) {
    player.notetaking_.registerNotes(id);
  } else {
    log('Could not find element with id ', options.id);
    // ADD IN NOTETAKING ABILITY ONLY
  }
  */ 
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function notetaking
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const notetaking = function(options) {
  this.ready(() => {
    // Create an unique identifier if not given an id
    var id = {id: `${defaults.id}_${Guid.newGUID()}`};
    
    onPlayerReady(this, videojs.mergeOptions(defaults, id, options));
  });
  
  return this.notetaking_;
};


// Register the plugin with video.js.
videojs.plugin('notetaking', notetaking); 

// Include the version number.
notetaking.VERSION = '__VERSION__';

export default notetaking;
