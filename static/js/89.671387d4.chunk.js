"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[89],{70089:function(n,e,t){t.r(e);var i=t(74165),o=t(15861),r=t(29439),a=t(72791),c=t(39230),u=t(57689),l=t(95193),s=t(58518),d=t(80184),f=(0,a.lazy)((function(){return t.e(5401).then(t.bind(t,5401))})),h=(0,a.lazy)((function(){return t.e(2812).then(t.bind(t,12812))})),b=(0,a.lazy)((function(){return t.e(7368).then(t.bind(t,77368))})),y=(0,a.lazy)((function(){return t.e(3198).then(t.bind(t,53198))})),m=(0,a.lazy)((function(){return t.e(6389).then(t.bind(t,46389))})),k=(0,a.lazy)((function(){return t.e(7039).then(t.bind(t,17039))})),p=(0,a.lazy)((function(){return t.e(6108).then(t.bind(t,86108))})),x=(0,a.lazy)((function(){return t.e(8778).then(t.bind(t,38778))})),w=(0,a.lazy)((function(){return t.e(9056).then(t.bind(t,89056))})),g=(0,a.lazy)((function(){return t.e(3854).then(t.bind(t,83854))})),z=(0,a.lazy)((function(){return t.e(4137).then(t.bind(t,24137))})),C=(0,a.lazy)((function(){return t.e(6120).then(t.bind(t,56120))})),j=(0,a.lazy)((function(){return t.e(9340).then(t.bind(t,99340))})),L=(0,a.lazy)((function(){return t.e(4668).then(t.bind(t,74668))})),v=(0,a.lazy)((function(){return t.e(2093).then(t.bind(t,42093))}));e.default=function(n){var e=(0,c.$G)("common").t,t=(0,u.s0)(),a=(0,l.Z)((function(n){return n.breakpoints.down("md")})),S=(0,s.Ds)().enqueueSnackbar,_=n.game,B=(0,r.Z)(n.contextMenuState,2),I=B[0],O=B[1],R=_.title,Z=_.url,U="PLAYLIST"===_.url_type?"/playlist/"+_.id:"/video/"+_.id,H=[{key:"watchHere",icon:(0,d.jsx)(z,{fontSize:"small"}),text:e("gamesLibrary.actionsButton.watchHere",{gameName:R}),onClick:function(){O(!1),t(U)}},{key:"watchOnYoutube",icon:(0,d.jsx)(g,{fontSize:"small"}),text:e("gamesLibrary.actionsButton.watchOnYt",{gameName:R}),onClick:function(){O(!1),window.location.href=Z}},{key:"copyLink",divider:!0,icon:(0,d.jsx)(C,{fontSize:"small"}),text:e("gamesLibrary.actionsButton.copyLink"),onClick:function(){var n=(0,o.Z)((0,i.Z)().mark((function n(){return(0,i.Z)().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(void 0===navigator.clipboard){n.next=5;break}return n.next=3,navigator.clipboard.writeText(Z);case 3:S(e("gamesLibrary.snackbarsMessages.copiedLink",{gameName:R}),{variant:"success",autoHideDuration:2500}),O(!1);case 5:case"end":return n.stop()}}),n)})));return function(){return n.apply(this,arguments)}}()},{key:"share-on-twitter",icon:(0,d.jsx)(L,{fontSize:"small"}),text:e("gamesLibrary.actionsButton.shareOnTwitter"),onClick:function(){window.open("https://twitter.com/intent/tweet?url="+encodeURIComponent(Z),"_blank"),O(!1)}},{key:"share-on-facebook",icon:(0,d.jsx)(v,{fontSize:"small"}),text:e("gamesLibrary.actionsButton.shareOnFacebook"),onClick:function(){window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(Z),"_blank"),O(!1)}},{key:"share-on-reddit",icon:(0,d.jsx)(j,{fontSize:"small"}),text:e("gamesLibrary.actionsButton.shareOnReddit"),onClick:function(){window.open("http://www.reddit.com/submit?title="+encodeURIComponent(R)+"&url="+encodeURIComponent(Z)+"&title=","_blank"),O(!1)}}];return(0,d.jsxs)(f,{fullScreen:a,"aria-labelledby":"game-context-dialog-title",open:I,onClose:function(){return O(!1)},children:[(0,d.jsx)(y,{id:"game-context-dialog-title",children:R}),(0,d.jsx)(b,{children:(0,d.jsx)(m,{children:H.map((function(n){return(0,d.jsxs)(k,{onClick:n.onClick,divider:n.divider||!1,children:[(0,d.jsx)(p,{children:n.icon}),(0,d.jsx)(x,{primary:n.text})]},n.key)}))})}),(0,d.jsx)(h,{children:(0,d.jsx)(w,{autoFocus:!0,onClick:function(){O(!1)},children:e("gamesLibrary.actionsButton.closeContextMenu")})})]})}}}]);
//# sourceMappingURL=89.671387d4.chunk.js.map