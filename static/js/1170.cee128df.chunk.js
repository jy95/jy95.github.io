"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[1170],{93840:function(e,t,n){var r=n(72791).createContext(void 0);t.Z=r},52930:function(e,t,n){n.d(t,{Z:function(){return i}});var r=n(72791),o=n(93840);function i(){return r.useContext(o.Z)}},6199:function(e,t,n){n.d(t,{Z:function(){return p}});var r=n(87462),o=(n(72791),n(52554)),i=n(80184);function a(e){var t=e.styles,n=e.defaultTheme,r=void 0===n?{}:n,a="function"===typeof t?function(e){return t(void 0===(n=e)||null===n||0===Object.keys(n).length?r:e);var n}:t;return(0,i.jsx)(o.xB,{styles:a})}var s=n(30418);var f=function(e){var t=e.styles,n=e.themeId,r=e.defaultTheme,o=void 0===r?{}:r,f=(0,s.Z)(o),c="function"===typeof t?t(n&&f[n]||f):t;return(0,i.jsx)(a,{styles:c})},c=n(36482),u=n(988);var p=function(e){return(0,i.jsx)(f,(0,r.Z)({},e,{defaultTheme:c.Z,themeId:u.Z}))}},13208:function(e,t,n){var r=n(87462),o=n(63366),i=n(72791),a=n(26752),s=n(13967),f=n(4999),c=n(42071),u=n(80184),p=["addEndListener","appear","children","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","style","timeout","TransitionComponent"];function l(e){return"scale(".concat(e,", ").concat(Math.pow(e,2),")")}var d={entering:{opacity:1,transform:l(1)},entered:{opacity:1,transform:"none"}},m="undefined"!==typeof navigator&&/^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent)&&/(os |version\/)15(.|_)4/i.test(navigator.userAgent),v=i.forwardRef((function(e,t){var n=e.addEndListener,v=e.appear,h=void 0===v||v,y=e.children,g=e.easing,b=e.in,x=e.onEnter,w=e.onEntered,O=e.onEntering,E=e.onExit,P=e.onExited,j=e.onExiting,Z=e.style,R=e.timeout,A=void 0===R?"auto":R,D=e.TransitionComponent,T=void 0===D?a.ZP:D,k=(0,o.Z)(e,p),M=i.useRef(),L=i.useRef(),H=(0,s.Z)(),W=i.useRef(null),B=(0,c.Z)(W,y.ref,t),S=function(e){return function(t){if(e){var n=W.current;void 0===t?e(n):e(n,t)}}},C=S(O),V=S((function(e,t){(0,f.n)(e);var n,r=(0,f.C)({style:Z,timeout:A,easing:g},{mode:"enter"}),o=r.duration,i=r.delay,a=r.easing;"auto"===A?(n=H.transitions.getAutoHeightDuration(e.clientHeight),L.current=n):n=o,e.style.transition=[H.transitions.create("opacity",{duration:n,delay:i}),H.transitions.create("transform",{duration:m?n:.666*n,delay:i,easing:a})].join(","),x&&x(e,t)})),q=S(w),I=S(j),N=S((function(e){var t,n=(0,f.C)({style:Z,timeout:A,easing:g},{mode:"exit"}),r=n.duration,o=n.delay,i=n.easing;"auto"===A?(t=H.transitions.getAutoHeightDuration(e.clientHeight),L.current=t):t=r,e.style.transition=[H.transitions.create("opacity",{duration:t,delay:o}),H.transitions.create("transform",{duration:m?t:.666*t,delay:m?o:o||.333*t,easing:i})].join(","),e.style.opacity=0,e.style.transform=l(.75),E&&E(e)})),_=S(P);return i.useEffect((function(){return function(){clearTimeout(M.current)}}),[]),(0,u.jsx)(T,(0,r.Z)({appear:h,in:b,nodeRef:W,onEnter:V,onEntered:q,onEntering:C,onExit:N,onExited:_,onExiting:I,addEndListener:function(e){"auto"===A&&(M.current=setTimeout(e,L.current||0)),n&&n(W.current,e)},timeout:"auto"===A?null:A},k,{children:function(e,t){return i.cloneElement(y,(0,r.Z)({style:(0,r.Z)({opacity:0,transform:l(.75),visibility:"exited"!==e||b?void 0:"hidden"},d[e],Z,y.props.style),ref:B},t))}}))}));v.muiSupportAuto=!0,t.Z=v},68610:function(e,t,n){n.d(t,{Z:function(){return Ne}});var r=n(87462),o=n(63366),i=n(29439),a=n(72791),s=n(47563),f=n(75721),c=n(99723);function u(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function p(e){return e instanceof u(e).Element||e instanceof Element}function l(e){return e instanceof u(e).HTMLElement||e instanceof HTMLElement}function d(e){return"undefined"!==typeof ShadowRoot&&(e instanceof u(e).ShadowRoot||e instanceof ShadowRoot)}var m=Math.max,v=Math.min,h=Math.round;function y(){var e=navigator.userAgentData;return null!=e&&e.brands&&Array.isArray(e.brands)?e.brands.map((function(e){return e.brand+"/"+e.version})).join(" "):navigator.userAgent}function g(){return!/^((?!chrome|android).)*safari/i.test(y())}function b(e,t,n){void 0===t&&(t=!1),void 0===n&&(n=!1);var r=e.getBoundingClientRect(),o=1,i=1;t&&l(e)&&(o=e.offsetWidth>0&&h(r.width)/e.offsetWidth||1,i=e.offsetHeight>0&&h(r.height)/e.offsetHeight||1);var a=(p(e)?u(e):window).visualViewport,s=!g()&&n,f=(r.left+(s&&a?a.offsetLeft:0))/o,c=(r.top+(s&&a?a.offsetTop:0))/i,d=r.width/o,m=r.height/i;return{width:d,height:m,top:c,right:f+d,bottom:c+m,left:f,x:f,y:c}}function x(e){var t=u(e);return{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function w(e){return e?(e.nodeName||"").toLowerCase():null}function O(e){return((p(e)?e.ownerDocument:e.document)||window.document).documentElement}function E(e){return b(O(e)).left+x(e).scrollLeft}function P(e){return u(e).getComputedStyle(e)}function j(e){var t=P(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function Z(e,t,n){void 0===n&&(n=!1);var r=l(t),o=l(t)&&function(e){var t=e.getBoundingClientRect(),n=h(t.width)/e.offsetWidth||1,r=h(t.height)/e.offsetHeight||1;return 1!==n||1!==r}(t),i=O(t),a=b(e,o,n),s={scrollLeft:0,scrollTop:0},f={x:0,y:0};return(r||!r&&!n)&&(("body"!==w(t)||j(i))&&(s=function(e){return e!==u(e)&&l(e)?{scrollLeft:(t=e).scrollLeft,scrollTop:t.scrollTop}:x(e);var t}(t)),l(t)?((f=b(t,!0)).x+=t.clientLeft,f.y+=t.clientTop):i&&(f.x=E(i))),{x:a.left+s.scrollLeft-f.x,y:a.top+s.scrollTop-f.y,width:a.width,height:a.height}}function R(e){var t=b(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function A(e){return"html"===w(e)?e:e.assignedSlot||e.parentNode||(d(e)?e.host:null)||O(e)}function D(e){return["html","body","#document"].indexOf(w(e))>=0?e.ownerDocument.body:l(e)&&j(e)?e:D(A(e))}function T(e,t){var n;void 0===t&&(t=[]);var r=D(e),o=r===(null==(n=e.ownerDocument)?void 0:n.body),i=u(r),a=o?[i].concat(i.visualViewport||[],j(r)?r:[]):r,s=t.concat(a);return o?s:s.concat(T(A(a)))}function k(e){return["table","td","th"].indexOf(w(e))>=0}function M(e){return l(e)&&"fixed"!==P(e).position?e.offsetParent:null}function L(e){for(var t=u(e),n=M(e);n&&k(n)&&"static"===P(n).position;)n=M(n);return n&&("html"===w(n)||"body"===w(n)&&"static"===P(n).position)?t:n||function(e){var t=/firefox/i.test(y());if(/Trident/i.test(y())&&l(e)&&"fixed"===P(e).position)return null;var n=A(e);for(d(n)&&(n=n.host);l(n)&&["html","body"].indexOf(w(n))<0;){var r=P(n);if("none"!==r.transform||"none"!==r.perspective||"paint"===r.contain||-1!==["transform","perspective"].indexOf(r.willChange)||t&&"filter"===r.willChange||t&&r.filter&&"none"!==r.filter)return n;n=n.parentNode}return null}(e)||t}var H="top",W="bottom",B="right",S="left",C="auto",V=[H,W,B,S],q="start",I="end",N="viewport",_="popper",U=V.reduce((function(e,t){return e.concat([t+"-"+q,t+"-"+I])}),[]),F=[].concat(V,[C]).reduce((function(e,t){return e.concat([t,t+"-"+q,t+"-"+I])}),[]),z=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function X(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}function Y(e){var t;return function(){return t||(t=new Promise((function(n){Promise.resolve().then((function(){t=void 0,n(e())}))}))),t}}var G={placement:"bottom",modifiers:[],strategy:"absolute"};function J(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"===typeof e.getBoundingClientRect)}))}function K(e){void 0===e&&(e={});var t=e,n=t.defaultModifiers,r=void 0===n?[]:n,o=t.defaultOptions,i=void 0===o?G:o;return function(e,t,n){void 0===n&&(n=i);var o={placement:"bottom",orderedModifiers:[],options:Object.assign({},G,i),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},a=[],s=!1,f={state:o,setOptions:function(n){var s="function"===typeof n?n(o.options):n;c(),o.options=Object.assign({},i,o.options,s),o.scrollParents={reference:p(e)?T(e):e.contextElement?T(e.contextElement):[],popper:T(t)};var u=function(e){var t=X(e);return z.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}(function(e){var t=e.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{});return Object.keys(t).map((function(e){return t[e]}))}([].concat(r,o.options.modifiers)));return o.orderedModifiers=u.filter((function(e){return e.enabled})),o.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,i=e.effect;if("function"===typeof i){var s=i({state:o,name:t,instance:f,options:r}),c=function(){};a.push(s||c)}})),f.update()},forceUpdate:function(){if(!s){var e=o.elements,t=e.reference,n=e.popper;if(J(t,n)){o.rects={reference:Z(t,L(n),"fixed"===o.options.strategy),popper:R(n)},o.reset=!1,o.placement=o.options.placement,o.orderedModifiers.forEach((function(e){return o.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<o.orderedModifiers.length;r++)if(!0!==o.reset){var i=o.orderedModifiers[r],a=i.fn,c=i.options,u=void 0===c?{}:c,p=i.name;"function"===typeof a&&(o=a({state:o,options:u,name:p,instance:f})||o)}else o.reset=!1,r=-1}}},update:Y((function(){return new Promise((function(e){f.forceUpdate(),e(o)}))})),destroy:function(){c(),s=!0}};if(!J(e,t))return f;function c(){a.forEach((function(e){return e()})),a=[]}return f.setOptions(n).then((function(e){!s&&n.onFirstUpdate&&n.onFirstUpdate(e)})),f}}var Q={passive:!0};function $(e){return e.split("-")[0]}function ee(e){return e.split("-")[1]}function te(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function ne(e){var t,n=e.reference,r=e.element,o=e.placement,i=o?$(o):null,a=o?ee(o):null,s=n.x+n.width/2-r.width/2,f=n.y+n.height/2-r.height/2;switch(i){case H:t={x:s,y:n.y-r.height};break;case W:t={x:s,y:n.y+n.height};break;case B:t={x:n.x+n.width,y:f};break;case S:t={x:n.x-r.width,y:f};break;default:t={x:n.x,y:n.y}}var c=i?te(i):null;if(null!=c){var u="y"===c?"height":"width";switch(a){case q:t[c]=t[c]-(n[u]/2-r[u]/2);break;case I:t[c]=t[c]+(n[u]/2-r[u]/2)}}return t}var re={top:"auto",right:"auto",bottom:"auto",left:"auto"};function oe(e){var t,n=e.popper,r=e.popperRect,o=e.placement,i=e.variation,a=e.offsets,s=e.position,f=e.gpuAcceleration,c=e.adaptive,p=e.roundOffsets,l=e.isFixed,d=a.x,m=void 0===d?0:d,v=a.y,y=void 0===v?0:v,g="function"===typeof p?p({x:m,y:y}):{x:m,y:y};m=g.x,y=g.y;var b=a.hasOwnProperty("x"),x=a.hasOwnProperty("y"),w=S,E=H,j=window;if(c){var Z=L(n),R="clientHeight",A="clientWidth";if(Z===u(n)&&"static"!==P(Z=O(n)).position&&"absolute"===s&&(R="scrollHeight",A="scrollWidth"),o===H||(o===S||o===B)&&i===I)E=W,y-=(l&&Z===j&&j.visualViewport?j.visualViewport.height:Z[R])-r.height,y*=f?1:-1;if(o===S||(o===H||o===W)&&i===I)w=B,m-=(l&&Z===j&&j.visualViewport?j.visualViewport.width:Z[A])-r.width,m*=f?1:-1}var D,T=Object.assign({position:s},c&&re),k=!0===p?function(e,t){var n=e.x,r=e.y,o=t.devicePixelRatio||1;return{x:h(n*o)/o||0,y:h(r*o)/o||0}}({x:m,y:y},u(n)):{x:m,y:y};return m=k.x,y=k.y,f?Object.assign({},T,((D={})[E]=x?"0":"",D[w]=b?"0":"",D.transform=(j.devicePixelRatio||1)<=1?"translate("+m+"px, "+y+"px)":"translate3d("+m+"px, "+y+"px, 0)",D)):Object.assign({},T,((t={})[E]=x?y+"px":"",t[w]=b?m+"px":"",t.transform="",t))}var ie={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=void 0===o?[0,0]:o,a=F.reduce((function(e,n){return e[n]=function(e,t,n){var r=$(e),o=[S,H].indexOf(r)>=0?-1:1,i="function"===typeof n?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[S,B].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}(n,t.rects,i),e}),{}),s=a[t.placement],f=s.x,c=s.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=f,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=a}},ae={left:"right",right:"left",bottom:"top",top:"bottom"};function se(e){return e.replace(/left|right|bottom|top/g,(function(e){return ae[e]}))}var fe={start:"end",end:"start"};function ce(e){return e.replace(/start|end/g,(function(e){return fe[e]}))}function ue(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&d(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function pe(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function le(e,t,n){return t===N?pe(function(e,t){var n=u(e),r=O(e),o=n.visualViewport,i=r.clientWidth,a=r.clientHeight,s=0,f=0;if(o){i=o.width,a=o.height;var c=g();(c||!c&&"fixed"===t)&&(s=o.offsetLeft,f=o.offsetTop)}return{width:i,height:a,x:s+E(e),y:f}}(e,n)):p(t)?function(e,t){var n=b(e,!1,"fixed"===t);return n.top=n.top+e.clientTop,n.left=n.left+e.clientLeft,n.bottom=n.top+e.clientHeight,n.right=n.left+e.clientWidth,n.width=e.clientWidth,n.height=e.clientHeight,n.x=n.left,n.y=n.top,n}(t,n):pe(function(e){var t,n=O(e),r=x(e),o=null==(t=e.ownerDocument)?void 0:t.body,i=m(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),a=m(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),s=-r.scrollLeft+E(e),f=-r.scrollTop;return"rtl"===P(o||n).direction&&(s+=m(n.clientWidth,o?o.clientWidth:0)-i),{width:i,height:a,x:s,y:f}}(O(e)))}function de(e,t,n,r){var o="clippingParents"===t?function(e){var t=T(A(e)),n=["absolute","fixed"].indexOf(P(e).position)>=0&&l(e)?L(e):e;return p(n)?t.filter((function(e){return p(e)&&ue(e,n)&&"body"!==w(e)})):[]}(e):[].concat(t),i=[].concat(o,[n]),a=i[0],s=i.reduce((function(t,n){var o=le(e,n,r);return t.top=m(o.top,t.top),t.right=v(o.right,t.right),t.bottom=v(o.bottom,t.bottom),t.left=m(o.left,t.left),t}),le(e,a,r));return s.width=s.right-s.left,s.height=s.bottom-s.top,s.x=s.left,s.y=s.top,s}function me(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}function ve(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}function he(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=void 0===r?e.placement:r,i=n.strategy,a=void 0===i?e.strategy:i,s=n.boundary,f=void 0===s?"clippingParents":s,c=n.rootBoundary,u=void 0===c?N:c,l=n.elementContext,d=void 0===l?_:l,m=n.altBoundary,v=void 0!==m&&m,h=n.padding,y=void 0===h?0:h,g=me("number"!==typeof y?y:ve(y,V)),x=d===_?"reference":_,w=e.rects.popper,E=e.elements[v?x:d],P=de(p(E)?E:E.contextElement||O(e.elements.popper),f,u,a),j=b(e.elements.reference),Z=ne({reference:j,element:w,strategy:"absolute",placement:o}),R=pe(Object.assign({},w,Z)),A=d===_?R:j,D={top:P.top-A.top+g.top,bottom:A.bottom-P.bottom+g.bottom,left:P.left-A.left+g.left,right:A.right-P.right+g.right},T=e.modifiersData.offset;if(d===_&&T){var k=T[o];Object.keys(D).forEach((function(e){var t=[B,W].indexOf(e)>=0?1:-1,n=[H,W].indexOf(e)>=0?"y":"x";D[e]+=k[n]*t}))}return D}function ye(e,t,n){return m(e,v(t,n))}var ge={name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0!==a&&a,f=n.boundary,c=n.rootBoundary,u=n.altBoundary,p=n.padding,l=n.tether,d=void 0===l||l,h=n.tetherOffset,y=void 0===h?0:h,g=he(t,{boundary:f,rootBoundary:c,padding:p,altBoundary:u}),b=$(t.placement),x=ee(t.placement),w=!x,O=te(b),E="x"===O?"y":"x",P=t.modifiersData.popperOffsets,j=t.rects.reference,Z=t.rects.popper,A="function"===typeof y?y(Object.assign({},t.rects,{placement:t.placement})):y,D="number"===typeof A?{mainAxis:A,altAxis:A}:Object.assign({mainAxis:0,altAxis:0},A),T=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,k={x:0,y:0};if(P){if(i){var M,C="y"===O?H:S,V="y"===O?W:B,I="y"===O?"height":"width",N=P[O],_=N+g[C],U=N-g[V],F=d?-Z[I]/2:0,z=x===q?j[I]:Z[I],X=x===q?-Z[I]:-j[I],Y=t.elements.arrow,G=d&&Y?R(Y):{width:0,height:0},J=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},K=J[C],Q=J[V],ne=ye(0,j[I],G[I]),re=w?j[I]/2-F-ne-K-D.mainAxis:z-ne-K-D.mainAxis,oe=w?-j[I]/2+F+ne+Q+D.mainAxis:X+ne+Q+D.mainAxis,ie=t.elements.arrow&&L(t.elements.arrow),ae=ie?"y"===O?ie.clientTop||0:ie.clientLeft||0:0,se=null!=(M=null==T?void 0:T[O])?M:0,fe=N+oe-se,ce=ye(d?v(_,N+re-se-ae):_,N,d?m(U,fe):U);P[O]=ce,k[O]=ce-N}if(s){var ue,pe="x"===O?H:S,le="x"===O?W:B,de=P[E],me="y"===E?"height":"width",ve=de+g[pe],ge=de-g[le],be=-1!==[H,S].indexOf(b),xe=null!=(ue=null==T?void 0:T[E])?ue:0,we=be?ve:de-j[me]-Z[me]-xe+D.altAxis,Oe=be?de+j[me]+Z[me]-xe-D.altAxis:ge,Ee=d&&be?function(e,t,n){var r=ye(e,t,n);return r>n?n:r}(we,de,Oe):ye(d?we:ve,de,d?Oe:ge);P[E]=Ee,k[E]=Ee-de}t.modifiersData[r]=k}},requiresIfExists:["offset"]};var be={name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=$(n.placement),f=te(s),c=[S,B].indexOf(s)>=0?"height":"width";if(i&&a){var u=function(e,t){return me("number"!==typeof(e="function"===typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e)?e:ve(e,V))}(o.padding,n),p=R(i),l="y"===f?H:S,d="y"===f?W:B,m=n.rects.reference[c]+n.rects.reference[f]-a[f]-n.rects.popper[c],v=a[f]-n.rects.reference[f],h=L(i),y=h?"y"===f?h.clientHeight||0:h.clientWidth||0:0,g=m/2-v/2,b=u[l],x=y-p[c]-u[d],w=y/2-p[c]/2+g,O=ye(b,w,x),E=f;n.modifiersData[r]=((t={})[E]=O,t.centerOffset=O-w,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!==typeof r||(r=t.elements.popper.querySelector(r)))&&ue(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function xe(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function we(e){return[H,B,W,S].some((function(t){return e[t]>=0}))}var Oe=K({defaultModifiers:[{name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var t=e.state,n=e.instance,r=e.options,o=r.scroll,i=void 0===o||o,a=r.resize,s=void 0===a||a,f=u(t.elements.popper),c=[].concat(t.scrollParents.reference,t.scrollParents.popper);return i&&c.forEach((function(e){e.addEventListener("scroll",n.update,Q)})),s&&f.addEventListener("resize",n.update,Q),function(){i&&c.forEach((function(e){e.removeEventListener("scroll",n.update,Q)})),s&&f.removeEventListener("resize",n.update,Q)}},data:{}},{name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=ne({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},{name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,f=void 0===s||s,c={placement:$(t.placement),variation:ee(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,oe(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:f})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,oe(Object.assign({},c,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:f})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}},{name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var n=t.styles[e]||{},r=t.attributes[e]||{},o=t.elements[e];l(o)&&w(o)&&(Object.assign(o.style,n),Object.keys(r).forEach((function(e){var t=r[e];!1===t?o.removeAttribute(e):o.setAttribute(e,!0===t?"":t)})))}))},effect:function(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach((function(e){var r=t.elements[e],o=t.attributes[e]||{},i=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:n[e]).reduce((function(e,t){return e[t]="",e}),{});l(r)&&w(r)&&(Object.assign(r.style,i),Object.keys(o).forEach((function(e){r.removeAttribute(e)})))}))}},requires:["computeStyles"]},ie,{name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0===a||a,f=n.fallbackPlacements,c=n.padding,u=n.boundary,p=n.rootBoundary,l=n.altBoundary,d=n.flipVariations,m=void 0===d||d,v=n.allowedAutoPlacements,h=t.options.placement,y=$(h),g=f||(y===h||!m?[se(h)]:function(e){if($(e)===C)return[];var t=se(e);return[ce(e),t,ce(t)]}(h)),b=[h].concat(g).reduce((function(e,n){return e.concat($(n)===C?function(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,f=n.allowedAutoPlacements,c=void 0===f?F:f,u=ee(r),p=u?s?U:U.filter((function(e){return ee(e)===u})):V,l=p.filter((function(e){return c.indexOf(e)>=0}));0===l.length&&(l=p);var d=l.reduce((function(t,n){return t[n]=he(e,{placement:n,boundary:o,rootBoundary:i,padding:a})[$(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}(t,{placement:n,boundary:u,rootBoundary:p,padding:c,flipVariations:m,allowedAutoPlacements:v}):n)}),[]),x=t.rects.reference,w=t.rects.popper,O=new Map,E=!0,P=b[0],j=0;j<b.length;j++){var Z=b[j],R=$(Z),A=ee(Z)===q,D=[H,W].indexOf(R)>=0,T=D?"width":"height",k=he(t,{placement:Z,boundary:u,rootBoundary:p,altBoundary:l,padding:c}),M=D?A?B:S:A?W:H;x[T]>w[T]&&(M=se(M));var L=se(M),I=[];if(i&&I.push(k[R]<=0),s&&I.push(k[M]<=0,k[L]<=0),I.every((function(e){return e}))){P=Z,E=!1;break}O.set(Z,I)}if(E)for(var N=function(e){var t=b.find((function(t){var n=O.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return P=t,"break"},_=m?3:1;_>0;_--){if("break"===N(_))break}t.placement!==P&&(t.modifiersData[r]._skip=!0,t.placement=P,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}},ge,be,{name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=he(t,{elementContext:"reference"}),s=he(t,{altBoundary:!0}),f=xe(a,r),c=xe(s,o,i),u=we(f),p=we(c);t.modifiersData[n]={referenceClippingOffsets:f,popperEscapeOffsets:c,isReferenceHidden:u,hasPopperEscaped:p},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":u,"data-popper-escaped":p})}}]}),Ee=n(94419),Pe=n(96174),je=n(21217);function Ze(e){return(0,je.Z)("MuiPopper",e)}(0,n(75878).Z)("MuiPopper",["root"]);var Re=n(57271),Ae=n(6826),De=n(80184),Te=["anchorEl","children","component","direction","disablePortal","modifiers","open","placement","popperOptions","popperRef","slotProps","slots","TransitionProps","ownerState"],ke=["anchorEl","children","container","direction","disablePortal","keepMounted","modifiers","open","placement","popperOptions","popperRef","style","transition","slotProps","slots"];function Me(e){return"function"===typeof e?e():e}function Le(e){return void 0!==e.nodeType}var He={},We=a.forwardRef((function(e,t){var n,c=e.anchorEl,u=e.children,p=e.component,l=e.direction,d=e.disablePortal,m=e.modifiers,v=e.open,h=e.placement,y=e.popperOptions,g=e.popperRef,b=e.slotProps,x=void 0===b?{}:b,w=e.slots,O=void 0===w?{}:w,E=e.TransitionProps,P=(0,o.Z)(e,Te),j=a.useRef(null),Z=(0,s.Z)(j,t),R=a.useRef(null),A=(0,s.Z)(R,g),D=a.useRef(A);(0,f.Z)((function(){D.current=A}),[A]),a.useImperativeHandle(g,(function(){return R.current}),[]);var T=function(e,t){if("ltr"===t)return e;switch(e){case"bottom-end":return"bottom-start";case"bottom-start":return"bottom-end";case"top-end":return"top-start";case"top-start":return"top-end";default:return e}}(h,l),k=a.useState(T),M=(0,i.Z)(k,2),L=M[0],H=M[1],W=a.useState(Me(c)),B=(0,i.Z)(W,2),S=B[0],C=B[1];a.useEffect((function(){R.current&&R.current.forceUpdate()})),a.useEffect((function(){c&&C(Me(c))}),[c]),(0,f.Z)((function(){if(S&&v){var e=[{name:"preventOverflow",options:{altBoundary:d}},{name:"flip",options:{altBoundary:d}},{name:"onUpdate",enabled:!0,phase:"afterWrite",fn:function(e){var t=e.state;H(t.placement)}}];null!=m&&(e=e.concat(m)),y&&null!=y.modifiers&&(e=e.concat(y.modifiers));var t=Oe(S,j.current,(0,r.Z)({placement:T},y,{modifiers:e}));return D.current(t),function(){t.destroy(),D.current(null)}}}),[S,d,m,v,y,T]);var V={placement:L};null!==E&&(V.TransitionProps=E);var q=(0,Ee.Z)({root:["root"]},(0,Ae.T)(Ze)),I=null!=(n=null!=p?p:O.root)?n:"div",N=(0,Re.Z)({elementType:I,externalSlotProps:x.root,externalForwardedProps:P,additionalProps:{role:"tooltip",ref:Z},ownerState:e,className:q.root});return(0,De.jsx)(I,(0,r.Z)({},N,{children:"function"===typeof u?u(V):u}))})),Be=a.forwardRef((function(e,t){var n,s=e.anchorEl,f=e.children,u=e.container,p=e.direction,l=void 0===p?"ltr":p,d=e.disablePortal,m=void 0!==d&&d,v=e.keepMounted,h=void 0!==v&&v,y=e.modifiers,g=e.open,b=e.placement,x=void 0===b?"bottom":b,w=e.popperOptions,O=void 0===w?He:w,E=e.popperRef,P=e.style,j=e.transition,Z=void 0!==j&&j,R=e.slotProps,A=void 0===R?{}:R,D=e.slots,T=void 0===D?{}:D,k=(0,o.Z)(e,ke),M=a.useState(!0),L=(0,i.Z)(M,2),H=L[0],W=L[1];if(!h&&!g&&(!Z||H))return null;if(u)n=u;else if(s){var B=Me(s);n=B&&Le(B)?(0,c.Z)(B).body:(0,c.Z)(null).body}var S=g||!h||Z&&!H?void 0:"none",C=Z?{in:g,onEnter:function(){W(!1)},onExited:function(){W(!0)}}:void 0;return(0,De.jsx)(Pe.Z,{disablePortal:m,container:n,children:(0,De.jsx)(We,(0,r.Z)({anchorEl:s,direction:l,disablePortal:m,modifiers:y,ref:t,open:Z?!H:g,placement:x,popperOptions:O,popperRef:E,slotProps:A,slots:T},k,{style:(0,r.Z)({position:"fixed",top:0,left:0,display:S},P),TransitionProps:C,children:f}))})})),Se=n(69120),Ce=n(66934),Ve=n(93736),qe=["components","componentsProps","slots","slotProps"],Ie=(0,Ce.ZP)(Be,{name:"MuiPopper",slot:"Root",overridesResolver:function(e,t){return t.root}})({}),Ne=a.forwardRef((function(e,t){var n,i=(0,Se.Z)(),a=(0,Ve.Z)({props:e,name:"MuiPopper"}),s=a.components,f=a.componentsProps,c=a.slots,u=a.slotProps,p=(0,o.Z)(a,qe),l=null!=(n=null==c?void 0:c.root)?n:null==s?void 0:s.Root;return(0,De.jsx)(Ie,(0,r.Z)({direction:null==i?void 0:i.direction,slots:{root:l},slotProps:null!=u?u:f},p,{ref:t}))}))}}]);
//# sourceMappingURL=1170.cee128df.chunk.js.map