; (function (window, document, undefined) {
    //#region dom方法
    var dom = {
        on: function (node, eventName, handler) {
            if (node.addEventListener) {
                node.addEventListener(eventName, handler);
            }
            else {
                node.attachEvent("on" + eventName, handler);
            }
            return this;
        },
        off: function (node, eventName, handler) {
            if (node.removeEventListener) {
                node.removeEventListener(eventName, handler);
            }
            else {
                node.detachEvent("on" + eventName, handler);
            }
            return this;
        },
        getStyle: function (node, styleName) {
            var realStyle = null;
            if (window.getComputedStyle) {
                realStyle = window.getComputedStyle(node, null)[styleName];
            }
            else if (node.currentStyle) {
                realStyle = node.currentStyle[styleName];
            }
            return realStyle;
        },
        setCss: function (node, css) {
            for (var key in css) {
                node.style[key] = css[key];
            }
            return this;
        },
        /*
         * @description 获取指定选择器的祖先元素         
         */
        parent: function (e, selector) {
            if (selector) {
                while (e != null) {
                    e = e.parentNode;
                    if (dom.selectorMatch(e, selector)) {
                        return e;
                    }
                }
            }
            else {
                return e.parentElement;
            }
        },
        position: function (e, untilParent) {
            var x = 0, y = 0;
            if (untilParent) {
                while (e != null && e != untilParent) {
                    x += e.offsetLeft;
                    y += e.offsetTop;
                    e = e.offsetParent;
                }
            }
            else {
                x = e.offsetLeft;
                y = e.offsetTop;
            }
            return { left: x, top: y };
        },
        selectorMatch: function (ele, selector) {
            var p = Element.prototype;
            var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };
            return f.call(ele, selector);
        }
    };
    //#endregion

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (context) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () { },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                                           ? this
                                           : context || this,
                                         aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    var body = document.body;

    var originBodyStyle = body.style;
    var forbitSelect = function (node) {
        node.onselectstart = function (event) {
            return false;
        }
        node.style = "-moz-user-select:none;" + originBodyStyle;
    }

    var allowSelect = function (node) {
        node.onselectstart = null;
        node.style = originBodyStyle;
    }

    var dragStyle = {
        dragging: {
            cursor: "move"
        },
        defaults: {
            cursor: "default"
        }
    }


    //#region 拖拽元素类

    /*
     * 拖拽元素
     * @constructor
     * @/// <param name="node" type="HTMLElement">被拖拽的元素</param>
     */
    function DragTarget(node, opt) {
        this.target = node;
        this.opt = opt || {};
        this.validElement = node.querySelector(this.opt.validSelector) || node;
        this.parentElement = dom.parent(this.target, this.opt.parentSelecotr) || body;

        this.mouseX = 0;
        this.mouseY = 0;

        this.targetWidth = this.target.offsetWidth;
        this.targetHeight = this.target.offsetHeight;

        this.start = this.start.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);

        this.init();
    }
    DragTarget.prototype = {
        constructor: DragTarget,
        init: function () {
            dom.setCss(this.validElement, dragStyle.dragging)
                .setCss(this.parentElement, { "position": "relative" });
            dom.on(this.validElement, "mousedown", this.start)
                .on(document, "mouseup", this.end);
            forbitSelect(this.validElement);
        },
        start: function (event) {
            this.dragging = true;
            this.setMouseXY(event.clientX, event.clientY);

            var position = dom.position(this.target, this.parentElement);
            this.setXY(position.left, position.top)
                .setTargetCss({
                    "zIndex": config.zIndex++,
                    "position": "absolute"
                });

            this.parentWidth = this.parentElement.scrollWidth || this.parentElement.clientWidth;
            this.parentHeight = this.parentElement.scrollHeight || this.parentElement.clientHeight;
            if (!this.opt.parentSelecotr) {
                this.parentHeight = Math.max(this.parentHeight, window.innerHeight);
            }

            dom.on(document, "mousemove", this.move);
            forbitSelect(body);

        },
        move: function () {
            if (this.dragging) {
                var left = parseInt(event.clientX - this.mouseX + this.x);
                var top = parseInt(event.clientY - this.mouseY + this.y);

                left = Math.min(Math.max(0, left), this.parentWidth - this.targetWidth);
                top = Math.min(Math.max(0, top), this.parentHeight - this.targetHeight);
                this.setTargetCss({
                    "left": left + "px",
                    "top": top + "px"
                });

                var move = this.move;
                dom.off(document, "mousemove", move);
                setTimeout(function () {
                    dom.on(document, "mousemove", move);
                }, 30);
            }
        },
        end: function (event) {
            this.dragging = false;
            allowSelect(body);

        },
        setXY: function (x, y) {
            x = parseInt(x) || 0;
            y = parseInt(y) || 0;

            this.x = Math.max(0, x);
            this.y = Math.max(0, y);
            return this;
        },
        setTargetCss: function (css) {
            dom.setCss(this.target, css);
            return this;
        },
        setMouseXY: function (x, y) {
            this.mouseX = parseInt(x);
            this.mouseY = parseInt(y);
        }
    }
    //#endregion


    //拖拽配置
    var config = {
        zIndex: 1
    };

    function drag(ele, opt) {
        new DragTarget(ele, opt)
    }

    window.drag = drag;
})(window, document);