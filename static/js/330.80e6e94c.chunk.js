"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[330],{2375:function(e,n,t){t.d(n,{Z:function(){return N}});var r=t(9439),a=t(4942),o=t(2791),i=t(3168),c=t(6871),s=t(7630),l=t(3967),u=t(5193),m=t(7621),d=t(2169),g=t(6647),f=t(68),C=t(2606),Z=t(5861),L=t(7757),h=t.n(L),v=t(5289),x=t(7123),p=t(9157),y=t(5661),b=t(493),j=t(5021),k=t(7064),w=t(9900),S=t(6151),M=t(8246),P=t(3854),I=t(4137),z=t(6120),_=t(9340),B=t(4668),A=t(2093),R=t(184);var F=function(e){var n=(0,i.$)("common").t,t=(0,c.s0)(),a=(0,l.Z)(),o=(0,u.Z)(a.breakpoints.down("md")),s=(0,M.Ds)().enqueueSnackbar,m=e.game,d=(0,r.Z)(e.contextMenuState,2),g=d[0],f=d[1],C=m.title,L=m.url,F="PLAYLIST"===m.url_type?"/playlist/"+m.playlistId:"/video/"+m.videoId,O=[{key:"watchHere",icon:function(){return(0,R.jsx)(I.Z,{fontSize:"small"})},text:n("gamesLibrary.actionsButton.watchHere",{gameName:C}),onClick:function(){f(!1),t(F)}},{key:"watchOnYoutube",icon:function(){return(0,R.jsx)(P.Z,{fontSize:"small"})},text:n("gamesLibrary.actionsButton.watchOnYt",{gameName:C}),onClick:function(){f(!1),window.location.href=L}},{key:"copyLink",divider:!0,icon:function(){return(0,R.jsx)(z.Z,{fontSize:"small"})},text:n("gamesLibrary.actionsButton.copyLink"),onClick:function(){var e=(0,Z.Z)(h().mark((function e(){return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(void 0===navigator.clipboard){e.next=5;break}return e.next=3,navigator.clipboard.writeText(L);case 3:e.next=6;break;case 5:window.clipboardData&&window.clipboardData.setData("text/plain",L);case 6:s(n("gamesLibrary.snackbarsMessages.copiedLink",{gameName:C}),{variant:"success",autoHideDuration:2500}),f(!1);case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()},{key:"share-on-twitter",icon:function(){return(0,R.jsx)(B.Z,{fontSize:"small"})},text:n("gamesLibrary.actionsButton.shareOnTwitter"),onClick:function(){window.open("https://twitter.com/intent/tweet?url="+encodeURIComponent(L),"_blank"),f(!1)}},{key:"share-on-facebook",icon:function(){return(0,R.jsx)(A.Z,{fontSize:"small"})},text:n("gamesLibrary.actionsButton.shareOnFacebook"),onClick:function(){window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(L),"_blank"),f(!1)}},{key:"share-on-reddit",icon:function(){return(0,R.jsx)(_.Z,{fontSize:"small"})},text:n("gamesLibrary.actionsButton.shareOnReddit"),onClick:function(){window.open("http://www.reddit.com/submit?title="+encodeURIComponent(C)+"&url="+encodeURIComponent(L)+"&title=","_blank"),f(!1)}}];return(0,R.jsxs)(v.Z,{fullScreen:o,"aria-labelledby":"game-context-dialog-title",open:g,onClose:function(){return f(!1)},children:[(0,R.jsx)(y.Z,{id:"game-context-dialog-title",children:C}),(0,R.jsx)(p.Z,{children:(0,R.jsx)(b.Z,{children:O.map((function(e){return(0,R.jsxs)(j.ZP,{onClick:e.onClick,divider:e.divider||!1,children:[(0,R.jsx)(k.Z,{children:e.icon()}),(0,R.jsx)(w.Z,{primary:e.text})]},e.key)}))})}),(0,R.jsx)(x.Z,{children:(0,R.jsx)(S.Z,{autoFocus:!0,onClick:function(){f(!1)},children:n("gamesLibrary.actionsButton.closeContextMenu")})})]})},O="CardEntry",G={gameRoot:"".concat(O,"-gameRoot"),gameCover:"".concat(O,"-gameCover"),MuiCardActionArea:"".concat(O,"-MuiCardActionArea")},H=(0,s.ZP)(m.Z)((function(e){var n;e.theme;return n={},(0,a.Z)(n,"&.".concat(G.gameRoot),{position:"relative",height:"100%"}),(0,a.Z)(n,"& .".concat(G.gameCover),{zIndex:1,height:"inherit"}),(0,a.Z)(n,"& .".concat(G.MuiCardActionArea),{height:"inherit",zIndex:1}),n}));var N=function(e){var n=(0,l.Z)(),t=(0,i.$)("common").t,a=(0,c.s0)(),s=e.game,m=(0,u.Z)(n.breakpoints.down("md")),Z=o.useState(!1),L=(0,r.Z)(Z,2),h=L[0],v=L[1],x=m?"gamesLibrary.actionsButton.watchOnYt":"gamesLibrary.actionsButton.watchHere",p=s.title,y=s.url,b="PLAYLIST"===s.url_type?"/playlist/"+s.playlistId:"/video/"+s.videoId;return(0,R.jsxs)(H,{className:G.gameRoot,children:[(0,R.jsx)(f.Z,{title:t(x,{gameName:p}),"aria-label":"WatchGame",children:(0,R.jsx)(g.Z,{onClick:function(){m?window.location.href=y:a(b)},onContextMenu:function(e){e.preventDefault(),v(!0)},classes:{root:G.MuiCardActionArea},children:(0,R.jsx)(d.Z,{className:G.gameCover,title:p,children:(0,R.jsx)(C.Z,{src:s.imagePath,alt:p})})})}),(0,R.jsx)(F,{game:s,contextMenuState:[h,v]})]})}},5330:function(e,n,t){t.r(n),t.d(n,{default:function(){return Y}});var r=t(4942),a=t(2791),o=t(7630),i=t(8687),c=t(5655),s=t(3168),l=t(4070),u=t(605),m=t(1889),d=t(3205),g=t(2375),f=t(9439),C=t(3433),Z=t(8096),L=t(9012),h=t(5473),v=t(4454),x=t(5523),p=t(6151),y=t(3400),b=t(366),j=t(6759),k=t(9861),w=t(3395),S=t(184);var M={sort_games:u.r9,change_sorting_order:u.qV},P=(0,i.$j)((function(e){return{sortState:e.games.sorters}}),M)((function(e){var n=e.sortState,t=(0,s.$)("common").t,r=function(n){var t=n.target.name;e.sort_games(t)},o=function(t){var r=t.currentTarget,a=r.name,o=r.getAttribute("aria-label"),i=n.findIndex((function(e){return e[0]===a})),c=i+("upSorter"===o?-1:1),s=(0,C.Z)(n.map((function(e){return e[0]})));s.splice(c,2,s[i],s[c]),e.change_sorting_order(s)},i=a.useState(null),c=(0,f.Z)(i,2),l=c[0],u=c[1],m=Boolean(l),d=m?"sort-popover":void 0,g={name:"gamesLibrary.sortLabels.byName",releaseDate:"gamesLibrary.sortLabels.byReleaseDate",duration:"gamesLibrary.sortLabels.byDuration"},M={upSorter:function(e){return 0!==e},downSorter:function(e){return e!==n.length-1}};return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(p.Z,{"aria-describedby":d,variant:"contained",onClick:function(e){u(e.currentTarget)},children:t("gamesLibrary.sortButtonLabel")}),(0,S.jsx)(h.ZP,{id:d,open:m,anchorEl:l,onClose:function(){u(null)},anchorOrigin:{vertical:"bottom",horizontal:"center"},transformOrigin:{vertical:"top",horizontal:"center"},children:(0,S.jsx)(Z.Z,{component:"fieldset",variant:"standard",children:(0,S.jsx)(L.Z,{children:n.map((function(e,n){var a=(0,f.Z)(e,2),i=a[0],c=a[1];return(0,S.jsxs)("div",{children:[(0,S.jsx)(x.Z,{control:(0,S.jsx)(S.Fragment,{children:(0,S.jsx)(v.Z,{checked:"ASC"!==c,onChange:r,name:i,checkedIcon:(0,S.jsx)(b.Z,{}),icon:(0,S.jsx)(j.Z,{})})}),label:t(g[i])}),Object.keys(M).map((function(e){return(0,M[e])(n)?(0,S.jsx)(y.Z,{"aria-label":e,name:i,size:"small",onClick:o,children:function(){switch(e){case"upSorter":return(0,S.jsx)(k.Z,{fontSize:"inherit"});case"downSorter":return(0,S.jsx)(w.Z,{fontSize:"inherit"});default:return null}}()},i+"_"+e):null}))]},"searchCriteria_"+i)}))})})})]})})),I=t(1413),z=t(5712),_=t(7391),B=["Action","Adventure","Arcade","Board Games","Card","Casual","Educational","Family","Fighting","Indie","MMORPG","Platformer","Puzzle","RPG","Racing","Shooter","Simulation","Sports","Strategy","Misc"];var A={filterByGenre:u.H6,filterByTitle:u.IM},R=(0,i.$j)((function(e){var n;return{selectedGenres:(null===(n=e.games.activeFilters.find((function(e){return"selected_genres"===e.key})))||void 0===n?void 0:n.value)||[]}}),A)((function(e){var n=e.selectedGenres,t=(0,s.$)("common").t,r=B.map((function(e){return{label:t("gamesLibrary.gamesGenres."+e),key:e}})).sort((function(e,n){return e.label<n.label?-1:e.label>n.label?1:0}));return(0,S.jsx)(S.Fragment,{children:(0,S.jsx)(z.Z,{multiple:!0,openOnFocus:!0,filterSelectedOptions:!0,id:"select-game-genre",limitTags:3,options:r,getOptionLabel:function(e){return e.label},isOptionEqualToValue:function(e,n){return Array.isArray(n)?n.some((function(n){return n.key===e.key})):n.key===e.key},value:n.map((function(e){return{label:t("gamesLibrary.gamesGenres."+e),key:e}})),renderInput:function(e){return(0,S.jsx)(_.Z,(0,I.Z)((0,I.Z)({},e),{},{label:t("gamesLibrary.filtersLabels.genres")}))},onChange:function(n,t){e.filterByGenre(t.map((function(e){return e.key})))}})})})),F=t(9259),O=t(5571),G=["GBA","PC","PS1","PS2","PS3","PSP"];var H={filterByPlatform:u.sX},N=(0,i.$j)((function(e){var n;return{selectedPlatform:(null===(n=e.games.activeFilters.find((function(e){return"selected_platform"===e.key})))||void 0===n?void 0:n.value)||""}}),H)((function(e){var n=e.selectedPlatform,t=(0,s.$)("common").t,r=G.map((function(e){return{label:e,key:e}}));return(0,S.jsx)(S.Fragment,{children:(0,S.jsx)(z.Z,{id:"select-game-platform",openOnFocus:!0,options:r,getOptionLabel:function(e){return e.label},isOptionEqualToValue:function(e,n){return Array.isArray(n)?n.some((function(n){return n.key===e.key})):n.key===e.key},renderInput:function(e){return(0,S.jsx)(_.Z,(0,I.Z)((0,I.Z)({},e),{},{label:t("gamesLibrary.filtersLabels.platform")}))},renderOption:function(e,n,t){return(0,a.createElement)("li",(0,I.Z)((0,I.Z)({},e),{},{key:n.key}),(0,S.jsx)(F.Z,{titleAccess:n.label,children:(0,S.jsx)("path",{d:O.Z[n.key]})}),n.label)},onChange:function(n,t){var r=t?(null===t||void 0===t?void 0:t.key)||t:"";e.filterByPlatform(r)},value:n?{key:n,label:n}:null})})}));var V={filterByTitle:u.IM},$=(0,i.$j)((function(e){var n;return{title:(null===(n=e.games.activeFilters.find((function(e){return"selected_title"===e.key})))||void 0===n?void 0:n.value)||""}}),V)((function(e){var n=e.title,t=e.filterByTitle,r=e.games,a=(0,s.$)("common").t,o=(0,C.Z)(new Set(r.map((function(e){return e.title}))));return(0,S.jsx)(S.Fragment,{children:(0,S.jsx)(z.Z,{id:"search-game-title",freeSolo:!0,options:o,value:n,renderInput:function(e){return(0,S.jsx)(_.Z,(0,I.Z)((0,I.Z)({},e),{},{label:a("gamesLibrary.filtersLabels.title")}))},onInputChange:function(e,n){t(n)}})})})),D="GamesGalleryGrid",E={gameEntry:"".concat(D,"-gameEntry"),gamesCriteria:"".concat(D,"-gamesCriteria"),loaderRef:"".concat(D,"-loaderRef")},T=(0,o.ZP)("div")((function(e){var n,t,a,o=e.theme;return a={},(0,r.Z)(a,"& .".concat(E.gameEntry),(n={},(0,r.Z)(n,o.breakpoints.only("xs"),{flexBasis:"calc((100% / 2) - 1%)"}),(0,r.Z)(n,o.breakpoints.only("sm"),{flexBasis:"calc((100% / 4) - 1%)"}),(0,r.Z)(n,o.breakpoints.up("md"),{flexBasis:"calc((100% / 8) - 1%)"}),n)),(0,r.Z)(a,"& .".concat(E.gamesCriteria),(t={display:"flex"},(0,r.Z)(t,o.breakpoints.down("md"),{flexDirection:"column",rowGap:"8px"}),(0,r.Z)(t,o.breakpoints.up("md"),{flexDirection:"row",justifyContent:"flex-end"}),t)),(0,r.Z)(a,"& .".concat(E.loaderRef),{width:"1px",height:"1px",position:"absolute"}),a}));var q={get_games:u.Rd,fetch_scrolling_games:u.Js},Y=(0,i.$j)((function(e){return{currentItemCount:e.games.currentItemCount,scrollLoading:e.games.scrollLoading,totalItems:e.games.totalItems,activeFilters:e.games.activeFilters,sorters:e.games.sorters,games:e.games.games,loading:e.games.loading,error:e.games.error}}),q)((function(e){var n=e.loading,t=e.error,r=e.games,o=e.currentItemCount,i=e.totalItems,f=e.activeFilters,C=e.sorters,Z=e.scrollLoading,L=e.fetch_scrolling_games,h=(0,s.$)("common").t;a.useEffect((function(){e.get_games()}),[r]);var v=a.useCallback((function(){L()}),[]),x=o<=i,p=(0,c.Z)({loadMore:v,canLoadMore:x,debug:!0}).loaderRef,y=(0,u.Ec)(C),b=(0,u.qJ)(f),j=r.filter(b).sort(y).slice(0,o);return(0,S.jsx)(d.Z,{loading:n,error:t,reloadFct:function(){e.get_games()},component:(0,S.jsxs)(T,{children:[(0,S.jsxs)(m.ZP,{container:!0,className:E.gamesCriteria,children:[(0,S.jsx)(m.ZP,{item:!0,xs:12,md:1,children:(0,S.jsx)(P,{})}),(0,S.jsx)(m.ZP,{item:!0,xs:12,md:2,children:(0,S.jsx)(N,{variant:"standard"})}),(0,S.jsx)(m.ZP,{item:!0,xs:12,md:5,children:(0,S.jsx)(R,{variant:"standard"})}),(0,S.jsx)(m.ZP,{item:!0,xs:12,md:4,children:(0,S.jsx)($,{games:r})})]}),(0,S.jsx)(m.ZP,{container:!0,spacing:1,style:{rowGap:"15px"},children:j.map((function(e){var n;return(0,S.jsx)(m.ZP,{item:!0,className:E.gameEntry,children:(0,S.jsx)(g.Z,{game:e})},null!==(n=e.playlistId)&&void 0!==n?n:e.videoId)}))}),(0,S.jsx)("div",{ref:p,className:E.loaderRef}),Z&&(0,S.jsx)(l.Z,{severity:"info",children:h("common.loading")}),!x&&(0,S.jsx)(l.Z,{severity:"info",children:h("common.noResults")})]})})}))},5571:function(e,n){n.Z={PS1:"M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.002 4.362-3.153 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.391-1.502h-.002zm4.656 16.242l6.296-2.275c.715-.258.826-.625.246-.818-.586-.192-1.637-.139-2.357.123l-4.205 1.499v-2.385l.24-.085s1.201-.42 2.913-.615c1.696-.18 3.785.029 5.437.661 1.848.601 2.041 1.472 1.576 2.072s-1.622 1.036-1.622 1.036l-8.544 3.107v-2.297l.02-.023zM1.808 18.6c-1.9-.545-2.214-1.668-1.352-2.321.801-.585 2.159-1.051 2.159-1.051l5.616-2.013v2.313L4.206 17c-.705.271-.825.632-.239.826.586.195 1.637.15 2.343-.12L8.248 17v2.074c-.121.029-.256.044-.391.073-1.938.331-3.995.196-6.037-.479l-.012-.068z",PS2:"M7.46 13.779v.292h4.142v-3.85h3.796V9.93h-4.115v3.85zm16.248-3.558v1.62h-7.195v2.23H24v-.292h-7.168v-1.646H24V9.929h-7.487v.292zm-16.513 0v1.62H0v2.23h.292v-1.938H7.46V9.929H0v.292Z",PS3:"M15.363 9.438h-3.148c-.97 0-1.447.6-1.447 1.38v2.366c0 .483-.228.83-.71.83H7.304c-.02 0-.035.017-.035.035v.47c0 .02.01.032.03.032h3.11c.97 0 1.45-.597 1.45-1.377V10.81c0-.484.225-.832.71-.832h2.782c.02 0 .04-.014.04-.033V9.47c0-.02-.02-.035-.04-.035zm-9.267 0H.038c-.022 0-.038.017-.038.035v.477c0 .02.016.036.038.036h5.694c.48 0 .71.347.71.83s-.228.83-.71.83H1.228c-.7 0-1.227.587-1.227 1.366v1.513c0 .02.02.037.04.037h1.03c.02 0 .04-.016.04-.037v-1.513c0-.48.28-.82.68-.82H6.1c.97 0 1.444-.595 1.444-1.375 0-.778-.473-1.38-1.442-1.38zm17.454 2.498c-.015-.015-.015-.04 0-.056.3-.25.45-.627.45-1.062 0-.778-.474-1.38-1.446-1.38h-6.057c-.02 0-.036.018-.036.038v.475c0 .02.02.04.04.04h5.7c.48 0 .715.35.715.83s-.23.83-.712.83h-5.7c-.02 0-.036.02-.036.04v.48c0 .02.016.034.037.034h5.7c.63.007.71.62.71.93v.06c0 .485-.23.833-.71.833h-5.7c-.02 0-.036.015-.036.034v.477c0 .02.015.037.036.037h6.05c.973 0 1.446-.645 1.446-1.38v-.057c0-.47-.15-.916-.45-1.19z",PSP:"\n        M 3.238281 9.3125 L 8.371094 9.3125 L 8.371094 10.832031 L 3.441406 10.832031 L 3.441406 12.152344 L 3.238281 12.152344 L 3.238281 10.632812 L 8.167969 10.632812 L 8.167969 9.511719 L 3.238281 9.511719 L 3.238281 9.3125 \n        M 14.777344 10.832031 L 14.777344 12.152344 L 14.578125 12.152344 L 14.578125 10.632812 L 19.503906 10.632812 L 19.503906 9.511719 L 14.578125 9.511719 L 14.578125 9.3125 L 19.707031 9.3125 L 19.707031 10.832031 L 14.777344 10.832031 \n        M 10.988281 9.3125 L 10.988281 11.953125 L 8.371094 11.953125 L 8.371094 12.152344 L 11.199219 12.152344 L 11.199219 9.511719 L 13.8125 9.511719 L 13.8125 9.3125 L 10.988281 9.3125\n    ",PC:"\n        M4.539062 7.515625 L 4.539062 13.886719 L 7.6875 13.886719 L 7.695312 11.738281 L 7.707031 9.597656 L 8.625 9.585938 L 9.542969 9.578125 L 10.546875 8.589844 L 11.550781 7.605469 L 11.550781 3.148438 L 10.527344 2.144531 L 9.507812 1.140625 L 4.539062 1.140625 Z \n        M8.28125 5.410156 L 8.289062 7.113281 L 8 7.101562 L 7.707031 7.089844 L 7.695312 5.40625 L 7.6875 3.722656 L 7.9375 3.714844 C 8.082031 3.707031 8.210938 3.703125 8.230469 3.703125 C 8.253906 3.707031 8.273438 4.308594 8.28125 5.410156 Z \n        M8.28125 5.410156 \n        M13.09375 2.148438 L 12.074219 3.148438 L 12.074219 11.917969 L 13.078125 12.902344 L 14.085938 13.886719 L 17.457031 13.886719 L 18.460938 12.898438 L 19.460938 11.917969 L 19.445312 8.417969 L 16.144531 8.417969 L 16.132812 9.878906 L 16.125 11.347656 L 15.601562 11.347656 L 15.601562 3.71875 L 16.125 3.71875 L 16.132812 4.925781 L 16.144531 6.132812 L 19.445312 6.132812 L 19.460938 3.148438 L 18.441406 2.148438 L 17.417969 1.140625 L 14.117188 1.140625 Z \n        M13.09375 2.148438\n    ",GBA:"\n        M 12 19.199219 C 9.457031 19.199219 7.679688 18.960938 6.71875 18.429688 C 6.527344 18.335938 6.382812 18.289062 6.289062 18.289062 C 3.410156 18.191406 1.96875 17.183594 1.390625 16.558594 C 1.105469 16.269531 0.960938 15.9375 0.960938 15.503906 C 0.960938 13.390625 1.054688 9.503906 1.441406 8.015625 C 1.632812 7.25 2.351562 6.71875 3.167969 6.71875 C 3.984375 6.71875 5.230469 5.949219 6.050781 5.230469 C 6.429688 4.945312 6.863281 4.800781 7.296875 4.800781 L 16.75 4.800781 C 17.230469 4.800781 17.710938 4.992188 18 5.28125 C 18.625 5.855469 19.96875 6.71875 20.832031 6.71875 C 21.648438 6.71875 22.367188 7.25 22.558594 8.015625 C 22.894531 9.3125 23.039062 12.671875 23.039062 15.457031 C 23.039062 15.890625 22.894531 16.222656 22.609375 16.511719 C 21.984375 17.136719 20.589844 18.144531 17.710938 18.238281 C 17.519531 18.238281 17.375 18.289062 17.328125 18.335938 C 16.464844 18.910156 14.6875 19.199219 12 19.199219 Z \n        M 6.289062 17.328125 C 6.527344 17.328125 6.816406 17.425781 7.152344 17.570312 C 7.632812 17.808594 8.832031 18.238281 12 18.238281 C 15.359375 18.238281 16.464844 17.761719 16.75 17.570312 C 16.992188 17.375 17.328125 17.28125 17.710938 17.28125 C 20.304688 17.183594 21.550781 16.222656 21.933594 15.839844 C 22.03125 15.742188 22.078125 15.601562 22.078125 15.457031 C 22.078125 12.816406 21.9375 9.457031 21.601562 8.304688 C 21.503906 7.96875 21.167969 7.730469 20.832031 7.730469 C 19.535156 7.730469 18 6.625 17.328125 6 C 17.136719 5.808594 16.894531 5.808594 16.75 5.808594 L 7.296875 5.808594 C 7.105469 5.808594 6.863281 5.90625 6.671875 6.050781 C 6.386719 6.289062 4.65625 7.679688 3.167969 7.679688 C 2.785156 7.679688 2.496094 7.921875 2.402344 8.257812 C 2.066406 9.457031 1.921875 12.816406 1.921875 15.503906 C 1.921875 15.648438 1.96875 15.792969 2.066406 15.890625 C 2.449219 16.269531 3.695312 17.230469 6.289062 17.328125 Z \n        M 3.839844 8.640625 L 4.800781 8.640625 L 4.800781 11.519531 L 3.839844 11.519531 Z \n        M 2.878906 10.558594 L 2.878906 9.601562 L 5.761719 9.601562 L 5.761719 10.558594 Z \n        M 20.398438 8.640625 C 20.785156 8.640625 21.121094 8.976562 21.121094 9.359375 C 21.121094 9.742188 20.785156 10.078125 20.398438 10.078125 C 20.015625 10.078125 19.679688 9.742188 19.679688 9.359375 C 19.679688 8.976562 20.015625 8.640625 20.398438 8.640625 Z \n        M 18.960938 10.078125 C 19.34375 10.078125 19.679688 10.414062 19.679688 10.800781 C 19.679688 11.183594 19.34375 11.519531 18.960938 11.519531 C 18.574219 11.519531 18.238281 11.183594 18.238281 10.800781 C 18.238281 10.414062 18.574219 10.078125 18.960938 10.078125 Z \n        M 5.710938 13.871094 C 5.808594 13.632812 5.710938 13.34375 5.519531 13.25 L 4.078125 12.527344 C 3.839844 12.429688 3.550781 12.527344 3.457031 12.71875 C 3.359375 12.960938 3.457031 13.25 3.648438 13.34375 L 5.089844 14.0625 C 5.136719 14.109375 5.230469 14.109375 5.28125 14.109375 C 5.472656 14.160156 5.617188 14.066406 5.710938 13.871094 Z \n        M 5.710938 15.792969 C 5.808594 15.550781 5.710938 15.265625 5.519531 15.167969 L 4.078125 14.449219 C 3.839844 14.351562 3.550781 14.449219 3.457031 14.640625 C 3.359375 14.878906 3.457031 15.167969 3.648438 15.265625 L 5.089844 15.984375 C 5.136719 16.03125 5.230469 16.03125 5.28125 16.03125 C 5.472656 16.078125 5.617188 15.984375 5.710938 15.792969 Z \n        M 15.839844 15.839844 L 8.160156 15.839844 C 7.585938 15.839844 7.199219 15.457031 7.199219 14.878906 L 7.199219 8.640625 C 7.199219 8.0625 7.585938 7.679688 8.160156 7.679688 L 15.839844 7.679688 C 16.414062 7.679688 16.800781 8.0625 16.800781 8.640625 L 16.800781 14.878906 C 16.800781 15.457031 16.414062 15.839844 15.839844 15.839844 Z \n        M 8.160156 8.640625 L 8.160156 14.878906 L 15.839844 14.878906 L 15.839844 8.640625 Z \n        M 18.574219 13.871094 L 20.496094 12.910156 C 20.589844 12.863281 20.640625 12.71875 20.589844 12.574219 C 20.542969 12.480469 20.398438 12.429688 20.253906 12.480469 L 18.335938 13.441406 C 18.238281 13.488281 18.191406 13.632812 18.238281 13.777344 C 18.289062 13.871094 18.382812 13.921875 18.429688 13.921875 C 18.527344 13.921875 18.574219 13.921875 18.574219 13.871094 Z \n        M 18.574219 14.832031 L 20.496094 13.871094 C 20.589844 13.824219 20.640625 13.679688 20.589844 13.535156 C 20.542969 13.441406 20.398438 13.390625 20.253906 13.441406 L 18.335938 14.398438 C 18.238281 14.449219 18.191406 14.589844 18.238281 14.734375 C 18.289062 14.832031 18.382812 14.878906 18.429688 14.878906 C 18.527344 14.878906 18.574219 14.878906 18.574219 14.832031 Z \n        M 18.574219 15.792969 L 20.496094 14.832031 C 20.589844 14.785156 20.640625 14.640625 20.589844 14.496094 C 20.542969 14.398438 20.398438 14.351562 20.253906 14.398438 L 18.335938 15.359375 C 18.238281 15.410156 18.191406 15.550781 18.238281 15.695312 C 18.289062 15.792969 18.382812 15.839844 18.429688 15.839844 C 18.527344 15.839844 18.574219 15.839844 18.574219 15.792969 Z \n        M 18.574219 15.792969 \n    "}},3205:function(e,n,t){t.d(n,{Z:function(){return R}});var r=t(2791),a=t(3168),o=t(8687),i=t(1554),c=t(9877),s=t(6633),l=t(1889),u=t(184);var m=function(e){var n=e.children;return(0,u.jsx)(l.ZP,{container:!0,spacing:0,direction:"column",alignItems:"center",justifyContent:"center",style:{minHeight:"80vh"},children:n})},d=t(9439),g=t(1413),f=t(5987),C=t(4942),Z=t(7630),L=t(7847),h=t(8384),v=t(9388),x=t(5584),p=t(9823),y=t(7),b=t(5018),j=t(3400),k=t(1964),w=t(8954),S=t(6300),M=["className","message","onClose","variant"],P="CustomizedSnackbar",I={success:"".concat(P,"-success"),error:"".concat(P,"-error"),info:"".concat(P,"-info"),warning:"".concat(P,"-warning"),icon:"".concat(P,"-icon"),iconVariant:"".concat(P,"-iconVariant"),message:"".concat(P,"-message")},z=(0,Z.ZP)(w.Z)((function(e){var n,t=e.theme;return n={},(0,C.Z)(n,"& .".concat(I.success),{backgroundColor:y.Z[600]}),(0,C.Z)(n,"& .".concat(I.error),{backgroundColor:t.palette.error.dark}),(0,C.Z)(n,"& .".concat(I.info),{backgroundColor:t.palette.primary.main}),(0,C.Z)(n,"& .".concat(I.warning),{backgroundColor:b.Z[700]}),(0,C.Z)(n,"& .".concat(I.icon),{fontSize:20}),(0,C.Z)(n,"& .".concat(I.iconVariant),{opacity:.9,marginRight:t.spacing(1)}),(0,C.Z)(n,"& .".concat(I.message),{display:"flex",alignItems:"center"}),(0,C.Z)(n,"& .".concat(I.success),{backgroundColor:y.Z[600]}),(0,C.Z)(n,"& .".concat(I.error),{backgroundColor:t.palette.error.dark}),(0,C.Z)(n,"& .".concat(I.info),{backgroundColor:t.palette.primary.main}),(0,C.Z)(n,"& .".concat(I.warning),{backgroundColor:b.Z[700]}),(0,C.Z)(n,"& .".concat(I.icon),{fontSize:20}),(0,C.Z)(n,"& .".concat(I.iconVariant),{opacity:.9,marginRight:t.spacing(1)}),(0,C.Z)(n,"& .".concat(I.message),{display:"flex",alignItems:"center"}),n})),_={success:h.Z,warning:k.Z,error:v.Z,info:x.Z};function B(e){var n=e.className,t=e.message,r=e.onClose,a=e.variant,o=(0,f.Z)(e,M),i=_[a];return(0,u.jsx)(S.Z,(0,g.Z)({className:(0,L.cx)(I[a],n),"aria-describedby":"client-snackbar",message:(0,u.jsxs)("span",{id:"client-snackbar",className:I.message,children:[(0,u.jsx)(i,{className:(0,L.cx)(I.icon,I.iconVariant)}),t]}),action:[(0,u.jsx)(j.Z,{"aria-label":"close",color:"inherit",onClick:r,size:"large",children:(0,u.jsx)(p.Z,{className:I.icon})},"close")]},o))}var A=function(e){var n=r.useState(!0),t=(0,d.Z)(n,2),a=t[0],o=t[1],i=e.variant,c=e.message,s=function(e,n){"clickaway"!==n&&o(!1)};return(0,u.jsx)(z,{open:a,autoHideDuration:5e3,onClose:s,children:(0,u.jsx)(B,{onClose:s,variant:i,message:c})})};var R=(0,o.$j)((function(e){return{}}),{})((function(e){var n=e.loading,t=e.error,r=e.component,o=e.reloadFct,l=(0,a.$)("common").t;return n?(0,u.jsx)(m,{children:(0,u.jsx)(i.Z,{})}):t?(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(A,{variant:"error",message:t}),(0,u.jsx)(m,{children:(0,u.jsxs)(c.Z,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:o,children:[(0,u.jsx)(s.Z,{}),l("common.reload")]})})]}):r}))}}]);
//# sourceMappingURL=330.80e6e94c.chunk.js.map