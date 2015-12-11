var UnifyCanvas = (function($) {
        var Selector = {
            DATA_CANVAS: '[data-canvas]'  
        };
        
        var Keys = {
            DATA_KEY: 'UnifyCanvas'
        };
        
        var Default = {
            width: 768,
            height: 300,
            animate: true
        };
        
        var Params = ['id', 'canvas'];
        
        var UnifyCanvas = (function(){
            var _reqid_ = 0;
            
            function UnifyCanvas (element, opt) {
                var obj = $.extend({}, Default, opt);

                // local variables & funcs
                this.animate = opt.animate;
                this._height = opt.height;
                this._width = opt.width; 
                this._element = element;
                
                // static variables & funcs
                UnifyCanvas._canvases = UnifyCanvas._canvases || {};
                UnifyCanvas._animate = UnifyCanvas._animate || {};
                UnifyCanvas._offsets = UnifyCanvas._offsets || {};
                
                this.initiate(obj);
            }
            
            Util.data(UnifyCanvas.prototype, 'initiate', {
                value: function(obj) {
                    for (i in Params){ 
                        if (!obj.hasOwnProperty(Params[i])) {
                            console.log('Must pass an object with properties "id" and "canvas"');
                            return;
                        }
                    }
                    if (obj.id in UnifyCanvas._canvases) {
                        console.log('Canvas already initiated, call update to update canvas');
                        return;
                    }
                    
                    this.attach(obj);
                    $(window).on('scroll.unifycanvas', UnifyCanvas._scrollCheck);
                    
                    UnifyCanvas._canvases[obj.id].canvas.setup();
                    UnifyCanvas._updateShown();
                    UnifyCanvas._requestAnim();
                }
            });
                
            Util.data(UnifyCanvas.prototype, 'attach', {
                value: function(obj){
                    UnifyCanvas._canvases[obj.id] = {};
                    UnifyCanvas._offsets[obj.id] = {};
                    
                    UnifyCanvas._attachCanvas(obj);
                    
                    if ((el = this._element) === null) return;
                    UnifyCanvas._attachElement({ id: obj.id, element: this._element })
                    
                    var offset = el.offset();
                    var top = offset ? offset.top : null;
                    var bot = top ? top + this.height : null;
                    UnifyCanvas._attachOffset({ id: obj.id, meas: { top: top, bottom: bot } });
                }
            });
            
            Util.data(UnifyCanvas, '_requestAnim', {
                value: function(){
                    for (key in UnifyCanvas._animate) {
                        UnifyCanvas._animate[key].call(UnifyCanvas._canvases[key].canvas);
                    }
                    if (!$.isEmptyObject(UnifyCanvas._animate)) _reqid_ = requestAnimationFrame(UnifyCanvas._requestAnim);
                }
            });
            
            Util.data(UnifyCanvas, '_updateShown', {
                value: function() {
                    var curTop = document.body.offsetTop,
                        curBot = curTop + window.innerHeight;
                    
                    for (key in UnifyCanvas._canvases) {
                        if (curTop > UnifyCanvas._offsets[key].bottom) {
                            delete UnifyCanvas._animate[key];
                        } else if (curBot < UnifyCanvas._offsets[key].top) {
                            delete UnifyCanvas._animate[key];
                        } else {
                            UnifyCanvas._animate[key] = UnifyCanvas._canvases[key].canvas.animate;
                            UnifyCanvas._animate[key].prototype = UnifyCanvas._canvases[key].canvas;
                        }
                    }
                    UnifyCanvas._requestAnim();
                }
            });
            
            Util.data(UnifyCanvas, '_attachElement',{
                value: function(obj) {
                    if (!UnifyCanvas._canvases.hasOwnProperty(obj.id)) return; 
                    UnifyCanvas._canvases[obj.id].element = obj.element;
                }
            });
        
            Util.data(UnifyCanvas, '_attachOffset', {
                value: function(obj) {
                    if (!UnifyCanvas._offsets.hasOwnProperty(obj.id)) return;
                    UnifyCanvas._offsets[obj.id] = obj.meas;
                }
            });
            
            Util.data(UnifyCanvas, '_attachCanvas', {
                value: function(obj){
                    if (!UnifyCanvas._canvases.hasOwnProperty(obj.id)) {
                        console.log(obj.id + ' not set to _canvases');
                        return; 
                    }
                    this._canvases[obj.id].canvas = obj.canvas;
                }
            });
            
            Util.data(UnifyCanvas, '_removeCanvas', {
                value: function(id) {
                    delete this._canvases[id];
                }      
            });
            
            Util.data(UnifyCanvas, '_scrollCheck', {
                value: function(){
                    Util.waitForFinalEvent(function(){
                        console.log('Scrolling...');
                        UnifyCanvas._updateShown();
                    }, 100, 'scrolling')
                    return false;
                }
            });
            
            Util.data(UnifyCanvas, 'interface', {
                value: function(object){
                    return this.each(function() {
                        $this = $(this);
                        var options = $this.data(Keys.DATA_KEY);
                        if ($.isEmptyObject(options)) {
                            var canvas = new UnifyCanvas($this, object);
                            $this.data(Keys.DATA_KEY, canvas);
                        } else {
                            $.extend(options, object);
                            options['initiate'].call(this, object);
                        }
                    });
                }
            });
            
            $.fn['unifyCanvas'] = UnifyCanvas.interface;
            $.fn['unifyCanvas'].Constructor = UnifyCanvas;
            
            return UnifyCanvas;
        })();
        
        return UnifyCanvas;
    })(jQuery);