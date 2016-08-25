// 自适应屏幕PPI，避免canvas出现模糊
(function(w) {
    if (document.createElement("canvas") && document.createElement("canvas").getContext) {
        var factor = function(_context) {
            return(w.devicePixelRatio || 1) / (_context.backingStorePixelRatio || (_context.webkitBackingStorePixelRatio || (_context.mozBackingStorePixelRatio || (_context.msBackingStorePixelRatio || (_context.oBackingStorePixelRatio || (_context.backingStorePixelRatio || 1))))));
        }(document.createElement("canvas").getContext("2d"));
        if (!(2 > factor)) {
            w.hidpiCanvasRatio = factor;
            (function(properties) {
                properties.drawImagePatchedSource = properties.drawImage;
                properties.drawImagePatchedSourceAndDest = properties.drawImage;
                (function(def, walk) {
                    var k;
                    for (k in def) {
                        if (def.hasOwnProperty(k)) {
                            walk(def[k], k);
                        }
                    }
                })({
                    fillRect : "all",
                    clearRect : "all",
                    strokeRect : "all",
                    moveTo : "all",
                    lineTo : "all",
                    arc : [0, 1, 2],
                    arcTo : "all",
                    bezierCurveTo : "all",
                    isPointinPath : "all",
                    isPointinStroke : "all",
                    quadraticCurveTo : "all",
                    rect : "all",
                    translate : "all",
                    createRadialGradient : "all",
                    createLinearGradient : "all",
                    drawImagePatchedSource : [1, 2, 3, 4],
                    drawImagePatchedSourceAndDest : [1, 2, 3, 4, 5, 6, 7, 8]
                }, function(keys, key) {
                    var v = properties[key];
                    properties[key] = function() {
                        var i;
                        var a;
                        if ("all" === keys) {
                            a = [];
                            i = arguments.length;
                            for (;0 < i--;) {
                                a[i] = arguments[i] * factor;
                            }
                        } else {
                            a = Array.prototype.slice.call(arguments);
                            i = keys.length;
                            for (;0 < i--;) {
                                if (a[keys[i]]) {
                                    a[keys[i]] *= factor;
                                }
                            }
                        }
                        return v.apply(this, a);
                    };
                });
                properties.drawImage = function(b) {
                    return function() {
                        return arguments[0] instanceof HTMLCanvasElement ? b.drawImagePatchedSourceAndDest.apply(this, arguments) : b.drawImagePatchedSource.apply(this, arguments);
                    };
                }(properties);
                properties.fillText = function(wrapper) {
                    return function() {
                        var args = Array.prototype.slice.call(arguments);
                        args[1] *= factor;
                        args[2] *= factor;
                        this.font = this.font.replace(/(\d+)(px|em|rem|pt)/g, function(dataAndEvents, change, begin) {
                            return change * factor + begin;
                        });
                        wrapper.apply(this, args);
                        this.font = this.font.replace(/(\d+)(px|em|rem|pt)/g, function(deepDataAndEvents, x, dataAndEvents) {
                            return x / factor + dataAndEvents;
                        });
                    };
                }(properties.fillText);
                properties.strokeText = function(wrapper) {
                    return function() {
                        var args = Array.prototype.slice.call(arguments);
                        args[1] *= factor;
                        args[2] *= factor;
                        this.font = this.font.replace(/(\d+)(px|em|rem|pt)/g, function(dataAndEvents, change, begin) {
                            return change * factor + begin;
                        });
                        wrapper.apply(this, args);
                        this.font = this.font.replace(/(\d+)(px|em|rem|pt)/g, function(deepDataAndEvents, x, dataAndEvents) {
                            return x / factor + dataAndEvents;
                        });
                    };
                }(properties.strokeText);
            })(CanvasRenderingContext2D.prototype);
            (function(oCanvas) {
                oCanvas.getContext = function(next_callback) {
                    return function(protoProps) {
                        var child = next_callback.call(this, protoProps);
                        if ("2d" === protoProps) {
                            if (this.width != Math.floor(parseInt(this.style.width) * factor)) {
                                this.style.height = this.height + "px";
                                this.style.width = this.width + "px";
                                this.width *= factor;
                                this.height *= factor;
                            }
                        }
                        return child;
                    };
                }(oCanvas.getContext);
            })(HTMLCanvasElement.prototype);
        }
    }
})(window);