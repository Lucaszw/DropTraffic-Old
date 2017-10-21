import io from "socket.io-client";
const socket = io('http://localhost:5000');
const arduinoURL = 'http://127.0.0.1:5001/';

class HttpController {
  constructor (props) {
    this.device = props.device;

    socket.on('connect', function(){console.log("connected");});
    socket.on('disconnect', function(){console.log("disconnected");});
    socket.on('getBoardDimensions', this.getBoardDimensions.bind(this));
    socket.on('receivePixelSequence', this.handleReceivedPixelSequence.bind(this));
    socket.on('retrievePixelsFromCoordinates', this.handleRetrievePixelsFromCoordinates.bind(this));
    socket.on('turnOnPixelInDirection', this.turnOnPixelInDirection.bind(this));
    socket.on('getAllStandardPixels', this.getAllStandardPixels.bind(this));
    socket.on('turnOffAllPixels', this.turnOffAllPixels.bind(this));
  }
  writeChannels() {
    const sLabels = this.device.state.standardPixels;
    const cLabels = this.device.state.constantPixels;

    const x = [];
    const arr = x.concat(sLabels).concat(cLabels);
    console.log(arr);

    if (arr.length == 0) return;

    $.ajax({
      url: arduinoURL+'writeToRegister?channels='+arr.join(),
      type: "GET",
      crossDomain: true
    });
  }

  getBoardDimensions() {
    socket.emit('retrievedBoardDimensions',this.device.parts[0].bounds.max);
  }

  getAllStandardPixels(){
    const standardPixels = this.device.pixelController.getStandardPixelBodies();
    const labels = _.pluck(standardPixels, 'label');
    socket.emit('retrievedStandardPixels', labels);
  }

  turnOnPixelInDirection(e){
    const directions = e.directions.split(",");
    const labels = e.labels.split(",");
    const type   = e.type;

    let oldPixels = this.device.pixelController.getPixelsFromLabels(labels);
    let newPixels = new Array();

    let error = false;

    for (let i = 0 ; i < oldPixels.length; i++){
      const p = oldPixels[i];
      const p2 = this.device.keyboardController.addPixelInDirection(directions[i],p,type);

      if (p2){
        oldPixels = _.filter(oldPixels, (p1) => {
          if (!p1) return true;
          return p1.label != p2.label
        });
      }
      else
        oldPixels[i] = null;

      newPixels.push(p2);
    }
    oldPixels = _.filter(oldPixels, (p)=>{return p != null});

    _.each(oldPixels, this.device.pixelController.removeStandardPixel.bind(this.device.pixelController));
    socket.emit('retrievedPixelInDirection',{labels: _.pluck(newPixels,'label')});
  }

  turnOffAllPixels(){
    const pixelController = this.device.pixelController;
    const standardPixels = pixelController.getPixelsFromLabels(this.device.state.standardPixels);
    const constantPixels = pixelController.getPixelsFromLabels(this.device.state.constantPixels);

    _.each(standardPixels, pixelController.removeStandardPixel.bind(pixelController));
    _.each(constantPixels, pixelController.removeConstantPixel.bind(pixelController));
  }

  handleReceivedPixelSequence(e) {
    const pixelLabels = e.pixels;
    this.device.pixelController.updateStandardPixels(pixelLabels);
  }

  handleRetrievePixelsFromCoordinates(pixels){
    let labels = _.map(pixels, (p) => {
      const body = this.device.pixelController.getPixelAtCoordinate(p.x, p.y);
      if (!body) return;
      return body.label;
    });

    labels = _.filter(labels, (l) => { return l != "" && l != undefined});
    if (!labels || labels.length < 1)
      socket.emit('retrievedLabels',{labels: null});
    else
      socket.emit('retrievedLabels',{labels: labels});
  }

}

export default HttpController;
