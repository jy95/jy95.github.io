"use strict";(self.webpackChunkyt_gaming_library=self.webpackChunkyt_gaming_library||[]).push([[3562],{15927:function(t,a,e){var n=e(72791),s=e(33168),r=e(80184),l=(0,n.lazy)((function(){return e.e(5675).then(e.bind(e,25675))})),o=(0,n.lazy)((function(){return e.e(4480).then(e.bind(e,34480))})),i=(0,n.lazy)((function(){return e.e(6633).then(e.bind(e,76633))})),c=(0,n.lazy)((function(){return Promise.all([e.e(5953),e.e(3253)]).then(e.bind(e,43253))}));a.Z=function(t){var a=t.loading,e=t.error,d=t.component,h=t.reloadFct,x=(0,s.$)("common").t;return(0,r.jsxs)(n.Suspense,{fallback:null,children:[a&&(0,r.jsx)(c,{children:(0,r.jsx)(l,{})}),e&&(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(c,{children:(0,r.jsxs)(o,{variant:"extended",size:"medium",color:"primary","aria-label":"reload",onClick:h,children:[(0,r.jsx)(i,{}),x("common.reload")]})})}),!a&&!e&&(0,r.jsx)(r.Fragment,{children:d})]})}},53562:function(t,a,e){e.r(a);var n=e(1413),s=e(72791),r=e(33168),l=e(20601),o=e(38725),i=e(82839),c=e(90466),d=e(12891),h=e(35667),x=e(99715),u=e(96952),m=e(36846),j=e(87997),Z=e(5618),_=e(24296),g=e(4565),y=e(45953),p=e(30286),f=e(27603),b=e(43671),v=e(81131),k=e(55924),C=e(97128),S=e(4346),D=e(5682),P=e(73978),w=e(26306),M=e(30611),F=e(36976),K=e(33970),N=e(83854),z=e(15927),I=e(33015),B=e(17009),$=e(80184);function T(t,a){var e,n=new Date(t),s=new Date,r=n.getTime(),l=s.getTime(),o=((e=r>l?new Date(r-l):new Date(l-r)).getDate()+"-"+(e.getMonth()+1)+"-"+e.getFullYear()).split("-"),i=Number(Math.abs(Number(o[0]))-1),c=Number(Math.abs(Number(o[1]))-1),d=Number(Math.abs(Number(o[2]))-1970),h=365*d+30.417*c+i,x=24*h*60*60,u=24*h*60,m=24*h,j=h>=7?h/7:0,Z=[a("common.dates.years",{count:d}),a("common.dates.months",{count:c}),a("common.dates.days",{count:i})].join(" ");return{total_days:Math.round(h),total_weeks:Math.round(j),total_hours:Math.round(m),total_minutes:Math.round(u),total_seconds:Math.round(x),result:Z.trim()}}function q(t,a){return[a("common.dates.hours",{count:t.hours}),a("common.dates.minutes",{count:t.minutes}),a("common.dates.seconds",{count:t.seconds})].join(" ")}a.default=function(t){var a=(0,r.$)("common").t,e=(0,B.T)(),L=(0,B.C)((function(t){return(0,I.qo)(t)})),O=L.loading,E=L.error,G=L.stats,H=(0,B.C)((function(t){return t.themeColor.currentColor}));(0,s.useEffect)((function(){e((0,I.mP)())}),[]);var R=G.genres.map((function(t){return(0,n.Z)((0,n.Z)({},t),{},{category:a("gamesLibrary.gamesGenres.".concat(t.key))})})),Y=G.platforms,A=G.general,J="dark"===H?"white":"dark";return(0,$.jsx)(z.Z,{loading:O,error:E,reloadFct:function(){e((0,I.mP)())},component:(0,$.jsxs)(y.ZP,{container:!0,spacing:3,children:[(0,$.jsx)(y.ZP,{item:!0,xs:12,md:12,lg:12,children:(0,$.jsxs)(p.Z,{sx:{p:2,display:"flex",flexDirection:"column"},children:[(0,$.jsx)(g.Z,{component:"h2",variant:"h6",color:"primary",gutterBottom:!0,children:a("stats.generalStats.title")}),(0,$.jsxs)(k.Z,{children:[(0,$.jsxs)(f.Z,{children:[(0,$.jsxs)(b.Z,{expandIcon:(0,$.jsx)(v.Z,{}),"aria-controls":"panel-content_total_games",id:"panel-header_total_games",children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(w.Z,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.total_games"),secondary:A.total})]}),(0,$.jsx)(s.Suspense,{fallback:null,children:(0,$.jsxs)(k.Z,{children:[(0,$.jsxs)(C.ZP,{children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(w.Z,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.total_games_available"),secondary:A.total_available})]}),(0,$.jsxs)(C.ZP,{children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(w.Z,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.total_games_unavailable"),secondary:A.total_unavailable})]})]})})]},"total_games"),(0,$.jsxs)(f.Z,{children:[(0,$.jsxs)(b.Z,{expandIcon:(0,$.jsx)(v.Z,{}),"aria-controls":"panel-content_total_duration",id:"panel-header_total_duration",children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(M.Z,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.total_duration"),secondary:q(A.total_time,a)})]}),(0,$.jsx)(s.Suspense,{fallback:null,children:(0,$.jsxs)(k.Z,{children:[(0,$.jsxs)(C.ZP,{children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(F.Z,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.total_duration_available"),secondary:q(A.total_time_available,a)})]}),(0,$.jsxs)(C.ZP,{children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(K.Z,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.total_duration_unavailable"),secondary:q(A.total_time_unavailable,a)})]})]})})]},"total_duration"),(0,$.jsxs)(C.ZP,{children:[(0,$.jsx)(D.Z,{children:(0,$.jsx)(P.Z,{children:(0,$.jsx)(N.default,{})})}),(0,$.jsx)(S.Z,{primary:a("stats.generalStats.channel_start_date"),secondary:"".concat(new Date(A.channel_start_date).toLocaleDateString()," ").concat(a("stats.generalStats.channel_start_date_details",{value:T(A.channel_start_date,a).result}))})]})]})]})}),R.length>0&&(0,$.jsx)(y.ZP,{item:!0,xs:12,md:8,lg:8,children:(0,$.jsxs)(p.Z,{sx:{p:2,display:"flex",flexDirection:"column",height:360},children:[(0,$.jsx)(g.Z,{component:"h2",variant:"h6",color:"primary",gutterBottom:!0,children:a("stats.genresChart.title")}),(0,$.jsx)(l.h,{children:(0,$.jsxs)(o.v,{data:R,children:[(0,$.jsx)(i.q,{strokeDasharray:"2 2"}),(0,$.jsx)(c.K,{dataKey:"category",stroke:J}),(0,$.jsx)(d.B,{stroke:J}),(0,$.jsx)(h.u,{contentStyle:{backgroundColor:H}}),(0,$.jsx)(x.$,{type:"monotone",dataKey:"total_available",stackId:"1",stroke:"#82ca9d",fill:"#82ca9d",name:a("stats.genresChart.total_available")}),(0,$.jsx)(x.$,{type:"monotone",dataKey:"total_unavailable",stackId:"1",stroke:"#8884d8",fill:"#8884d8",name:a("stats.genresChart.total_unavailable")})]})})]})}),Y.length>0&&(0,$.jsx)(y.ZP,{item:!0,xs:12,md:4,lg:4,children:(0,$.jsxs)(p.Z,{sx:{p:2,display:"flex",flexDirection:"column",height:360},children:[(0,$.jsx)(g.Z,{component:"h2",variant:"h6",color:"primary",gutterBottom:!0,children:a("stats.platformsChart.title")}),(0,$.jsx)(l.h,{children:(0,$.jsxs)(u.H,{outerRadius:90,data:Y,children:[(0,$.jsx)(m.n,{}),(0,$.jsx)(j.I,{dataKey:"key",stroke:J}),(0,$.jsx)(Z.F,{name:a("stats.platformsChart.total_available"),dataKey:"total_available",stroke:"#1fa134",fill:"#1fa134",fillOpacity:.6}),(0,$.jsx)(Z.F,{name:a("stats.platformsChart.total_unavailable"),dataKey:"total_unavailable",stroke:"#8884d8",fill:"#8884d8",fillOpacity:.6}),(0,$.jsx)(_.D,{})]})})]})})]})})}}}]);
//# sourceMappingURL=3562.267fd8b4.chunk.js.map