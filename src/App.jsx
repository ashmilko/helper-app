import { useState, useEffect, useRef, useCallback } from "react";

const V = "#481AD3";
const VDIM = "rgba(72,26,211,0.12)";
const ORANGE = "#ff5a1a";
const GREEN = "#12a862";
const CREAM = "#f7f5ee";
const INK = "#1c1a2e";
const WEB_OFFSET = 860;

const NAMES_H = ["Maria","Devon","Priya","James","Aisha","Liu","Emma","Tariq","Marcus","Jerome"];
const NAMES_F = ["Sara","Ryan","Nadia","Darius","Zoe","Carlos","Sophie","Layla","Owen","Mei"];
const DETAILS = [
  "flooded basement — needs sandbags & help pumping","elderly neighbor with no transport or phone",
  "generator to share with 2 households on block","extra food & water for up to 4 people",
  "can drive supply runs Tuesday and Wednesday","checking on families along 6th Street corridor",
  "lost power — looking for warm shelter tonight","medical supplies available to share freely",
  "experienced carpenter for post-storm repairs","available for welfare check phone calls all day",
  "large tree down, needs chainsaw and crew","water in first floor, needs mop and volunteers",
];
const TASK_POOLS = {
  transport:["Drive Maria to Red Cross shelter","Pickup supplies from Soulard depot","Ferry elderly residents to warming center"],
  survey:["Walk 4th–8th St and report damage","Check on corner store on Gravois","Document flooded streets for city map"],
  food:["Deliver groceries to 12 households","Coordinate meal drop-off at community ctr","Restock water supply at staging area"],
  money:["Fund emergency hotel for 1 night","Cover generator fuel costs ($40)","Contribute to family displacement fund"],
  shelter:["Host displaced family for 2 nights","Open spare room as warming space","Offer garage as supply storage point"],
  skills:["Patch roof on elderly resident home","Restore power to 3 units (electrician)","Clear debris from storm drain on Pine"],
  calls:["Call 8 seniors on welfare check list","Follow up with families marked at-risk","Check in with Maria re: her basement"],
  supplies:["Deliver tarp and rope to 7th St","Bring blankets to community center","Restock first aid kit at staging area"],
};
const MESSAGES_H = {
  Maria:["hi, thank you so much for reaching out 🙏","my basement has about 4 inches of water","do you have a pump or know someone who does?"],
  Devon:["hey! yes i'm available tomorrow morning","i have a truck so i can carry supplies too","let me know what you need"],
  Priya:["i've been checking on the elderly folks on 6th","mrs. johnson at 612 hasn't been reachable","could someone stop by?"],
  James:["my generator can power 2 more houses","fuel's getting low though, maybe 3 more hours","can anyone bring more diesel?"],
  Aisha:["i have food for about 10 people","just made a big pot of soup 🍲","where should i bring it?"],
  Liu:["i'm a licensed electrician","happy to help restore power to whoever needs it","just message me your address"],
  Emma:["has anyone checked the community center?","it might be a good staging area","i can go scope it out"],
  Tariq:["i have space for a family of 3","just need a couple days notice","dm me details"],
  Marcus:["chainsaw is ready to go","can clear 2–3 trees today","who needs me first?"],
  Jerome:["completed welfare checks on Gravois ✓","everything looks ok on that block","moving to Manchester Ave next"],
};
const MESSAGES_F = {
  Sara:["hey are you ok??","saw the news about the flooding","let me know if you need anything"],
  Ryan:["just donated $50 to the fund","wish i could do more from here","stay safe ❤️"],
  Nadia:["i'm driving back into the city tomorrow","can pick up supplies on the way","what does the neighborhood need?"],
  Darius:["my parents are on Gravois — can you check on them?","they haven't answered my calls","i'm really worried"],
  Zoe:["organizing a carpool from Clayton","we have 4 seats for volunteers","leaving at 8am"],
  Carlos:["brought 3 boxes of canned food to staging","they need water most urgently right now","tarps also running low"],
  Sophie:["i'm a nurse if anyone needs medical advice","can do triage calls from home","just ask"],
  Layla:["coordinating with the food bank on Vandeventer","they have pallets ready to go","need drivers urgently"],
  Owen:["power back on in my area","running extension cords to neighbors","come grab power if you're nearby"],
  Mei:["my firm is matching volunteer hours","every hour you log = $25 donation","sign up at helper.stl"],
};
const TTYPES = ["need","need","helper","helper","active"];
const REPLIES = ["thanks so much!","got it 👍","on my way","let me check","ok!","perfect, see you soon","i appreciate you ❤️"];

