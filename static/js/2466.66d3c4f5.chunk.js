"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[2466],{699:function(e,n,r){var t=r(1413),a=r(9439),o=r(4942),i=r(2791),s=r(6871),d=r(7630),c=r(5193),l=r(7621),u=r(2169),p=r(6647),m=r(2606),f=r(184),b=(0,i.lazy)((function(){return r.e(89).then(r.bind(r,89))})),x="CardEntry",v={gameRoot:"".concat(x,"-gameRoot"),gameCover:"".concat(x,"-gameCover"),MuiCardActionArea:"".concat(x,"-MuiCardActionArea")},g=(0,d.ZP)(l.Z)((function(e){var n;e.theme;return n={},(0,o.Z)(n,"&.".concat(v.gameRoot),{position:"relative"}),(0,o.Z)(n,"& .".concat(v.gameCover),{zIndex:1}),(0,o.Z)(n,"& .".concat(v.MuiCardActionArea),{height:"inherit",zIndex:1}),n})),h=["small","medium","big"],Z={small:"150w",medium:"200w",big:"250w"};n.Z=function(e){var n=(0,s.s0)(),r=e.game,o=(0,c.Z)((function(e){return e.breakpoints.down("md")})),d=(0,i.useState)(!1),l=(0,a.Z)(d,2),x=l[0],y=l[1],j=r.title,C=r.url,R="PLAYLIST"===r.url_type?"/playlist/"+r.playlistId:"/video/"+r.videoId,A={src:r.imagePath,alt:j,loading:"lazy"};return null!==r&&void 0!==r&&r.hasResponsiveImages&&(A.srcSet=h.map((function(e){return"".concat(r.imagesFolder,"/cover@").concat(e,".webp ").concat(Z[e])})).join(",")),(0,f.jsxs)(g,{className:v.gameRoot,children:[(0,f.jsx)(p.Z,{onClick:function(){o?window.location.href=C:n(R)},onContextMenu:function(e){e.preventDefault(),y(!0)},classes:{root:v.MuiCardActionArea},children:(0,f.jsx)(u.Z,{className:v.gameCover,title:j,children:(0,f.jsx)(m.Z,(0,t.Z)((0,t.Z)({},A),{},{disableSpinner:!0}))})}),(0,f.jsx)(i.Suspense,{fallback:null,children:(0,f.jsx)(b,{game:r,contextMenuState:[x,y]})})]})}},3986:function(e,n,r){r.r(n),r.d(n,{default:function(){return D}});var t=r(4942),a=r(2791),o=r(7630),i=r(9434),s=r(4506),d=r(9439),c=r(3366),l=r(7462),u=(r(7441),r(8182)),p=r(4419),m=r(3736),f=r(6125),b=r(703);var x=a.createContext({}),v=r(8278),g=r(1217),h=r(5878);function Z(e){return(0,g.Z)("MuiAccordion",e)}var y=(0,h.Z)("MuiAccordion",["root","rounded","expanded","disabled","gutters","region"]),j=r(184),C=["children","className","defaultExpanded","disabled","disableGutters","expanded","onChange","square","TransitionComponent","TransitionProps"],R=(0,o.ZP)(b.Z,{name:"MuiAccordion",slot:"Root",overridesResolver:function(e,n){var r=e.ownerState;return[(0,t.Z)({},"& .".concat(y.region),n.region),n.root,!r.square&&n.rounded,!r.disableGutters&&n.gutters]}})((function(e){var n,r=e.theme,a={duration:r.transitions.duration.shortest};return n={position:"relative",transition:r.transitions.create(["margin"],a),overflowAnchor:"none","&:before":{position:"absolute",left:0,top:-1,right:0,height:1,content:'""',opacity:1,backgroundColor:(r.vars||r).palette.divider,transition:r.transitions.create(["opacity","background-color"],a)},"&:first-of-type":{"&:before":{display:"none"}}},(0,t.Z)(n,"&.".concat(y.expanded),{"&:before":{opacity:0},"&:first-of-type":{marginTop:0},"&:last-of-type":{marginBottom:0},"& + &":{"&:before":{display:"none"}}}),(0,t.Z)(n,"&.".concat(y.disabled),{backgroundColor:(r.vars||r).palette.action.disabledBackground}),n}),(function(e){var n=e.theme,r=e.ownerState;return(0,l.Z)({},!r.square&&{borderRadius:0,"&:first-of-type":{borderTopLeftRadius:(n.vars||n).shape.borderRadius,borderTopRightRadius:(n.vars||n).shape.borderRadius},"&:last-of-type":{borderBottomLeftRadius:(n.vars||n).shape.borderRadius,borderBottomRightRadius:(n.vars||n).shape.borderRadius,"@supports (-ms-ime-align: auto)":{borderBottomLeftRadius:0,borderBottomRightRadius:0}}},!r.disableGutters&&(0,t.Z)({},"&.".concat(y.expanded),{margin:"16px 0"}))})),A=a.forwardRef((function(e,n){var r=(0,m.Z)({props:e,name:"MuiAccordion"}),t=r.children,o=r.className,i=r.defaultExpanded,b=void 0!==i&&i,g=r.disabled,h=void 0!==g&&g,y=r.disableGutters,A=void 0!==y&&y,k=r.expanded,w=r.onChange,S=r.square,M=void 0!==S&&S,G=r.TransitionComponent,I=void 0===G?f.Z:G,N=r.TransitionProps,P=(0,c.Z)(r,C),z=(0,v.Z)({controlled:k,default:b,name:"Accordion",state:"expanded"}),E=(0,d.Z)(z,2),B=E[0],T=E[1],V=a.useCallback((function(e){T(!B),w&&w(e,!B)}),[B,w,T]),q=a.Children.toArray(t),L=(0,s.Z)(q),W=L[0],F=L.slice(1),_=a.useMemo((function(){return{expanded:B,disabled:h,disableGutters:A,toggle:V}}),[B,h,A,V]),H=(0,l.Z)({},r,{square:M,disabled:h,disableGutters:A,expanded:B}),D=function(e){var n=e.classes,r={root:["root",!e.square&&"rounded",e.expanded&&"expanded",e.disabled&&"disabled",!e.disableGutters&&"gutters"],region:["region"]};return(0,p.Z)(r,Z,n)}(H);return(0,j.jsxs)(R,(0,l.Z)({className:(0,u.Z)(D.root,o),ref:n,ownerState:H,square:M},P,{children:[(0,j.jsx)(x.Provider,{value:_,children:W}),(0,j.jsx)(I,(0,l.Z)({in:B,timeout:"auto"},N,{children:(0,j.jsx)("div",{"aria-labelledby":W.props.id,id:W.props["aria-controls"],role:"region",className:D.region,children:F})}))]}))})),k=A,w=r(3701);function S(e){return(0,g.Z)("MuiAccordionSummary",e)}var M=(0,h.Z)("MuiAccordionSummary",["root","expanded","focusVisible","disabled","gutters","contentGutters","content","expandIconWrapper"]),G=["children","className","expandIcon","focusVisibleClassName","onClick"],I=(0,o.ZP)(w.Z,{name:"MuiAccordionSummary",slot:"Root",overridesResolver:function(e,n){return n.root}})((function(e){var n,r=e.theme,a=e.ownerState,o={duration:r.transitions.duration.shortest};return(0,l.Z)((n={display:"flex",minHeight:48,padding:r.spacing(0,2),transition:r.transitions.create(["min-height","background-color"],o)},(0,t.Z)(n,"&.".concat(M.focusVisible),{backgroundColor:(r.vars||r).palette.action.focus}),(0,t.Z)(n,"&.".concat(M.disabled),{opacity:(r.vars||r).palette.action.disabledOpacity}),(0,t.Z)(n,"&:hover:not(.".concat(M.disabled,")"),{cursor:"pointer"}),n),!a.disableGutters&&(0,t.Z)({},"&.".concat(M.expanded),{minHeight:64}))})),N=(0,o.ZP)("div",{name:"MuiAccordionSummary",slot:"Content",overridesResolver:function(e,n){return n.content}})((function(e){var n=e.theme,r=e.ownerState;return(0,l.Z)({display:"flex",flexGrow:1,margin:"12px 0"},!r.disableGutters&&(0,t.Z)({transition:n.transitions.create(["margin"],{duration:n.transitions.duration.shortest})},"&.".concat(M.expanded),{margin:"20px 0"}))})),P=(0,o.ZP)("div",{name:"MuiAccordionSummary",slot:"ExpandIconWrapper",overridesResolver:function(e,n){return n.expandIconWrapper}})((function(e){var n=e.theme;return(0,t.Z)({display:"flex",color:(n.vars||n).palette.action.active,transform:"rotate(0deg)",transition:n.transitions.create("transform",{duration:n.transitions.duration.shortest})},"&.".concat(M.expanded),{transform:"rotate(180deg)"})})),z=a.forwardRef((function(e,n){var r=(0,m.Z)({props:e,name:"MuiAccordionSummary"}),t=r.children,o=r.className,i=r.expandIcon,s=r.focusVisibleClassName,d=r.onClick,f=(0,c.Z)(r,G),b=a.useContext(x),v=b.disabled,g=void 0!==v&&v,h=b.disableGutters,Z=b.expanded,y=b.toggle,C=(0,l.Z)({},r,{expanded:Z,disabled:g,disableGutters:h}),R=function(e){var n=e.classes,r=e.expanded,t=e.disabled,a=e.disableGutters,o={root:["root",r&&"expanded",t&&"disabled",!a&&"gutters"],focusVisible:["focusVisible"],content:["content",r&&"expanded",!a&&"contentGutters"],expandIconWrapper:["expandIconWrapper",r&&"expanded"]};return(0,p.Z)(o,S,n)}(C);return(0,j.jsxs)(I,(0,l.Z)({focusRipple:!1,disableRipple:!0,disabled:g,component:"div","aria-expanded":Z,className:(0,u.Z)(R.root,o),focusVisibleClassName:(0,u.Z)(R.focusVisible,s),onClick:function(e){y&&y(e),d&&d(e)},ref:n,ownerState:C},f,{children:[(0,j.jsx)(N,{className:R.content,ownerState:C,children:t}),i&&(0,j.jsx)(P,{className:R.expandIconWrapper,ownerState:C,children:i})]}))})),E=z,B=r(890),T=r(1131),V=r(1889),q=r(5927),L=r(699),W=r(7946),F=(0,a.lazy)((function(){return r.e(3372).then(r.bind(r,3372))})),_={gameEntry:"".concat("GamesGalleryList","-gameEntry")},H=(0,o.ZP)("div")((function(e){var n,r=e.theme;return(0,t.Z)({},"& .".concat(_.gameEntry),(n={},(0,t.Z)(n,r.breakpoints.only("xs"),{flexBasis:"calc((100% / 2) - 1%)"}),(0,t.Z)(n,r.breakpoints.only("sm"),{flexBasis:"calc((100% / 4) - 1%)"}),(0,t.Z)(n,r.breakpoints.up("md"),{flexBasis:"calc((100% / 8) - 1%)"}),n))}));var D=function(e){var n=(0,i.I0)(),r=(0,i.v9)((function(e){return e.series.loading})),t=(0,i.v9)((function(e){return e.series.error})),o=(0,i.v9)((function(e){return e.series.series}));return(0,a.useEffect)((function(){n((0,W.A)())}),[]),(0,j.jsx)(q.Z,{loading:r,error:t,reloadFct:function(){n((0,W.A)())},component:(0,j.jsx)(H,{children:o.map((function(e){return(0,j.jsxs)(k,{children:[(0,j.jsx)(E,{expandIcon:(0,j.jsx)(T.Z,{}),"aria-controls":"panel-content"+e.name,id:"panel-header"+e.name,children:(0,j.jsx)(B.Z,{children:e.name})}),(0,j.jsx)(a.Suspense,{fallback:null,children:(0,j.jsx)(F,{children:(0,j.jsx)(V.ZP,{container:!0,spacing:1,style:{rowGap:"15px"},children:e.items.map((function(e){var n;return(0,j.jsx)(V.ZP,{item:!0,className:_.gameEntry,children:(0,j.jsx)(L.Z,{game:e})},null!==(n=e.playlistId)&&void 0!==n?n:e.videoId)}))})})})]},e.name)}))})})}},5927:function(e,n,r){var t=r(2791),a=r(3168),o=r(184),i=(0,t.lazy)((function(){return r.e(2697).then(r.bind(r,2697))})),s=(0,t.lazy)((function(){return r.e(6597).then(r.bind(r,6597))})),d=(0,t.lazy)((function(){return r.e(6633).then(r.bind(r,6633))})),c=(0,t.lazy)((function(){return Promise.all([r.e(1889),r.e(3253)]).then(r.bind(r,3253))}));n.Z=function(e){var n=e,r=n.loading,l=n.error,u=n.component,p=n.reloadFct,m=(0,a.$)("common").t;return(0,o.jsxs)(t.Suspense,{fallback:null,children:[r&&(0,o.jsx)(c,{children:(0,o.jsx)(i,{})}),l&&(0,o.jsx)(o.Fragment,{children:(0,o.jsx)(c,{children:(0,o.jsxs)(s,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:p,children:[(0,o.jsx)(d,{}),m("common.reload")]})})}),!r&&!l&&(0,o.jsx)(o.Fragment,{children:u})]})}},1131:function(e,n,r){var t=r(5318);n.Z=void 0;var a=t(r(5649)),o=r(184),i=(0,a.default)((0,o.jsx)("path",{d:"M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"}),"ExpandMore");n.Z=i}}]);
//# sourceMappingURL=2466.66d3c4f5.chunk.js.map