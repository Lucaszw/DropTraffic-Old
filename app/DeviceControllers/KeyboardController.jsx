import {Vector, Query} from 'matter-js';

class KeyboardController {
  constructor(props){
    this.device = props.device;
  }

  addPixelInDirection(key, pixel, type="constant"){

    // Toggle electrode to its Left, Right, Top, or Bottom Neighbour:
    const bounds = pixel.bounds;
    const width = bounds.max.x-bounds.min.x;
    const height = bounds.max.y-bounds.min.y;

    let offsetX = 0;
    let offsetY = 0;
    let size = 20;

    // Change x and y ray distances based on which key was pressed
    if (key == "Left")  offsetX = -size;
    if (key == "Up")    offsetY = -size;
    if (key == "Right") offsetX = size;
    if (key == "Down")  offsetY = size;


    // Set x and y for Raycast starting point
    let x = bounds.min.x + width/2;
    let y = bounds.min.y + height/2;

    // Move starting point to the edge of the pixel
    if (key == "Left")  x -= width/2;
    if (key == "Right") x += width/2;
    if (key == "Up")    y -= height/2;
    if (key == "Down")  y += height/2;

    // Ensure ray size is close to but not quite as wide as the edge
    if (key == "Up" || key == "Down") size = width-5;
    if (key == "Left" || key == "Right") size = height-5;

    // Launch Ray
    const startPoint = Vector.create(x,y);
    const endPoint = Vector.create(x+offsetX,y+offsetY);
    let collisions = Query.ray(this.device.parts, startPoint,endPoint,size);

    // Filter collisions to not include the parents or the current object
    collisions = _.filter(collisions, (c)=> {
      return c.body.label != pixel.label && c.body.label != "Body"
    });

    // Select the collision that is closest to the starting pixel
    let collision = _.min(collisions, (c) => {
      const a = Math.abs(pixel.position.x-c.body.position.x);
      const b = Math.abs(pixel.position.y-c.body.position.y);
      return Math.sqrt(a*a + b*b);
    });

    // If no collision found then exit
    if (!collision || collision == Infinity) return;

    // Update pixels:
    const nextPixel = collision.body;
    if (nextPixel.render.fillStyle == 'green' || nextPixel.render.fillStyle == 'yellow'){
        console.log("COLLISION OCCURED!");
    }
    if (type == "constant")
      this.device.pixelController.addConstantPixel(nextPixel);
    else
      this.device.pixelController.addStandardPixel(nextPixel);

    return nextPixel;
  }
}

export default KeyboardController;
