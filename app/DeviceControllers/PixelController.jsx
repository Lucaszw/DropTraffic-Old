import {Query, Vector} from "matter-js";

class PixelController {
  constructor (props){
    this.device = props.device;
    this.pixelColors = {
      off: "rgb(16, 159, 179)",
      standard: "green",
      constant: "yellow"
    }
  }

  getName(type) { return type+"Pixels";}

  addPixel(body,pixels,type){
    const color = this.pixelColors[type];
    const name = this.getName(type);

    pixels.push(body.label);
    _.each(body.parts, (part) => {part.render.fillStyle = color;});
    this.device.setState(name, pixels);
  }

  removePixel(body,pixels,type){
    const color = this.pixelColors['off'];
    const name  = this.getName(type);

    pixels = _.without(pixels, body.label);
    _.each(body.parts, (part) => {part.render.fillStyle = color;});
    this.device.setState(name, pixels);
  }

  updateStandardPixels(labels){
    const oldBodies = this.getStandardPixelBodies();
    const newBodies = this.getPixelsFromLabels(labels);
    _.each(oldBodies,this.removeStandardPixel.bind(this));
    _.each(newBodies,this.addStandardPixel.bind(this));
  }

  addStandardPixel(body){
    const standardPixels = this.device.state.standardPixels;
    this.addPixel(body,standardPixels,'standard');
  }

  addConstantPixel(body){
    const constantPixels = this.device.state.constantPixels;
    this.addPixel(body,constantPixels,'constant');
  }

  removeStandardPixel(body){
    const standardPixels = this.device.state.standardPixels;
    this.removePixel(body,standardPixels, 'standard');
  }

  removeConstantPixel(body){
    const constantPixels = this.device.state.constantPixels;
    this.removePixel(body,constantPixels, 'constant');
  }

  getPixelAtCoordinate(x,y){
    // Get body
    const point = Vector.create(x,y);
    const bodies = Query.point(this.device.parts,point);
    if (!bodies.length) return;
    const body = bodies[1];
    return body;
  }

  getPixelsFromLabels(labels){
    return  _.filter(this.device.parts, (p) => {return _.include(labels, p.label);});
  }
  getStandardPixelBodies(){
    return _.filter(this.device.parts, (p) => {return _.includes(this.device.state.standardPixels,p.label)});
  }
  getConstantPixelBodies(){
    return _.filter(this.device.parts, (p) => {return _.includes(this.device.state.constantPixels,p.label)});
  }
}
export default PixelController;
