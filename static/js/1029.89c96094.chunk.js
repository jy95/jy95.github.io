"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[1029],{699:function(e,n,t){var r=t(9439),o=t(2791),i=t(7689),a=t(2797),s=t(8928),d=t(199),c=t(8487),l=t(2606),u=t(184),p=(0,o.lazy)((function(){return t.e(89).then(t.bind(t,89))}));n.Z=function(e){var n=(0,i.s0)(),t=e.game,f=(0,a.Z)((function(e){return e.breakpoints.down("md")})),m=(0,o.useState)(!1),h=(0,r.Z)(m,2),x=h[0],v=h[1],g=t.title,b=t.url,Z="PLAYLIST"===t.url_type?"/playlist/"+t.id:"/video/"+t.id;return(0,u.jsxs)(s.Z,{sx:{position:"relative"},children:[(0,u.jsx)(c.Z,{onClick:function(){f?window.location.href=b:n(Z)},onContextMenu:function(e){e.preventDefault(),v(!0)},sx:{height:"inherit",zIndex:1},children:(0,u.jsx)(d.Z,{sx:{zIndex:1},title:g,children:(0,u.jsx)(l.Z,{src:t.imagePath,srcSet:t.srcSet,sizes:t.sizes,alt:g,loading:"lazy",disableSpinner:!0})})}),(0,u.jsx)(o.Suspense,{fallback:null,children:(0,u.jsx)(p,{game:t,contextMenuState:[x,v]})})]})}},1029:function(e,n,t){t.r(n),t.d(n,{default:function(){return U}});var r=t(2791),o=t(4506),i=t(9439),a=t(4942),s=t(3366),d=t(7462),c=(t(8457),t(8182)),l=t(4419),u=t(6863),p=t(7254),f=t(6752),m=t(5354),h=t(6780),x=t(4142),v=t(7933),g=t(5878),b=t(1217);function Z(e){return(0,b.Z)("MuiCollapse",e)}(0,g.Z)("MuiCollapse",["root","horizontal","vertical","entered","hidden","wrapper","wrapperInner"]);var y=t(184),w=["addEndListener","children","className","collapsedSize","component","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","orientation","style","timeout","TransitionComponent"],j=(0,u.ZP)("div",{name:"MuiCollapse",slot:"Root",overridesResolver:function(e,n){var t=e.ownerState;return[n.root,n[t.orientation],"entered"===t.state&&n.entered,"exited"===t.state&&!t.in&&"0px"===t.collapsedSize&&n.hidden]}})((function(e){var n=e.theme,t=e.ownerState;return(0,d.Z)({height:0,overflow:"hidden",transition:n.transitions.create("height")},"horizontal"===t.orientation&&{height:"auto",width:0,transition:n.transitions.create("width")},"entered"===t.state&&(0,d.Z)({height:"auto",overflow:"visible"},"horizontal"===t.orientation&&{width:"auto"}),"exited"===t.state&&!t.in&&"0px"===t.collapsedSize&&{visibility:"hidden"})})),S=(0,u.ZP)("div",{name:"MuiCollapse",slot:"Wrapper",overridesResolver:function(e,n){return n.wrapper}})((function(e){var n=e.ownerState;return(0,d.Z)({display:"flex",width:"100%"},"horizontal"===n.orientation&&{width:"auto",height:"100%"})})),C=(0,u.ZP)("div",{name:"MuiCollapse",slot:"WrapperInner",overridesResolver:function(e,n){return n.wrapperInner}})((function(e){var n=e.ownerState;return(0,d.Z)({width:"100%"},"horizontal"===n.orientation&&{width:"auto",height:"100%"})})),R=r.forwardRef((function(e,n){var t=(0,p.Z)({props:e,name:"MuiCollapse"}),o=t.addEndListener,i=t.children,u=t.className,g=t.collapsedSize,b=void 0===g?"0px":g,R=t.component,E=t.easing,z=t.in,M=t.onEnter,k=t.onEntered,A=t.onEntering,I=t.onExit,N=t.onExited,G=t.onExiting,P=t.orientation,T=void 0===P?"vertical":P,W=t.style,L=t.timeout,V=void 0===L?m.x9.standard:L,q=t.TransitionComponent,D=void 0===q?f.ZP:q,B=(0,s.Z)(t,w),F=(0,d.Z)({},t,{orientation:T,collapsedSize:b}),H=function(e){var n=e.orientation,t=e.classes,r={root:["root","".concat(n)],entered:["entered"],hidden:["hidden"],wrapper:["wrapper","".concat(n)],wrapperInner:["wrapperInner","".concat(n)]};return(0,l.Z)(r,Z,t)}(F),_=(0,x.Z)(),J=r.useRef(),O=r.useRef(null),Y=r.useRef(),$="number"===typeof b?"".concat(b,"px"):b,K="horizontal"===T,Q=K?"width":"height";r.useEffect((function(){return function(){clearTimeout(J.current)}}),[]);var U=r.useRef(null),X=(0,v.Z)(n,U),ee=function(e){return function(n){if(e){var t=U.current;void 0===n?e(t):e(t,n)}}},ne=function(){return O.current?O.current[K?"clientWidth":"clientHeight"]:0},te=ee((function(e,n){O.current&&K&&(O.current.style.position="absolute"),e.style[Q]=$,M&&M(e,n)})),re=ee((function(e,n){var t=ne();O.current&&K&&(O.current.style.position="");var r=(0,h.C)({style:W,timeout:V,easing:E},{mode:"enter"}),o=r.duration,i=r.easing;if("auto"===V){var a=_.transitions.getAutoHeightDuration(t);e.style.transitionDuration="".concat(a,"ms"),Y.current=a}else e.style.transitionDuration="string"===typeof o?o:"".concat(o,"ms");e.style[Q]="".concat(t,"px"),e.style.transitionTimingFunction=i,A&&A(e,n)})),oe=ee((function(e,n){e.style[Q]="auto",k&&k(e,n)})),ie=ee((function(e){e.style[Q]="".concat(ne(),"px"),I&&I(e)})),ae=ee(N),se=ee((function(e){var n=ne(),t=(0,h.C)({style:W,timeout:V,easing:E},{mode:"exit"}),r=t.duration,o=t.easing;if("auto"===V){var i=_.transitions.getAutoHeightDuration(n);e.style.transitionDuration="".concat(i,"ms"),Y.current=i}else e.style.transitionDuration="string"===typeof r?r:"".concat(r,"ms");e.style[Q]=$,e.style.transitionTimingFunction=o,G&&G(e)}));return(0,y.jsx)(D,(0,d.Z)({in:z,onEnter:te,onEntered:oe,onEntering:re,onExit:ie,onExited:ae,onExiting:se,addEndListener:function(e){"auto"===V&&(J.current=setTimeout(e,Y.current||0)),o&&o(U.current,e)},nodeRef:U,timeout:"auto"===V?null:V},B,{children:function(e,n){return(0,y.jsx)(j,(0,d.Z)({as:R,className:(0,c.Z)(H.root,u,{entered:H.entered,exited:!z&&"0px"===$&&H.hidden}[e]),style:(0,d.Z)((0,a.Z)({},K?"minWidth":"minHeight",$),W),ownerState:(0,d.Z)({},F,{state:e}),ref:X},n,{children:(0,y.jsx)(S,{ownerState:(0,d.Z)({},F,{state:e}),className:H.wrapper,ref:O,children:(0,y.jsx)(C,{ownerState:(0,d.Z)({},F,{state:e}),className:H.wrapperInner,children:i})})}))}}))}));R.muiSupportAuto=!0;var E=R,z=t(286);var M=r.createContext({}),k=t(5178);function A(e){return(0,b.Z)("MuiAccordion",e)}var I=(0,g.Z)("MuiAccordion",["root","rounded","expanded","disabled","gutters","region"]),N=["children","className","defaultExpanded","disabled","disableGutters","expanded","onChange","square","TransitionComponent","TransitionProps"],G=(0,u.ZP)(z.Z,{name:"MuiAccordion",slot:"Root",overridesResolver:function(e,n){var t=e.ownerState;return[(0,a.Z)({},"& .".concat(I.region),n.region),n.root,!t.square&&n.rounded,!t.disableGutters&&n.gutters]}})((function(e){var n,t=e.theme,r={duration:t.transitions.duration.shortest};return n={position:"relative",transition:t.transitions.create(["margin"],r),overflowAnchor:"none","&:before":{position:"absolute",left:0,top:-1,right:0,height:1,content:'""',opacity:1,backgroundColor:(t.vars||t).palette.divider,transition:t.transitions.create(["opacity","background-color"],r)},"&:first-of-type":{"&:before":{display:"none"}}},(0,a.Z)(n,"&.".concat(I.expanded),{"&:before":{opacity:0},"&:first-of-type":{marginTop:0},"&:last-of-type":{marginBottom:0},"& + &":{"&:before":{display:"none"}}}),(0,a.Z)(n,"&.".concat(I.disabled),{backgroundColor:(t.vars||t).palette.action.disabledBackground}),n}),(function(e){var n=e.theme,t=e.ownerState;return(0,d.Z)({},!t.square&&{borderRadius:0,"&:first-of-type":{borderTopLeftRadius:(n.vars||n).shape.borderRadius,borderTopRightRadius:(n.vars||n).shape.borderRadius},"&:last-of-type":{borderBottomLeftRadius:(n.vars||n).shape.borderRadius,borderBottomRightRadius:(n.vars||n).shape.borderRadius,"@supports (-ms-ime-align: auto)":{borderBottomLeftRadius:0,borderBottomRightRadius:0}}},!t.disableGutters&&(0,a.Z)({},"&.".concat(I.expanded),{margin:"16px 0"}))})),P=r.forwardRef((function(e,n){var t=(0,p.Z)({props:e,name:"MuiAccordion"}),a=t.children,u=t.className,f=t.defaultExpanded,m=void 0!==f&&f,h=t.disabled,x=void 0!==h&&h,v=t.disableGutters,g=void 0!==v&&v,b=t.expanded,Z=t.onChange,w=t.square,j=void 0!==w&&w,S=t.TransitionComponent,C=void 0===S?E:S,R=t.TransitionProps,z=(0,s.Z)(t,N),I=(0,k.Z)({controlled:b,default:m,name:"Accordion",state:"expanded"}),P=(0,i.Z)(I,2),T=P[0],W=P[1],L=r.useCallback((function(e){W(!T),Z&&Z(e,!T)}),[T,Z,W]),V=r.Children.toArray(a),q=(0,o.Z)(V),D=q[0],B=q.slice(1),F=r.useMemo((function(){return{expanded:T,disabled:x,disableGutters:g,toggle:L}}),[T,x,g,L]),H=(0,d.Z)({},t,{square:j,disabled:x,disableGutters:g,expanded:T}),_=function(e){var n=e.classes,t={root:["root",!e.square&&"rounded",e.expanded&&"expanded",e.disabled&&"disabled",!e.disableGutters&&"gutters"],region:["region"]};return(0,l.Z)(t,A,n)}(H);return(0,y.jsxs)(G,(0,d.Z)({className:(0,c.Z)(_.root,u),ref:n,ownerState:H,square:j},z,{children:[(0,y.jsx)(M.Provider,{value:F,children:D}),(0,y.jsx)(C,(0,d.Z)({in:T,timeout:"auto"},R,{children:(0,y.jsx)("div",{"aria-labelledby":D.props.id,id:D.props["aria-controls"],role:"region",className:_.region,children:B})}))]}))})),T=t(753);function W(e){return(0,b.Z)("MuiAccordionSummary",e)}var L=(0,g.Z)("MuiAccordionSummary",["root","expanded","focusVisible","disabled","gutters","contentGutters","content","expandIconWrapper"]),V=["children","className","expandIcon","focusVisibleClassName","onClick"],q=(0,u.ZP)(T.Z,{name:"MuiAccordionSummary",slot:"Root",overridesResolver:function(e,n){return n.root}})((function(e){var n,t=e.theme,r=e.ownerState,o={duration:t.transitions.duration.shortest};return(0,d.Z)((n={display:"flex",minHeight:48,padding:t.spacing(0,2),transition:t.transitions.create(["min-height","background-color"],o)},(0,a.Z)(n,"&.".concat(L.focusVisible),{backgroundColor:(t.vars||t).palette.action.focus}),(0,a.Z)(n,"&.".concat(L.disabled),{opacity:(t.vars||t).palette.action.disabledOpacity}),(0,a.Z)(n,"&:hover:not(.".concat(L.disabled,")"),{cursor:"pointer"}),n),!r.disableGutters&&(0,a.Z)({},"&.".concat(L.expanded),{minHeight:64}))})),D=(0,u.ZP)("div",{name:"MuiAccordionSummary",slot:"Content",overridesResolver:function(e,n){return n.content}})((function(e){var n=e.theme,t=e.ownerState;return(0,d.Z)({display:"flex",flexGrow:1,margin:"12px 0"},!t.disableGutters&&(0,a.Z)({transition:n.transitions.create(["margin"],{duration:n.transitions.duration.shortest})},"&.".concat(L.expanded),{margin:"20px 0"}))})),B=(0,u.ZP)("div",{name:"MuiAccordionSummary",slot:"ExpandIconWrapper",overridesResolver:function(e,n){return n.expandIconWrapper}})((function(e){var n=e.theme;return(0,a.Z)({display:"flex",color:(n.vars||n).palette.action.active,transform:"rotate(0deg)",transition:n.transitions.create("transform",{duration:n.transitions.duration.shortest})},"&.".concat(L.expanded),{transform:"rotate(180deg)"})})),F=r.forwardRef((function(e,n){var t=(0,p.Z)({props:e,name:"MuiAccordionSummary"}),o=t.children,i=t.className,a=t.expandIcon,u=t.focusVisibleClassName,f=t.onClick,m=(0,s.Z)(t,V),h=r.useContext(M),x=h.disabled,v=void 0!==x&&x,g=h.disableGutters,b=h.expanded,Z=h.toggle,w=(0,d.Z)({},t,{expanded:b,disabled:v,disableGutters:g}),j=function(e){var n=e.classes,t=e.expanded,r=e.disabled,o=e.disableGutters,i={root:["root",t&&"expanded",r&&"disabled",!o&&"gutters"],focusVisible:["focusVisible"],content:["content",t&&"expanded",!o&&"contentGutters"],expandIconWrapper:["expandIconWrapper",t&&"expanded"]};return(0,l.Z)(i,W,n)}(w);return(0,y.jsxs)(q,(0,d.Z)({focusRipple:!1,disableRipple:!0,disabled:v,component:"div","aria-expanded":b,className:(0,c.Z)(j.root,i),focusVisibleClassName:(0,c.Z)(j.focusVisible,u),onClick:function(e){Z&&Z(e),f&&f(e)},ref:n,ownerState:w},m,{children:[(0,y.jsx)(D,{className:j.content,ownerState:w,children:o}),a&&(0,y.jsx)(B,{className:j.expandIconWrapper,ownerState:w,children:a})]}))})),H=t(4565),_=t(1131),J=t(5953),O=t(7009),Y=t(5927),$=t(699),K=t(7946),Q=(0,r.lazy)((function(){return t.e(3906).then(t.bind(t,3906))}));var U=function(e){var n=(0,O.T)(),t=(0,O.C)((function(e){return(0,K.gI)(e)})),o=t.loading,i=t.error,a=t.series;return(0,r.useEffect)((function(){n((0,K.AJ)())}),[]),(0,y.jsx)(Y.Z,{loading:o,error:i,reloadFct:function(){n((0,K.AJ)())},component:(0,y.jsx)("div",{children:a.map((function(e){return(0,y.jsxs)(P,{children:[(0,y.jsx)(F,{expandIcon:(0,y.jsx)(_.Z,{}),"aria-controls":"panel-content"+e.name,id:"panel-header"+e.name,children:(0,y.jsx)(H.Z,{children:e.name})}),(0,y.jsx)(r.Suspense,{fallback:null,children:(0,y.jsx)(Q,{children:(0,y.jsx)(J.ZP,{container:!0,spacing:1,style:{rowGap:"15px"},children:e.items.map((function(e){return(0,y.jsx)(J.ZP,{item:!0,xs:6,md:4,lg:1.5,children:(0,y.jsx)($.Z,{game:e})},e.id)}))})})})]},e.name)}))})})}},5927:function(e,n,t){var r=t(2791),o=t(3168),i=t(184),a=(0,r.lazy)((function(){return t.e(5675).then(t.bind(t,5675))})),s=(0,r.lazy)((function(){return t.e(4480).then(t.bind(t,4480))})),d=(0,r.lazy)((function(){return t.e(6633).then(t.bind(t,6633))})),c=(0,r.lazy)((function(){return Promise.all([t.e(5953),t.e(3253)]).then(t.bind(t,3253))}));n.Z=function(e){var n=e.loading,t=e.error,l=e.component,u=e.reloadFct,p=(0,o.$)("common").t;return(0,i.jsxs)(r.Suspense,{fallback:null,children:[n&&(0,i.jsx)(c,{children:(0,i.jsx)(a,{})}),t&&(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(c,{children:(0,i.jsxs)(s,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:u,children:[(0,i.jsx)(d,{}),p("common.reload")]})})}),!n&&!t&&(0,i.jsx)(i.Fragment,{children:l})]})}},1131:function(e,n,t){var r=t(4836);n.Z=void 0;var o=r(t(5649)),i=t(184),a=(0,o.default)((0,i.jsx)("path",{d:"M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"}),"ExpandMore");n.Z=a}}]);
//# sourceMappingURL=1029.89c96094.chunk.js.map