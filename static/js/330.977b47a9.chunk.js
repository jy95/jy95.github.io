"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[330],{699:function(e,n,r){var a=r(1413),t=r(9439),i=r(4942),o=r(2791),c=r(3168),s=r(6871),l=r(7630),u=r(3967),m=r(5193),d=r(7621),g=r(2169),f=r(6647),L=r(7047),C=r(68),Z=r(2606),v=r(184),h=o.lazy((function(){return Promise.all([r.e(17),r.e(89)]).then(r.bind(r,89))})),x="CardEntry",p={gameRoot:"".concat(x,"-gameRoot"),gameCover:"".concat(x,"-gameCover"),MuiCardActionArea:"".concat(x,"-MuiCardActionArea")},y=(0,l.ZP)(d.Z)((function(e){var n;e.theme;return n={},(0,i.Z)(n,"&.".concat(p.gameRoot),{position:"relative"}),(0,i.Z)(n,"& .".concat(p.gameCover),{zIndex:1}),(0,i.Z)(n,"& .".concat(p.MuiCardActionArea),{height:"inherit",zIndex:1}),n})),b=["small","medium","big"],j={small:"150w",medium:"200w",big:"250w"};n.Z=function(e){var n=(0,u.Z)(),r=(0,c.$)("common").t,i=(0,s.s0)(),l=e.game,d=(0,m.Z)(n.breakpoints.down("md")),x=o.useState(!1),k=(0,t.Z)(x,2),M=k[0],P=k[1],S=d?"gamesLibrary.actionsButton.watchOnYt":"gamesLibrary.actionsButton.watchHere",w=l.title,I=l.url,z="PLAYLIST"===l.url_type?"/playlist/"+l.playlistId:"/video/"+l.videoId,_={src:l.imagePath,alt:w};return null!==l&&void 0!==l&&l.hasResponsiveImages&&(_.srcSet=b.map((function(e){return"".concat(l.imagesFolder,"/cover@").concat(e,".webp ").concat(j[e])})).join(",")),(0,v.jsxs)(y,{className:p.gameRoot,children:[(0,v.jsx)(C.Z,{title:r(S,{gameName:w}),"aria-label":"WatchGame",children:(0,v.jsx)(f.Z,{onClick:function(){d?window.location.href=I:i(z)},onContextMenu:function(e){e.preventDefault(),P(!0)},classes:{root:p.MuiCardActionArea},children:(0,v.jsx)(g.Z,{className:p.gameCover,title:w,children:(0,v.jsx)(Z.Z,(0,a.Z)((0,a.Z)({},_),{},{loading:(0,v.jsx)(L.Z,{variant:"rectangular"})}))})})}),(0,v.jsx)(o.Suspense,{fallback:null,children:(0,v.jsx)(h,{game:l,contextMenuState:[M,P]})})]})}},5330:function(e,n,r){r.r(n),r.d(n,{default:function(){return J}});var a=r(4942),t=r(2791),i=r(7630),o=r(8687),c=r(5655),s=r(3168),l=r(4070),u=r(605),m=r(1889),d=r(3205),g=r(699),f=r(9439),L=r(3433),C=r(8096),Z=r(9012),v=r(5473),h=r(4454),x=r(5523),p=r(6151),y=r(3400),b=r(366),j=r(6759),k=r(9861),M=r(3395),P=r(184);var S={sort_games:u.r9,change_sorting_order:u.qV},w=(0,o.$j)((function(e){return{sortState:e.games.sorters}}),S)((function(e){var n=e.sortState,r=(0,s.$)("common").t,a=function(n){var r=n.target.name;e.sort_games(r)},i=function(r){var a=r.currentTarget,t=a.name,i=a.getAttribute("aria-label"),o=n.findIndex((function(e){return e[0]===t})),c=o+("upSorter"===i?-1:1),s=(0,L.Z)(n.map((function(e){return e[0]})));s.splice(c,2,s[o],s[c]),e.change_sorting_order(s)},o=t.useState(null),c=(0,f.Z)(o,2),l=c[0],u=c[1],m=Boolean(l),d=m?"sort-popover":void 0,g={name:"gamesLibrary.sortLabels.byName",releaseDate:"gamesLibrary.sortLabels.byReleaseDate",duration:"gamesLibrary.sortLabels.byDuration"},S={upSorter:function(e){return 0!==e},downSorter:function(e){return e!==n.length-1}};return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(p.Z,{"aria-describedby":d,variant:"contained",onClick:function(e){u(e.currentTarget)},children:r("gamesLibrary.sortButtonLabel")}),(0,P.jsx)(v.ZP,{id:d,open:m,anchorEl:l,onClose:function(){u(null)},anchorOrigin:{vertical:"bottom",horizontal:"center"},transformOrigin:{vertical:"top",horizontal:"center"},children:(0,P.jsx)(C.Z,{component:"fieldset",variant:"standard",children:(0,P.jsx)(Z.Z,{children:n.map((function(e,n){var t=(0,f.Z)(e,2),o=t[0],c=t[1];return(0,P.jsxs)("div",{children:[(0,P.jsx)(x.Z,{control:(0,P.jsx)(P.Fragment,{children:(0,P.jsx)(h.Z,{checked:"ASC"!==c,onChange:a,name:o,checkedIcon:(0,P.jsx)(b.Z,{}),icon:(0,P.jsx)(j.Z,{})})}),label:r(g[o])}),Object.keys(S).map((function(e){return(0,S[e])(n)?(0,P.jsx)(y.Z,{"aria-label":e,name:o,size:"small",onClick:i,children:function(){switch(e){case"upSorter":return(0,P.jsx)(k.Z,{fontSize:"inherit"});case"downSorter":return(0,P.jsx)(M.Z,{fontSize:"inherit"});default:return null}}()},o+"_"+e):null}))]},"searchCriteria_"+o)}))})})})]})})),I=r(1413),z=r(5712),_=r(7391),A=["Action","Adventure","Arcade","Board Games","Card","Casual","Educational","Family","Fighting","Indie","MMORPG","Platformer","Puzzle","RPG","Racing","Shooter","Simulation","Sports","Strategy","Misc"];var F={filterByGenre:u.H6,filterByTitle:u.IM},R=(0,o.$j)((function(e){var n;return{selectedGenres:(null===(n=e.games.activeFilters.find((function(e){return"selected_genres"===e.key})))||void 0===n?void 0:n.value)||[]}}),F)((function(e){var n=e.selectedGenres,r=(0,s.$)("common").t,a=A.map((function(e){return{label:r("gamesLibrary.gamesGenres."+e),key:e}})).sort((function(e,n){return e.label<n.label?-1:e.label>n.label?1:0}));return(0,P.jsx)(P.Fragment,{children:(0,P.jsx)(z.Z,{multiple:!0,openOnFocus:!0,filterSelectedOptions:!0,id:"select-game-genre",limitTags:3,options:a,getOptionLabel:function(e){return e.label},isOptionEqualToValue:function(e,n){return Array.isArray(n)?n.some((function(n){return n.key===e.key})):n.key===e.key},value:n.map((function(e){return{label:r("gamesLibrary.gamesGenres."+e),key:e}})),renderInput:function(e){return(0,P.jsx)(_.Z,(0,I.Z)((0,I.Z)({},e),{},{label:r("gamesLibrary.filtersLabels.genres")}))},onChange:function(n,r){e.filterByGenre(r.map((function(e){return e.key})))}})})})),B=r(9259),G=r(5571),V=["GBA","PC","PS1","PS2","PS3","PSP"];var H={filterByPlatform:u.sX},N=(0,o.$j)((function(e){var n;return{selectedPlatform:(null===(n=e.games.activeFilters.find((function(e){return"selected_platform"===e.key})))||void 0===n?void 0:n.value)||""}}),H)((function(e){var n=e.selectedPlatform,r=(0,s.$)("common").t,a=V.map((function(e){return{label:e,key:e}}));return(0,P.jsx)(P.Fragment,{children:(0,P.jsx)(z.Z,{id:"select-game-platform",openOnFocus:!0,options:a,getOptionLabel:function(e){return e.label},isOptionEqualToValue:function(e,n){return Array.isArray(n)?n.some((function(n){return n.key===e.key})):n.key===e.key},renderInput:function(e){return(0,P.jsx)(_.Z,(0,I.Z)((0,I.Z)({},e),{},{label:r("gamesLibrary.filtersLabels.platform")}))},renderOption:function(e,n,r){return(0,t.createElement)("li",(0,I.Z)((0,I.Z)({},e),{},{key:n.key}),(0,P.jsx)(B.Z,{titleAccess:n.label,children:(0,P.jsx)("path",{d:G.Z[n.key]})}),n.label)},onChange:function(n,r){var a=r?(null===r||void 0===r?void 0:r.key)||r:"";e.filterByPlatform(a)},value:n?{key:n,label:n}:null})})}));var O={filterByTitle:u.IM},$=(0,o.$j)((function(e){var n;return{title:(null===(n=e.games.activeFilters.find((function(e){return"selected_title"===e.key})))||void 0===n?void 0:n.value)||""}}),O)((function(e){var n=e.title,r=e.filterByTitle,a=e.games,t=(0,s.$)("common").t,i=(0,L.Z)(new Set(a.map((function(e){return e.title}))));return(0,P.jsx)(P.Fragment,{children:(0,P.jsx)(z.Z,{id:"search-game-title",freeSolo:!0,options:i,value:n,renderInput:function(e){return(0,P.jsx)(_.Z,(0,I.Z)((0,I.Z)({},e),{},{label:t("gamesLibrary.filtersLabels.title")}))},onInputChange:function(e,n){r(n)}})})})),E="GamesGalleryGrid",T={gameEntry:"".concat(E,"-gameEntry"),gamesCriteria:"".concat(E,"-gamesCriteria"),loaderRef:"".concat(E,"-loaderRef")},D=(0,i.ZP)("div")((function(e){var n,r,t,i=e.theme;return t={},(0,a.Z)(t,"& .".concat(T.gameEntry),(n={},(0,a.Z)(n,i.breakpoints.only("xs"),{flexBasis:"calc((100% / 2) - 1%)"}),(0,a.Z)(n,i.breakpoints.only("sm"),{flexBasis:"calc((100% / 4) - 1%)"}),(0,a.Z)(n,i.breakpoints.up("md"),{flexBasis:"calc((100% / 8) - 1%)"}),n)),(0,a.Z)(t,"& .".concat(T.gamesCriteria),(r={display:"flex"},(0,a.Z)(r,i.breakpoints.down("md"),{flexDirection:"column",rowGap:"8px"}),(0,a.Z)(r,i.breakpoints.up("md"),{flexDirection:"row",justifyContent:"flex-end"}),r)),(0,a.Z)(t,"& .".concat(T.loaderRef),{width:"1px",height:"1px",position:"absolute"}),t}));var q={get_games:u.Rd,fetch_scrolling_games:u.Js},J=(0,o.$j)((function(e){return{currentItemCount:e.games.currentItemCount,initialLoad:e.games.initialLoad,scrollLoading:e.games.scrollLoading,totalItems:e.games.totalItems,activeFilters:e.games.activeFilters,sorters:e.games.sorters,games:e.games.games,loading:e.games.loading,error:e.games.error}}),q)((function(e){var n=e.loading,r=e.error,a=e.games,i=e.currentItemCount,o=e.totalItems,f=e.activeFilters,L=e.sorters,C=e.initialLoad,Z=e.scrollLoading,v=e.fetch_scrolling_games,h=(0,s.$)("common").t;t.useEffect((function(){e.get_games()}),[a]);var x=t.useCallback((function(){v()}),[]),p=i<=o,y=(0,c.Z)({loadMore:x,canLoadMore:p,initialise:!C,debug:!1}).loaderRef,b=(0,u.Ec)(L),j=(0,u.qJ)(f),k=a.filter(j).sort(b).slice(0,i);return(0,P.jsx)(d.Z,{loading:n,error:r,reloadFct:function(){e.get_games()},component:(0,P.jsxs)(D,{children:[(0,P.jsxs)(m.ZP,{container:!0,className:T.gamesCriteria,children:[(0,P.jsx)(m.ZP,{item:!0,xs:12,md:1,children:(0,P.jsx)(w,{})}),(0,P.jsx)(m.ZP,{item:!0,xs:12,md:2,children:(0,P.jsx)(N,{variant:"standard"})}),(0,P.jsx)(m.ZP,{item:!0,xs:12,md:5,children:(0,P.jsx)(R,{variant:"standard"})}),(0,P.jsx)(m.ZP,{item:!0,xs:12,md:4,children:(0,P.jsx)($,{games:a})})]}),(0,P.jsx)(m.ZP,{container:!0,spacing:1,style:{rowGap:"15px"},children:k.map((function(e){var n;return(0,P.jsx)(m.ZP,{item:!0,className:T.gameEntry,children:(0,P.jsx)(g.Z,{game:e})},null!==(n=e.playlistId)&&void 0!==n?n:e.videoId)}))}),!C&&(0,P.jsx)("div",{ref:y,className:T.loaderRef}),Z&&(0,P.jsx)(l.Z,{severity:"info",children:h("common.loading")}),!p&&(0,P.jsx)(l.Z,{severity:"info",children:h("common.noResults")})]})})}))},5571:function(e,n){n.Z={PS1:"M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.002 4.362-3.153 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.391-1.502h-.002zm4.656 16.242l6.296-2.275c.715-.258.826-.625.246-.818-.586-.192-1.637-.139-2.357.123l-4.205 1.499v-2.385l.24-.085s1.201-.42 2.913-.615c1.696-.18 3.785.029 5.437.661 1.848.601 2.041 1.472 1.576 2.072s-1.622 1.036-1.622 1.036l-8.544 3.107v-2.297l.02-.023zM1.808 18.6c-1.9-.545-2.214-1.668-1.352-2.321.801-.585 2.159-1.051 2.159-1.051l5.616-2.013v2.313L4.206 17c-.705.271-.825.632-.239.826.586.195 1.637.15 2.343-.12L8.248 17v2.074c-.121.029-.256.044-.391.073-1.938.331-3.995.196-6.037-.479l-.012-.068z",PS2:"M7.46 13.779v.292h4.142v-3.85h3.796V9.93h-4.115v3.85zm16.248-3.558v1.62h-7.195v2.23H24v-.292h-7.168v-1.646H24V9.929h-7.487v.292zm-16.513 0v1.62H0v2.23h.292v-1.938H7.46V9.929H0v.292Z",PS3:"M15.363 9.438h-3.148c-.97 0-1.447.6-1.447 1.38v2.366c0 .483-.228.83-.71.83H7.304c-.02 0-.035.017-.035.035v.47c0 .02.01.032.03.032h3.11c.97 0 1.45-.597 1.45-1.377V10.81c0-.484.225-.832.71-.832h2.782c.02 0 .04-.014.04-.033V9.47c0-.02-.02-.035-.04-.035zm-9.267 0H.038c-.022 0-.038.017-.038.035v.477c0 .02.016.036.038.036h5.694c.48 0 .71.347.71.83s-.228.83-.71.83H1.228c-.7 0-1.227.587-1.227 1.366v1.513c0 .02.02.037.04.037h1.03c.02 0 .04-.016.04-.037v-1.513c0-.48.28-.82.68-.82H6.1c.97 0 1.444-.595 1.444-1.375 0-.778-.473-1.38-1.442-1.38zm17.454 2.498c-.015-.015-.015-.04 0-.056.3-.25.45-.627.45-1.062 0-.778-.474-1.38-1.446-1.38h-6.057c-.02 0-.036.018-.036.038v.475c0 .02.02.04.04.04h5.7c.48 0 .715.35.715.83s-.23.83-.712.83h-5.7c-.02 0-.036.02-.036.04v.48c0 .02.016.034.037.034h5.7c.63.007.71.62.71.93v.06c0 .485-.23.833-.71.833h-5.7c-.02 0-.036.015-.036.034v.477c0 .02.015.037.036.037h6.05c.973 0 1.446-.645 1.446-1.38v-.057c0-.47-.15-.916-.45-1.19z",PSP:"\n        M 3.238281 9.3125 L 8.371094 9.3125 L 8.371094 10.832031 L 3.441406 10.832031 L 3.441406 12.152344 L 3.238281 12.152344 L 3.238281 10.632812 L 8.167969 10.632812 L 8.167969 9.511719 L 3.238281 9.511719 L 3.238281 9.3125 \n        M 14.777344 10.832031 L 14.777344 12.152344 L 14.578125 12.152344 L 14.578125 10.632812 L 19.503906 10.632812 L 19.503906 9.511719 L 14.578125 9.511719 L 14.578125 9.3125 L 19.707031 9.3125 L 19.707031 10.832031 L 14.777344 10.832031 \n        M 10.988281 9.3125 L 10.988281 11.953125 L 8.371094 11.953125 L 8.371094 12.152344 L 11.199219 12.152344 L 11.199219 9.511719 L 13.8125 9.511719 L 13.8125 9.3125 L 10.988281 9.3125\n    ",PC:"\n        M4.539062 7.515625 L 4.539062 13.886719 L 7.6875 13.886719 L 7.695312 11.738281 L 7.707031 9.597656 L 8.625 9.585938 L 9.542969 9.578125 L 10.546875 8.589844 L 11.550781 7.605469 L 11.550781 3.148438 L 10.527344 2.144531 L 9.507812 1.140625 L 4.539062 1.140625 Z \n        M8.28125 5.410156 L 8.289062 7.113281 L 8 7.101562 L 7.707031 7.089844 L 7.695312 5.40625 L 7.6875 3.722656 L 7.9375 3.714844 C 8.082031 3.707031 8.210938 3.703125 8.230469 3.703125 C 8.253906 3.707031 8.273438 4.308594 8.28125 5.410156 Z \n        M8.28125 5.410156 \n        M13.09375 2.148438 L 12.074219 3.148438 L 12.074219 11.917969 L 13.078125 12.902344 L 14.085938 13.886719 L 17.457031 13.886719 L 18.460938 12.898438 L 19.460938 11.917969 L 19.445312 8.417969 L 16.144531 8.417969 L 16.132812 9.878906 L 16.125 11.347656 L 15.601562 11.347656 L 15.601562 3.71875 L 16.125 3.71875 L 16.132812 4.925781 L 16.144531 6.132812 L 19.445312 6.132812 L 19.460938 3.148438 L 18.441406 2.148438 L 17.417969 1.140625 L 14.117188 1.140625 Z \n        M13.09375 2.148438\n    ",GBA:"\n        M 12 19.199219 C 9.457031 19.199219 7.679688 18.960938 6.71875 18.429688 C 6.527344 18.335938 6.382812 18.289062 6.289062 18.289062 C 3.410156 18.191406 1.96875 17.183594 1.390625 16.558594 C 1.105469 16.269531 0.960938 15.9375 0.960938 15.503906 C 0.960938 13.390625 1.054688 9.503906 1.441406 8.015625 C 1.632812 7.25 2.351562 6.71875 3.167969 6.71875 C 3.984375 6.71875 5.230469 5.949219 6.050781 5.230469 C 6.429688 4.945312 6.863281 4.800781 7.296875 4.800781 L 16.75 4.800781 C 17.230469 4.800781 17.710938 4.992188 18 5.28125 C 18.625 5.855469 19.96875 6.71875 20.832031 6.71875 C 21.648438 6.71875 22.367188 7.25 22.558594 8.015625 C 22.894531 9.3125 23.039062 12.671875 23.039062 15.457031 C 23.039062 15.890625 22.894531 16.222656 22.609375 16.511719 C 21.984375 17.136719 20.589844 18.144531 17.710938 18.238281 C 17.519531 18.238281 17.375 18.289062 17.328125 18.335938 C 16.464844 18.910156 14.6875 19.199219 12 19.199219 Z \n        M 6.289062 17.328125 C 6.527344 17.328125 6.816406 17.425781 7.152344 17.570312 C 7.632812 17.808594 8.832031 18.238281 12 18.238281 C 15.359375 18.238281 16.464844 17.761719 16.75 17.570312 C 16.992188 17.375 17.328125 17.28125 17.710938 17.28125 C 20.304688 17.183594 21.550781 16.222656 21.933594 15.839844 C 22.03125 15.742188 22.078125 15.601562 22.078125 15.457031 C 22.078125 12.816406 21.9375 9.457031 21.601562 8.304688 C 21.503906 7.96875 21.167969 7.730469 20.832031 7.730469 C 19.535156 7.730469 18 6.625 17.328125 6 C 17.136719 5.808594 16.894531 5.808594 16.75 5.808594 L 7.296875 5.808594 C 7.105469 5.808594 6.863281 5.90625 6.671875 6.050781 C 6.386719 6.289062 4.65625 7.679688 3.167969 7.679688 C 2.785156 7.679688 2.496094 7.921875 2.402344 8.257812 C 2.066406 9.457031 1.921875 12.816406 1.921875 15.503906 C 1.921875 15.648438 1.96875 15.792969 2.066406 15.890625 C 2.449219 16.269531 3.695312 17.230469 6.289062 17.328125 Z \n        M 3.839844 8.640625 L 4.800781 8.640625 L 4.800781 11.519531 L 3.839844 11.519531 Z \n        M 2.878906 10.558594 L 2.878906 9.601562 L 5.761719 9.601562 L 5.761719 10.558594 Z \n        M 20.398438 8.640625 C 20.785156 8.640625 21.121094 8.976562 21.121094 9.359375 C 21.121094 9.742188 20.785156 10.078125 20.398438 10.078125 C 20.015625 10.078125 19.679688 9.742188 19.679688 9.359375 C 19.679688 8.976562 20.015625 8.640625 20.398438 8.640625 Z \n        M 18.960938 10.078125 C 19.34375 10.078125 19.679688 10.414062 19.679688 10.800781 C 19.679688 11.183594 19.34375 11.519531 18.960938 11.519531 C 18.574219 11.519531 18.238281 11.183594 18.238281 10.800781 C 18.238281 10.414062 18.574219 10.078125 18.960938 10.078125 Z \n        M 5.710938 13.871094 C 5.808594 13.632812 5.710938 13.34375 5.519531 13.25 L 4.078125 12.527344 C 3.839844 12.429688 3.550781 12.527344 3.457031 12.71875 C 3.359375 12.960938 3.457031 13.25 3.648438 13.34375 L 5.089844 14.0625 C 5.136719 14.109375 5.230469 14.109375 5.28125 14.109375 C 5.472656 14.160156 5.617188 14.066406 5.710938 13.871094 Z \n        M 5.710938 15.792969 C 5.808594 15.550781 5.710938 15.265625 5.519531 15.167969 L 4.078125 14.449219 C 3.839844 14.351562 3.550781 14.449219 3.457031 14.640625 C 3.359375 14.878906 3.457031 15.167969 3.648438 15.265625 L 5.089844 15.984375 C 5.136719 16.03125 5.230469 16.03125 5.28125 16.03125 C 5.472656 16.078125 5.617188 15.984375 5.710938 15.792969 Z \n        M 15.839844 15.839844 L 8.160156 15.839844 C 7.585938 15.839844 7.199219 15.457031 7.199219 14.878906 L 7.199219 8.640625 C 7.199219 8.0625 7.585938 7.679688 8.160156 7.679688 L 15.839844 7.679688 C 16.414062 7.679688 16.800781 8.0625 16.800781 8.640625 L 16.800781 14.878906 C 16.800781 15.457031 16.414062 15.839844 15.839844 15.839844 Z \n        M 8.160156 8.640625 L 8.160156 14.878906 L 15.839844 14.878906 L 15.839844 8.640625 Z \n        M 18.574219 13.871094 L 20.496094 12.910156 C 20.589844 12.863281 20.640625 12.71875 20.589844 12.574219 C 20.542969 12.480469 20.398438 12.429688 20.253906 12.480469 L 18.335938 13.441406 C 18.238281 13.488281 18.191406 13.632812 18.238281 13.777344 C 18.289062 13.871094 18.382812 13.921875 18.429688 13.921875 C 18.527344 13.921875 18.574219 13.921875 18.574219 13.871094 Z \n        M 18.574219 14.832031 L 20.496094 13.871094 C 20.589844 13.824219 20.640625 13.679688 20.589844 13.535156 C 20.542969 13.441406 20.398438 13.390625 20.253906 13.441406 L 18.335938 14.398438 C 18.238281 14.449219 18.191406 14.589844 18.238281 14.734375 C 18.289062 14.832031 18.382812 14.878906 18.429688 14.878906 C 18.527344 14.878906 18.574219 14.878906 18.574219 14.832031 Z \n        M 18.574219 15.792969 L 20.496094 14.832031 C 20.589844 14.785156 20.640625 14.640625 20.589844 14.496094 C 20.542969 14.398438 20.398438 14.351562 20.253906 14.398438 L 18.335938 15.359375 C 18.238281 15.410156 18.191406 15.550781 18.238281 15.695312 C 18.289062 15.792969 18.382812 15.839844 18.429688 15.839844 C 18.527344 15.839844 18.574219 15.839844 18.574219 15.792969 Z \n        M 18.574219 15.792969 \n    "}},3205:function(e,n,r){r.d(n,{Z:function(){return R}});var a=r(2791),t=r(3168),i=r(8687),o=r(1554),c=r(9877),s=r(6633),l=r(1889),u=r(184);var m=function(e){var n=e.children;return(0,u.jsx)(l.ZP,{container:!0,spacing:0,direction:"column",alignItems:"center",justifyContent:"center",style:{minHeight:"80vh"},children:n})},d=r(9439),g=r(1413),f=r(5987),L=r(4942),C=r(7630),Z=r(7847),v=r(8384),h=r(9388),x=r(5584),p=r(9823),y=r(7),b=r(5018),j=r(3400),k=r(1964),M=r(8954),P=r(6300),S=["className","message","onClose","variant"],w="CustomizedSnackbar",I={success:"".concat(w,"-success"),error:"".concat(w,"-error"),info:"".concat(w,"-info"),warning:"".concat(w,"-warning"),icon:"".concat(w,"-icon"),iconVariant:"".concat(w,"-iconVariant"),message:"".concat(w,"-message")},z=(0,C.ZP)(M.Z)((function(e){var n,r=e.theme;return n={},(0,L.Z)(n,"& .".concat(I.success),{backgroundColor:y.Z[600]}),(0,L.Z)(n,"& .".concat(I.error),{backgroundColor:r.palette.error.dark}),(0,L.Z)(n,"& .".concat(I.info),{backgroundColor:r.palette.primary.main}),(0,L.Z)(n,"& .".concat(I.warning),{backgroundColor:b.Z[700]}),(0,L.Z)(n,"& .".concat(I.icon),{fontSize:20}),(0,L.Z)(n,"& .".concat(I.iconVariant),{opacity:.9,marginRight:r.spacing(1)}),(0,L.Z)(n,"& .".concat(I.message),{display:"flex",alignItems:"center"}),(0,L.Z)(n,"& .".concat(I.success),{backgroundColor:y.Z[600]}),(0,L.Z)(n,"& .".concat(I.error),{backgroundColor:r.palette.error.dark}),(0,L.Z)(n,"& .".concat(I.info),{backgroundColor:r.palette.primary.main}),(0,L.Z)(n,"& .".concat(I.warning),{backgroundColor:b.Z[700]}),(0,L.Z)(n,"& .".concat(I.icon),{fontSize:20}),(0,L.Z)(n,"& .".concat(I.iconVariant),{opacity:.9,marginRight:r.spacing(1)}),(0,L.Z)(n,"& .".concat(I.message),{display:"flex",alignItems:"center"}),n})),_={success:v.Z,warning:k.Z,error:h.Z,info:x.Z};function A(e){var n=e.className,r=e.message,a=e.onClose,t=e.variant,i=(0,f.Z)(e,S),o=_[t];return(0,u.jsx)(P.Z,(0,g.Z)({className:(0,Z.cx)(I[t],n),"aria-describedby":"client-snackbar",message:(0,u.jsxs)("span",{id:"client-snackbar",className:I.message,children:[(0,u.jsx)(o,{className:(0,Z.cx)(I.icon,I.iconVariant)}),r]}),action:[(0,u.jsx)(j.Z,{"aria-label":"close",color:"inherit",onClick:a,size:"large",children:(0,u.jsx)(p.Z,{className:I.icon})},"close")]},i))}var F=function(e){var n=a.useState(!0),r=(0,d.Z)(n,2),t=r[0],i=r[1],o=e.variant,c=e.message,s=function(e,n){"clickaway"!==n&&i(!1)};return(0,u.jsx)(z,{open:t,autoHideDuration:5e3,onClose:s,children:(0,u.jsx)(A,{onClose:s,variant:o,message:c})})};var R=(0,i.$j)((function(e){return{}}),{})((function(e){var n=e.loading,r=e.error,a=e.component,i=e.reloadFct,l=(0,t.$)("common").t;return n?(0,u.jsx)(m,{children:(0,u.jsx)(o.Z,{})}):r?(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(F,{variant:"error",message:r}),(0,u.jsx)(m,{children:(0,u.jsxs)(c.Z,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:i,children:[(0,u.jsx)(s.Z,{}),l("common.reload")]})})]}):a}))}}]);
//# sourceMappingURL=330.977b47a9.chunk.js.map