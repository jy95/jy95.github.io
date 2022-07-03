"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[6002],{3034:function(e,n,o){o.d(n,{Z:function(){return w}});var t=o(4942),a=o(3366),c=o(7462),r=o(2791),i=o(4419),d=o(2065),l=o(7278),u=o(4223),s=o(184),p=(0,u.Z)((0,s.jsx)("path",{d:"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}),"CheckBoxOutlineBlank"),h=(0,u.Z)((0,s.jsx)("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"}),"CheckBox"),f=(0,u.Z)((0,s.jsx)("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"}),"IndeterminateCheckBox"),v=o(4036),m=o(3736),Z=o(7630),b=o(4178),k=["checkedIcon","color","icon","indeterminate","indeterminateIcon","inputProps","size"],g=(0,Z.ZP)(l.Z,{shouldForwardProp:function(e){return(0,Z.FO)(e)||"classes"===e},name:"MuiCheckbox",slot:"Root",overridesResolver:function(e,n){var o=e.ownerState;return[n.root,o.indeterminate&&n.indeterminate,"default"!==o.color&&n["color".concat((0,v.Z)(o.color))]]}})((function(e){var n,o=e.theme,a=e.ownerState;return(0,c.Z)({color:(o.vars||o).palette.text.secondary},!a.disableRipple&&{"&:hover":{backgroundColor:o.vars?"rgba(".concat("default"===a.color?o.vars.palette.action.activeChannel:o.vars.palette.primary.mainChannel," / ").concat(o.vars.palette.action.hoverOpacity,")"):(0,d.Fq)("default"===a.color?o.palette.action.active:o.palette[a.color].main,o.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"default"!==a.color&&(n={},(0,t.Z)(n,"&.".concat(b.Z.checked,", &.").concat(b.Z.indeterminate),{color:(o.vars||o).palette[a.color].main}),(0,t.Z)(n,"&.".concat(b.Z.disabled),{color:(o.vars||o).palette.action.disabled}),n))})),x=(0,s.jsx)(h,{}),y=(0,s.jsx)(p,{}),C=(0,s.jsx)(f,{}),w=r.forwardRef((function(e,n){var o,t,d=(0,m.Z)({props:e,name:"MuiCheckbox"}),l=d.checkedIcon,u=void 0===l?x:l,p=d.color,h=void 0===p?"primary":p,f=d.icon,Z=void 0===f?y:f,w=d.indeterminate,z=void 0!==w&&w,S=d.indeterminateIcon,F=void 0===S?C:S,R=d.inputProps,B=d.size,I=void 0===B?"medium":B,P=(0,a.Z)(d,k),j=z?F:Z,M=z?F:u,O=(0,c.Z)({},d,{color:h,indeterminate:z,size:I}),H=function(e){var n=e.classes,o=e.indeterminate,t=e.color,a={root:["root",o&&"indeterminate","color".concat((0,v.Z)(t))]},r=(0,i.Z)(a,b.y,n);return(0,c.Z)({},n,r)}(O);return(0,s.jsx)(g,(0,c.Z)({type:"checkbox",inputProps:(0,c.Z)({"data-indeterminate":z},R),icon:r.cloneElement(j,{fontSize:null!=(o=j.props.fontSize)?o:I}),checkedIcon:r.cloneElement(M,{fontSize:null!=(t=M.props.fontSize)?t:I}),ownerState:O,ref:n},P,{classes:H}))}))},4178:function(e,n,o){o.d(n,{y:function(){return a}});var t=o(1217);function a(e){return(0,t.Z)("MuiCheckbox",e)}var c=(0,o(5878).Z)("MuiCheckbox",["root","checked","disabled","indeterminate","colorPrimary","colorSecondary"]);n.Z=c},6002:function(e,n,o){o.r(n),o.d(n,{checkboxClasses:function(){return a.Z},default:function(){return t.Z},getCheckboxUtilityClass:function(){return a.y}});var t=o(3034),a=o(4178)},7278:function(e,n,o){o.d(n,{Z:function(){return g}});var t=o(9439),a=o(3366),c=o(7462),r=o(2791),i=o(8182),d=o(4419),l=o(4036),u=o(7630),s=o(8278),p=o(2930),h=o(3701),f=o(1217);function v(e){return(0,f.Z)("PrivateSwitchBase",e)}(0,o(5878).Z)("PrivateSwitchBase",["root","checked","disabled","input","edgeStart","edgeEnd"]);var m=o(184),Z=["autoFocus","checked","checkedIcon","className","defaultChecked","disabled","disableFocusRipple","edge","icon","id","inputProps","inputRef","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"],b=(0,u.ZP)(h.Z)((function(e){var n=e.ownerState;return(0,c.Z)({padding:9,borderRadius:"50%"},"start"===n.edge&&{marginLeft:"small"===n.size?-3:-12},"end"===n.edge&&{marginRight:"small"===n.size?-3:-12})})),k=(0,u.ZP)("input")({cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0,zIndex:1}),g=r.forwardRef((function(e,n){var o=e.autoFocus,r=e.checked,u=e.checkedIcon,h=e.className,f=e.defaultChecked,g=e.disabled,x=e.disableFocusRipple,y=void 0!==x&&x,C=e.edge,w=void 0!==C&&C,z=e.icon,S=e.id,F=e.inputProps,R=e.inputRef,B=e.name,I=e.onBlur,P=e.onChange,j=e.onFocus,M=e.readOnly,O=e.required,H=e.tabIndex,q=e.type,E=e.value,N=(0,a.Z)(e,Z),V=(0,s.Z)({controlled:r,default:Boolean(f),name:"SwitchBase",state:"checked"}),_=(0,t.Z)(V,2),L=_[0],U=_[1],A=(0,p.Z)(),D=g;A&&"undefined"===typeof D&&(D=A.disabled);var G="checkbox"===q||"radio"===q,J=(0,c.Z)({},e,{checked:L,disabled:D,disableFocusRipple:y,edge:w}),K=function(e){var n=e.classes,o=e.checked,t=e.disabled,a=e.edge,c={root:["root",o&&"checked",t&&"disabled",a&&"edge".concat((0,l.Z)(a))],input:["input"]};return(0,d.Z)(c,v,n)}(J);return(0,m.jsxs)(b,(0,c.Z)({component:"span",className:(0,i.Z)(K.root,h),centerRipple:!0,focusRipple:!y,disabled:D,tabIndex:null,role:void 0,onFocus:function(e){j&&j(e),A&&A.onFocus&&A.onFocus(e)},onBlur:function(e){I&&I(e),A&&A.onBlur&&A.onBlur(e)},ownerState:J,ref:n},N,{children:[(0,m.jsx)(k,(0,c.Z)({autoFocus:o,checked:r,defaultChecked:f,className:K.input,disabled:D,id:G&&S,name:B,onChange:function(e){if(!e.nativeEvent.defaultPrevented){var n=e.target.checked;U(n),P&&P(e,n)}},readOnly:M,ref:R,required:O,ownerState:J,tabIndex:H,type:q},"checkbox"===q&&void 0===E?{}:{value:E},F)),L?u:z]}))}))}}]);
//# sourceMappingURL=6002.4fe00ddd.chunk.js.map