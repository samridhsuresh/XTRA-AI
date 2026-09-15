import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvases=[...document.querySelectorAll('.xg-globe-canvas, #xgGlobe')];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const instances=[];

function createGlobe(canvas){
  const mode=canvas.dataset.globeMode||'location';
  const shell=canvas.parentElement;
  const label=mode==='location'?shell.querySelector('.globe-label'):null;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(mode==='mask'?30:33,1,.1,100);
  camera.position.set(0,0,mode==='mask'?2.7:3.35);

  const renderer=new THREE.WebGLRenderer({
    canvas,alpha:true,antialias:true,powerPreference:'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=mode==='mask'?1.15:1.05;

  const motionGroup=new THREE.Group();
  const earthGroup=new THREE.Group();
  motionGroup.add(earthGroup);
  scene.add(motionGroup);

  const texture=new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    map=>{
      map.colorSpace=THREE.SRGBColorSpace;
      map.anisotropy=renderer.capabilities.getMaxAnisotropy();
    }
  );

  const earth=new THREE.Mesh(
    new THREE.SphereGeometry(1,96,96),
    new THREE.MeshStandardMaterial({
      map:texture,color:mode==='mask'?0xa9b8b0:0x8b9891,roughness:.88,metalness:.04
    })
  );
  earthGroup.add(earth);

  const atmosphere=new THREE.Mesh(
    new THREE.SphereGeometry(1.045,64,64),
    new THREE.MeshBasicMaterial({
      color:0x8cff00,transparent:true,opacity:mode==='mask'?.075:.055,
      side:THREE.BackSide,blending:THREE.AdditiveBlending
    })
  );
  earthGroup.add(atmosphere);

  const gridMaterial=new THREE.LineBasicMaterial({
    color:0x8cff00,transparent:true,opacity:mode==='mask'?.075:.1
  });
  const ringPoints=(radius,y,segments=160)=>{
    const points=[];
    for(let i=0;i<=segments;i++){
      const angle=i/segments*Math.PI*2;
      points.push(new THREE.Vector3(Math.cos(angle)*radius,y,Math.sin(angle)*radius));
    }
    return points;
  };
  [-60,-30,0,30,60].forEach(latitude=>{
    const phi=THREE.MathUtils.degToRad(latitude);
    earthGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPoints(Math.cos(phi),Math.sin(phi))),
      gridMaterial
    ));
  });
  for(let longitude=0;longitude<180;longitude+=30){
    const curve=new THREE.EllipseCurve(0,0,1,1,0,Math.PI*2,false,0);
    const points=curve.getPoints(160).map(point=>new THREE.Vector3(point.x,point.y,0));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),gridMaterial);
    line.rotation.y=THREE.MathUtils.degToRad(longitude);
    earthGroup.add(line);
  }

  let marker=null;
  let markerHalo=null;
  let locationStartQuaternion=null;
  let locationEndQuaternion=null;
  if(mode==='location'){
    const lat=THREE.MathUtils.degToRad(8.5241);
    const lon=THREE.MathUtils.degToRad(76.9366);
    const location=new THREE.Vector3(
      Math.cos(lat)*Math.cos(lon),
      Math.sin(lat),
      -Math.cos(lat)*Math.sin(lon)
    ).normalize();

    marker=new THREE.Mesh(
      new THREE.SphereGeometry(.025,24,24),
      new THREE.MeshBasicMaterial({color:0x8cff00})
    );
    marker.position.copy(location).multiplyScalar(1.025);
    earthGroup.add(marker);

    markerHalo=new THREE.Mesh(
      new THREE.RingGeometry(.035,.052,40),
      new THREE.MeshBasicMaterial({
        color:0x8cff00,transparent:true,opacity:.7,side:THREE.DoubleSide
      })
    );
    markerHalo.position.copy(location).multiplyScalar(1.03);
    markerHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),location);
    earthGroup.add(markerHalo);

    earthGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        location.clone().multiplyScalar(1.03),
        location.clone().multiplyScalar(1.28)
      ]),
      new THREE.LineBasicMaterial({color:0x8cff00,transparent:true,opacity:.9})
    ));

    locationEndQuaternion=new THREE.Quaternion().setFromUnitVectors(
      location,new THREE.Vector3(.17,.02,1).normalize()
    );
    const approachOffset=new THREE.Quaternion().setFromEuler(new THREE.Euler(.08,.82,-.06));
    locationStartQuaternion=approachOffset.multiply(locationEndQuaternion.clone());
    earthGroup.quaternion.copy(locationStartQuaternion);
  }else{
    earthGroup.rotation.set(.08,-.45,0);
  }

  scene.add(new THREE.HemisphereLight(0xb9d2cf,0x07100d,1.25));
  const key=new THREE.DirectionalLight(0xffffff,mode==='mask'?3.2:2.8);
  key.position.set(-3,2.4,4);
  scene.add(key);
  const rim=new THREE.DirectionalLight(0x8cff00,1.35);
  rim.position.set(3,-1,-2);
  scene.add(rim);

  const starsGeometry=new THREE.BufferGeometry();
  const stars=[];
  for(let i=0;i<700;i++){
    const radius=4+Math.random()*5;
    const theta=Math.random()*Math.PI*2;
    const y=Math.random()*2-1;
    const spread=Math.sqrt(1-y*y);
    stars.push(radius*spread*Math.cos(theta),radius*y,radius*spread*Math.sin(theta));
  }
  starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
  const starsMaterial=new THREE.PointsMaterial({
    color:0xbfd0c8,size:.012,transparent:true,opacity:.44,sizeAttenuation:true
  });
  scene.add(new THREE.Points(starsGeometry,starsMaterial));

  let pointerX=0;
  let pointerY=0;
  let visible=false;
  let raf=0;
  let previousTime=0;
  const worldPosition=new THREE.Vector3();
  const projected=new THREE.Vector3();

  function resize(){
    const width=Math.max(1,shell.clientWidth);
    const height=Math.max(1,shell.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.position.z=mode==='mask'&&width<700?3.05:(mode==='mask'?2.7:3.35);
    camera.updateProjectionMatrix();
  }

  const resizeObserver=new ResizeObserver(resize);
  resizeObserver.observe(shell);
  resize();

  shell.addEventListener('pointermove',event=>{
    const bounds=shell.getBoundingClientRect();
    pointerX=((event.clientX-bounds.left)/bounds.width-.5)*2;
    pointerY=((event.clientY-bounds.top)/bounds.height-.5)*2;
  },{passive:true});
  shell.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0});

  const visibilityObserver=new IntersectionObserver(entries=>{
    visible=entries[0]?.isIntersecting||false;
  },{threshold:.01});
  visibilityObserver.observe(shell);

  function frame(time){
    const delta=Math.min(32,time-previousTime||16);
    previousTime=time;
    if(mode==='mask'&&!reduceMotion) earth.rotation.y+=delta*.000045;
    if(mode==='location'&&locationStartQuaternion&&locationEndQuaternion){
      const progress=Math.max(0,Math.min(1,Number(window.xgLocationProgress)||0));
      earthGroup.quaternion.slerpQuaternions(locationStartQuaternion,locationEndQuaternion,progress);
    }
    motionGroup.rotation.y+=(pointerX*.055-motionGroup.rotation.y)*.035;
    motionGroup.rotation.x+=(-pointerY*.04-motionGroup.rotation.x)*.035;

    if(marker&&markerHalo&&label){
      marker.getWorldPosition(worldPosition);
      projected.copy(worldPosition).project(camera);
      label.style.left=(projected.x*.5+.5)*shell.clientWidth+'px';
      label.style.top=(-projected.y*.5+.5)*shell.clientHeight+'px';
      markerHalo.scale.setScalar(1+Math.sin(time*.004)*.22);
      markerHalo.material.opacity=.48+Math.sin(time*.004)*.2;
    }
    if(visible) renderer.render(scene,camera);
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);

  instances.push(()=>{
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    renderer.dispose();
    earth.geometry.dispose();
    earth.material.dispose();
    atmosphere.geometry.dispose();
    atmosphere.material.dispose();
    texture.dispose();
    gridMaterial.dispose();
    starsGeometry.dispose();
    starsMaterial.dispose();
    marker?.geometry.dispose();
    marker?.material.dispose();
    markerHalo?.geometry.dispose();
    markerHalo?.material.dispose();
  });
}

canvases.forEach(canvas=>{
  try{
    createGlobe(canvas);
  }catch(error){
    canvas.closest('.portal-earth, .globe-shell')?.classList.add('webgl-fallback');
    console.warn('XTRA GRID globe fallback active:',error instanceof Error?error.message:error);
  }
});
addEventListener('pagehide',()=>instances.forEach(dispose=>dispose()),{once:true});
