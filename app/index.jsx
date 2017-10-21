import Device from './Device.jsx';

function main() {

  const elem = (
    <div><div id="matterContainer"></div></div>
  );

  const root = ReactDOM.render(elem,document.getElementById("container"));
  const matterContainer = root.children.matterContainer;

  const device = new Device({reactContainer: matterContainer, svgPath: './svg/newGrid2.svg'});
  device.setup();

} main();
