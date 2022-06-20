"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[1621],{699:function(e,n,t){var a=t(1413),r=t(9439),i=t(4942),o=t(2791),c=t(6871),s=t(7630),l=t(3967),u=t(5193),d=t(7621),m=t(2169),f=t(6647),g=t(7047),x=t(2606),p=t(184),h=(0,o.lazy)((function(){return t.e(89).then(t.bind(t,89))})),v="CardEntry",Z={gameRoot:"".concat(v,"-gameRoot"),gameCover:"".concat(v,"-gameCover"),MuiCardActionArea:"".concat(v,"-MuiCardActionArea")},y=(0,s.ZP)(d.Z)((function(e){var n;e.theme;return n={},(0,i.Z)(n,"&.".concat(Z.gameRoot),{position:"relative"}),(0,i.Z)(n,"& .".concat(Z.gameCover),{zIndex:1}),(0,i.Z)(n,"& .".concat(Z.MuiCardActionArea),{height:"inherit",zIndex:1}),n})),b=["small","medium","big"],j={small:"150w",medium:"200w",big:"250w"};n.Z=function(e){var n=(0,l.Z)(),t=(0,c.s0)(),i=e.game,s=(0,u.Z)(n.breakpoints.down("md")),d=(0,o.useState)(!1),v=(0,r.Z)(d,2),C=v[0],k=v[1],w=i.title,z=i.url,A="PLAYLIST"===i.url_type?"/playlist/"+i.playlistId:"/video/"+i.videoId,I={src:i.imagePath,alt:w};return null!==i&&void 0!==i&&i.hasResponsiveImages&&(I.srcSet=b.map((function(e){return"".concat(i.imagesFolder,"/cover@").concat(e,".webp ").concat(j[e])})).join(",")),(0,p.jsxs)(y,{className:Z.gameRoot,children:[(0,p.jsx)(f.Z,{onClick:function(){s?window.location.href=z:t(A)},onContextMenu:function(e){e.preventDefault(),k(!0)},classes:{root:Z.MuiCardActionArea},children:(0,p.jsx)(m.Z,{className:Z.gameCover,title:w,children:(0,p.jsx)(x.Z,(0,a.Z)((0,a.Z)({},I),{},{loading:(0,p.jsx)(g.Z,{variant:"rectangular"})}))})}),(0,p.jsx)(o.Suspense,{fallback:null,children:(0,p.jsx)(h,{game:i,contextMenuState:[C,k]})})]})}},5927:function(e,n,t){var a=t(2791),r=t(3168),i=t(184),o=(0,a.lazy)((function(){return t.e(2697).then(t.bind(t,2697))})),c=(0,a.lazy)((function(){return t.e(6597).then(t.bind(t,6597))})),s=(0,a.lazy)((function(){return t.e(6633).then(t.bind(t,6633))})),l=(0,a.lazy)((function(){return Promise.all([t.e(1889),t.e(3253)]).then(t.bind(t,3253))})),u=(0,a.lazy)((function(){return t.e(5657).then(t.bind(t,5657))}));n.Z=function(e){var n=e,t=n.loading,d=n.error,m=n.component,f=n.reloadFct,g=(0,r.$)("common").t,x=function(){return m};return(0,i.jsxs)(a.Suspense,{fallback:null,children:[t&&(0,i.jsx)(l,{children:(0,i.jsx)(o,{})}),d&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(u,{variant:"error",message:d}),(0,i.jsx)(l,{children:(0,i.jsxs)(c,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:f,children:[(0,i.jsx)(s,{}),g("common.reload")]})})]}),!1===t&&!d&&(0,i.jsx)(x,{})]})}},1621:function(e,n,t){t.r(n);var a=t(4942),r=t(2791),i=t(7630),o=t(9434),c=t(1889),s=t(5927),l=t(699),u=t(5378),d=t(184),m="TestsGallery",f={gameEntry:"".concat(m,"-gameEntry"),gamesCriteria:"".concat(m,"-gamesCriteria")},g=(0,i.ZP)("div")((function(e){var n,t,r,i=e.theme;return r={},(0,a.Z)(r,"& .".concat(f.gameEntry),(n={},(0,a.Z)(n,i.breakpoints.only("xs"),{flexBasis:"calc((100% / 1) - 1%)"}),(0,a.Z)(n,i.breakpoints.only("sm"),{flexBasis:"calc((100% / 2) - 1%)"}),(0,a.Z)(n,i.breakpoints.only("md"),{flexBasis:"calc((100% / 4) - 1%)"}),(0,a.Z)(n,i.breakpoints.up("lg"),{flexBasis:"calc((100% / 5) - 1%)"}),n)),(0,a.Z)(r,"& .".concat(f.gamesCriteria),(t={display:"flex"},(0,a.Z)(t,i.breakpoints.down("md"),{flexDirection:"column",rowGap:"8px"}),(0,a.Z)(t,i.breakpoints.up("md"),{flexDirection:"row",justifyContent:"flex-end"}),t)),r}));n.default=function(e){var n=(0,o.I0)(),t=(0,o.v9)((function(e){return e.tests.loading})),a=(0,o.v9)((function(e){return e.tests.error})),i=(0,o.v9)((function(e){return e.tests.games}));return(0,r.useEffect)((function(){n((0,u.K)())}),[]),(0,d.jsx)(s.Z,{loading:t,error:a,reloadFct:function(){n((0,u.K)())},component:(0,d.jsx)(g,{children:(0,d.jsx)(c.ZP,{container:!0,spacing:1,style:{rowGap:"15px"},children:i.map((function(e){var n;return(0,d.jsx)(c.ZP,{item:!0,className:f.gameEntry,children:(0,d.jsx)(l.Z,{game:e})},null!==(n=e.playlistId)&&void 0!==n?n:e.videoId)}))})})})}}}]);
//# sourceMappingURL=1621.79224d19.chunk.js.map