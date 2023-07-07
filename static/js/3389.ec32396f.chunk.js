(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[3389,2697],{26910:function(e,t,r){"use strict";function o(e){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r(72791),i=u(r(52007)),a=u(r(12697)),c=u(r(90375)),s=u(r(62553)),l=["animationDuration","aspectRatio","color","cover","disableError","disableSpinner","disableTransition","errorIcon","iconContainerStyle","imageStyle","loading","onClick","style"];function u(e){return e&&e.__esModule?e:{default:e}}function f(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},i=Object.keys(e);for(o=0;o<i.length;o++)r=i[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)r=i[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach((function(t){Z(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function m(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function v(e,t){return v=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},v(e,t)}function h(e){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,o=g(e);if(t){var n=g(this).constructor;r=Reflect.construct(o,arguments,n)}else r=o.apply(this,arguments);return y(this,r)}}function y(e,t){if(t&&("object"===o(t)||"function"===typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return b(e)}function b(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function g(e){return g=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},g(e)}function Z(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function O(){return O=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e},O.apply(this,arguments)}var S=function(e){!function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&v(e,t)}(a,e);var t,r,o,i=h(a);function a(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),Z(b(t=i.call(this,e)),"handleLoadImage",(function(e){t.setState({imageLoaded:!0,imageError:!1}),t.props.onLoad&&t.props.onLoad(e)})),Z(b(t),"handleImageError",(function(e){t.props.src&&(t.setState({imageError:!0}),t.props.onError&&t.props.onError(e))})),t.state={imageError:!1,imageLoaded:!1,src:t.props.src},t.image=(0,n.createRef)(),t}return t=a,o=[{key:"getDerivedStateFromProps",value:function(e,t){return t.src!==e.src?{imageError:!1,imageLoaded:!1,src:e.src}:null}}],(r=[{key:"componentDidMount",value:function(){var e=this.image.current;e&&e.complete&&(0===e.naturalWidth?this.handleImageError():this.handleLoadImage())}},{key:"getStyles",value:function(){var e=this.props,t=e.animationDuration,r=e.aspectRatio,o=e.cover,n=e.color,i=e.imageStyle,a=e.disableTransition,c=e.iconContainerStyle,s=e.style,l=!a&&{opacity:this.state.imageLoaded?1:0,filterBrightness:this.state.imageLoaded?100:0,filterSaturate:this.state.imageLoaded?100:20,transition:"\n        filterBrightness ".concat(.75*t,"ms cubic-bezier(0.4, 0.0, 0.2, 1),\n        filterSaturate ").concat(t,"ms cubic-bezier(0.4, 0.0, 0.2, 1),\n        opacity ").concat(t/2,"ms cubic-bezier(0.4, 0.0, 0.2, 1)")};return{root:p({backgroundColor:n,paddingTop:"calc(1 / ".concat(r," * 100%)"),position:"relative"},s),image:p(p({width:"100%",height:"100%",position:"absolute",objectFit:o?"cover":"inherit",top:0,left:0},l),i),iconContainer:p({width:"100%",height:"100%",position:"absolute",top:0,left:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"},c)}}},{key:"render",value:function(){var e=this.getStyles(),t=this.props,r=(t.animationDuration,t.aspectRatio,t.color,t.cover,t.disableError),o=t.disableSpinner,i=(t.disableTransition,t.errorIcon),a=(t.iconContainerStyle,t.imageStyle,t.loading),c=t.onClick,s=(t.style,f(t,l));return(0,n.createElement)("div",{style:e.root,onClick:c},s.src&&(0,n.createElement)("img",O({},s,{ref:this.image,style:e.image,onLoad:this.handleLoadImage,onError:this.handleImageError})),(0,n.createElement)("div",{style:e.iconContainer},!o&&!this.state.imageLoaded&&!this.state.imageError&&a,!r&&this.state.imageError&&i))}}])&&m(t.prototype,r),o&&m(t,o),Object.defineProperty(t,"prototype",{writable:!1}),a}(n.Component);t.default=S,S.defaultProps={animationDuration:3e3,aspectRatio:1,color:c.default.white,disableError:!1,disableSpinner:!1,disableTransition:!1,errorIcon:(0,n.createElement)(s.default,{style:{width:48,height:48,color:"#e0e0e0"}}),loading:(0,n.createElement)(a.default,{size:48})},S.propTypes={animationDuration:i.default.number,aspectRatio:i.default.number,cover:i.default.bool,color:i.default.string,disableError:i.default.bool,disableSpinner:i.default.bool,disableTransition:i.default.bool,errorIcon:i.default.node,iconContainerStyle:i.default.object,imageStyle:i.default.object,loading:i.default.node,onClick:i.default.func,onError:i.default.func,onLoad:i.default.func,src:i.default.string.isRequired,style:i.default.object}},49588:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return n.default}});var o,n=(o=r(26910))&&o.__esModule?o:{default:o}},62606:function(e,t,r){"use strict";var o;t.Z=void 0;var n=((o=r(49588))&&o.__esModule?o:{default:o}).default;t.Z=n},62553:function(e,t,r){"use strict";var o=r(64836);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=o(r(45649)),i=r(80184),a=(0,n.default)((0,i.jsx)("path",{d:"M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42 3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"}),"BrokenImage");t.default=a},57621:function(e,t,r){"use strict";r.d(t,{Z:function(){return y}});var o=r(87462),n=r(63366),i=r(72791),a=r(28182),c=r(94419),s=r(66934),l=r(93736),u=r(35527),f=r(75878),d=r(21217);function p(e){return(0,d.Z)("MuiCard",e)}(0,f.Z)("MuiCard",["root"]);var m=r(80184),v=["className","raised"],h=(0,s.ZP)(u.Z,{name:"MuiCard",slot:"Root",overridesResolver:function(e,t){return t.root}})((function(){return{overflow:"hidden"}})),y=i.forwardRef((function(e,t){var r=(0,l.Z)({props:e,name:"MuiCard"}),i=r.className,s=r.raised,u=void 0!==s&&s,f=(0,n.Z)(r,v),d=(0,o.Z)({},r,{raised:u}),y=function(e){var t=e.classes;return(0,c.Z)({root:["root"]},p,t)}(d);return(0,m.jsx)(h,(0,o.Z)({className:(0,a.Z)(y.root,i),elevation:u?8:void 0,ref:t,ownerState:d},f))}))},66647:function(e,t,r){"use strict";r.d(t,{Z:function(){return Z}});var o=r(4942),n=r(87462),i=r(63366),a=r(72791),c=r(28182),s=r(94419),l=r(93736),u=r(66934),f=r(75878),d=r(21217);function p(e){return(0,d.Z)("MuiCardActionArea",e)}var m=(0,f.Z)("MuiCardActionArea",["root","focusVisible","focusHighlight"]),v=r(23701),h=r(80184),y=["children","className","focusVisibleClassName"],b=(0,u.ZP)(v.Z,{name:"MuiCardActionArea",slot:"Root",overridesResolver:function(e,t){return t.root}})((function(e){var t,r=e.theme;return t={display:"block",textAlign:"inherit",borderRadius:"inherit",width:"100%"},(0,o.Z)(t,"&:hover .".concat(m.focusHighlight),{opacity:(r.vars||r).palette.action.hoverOpacity,"@media (hover: none)":{opacity:0}}),(0,o.Z)(t,"&.".concat(m.focusVisible," .").concat(m.focusHighlight),{opacity:(r.vars||r).palette.action.focusOpacity}),t})),g=(0,u.ZP)("span",{name:"MuiCardActionArea",slot:"FocusHighlight",overridesResolver:function(e,t){return t.focusHighlight}})((function(e){var t=e.theme;return{overflow:"hidden",pointerEvents:"none",position:"absolute",top:0,right:0,bottom:0,left:0,borderRadius:"inherit",opacity:0,backgroundColor:"currentcolor",transition:t.transitions.create("opacity",{duration:t.transitions.duration.short})}})),Z=a.forwardRef((function(e,t){var r=(0,l.Z)({props:e,name:"MuiCardActionArea"}),o=r.children,a=r.className,u=r.focusVisibleClassName,f=(0,i.Z)(r,y),d=r,m=function(e){var t=e.classes;return(0,s.Z)({root:["root"],focusHighlight:["focusHighlight"]},p,t)}(d);return(0,h.jsxs)(b,(0,n.Z)({className:(0,c.Z)(m.root,a),focusVisibleClassName:(0,c.Z)(u,m.focusVisible),ref:t,ownerState:d},f,{children:[o,(0,h.jsx)(g,{className:m.focusHighlight,ownerState:d})]}))}))},42169:function(e,t,r){"use strict";r.d(t,{Z:function(){return b}});var o=r(63366),n=r(87462),i=r(72791),a=r(28182),c=r(94419),s=r(93736),l=r(66934),u=r(75878),f=r(21217);function d(e){return(0,f.Z)("MuiCardMedia",e)}(0,u.Z)("MuiCardMedia",["root","media","img"]);var p=r(80184),m=["children","className","component","image","src","style"],v=(0,l.ZP)("div",{name:"MuiCardMedia",slot:"Root",overridesResolver:function(e,t){var r=e.ownerState,o=r.isMediaComponent,n=r.isImageComponent;return[t.root,o&&t.media,n&&t.img]}})((function(e){var t=e.ownerState;return(0,n.Z)({display:"block",backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center"},t.isMediaComponent&&{width:"100%"},t.isImageComponent&&{objectFit:"cover"})})),h=["video","audio","picture","iframe","img"],y=["picture","img"],b=i.forwardRef((function(e,t){var r=(0,s.Z)({props:e,name:"MuiCardMedia"}),i=r.children,l=r.className,u=r.component,f=void 0===u?"div":u,b=r.image,g=r.src,Z=r.style,O=(0,o.Z)(r,m),S=-1!==h.indexOf(f),C=!S&&b?(0,n.Z)({backgroundImage:'url("'.concat(b,'")')},Z):Z,w=(0,n.Z)({},r,{component:f,isMediaComponent:S,isImageComponent:-1!==y.indexOf(f)}),k=function(e){var t=e.classes,r={root:["root",e.isMediaComponent&&"media",e.isImageComponent&&"img"]};return(0,c.Z)(r,d,t)}(w);return(0,p.jsx)(v,(0,n.Z)({className:(0,a.Z)(k.root,l),as:f,role:!S&&b?"img":void 0,ref:t,style:C,ownerState:w,src:S?b||g:void 0},O,{children:i}))}))},71554:function(e,t,r){"use strict";var o,n,i,a,c,s,l,u,f=r(30168),d=r(63366),p=r(87462),m=r(72791),v=r(28182),h=r(94419),y=r(52554),b=r(14036),g=r(93736),Z=r(66934),O=r(26624),S=r(80184),C=["className","color","disableShrink","size","style","thickness","value","variant"],w=44,k=(0,y.F4)(c||(c=o||(o=(0,f.Z)(["\n  0% {\n    transform: rotate(0deg);\n  }\n\n  100% {\n    transform: rotate(360deg);\n  }\n"])))),P=(0,y.F4)(s||(s=n||(n=(0,f.Z)(["\n  0% {\n    stroke-dasharray: 1px, 200px;\n    stroke-dashoffset: 0;\n  }\n\n  50% {\n    stroke-dasharray: 100px, 200px;\n    stroke-dashoffset: -15px;\n  }\n\n  100% {\n    stroke-dasharray: 100px, 200px;\n    stroke-dashoffset: -125px;\n  }\n"])))),j=(0,Z.ZP)("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:function(e,t){var r=e.ownerState;return[t.root,t[r.variant],t["color".concat((0,b.Z)(r.color))]]}})((function(e){var t=e.ownerState,r=e.theme;return(0,p.Z)({display:"inline-block"},"determinate"===t.variant&&{transition:r.transitions.create("transform")},"inherit"!==t.color&&{color:(r.vars||r).palette[t.color].main})}),(function(e){return"indeterminate"===e.ownerState.variant&&(0,y.iv)(l||(l=i||(i=(0,f.Z)(["\n      animation: "," 1.4s linear infinite;\n    "]))),k)})),M=(0,Z.ZP)("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:function(e,t){return t.svg}})({display:"block"}),E=(0,Z.ZP)("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:function(e,t){var r=e.ownerState;return[t.circle,t["circle".concat((0,b.Z)(r.variant))],r.disableShrink&&t.circleDisableShrink]}})((function(e){var t=e.ownerState,r=e.theme;return(0,p.Z)({stroke:"currentColor"},"determinate"===t.variant&&{transition:r.transitions.create("stroke-dashoffset")},"indeterminate"===t.variant&&{strokeDasharray:"80px, 200px",strokeDashoffset:0})}),(function(e){var t=e.ownerState;return"indeterminate"===t.variant&&!t.disableShrink&&(0,y.iv)(u||(u=a||(a=(0,f.Z)(["\n      animation: "," 1.4s ease-in-out infinite;\n    "]))),P)})),R=m.forwardRef((function(e,t){var r=(0,g.Z)({props:e,name:"MuiCircularProgress"}),o=r.className,n=r.color,i=void 0===n?"primary":n,a=r.disableShrink,c=void 0!==a&&a,s=r.size,l=void 0===s?40:s,u=r.style,f=r.thickness,m=void 0===f?3.6:f,y=r.value,Z=void 0===y?0:y,k=r.variant,P=void 0===k?"indeterminate":k,R=(0,d.Z)(r,C),x=(0,p.Z)({},r,{color:i,disableShrink:c,size:l,thickness:m,value:Z,variant:P}),_=function(e){var t=e.classes,r=e.variant,o=e.color,n=e.disableShrink,i={root:["root",r,"color".concat((0,b.Z)(o))],svg:["svg"],circle:["circle","circle".concat((0,b.Z)(r)),n&&"circleDisableShrink"]};return(0,h.Z)(i,O.C,t)}(x),I={},D={},T={};if("determinate"===P){var N=2*Math.PI*((w-m)/2);I.strokeDasharray=N.toFixed(3),T["aria-valuenow"]=Math.round(Z),I.strokeDashoffset="".concat(((100-Z)/100*N).toFixed(3),"px"),D.transform="rotate(-90deg)"}return(0,S.jsx)(j,(0,p.Z)({className:(0,v.Z)(_.root,o),style:(0,p.Z)({width:l,height:l},D,u),ownerState:x,ref:t,role:"progressbar"},T,R,{children:(0,S.jsx)(M,{className:_.svg,ownerState:x,viewBox:"".concat(22," ").concat(22," ").concat(w," ").concat(w),children:(0,S.jsx)(E,{className:_.circle,style:I,ownerState:x,cx:w,cy:w,r:(w-m)/2,fill:"none",strokeWidth:m})})}))}));t.Z=R},26624:function(e,t,r){"use strict";r.d(t,{C:function(){return i}});var o=r(75878),n=r(21217);function i(e){return(0,n.Z)("MuiCircularProgress",e)}var a=(0,o.Z)("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);t.Z=a},12697:function(e,t,r){"use strict";r.r(t),r.d(t,{circularProgressClasses:function(){return n.Z},default:function(){return o.Z},getCircularProgressUtilityClass:function(){return n.C}});var o=r(71554),n=r(26624)},80888:function(e,t,r){"use strict";var o=r(79047);function n(){}function i(){}i.resetWarningCache=n,e.exports=function(){function e(e,t,r,n,i,a){if(a!==o){var c=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw c.name="Invariant Violation",c}}function t(){return e}e.isRequired=e;var r={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:i,resetWarningCache:n};return r.PropTypes=r,r}},52007:function(e,t,r){e.exports=r(80888)()},79047:function(e){"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"}}]);
//# sourceMappingURL=3389.ec32396f.chunk.js.map