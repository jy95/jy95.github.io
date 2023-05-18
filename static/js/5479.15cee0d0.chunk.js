"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[5479],{94070:function(e,t,r){r.d(t,{Z:function(){return k}});var o=r(45987),n=r(4942),a=r(1413),i=r(72791),l=r(28182),s=r(94419),c=r(12065),u=r(66934),d=r(93736),v=r(14036),f=r(35527),p=r(75878),g=r(21217);function m(e){return(0,g.Z)("MuiAlert",e)}var h=(0,p.Z)("MuiAlert",["root","action","icon","message","filled","filledSuccess","filledInfo","filledWarning","filledError","outlined","outlinedSuccess","outlinedInfo","outlinedWarning","outlinedError","standard","standardSuccess","standardInfo","standardWarning","standardError"]),y=r(13400),Z=r(74223),x=r(80184),b=(0,Z.Z)((0,x.jsx)("path",{d:"M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"}),"SuccessOutlined"),A=(0,Z.Z)((0,x.jsx)("path",{d:"M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"}),"ReportProblemOutlined"),C=(0,Z.Z)((0,x.jsx)("path",{d:"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"ErrorOutline"),M=(0,Z.Z)((0,x.jsx)("path",{d:"M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"}),"InfoOutlined"),S=r(8799),j=["action","children","className","closeText","color","components","componentsProps","icon","iconMapping","onClose","role","severity","slotProps","slots","variant"],w=(0,u.ZP)(f.Z,{name:"MuiAlert",slot:"Root",overridesResolver:function(e,t){var r=e.ownerState;return[t.root,t[r.variant],t["".concat(r.variant).concat((0,v.Z)(r.color||r.severity))]]}})((function(e){var t=e.theme,r=e.ownerState,o="light"===t.palette.mode?c._j:c.$n,i="light"===t.palette.mode?c.$n:c._j,l=r.color||r.severity;return(0,a.Z)((0,a.Z)((0,a.Z)((0,a.Z)({},t.typography.body2),{},{backgroundColor:"transparent",display:"flex",padding:"6px 16px"},l&&"standard"===r.variant&&(0,n.Z)({color:t.vars?t.vars.palette.Alert["".concat(l,"Color")]:o(t.palette[l].light,.6),backgroundColor:t.vars?t.vars.palette.Alert["".concat(l,"StandardBg")]:i(t.palette[l].light,.9)},"& .".concat(h.icon),t.vars?{color:t.vars.palette.Alert["".concat(l,"IconColor")]}:{color:t.palette[l].main})),l&&"outlined"===r.variant&&(0,n.Z)({color:t.vars?t.vars.palette.Alert["".concat(l,"Color")]:o(t.palette[l].light,.6),border:"1px solid ".concat((t.vars||t).palette[l].light)},"& .".concat(h.icon),t.vars?{color:t.vars.palette.Alert["".concat(l,"IconColor")]}:{color:t.palette[l].main})),l&&"filled"===r.variant&&(0,a.Z)({fontWeight:t.typography.fontWeightMedium},t.vars?{color:t.vars.palette.Alert["".concat(l,"FilledColor")],backgroundColor:t.vars.palette.Alert["".concat(l,"FilledBg")]}:{backgroundColor:"dark"===t.palette.mode?t.palette[l].dark:t.palette[l].main,color:t.palette.getContrastText(t.palette[l].main)}))})),I=(0,u.ZP)("div",{name:"MuiAlert",slot:"Icon",overridesResolver:function(e,t){return t.icon}})({marginRight:12,padding:"7px 0",display:"flex",fontSize:22,opacity:.9}),L=(0,u.ZP)("div",{name:"MuiAlert",slot:"Message",overridesResolver:function(e,t){return t.message}})({padding:"8px 0",minWidth:0,overflow:"auto"}),z=(0,u.ZP)("div",{name:"MuiAlert",slot:"Action",overridesResolver:function(e,t){return t.action}})({display:"flex",alignItems:"flex-start",padding:"4px 0 0 16px",marginLeft:"auto",marginRight:-8}),R={success:(0,x.jsx)(b,{fontSize:"inherit"}),warning:(0,x.jsx)(A,{fontSize:"inherit"}),error:(0,x.jsx)(C,{fontSize:"inherit"}),info:(0,x.jsx)(M,{fontSize:"inherit"})},k=i.forwardRef((function(e,t){var r,n,i,c,u,f,p=(0,d.Z)({props:e,name:"MuiAlert"}),g=p.action,h=p.children,Z=p.className,b=p.closeText,A=void 0===b?"Close":b,C=p.color,M=p.components,k=void 0===M?{}:M,P=p.componentsProps,O=void 0===P?{}:P,_=p.icon,E=p.iconMapping,N=void 0===E?R:E,B=p.onClose,W=p.role,H=void 0===W?"alert":W,T=p.severity,F=void 0===T?"success":T,V=p.slotProps,$=void 0===V?{}:V,q=p.slots,U=void 0===q?{}:q,D=p.variant,G=void 0===D?"standard":D,J=(0,o.Z)(p,j),K=(0,a.Z)((0,a.Z)({},p),{},{color:C,severity:F,variant:G}),Q=function(e){var t=e.variant,r=e.color,o=e.severity,n=e.classes,a={root:["root","".concat(t).concat((0,v.Z)(r||o)),"".concat(t)],icon:["icon"],message:["message"],action:["action"]};return(0,s.Z)(a,m,n)}(K),X=null!=(r=null!=(n=U.closeButton)?n:k.CloseButton)?r:y.Z,Y=null!=(i=null!=(c=U.closeIcon)?c:k.CloseIcon)?i:S.Z,ee=null!=(u=$.closeButton)?u:O.closeButton,te=null!=(f=$.closeIcon)?f:O.closeIcon;return(0,x.jsxs)(w,(0,a.Z)((0,a.Z)({role:H,elevation:0,ownerState:K,className:(0,l.Z)(Q.root,Z),ref:t},J),{},{children:[!1!==_?(0,x.jsx)(I,{ownerState:K,className:Q.icon,children:_||N[F]||R[F]}):null,(0,x.jsx)(L,{ownerState:K,className:Q.message,children:h}),null!=g?(0,x.jsx)(z,{ownerState:K,className:Q.action,children:g}):null,null==g&&B?(0,x.jsx)(z,{ownerState:K,className:Q.action,children:(0,x.jsx)(X,(0,a.Z)((0,a.Z)({size:"small","aria-label":A,title:A,color:"inherit",onClick:B},ee),{},{children:(0,x.jsx)(Y,(0,a.Z)({fontSize:"small"},te))}))}):null]}))}))},15655:function(e,t,r){t.Z=function(e){var t=e.startFromPage,r=void 0===t?0:t,o=e.loadMore,i=e.canLoadMore,l=void 0!==i&&i,s=e.initialise,c=void 0===s||s,u=e.rootMargin,d=void 0===u?"100px 0px 0px 0px":u,v=e.threshold,f=void 0===v?0:v,p=e.debug,g=void 0!==p&&p;function m(){var e;g&&(e=console).log.apply(e,arguments)}if("function"!==typeof o)throw new TypeError("useInfiniteLoader: loadMore must be a function and is required");var h=n.default.useRef(null),y=n.default.useRef(r),Z=n.default.useRef(null);return n.default.useEffect((function(){return Z.current||!0!==c||(m("Initialised"),Z.current=new IntersectionObserver((function(e){var t,r,n=(r=1,function(e){if(Array.isArray(e))return e}(t=e)||function(e,t){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e)){var r=[],o=!0,n=!1,a=void 0;try{for(var i,l=e[Symbol.iterator]();!(o=(i=l.next()).done)&&(r.push(i.value),!t||r.length!==t);o=!0);}catch(s){n=!0,a=s}finally{try{o||null==l.return||l.return()}finally{if(n)throw a}}return r}}(t,r)||function(e,t){if(e){if("string"===typeof e)return a(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(r):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?a(e,t):void 0}}(t,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())[0];m("Observer invoked"),n.intersectionRatio<=0?m("Intersection ratio not met, bailing"):!1!==l?(m("Loading more..."),o(y.current),y.current+=1):m("Can load more is false, bailing")}),{rootMargin:d,threshold:f}),h.current&&(m("Observing loader ref"),Z.current.observe(h.current))),function(){Z&&Z.current&&(Z.current.disconnect(),Z.current=void 0)}}),[l,o,y,c]),{loaderRef:h,page:y.current,resetPage:function(){y.current=r}}};var o,n=(o=r(72791))&&o.__esModule?o:{default:o};function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,o=new Array(t);r<t;r++)o[r]=e[r];return o}}}]);
//# sourceMappingURL=5479.15cee0d0.chunk.js.map