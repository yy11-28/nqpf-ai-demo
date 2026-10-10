(function(){
  const canvas = document.getElementById('neuralCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h;
  let nodes=[];
  let activeParticles=[];
  const NODE_COUNT=120;
  const PARTICLE_PER_CLICK=24;

  function resize(){
    w=canvas.width=canvas.offsetWidth;
    h=canvas.height=canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize',resize);

  class Node{
    constructor(){
      this.x=Math.random()*w;
      this.y=Math.random()*h;
      this.vx=(Math.random()-.5)*.3;
      this.vy=(Math.random()-.5)*.3;
      this.r=Math.random()*1.8+1;
      this.baseAlpha=Math.random()*.5+.2;
    }
    update(){
      this.x+=this.vx;this.y+=this.vy;
      if(this.x<0||this.x>w)this.vx*=-1;
      if(this.y<0||this.y>h)this.vy*=-1;
    }
    draw(t){
      const pulse=this.r+Math.sin(t*.002+this.x)*.6;
      const a=this.baseAlpha+Math.sin(t*.0015+this.y)*.15;
      ctx.beginPath();
      ctx.arc(this.x,this.y,Math.max(.5,pulse),0,Math.PI*2);
      ctx.fillStyle=isLight()?`rgba(37,99,235,${Math.max(0,a)})`:`rgba(34,211,238,${Math.max(0,a)})`;
      ctx.fill();
    }
  }
  for(let i=0;i<NODE_COUNT;i++) nodes.push(new Node());

  class P{
    constructor(x,y,target){
      this.x=x;this.y=y;
      this.tx=target?target.x:x+(Math.random()-.5)*200;
      this.ty=target?target.y:y+(Math.random()-.5)*200;
      this.life=1;this.decay=Math.random()*.012+.008;
    }
    update(){
      this.x+=(this.tx-this.x)*.05;
      this.y+=(this.ty-this.y)*.05;
      this.life-=this.decay;
    }
    draw(){
      if(this.life<=0)return;
      ctx.globalAlpha=this.life*.8;
      ctx.fillStyle='#a855f7';
      ctx.beginPath();ctx.arc(this.x,this.y,1.4,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
  }

  let mouse={x:null,y:null};
  const isLight=()=>document.documentElement.getAttribute('data-theme')==='light';
  canvas.addEventListener('mousemove',e=>{
    const rect=canvas.getBoundingClientRect();
    mouse.x=e.clientX-rect.left;mouse.y=e.clientY-rect.top;
  });
  canvas.addEventListener('mouseleave',()=>{mouse.x=null;mouse.y=null});
  canvas.addEventListener('click',e=>{
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left,y=e.clientY-rect.top;
    for(let i=0;i<PARTICLE_PER_CLICK;i++){
      const t=nodes[Math.floor(Math.random()*nodes.length)];
      activeParticles.push(new P(x,y,t));
    }
  });

  function drawLine(n1,n2,alpha){
    ctx.beginPath();
    ctx.moveTo(n1.x,n1.y);
    ctx.lineTo(n2.x,n2.y);
    ctx.strokeStyle=isLight()?`rgba(59,130,246,${Math.min(1,alpha*1.8)})`:`rgba(59,130,246,${alpha})`;
    ctx.lineWidth=.8;
    ctx.stroke();
  }

  let t=0;
  function loop(){
    ctx.clearRect(0,0,w,h);
    t+=16;
    // draw connections
    for(let i=0;i<nodes.length;i++){
      const n1=nodes[i];
      n1.update();
      for(let j=i+1;j<nodes.length;j++){
        const n2=nodes[j];
        const dx=n1.x-n2.x,dy=n1.y-n2.y;
        const d2=dx*dx+dy*dy;
        if(d2<22000) drawLine(n1,n2,Math.max(0,.12-d2/22000*.12));
      }
      // mouse interaction
      if(mouse.x!==null){
        const dx=n1.x-mouse.x,dy=n1.y-mouse.y;
        const d2=dx*dx+dy*dy;
        if(d2<25000){
          drawLine({x:mouse.x,y:mouse.y},n1,Math.max(0,.35-d2/25000*.35));
          ctx.beginPath();ctx.arc(mouse.x,mouse.y,3,0,Math.PI*2);
          ctx.fillStyle='rgba(168,85,247,.5)';ctx.fill();
        }
      }
      n1.draw(t);
    }
    for(let i=activeParticles.length-1;i>=0;i--){
      activeParticles[i].update();
      activeParticles[i].draw();
      if(activeParticles[i].life<=0) activeParticles.splice(i,1);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
