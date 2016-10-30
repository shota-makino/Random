/**
 * @file marker.js
 */

import * as Dom from '../utils/dom.js';
import * as Guid from '../utils/guid.js';

import mergeOptions from '../utils/merge-options.js';
import log from '../utils/log.js';

import config from '../config.js';
import {Menu, Button, Component} from '../videojs-classes.js';

class MarkerToggle extends Button {
  constructor(player, options) {
    super(player, options);
    
    options = mergeOptions(MarkerToggle.prototype.options_, options);
    
    this.targetParent = player.notetaking_.disableControl;
    this.targetSelect = this.targetParent.getChild('BoardSelect');
    this.targetCreate = this.targetParent.getChild('BoardCreate');
    
    this.statuses = options.markerStatuses;
    this.statusInd = 0;
    this.status = this.statuses[this.statusInd];
    this.iconClassNames = options.iconClassNames;
    
    this.controlText(this.status.replace(/([A-Z])/g, ' $1'));
  }
  
  /**
   * Creates a child element for changing icons
   * 
   * @method createChild
   */
  createEl() {
    const el = super.createEl();
    
    const iconClass = this.options_.iconClassName;
    const iconClasses = this.options_.iconClassNames;
    const statuses = this.options_.markerStatuses;
    const activeIcon = this.options_.activeIcon;
    const parentClass = this.options_.parentClassName;
  
    var tag = 'span';
    var props = {
      className: `${parentClass}`
    };
    const topEl = el.insertBefore(Dom.createEl(tag, props), null);
    
    tag = 'i';
    props = {
      className: `${iconClass} ${iconClasses['ScrollBar']}`
    };
    const iconTop = topEl.insertBefore(Dom.createEl(tag, props), null);
    
    props = {
      className: `${iconClass} ${activeIcon} ${iconClasses[statuses[0]]}`
    };
    const iconBottom = topEl.insertBefore(Dom.createEl(tag, props), iconTop);
    
    this.modeIcon = iconBottom;
    
    return el;
  }

  /**
   * Updates ARIA accessibility attributes
   *
   * @method updateARIAAttributes
   */
  updateARIAAttributes() {
    // Current playback rate
    this.el().setAttribute('aria-valuenow', this.player().playbackRate());
  }
  
  /**
   * Toggles Disable Control
   *
   * @method handleClick
   */ 
  handleClick() {  
    const modeIcon = this.modeIcon;
    var numStats = this.statuses.length;
    
    Dom.removeElClass(modeIcon, this.iconClassNames[this.status]);
    
    // Change the status, classNames for the marker icon, and enable/disable the Board elements
    this.statusInd = (this.statusInd + 1) % numStats;
    this.status = this.statuses[this.statusInd];
    this.controlText(this.status.replace(/([A-Z])/g, ' $1'));
    if (this.statusInd < 2) {
      Dom.addElClass(modeIcon, this.iconClassNames[this.status]);
    }
    
    // The default shows the icon for 'CreateNote' - after transitioning to this mode 
    // icon should change to 'SelectNote' and the targetCreate should be enabled
    // Similarly, when the icon for 'SelectNote' shows, the icon should change to
    // 'ScrollBar' and should hide the parent
    if (this.status === this.statuses[1]) {
      this.targetParent.show();
      this.targetCreate.show(); // Normal -> Create
      this.targetSelect.hide();
    } else if (this.status === this.statuses[2]) {
      this.targetParent.show();
      this.targetSelect.show(); // Create -> Select
      this.targetCreate.hide();
    } else if (this.status === this.statuses[0]) {
      this.targetParent.hide(); // Go to Create
    }
    
    event.stopImmediatePropagation();
    event.preventDefault(); 
  }
  
  /**
   * Give the element button specific class names
   * 
   * @method buildCSSClass
   */
  buildCSSClass() {
    return `${this.options_.className} ${super.buildCSSClass()}`;
  }
  
  /**
   * Hide playback rate controls when they're no playback rate options to select
   *
   * @method updateVisibility
   */
  updateVisibility() {
    if (this.playbackRateSupported()) {
      this.removeClass('vjs-hidden');
    } else {
      this.addClass('vjs-hidden');
    }
  }
}

MarkerToggle.prototype.options_ = config.MarkerToggle;
MarkerToggle.prototype.controlText_ = 'markerToggle';

Component.registerComponent('MarkerToggle', MarkerToggle);
export default MarkerToggle;