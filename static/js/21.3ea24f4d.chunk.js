/*! For license information please see 21.3ea24f4d.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[21],{1535:function(e,t,r){var o=r(5318);t.Z=void 0;var n=o(r(5649)),l=r(184),i=(0,n.default)((0,l.jsx)("path",{d:"M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"}),"Apps");t.Z=i},2359:function(e,t,r){var o=r(5318);t.Z=void 0;var n=o(r(5649)),l=r(184),i=(0,n.default)((0,l.jsx)("path",{d:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"}),"List");t.Z=i},3449:function(e,t,r){r.d(t,{ZP:function(){return a},_i:function(){return c},pQ:function(){return u},uU:function(){return s}});var o=r(9439),n=r(2791),l=r(184),i=n.createContext(null);function a(e){var t=e.children,r=e.value,a=function(){var e=n.useState(null),t=(0,o.Z)(e,2),r=t[0],l=t[1];return n.useEffect((function(){l("mui-p-".concat(Math.round(1e5*Math.random())))}),[]),r}(),c=n.useMemo((function(){return{idPrefix:a,value:r}}),[a,r]);return(0,l.jsx)(i.Provider,{value:c,children:t})}function c(){return n.useContext(i)}function s(e,t){return null===e.idPrefix?null:"".concat(e.idPrefix,"-P-").concat(t)}function u(e,t){return null===e.idPrefix?null:"".concat(e.idPrefix,"-T-").concat(t)}},2851:function(e,t,r){r.d(t,{Z:function(){return p}});var o=r(7462),n=r(3366),l=r(2791),i=r(8182),a=r(7630),c=r(3736),s=r(4419),u=r(1217);function d(e){return(0,u.Z)("MuiTabPanel",e)}(0,r(5878).Z)("MuiTabPanel",["root"]);var f=r(3449),v=r(184),h=["children","className","value"],b=(0,a.ZP)("div",{name:"MuiTabPanel",slot:"Root",overridesResolver:function(e,t){return t.root}})((function(e){return{padding:e.theme.spacing(3)}})),p=l.forwardRef((function(e,t){var r=(0,c.Z)({props:e,name:"MuiTabPanel"}),l=r.children,a=r.className,u=r.value,p=(0,n.Z)(r,h),m=(0,o.Z)({},r),Z=function(e){var t=e.classes;return(0,s.Z)({root:["root"]},d,t)}(m),w=(0,f._i)();if(null===w)throw new TypeError("No TabContext provided");var x=(0,f.uU)(w,u),g=(0,f.pQ)(w,u);return(0,v.jsx)(b,(0,o.Z)({"aria-labelledby":g,className:(0,i.Z)(Z.root,a),hidden:u!==w.value,id:x,ref:t,role:"tabpanel",ownerState:m},p,{children:u===w.value&&l}))}))},3896:function(e,t,r){r.d(t,{Z:function(){return w}});var o=r(4942),n=r(3366),l=r(7462),i=r(2791),a=r(8182),c=r(4419),s=r(3701),u=r(4036),d=r(3736),f=r(7630),v=r(1217);function h(e){return(0,v.Z)("MuiTab",e)}var b=(0,r(5878).Z)("MuiTab",["root","labelIcon","textColorInherit","textColorPrimary","textColorSecondary","selected","disabled","fullWidth","wrapped","iconWrapper"]),p=r(184),m=["className","disabled","disableFocusRipple","fullWidth","icon","iconPosition","indicator","label","onChange","onClick","onFocus","selected","selectionFollowsFocus","textColor","value","wrapped"],Z=(0,f.ZP)(s.Z,{name:"MuiTab",slot:"Root",overridesResolver:function(e,t){var r=e.ownerState;return[t.root,r.label&&r.icon&&t.labelIcon,t["textColor".concat((0,u.Z)(r.textColor))],r.fullWidth&&t.fullWidth,r.wrapped&&t.wrapped]}})((function(e){var t,r,n,i=e.theme,a=e.ownerState;return(0,l.Z)({},i.typography.button,{maxWidth:360,minWidth:90,position:"relative",minHeight:48,flexShrink:0,padding:"12px 16px",overflow:"hidden",whiteSpace:"normal",textAlign:"center"},a.label&&{flexDirection:"top"===a.iconPosition||"bottom"===a.iconPosition?"column":"row"},{lineHeight:1.25},a.icon&&a.label&&(0,o.Z)({minHeight:72,paddingTop:9,paddingBottom:9},"& > .".concat(b.iconWrapper),(0,l.Z)({},"top"===a.iconPosition&&{marginBottom:6},"bottom"===a.iconPosition&&{marginTop:6},"start"===a.iconPosition&&{marginRight:i.spacing(1)},"end"===a.iconPosition&&{marginLeft:i.spacing(1)})),"inherit"===a.textColor&&(t={color:"inherit",opacity:.6},(0,o.Z)(t,"&.".concat(b.selected),{opacity:1}),(0,o.Z)(t,"&.".concat(b.disabled),{opacity:(i.vars||i).palette.action.disabledOpacity}),t),"primary"===a.textColor&&(r={color:(i.vars||i).palette.text.secondary},(0,o.Z)(r,"&.".concat(b.selected),{color:(i.vars||i).palette.primary.main}),(0,o.Z)(r,"&.".concat(b.disabled),{color:(i.vars||i).palette.text.disabled}),r),"secondary"===a.textColor&&(n={color:(i.vars||i).palette.text.secondary},(0,o.Z)(n,"&.".concat(b.selected),{color:(i.vars||i).palette.secondary.main}),(0,o.Z)(n,"&.".concat(b.disabled),{color:(i.vars||i).palette.text.disabled}),n),a.fullWidth&&{flexShrink:1,flexGrow:1,flexBasis:0,maxWidth:"none"},a.wrapped&&{fontSize:i.typography.pxToRem(12)})})),w=i.forwardRef((function(e,t){var r=(0,d.Z)({props:e,name:"MuiTab"}),o=r.className,s=r.disabled,f=void 0!==s&&s,v=r.disableFocusRipple,b=void 0!==v&&v,w=r.fullWidth,x=r.icon,g=r.iconPosition,S=void 0===g?"top":g,y=r.indicator,C=r.label,M=r.onChange,B=r.onClick,z=r.onFocus,W=r.selected,P=r.selectionFollowsFocus,R=r.textColor,T=void 0===R?"inherit":R,E=r.value,N=r.wrapped,k=void 0!==N&&N,H=(0,n.Z)(r,m),L=(0,l.Z)({},r,{disabled:f,disableFocusRipple:b,selected:W,icon:!!x,iconPosition:S,label:!!C,fullWidth:w,textColor:T,wrapped:k}),j=function(e){var t=e.classes,r=e.textColor,o=e.fullWidth,n=e.wrapped,l=e.icon,i=e.label,a=e.selected,s=e.disabled,d={root:["root",l&&i&&"labelIcon","textColor".concat((0,u.Z)(r)),o&&"fullWidth",n&&"wrapped",a&&"selected",s&&"disabled"],iconWrapper:["iconWrapper"]};return(0,c.Z)(d,h,t)}(L),F=x&&C&&i.isValidElement(x)?i.cloneElement(x,{className:(0,a.Z)(j.iconWrapper,x.props.className)}):x;return(0,p.jsxs)(Z,(0,l.Z)({focusRipple:!b,className:(0,a.Z)(j.root,o),ref:t,role:"tab","aria-selected":W,disabled:f,onClick:function(e){!W&&M&&M(e,E),B&&B(e)},onFocus:function(e){P&&!W&&M&&M(e,E),z&&z(e)},ownerState:L,tabIndex:W?0:-1},H,{children:["top"===S||"start"===S?(0,p.jsxs)(i.Fragment,{children:[F,C]}):(0,p.jsxs)(i.Fragment,{children:[C,F]}),y]}))}))},9124:function(e,t,r){r.d(t,{Z:function(){return U}});var o,n=r(9439),l=r(4942),i=r(3366),a=r(7462),c=r(2791),s=(r(7441),r(8182)),u=r(4419),d=r(7630),f=r(3736),v=r(3967),h=r(3199);function b(){if(o)return o;var e=document.createElement("div"),t=document.createElement("div");return t.style.width="10px",t.style.height="1px",e.appendChild(t),e.dir="rtl",e.style.fontSize="14px",e.style.width="4px",e.style.height="1px",e.style.position="absolute",e.style.top="-1000px",e.style.overflow="scroll",document.body.appendChild(e),o="reverse",e.scrollLeft>0?o="default":(e.scrollLeft=1,0===e.scrollLeft&&(o="negative")),document.body.removeChild(e),o}function p(e,t){var r=e.scrollLeft;if("rtl"!==t)return r;switch(b()){case"negative":return e.scrollWidth-e.clientWidth+r;case"reverse":return e.scrollWidth-e.clientWidth-r;default:return r}}function m(e){return(1+Math.sin(Math.PI*e-Math.PI/2))/2}function Z(e,t,r){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},n=arguments.length>4&&void 0!==arguments[4]?arguments[4]:function(){},l=o.ease,i=void 0===l?m:l,a=o.duration,c=void 0===a?300:a,s=null,u=t[e],d=!1,f=function(){d=!0},v=function o(l){if(d)n(new Error("Animation cancelled"));else{null===s&&(s=l);var a=Math.min(1,(l-s)/c);t[e]=i(a)*(r-u)+u,a>=1?requestAnimationFrame((function(){n(null)})):requestAnimationFrame(o)}};return u===r?(n(new Error("Element already at target position")),f):(requestAnimationFrame(v),f)}var w=r(7602),x=r(184),g=["onChange"],S={width:99,height:99,position:"absolute",top:-9999,overflow:"scroll"};var y=r(7883),C=r(1883),M=r(3701),B=r(1217),z=r(5878);function W(e){return(0,B.Z)("MuiTabScrollButton",e)}var P,R,T=(0,z.Z)("MuiTabScrollButton",["root","vertical","horizontal","disabled"]),E=["className","direction","orientation","disabled"],N=(0,d.ZP)(M.Z,{name:"MuiTabScrollButton",slot:"Root",overridesResolver:function(e,t){var r=e.ownerState;return[t.root,r.orientation&&t[r.orientation]]}})((function(e){var t=e.ownerState;return(0,a.Z)((0,l.Z)({width:40,flexShrink:0,opacity:.8},"&.".concat(T.disabled),{opacity:0}),"vertical"===t.orientation&&{width:"100%",height:40,"& svg":{transform:"rotate(".concat(t.isRtl?-90:90,"deg)")}})})),k=c.forwardRef((function(e,t){var r=(0,f.Z)({props:e,name:"MuiTabScrollButton"}),o=r.className,n=r.direction,l=(0,i.Z)(r,E),c="rtl"===(0,v.Z)().direction,d=(0,a.Z)({isRtl:c},r),h=function(e){var t=e.classes,r={root:["root",e.orientation,e.disabled&&"disabled"]};return(0,u.Z)(r,W,t)}(d);return(0,x.jsx)(N,(0,a.Z)({component:"div",className:(0,s.Z)(h.root,o),ref:t,role:null,ownerState:d,tabIndex:null},l,{children:"left"===n?P||(P=(0,x.jsx)(y.Z,{fontSize:"small"})):R||(R=(0,x.jsx)(C.Z,{fontSize:"small"}))}))})),H=r(9683);function L(e){return(0,B.Z)("MuiTabs",e)}var j=(0,z.Z)("MuiTabs",["root","vertical","flexContainer","flexContainerVertical","centered","scroller","fixed","scrollableX","scrollableY","hideScrollbar","scrollButtons","scrollButtonsHideMobile","indicator"]),F=r(8301),A=["aria-label","aria-labelledby","action","centered","children","className","component","allowScrollButtonsMobile","indicatorColor","onChange","orientation","ScrollButtonComponent","scrollButtons","selectionFollowsFocus","TabIndicatorProps","TabScrollButtonProps","textColor","value","variant","visibleScrollbar"],I=function(e,t){return e===t?e.firstChild:t&&t.nextElementSibling?t.nextElementSibling:e.firstChild},X=function(e,t){return e===t?e.lastChild:t&&t.previousElementSibling?t.previousElementSibling:e.lastChild},_=function(e,t,r){for(var o=!1,n=r(e,t);n;){if(n===e.firstChild){if(o)return;o=!0}var l=n.disabled||"true"===n.getAttribute("aria-disabled");if(n.hasAttribute("tabindex")&&!l)return void n.focus();n=r(e,n)}},V=(0,d.ZP)("div",{name:"MuiTabs",slot:"Root",overridesResolver:function(e,t){var r=e.ownerState;return[(0,l.Z)({},"& .".concat(j.scrollButtons),t.scrollButtons),(0,l.Z)({},"& .".concat(j.scrollButtons),r.scrollButtonsHideMobile&&t.scrollButtonsHideMobile),t.root,r.vertical&&t.vertical]}})((function(e){var t=e.ownerState,r=e.theme;return(0,a.Z)({overflow:"hidden",minHeight:48,WebkitOverflowScrolling:"touch",display:"flex"},t.vertical&&{flexDirection:"column"},t.scrollButtonsHideMobile&&(0,l.Z)({},"& .".concat(j.scrollButtons),(0,l.Z)({},r.breakpoints.down("sm"),{display:"none"})))})),Y=(0,d.ZP)("div",{name:"MuiTabs",slot:"Scroller",overridesResolver:function(e,t){var r=e.ownerState;return[t.scroller,r.fixed&&t.fixed,r.hideScrollbar&&t.hideScrollbar,r.scrollableX&&t.scrollableX,r.scrollableY&&t.scrollableY]}})((function(e){var t=e.ownerState;return(0,a.Z)({position:"relative",display:"inline-block",flex:"1 1 auto",whiteSpace:"nowrap"},t.fixed&&{overflowX:"hidden",width:"100%"},t.hideScrollbar&&{scrollbarWidth:"none","&::-webkit-scrollbar":{display:"none"}},t.scrollableX&&{overflowX:"auto",overflowY:"hidden"},t.scrollableY&&{overflowY:"auto",overflowX:"hidden"})})),D=(0,d.ZP)("div",{name:"MuiTabs",slot:"FlexContainer",overridesResolver:function(e,t){var r=e.ownerState;return[t.flexContainer,r.vertical&&t.flexContainerVertical,r.centered&&t.centered]}})((function(e){var t=e.ownerState;return(0,a.Z)({display:"flex"},t.vertical&&{flexDirection:"column"},t.centered&&{justifyContent:"center"})})),O=(0,d.ZP)("span",{name:"MuiTabs",slot:"Indicator",overridesResolver:function(e,t){return t.indicator}})((function(e){var t=e.ownerState,r=e.theme;return(0,a.Z)({position:"absolute",height:2,bottom:0,width:"100%",transition:r.transitions.create()},"primary"===t.indicatorColor&&{backgroundColor:(r.vars||r).palette.primary.main},"secondary"===t.indicatorColor&&{backgroundColor:(r.vars||r).palette.secondary.main},t.vertical&&{height:"100%",width:2,right:0})})),$=(0,d.ZP)((function(e){var t=e.onChange,r=(0,i.Z)(e,g),o=c.useRef(),n=c.useRef(null),l=function(){o.current=n.current.offsetHeight-n.current.clientHeight};return c.useEffect((function(){var e=(0,h.Z)((function(){var e=o.current;l(),e!==o.current&&t(o.current)})),r=(0,w.Z)(n.current);return r.addEventListener("resize",e),function(){e.clear(),r.removeEventListener("resize",e)}}),[t]),c.useEffect((function(){l(),t(o.current)}),[t]),(0,x.jsx)("div",(0,a.Z)({style:S,ref:n},r))}),{name:"MuiTabs",slot:"ScrollbarSize"})({overflowX:"auto",overflowY:"hidden",scrollbarWidth:"none","&::-webkit-scrollbar":{display:"none"}}),q={},K=c.forwardRef((function(e,t){var r=(0,f.Z)({props:e,name:"MuiTabs"}),o=(0,v.Z)(),d="rtl"===o.direction,m=r["aria-label"],g=r["aria-labelledby"],S=r.action,y=r.centered,C=void 0!==y&&y,M=r.children,B=r.className,z=r.component,W=void 0===z?"div":z,P=r.allowScrollButtonsMobile,R=void 0!==P&&P,T=r.indicatorColor,E=void 0===T?"primary":T,N=r.onChange,j=r.orientation,K=void 0===j?"horizontal":j,U=r.ScrollButtonComponent,Q=void 0===U?k:U,G=r.scrollButtons,J=void 0===G?"auto":G,ee=r.selectionFollowsFocus,te=r.TabIndicatorProps,re=void 0===te?{}:te,oe=r.TabScrollButtonProps,ne=void 0===oe?{}:oe,le=r.textColor,ie=void 0===le?"primary":le,ae=r.value,ce=r.variant,se=void 0===ce?"standard":ce,ue=r.visibleScrollbar,de=void 0!==ue&&ue,fe=(0,i.Z)(r,A),ve="scrollable"===se,he="vertical"===K,be=he?"scrollTop":"scrollLeft",pe=he?"top":"left",me=he?"bottom":"right",Ze=he?"clientHeight":"clientWidth",we=he?"height":"width",xe=(0,a.Z)({},r,{component:W,allowScrollButtonsMobile:R,indicatorColor:E,orientation:K,vertical:he,scrollButtons:J,textColor:ie,variant:se,visibleScrollbar:de,fixed:!ve,hideScrollbar:ve&&!de,scrollableX:ve&&!he,scrollableY:ve&&he,centered:C&&!ve,scrollButtonsHideMobile:!R}),ge=function(e){var t=e.vertical,r=e.fixed,o=e.hideScrollbar,n=e.scrollableX,l=e.scrollableY,i=e.centered,a=e.scrollButtonsHideMobile,c=e.classes,s={root:["root",t&&"vertical"],scroller:["scroller",r&&"fixed",o&&"hideScrollbar",n&&"scrollableX",l&&"scrollableY"],flexContainer:["flexContainer",t&&"flexContainerVertical",i&&"centered"],indicator:["indicator"],scrollButtons:["scrollButtons",a&&"scrollButtonsHideMobile"],scrollableX:[n&&"scrollableX"],hideScrollbar:[o&&"hideScrollbar"]};return(0,u.Z)(s,L,c)}(xe);var Se=c.useState(!1),ye=(0,n.Z)(Se,2),Ce=ye[0],Me=ye[1],Be=c.useState(q),ze=(0,n.Z)(Be,2),We=ze[0],Pe=ze[1],Re=c.useState({start:!1,end:!1}),Te=(0,n.Z)(Re,2),Ee=Te[0],Ne=Te[1],ke=c.useState({overflow:"hidden",scrollbarWidth:0}),He=(0,n.Z)(ke,2),Le=He[0],je=He[1],Fe=new Map,Ae=c.useRef(null),Ie=c.useRef(null),Xe=function(){var e,t,r=Ae.current;if(r){var n=r.getBoundingClientRect();e={clientWidth:r.clientWidth,scrollLeft:r.scrollLeft,scrollTop:r.scrollTop,scrollLeftNormalized:p(r,o.direction),scrollWidth:r.scrollWidth,top:n.top,bottom:n.bottom,left:n.left,right:n.right}}if(r&&!1!==ae){var l=Ie.current.children;if(l.length>0){var i=l[Fe.get(ae)];0,t=i?i.getBoundingClientRect():null}}return{tabsMeta:e,tabMeta:t}},_e=(0,H.Z)((function(){var e,t,r=Xe(),o=r.tabsMeta,n=r.tabMeta,i=0;if(he)t="top",n&&o&&(i=n.top-o.top+o.scrollTop);else if(t=d?"right":"left",n&&o){var a=d?o.scrollLeftNormalized+o.clientWidth-o.scrollWidth:o.scrollLeft;i=(d?-1:1)*(n[t]-o[t]+a)}var c=(e={},(0,l.Z)(e,t,i),(0,l.Z)(e,we,n?n[we]:0),e);if(isNaN(We[t])||isNaN(We[we]))Pe(c);else{var s=Math.abs(We[t]-c[t]),u=Math.abs(We[we]-c[we]);(s>=1||u>=1)&&Pe(c)}})),Ve=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=t.animation,n=void 0===r||r;n?Z(be,Ae.current,e,{duration:o.transitions.duration.standard}):Ae.current[be]=e},Ye=function(e){var t=Ae.current[be];he?t+=e:(t+=e*(d?-1:1),t*=d&&"reverse"===b()?-1:1),Ve(t)},De=function(){for(var e=Ae.current[Ze],t=0,r=Array.from(Ie.current.children),o=0;o<r.length;o+=1){var n=r[o];if(t+n[Ze]>e)break;t+=n[Ze]}return t},Oe=function(){Ye(-1*De())},$e=function(){Ye(De())},qe=c.useCallback((function(e){je({overflow:null,scrollbarWidth:e})}),[]),Ke=(0,H.Z)((function(e){var t=Xe(),r=t.tabsMeta,o=t.tabMeta;if(o&&r)if(o[pe]<r[pe]){var n=r[be]+(o[pe]-r[pe]);Ve(n,{animation:e})}else if(o[me]>r[me]){var l=r[be]+(o[me]-r[me]);Ve(l,{animation:e})}})),Ue=(0,H.Z)((function(){if(ve&&!1!==J){var e,t,r=Ae.current,n=r.scrollTop,l=r.scrollHeight,i=r.clientHeight,a=r.scrollWidth,c=r.clientWidth;if(he)e=n>1,t=n<l-i-1;else{var s=p(Ae.current,o.direction);e=d?s<a-c-1:s>1,t=d?s>1:s<a-c-1}e===Ee.start&&t===Ee.end||Ne({start:e,end:t})}}));c.useEffect((function(){var e,t=(0,h.Z)((function(){_e(),Ue()})),r=(0,w.Z)(Ae.current);return r.addEventListener("resize",t),"undefined"!==typeof ResizeObserver&&(e=new ResizeObserver(t),Array.from(Ie.current.children).forEach((function(t){e.observe(t)}))),function(){t.clear(),r.removeEventListener("resize",t),e&&e.disconnect()}}),[_e,Ue]);var Qe=c.useMemo((function(){return(0,h.Z)((function(){Ue()}))}),[Ue]);c.useEffect((function(){return function(){Qe.clear()}}),[Qe]),c.useEffect((function(){Me(!0)}),[]),c.useEffect((function(){_e(),Ue()})),c.useEffect((function(){Ke(q!==We)}),[Ke,We]),c.useImperativeHandle(S,(function(){return{updateIndicator:_e,updateScrollButtons:Ue}}),[_e,Ue]);var Ge=(0,x.jsx)(O,(0,a.Z)({},re,{className:(0,s.Z)(ge.indicator,re.className),ownerState:xe,style:(0,a.Z)({},We,re.style)})),Je=0,et=c.Children.map(M,(function(e){if(!c.isValidElement(e))return null;var t=void 0===e.props.value?Je:e.props.value;Fe.set(t,Je);var r=t===ae;return Je+=1,c.cloneElement(e,(0,a.Z)({fullWidth:"fullWidth"===se,indicator:r&&!Ce&&Ge,selected:r,selectionFollowsFocus:ee,onChange:N,textColor:ie,value:t},1!==Je||!1!==ae||e.props.tabIndex?{}:{tabIndex:0}))})),tt=function(){var e={};e.scrollbarSizeListener=ve?(0,x.jsx)($,{onChange:qe,className:(0,s.Z)(ge.scrollableX,ge.hideScrollbar)}):null;var t=Ee.start||Ee.end,r=ve&&("auto"===J&&t||!0===J);return e.scrollButtonStart=r?(0,x.jsx)(Q,(0,a.Z)({orientation:K,direction:d?"right":"left",onClick:Oe,disabled:!Ee.start},ne,{className:(0,s.Z)(ge.scrollButtons,ne.className)})):null,e.scrollButtonEnd=r?(0,x.jsx)(Q,(0,a.Z)({orientation:K,direction:d?"left":"right",onClick:$e,disabled:!Ee.end},ne,{className:(0,s.Z)(ge.scrollButtons,ne.className)})):null,e}();return(0,x.jsxs)(V,(0,a.Z)({className:(0,s.Z)(ge.root,B),ownerState:xe,ref:t,as:W},fe,{children:[tt.scrollButtonStart,tt.scrollbarSizeListener,(0,x.jsxs)(Y,{className:ge.scroller,ownerState:xe,style:(0,l.Z)({overflow:Le.overflow},he?"margin".concat(d?"Left":"Right"):"marginBottom",de?void 0:-Le.scrollbarWidth),ref:Ae,onScroll:Qe,children:[(0,x.jsx)(D,{"aria-label":m,"aria-labelledby":g,"aria-orientation":"vertical"===K?"vertical":null,className:ge.flexContainer,ownerState:xe,onKeyDown:function(e){var t=Ie.current,r=(0,F.Z)(t).activeElement;if("tab"===r.getAttribute("role")){var o="horizontal"===K?"ArrowLeft":"ArrowUp",n="horizontal"===K?"ArrowRight":"ArrowDown";switch("horizontal"===K&&d&&(o="ArrowRight",n="ArrowLeft"),e.key){case o:e.preventDefault(),_(t,r,X);break;case n:e.preventDefault(),_(t,r,I);break;case"Home":e.preventDefault(),_(t,null,I);break;case"End":e.preventDefault(),_(t,null,X)}}},ref:Ie,role:"tablist",children:et}),Ce&&Ge]}),tt.scrollButtonEnd]}))})),U=K},7883:function(e,t,r){r(2791);var o=r(4223),n=r(184);t.Z=(0,o.Z)((0,n.jsx)("path",{d:"M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"}),"KeyboardArrowLeft")},1883:function(e,t,r){r(2791);var o=r(4223),n=r(184);t.Z=(0,o.Z)((0,n.jsx)("path",{d:"M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"}),"KeyboardArrowRight")},1372:function(e,t){var r=60103,o=60106,n=60107,l=60108,i=60114,a=60109,c=60110,s=60112,u=60113,d=60120,f=60115,v=60116,h=60121,b=60122,p=60117,m=60129,Z=60131;if("function"===typeof Symbol&&Symbol.for){var w=Symbol.for;r=w("react.element"),o=w("react.portal"),n=w("react.fragment"),l=w("react.strict_mode"),i=w("react.profiler"),a=w("react.provider"),c=w("react.context"),s=w("react.forward_ref"),u=w("react.suspense"),d=w("react.suspense_list"),f=w("react.memo"),v=w("react.lazy"),h=w("react.block"),b=w("react.server.block"),p=w("react.fundamental"),m=w("react.debug_trace_mode"),Z=w("react.legacy_hidden")}function x(e){if("object"===typeof e&&null!==e){var t=e.$$typeof;switch(t){case r:switch(e=e.type){case n:case i:case l:case u:case d:return e;default:switch(e=e&&e.$$typeof){case c:case s:case v:case f:case a:return e;default:return t}}case o:return t}}}},7441:function(e,t,r){r(1372)}}]);
//# sourceMappingURL=21.3ea24f4d.chunk.js.map