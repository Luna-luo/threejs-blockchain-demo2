import * as THREE from '../build/three.module.js';
import Stats from './stats.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';

const stats = new Stats(); // 性能监控器，用来查看Three.js渲染帧率

// 创建div
const container = document.createElement('div');
document.body.appendChild(container);

//暂存helper类
class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2; // 在网格渲染之后再渲染
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}

// 创建场景
const scene = new THREE.Scene();

// 创建时钟
const clock = new THREE.Clock();

// 创建相机
const camera = new THREE.PerspectiveCamera( // 透视投影相机
  40, // 视场，表示能够看到的角度范围
  window.innerWidth / window.innerHeight, // 渲染窗口的长宽比，设置为浏览器窗口的长宽比
  0.1, // 从距离相机多远的位置开始渲染
  2000 // 距离相机多远的位置截止渲染
);
camera.position.set(-20, 60, 30); // 设置相机位置

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 是否执行抗锯齿
});
renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比率。通常用于HiDPI设备，以防止输出画布模糊。
renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器大小
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 创建控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 创建平面
const planeGeometry = new THREE.PlaneGeometry(300, 300); // 生成平面几何
const planeMaterial = new THREE.MeshLambertMaterial({
  // 生成材质
  color: 0xcccccc,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial); // 生成平面网格
planeMesh.rotation.x = -Math.PI / 2; //绕X轴旋转90度
scene.add(planeMesh); // 添加到场景中

// 创建平行光源
const light = new THREE.DirectionalLight(0xffffff, 1); // 平行光，颜色为白色，强度为1
light.position.set(-40, 40, 20); // 设置灯源位置
scene.add(light); // 添加到场景中

// 创建门框
const doorFrameSide = new THREE.BoxBufferGeometry(1, 20, 2); // 侧边门框
const doorFrameTop = new THREE.BoxBufferGeometry(12, 1, 2); // 上门框
const doorFrameMaterial = new THREE.MeshLambertMaterial({
  color: 0xad4800,
});
const doorFrameLeftMesh = new THREE.Mesh(
  doorFrameSide,
  doorFrameMaterial
);
const doorFrameTopMesh = new THREE.Mesh(doorFrameTop, doorFrameMaterial);
const doorFrameRightMesh = doorFrameLeftMesh.clone();
doorFrameLeftMesh.position.set(-5.5, 10, 0);
doorFrameRightMesh.position.set(5.5, 10, 0);
doorFrameTopMesh.position.set(0, 20.5, 0);
scene.add(doorFrameLeftMesh);
scene.add(doorFrameRightMesh);
scene.add(doorFrameTopMesh);

// 创建门
const door = new THREE.BoxBufferGeometry(10, 20, 0.5);
const doorMaterial = new THREE.MeshLambertMaterial({ color: 0xd88c00 });
const doorMesh = new THREE.Mesh(door, doorMaterial);

// 实现门围绕特定轴旋转
const group = new THREE.Group();
group.position.set(5, 10, 0); // 设置外层对象的中心为原本想要旋转的位置
group.add(doorMesh);
group.name = 'door';
doorMesh.position.set(-5, 0, 0);
scene.add(group);

const times = [0, 3]; // 关键帧时间数组
const rotationValues = [0, -Math.PI / 2];
const rotationTrack = new THREE.KeyframeTrack(
  'door.rotation[y]',
  times,
  rotationValues
); // 关键帧轨道
const duration = 3; // 持续时间 (单位秒)
const clip = new THREE.AnimationClip('open', duration, [rotationTrack]); // 动画剪辑

// 播放编辑好的关键帧数据
const mixer = new THREE.AnimationMixer(group); // 动画混合器
const AnimationAction = mixer.clipAction(clip); // 返回所传入的剪辑参数的AnimationAction
AnimationAction.timeScale = 1; // 可以调节播放速度，默认是1。为0时动画暂停。值为负数时动画会反向执行。
AnimationAction.play(); // 开始播放

render();

function render() {
  requestAnimationFrame(render);
  stats.begin();
  renderer.render(scene, camera);
  mixer.update(clock.getDelta());
  stats.end();
}
