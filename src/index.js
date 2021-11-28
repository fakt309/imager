import React from 'react';
import ReactDOM from 'react-dom';

import { ImagerDisplay, imagerShow, ImagerImg } from './imager/index.js'

const imgs = ["imgs/2.jpg", "imgs/3.png", "imgs/4.png", "imgs/5.jpg"]

ReactDOM.render(
  <div>
    <ImagerDisplay z-index="2000" />

    <p>signle image, click on it to zoom</p>
    <ImagerImg width="200px" src="imgs/5.jpg" alt="ahah" />

    <p>image gallery, click on it and slide right</p>
    <ImagerImg width="200px" src="imgs/1.jpg" alt="ahah" images={imgs} />

    <p>also you can bind to open image gallery to any DOM object (for example div below)</p>
    <div style={{backgroundColor:"#000",color:"#fff",width:"200px", padding:"20px"}} onClick={(e) => imagerShow(e, imgs, 0)}>click on me</div>
  </div>,
  document.getElementById('root')
);
