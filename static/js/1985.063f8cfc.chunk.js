"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[1985],{3053:function(e,r,a){var o=(0,a(2791).createContext)({});r.Z=o},1985:function(e,r,a){a.r(r),a.d(r,{default:function(){return B},dialogClasses:function(){return Z},getDialogUtilityClass:function(){return b}});var o=a(4942),n=a(3366),t=a(7462),i=a(2791),l=a(8182),c=a(4419),s=a(6248),p=a(9853),d=a(9444),u=a(7962),h=a(6650),m=a(7254),f=a(6863),x=a(5878),v=a(1217);function b(e){return(0,v.Z)("MuiDialog",e)}var Z=(0,x.Z)("MuiDialog",["root","scrollPaper","scrollBody","container","paper","paperScrollPaper","paperScrollBody","paperWidthFalse","paperWidthXs","paperWidthSm","paperWidthMd","paperWidthLg","paperWidthXl","paperFullWidth","paperFullScreen"]),g=a(3053),W=a(5112),k=a(4142),S=a(184),y=["aria-describedby","aria-labelledby","BackdropComponent","BackdropProps","children","className","disableEscapeKeyDown","fullScreen","fullWidth","maxWidth","onBackdropClick","onClose","open","PaperComponent","PaperProps","scroll","TransitionComponent","transitionDuration","TransitionProps"],w=(0,f.ZP)(W.Z,{name:"MuiDialog",slot:"Backdrop",overrides:function(e,r){return r.backdrop}})({zIndex:-1}),C=(0,f.ZP)(d.Z,{name:"MuiDialog",slot:"Root",overridesResolver:function(e,r){return r.root}})({"@media print":{position:"absolute !important"}}),P=(0,f.ZP)("div",{name:"MuiDialog",slot:"Container",overridesResolver:function(e,r){var a=e.ownerState;return[r.container,r["scroll".concat((0,p.Z)(a.scroll))]]}})((function(e){var r=e.ownerState;return(0,t.Z)({height:"100%","@media print":{height:"auto"},outline:0},"paper"===r.scroll&&{display:"flex",justifyContent:"center",alignItems:"center"},"body"===r.scroll&&{overflowY:"auto",overflowX:"hidden",textAlign:"center","&:after":{content:'""',display:"inline-block",verticalAlign:"middle",height:"100%",width:"0"}})})),D=(0,f.ZP)(h.Z,{name:"MuiDialog",slot:"Paper",overridesResolver:function(e,r){var a=e.ownerState;return[r.paper,r["scrollPaper".concat((0,p.Z)(a.scroll))],r["paperWidth".concat((0,p.Z)(String(a.maxWidth)))],a.fullWidth&&r.paperFullWidth,a.fullScreen&&r.paperFullScreen]}})((function(e){var r=e.theme,a=e.ownerState;return(0,t.Z)({margin:32,position:"relative",overflowY:"auto","@media print":{overflowY:"visible",boxShadow:"none"}},"paper"===a.scroll&&{display:"flex",flexDirection:"column",maxHeight:"calc(100% - 64px)"},"body"===a.scroll&&{display:"inline-block",verticalAlign:"middle",textAlign:"left"},!a.maxWidth&&{maxWidth:"calc(100% - 64px)"},"xs"===a.maxWidth&&(0,o.Z)({maxWidth:"px"===r.breakpoints.unit?Math.max(r.breakpoints.values.xs,444):"".concat(r.breakpoints.values.xs).concat(r.breakpoints.unit)},"&.".concat(Z.paperScrollBody),(0,o.Z)({},r.breakpoints.down(Math.max(r.breakpoints.values.xs,444)+64),{maxWidth:"calc(100% - 64px)"})),a.maxWidth&&"xs"!==a.maxWidth&&(0,o.Z)({maxWidth:"".concat(r.breakpoints.values[a.maxWidth]).concat(r.breakpoints.unit)},"&.".concat(Z.paperScrollBody),(0,o.Z)({},r.breakpoints.down(r.breakpoints.values[a.maxWidth]+64),{maxWidth:"calc(100% - 64px)"})),a.fullWidth&&{width:"calc(100% - 64px)"},a.fullScreen&&(0,o.Z)({margin:0,width:"100%",maxWidth:"100%",height:"100%",maxHeight:"none",borderRadius:0},"&.".concat(Z.paperScrollBody),{margin:0,maxWidth:"100%"}))})),B=i.forwardRef((function(e,r){var a=(0,m.Z)({props:e,name:"MuiDialog"}),o=(0,k.Z)(),d={enter:o.transitions.duration.enteringScreen,exit:o.transitions.duration.leavingScreen},f=a["aria-describedby"],x=a["aria-labelledby"],v=a.BackdropComponent,Z=a.BackdropProps,W=a.children,B=a.className,M=a.disableEscapeKeyDown,F=void 0!==M&&M,R=a.fullScreen,j=void 0!==R&&R,N=a.fullWidth,T=void 0!==N&&N,A=a.maxWidth,E=void 0===A?"sm":A,K=a.onBackdropClick,_=a.onClose,I=a.open,X=a.PaperComponent,Y=void 0===X?h.Z:X,H=a.PaperProps,z=void 0===H?{}:H,L=a.scroll,U=void 0===L?"paper":L,q=a.TransitionComponent,G=void 0===q?u.Z:q,J=a.transitionDuration,O=void 0===J?d:J,Q=a.TransitionProps,V=(0,n.Z)(a,y),$=(0,t.Z)({},a,{disableEscapeKeyDown:F,fullScreen:j,fullWidth:T,maxWidth:E,scroll:U}),ee=function(e){var r=e.classes,a=e.scroll,o=e.maxWidth,n=e.fullWidth,t=e.fullScreen,i={root:["root"],container:["container","scroll".concat((0,p.Z)(a))],paper:["paper","paperScroll".concat((0,p.Z)(a)),"paperWidth".concat((0,p.Z)(String(o))),n&&"paperFullWidth",t&&"paperFullScreen"]};return(0,c.Z)(i,b,r)}($),re=i.useRef(),ae=(0,s.Z)(x),oe=i.useMemo((function(){return{titleId:ae}}),[ae]);return(0,S.jsx)(C,(0,t.Z)({className:(0,l.Z)(ee.root,B),closeAfterTransition:!0,components:{Backdrop:w},componentsProps:{backdrop:(0,t.Z)({transitionDuration:O,as:v},Z)},disableEscapeKeyDown:F,onClose:_,open:I,ref:r,onClick:function(e){re.current&&(re.current=null,K&&K(e),_&&_(e,"backdropClick"))},ownerState:$},V,{children:(0,S.jsx)(G,(0,t.Z)({appear:!0,in:I,timeout:O,role:"presentation"},Q,{children:(0,S.jsx)(P,{className:(0,l.Z)(ee.container),onMouseDown:function(e){re.current=e.target===e.currentTarget},ownerState:$,children:(0,S.jsx)(D,(0,t.Z)({as:Y,elevation:24,role:"dialog","aria-describedby":f,"aria-labelledby":ae},z,{className:(0,l.Z)(ee.paper,z.className),ownerState:$,children:(0,S.jsx)(g.Z.Provider,{value:oe,children:W})}))})}))}))}))}}]);
//# sourceMappingURL=1985.063f8cfc.chunk.js.map