function rnd(a,b){ return a + Math.random()*(b-a); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

function buildGraph(names, msgs, l1, l2, picked) {
  const nodes = [], edges = [];
  nodes.push({ id:0, x:0, y:0, r:50, type:"helper", name:"you", isYou:true, layer:0,
    detail: Array.from(picked).join(", ") || "community helper", ripple:false, tasks:[], msgs:[] });
  for (let i=0; i<l1; i++) {
    const a=(i/l1)*Math.PI*2+0.4, d=rnd(162,195);
    const nm=names[i%names.length], tp=pick(TTYPES), taskType=pick(Object.keys(TASK_POOLS));
    nodes.push({ id:nodes.length, x:Math.cos(a)*d, y:Math.sin(a)*d, r:rnd(24,40), type:tp, name:nm,
      detail:pick(DETAILS), layer:1, ripple:false, star:false,
      tasks:TASK_POOLS[taskType].map((t,ti)=>({text:t,done:Math.random()<0.3,type:taskType,id:ti})),
      msgs:(msgs[nm]||["hello!","checking in 👋","let me know if you need anything"]).map((m,mi)=>({text:m,them:true,t:Date.now()-1000*(3-mi),read:false}))
    });
  }
  for (let i=1; i<=l1; i++) edges.push({a:0,b:i});
  for (let i=0; i<l2; i++) {
    const a=(i/l2)*Math.PI*2+1.2, d=rnd(295,340);
    const par=1+(i%l1), nm=names[(i+l1)%names.length], tp=pick(TTYPES), taskType=pick(Object.keys(TASK_POOLS));
    nodes.push({ id:nodes.length, x:Math.cos(a)*d, y:Math.sin(a)*d, r:rnd(11,20), type:tp, name:nm,
      detail:pick(DETAILS), layer:2, par, ripple:false, star:false,
      tasks:TASK_POOLS[taskType].slice(0,2).map((t,ti)=>({text:t,done:Math.random()<0.25,type:taskType,id:ti})),
      msgs:(msgs[nm]||["hi!","can you help?"]).map((m,mi)=>({text:m,them:true,t:Date.now()-800*(2-mi),read:false}))
    });
    edges.push({a:par,b:nodes.length-1});
    if (Math.random()<0.2) edges.push({a:1+Math.floor(Math.random()*l1),b:nodes.length-1});
  }
  return {nodes,edges};
}

// ─── Node colors by type ───
function nodeColors(type) {
  if (type==="matched") return {stroke:GREEN,fill:"rgba(18,168,98,0.18)",glow:"rgba(18,168,98,0.15)"};
  if (type==="active")  return {stroke:ORANGE,fill:"rgba(255,90,26,0.18)",glow:"rgba(255,90,26,0.12)"};
  if (type==="helper")  return {stroke:V,fill:"rgba(72,26,211,0.28)",glow:"rgba(72,26,211,0.10)"};
  return {stroke:V,fill:"rgba(72,26,211,0.10)",glow:"rgba(72,26,211,0.06)"};
}

// ─── SVG Network ───
function Network({ webs, setWebs, panelNode, setPanelNode, panelOpen, setPanelOpen, addLog, activeWeb, setActiveWeb, picked, jumpTo }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    T: 0, pan:{x:0,y:0}, panV:{x:0,y:0}, drift:{x:0,y:0},
    mouse:{x:-999,y:-999}, mNorm:{x:0,y:0},
    dragging:false, drgS:{x:0,y:0}, panS:{x:0,y:0}, lastD:{x:0,y:0}, lastDT:0,
    hovId:null, hovWeb:null, zoneT:0, pendingSwitch:false, ripples:{}
  });
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (jumpTo === "hood") {
      const s = stateRef.current;
      const sx = s.pan.x; const target = 0; const dur = 680; const start = performance.now();
      function fr(now) { const p=Math.min((now-start)/dur,1); s.pan.x=sx+(target-sx)*(1-Math.pow(1-p,4)); if(p<1) requestAnimationFrame(fr); else {s.pan.x=target;s.panV={x:0,y:0};} }
      requestAnimationFrame(fr);
    } else if (jumpTo === "friends") {
      const s = stateRef.current;
      const sx = s.pan.x; const target = -(WEB_OFFSET - (svgRef.current?.clientWidth||800)*0.05); const dur = 680; const start = performance.now();
      function fr(now) { const p=Math.min((now-start)/dur,1); s.pan.x=sx+(target-sx)*(1-Math.pow(1-p,4)); if(p<1) requestAnimationFrame(fr); else {s.pan.x=target;s.panV={x:0,y:0};} }
      requestAnimationFrame(fr);
    }
  }, [jumpTo]);

  const W = () => svgRef.current ? svgRef.current.clientWidth : 800;
  const H = () => svgRef.current ? svgRef.current.clientHeight : 600;

  useEffect(() => {
    let running = true;
    function tick() {
      if (!running) return;
      const s = stateRef.current;
      s.T += 0.011;
      if (!s.dragging) { s.pan.x += s.panV.x; s.pan.y += s.panV.y; s.panV.x *= 0.87; s.panV.y *= 0.87; }
      s.drift.x += (s.mNorm.x*70 - s.drift.x) * 0.05;
      s.drift.y += (s.mNorm.y*70 - s.drift.y) * 0.05;
      setFrame(f => f+1);
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { running=false; cancelAnimationFrame(animRef.current); };
  }, []);

  const ox = () => W()/2 + stateRef.current.pan.x + stateRef.current.drift.x;
  const oy = () => H()/2 + stateRef.current.pan.y + stateRef.current.drift.y;

  function webOx(wk) { return ox() + (wk==="friends" ? WEB_OFFSET : 0); }

  function onMouseMove(e) {
    const s = stateRef.current;
    const r = svgRef.current.getBoundingClientRect();
    s.mouse.x = e.clientX - r.left; s.mouse.y = e.clientY - r.top;
    s.mNorm.x = (s.mouse.x - W()*0.5)/(W()*0.5);
    s.mNorm.y = (s.mouse.y - H()*0.5)/(H()*0.5);
    if (s.dragging) {
      const now=performance.now(), dt=Math.max(now-s.lastDT,1);
      s.panV.x=(e.clientX-s.lastD.x)/dt*14; s.panV.y=(e.clientY-s.lastD.y)/dt*14;
      s.pan.x=s.panS.x+(e.clientX-s.drgS.x); s.pan.y=s.panS.y+(e.clientY-s.drgS.y);
      s.lastD={x:e.clientX,y:e.clientY}; s.lastDT=now;
    }
    const pct = s.mouse.x / W();
    if (pct < 0.09) {
      s.zoneT += 16;
      if (s.zoneT > 600 && !s.pendingSwitch) { s.pendingSwitch=true; bounceToOther(); }
    } else { s.zoneT=0; s.pendingSwitch=false; }

    // hover detection
    s.hovId=null; s.hovWeb=null; let bd=Infinity;
    for (const [wk,w] of Object.entries(webs)) {
      const wxo = wk==="friends"?WEB_OFFSET:0;
      for (const n of w.nodes) {
        const fy=Math.sin(s.T+n.id*0.72)*2.5;
        const d=Math.hypot(s.mouse.x-(ox()+wxo+n.x), s.mouse.y-(oy()+n.y+fy));
        if (d<n.r+20 && d<bd) { bd=d; s.hovId=n.id; s.hovWeb=wk; }
      }
    }
  }

  function onMouseDown(e) {
    const s=stateRef.current;
    s.dragging=true; s.drgS={x:e.clientX,y:e.clientY};
    s.panS={x:s.pan.x,y:s.pan.y}; s.lastD={x:e.clientX,y:e.clientY};
    s.lastDT=performance.now(); s.panV={x:0,y:0};
  }
  function onMouseUp(e) {
    const s=stateRef.current;
    if (Math.abs(e.clientX-s.drgS.x)<6&&Math.abs(e.clientY-s.drgS.y)<6) handleClick(e);
    s.dragging=false;
  }
  function onMouseLeave() { const s=stateRef.current; s.dragging=false; s.zoneT=0; s.pendingSwitch=false; }

  function handleClick(e) {
    const s=stateRef.current;
    const r=svgRef.current.getBoundingClientRect();
    const mx=e.clientX-r.left, my=e.clientY-r.top;
    for (const [wk,w] of Object.entries(webs)) {
      const wxo=wk==="friends"?WEB_OFFSET:0;
      for (const n of w.nodes) {
        const fy=Math.sin(s.T+n.id*0.72)*2.5;
        if (Math.hypot(mx-(ox()+wxo+n.x), my-(oy()+n.y+fy))<n.r+14) {
          setPanelNode({node:n, wk});
          setPanelOpen(true);
          return;
        }
      }
    }
  }

  function bounceToOther() {
    const s=stateRef.current;
    const target = activeWeb==="hood" ? -(WEB_OFFSET - W()*0.05) : 0;
    const sx=s.pan.x; const dur=680; const start=performance.now();
    function frame(now) {
      const p=Math.min((now-start)/dur,1);
      const eased=1-Math.pow(1-p,4);
      s.pan.x=sx+(target-sx)*eased;
      if (p<1) requestAnimationFrame(frame);
      else { s.pan.x=target; s.panV={x:0,y:0}; s.pendingSwitch=false; s.zoneT=0;
        setActiveWeb(w => w==="hood"?"friends":"hood");
        addLog(activeWeb==="hood"?"👥 your friends":"🏘 your neighborhood"); }
    }
    requestAnimationFrame(frame);
  }

  const s = stateRef.current;
  const T = s.T;
  const oxv = ox(), oyv = oy();

  // friends web offset
  const friendsX = oxv + WEB_OFFSET;
  const hoodX = oxv;

  function renderWeb(wk) {
    const w = webs[wk];
    if (!w) return null;
    const wxo = wk==="friends" ? WEB_OFFSET : 0;
    const {nodes,edges} = w;
    const elements = [];

    // edges
    for (const e of edges) {
      const a=nodes[e.a], b=nodes[e.b];
      const ax=oxv+wxo+a.x, ay=oyv+a.y+Math.sin(T+a.id*0.72)*2.5;
      const bx=oxv+wxo+b.x, by=oyv+b.y+Math.sin(T+b.id*0.72)*2.5;
      const hot=s.hovWeb===wk&&(s.hovId===a.id||s.hovId===b.id);
      const isM=a.type==="matched"||b.type==="matched";
      const isA=a.type==="active"||b.type==="active";
      const col=isM?"rgba(18,168,98,0.22)":isA?"rgba(255,90,26,0.16)":"rgba(72,26,211,0.09)";
      elements.push(
        <line key={`e${wk}${e.a}-${e.b}`} x1={ax} y1={ay} x2={bx} y2={by}
          stroke={hot?"rgba(72,26,211,0.48)":col} strokeWidth={hot?1.7:1} />
      );
      // flow particle
      if (hot||isA||isM) {
        const sp=isM?0.48:isA?0.40:0.68;
        const p=((T*sp+e.a*0.38)%1);
        const px=ax+(bx-ax)*p, py=ay+(by-ay)*p;
        const pcol=isM?"#12a862":isA?"#ff5a1a":V;
        elements.push(<circle key={`p${wk}${e.a}-${e.b}`} cx={px} cy={py} r={3.5} fill={pcol} opacity={0.75}/>);
      }
    }

    // nodes
    for (const n of nodes) {
      const fy=Math.sin(T+n.id*0.72)*2.5;
      const nx=oxv+wxo+n.x, ny=oyv+n.y+fy;
      const hot=s.hovWeb===wk&&s.hovId===n.id;
      const sc=hot?1.12:1;
      const {stroke,fill,glow}=nodeColors(n.type);
      const opacity=n.layer===2?0.72:1;
      const unread=(n.msgs||[]).filter(m=>m.them&&!m.read).length;

      elements.push(
        <g key={`n${wk}${n.id}`} opacity={opacity}>
          {/* glow */}
          <circle cx={nx} cy={ny} r={n.r*sc*2.1} fill={glow} />
          {/* urgent pulse */}
          {n.urgent && <circle cx={nx} cy={ny} r={n.r*sc*1.44}
            fill="none" stroke={`rgba(255,90,26,${0.3+0.3*Math.sin(T*4)})`} strokeWidth={2}/>}
          {/* ripple */}
          {n.ripple && <circle cx={nx} cy={ny} r={n.r*sc*1.8}
            fill="none" stroke={n.type==="matched"?"rgba(18,168,98,0.35)":"rgba(72,26,211,0.3)"} strokeWidth={1.5}
            opacity={0.6}/>}
          {/* body */}
          <circle cx={nx} cy={ny} r={n.r*sc} fill={fill} stroke={stroke}
            strokeWidth={n.isYou?2.4:hot?1.9:1.4}/>
          {/* glass highlight */}
          {n.r>17 && <circle cx={nx-n.r*sc*0.17} cy={ny-n.r*sc*0.18} r={n.r*sc*0.46}
            fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={0.7}/>}
          {/* label */}
          {n.isYou && <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle"
            fill={V} fontFamily="Playfair Display,serif" fontStyle="italic" fontSize={13}>you</text>}
          {!n.isYou && n.layer===1 && n.r>23 &&
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(28,26,46,0.82)" fontFamily="DM Sans,sans-serif" fontSize={Math.min(10,n.r*0.3)} fontWeight={500}>
              {n.name}
            </text>}
          {/* matched ✦ mark */}
          {n.type==="matched" && <text x={nx+n.r*sc*0.7} y={ny-n.r*sc*0.7}
            textAnchor="middle" dominantBaseline="middle" fill={GREEN} fontSize={10*sc}>✦</text>}
          {/* unread dot */}
          {unread>0 && !n.isYou && <>
            <circle cx={nx+n.r*sc*0.68} cy={ny-n.r*sc*0.68} r={4.5}
              fill="rgba(72,26,211,0.88)"/>
            <circle cx={nx+n.r*sc*0.68} cy={ny-n.r*sc*0.68} r={4.5}
              fill="none" stroke="rgba(247,245,238,0.9)" strokeWidth={1.2}/>
          </>}
        </g>
      );
    }
    return elements;
  }

  // cluster hints — only show when the OTHER web's center is close to the visible edge
  const friendsVisible = friendsX > W()*0.78 && friendsX < W()+300;
  const hoodVisible = hoodX < W()*0.22 && hoodX > -300;

  // dot grid
  const gs=52, dots=[];
  const gox=oxv%gs, goy=oyv%gs;
  for (let gx=gox-gs; gx<W()+gs; gx+=gs) {
    for (let gy=goy-gs; gy<H()+gs; gy+=gs) {
      const f=1-Math.hypot((gx-W()/2)/(W()*0.56),(gy-H()/2)/(H()*0.56));
      if (f>0) dots.push(<circle key={`d${gx}${gy}`} cx={gx} cy={gy} r={1} fill={`rgba(72,26,211,${(0.042*Math.min(f,1)).toFixed(3)})`}/>);
    }
  }

  // tooltip
  const hovNode = s.hovId!==null && s.hovWeb ? webs[s.hovWeb]?.nodes[s.hovId] : null;
  const hovWxo = s.hovWeb==="friends"?WEB_OFFSET:0;
  let tipX=0,tipY=0,tipContent=null;
  if (hovNode && !s.dragging && !panelOpen) {
    const fy=Math.sin(T+hovNode.id*0.72)*2.5;
    tipX=oxv+hovWxo+hovNode.x+hovNode.r*1.1+12;
    tipY=oyv+hovNode.y+fy-24;
    const statusLabel={need:"needs help",helper:"helper ready",active:"helping now",matched:"matched"}[hovNode.type]||"";
    const unread=(hovNode.msgs||[]).filter(m=>m.them&&!m.read).length;
    tipContent={name:hovNode.isYou?"you":hovNode.name,status:statusLabel,unread,isYou:hovNode.isYou};
  }

  return (
    <div style={{position:"absolute",inset:0,cursor:s.dragging?"grabbing":"grab",overflow:"hidden"}}
      onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}>
      <svg ref={svgRef} style={{width:"100%",height:"100%",display:"block"}}>
        {dots}
        {renderWeb("hood")}
        {renderWeb("friends")}
        {/* cluster hint labels — pinned to screen edges, never overlap bubbles */}
        {friendsVisible && (() => {
          const alpha = Math.min(0.6, (W()+300-friendsX)/300);
          return (
            <g>
              <rect x={W()-106} y={oyv-14} width={98} height={28} rx={14}
                fill={`rgba(72,26,211,${(alpha*0.10).toFixed(3)})`}/>
              <text x={W()-57} y={oyv}
                textAnchor="middle" dominantBaseline="middle"
                fill={`rgba(72,26,211,${alpha.toFixed(3)})`}
                fontFamily="Playfair Display,serif" fontStyle="italic" fontSize={12}>
                friends →
              </text>
            </g>
          );
        })()}
        {hoodVisible && (() => {
          const alpha = Math.min(0.6, (hoodX+300)/300);
          return (
            <g>
              <rect x={8} y={oyv-14} width={114} height={28} rx={14}
                fill={`rgba(72,26,211,${(alpha*0.10).toFixed(3)})`}/>
              <text x={65} y={oyv}
                textAnchor="middle" dominantBaseline="middle"
                fill={`rgba(72,26,211,${alpha.toFixed(3)})`}
                fontFamily="Playfair Display,serif" fontStyle="italic" fontSize={12}>
                ← neighborhood
              </text>
            </g>
          );
        })()}
      </svg>
      {/* tooltip */}
      {tipContent && (
        <div style={{position:"absolute",left:tipX,top:tipY,pointerEvents:"none",
          background:"rgba(18,14,32,0.95)",backdropFilter:"blur(10px)",
          color:"#f0ede2",fontSize:"0.73rem",padding:"0.5rem 0.85rem",
          borderRadius:10,lineHeight:1.52,whiteSpace:"nowrap",
          border:"1px solid rgba(255,255,255,0.07)",zIndex:50}}>
          {tipContent.isYou
            ? <><em style={{fontFamily:"Playfair Display,serif"}}>you</em><span style={{opacity:.45,fontSize:"0.68rem"}}> · click to view</span></>
            : <><strong style={{fontSize:"0.76rem"}}>{tipContent.name}</strong>
                <span style={{opacity:.48,fontSize:"0.68rem",marginLeft:"0.3rem"}}>{tipContent.status}</span>
                {tipContent.unread>0 && <span style={{color:"rgba(152,120,255,0.9)",fontSize:"0.66rem"}}> · {tipContent.unread} new</span>}
              </>}
        </div>
      )}
    </div>
  );
}

