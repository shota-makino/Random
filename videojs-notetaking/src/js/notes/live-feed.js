/**
 * @file live-feed.js
 */



/**
 * The base functionality for sliders like the volume bar and seek bar
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Component
 * @class Slider
 */
class LiveFeed {
  constructor(player, id, options){
    // options for the LiveFeed is accessible through the 
    options.autochange = options.autochange || true;
    options.snapshots = options.snapshots || true;
    options.content = options.content || true;
    options.titles = options.titles || true;
    
    this.player_ = player;
    
    
  }
  
  
}