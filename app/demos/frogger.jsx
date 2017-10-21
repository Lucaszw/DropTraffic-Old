const getCoordsUrl = "http://localhost:5000/getPixelsFromCoordinates";
const getDimensionsUrl = "http://localhost:5000/getBoardDimensions";
const turnOnPixelInDirectionUrl = "http://localhost:5000/turnOnPixelInDirection";

const cars = new Array(7);
let direction = 'Down';

class Car {
  constructor(x,y){
    this.position = new Object();
    this.position.x = x;
    this.position.y = y;
    this.label = null;
    this.direction = 'Down';
  }
  positionToString(){
    return ["x", this.position.x, "y", this.position.y].join('');
  }
}

function moveAll(){
  const labels = _.pluck(cars,'label').join(',');
  const directions = _.pluck(cars,'direction').join(',');
  const params = $.param({
    directions: directions,
    labels: labels,
    type: 'standard'
  });

  $.ajax({
    url: [turnOnPixelInDirectionUrl,"?",params].join(""),
    type: "GET",
    aync: false,
    success: (data) => {
      _.each(data, (label,i) => {
        const l = data[i];
        if (!l) {
          let newDirection;
          if (cars[i].direction == 'Down') newDirection = 'Up'
          if (cars[i].direction == 'Up')   newDirection = 'Down'
          cars[i].direction = newDirection;
        }else {
          cars[i].label = l;
        }
      });
    }
  });
}

function getInitialPixels(data){
  if (data.length != cars.length) return;
  _.each(cars,(c,i) =>{c.label = data[i]});
}

function loop() {
  moveAll();
}


function frogger() {
  cars[0] = new Car(100,50);
  cars[1] = new Car(150,150);
  cars[2] = new Car(200,200);
  cars[3] = new Car(250,150);
  cars[4] = new Car(300,50);
  cars[5] = new Car(360,50);
  cars[6] = new Car(450,150);

  // Convert coordinates into http parameters:
  const coords = _.map(cars, (c)=>{return c.positionToString()});
  const params = ["pixels=",coords.join()].join('');
  $.get([getCoordsUrl,"?",params].join(""), getInitialPixels);

  const elem = (
    <div><div id="froggerContainer">Frogger</div></div>
  );

  const root = ReactDOM.render(elem,document.getElementById("container"));
  const froggerContainer = root.children.froggerContainer;

  var tid = setInterval(loop, 500);

} frogger();