// ─── Panel ───
function Panel({ panelNode, setPanelNode, panelOpen, setPanelOpen, webs, setWebs, addLog, picked }) {
  const [tab, setTab] = useState("info");
  const [chatInput, setChatInput] = useState("");
  const chatLogRef = useRef(null);

  useEffect(() => { if (panelOpen) setTab("info"); }, [panelNode?.node?.id]);
  useEffect(() => { if (chatLogRef.current) chatLogRef.current.scrollTop=chatLogRef.current.scrollHeight; }, [tab]);

  if (!panelNode) return null;
  const {node:n, wk} = panelNode;

  function updateNode(updates) {
    setWebs(prev => {
      const next = {...prev};
      next[wk] = {...next[wk], nodes: next[wk].nodes.map(nd => nd.id===n.id ? {...nd,...updates} : nd)};
      return next;
    });
  }

  function doMatch() { updateNode({type:"matched",ripple:true}); addLog(`✓ matched with ${n.name}`); }
  function unmatch() { updateNode({type:"need",ripple:false}); addLog(`↩ unmatched from ${n.name}`); }
  function doFlag() { updateNode({urgent:true,ripple:true}); addLog(`⚠ flagged ${n.name} as urgent`); }
  function toggleTask(i) {
    const tasks=[...n.tasks]; tasks[i]={...tasks[i],done:!tasks[i].done};
    if(tasks[i].done) addLog(`✅ task done: ${tasks[i].text.slice(0,30)}…`);
    updateNode({tasks});
  }
  function takeTask() {
    const i=n.tasks.findIndex(t=>!t.done);
    if(i<0){addLog("all tasks already taken!");return;}
    const tasks=[...n.tasks]; tasks[i]={...tasks[i],assignedToYou:true};
    addLog(`📋 took task: ${tasks[i].text.slice(0,28)}…`); updateNode({tasks});
  }
  function sendMsg() {
    if(!chatInput.trim()) return;
    const newMsg={text:chatInput.trim(),them:false,t:Date.now(),read:true};
    updateNode({msgs:[...n.msgs,newMsg]}); addLog(`💬 sent to ${n.name}`); setChatInput("");
    setTimeout(() => {
      const reply={text:pick(REPLIES),them:true,t:Date.now(),read:false};
      setWebs(prev => {
        const next={...prev};
        const nd=next[wk].nodes.find(x=>x.id===n.id);
        if(nd) next[wk]={...next[wk],nodes:next[wk].nodes.map(x=>x.id===n.id?{...x,msgs:[...x.msgs,reply]}:x)};
        return next;
      });
      addLog(`💬 new message from ${n.name}`);
    },1500);
  }

  const liveNode = webs[wk]?.nodes.find(x=>x.id===n.id) || n;
  const statusLabel={need:"needs help",helper:"helper ready",active:"actively helping",matched:"matched ★"}[liveNode.type]||"";
  const tagColor={need:V,helper:V,active:ORANGE,matched:GREEN}[liveNode.type]||V;
  const tagBg={need:VDIM,helper:VDIM,active:"rgba(255,90,26,0.12)",matched:"rgba(18,168,98,0.12)"}[liveNode.type]||VDIM;

  const tabStyle=(t)=>({flex:1,padding:"0.62rem 0.4rem",fontSize:"0.74rem",fontWeight:500,
    color:tab===t?V:"rgba(28,26,46,0.45)",background:"none",border:"none",cursor:"pointer",
    borderBottom:`2px solid ${tab===t?V:"transparent"}`,marginBottom:-1,fontFamily:"DM Sans,sans-serif",
    transition:"color 0.2s"});

  const pbStyle=(color=V)=>({width:"100%",padding:"0.55rem 0.9rem",borderRadius:10,
    border:`1.5px solid ${color}`,background:"transparent",color,
    fontFamily:"DM Sans,sans-serif",fontSize:"0.77rem",fontWeight:500,
    cursor:"pointer",textAlign:"left",marginBottom:"0.36rem",display:"block",transition:"all 0.2s"});

  return (
    <div style={{position:"absolute",right:0,top:0,bottom:0,width:300,
      background:"rgba(247,245,238,0.98)",backdropFilter:"blur(20px)",
      borderLeft:`1px solid rgba(72,26,211,0.09)`,zIndex:40,
      transform:panelOpen?"translateX(0)":"translateX(100%)",
      transition:"transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <button onClick={()=>{setPanelOpen(false);setPanelNode(null)}} style={{position:"absolute",top:"0.9rem",right:"0.9rem",background:"none",border:"none",fontSize:"1rem",cursor:"pointer",color:"rgba(28,26,46,0.35)",zIndex:5}}>✕</button>

      {/* head */}
      <div style={{padding:"1.5rem 1.3rem 0.9rem",borderBottom:"1px solid rgba(72,26,211,0.08)",flexShrink:0}}>
        <h3 style={{fontFamily:"Playfair Display,serif",fontStyle:"italic",fontSize:"1.18rem",color:V,fontWeight:400,marginBottom:"0.42rem"}}>
          {liveNode.isYou?"you":liveNode.name}
        </h3>
        <span style={{display:"inline-block",fontSize:"0.67rem",padding:"0.18rem 0.58rem",borderRadius:100,
          background:tagBg,color:tagColor,border:`1px solid ${tagColor}30`,fontWeight:500,marginRight:4}}>
          {statusLabel}
        </span>
        {liveNode.urgent && <span style={{display:"inline-block",fontSize:"0.67rem",padding:"0.18rem 0.58rem",borderRadius:100,
          background:"rgba(255,90,26,0.12)",color:ORANGE,border:`1px solid rgba(255,90,26,0.2)`,fontWeight:500}}>⚠ urgent</span>}
        {liveNode.type==="matched" && <span style={{display:"inline-block",fontSize:"0.67rem",padding:"0.18rem 0.58rem",borderRadius:100,
          background:"rgba(18,168,98,0.12)",color:GREEN,border:`1px solid rgba(18,168,98,0.2)`,fontWeight:500,marginLeft:3}}>✦ matched</span>}
      </div>

      {/* tabs */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(72,26,211,0.08)",flexShrink:0}}>
        {["info","tasks","chat","match"].map(t=>(
          <button key={t} style={tabStyle(t)} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>

      {/* body */}
      <div style={{flex:1,overflowY:"auto",padding:"1.1rem 1.3rem"}}>

        {tab==="info" && <>
          <p style={{fontSize:"0.67rem",fontWeight:500,letterSpacing:"0.08em",color:"rgba(28,26,46,0.52)",textTransform:"uppercase",marginBottom:"0.6rem"}}>about</p>
          <p style={{fontSize:"0.79rem",color:"rgba(28,26,46,0.70)",lineHeight:1.68,marginBottom:"0.85rem"}}>{liveNode.detail}</p>
          <div style={{height:1,background:"rgba(72,26,211,0.07)",margin:"0.65rem 0"}}/>
          <p style={{fontSize:"0.67rem",fontWeight:500,letterSpacing:"0.08em",color:"rgba(28,26,46,0.52)",textTransform:"uppercase",marginBottom:"0.6rem"}}>actions</p>
          {!liveNode.isYou && <>
            {liveNode.type==="need" && <>
              <button style={pbStyle(GREEN)} onClick={doMatch}>✓ i can help with this</button>
              <button style={pbStyle(V)} onClick={()=>setTab("chat")}>💬 send a message</button>
              <button style={pbStyle(V)} onClick={()=>setTab("tasks")}>📋 view & take tasks</button>
            </>}
            {liveNode.type==="helper" && <>
              <button style={pbStyle(V)} onClick={()=>setTab("chat")}>💬 coordinate together</button>
              <button style={pbStyle(V)} onClick={()=>setTab("tasks")}>📋 view shared tasks</button>
            </>}
            {liveNode.type==="active" && <>
              <button style={pbStyle(GREEN)} onClick={doMatch}>🤝 join this effort</button>
              <button style={pbStyle(V)} onClick={()=>setTab("chat")}>💬 check in</button>
            </>}
            {liveNode.type==="matched" && <>
              <button style={pbStyle(GREEN)} onClick={()=>setTab("chat")}>💬 stay in touch</button>
              <button style={pbStyle(V)} onClick={()=>setTab("tasks")}>✅ update tasks</button>
            </>}
            <div style={{height:1,background:"rgba(72,26,211,0.07)",margin:"0.65rem 0"}}/>
            <button style={pbStyle(ORANGE)} onClick={doFlag}>⚠ flag as urgent need</button>
          </>}
          {liveNode.isYou && <p style={{fontSize:"0.77rem",color:"rgba(28,26,46,0.60)"}}>offering: {Array.from(picked).join(", ")||"general help"}</p>}
        </>}

        {tab==="tasks" && <>
          <p style={{fontSize:"0.67rem",fontWeight:500,letterSpacing:"0.08em",color:"rgba(28,26,46,0.52)",textTransform:"uppercase",marginBottom:"0.6rem"}}>tasks for {liveNode.isYou?"you":liveNode.name}</p>
          {liveNode.tasks.length===0 && <p style={{fontSize:"0.77rem",color:"rgba(28,26,46,0.55)"}}>no tasks yet</p>}
          {liveNode.tasks.map((task,i)=>(
            <div key={i} onClick={()=>toggleTask(i)} style={{display:"flex",alignItems:"flex-start",gap:"0.55rem",padding:"0.58rem 0.7rem",borderRadius:10,border:`1px solid rgba(72,26,211,${task.done?0.08:0.13})`,marginBottom:"0.38rem",background:"rgba(255,255,255,0.5)",cursor:"pointer"}}>
              <div style={{width:15,height:15,borderRadius:"50%",border:`1.5px solid ${task.done?GREEN:"rgba(72,26,211,0.3)"}`,background:task.done?GREEN:"transparent",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {task.done && <span style={{fontSize:"0.58rem",color:"#fff"}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:"0.77rem",color:`rgba(28,26,46,${task.done?0.35:0.78})`,lineHeight:1.5,textDecoration:task.done?"line-through":"none"}}>{task.text}</div>
                <div style={{fontSize:"0.61rem",color:"rgba(28,26,46,0.52)",marginTop:2}}>{task.type} · {task.done?"completed":"pending"}</div>
              </div>
            </div>
          ))}
          {liveNode.tasks.length>0 && <>
            <div style={{height:1,background:"rgba(72,26,211,0.07)",margin:"0.65rem 0"}}/>
            <p style={{fontSize:"0.7rem",color:"rgba(28,26,46,0.55)",marginBottom:"0.4rem"}}>{liveNode.tasks.filter(t=>t.done).length}/{liveNode.tasks.length} tasks completed</p>
            <button style={pbStyle(GREEN)} onClick={takeTask}>+ take on a task</button>
          </>}
        </>}

        {tab==="chat" && <>
          <div ref={chatLogRef} style={{display:"flex",flexDirection:"column",gap:"0.5rem",minHeight:120,maxHeight:260,overflowY:"auto",marginBottom:"0.75rem"}}>
            {liveNode.msgs.map((m,i)=>(
              <div key={i} style={{maxWidth:"82%",padding:"0.48rem 0.78rem",borderRadius:14,fontSize:"0.77rem",lineHeight:1.5,
                alignSelf:m.them?"flex-start":"flex-end",
                background:m.them?"rgba(72,26,211,0.09)":V,color:m.them?INK:"#fff",
                borderRadius:m.them?"4px 14px 14px 14px":"14px 4px 14px 14px"}}>
                {m.text}
                <div style={{fontSize:"0.61rem",opacity:.4,marginTop:2}}>{new Date(m.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:"0.45rem",alignItems:"center"}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMsg()}
              placeholder={`message ${liveNode.isYou?"yourself":liveNode.name}…`}
              style={{flex:1,padding:"0.52rem 0.85rem",borderRadius:100,border:`1.5px solid rgba(72,26,211,0.2)`,background:"rgba(255,255,255,0.7)",fontFamily:"DM Sans,sans-serif",fontSize:"0.77rem",outline:"none",color:INK}}/>
            <button onClick={sendMsg} style={{width:30,height:30,borderRadius:"50%",background:V,border:"none",color:"#fff",cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
          </div>
        </>}

        {tab==="match" && <>
          {liveNode.isYou && <p style={{fontSize:"0.77rem",color:"rgba(28,26,46,0.45)"}}>this is you!</p>}
          {!liveNode.isYou && liveNode.type==="matched" && <>
            <div style={{background:"rgba(255,255,255,0.6)",border:`1px solid rgba(18,168,98,0.22)`,borderRadius:12,padding:"0.95rem",marginBottom:"0.55rem"}}>
              <p style={{fontSize:"0.81rem",color:GREEN,fontWeight:500,marginBottom:"0.28rem"}}>✓ you're matched with {liveNode.name}</p>
              <p style={{fontSize:"0.75rem",color:"rgba(28,26,46,0.58)",lineHeight:1.55}}>Connected to help with: <em>{liveNode.detail.slice(0,60)}…</em></p>
            </div>
            <button style={pbStyle(GREEN)} onClick={()=>setTab("chat")}>💬 message {liveNode.name}</button>
            <button style={pbStyle(V)} onClick={()=>setTab("tasks")}>✅ update task progress</button>
            <div style={{height:1,background:"rgba(72,26,211,0.07)",margin:"0.65rem 0"}}/>
            <button style={pbStyle(ORANGE)} onClick={unmatch}>✕ unmatch</button>
          </>}
          {!liveNode.isYou && liveNode.type!=="matched" && <>
            <p style={{fontSize:"0.67rem",fontWeight:500,letterSpacing:"0.08em",color:"rgba(28,26,46,0.52)",textTransform:"uppercase",marginBottom:"0.55rem"}}>what {liveNode.name} needs</p>
            <p style={{fontSize:"0.79rem",color:"rgba(28,26,46,0.70)",lineHeight:1.68,marginBottom:"0.75rem"}}>{liveNode.detail}</p>
            <div style={{height:1,background:"rgba(72,26,211,0.07)",margin:"0.65rem 0"}}/>
            <div style={{background:"rgba(72,26,211,0.04)",border:`1px solid rgba(72,26,211,0.16)`,borderRadius:12,padding:"0.9rem",marginBottom:"0.55rem"}}>
              <p style={{fontSize:"0.81rem",color:V,fontWeight:500,marginBottom:"0.28rem"}}>ready to connect?</p>
              <p style={{fontSize:"0.75rem",color:"rgba(28,26,46,0.60)",lineHeight:1.55}}>Matching means you'll coordinate help directly. You can unmatch at any time.</p>
            </div>
            <button style={pbStyle(GREEN)} onClick={doMatch}>✓ confirm match with {liveNode.name}</button>
            <button style={pbStyle(V)} onClick={()=>setTab("chat")}>💬 message first</button>
          </>}
        </>}

      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [screen, setScreen] = useState(0); // 0-welcome 1-safe 2-help 3-network
  const [prevScreen, setPrevScreen] = useState(null);
  const [picked, setPicked] = useState(new Set());
  const [webs, setWebs] = useState(null);
  const [panelNode, setPanelNode] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeWeb, setActiveWeb] = useState("hood");
  const [jumpTo, setJumpTo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showEmerg, setShowEmerg] = useState(false);

  function addLog(msg) { setLogs(l => [...l.slice(-3), {msg, id:Date.now()+Math.random()}]); }

  function go(i) { setPrevScreen(screen); setScreen(i); }

  function toggleChip(v) { setPicked(p => { const n=new Set(p); n.has(v)?n.delete(v):n.add(v); return n; }); }

  function startNetwork() {
    const w = {
      hood: buildGraph(NAMES_H, MESSAGES_H, 6, 8, picked),
      friends: buildGraph(NAMES_F, MESSAGES_F, 5, 7, picked),
    };
    setWebs(w);
    go(3);
    setTimeout(()=>addLog("👋 your neighborhood network is live"),900);
    setTimeout(()=>{
      const n=w.hood.nodes.filter(n=>n.type==="need").length;
      addLog(`📍 ${n} neighbors nearby need help`);
    },2000);
    setTimeout(()=>addLog("👉 drift left to see your friends"),3400);
  }

  const chips = [
    {v:"transport",l:"🚗 transportation"},{v:"survey",l:"🔍 check outside"},
    {v:"food",l:"🥫 food & water"},{v:"money",l:"💛 donate funds"},
    {v:"shelter",l:"🏠 shelter space"},{v:"skills",l:"🔧 skilled help"},
    {v:"calls",l:"📞 welfare calls"},{v:"supplies",l:"📦 supply runs"},
  ];

  const slide = (i) => ({
    position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    opacity: screen===i?1:0, pointerEvents: screen===i?"all":"none",
    transform: screen===i?"translateX(0)":screen>i?"translateX(-55px)":"translateX(55px)",
    transition:"opacity 0.6s cubic-bezier(0.4,0,0.2,1),transform 0.6s cubic-bezier(0.4,0,0.2,1)",
  });

  const btnStyle = (primary=false) => ({
    border:`1.5px solid ${V}`,background:primary?V:"transparent",color:primary?"#fff":V,
    fontFamily:"DM Sans,sans-serif",fontSize:"0.86rem",fontWeight:500,
    padding:"0.68rem 1.55rem",borderRadius:100,cursor:"pointer",letterSpacing:"0.02em",
    transition:"all 0.2s ease",
  });

  return (
    <div style={{width:"100vw",height:"100vh",background:CREAM,fontFamily:"DM Sans,sans-serif",color:INK,overflow:"hidden",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input { outline:none; }
        button:hover { opacity:0.88; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes logIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .au1{animation:fadeUp .45s ease forwards;opacity:0}
        .au2{animation:fadeUp .45s .09s ease forwards;opacity:0}
        .au3{animation:fadeUp .45s .18s ease forwards;opacity:0}
        .au4{animation:fadeUp .45s .27s ease forwards;opacity:0}
      `}</style>

      {/* S0 Welcome */}
      <div style={slide(0)}>
        <svg className="au1" width={200} height={130} viewBox="0 0 200 130" fill="none" style={{marginBottom:"1.75rem"}}>
          {/* Left figure */}
          <circle cx={44} cy={28} r={12} stroke={V} strokeWidth={2.2} fill="none"/>
          {/* left body */}
          <path d="M44 40 L44 72" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* left arm up to center fist-bump */}
          <path d="M44 50 L96 46" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* left arm down */}
          <path d="M44 54 L28 78" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* left legs */}
          <path d="M44 72 L30 100 M44 72 L54 100" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* Right figure */}
          <circle cx={156} cy={28} r={12} stroke={V} strokeWidth={2.2} fill="none"/>
          {/* right body */}
          <path d="M156 40 L156 72" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* right arm up to center fist-bump */}
          <path d="M156 50 L104 46" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* right arm down */}
          <path d="M156 54 L172 78" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* right legs */}
          <path d="M156 72 L146 100 M156 72 L170 100" stroke={V} strokeWidth={2.2} strokeLinecap="round"/>
          {/* ground arc */}
          <path d="M20 110 Q100 82 180 110" stroke={V} strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          {/* fist bump spot */}
          <circle cx={100} cy={46} r={5} fill={V} opacity={0.7}/>
        </svg>
        <h1 className="au2" style={{fontFamily:"Playfair Display,serif",fontStyle:"italic",fontWeight:400,fontSize:"clamp(2.1rem,4.2vw,3.4rem)",color:V,textAlign:"center",lineHeight:1.15}}>
          thank you for joining<br/><em>helper</em>
        </h1>
        <p className="au3" style={{fontSize:"0.9rem",color:"rgba(28,26,46,0.65)",textAlign:"center",maxWidth:440,lineHeight:1.72,marginTop:"0.85rem"}}>
          Connecting St. Louis neighbors in the wake of extreme weather. Small moments of your time, made meaningful together.
        </p>
        <div className="au4" style={{display:"flex",gap:"0.8rem",marginTop:"2.1rem",flexWrap:"wrap",justifyContent:"center"}}>
          <button style={btnStyle(true)} onClick={()=>go(1)}>i want to help →</button>
          <button style={btnStyle(false)} onClick={()=>go(1)}>i need help</button>
        </div>
      </div>

      {/* S1 Safe */}
      <div style={slide(1)}>
        <button onClick={()=>go(0)} style={{position:"absolute",top:"1.7rem",left:"1.7rem",background:"transparent",border:`1.5px solid rgba(72,26,211,0.2)`,color:V,fontFamily:"DM Sans,sans-serif",fontSize:"0.76rem",padding:"0.36rem 0.9rem",borderRadius:100,cursor:"pointer"}}>← back</button>
        <h1 style={{fontFamily:"Playfair Display,serif",fontStyle:"italic",fontWeight:400,fontSize:"clamp(2.1rem,4.2vw,3.2rem)",color:V,textAlign:"center",lineHeight:1.15}}>are you safe?</h1>
        <p style={{fontSize:"0.9rem",color:"rgba(28,26,46,0.65)",textAlign:"center",maxWidth:440,lineHeight:1.72,marginTop:"0.85rem"}}>Before connecting you with others, we want to make sure you're in a secure place.</p>
        <div style={{display:"flex",gap:"0.8rem",marginTop:"2.1rem",flexWrap:"wrap",justifyContent:"center"}}>
          <button style={btnStyle(true)} onClick={()=>go(2)}>yes, i'm safe</button>
          <button style={{...btnStyle(false),borderColor:ORANGE,color:ORANGE}} onClick={()=>setShowEmerg(true)}>no — get help now</button>
        </div>
        {showEmerg && <div style={{marginTop:"1.5rem",textAlign:"center",maxWidth:360}}>
          <p style={{color:ORANGE,fontSize:"0.86rem",lineHeight:1.78}}>
            Call <strong>911</strong> for immediate emergencies.<br/>
            St. Louis Emergency Mgmt: <strong>(314) 615-8000</strong><br/>
            <span style={{color:"rgba(28,26,46,0.45)",fontSize:"0.75rem"}}>Return once safe — your neighbors are ready.</span>
          </p>
        </div>}
      </div>

      {/* S2 Help */}
      <div style={slide(2)}>
        <button onClick={()=>go(1)} style={{position:"absolute",top:"1.7rem",left:"1.7rem",background:"transparent",border:`1.5px solid rgba(72,26,211,0.2)`,color:V,fontFamily:"DM Sans,sans-serif",fontSize:"0.76rem",padding:"0.36rem 0.9rem",borderRadius:100,cursor:"pointer"}}>← back</button>
        <h1 style={{fontFamily:"Playfair Display,serif",fontStyle:"italic",fontWeight:400,fontSize:"clamp(2.1rem,4.2vw,3.2rem)",color:V,textAlign:"center",lineHeight:1.15}}>how can you help?</h1>
        <p style={{fontSize:"0.9rem",color:"rgba(28,26,46,0.65)",textAlign:"center",maxWidth:440,lineHeight:1.72,marginTop:"0.85rem"}}>Select anything you're able to offer. Even one small thing makes a real difference.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.6rem",justifyContent:"center",maxWidth:530,marginTop:"1.9rem"}}>
          {chips.map(({v,l})=>(
            <button key={v} onClick={()=>toggleChip(v)} style={{...btnStyle(picked.has(v)),padding:"0.58rem 1.2rem"}}>{l}</button>
          ))}
        </div>
        <button style={{...btnStyle(true),marginTop:"1.8rem"}} onClick={startNetwork}>see the network →</button>
      </div>

      {/* S3 Network */}
      <div style={{...slide(3),padding:0,overflow:"hidden"}}>
        <button onClick={()=>go(2)} style={{position:"absolute",top:"1.7rem",left:"1.7rem",background:"transparent",border:`1.5px solid rgba(72,26,211,0.2)`,color:V,fontFamily:"DM Sans,sans-serif",fontSize:"0.76rem",padding:"0.36rem 0.9rem",borderRadius:100,cursor:"pointer",zIndex:20}}>← back</button>

        {/* Jump to Neighborhood — left side */}
        <button
          onClick={()=>{ setActiveWeb("hood"); setJumpTo("hood"); addLog("🏘 your neighborhood"); }}
          style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",
            background:activeWeb==="hood"?"rgba(72,26,211,0.12)":"rgba(247,245,238,0.92)",
            border:`1.5px solid rgba(72,26,211,${activeWeb==="hood"?0.5:0.18})`,
            color:V,fontFamily:"Playfair Display,serif",fontStyle:"italic",
            fontSize:"0.78rem",padding:"0.7rem 0.55rem",borderRadius:"0 12px 12px 0",
            cursor:"pointer",zIndex:20,writingMode:"vertical-rl",
            backdropFilter:"blur(8px)",letterSpacing:"0.03em",
            boxShadow:activeWeb==="hood"?"2px 0 12px rgba(72,26,211,0.12)":"none",
            transition:"all 0.25s"}}>
          🏘 neighborhood
        </button>

        {/* Jump to Friends — right side */}
        <button
          onClick={()=>{ setActiveWeb("friends"); setJumpTo("friends"); addLog("👥 your friends"); }}
          style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",
            background:activeWeb==="friends"?"rgba(72,26,211,0.12)":"rgba(247,245,238,0.92)",
            border:`1.5px solid rgba(72,26,211,${activeWeb==="friends"?0.5:0.18})`,
            color:V,fontFamily:"Playfair Display,serif",fontStyle:"italic",
            fontSize:"0.78rem",padding:"0.7rem 0.55rem",borderRadius:"12px 0 0 12px",
            cursor:"pointer",zIndex:20,writingMode:"vertical-rl",
            backdropFilter:"blur(8px)",letterSpacing:"0.03em",
            boxShadow:activeWeb==="friends"?"-2px 0 12px rgba(72,26,211,0.12)":"none",
            transition:"all 0.25s"}}>
          👥 friends
        </button>

        {webs && screen===3 && (
          <Network webs={webs} setWebs={setWebs} panelNode={panelNode} setPanelNode={setPanelNode}
            panelOpen={panelOpen} setPanelOpen={setPanelOpen} addLog={addLog}
            activeWeb={activeWeb} setActiveWeb={setActiveWeb} picked={picked} jumpTo={jumpTo}/>
        )}

        {/* Legend */}
        <div style={{position:"absolute",bottom:"1.7rem",right:"1.8rem",display:"flex",flexDirection:"column",gap:"0.42rem",zIndex:10,pointerEvents:"none"}}>
          {[["needs help",VDIM,V,"border"],[`helper ready`,"rgba(72,26,211,0.35)",V,null],["actively helping","rgba(255,90,26,0.2)",ORANGE,null],["matched ★","rgba(18,168,98,0.2)",GREEN,null]].map(([l,bg,c,mode])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.67rem",color:"rgba(28,26,46,0.65)"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:mode?"transparent":bg,border:mode?`1.5px solid ${c}`:undefined,flexShrink:0}}/>
              {l}
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div style={{position:"absolute",left:"1.7rem",bottom:"1.7rem",zIndex:10,display:"flex",flexDirection:"column",gap:"0.3rem",pointerEvents:"none",maxWidth:220}}>
          {logs.map(({msg,id})=>(
            <div key={id} style={{fontSize:"0.68rem",color:"rgba(28,26,46,0.72)",background:"rgba(247,245,238,0.95)",backdropFilter:"blur(8px)",padding:"0.3rem 0.68rem",borderRadius:100,border:"1px solid rgba(72,26,211,0.11)",animation:"logIn 0.35s ease forwards"}}>
              {msg}
            </div>
          ))}
        </div>

        <p style={{position:"absolute",bottom:"1.7rem",left:"50%",transform:"translateX(-50%)",fontSize:"0.67rem",color:"rgba(28,26,46,0.42)",pointerEvents:"none",letterSpacing:"0.04em",whiteSpace:"nowrap",zIndex:5}}>
          move cursor to drift · drag to explore · click a neighbor
        </p>

        {webs && <Panel panelNode={panelNode} setPanelNode={setPanelNode} panelOpen={panelOpen} setPanelOpen={setPanelOpen} webs={webs} setWebs={setWebs} addLog={addLog} picked={picked}/>}
      </div>

      {/* Progress dots */}
      <div style={{position:"fixed",bottom:"1.3rem",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"0.38rem",zIndex:60,pointerEvents:"none"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{height:6,borderRadius:3,background:screen===i?V:"rgba(72,26,211,0.18)",width:screen===i?18:6,transition:"all 0.28s"}}/>
        ))}
      </div>
    </div>
  );
}
