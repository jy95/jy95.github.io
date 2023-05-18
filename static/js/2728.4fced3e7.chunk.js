"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[2728],{82626:function(e,t,a){var n=a(45987),o=a(4942),i=a(1413),r=a(72791),c=a(28182),s=a(94419),d=a(12065),l=a(66934),u=a(93736),p=a(66199),m=a(23701),v=a(40162),Z=a(42071),b=a(90133),g=a(96014),f=a(29849),y=a(71498),h=a(80184),C=["autoFocus","component","dense","divider","disableGutters","focusVisibleClassName","role","tabIndex","className"],x=(0,l.ZP)(m.Z,{shouldForwardProp:function(e){return(0,l.FO)(e)||"classes"===e},name:"MuiMenuItem",slot:"Root",overridesResolver:function(e,t){var a=e.ownerState;return[t.root,a.dense&&t.dense,a.divider&&t.divider,!a.disableGutters&&t.gutters]}})((function(e){var t,a=e.theme,n=e.ownerState;return(0,i.Z)((0,i.Z)((0,i.Z)((0,i.Z)((0,i.Z)({},a.typography.body1),{},{display:"flex",justifyContent:"flex-start",alignItems:"center",position:"relative",textDecoration:"none",minHeight:48,paddingTop:6,paddingBottom:6,boxSizing:"border-box",whiteSpace:"nowrap"},!n.disableGutters&&{paddingLeft:16,paddingRight:16}),n.divider&&{borderBottom:"1px solid ".concat((a.vars||a).palette.divider),backgroundClip:"padding-box"}),{},(t={"&:hover":{textDecoration:"none",backgroundColor:(a.vars||a).palette.action.hover,"@media (hover: none)":{backgroundColor:"transparent"}}},(0,o.Z)(t,"&.".concat(y.Z.selected),(0,o.Z)({backgroundColor:a.vars?"rgba(".concat(a.vars.palette.primary.mainChannel," / ").concat(a.vars.palette.action.selectedOpacity,")"):(0,d.Fq)(a.palette.primary.main,a.palette.action.selectedOpacity)},"&.".concat(y.Z.focusVisible),{backgroundColor:a.vars?"rgba(".concat(a.vars.palette.primary.mainChannel," / calc(").concat(a.vars.palette.action.selectedOpacity," + ").concat(a.vars.palette.action.focusOpacity,"))"):(0,d.Fq)(a.palette.primary.main,a.palette.action.selectedOpacity+a.palette.action.focusOpacity)})),(0,o.Z)(t,"&.".concat(y.Z.selected,":hover"),{backgroundColor:a.vars?"rgba(".concat(a.vars.palette.primary.mainChannel," / calc(").concat(a.vars.palette.action.selectedOpacity," + ").concat(a.vars.palette.action.hoverOpacity,"))"):(0,d.Fq)(a.palette.primary.main,a.palette.action.selectedOpacity+a.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:a.vars?"rgba(".concat(a.vars.palette.primary.mainChannel," / ").concat(a.vars.palette.action.selectedOpacity,")"):(0,d.Fq)(a.palette.primary.main,a.palette.action.selectedOpacity)}}),(0,o.Z)(t,"&.".concat(y.Z.focusVisible),{backgroundColor:(a.vars||a).palette.action.focus}),(0,o.Z)(t,"&.".concat(y.Z.disabled),{opacity:(a.vars||a).palette.action.disabledOpacity}),(0,o.Z)(t,"& + .".concat(b.Z.root),{marginTop:a.spacing(1),marginBottom:a.spacing(1)}),(0,o.Z)(t,"& + .".concat(b.Z.inset),{marginLeft:52}),(0,o.Z)(t,"& .".concat(f.Z.root),{marginTop:0,marginBottom:0}),(0,o.Z)(t,"& .".concat(f.Z.inset),{paddingLeft:36}),(0,o.Z)(t,"& .".concat(g.Z.root),{minWidth:36}),t),!n.dense&&(0,o.Z)({},a.breakpoints.up("sm"),{minHeight:"auto"})),n.dense&&(0,i.Z)((0,i.Z)({minHeight:32,paddingTop:4,paddingBottom:4},a.typography.body2),{},(0,o.Z)({},"& .".concat(g.Z.root," svg"),{fontSize:"1.25rem"})))})),O=r.forwardRef((function(e,t){var a=(0,u.Z)({props:e,name:"MuiMenuItem"}),o=a.autoFocus,d=void 0!==o&&o,l=a.component,m=void 0===l?"li":l,b=a.dense,g=void 0!==b&&b,f=a.divider,O=void 0!==f&&f,k=a.disableGutters,I=void 0!==k&&k,M=a.focusVisibleClassName,w=a.role,F=void 0===w?"menuitem":w,G=a.tabIndex,V=a.className,N=(0,n.Z)(a,C),S=r.useContext(p.Z),B=r.useMemo((function(){return{dense:g||S.dense||!1,disableGutters:I}}),[S.dense,g,I]),R=r.useRef(null);(0,v.Z)((function(){d&&R.current&&R.current.focus()}),[d]);var q,T=(0,i.Z)((0,i.Z)({},a),{},{dense:B.dense,divider:O,disableGutters:I}),_=function(e){var t=e.disabled,a=e.dense,n=e.divider,o=e.disableGutters,r=e.selected,c=e.classes,d={root:["root",a&&"dense",t&&"disabled",!o&&"gutters",n&&"divider",r&&"selected"]},l=(0,s.Z)(d,y.K,c);return(0,i.Z)((0,i.Z)({},c),l)}(a),j=(0,Z.Z)(R,t);return a.disabled||(q=void 0!==G?G:-1),(0,h.jsx)(p.Z.Provider,{value:B,children:(0,h.jsx)(x,(0,i.Z)((0,i.Z)({ref:j,role:F,tabIndex:q,component:m,focusVisibleClassName:(0,c.Z)(_.focusVisible,M),className:(0,c.Z)(_.root,V)},N),{},{ownerState:T,classes:_}))})}));t.Z=O},62728:function(e,t,a){a.r(t),a.d(t,{default:function(){return n.Z},getMenuItemUtilityClass:function(){return o.K},menuItemClasses:function(){return o.Z}});var n=a(82626),o=a(71498)},71498:function(e,t,a){a.d(t,{K:function(){return i}});var n=a(75878),o=a(21217);function i(e){return(0,o.Z)("MuiMenuItem",e)}var r=(0,n.Z)("MuiMenuItem",["root","focusVisible","dense","disabled","divider","gutters","selected"]);t.Z=r}}]);
//# sourceMappingURL=2728.4fced3e7.chunk.js.map