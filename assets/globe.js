import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.getElementById('xgGlobe');
const shell=canvas?.closest('.globe-shell');
const label=shell?.querySelector('.globe-label');

if(canvas&&shell&&label){
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(33,1,.1,100);
  camera.position.set(0,0,3.35);

  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;

  const motionGroup=new THREE.Group();
  const earthGroup=new THREE.Group();
  motionGroup.add(earthGroup);
  scene.add(motionGroup);

  const texture=new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    map=>{map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();},
    undefined,
    ()=>{}
  );

  const earth=new THREE.Mesh(
    new THREE.SphereGeometry(1,96,96),
    new THREE.MeshStandardMaterial({map,color:0x8b9891,roughness:.88,metalness:.04})
  );
  earthGroup.add(earth);

  const atmosphere=new THREE.Mesh(
    new THREE.SphereGeometry(1.045,64,64),
    new THREE.MeshBasicMaterial({color:0x8cff00,transparent:true,opacity:.055,side:THREE.BackSide,blending:THREE.AdditiveBlending})
  );
  earthGroup.add(atmosphere);

  const gridMaterial=new THREE.LineBasicMaterial({color:0x8cff00,transparent:true,opacity:.1});
  const ringPoints=(radius,y,segments=160)=>{
    const points=[];
    for(let i=0;i<=segments;i++){
      const a=(i/segments)*Math.PI*2;
      points.push(new THREE.Vector3(Math.cos(a)*radius,y,Math.sin(a)*radius));
    }
    return points;
  };
  [-60,-30,0,30,60].forEach(lat=>{
    const phi=THREE.MathUtils.degToRad(lat);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints(Math.cos(phi),Math.sin(phi))),gridMaterial);
    earthGroup.add(line);
  });
  for(let lon=0;lon<180;lon+=30){
    const curve=new THREE.EllipseCurve(0,0,1,1,0,Math.PI*2,false,0);
    const pts=curve.getPoints(160).map(p=>new THREE.Vector3(p.x,p.y,0));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMaterial);
    line.rotation.y=THREE.MathUtils.degToRad(lon);
    earthGroup.add(line);
  }

  const lat=THREE.MathUtils.degToRad(8.5241);
  const lon=THREE.MathUtils.degToRad(76.9366);
  const location=new THREE.Vector3(
    Math.cos(lat)*Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat)*Math.sin(lon)
  ).normalize();

  const marker=new THREE.Mesh(
    new THREE.SphereGeometry(.025,24,24),
    new THREE.MeshBasicMaterial({color:0x8cff00})
  );
  marker.position.copy(location).multiplyScalar(1.025);
  earthGroup.add(marker);

  const markerHalo=new THREE.Mesh(
    new THREE.RingGeometry(.035,.052,40),
    new THREE.MeshBasicMaterial({color:0x8cff00,transparent:true,opacity:.7,side:THREE.DoubleSide})
  );
  markerHalo.position.copy(location).multiplyScalar(1.03);
  markerHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),location);
  earthGroup.add(markerHalo);

  const pointerLine=new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      location.clone().multiplyScalar(1.03),
      location.clone().multiplyScalar(1.28)
    ]),
    new THREE.LineBasicMaterial({color:0x8cff00,transparent:true,opacity:.9})
  );
  earthGroup.add(pointerLine);

  const targetDirection=new THREE.Vector3(.17,.02,1).normalize();
  earthGroup.quaternion.setFromUnitVectors(location,targetDirection);

  scene.add(new THREE.HemisphereLight(0xb9d2cf,0x07100d,1.25));
  const key=new THREE.DirectionalLight(0xffffff,2.8);
  key.position.set(-3,2.4,4);
  scene.add(key);
  const rim=new THREE.DirectionalLight(0x8cff00,1.35);
  rim.position.set(3,-1,-2);
  scene.add(rim);

  const starsGeometry=new THREE.BufferGeometry();
  const stars=[];
  for(let i=0;i<700;i++){
    const r=4+Math.random()*5;
    const theta=Math.random()*Math.PI*2;
    const u=Math.random()*2-1;
    const s=Math.sqrt(1-u*u);
    stars.push(r*s*Math.cos(theta),r*u,r*s*Math.sin(theta));
  }
  starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
  scene.add(new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:0xbfd0c8,size:.012,transparent:true,opacity:.44,sizeAttenuation:true})));

  let pointerX=0,pointerY=0,visible=false,raf=0;
  const worldPosition=new THREE.Vector3();
  const projected=new THREE.Vector3();

  function resize(){
    const w=Math.max(1,shell.clientWidth),h=Math.max(1,shell.clientHeight);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(shell);
  resize();

  shell.addEventListener('pointermove',event=>{
    const r=shell.getBoundingClientRect();
    pointerX=((event.clientX-r.left)/r.width-.5)*2;
    pointerY=((event.clientY-r.top)/r.height-.5)*2;
  },{passive:true});
  shell.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0});

  new IntersectionObserver(entries=>{
    visible=entries[0]?.isIntersecting||false;
  },{threshold:.02}).observe(shell);

  function frame(time){
    motionGroup.rotation.y+=(pointerX*.07-motionGroup.rotation.y)*.035;
    motionGroup.rotation.x+=(-pointerY*.045-motionGroup.rotation.x)*.035;
    marker.getWorldPosition(worldPosition);
    projected.copy(worldPosition).project(camera);
    const x=(projected.x*.5+.5)*shell.clientWidth;
    const y=(-projected.y*.5+.5)*shell.clientHeight;
    label.style.left=x+'px';
    label.style.top=y+'px';
    markerHalo.scale.setScalar(1+Math.sin(time*.004)*.22);
    markerHalo.material.opacity=.48+Math.sin(time*.004)*.2;
    if(visible)renderer.render(scene,camera);
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);

  addEventListener('pagehide',()=>{
    cancelAnimationFrame(raf);
    renderer.dispose();
    earth.geometry.dispose();
    earth.material.dispose();
    texture.dispose();
    starsGeometry.dispose();
  },{once:true});
}