"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[3350],{89891:function(e,t,o){var r=o(45987),n=o(4942),a=o(1413),i=o(72791),c=o(28182),l=o(94419),s=o(12065),u=o(14036),p=o(97278),d=o(93736),m=o(66934),h=o(93785),v=o(80184),Z=["className","color","edge","size","sx"],f=(0,m.ZP)("span",{name:"MuiSwitch",slot:"Root",overridesResolver:function(e,t){var o=e.ownerState;return[t.root,o.edge&&t["edge".concat((0,u.Z)(o.edge))],t["size".concat((0,u.Z)(o.size))]]}})((function(e){var t,o=e.ownerState;return(0,a.Z)((0,a.Z)((0,a.Z)({display:"inline-flex",width:58,height:38,overflow:"hidden",padding:12,boxSizing:"border-box",position:"relative",flexShrink:0,zIndex:0,verticalAlign:"middle","@media print":{colorAdjust:"exact"}},"start"===o.edge&&{marginLeft:-8}),"end"===o.edge&&{marginRight:-8}),"small"===o.size&&(t={width:40,height:24,padding:7},(0,n.Z)(t,"& .".concat(h.Z.thumb),{width:16,height:16}),(0,n.Z)(t,"& .".concat(h.Z.switchBase),(0,n.Z)({padding:4},"&.".concat(h.Z.checked),{transform:"translateX(16px)"})),t))})),g=(0,m.ZP)(p.Z,{name:"MuiSwitch",slot:"SwitchBase",overridesResolver:function(e,t){var o=e.ownerState;return[t.switchBase,(0,n.Z)({},"& .".concat(h.Z.input),t.input),"default"!==o.color&&t["color".concat((0,u.Z)(o.color))]]}})((function(e){var t,o=e.theme;return t={position:"absolute",top:0,left:0,zIndex:1,color:o.vars?o.vars.palette.Switch.defaultColor:"".concat("light"===o.palette.mode?o.palette.common.white:o.palette.grey[300]),transition:o.transitions.create(["left","transform"],{duration:o.transitions.duration.shortest})},(0,n.Z)(t,"&.".concat(h.Z.checked),{transform:"translateX(20px)"}),(0,n.Z)(t,"&.".concat(h.Z.disabled),{color:o.vars?o.vars.palette.Switch.defaultDisabledColor:"".concat("light"===o.palette.mode?o.palette.grey[100]:o.palette.grey[600])}),(0,n.Z)(t,"&.".concat(h.Z.checked," + .").concat(h.Z.track),{opacity:.5}),(0,n.Z)(t,"&.".concat(h.Z.disabled," + .").concat(h.Z.track),{opacity:o.vars?o.vars.opacity.switchTrackDisabled:"".concat("light"===o.palette.mode?.12:.2)}),(0,n.Z)(t,"& .".concat(h.Z.input),{left:"-100%",width:"300%"}),t}),(function(e){var t,o=e.theme,r=e.ownerState;return(0,a.Z)({"&:hover":{backgroundColor:o.vars?"rgba(".concat(o.vars.palette.action.activeChannel," / ").concat(o.vars.palette.action.hoverOpacity,")"):(0,s.Fq)(o.palette.action.active,o.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"default"!==r.color&&(t={},(0,n.Z)(t,"&.".concat(h.Z.checked),(0,n.Z)({color:(o.vars||o).palette[r.color].main,"&:hover":{backgroundColor:o.vars?"rgba(".concat(o.vars.palette[r.color].mainChannel," / ").concat(o.vars.palette.action.hoverOpacity,")"):(0,s.Fq)(o.palette[r.color].main,o.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"&.".concat(h.Z.disabled),{color:o.vars?o.vars.palette.Switch["".concat(r.color,"DisabledColor")]:"".concat("light"===o.palette.mode?(0,s.$n)(o.palette[r.color].main,.62):(0,s._j)(o.palette[r.color].main,.55))})),(0,n.Z)(t,"&.".concat(h.Z.checked," + .").concat(h.Z.track),{backgroundColor:(o.vars||o).palette[r.color].main}),t))})),b=(0,m.ZP)("span",{name:"MuiSwitch",slot:"Track",overridesResolver:function(e,t){return t.track}})((function(e){var t=e.theme;return{height:"100%",width:"100%",borderRadius:7,zIndex:-1,transition:t.transitions.create(["opacity","background-color"],{duration:t.transitions.duration.shortest}),backgroundColor:t.vars?t.vars.palette.common.onBackground:"".concat("light"===t.palette.mode?t.palette.common.black:t.palette.common.white),opacity:t.vars?t.vars.opacity.switchTrack:"".concat("light"===t.palette.mode?.38:.3)}})),w=(0,m.ZP)("span",{name:"MuiSwitch",slot:"Thumb",overridesResolver:function(e,t){return t.thumb}})((function(e){var t=e.theme;return{boxShadow:(t.vars||t).shadows[1],backgroundColor:"currentColor",width:20,height:20,borderRadius:"50%"}})),y=i.forwardRef((function(e,t){var o=(0,d.Z)({props:e,name:"MuiSwitch"}),n=o.className,i=o.color,s=void 0===i?"primary":i,p=o.edge,m=void 0!==p&&p,y=o.size,k=void 0===y?"medium":y,x=o.sx,T=(0,r.Z)(o,Z),R=(0,a.Z)((0,a.Z)({},o),{},{color:s,edge:m,size:k}),S=function(e){var t=e.classes,o=e.edge,r=e.size,n=e.color,i=e.checked,c=e.disabled,s={root:["root",o&&"edge".concat((0,u.Z)(o)),"size".concat((0,u.Z)(r))],switchBase:["switchBase","color".concat((0,u.Z)(n)),i&&"checked",c&&"disabled"],thumb:["thumb"],track:["track"],input:["input"]},p=(0,l.Z)(s,h.H,t);return(0,a.Z)((0,a.Z)({},t),p)}(R),C=(0,v.jsx)(w,{className:S.thumb,ownerState:R});return(0,v.jsxs)(f,{className:(0,c.Z)(S.root,n),sx:x,ownerState:R,children:[(0,v.jsx)(g,(0,a.Z)((0,a.Z)({type:"checkbox",icon:C,checkedIcon:C,ref:t,ownerState:R},T),{},{classes:(0,a.Z)((0,a.Z)({},S),{},{root:S.switchBase})})),(0,v.jsx)(b,{className:S.track,ownerState:R})]})}));t.Z=y},93785:function(e,t,o){o.d(t,{H:function(){return a}});var r=o(75878),n=o(21217);function a(e){return(0,n.Z)("MuiSwitch",e)}var i=(0,r.Z)("MuiSwitch",["root","edgeStart","edgeEnd","switchBase","colorPrimary","colorSecondary","sizeSmall","sizeMedium","checked","disabled","input","thumb","track"]);t.Z=i},34663:function(e,t,o){o.d(t,{Z:function(){return f}});var r=o(45987),n=o(4942),a=o(1413),i=o(72791),c=o(28182),l=o(94419),s=o(93736),u=o(66934),p=o(75878),d=o(21217);function m(e){return(0,d.Z)("MuiToolbar",e)}(0,p.Z)("MuiToolbar",["root","gutters","regular","dense"]);var h=o(80184),v=["className","component","disableGutters","variant"],Z=(0,u.ZP)("div",{name:"MuiToolbar",slot:"Root",overridesResolver:function(e,t){var o=e.ownerState;return[t.root,!o.disableGutters&&t.gutters,t[o.variant]]}})((function(e){var t=e.theme,o=e.ownerState;return(0,a.Z)((0,a.Z)({position:"relative",display:"flex",alignItems:"center"},!o.disableGutters&&(0,n.Z)({paddingLeft:t.spacing(2),paddingRight:t.spacing(2)},t.breakpoints.up("sm"),{paddingLeft:t.spacing(3),paddingRight:t.spacing(3)})),"dense"===o.variant&&{minHeight:48})}),(function(e){var t=e.theme;return"regular"===e.ownerState.variant&&t.mixins.toolbar})),f=i.forwardRef((function(e,t){var o=(0,s.Z)({props:e,name:"MuiToolbar"}),n=o.className,i=o.component,u=void 0===i?"div":i,p=o.disableGutters,d=void 0!==p&&p,f=o.variant,g=void 0===f?"regular":f,b=(0,r.Z)(o,v),w=(0,a.Z)((0,a.Z)({},o),{},{component:u,disableGutters:d,variant:g}),y=function(e){var t=e.classes,o={root:["root",!e.disableGutters&&"gutters",e.variant]};return(0,l.Z)(o,m,t)}(w);return(0,h.jsx)(Z,(0,a.Z)({as:u,className:(0,c.Z)(y.root,n),ref:t,ownerState:w},b))}))},20068:function(e,t,o){o.d(t,{Z:function(){return L}});var r=o(29439),n=o(45987),a=o(4942),i=o(1413),c=o(72791),l=o(28182),s=o(94419),u=o(90183),p=o(12065),d=o(66934),m=o(13967),h=o(93736),v=o(14036),Z=o(13208),f=o(94366),g=o(89683),b=o(42071),w=o(67384),y=o(23031),k=o(98278),x=o(75878),T=o(21217);function R(e){return(0,T.Z)("MuiTooltip",e)}var S=(0,x.Z)("MuiTooltip",["popper","popperInteractive","popperArrow","popperClose","tooltip","tooltipArrow","touch","tooltipPlacementLeft","tooltipPlacementRight","tooltipPlacementTop","tooltipPlacementBottom","arrow"]),C=o(80184),P=["arrow","children","classes","components","componentsProps","describeChild","disableFocusListener","disableHoverListener","disableInteractive","disableTouchListener","enterDelay","enterNextDelay","enterTouchDelay","followCursor","id","leaveDelay","leaveTouchDelay","onClose","onOpen","open","placement","PopperComponent","PopperProps","slotProps","slots","title","TransitionComponent","TransitionProps"];var M=(0,d.ZP)(f.Z,{name:"MuiTooltip",slot:"Popper",overridesResolver:function(e,t){var o=e.ownerState;return[t.popper,!o.disableInteractive&&t.popperInteractive,o.arrow&&t.popperArrow,!o.open&&t.popperClose]}})((function(e){var t,o=e.theme,r=e.ownerState,n=e.open;return(0,i.Z)((0,i.Z)((0,i.Z)({zIndex:(o.vars||o).zIndex.tooltip,pointerEvents:"none"},!r.disableInteractive&&{pointerEvents:"auto"}),!n&&{pointerEvents:"none"}),r.arrow&&(t={},(0,a.Z)(t,'&[data-popper-placement*="bottom"] .'.concat(S.arrow),{top:0,marginTop:"-0.71em","&::before":{transformOrigin:"0 100%"}}),(0,a.Z)(t,'&[data-popper-placement*="top"] .'.concat(S.arrow),{bottom:0,marginBottom:"-0.71em","&::before":{transformOrigin:"100% 0"}}),(0,a.Z)(t,'&[data-popper-placement*="right"] .'.concat(S.arrow),(0,i.Z)((0,i.Z)({},r.isRtl?{right:0,marginRight:"-0.71em"}:{left:0,marginLeft:"-0.71em"}),{},{height:"1em",width:"0.71em","&::before":{transformOrigin:"100% 100%"}})),(0,a.Z)(t,'&[data-popper-placement*="left"] .'.concat(S.arrow),(0,i.Z)((0,i.Z)({},r.isRtl?{left:0,marginLeft:"-0.71em"}:{right:0,marginRight:"-0.71em"}),{},{height:"1em",width:"0.71em","&::before":{transformOrigin:"0 0"}})),t))})),B=(0,d.ZP)("div",{name:"MuiTooltip",slot:"Tooltip",overridesResolver:function(e,t){var o=e.ownerState;return[t.tooltip,o.touch&&t.touch,o.arrow&&t.tooltipArrow,t["tooltipPlacement".concat((0,v.Z)(o.placement.split("-")[0]))]]}})((function(e){var t,o,r=e.theme,n=e.ownerState;return(0,i.Z)((0,i.Z)((0,i.Z)({backgroundColor:r.vars?r.vars.palette.Tooltip.bg:(0,p.Fq)(r.palette.grey[700],.92),borderRadius:(r.vars||r).shape.borderRadius,color:(r.vars||r).palette.common.white,fontFamily:r.typography.fontFamily,padding:"4px 8px",fontSize:r.typography.pxToRem(11),maxWidth:300,margin:2,wordWrap:"break-word",fontWeight:r.typography.fontWeightMedium},n.arrow&&{position:"relative",margin:0}),n.touch&&{padding:"8px 16px",fontSize:r.typography.pxToRem(14),lineHeight:"".concat((o=16/14,Math.round(1e5*o)/1e5),"em"),fontWeight:r.typography.fontWeightRegular}),{},(t={},(0,a.Z)(t,".".concat(S.popper,'[data-popper-placement*="left"] &'),(0,i.Z)({transformOrigin:"right center"},n.isRtl?(0,i.Z)({marginLeft:"14px"},n.touch&&{marginLeft:"24px"}):(0,i.Z)({marginRight:"14px"},n.touch&&{marginRight:"24px"}))),(0,a.Z)(t,".".concat(S.popper,'[data-popper-placement*="right"] &'),(0,i.Z)({transformOrigin:"left center"},n.isRtl?(0,i.Z)({marginRight:"14px"},n.touch&&{marginRight:"24px"}):(0,i.Z)({marginLeft:"14px"},n.touch&&{marginLeft:"24px"}))),(0,a.Z)(t,".".concat(S.popper,'[data-popper-placement*="top"] &'),(0,i.Z)({transformOrigin:"center bottom",marginBottom:"14px"},n.touch&&{marginBottom:"24px"})),(0,a.Z)(t,".".concat(S.popper,'[data-popper-placement*="bottom"] &'),(0,i.Z)({transformOrigin:"center top",marginTop:"14px"},n.touch&&{marginTop:"24px"})),t))})),F=(0,d.ZP)("span",{name:"MuiTooltip",slot:"Arrow",overridesResolver:function(e,t){return t.arrow}})((function(e){var t=e.theme;return{overflow:"hidden",position:"absolute",width:"1em",height:"0.71em",boxSizing:"border-box",color:t.vars?t.vars.palette.Tooltip.bg:(0,p.Fq)(t.palette.grey[700],.9),"&::before":{content:'""',margin:"auto",display:"block",width:"100%",height:"100%",backgroundColor:"currentColor",transform:"rotate(45deg)"}}})),N=!1,O=null,I={x:0,y:0};function z(e,t){return function(o){t&&t(o),e(o)}}var L=c.forwardRef((function(e,t){var o,a,p,d,x,T,S,L,E,j,D,A,W,q,G,H,_,U,X,V=(0,h.Z)({props:e,name:"MuiTooltip"}),Y=V.arrow,$=void 0!==Y&&Y,J=V.children,K=(V.classes,V.components),Q=void 0===K?{}:K,ee=V.componentsProps,te=void 0===ee?{}:ee,oe=V.describeChild,re=void 0!==oe&&oe,ne=V.disableFocusListener,ae=void 0!==ne&&ne,ie=V.disableHoverListener,ce=void 0!==ie&&ie,le=V.disableInteractive,se=void 0!==le&&le,ue=V.disableTouchListener,pe=void 0!==ue&&ue,de=V.enterDelay,me=void 0===de?100:de,he=V.enterNextDelay,ve=void 0===he?0:he,Ze=V.enterTouchDelay,fe=void 0===Ze?700:Ze,ge=V.followCursor,be=void 0!==ge&&ge,we=V.id,ye=V.leaveDelay,ke=void 0===ye?0:ye,xe=V.leaveTouchDelay,Te=void 0===xe?1500:xe,Re=V.onClose,Se=V.onOpen,Ce=V.open,Pe=V.placement,Me=void 0===Pe?"bottom":Pe,Be=V.PopperComponent,Fe=V.PopperProps,Ne=void 0===Fe?{}:Fe,Oe=V.slotProps,Ie=void 0===Oe?{}:Oe,ze=V.slots,Le=void 0===ze?{}:ze,Ee=V.title,je=V.TransitionComponent,De=void 0===je?Z.Z:je,Ae=V.TransitionProps,We=(0,n.Z)(V,P),qe=(0,m.Z)(),Ge="rtl"===qe.direction,He=c.useState(),_e=(0,r.Z)(He,2),Ue=_e[0],Xe=_e[1],Ve=c.useState(null),Ye=(0,r.Z)(Ve,2),$e=Ye[0],Je=Ye[1],Ke=c.useRef(!1),Qe=se||be,et=c.useRef(),tt=c.useRef(),ot=c.useRef(),rt=c.useRef(),nt=(0,k.Z)({controlled:Ce,default:!1,name:"Tooltip",state:"open"}),at=(0,r.Z)(nt,2),it=at[0],ct=at[1],lt=it,st=(0,w.Z)(we),ut=c.useRef(),pt=c.useCallback((function(){void 0!==ut.current&&(document.body.style.WebkitUserSelect=ut.current,ut.current=void 0),clearTimeout(rt.current)}),[]);c.useEffect((function(){return function(){clearTimeout(et.current),clearTimeout(tt.current),clearTimeout(ot.current),pt()}}),[pt]);var dt=function(e){clearTimeout(O),N=!0,ct(!0),Se&&!lt&&Se(e)},mt=(0,g.Z)((function(e){clearTimeout(O),O=setTimeout((function(){N=!1}),800+ke),ct(!1),Re&&lt&&Re(e),clearTimeout(et.current),et.current=setTimeout((function(){Ke.current=!1}),qe.transitions.duration.shortest)})),ht=function(e){Ke.current&&"touchstart"!==e.type||(Ue&&Ue.removeAttribute("title"),clearTimeout(tt.current),clearTimeout(ot.current),me||N&&ve?tt.current=setTimeout((function(){dt(e)}),N?ve:me):dt(e))},vt=function(e){clearTimeout(tt.current),clearTimeout(ot.current),ot.current=setTimeout((function(){mt(e)}),ke)},Zt=(0,y.Z)(),ft=Zt.isFocusVisibleRef,gt=Zt.onBlur,bt=Zt.onFocus,wt=Zt.ref,yt=c.useState(!1),kt=(0,r.Z)(yt,2)[1],xt=function(e){gt(e),!1===ft.current&&(kt(!1),vt(e))},Tt=function(e){Ue||Xe(e.currentTarget),bt(e),!0===ft.current&&(kt(!0),ht(e))},Rt=function(e){Ke.current=!0;var t=J.props;t.onTouchStart&&t.onTouchStart(e)},St=ht,Ct=vt;c.useEffect((function(){if(lt)return document.addEventListener("keydown",e),function(){document.removeEventListener("keydown",e)};function e(e){"Escape"!==e.key&&"Esc"!==e.key||mt(e)}}),[mt,lt]);var Pt=(0,b.Z)(J.ref,wt,Xe,t);Ee||0===Ee||(lt=!1);var Mt=c.useRef(),Bt={},Ft="string"===typeof Ee;re?(Bt.title=lt||!Ft||ce?null:Ee,Bt["aria-describedby"]=lt?st:null):(Bt["aria-label"]=Ft?Ee:null,Bt["aria-labelledby"]=lt&&!Ft?st:null);var Nt=(0,i.Z)((0,i.Z)((0,i.Z)((0,i.Z)({},Bt),We),J.props),{},{className:(0,l.Z)(We.className,J.props.className),onTouchStart:Rt,ref:Pt},be?{onMouseMove:function(e){var t=J.props;t.onMouseMove&&t.onMouseMove(e),I={x:e.clientX,y:e.clientY},Mt.current&&Mt.current.update()}}:{});var Ot={};pe||(Nt.onTouchStart=function(e){Rt(e),clearTimeout(ot.current),clearTimeout(et.current),pt(),ut.current=document.body.style.WebkitUserSelect,document.body.style.WebkitUserSelect="none",rt.current=setTimeout((function(){document.body.style.WebkitUserSelect=ut.current,ht(e)}),fe)},Nt.onTouchEnd=function(e){J.props.onTouchEnd&&J.props.onTouchEnd(e),pt(),clearTimeout(ot.current),ot.current=setTimeout((function(){mt(e)}),Te)}),ce||(Nt.onMouseOver=z(St,Nt.onMouseOver),Nt.onMouseLeave=z(Ct,Nt.onMouseLeave),Qe||(Ot.onMouseOver=St,Ot.onMouseLeave=Ct)),ae||(Nt.onFocus=z(Tt,Nt.onFocus),Nt.onBlur=z(xt,Nt.onBlur),Qe||(Ot.onFocus=Tt,Ot.onBlur=xt));var It=c.useMemo((function(){var e,t=[{name:"arrow",enabled:Boolean($e),options:{element:$e,padding:4}}];return null!=(e=Ne.popperOptions)&&e.modifiers&&(t=t.concat(Ne.popperOptions.modifiers)),(0,i.Z)((0,i.Z)({},Ne.popperOptions),{},{modifiers:t})}),[$e,Ne]),zt=(0,i.Z)((0,i.Z)({},V),{},{isRtl:Ge,arrow:$,disableInteractive:Qe,placement:Me,PopperComponentProp:Be,touch:Ke.current}),Lt=function(e){var t=e.classes,o=e.disableInteractive,r=e.arrow,n=e.touch,a=e.placement,i={popper:["popper",!o&&"popperInteractive",r&&"popperArrow"],tooltip:["tooltip",r&&"tooltipArrow",n&&"touch","tooltipPlacement".concat((0,v.Z)(a.split("-")[0]))],arrow:["arrow"]};return(0,s.Z)(i,R,t)}(zt),Et=null!=(o=null!=(a=Le.popper)?a:Q.Popper)?o:M,jt=null!=(p=null!=(d=null!=(x=Le.transition)?x:Q.Transition)?d:De)?p:Z.Z,Dt=null!=(T=null!=(S=Le.tooltip)?S:Q.Tooltip)?T:B,At=null!=(L=null!=(E=Le.arrow)?E:Q.Arrow)?L:F,Wt=(0,u.Z)(Et,(0,i.Z)((0,i.Z)((0,i.Z)({},Ne),null!=(j=Ie.popper)?j:te.popper),{},{className:(0,l.Z)(Lt.popper,null==Ne?void 0:Ne.className,null==(D=null!=(A=Ie.popper)?A:te.popper)?void 0:D.className)}),zt),qt=(0,u.Z)(jt,(0,i.Z)((0,i.Z)({},Ae),null!=(W=Ie.transition)?W:te.transition),zt),Gt=(0,u.Z)(Dt,(0,i.Z)((0,i.Z)({},null!=(q=Ie.tooltip)?q:te.tooltip),{},{className:(0,l.Z)(Lt.tooltip,null==(G=null!=(H=Ie.tooltip)?H:te.tooltip)?void 0:G.className)}),zt),Ht=(0,u.Z)(At,(0,i.Z)((0,i.Z)({},null!=(_=Ie.arrow)?_:te.arrow),{},{className:(0,l.Z)(Lt.arrow,null==(U=null!=(X=Ie.arrow)?X:te.arrow)?void 0:U.className)}),zt);return(0,C.jsxs)(c.Fragment,{children:[c.cloneElement(J,Nt),(0,C.jsx)(Et,(0,i.Z)((0,i.Z)((0,i.Z)({as:null!=Be?Be:f.Z,placement:Me,anchorEl:be?{getBoundingClientRect:function(){return{top:I.y,left:I.x,right:I.x,bottom:I.y,width:0,height:0}}}:Ue,popperRef:Mt,open:!!Ue&&lt,id:st,transition:!0},Ot),Wt),{},{popperOptions:It,children:function(e){var t=e.TransitionProps;return(0,C.jsx)(jt,(0,i.Z)((0,i.Z)((0,i.Z)({timeout:qe.transitions.duration.shorter},t),qt),{},{children:(0,C.jsxs)(Dt,(0,i.Z)((0,i.Z)({},Gt),{},{children:[Ee,$?(0,C.jsx)(At,(0,i.Z)((0,i.Z)({},Ht),{},{ref:Je})):null]}))}))}}))]})}))},97278:function(e,t,o){o.d(t,{Z:function(){return y}});var r=o(29439),n=o(45987),a=o(1413),i=o(72791),c=o(28182),l=o(94419),s=o(14036),u=o(66934),p=o(98278),d=o(52930),m=o(23701),h=o(75878),v=o(21217);function Z(e){return(0,v.Z)("PrivateSwitchBase",e)}(0,h.Z)("PrivateSwitchBase",["root","checked","disabled","input","edgeStart","edgeEnd"]);var f=o(80184),g=["autoFocus","checked","checkedIcon","className","defaultChecked","disabled","disableFocusRipple","edge","icon","id","inputProps","inputRef","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"],b=(0,u.ZP)(m.Z)((function(e){var t=e.ownerState;return(0,a.Z)((0,a.Z)({padding:9,borderRadius:"50%"},"start"===t.edge&&{marginLeft:"small"===t.size?-3:-12}),"end"===t.edge&&{marginRight:"small"===t.size?-3:-12})})),w=(0,u.ZP)("input")({cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0,zIndex:1}),y=i.forwardRef((function(e,t){var o=e.autoFocus,i=e.checked,u=e.checkedIcon,m=e.className,h=e.defaultChecked,v=e.disabled,y=e.disableFocusRipple,k=void 0!==y&&y,x=e.edge,T=void 0!==x&&x,R=e.icon,S=e.id,C=e.inputProps,P=e.inputRef,M=e.name,B=e.onBlur,F=e.onChange,N=e.onFocus,O=e.readOnly,I=e.required,z=void 0!==I&&I,L=e.tabIndex,E=e.type,j=e.value,D=(0,n.Z)(e,g),A=(0,p.Z)({controlled:i,default:Boolean(h),name:"SwitchBase",state:"checked"}),W=(0,r.Z)(A,2),q=W[0],G=W[1],H=(0,d.Z)(),_=v;H&&"undefined"===typeof _&&(_=H.disabled);var U="checkbox"===E||"radio"===E,X=(0,a.Z)((0,a.Z)({},e),{},{checked:q,disabled:_,disableFocusRipple:k,edge:T}),V=function(e){var t=e.classes,o=e.checked,r=e.disabled,n=e.edge,a={root:["root",o&&"checked",r&&"disabled",n&&"edge".concat((0,s.Z)(n))],input:["input"]};return(0,l.Z)(a,Z,t)}(X);return(0,f.jsxs)(b,(0,a.Z)((0,a.Z)({component:"span",className:(0,c.Z)(V.root,m),centerRipple:!0,focusRipple:!k,disabled:_,tabIndex:null,role:void 0,onFocus:function(e){N&&N(e),H&&H.onFocus&&H.onFocus(e)},onBlur:function(e){B&&B(e),H&&H.onBlur&&H.onBlur(e)},ownerState:X,ref:t},D),{},{children:[(0,f.jsx)(w,(0,a.Z)((0,a.Z)({autoFocus:o,checked:i,defaultChecked:h,className:V.input,disabled:_,id:U?S:void 0,name:M,onChange:function(e){if(!e.nativeEvent.defaultPrevented){var t=e.target.checked;G(t),F&&F(e,t)}},readOnly:O,ref:P,required:z,ownerState:X,tabIndex:L,type:E},"checkbox"===E&&void 0===j?{}:{value:j}),C)),q?u:R]}))}))}}]);
//# sourceMappingURL=3350.ee189bfe.chunk.js.map