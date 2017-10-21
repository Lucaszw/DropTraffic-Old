import pathseg from "pathseg";
import decomp from "poly-decomp";
import {parse} from 'svg-transform-parser';
import Matter from 'matter-js';

import KeyboardController from './DeviceControllers/KeyboardController.jsx'
import PixelController    from './DeviceControllers/PixelController.jsx'
import HttpController    from './DeviceControllers/HttpController.jsx'

require("./sass/device.scss");

// Matter JS aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Svg = Matter.Svg,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    Common = Matter.Common,
    Query  = Matter.Query;

class Device {
  constructor(props){
    this.parts = null;
    this.engine = null;
    this.reactContainer = props.reactContainer;
    this.renderer = null;
    this.svgPath = props.svgPath; //'./svg/simple2.svg'

    // Controllers:
    this.keyboardController = new KeyboardController({device: this});
    this.pixelController = new PixelController({device: this});
    this.httpController = new HttpController({device: this});

    this.addEventListeners();
    this.initState();

    window.device = this;
  }

  initState(){
    this.state = {
      hover: {current: null},
      constantPixels: new Array(),
      standardPixels: new Array()
    };
  }

  initHover(body){
    this.setState("hover", {current: body});
    _.each(body.parts, (part) => {part.render.fillStyle = "red";});
  }

  setState(key, value){
    this.state[key] = value;
    this.httpController.writeChannels();
  }

  addEventListeners(){
    this.reactContainer.addEventListener('mousemove',this.handleMouseMoved.bind(this),false);
    this.reactContainer.addEventListener('click',this.handleClick.bind(this),false);
    $(document).keydown((e) => {
      const key = e.which;
      if (key == 37) this.handleKeyPressed("Left");
      if (key == 38) this.handleKeyPressed("Up");
      if (key == 39) this.handleKeyPressed("Right");
      if (key == 40) this.handleKeyPressed("Down");
      e.preventDefault();
    });
  }

  mouseEnter(body){
    if (_.include(this.state.constantPixels, body.label)) return;
    if (_.include(this.state.standardPixels, body.label)) return;

    _.each(body.parts, (part) => {part.render.fillStyle = "red";});
  }

  mouseExit(body){
    if (_.include(this.state.constantPixels, body.label)) return;
    if (_.include(this.state.standardPixels, body.label)) return;

    _.each(body.parts, (part) => {part.render.fillStyle = "rgb(16, 159, 179)";});
  }

  mouseClick(body, clickType){
    const inStandardPixels = _.includes(this.state.standardPixels, body.label);
    const inConstantPixels = _.includes(this.state.constantPixels, body.label);

    if (inStandardPixels) this.pixelController.removeStandardPixel(body);
    if (inConstantPixels) this.pixelController.removeConstantPixel(body);

    if (clickType == "standard") {
      if (!inStandardPixels) this.pixelController.addStandardPixel(body);
      return;
    }

    if (clickType == "constant") {
      if (!inConstantPixels) this.pixelController.addConstantPixel(body);
      return;
    }

  }

  handleClick(e){
    const clickType = (e.metaKey == false) ? "standard" : "constant";

    // Get body
    const point = Vector.create(e.offsetX,e.offsetY);
    const bodies = Query.point(this.parts,point);
    if (!bodies.length) return;
    const body = bodies[1];
    this.mouseClick(body, clickType);
  }

  handleMouseMoved(e){
    if (!this.parts) return;

    // Get body under mouse
    const point = Vector.create(e.offsetX,e.offsetY);
    const bodies = Query.point(this.parts,point);
    if (bodies.length < 2) return;
    const body = bodies[1];

    // Get previous body or initialiize
    const prev = this.state.hover.current;
    if (!prev) this.initHover(body);

    // Add different event types here:
    const mouseEnterEvent = (body.label != this.state.hover.current.label);

    // Dispatch particular events
    if (mouseEnterEvent) this.mouseEnter(body);
    if (mouseEnterEvent) this.mouseExit(prev);

    // Update state
    this.setState("hover",{current: body});
  }

  handleKeyPressed(key){
    let oldPixels = this.pixelController.getConstantPixelBodies();
    _.each(oldPixels, (p,i) => {
      // Add neighbouring pixel to all constant pixels (based on key pressed)
      const p2 = this.keyboardController.addPixelInDirection(key,p);

      // if the current pixel is already on, then remove from old pixels
      oldPixels = _.filter(oldPixels, (p1) => {return p1.label != p2.label});
    });

    // Turn of all old pixels
    _.each(oldPixels, this.pixelController.removeConstantPixel.bind(this.pixelController));
  }

  loadSvg(){
    const parts = new Array();

    // Wait for SVG File to load
    $.get(this.svgPath).done( (data) => {

      const g = $(data).find('g')[0];
      const transforms = parse(g.getAttribute("transform"));
      // Render each path object separately (so that each can be manipulated)
      // individually:
      $(data).find('path').each((i, path) => {
        const vertices = Svg.pathToVertices(path, 30);
        const mean = Vertices.mean(vertices);
        const label = path.getAttribute("channels");
        _.each(vertices, (v) => {v.x -= mean.x; v.y -= mean.y;})

        let body = Bodies.fromVertices(mean.x, mean.y, vertices, {
          render: {
            fillStyle: "rgb(16, 159, 179)",
            strokeStyle: "black",
            lineWidth: 1
          },
          isStatic: true,
          label: label
        },true);

        parts.push(body);
      });

      let group = Body.create({parts: parts});

      Body.rotate(group, transforms.rotate.angle*Math.PI/180);
      Body.translate(group, {
        x: transforms.translate.tx,
        y: transforms.translate.ty
      });
      Body.scale(group, transforms.scale.sx,transforms.scale.sy);
      this.parts = group.parts;

      World.add(this.engine.world,group);
    });

  }

  setup(){
    this.engine = Engine.create();
    this.renderer = Render.create({
        element: this.reactContainer,
        engine: this.engine,
        options: {
          wireframes: false,
          background: "rgb(236, 236, 236)"
        }
    });

    this.loadSvg();
    Render.run(this.renderer);
  }
}

export default Device;
