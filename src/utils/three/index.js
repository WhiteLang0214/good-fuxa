import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// 模型是 gltf 格式，使用 gltfLoader 加载
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
//导入hdr图像加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";//rebe加载器
// 相机控件 官网：可实现旋转缩放预览效果
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class LThree {
  constructor(id) {
    this.id = id;
    // 模型渲染的dom容器
    this.container = document.getElementById(id);
    this.width = 0;
    this.height = 0;
    // three要素
    // 场景
    this.scene = null;
    // 相机
    this.camera = null;
    // 渲染器
    this.renderer = null;
    // 控制器
    this.controls = null;
    this.gui = null;
    // 画布宽高比
    this.k = 1;
    this.init();
  }

  // 初始化模型
  init = () => {
    this.scene = new THREE.Scene();
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.resetWin();
    this.animate();
    this.initLight();
    this.initGuI();
  };

  initCamera() {
    /**
     * PerspectiveCamera 透视投影相机
     *
     * fov: 视场角度
     * aspect: Canvas画布宽高比 用来设置输出的画布尺寸
     * near: 近裁截面
     * far: 远裁截面
     *
     */
    // 窗口比例
    this.k = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(75, this.k, 0.1, 1000);
    // 设置的相机位置 在z轴的初始位置
    this.camera.position.set(-328, 42, -7);
    this.camera.lookAt(0, 0, 0);
    console.log("this.camera---", this.camera)
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true, // 抗锯齿
      alpha: true, // 渲染器透明
      precision: "highp", // 着色器开启高精度
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height); // 设置渲染区域尺寸
    this.container.appendChild(this.renderer.domElement); // 将画布插入到渲染容器

  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // 动画有惯性 阻尼
    this.controls.enableZoom = true;
    this.controls.target.set(0, 0, 0); // 旋转中心点
  }

  resetWin() {
    window.onresize = () => {
      const width = this.container.offsetWidth;
      const height = this.container.offsetHeight;
      // 重置渲染器输出画布尺寸
      this.renderer.setSize(width, height);
      // 全屏时 设置观察范围长宽比 aspect 为窗口宽高比
      this.camera.aspect = width / height;
      // 渲染器执行 render 方法时，会读取相机对爱哪个的投影矩阵属性 projectionMatrix
      // 但是不会没渲染一阵，就重新计算
      // 所以，当相机变化时，执行 updateProjectionMatrix 方法更新相机投影矩阵
      this.camera.updateProjectionMatrix();
    };
  }

  // 执行渲染操作
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // 动画
  animate = () => {
    // 更新控制器
    this.controls.update()
    this.render()
    requestAnimationFrame(this.animate)
  }

  // 加载模型
  loadModel = (path, progressCallback) => {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      return loader.load(path, (gltf) => {
        resolve({
          type: "loaded",
          loaded: true,
          model: gltf
        })
      }, (xhr) => {
        progressCallback(xhr)
      }, (err)=> {
        reject({
          type: "err",
          loaded: false,
          err
        })
      })
    })
  }

  // 打光
  initLight() {
    this.light = new THREE.AmbientLight(0xffffff, 3); // 环境光
    this.scene.add(this.light)

    this.directionLight = new THREE.DirectionalLight(0xffffff, 2); // 平行光
    this.directionLight.castShadow = true;
    this.directionLight.position.set(10, 10, 10);

    this.pointLight = new THREE.PointLight("red", 7670000); // 点光源
    this.pointLight.position.set(0, 200, 0);//点光源放在Y轴上
    // 点光源辅助查看对象
    const pointLightHelper = new THREE.PointLightHelper(this.pointLight, 10);
    this.scene.add(pointLightHelper);

    // 加载hdr环境图
    let rgbeLoader = new RGBELoader();
    //资源较大，使用异步加载
    rgbeLoader.loadAsync("/models/demo.hdr").then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      //将加载的材质texture设置给背景和环境
      //  this.scene.background = texture;
      //  this.scene.environment = texture;
    });
  }

  initGuI() {
    this.gui = new GUI();
    // this.gui.domElement.style.display = 'none';//隐藏调试窗口

    this.gui.add(this.light, 'intensity', 0, 22.0);

    // this.gui.add(this.camera.position, 'x', -1000, 1000);
    // this.gui.add(this.camera.position, 'y', -1000, 1000);
    // this.gui.add(this.camera.position, 'z', -1000, 1000);

    // this.gui.add(this.directionLight.position, 'x', -1000, 1000);
    // this.gui.add(this.directionLight.position, 'y', -1000, 1000);
    // this.gui.add(this.directionLight.position, 'z', -1000, 1000);

    this.gui.add(this.pointLight.position, 'x', -1000, 1000);
    this.gui.add(this.pointLight.position, 'y', -1000, 1000);
    this.gui.add(this.pointLight.position, 'z', -1000, 1000);

    // 投影范围
    this.directionLight.shadow.mapSize.width = 1024;
    this.directionLight.shadow.mapSize.height = 1024;
    this.directionLight.shadow.camera.near = 10; // 近地面
    this.directionLight.shadow.camera.far = 300; // 远地面
    this.directionLight.shadow.camera.top = 100;
    this.directionLight.shadow.camera.bottom = -100;
    this.directionLight.shadow.camera.left = -100;
    this.directionLight.shadow.camera.right = 100;
    this.directionLight.shadow.camera.bias = 0.05;
    this.directionLight.shadow.camera.normalBias = 0.05;

    // 模拟相机视锥体
    // const helper = new THREE.CameraHelper(this.directionLight.shadow.camera);
    // this.scene.add(helper);
    this.scene.add(new THREE.AxesHelper(100));
  }

  setModelCenter(object) {
    object.updateMatrixWorld()
    const box = new THREE.Box3().setFromObject(object)
    const center = box.getCenter(new THREE.Vector3())
    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;
  }
}
