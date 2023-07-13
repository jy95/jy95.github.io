"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[2421],{699:function(e,n,r){var t=r(29439),o=r(72791),a=r(57689),i=r(95193),l=r(57621),c=r(42169),s=r(66647),u=r(62606),d=r(80184),h=(0,o.lazy)((function(){return r.e(89).then(r.bind(r,70089))}));n.Z=function(e){var n=(0,a.s0)(),r=e.game,m=(0,i.Z)((function(e){return e.breakpoints.down("md")})),f=(0,o.useState)(!1),v=(0,t.Z)(f,2),p=v[0],g=v[1],x=r.title,b=r.url,y="PLAYLIST"===r.url_type?"/playlist/"+r.id:"/video/"+r.id;return(0,d.jsxs)(l.Z,{sx:{position:"relative"},children:[(0,d.jsx)(s.Z,{onClick:function(){m?window.location.href=b:n(y)},onContextMenu:function(e){e.preventDefault(),g(!0)},sx:{height:"inherit",zIndex:1},children:(0,d.jsx)(c.Z,{sx:{zIndex:1},title:x,children:(0,d.jsx)(u.Z,{src:r.imagePath,srcSet:r.srcSet,sizes:r.sizes,alt:x,loading:"lazy",disableSpinner:!0})})}),(0,d.jsx)(o.Suspense,{fallback:null,children:(0,d.jsx)(h,{game:r,contextMenuState:[p,g]})})]})}},92421:function(e,n,r){r.r(n),r.d(n,{default:function(){return je}});var t=r(4942),o=r(72791),a=r(66934),i=r(95048),l=r(15655),c=r(39230),s=r(63366),u=r(87462),d=r(28182),h=r(94419),m=r(12065),f=r(93736),v=r(14036),p=r(35527),g=r(75878),x=r(21217);function b(e){return(0,x.Z)("MuiAlert",e)}var y=(0,g.Z)("MuiAlert",["root","action","icon","message","filled","filledSuccess","filledInfo","filledWarning","filledError","outlined","outlinedSuccess","outlinedInfo","outlinedWarning","outlinedError","standard","standardSuccess","standardInfo","standardWarning","standardError"]),j=r(13400),Z=r(74223),z=r(80184),C=(0,Z.Z)((0,z.jsx)("path",{d:"M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"}),"SuccessOutlined"),S=(0,Z.Z)((0,z.jsx)("path",{d:"M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"}),"ReportProblemOutlined"),L=(0,Z.Z)((0,z.jsx)("path",{d:"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"ErrorOutline"),k=(0,Z.Z)((0,z.jsx)("path",{d:"M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"}),"InfoOutlined"),M=r(8799),A=["action","children","className","closeText","color","components","componentsProps","icon","iconMapping","onClose","role","severity","slotProps","slots","variant"],P=(0,a.ZP)(p.Z,{name:"MuiAlert",slot:"Root",overridesResolver:function(e,n){var r=e.ownerState;return[n.root,n[r.variant],n["".concat(r.variant).concat((0,v.Z)(r.color||r.severity))]]}})((function(e){var n=e.theme,r=e.ownerState,o="light"===n.palette.mode?m._j:m.$n,a="light"===n.palette.mode?m.$n:m._j,i=r.color||r.severity;return(0,u.Z)({},n.typography.body2,{backgroundColor:"transparent",display:"flex",padding:"6px 16px"},i&&"standard"===r.variant&&(0,t.Z)({color:n.vars?n.vars.palette.Alert["".concat(i,"Color")]:o(n.palette[i].light,.6),backgroundColor:n.vars?n.vars.palette.Alert["".concat(i,"StandardBg")]:a(n.palette[i].light,.9)},"& .".concat(y.icon),n.vars?{color:n.vars.palette.Alert["".concat(i,"IconColor")]}:{color:n.palette[i].main}),i&&"outlined"===r.variant&&(0,t.Z)({color:n.vars?n.vars.palette.Alert["".concat(i,"Color")]:o(n.palette[i].light,.6),border:"1px solid ".concat((n.vars||n).palette[i].light)},"& .".concat(y.icon),n.vars?{color:n.vars.palette.Alert["".concat(i,"IconColor")]}:{color:n.palette[i].main}),i&&"filled"===r.variant&&(0,u.Z)({fontWeight:n.typography.fontWeightMedium},n.vars?{color:n.vars.palette.Alert["".concat(i,"FilledColor")],backgroundColor:n.vars.palette.Alert["".concat(i,"FilledBg")]}:{backgroundColor:"dark"===n.palette.mode?n.palette[i].dark:n.palette[i].main,color:n.palette.getContrastText(n.palette[i].main)}))})),F=(0,a.ZP)("div",{name:"MuiAlert",slot:"Icon",overridesResolver:function(e,n){return n.icon}})({marginRight:12,padding:"7px 0",display:"flex",fontSize:22,opacity:.9}),w=(0,a.ZP)("div",{name:"MuiAlert",slot:"Message",overridesResolver:function(e,n){return n.message}})({padding:"8px 0",minWidth:0,overflow:"auto"}),I=(0,a.ZP)("div",{name:"MuiAlert",slot:"Action",overridesResolver:function(e,n){return n.action}})({display:"flex",alignItems:"flex-start",padding:"4px 0 0 16px",marginLeft:"auto",marginRight:-8}),O={success:(0,z.jsx)(C,{fontSize:"inherit"}),warning:(0,z.jsx)(S,{fontSize:"inherit"}),error:(0,z.jsx)(L,{fontSize:"inherit"}),info:(0,z.jsx)(k,{fontSize:"inherit"})},R=o.forwardRef((function(e,n){var r,t,o,a,i,l,c=(0,f.Z)({props:e,name:"MuiAlert"}),m=c.action,p=c.children,g=c.className,x=c.closeText,y=void 0===x?"Close":x,Z=c.color,C=c.components,S=void 0===C?{}:C,L=c.componentsProps,k=void 0===L?{}:L,R=c.icon,H=c.iconMapping,G=void 0===H?O:H,V=c.onClose,T=c.role,E=void 0===T?"alert":T,_=c.severity,B=void 0===_?"success":_,N=c.slotProps,$=void 0===N?{}:N,D=c.slots,W=void 0===D?{}:D,q=c.variant,U=void 0===q?"standard":q,Q=(0,s.Z)(c,A),Y=(0,u.Z)({},c,{color:Z,severity:B,variant:U}),J=function(e){var n=e.variant,r=e.color,t=e.severity,o=e.classes,a={root:["root","".concat(n).concat((0,v.Z)(r||t)),"".concat(n)],icon:["icon"],message:["message"],action:["action"]};return(0,h.Z)(a,b,o)}(Y),K=null!=(r=null!=(t=W.closeButton)?t:S.CloseButton)?r:j.Z,X=null!=(o=null!=(a=W.closeIcon)?a:S.CloseIcon)?o:M.Z,ee=null!=(i=$.closeButton)?i:k.closeButton,ne=null!=(l=$.closeIcon)?l:k.closeIcon;return(0,z.jsxs)(P,(0,u.Z)({role:E,elevation:0,ownerState:Y,className:(0,d.Z)(J.root,g),ref:n},Q,{children:[!1!==R?(0,z.jsx)(F,{ownerState:Y,className:J.icon,children:R||G[B]||O[B]}):null,(0,z.jsx)(w,{ownerState:Y,className:J.message,children:p}),null!=m?(0,z.jsx)(I,{ownerState:Y,className:J.action,children:m}):null,null==m&&V?(0,z.jsx)(I,{ownerState:Y,className:J.action,children:(0,z.jsx)(K,(0,u.Z)({size:"small","aria-label":y,title:y,color:"inherit",onClick:V},ee,{children:(0,z.jsx)(X,(0,u.Z)({fontSize:"small"},ne))}))}):null]}))})),H=R,G=r(17009),V=r(61889),T=r(15927),E=r(699),_=r(1413),B=r(93433),N=r(29439),$=r(95193),D=r(30439),W=r(67071),q=(0,o.lazy)((function(){return r.e(6002).then(r.bind(r,26002))})),U=(0,o.lazy)((function(){return r.e(5854).then(r.bind(r,15854))})),Q=(0,o.lazy)((function(){return r.e(464).then(r.bind(r,80464))})),Y=(0,o.lazy)((function(){return r.e(2728).then(r.bind(r,62728))})),J=(0,o.lazy)((function(){return r.e(1122).then(r.bind(r,51122))})),K=(0,o.lazy)((function(){return r.e(6646).then(r.bind(r,16646))})),X=(0,o.lazy)((function(){return r.e(6389).then(r.bind(r,46389))})),ee=(0,o.lazy)((function(){return r.e(7039).then(r.bind(r,17039))})),ne=(0,o.lazy)((function(){return r.e(8778).then(r.bind(r,38778))})),re=(0,o.lazy)((function(){return r.e(5401).then(r.bind(r,5401))})),te=(0,o.lazy)((function(){return r.e(3198).then(r.bind(r,53198))})),oe=(0,o.lazy)((function(){return r.e(7368).then(r.bind(r,77368))})),ae=(0,o.lazy)((function(){return r.e(2812).then(r.bind(r,12812))})),ie=(0,o.lazy)((function(){return r.e(366).then(r.bind(r,70366))})),le=(0,o.lazy)((function(){return r.e(6759).then(r.bind(r,26759))}));var ce=function(e){var n=(0,c.$G)("common").t,r=(0,G.T)(),t=(0,o.useState)(!1),a=(0,N.Z)(t,2),i=a[0],l=a[1],s=(0,G.C)((function(e){return e.games.sorters})),u=(0,$.Z)((function(e){return e.breakpoints.down("md")})),d=(0,o.useState)((0,B.Z)(s)),h=(0,N.Z)(d,2),m=h[0],f=h[1],v={name:"gamesLibrary.sortLabels.name",releaseDate:"gamesLibrary.sortLabels.releaseDate",duration:"gamesLibrary.sortLabels.duration"},p=function(e){var n=e.index,r=(0,B.Z)(m);switch(e.type){case"criteriaOrder":var t="ASC"===r[n][1]?"DESC":"ASC";r[n]=[r[n][0],t],f(r);break;case"changeFieldOrder":r[n]=[e.field,r[n][1]],f(r)}},g=function(e){e.criteria;var r=e.index,t={value:m[r][0],id:"searchCriteria_"+r,label:n("gamesLibrary.sortForm.criteria"),onChange:function(e){return p({index:r,field:e.target.value.toString(),type:"changeFieldOrder"})}};return u?(0,z.jsxs)(K,{children:[(0,z.jsx)(J,{htmlFor:"searchCriteria_"+r,children:n("gamesLibrary.sortForm.criteria")}),(0,z.jsx)(Q,(0,_.Z)((0,_.Z)({},t),{},{children:Object.entries(v).map((function(e){var r=(0,N.Z)(e,2),t=r[0],o=r[1];return(0,z.jsx)("option",{value:t,children:n("".concat(o))},t)}))}))]}):(0,z.jsxs)(K,{children:[(0,z.jsx)(J,{id:"searchCriteriaLabel_"+r,children:n("gamesLibrary.sortForm.criteria")}),(0,z.jsx)(U,(0,_.Z)((0,_.Z)({},t),{},{labelId:"searchCriteriaLabel_"+r,children:Object.entries(v).map((function(e){var r=(0,N.Z)(e,2),t=r[0],o=r[1];return(0,z.jsx)(Y,{value:t,children:n("".concat(o))},t)}))}))]})};return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(D.Z,{variant:"contained",onClick:function(){return l(!0)},children:n("gamesLibrary.sortButtonLabel")}),(0,z.jsx)(o.Suspense,{fallback:null,children:(0,z.jsxs)(re,{fullScreen:u,open:i,onClose:function(){return l(!1)},"aria-labelledby":"games-sorters-dialog",children:[(0,z.jsx)(te,{id:"games-sorters-dialog",children:n("gamesLibrary.sortForm.title")}),(0,z.jsx)(oe,{children:(0,z.jsx)(X,{children:m.map((function(e,r){var t=(0,N.Z)(e,2),o=t[0];t[1];return(0,z.jsxs)(ee,{children:[(0,z.jsx)(ne,{primary:n(0===r?"gamesLibrary.sortForm.firstSort":"gamesLibrary.sortForm.nextSort")}),(0,z.jsx)(g,{criteria:o,index:r},r),(0,z.jsx)(q,{edge:"end",checked:"ASC"!==m[r][1],onChange:function(){return p({index:r,field:o,type:"criteriaOrder"})},checkedIcon:(0,z.jsx)(ie,{}),icon:(0,z.jsx)(le,{})})]},r)}))})}),(0,z.jsxs)(ae,{children:[(0,z.jsx)(D.Z,{autoFocus:!0,onClick:function(){f(s),l(!1)},children:n("gamesLibrary.sortForm.cancelButton")}),(0,z.jsx)(D.Z,{autoFocus:!0,onClick:function(){l(!1),r((0,W.bj)(m))},children:n("gamesLibrary.sortForm.sortButton")})]})]})})]})},se=r(5712),ue=r(27391),de=["Action","Adventure","Arcade","Board Games","Card","Casual","Educational","Family","Fighting","Indie","MMORPG","Platformer","Puzzle","RPG","Racing","Shooter","Simulation","Sports","Strategy","Misc"];var he=function(e){var n=(0,G.T)(),r=(0,G.C)((function(e){return(0,W.Zj)(e)})),t=(0,c.$G)("common").t,o=de.map((function(e){return{label:t("gamesLibrary.gamesGenres.".concat(e)),key:e}})).sort((function(e,n){return e.label<n.label?-1:e.label>n.label?1:0}));return(0,z.jsx)(z.Fragment,{children:(0,z.jsx)(se.Z,{multiple:!0,openOnFocus:!0,filterSelectedOptions:!0,id:"select-game-genre",limitTags:3,options:o,getOptionLabel:function(e){return e.label},isOptionEqualToValue:function(e,n){return Array.isArray(n)?n.some((function(n){return n.key===e.key})):n.key===e.key},value:r.map((function(e){return{label:t("gamesLibrary.gamesGenres.".concat(e)),key:e}})),renderInput:function(e){return(0,z.jsx)(ue.Z,(0,_.Z)((0,_.Z)({},e),{},{label:t("gamesLibrary.filtersLabels.genres")}))},onChange:function(e,r){n((0,W.bf)(r.map((function(e){return e.key}))))}})})},me=r(99259),fe=r(95571),ve=["GBA","PC","PS1","PS2","PS3","PSP"];var pe=function(e){var n=(0,c.$G)("common").t,r=(0,G.T)(),t=(0,G.C)((function(e){return(0,W.Qp)(e)})),a=ve.map((function(e){return{label:e,key:e}}));return(0,z.jsx)(z.Fragment,{children:(0,z.jsx)(se.Z,{id:"select-game-platform",openOnFocus:!0,options:a,getOptionLabel:function(e){return e.label},isOptionEqualToValue:function(e,n){return Array.isArray(n)?n.some((function(n){return n.key===e.key})):n.key===e.key},renderInput:function(e){return(0,z.jsx)(ue.Z,(0,_.Z)((0,_.Z)({},e),{},{label:n("gamesLibrary.filtersLabels.platform")}))},renderOption:function(e,n,r){return(0,o.createElement)("li",(0,_.Z)((0,_.Z)({},e),{},{key:n.key}),(0,z.jsx)(me.Z,{titleAccess:n.label,children:fe.Z[n.key]}),n.label)},onChange:function(e,n){var t=n?(null===n||void 0===n?void 0:n.key)||n:"";r((0,W.O1)(t))},value:t?{key:t,label:t}:null})})};var ge=function(e){var n=(0,c.$G)("common").t,r=(0,G.T)(),t=(0,G.C)((function(e){return(0,B.Z)(new Set(e.games.games.map((function(e){return e.title}))))})),o=(0,G.C)((function(e){return(0,W.Sr)(e)}));return(0,z.jsx)(z.Fragment,{children:(0,z.jsx)(se.Z,{id:"search-game-title",freeSolo:!0,options:t,value:o,renderInput:function(e){return(0,z.jsx)(ue.Z,(0,_.Z)((0,_.Z)({},e),{},{label:n("gamesLibrary.filtersLabels.title")}))},onInputChange:function(e,n){r((0,W.Hn)(n))}})})},xe="GamesGalleryGrid",be={gamesCriteria:"".concat(xe,"-gamesCriteria"),loaderRef:"".concat(xe,"-loaderRef")},ye=(0,a.ZP)("div")((function(e){var n,r,o=e.theme;return r={},(0,t.Z)(r,"& .".concat(be.gamesCriteria),(n={display:"flex"},(0,t.Z)(n,o.breakpoints.down("md"),{flexDirection:"column",rowGap:"8px"}),(0,t.Z)(n,o.breakpoints.up("md"),{flexDirection:"row",justifyContent:"flex-end"}),n)),(0,t.Z)(r,"& .".concat(be.loaderRef),{width:"1px",height:"1px",position:"absolute"}),r}));var je=function(e){var n=(0,c.$G)("common").t,r=(0,G.T)(),t=(0,G.C)((function(e){return(0,W.aD)(e)})),a=(0,G.C)((function(e){return e.games}),i.wU),s=a.loading,u=a.error,d=a.currentItemCount,h=a.totalItems,m=a.activeFilters,f=a.sorters,v=a.initialLoad,p=a.scrollLoading,g=d<=h;(0,o.useEffect)((function(){r((0,W.kT)({currentFilters:m,sortStates:f}))}),[]);var x=(0,o.useCallback)((function(){r((0,W.OG)())}),[]),b=(0,l.Z)({loadMore:x,canLoadMore:g,initialise:!v,debug:!1}).loaderRef;return(0,z.jsx)(T.Z,{loading:s,error:u,reloadFct:function(){r((0,W.kT)({currentFilters:m,sortStates:f}))},component:(0,z.jsxs)(ye,{children:[(0,z.jsxs)(V.ZP,{container:!0,className:be.gamesCriteria,children:[(0,z.jsx)(V.ZP,{item:!0,xs:12,md:1,children:(0,z.jsx)(ce,{})}),(0,z.jsx)(V.ZP,{item:!0,xs:12,md:2,children:(0,z.jsx)(pe,{variant:"standard"})}),(0,z.jsx)(V.ZP,{item:!0,xs:12,md:5,children:(0,z.jsx)(he,{variant:"standard"})}),(0,z.jsx)(V.ZP,{item:!0,xs:12,md:4,children:(0,z.jsx)(ge,{})})]}),(0,z.jsx)(V.ZP,{container:!0,spacing:1,style:{rowGap:"15px"},children:t.map((function(e){return(0,z.jsx)(V.ZP,{item:!0,xs:6,md:4,lg:1.5,children:(0,z.jsx)(E.Z,{game:e})},e.id)}))}),!v&&(0,z.jsx)("div",{ref:b,className:be.loaderRef}),p&&(0,z.jsx)(H,{severity:"info",children:n("common.loading")}),!g&&(0,z.jsx)(H,{severity:"info",children:n("common.noResults")})]})})}},95571:function(e,n,r){var t=r(80184),o={PS1:(0,t.jsx)("path",{d:"M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.002 4.362-3.153 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.391-1.502h-.002zm4.656 16.242l6.296-2.275c.715-.258.826-.625.246-.818-.586-.192-1.637-.139-2.357.123l-4.205 1.499v-2.385l.24-.085s1.201-.42 2.913-.615c1.696-.18 3.785.029 5.437.661 1.848.601 2.041 1.472 1.576 2.072s-1.622 1.036-1.622 1.036l-8.544 3.107v-2.297l.02-.023zM1.808 18.6c-1.9-.545-2.214-1.668-1.352-2.321.801-.585 2.159-1.051 2.159-1.051l5.616-2.013v2.313L4.206 17c-.705.271-.825.632-.239.826s1.637.15 2.343-.12L8.248 17v2.074c-.121.029-.256.044-.391.073-1.938.331-3.995.196-6.037-.479l-.012-.068z"}),PS2:(0,t.jsx)("path",{d:"M7.46 13.779v.292h4.142v-3.85h3.796V9.93h-4.115v3.85zm16.248-3.558v1.62h-7.195v2.23H24v-.292h-7.168v-1.646H24V9.929h-7.487v.292zm-16.513.0v1.62H0v2.23h.292v-1.938H7.46V9.929H0v.292z"}),PS3:(0,t.jsx)("path",{d:"M15.363 9.438h-3.148c-.97 0-1.447.6-1.447 1.38v2.366c0 .483-.228.83-.71.83H7.304c-.02 0-.035.017-.035.035v.47c0 .02.01.032.03.032h3.11c.97 0 1.45-.597 1.45-1.377V10.81c0-.484.225-.832.71-.832h2.782c.02 0 .04-.014.04-.033V9.47c0-.02-.02-.035-.04-.035zm-9.267 0H.038c-.022 0-.038.017-.038.035v.477c0 .02.016.036.038.036h5.694c.48 0 .71.347.71.83s-.228.83-.71.83H1.228c-.7 0-1.227.587-1.227 1.366v1.513c0 .02.02.037.04.037h1.03c.02 0 .04-.016.04-.037v-1.513c0-.48.28-.82.68-.82H6.1c.97 0 1.444-.595 1.444-1.375s-.473-1.38-1.442-1.38zm17.454 2.498c-.015-.015-.015-.04 0-.056.3-.25.45-.627.45-1.062 0-.778-.474-1.38-1.446-1.38h-6.057c-.02 0-.036.018-.036.038v.475c0 .02.02.04.04.04h5.7c.48 0 .715.35.715.83s-.23.83-.712.83h-5.7c-.02 0-.036.02-.036.04v.48c0 .02.016.034.037.034h5.7c.63.007.71.62.71.93v.06c0 .485-.23.833-.71.833h-5.7c-.02 0-.036.015-.036.034v.477c0 .02.015.037.036.037h6.05c.973 0 1.446-.645 1.446-1.38v-.057c0-.47-.15-.916-.45-1.19z"}),PSP:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M3.238 9.313h5.133v1.52h-4.93v1.32h-.203v-1.52h4.93V9.512h-4.93v-.199m11.539 1.519v1.32h-.199v-1.52h4.926v-1.12h-4.926v-.199h5.129v1.52h-4.93"}),(0,t.jsx)("path",{d:"M10.988 9.313v2.641H8.371v.199h2.828V9.512h2.613v-.199h-2.824"})]}),PC:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("path",{d:"M4.539 7.516v6.371h3.148l.008-2.148.012-2.141.918-.012.918-.008 1.004-.988 1.004-.984V3.148l-1.023-1.004-1.02-1.004H4.539z"}),(0,t.jsx)("path",{d:"M8.281 5.41l.008 1.703L8 7.102l-.293-.012-.012-1.684-.008-1.684.25-.008.293-.012c.023.004.043.605.051 1.707zm4.813-3.262l-1.02 1v8.77l1.004.984 1.008.984h3.371l1.004-.988 1-.98-.016-3.5h-3.301l-.012 1.461-.008 1.469h-.523V3.719h.523l.008 1.207.012 1.207h3.301l.016-2.984-1.02-1-1.023-1.008h-3.301z"})]}),GBA:(0,t.jsx)("path",{d:"M12 19.199c-2.543 0-4.32-.238-5.281-.77-.191-.094-.336-.141-.43-.141-2.879-.098-4.32-1.105-4.898-1.73-.285-.289-.43-.621-.43-1.055 0-2.113.094-6 .48-7.488.191-.766.91-1.297 1.727-1.297s2.063-.77 2.883-1.488c.379-.285.813-.43 1.246-.43h9.453c.48 0 .961.191 1.25.48.625.574 1.969 1.438 2.832 1.438.816 0 1.535.531 1.727 1.297.336 1.297.48 4.656.48 7.441 0 .434-.145.766-.43 1.055-.625.625-2.02 1.633-4.898 1.727-.191 0-.336.051-.383.098-.863.574-2.641.863-5.328.863zm-5.711-1.871c.238 0 .527.098.863.242.48.238 1.68.668 4.848.668 3.359 0 4.465-.477 4.75-.668.242-.195.578-.289.961-.289 2.594-.098 3.84-1.059 4.223-1.441.098-.098.145-.238.145-.383 0-2.641-.141-6-.477-7.152-.098-.336-.434-.574-.77-.574C19.535 7.73 18 6.625 17.328 6c-.191-.191-.434-.191-.578-.191H7.297c-.191 0-.434.098-.625.242-.285.238-2.016 1.629-3.504 1.629-.383 0-.672.242-.766.578-.336 1.199-.48 4.559-.48 7.246 0 .145.047.289.145.387.383.379 1.629 1.34 4.223 1.438zM3.84 8.641h.961v2.879H3.84zm-.961 1.918v-.957h2.883v.957zm17.52-1.918a.74.74 0 0 1 .723.719.74.74 0 0 1-.723.719.74.74 0 0 1-.719-.719.74.74 0 0 1 .719-.719zm-1.437 1.438a.74.74 0 0 1 .719.723.74.74 0 0 1-.719.719.74.74 0 0 1-.723-.719.74.74 0 0 1 .723-.723zm-13.25 3.793c.098-.238 0-.527-.191-.621l-1.441-.723c-.238-.098-.527 0-.621.191-.098.242 0 .531.191.625l1.441.719c.047.047.141.047.191.047.191.051.336-.043.43-.238zm0 1.922c.098-.242 0-.527-.191-.625l-1.441-.719c-.238-.098-.527 0-.621.191-.098.238 0 .527.191.625l1.441.719c.047.047.141.047.191.047.191.047.336-.047.43-.238zm10.129.047H8.16c-.574 0-.961-.383-.961-.961V8.641c0-.578.387-.961.961-.961h7.68c.574 0 .961.383.961.961v6.238c0 .578-.387.961-.961.961zM8.16 8.641v6.238h7.68V8.641zm10.414 5.23l1.922-.961c.094-.047.145-.191.094-.336-.047-.094-.191-.145-.336-.094l-1.918.961c-.098.047-.145.191-.098.336.051.094.145.145.191.145.098 0 .145 0 .145-.051zm0 .961l1.922-.961c.094-.047.145-.191.094-.336-.047-.094-.191-.145-.336-.094l-1.918.957c-.098.051-.145.191-.098.336.051.098.145.145.191.145.098 0 .145 0 .145-.047zm0 .961l1.922-.961c.094-.047.145-.191.094-.336-.047-.098-.191-.145-.336-.098l-1.918.961c-.098.051-.145.191-.098.336.051.098.145.145.191.145.098 0 .145 0 .145-.047zm0 0"})};n.Z=o},15927:function(e,n,r){var t=r(72791),o=r(39230),a=r(80184),i=(0,t.lazy)((function(){return r.e(2697).then(r.bind(r,12697))})),l=(0,t.lazy)((function(){return r.e(6597).then(r.bind(r,56597))})),c=(0,t.lazy)((function(){return r.e(6633).then(r.bind(r,76633))})),s=(0,t.lazy)((function(){return Promise.all([r.e(1889),r.e(3253)]).then(r.bind(r,43253))}));n.Z=function(e){var n=e.loading,r=e.error,u=e.component,d=e.reloadFct,h=(0,o.$G)("common").t;return(0,a.jsxs)(t.Suspense,{fallback:null,children:[n&&(0,a.jsx)(s,{children:(0,a.jsx)(i,{})}),r&&(0,a.jsx)(a.Fragment,{children:(0,a.jsx)(s,{children:(0,a.jsxs)(l,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:d,children:[(0,a.jsx)(c,{}),h("common.reload")]})})}),!n&&!r&&(0,a.jsx)(a.Fragment,{children:u})]})}},15655:function(e,n,r){n.Z=function(e){var n=e.startFromPage,r=void 0===n?0:n,t=e.loadMore,i=e.canLoadMore,l=void 0!==i&&i,c=e.initialise,s=void 0===c||c,u=e.rootMargin,d=void 0===u?"100px 0px 0px 0px":u,h=e.threshold,m=void 0===h?0:h,f=e.debug,v=void 0!==f&&f;function p(){var e;v&&(e=console).log.apply(e,arguments)}if("function"!==typeof t)throw new TypeError("useInfiniteLoader: loadMore must be a function and is required");var g=o.default.useRef(null),x=o.default.useRef(r),b=o.default.useRef(null);return o.default.useEffect((function(){return b.current||!0!==s||(p("Initialised"),b.current=new IntersectionObserver((function(e){var n,r,o=(r=1,function(e){if(Array.isArray(e))return e}(n=e)||function(e,n){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e)){var r=[],t=!0,o=!1,a=void 0;try{for(var i,l=e[Symbol.iterator]();!(t=(i=l.next()).done)&&(r.push(i.value),!n||r.length!==n);t=!0);}catch(c){o=!0,a=c}finally{try{t||null==l.return||l.return()}finally{if(o)throw a}}return r}}(n,r)||function(e,n){if(e){if("string"===typeof e)return a(e,n);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(r):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?a(e,n):void 0}}(n,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())[0];p("Observer invoked"),o.intersectionRatio<=0?p("Intersection ratio not met, bailing"):!1!==l?(p("Loading more..."),t(x.current),x.current+=1):p("Can load more is false, bailing")}),{rootMargin:d,threshold:m}),g.current&&(p("Observing loader ref"),b.current.observe(g.current))),function(){b&&b.current&&(b.current.disconnect(),b.current=void 0)}}),[l,t,x,s]),{loaderRef:g,page:x.current,resetPage:function(){x.current=r}}};var t,o=(t=r(72791))&&t.__esModule?t:{default:t};function a(e,n){(null==n||n>e.length)&&(n=e.length);for(var r=0,t=new Array(n);r<n;r++)t[r]=e[r];return t}}}]);
//# sourceMappingURL=2421.80e60ad0.chunk.js.map