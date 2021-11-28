# imager
Minimalistic image gallery for REACT. Responsive with all important features and smooth animations.  
## [DEMO](https://gaidadei.ru/polygon/imager/)

## Desktop
![1](https://user-images.githubusercontent.com/43887554/143771364-4dc49aa4-bed5-4f2f-881c-3b9850224109.gif)

## Phone
![2](https://user-images.githubusercontent.com/43887554/143771379-e4197546-72a1-4c58-9714-1b7e4c41454a.gif)

## Slow internet connection emulation
![3](https://user-images.githubusercontent.com/43887554/143771398-a4a27dcd-4bf7-4aae-83b6-76f47af7c8cc.gif)

## You can bind image gallery to any DOM element
![4](https://user-images.githubusercontent.com/43887554/143771424-8a067dfc-ab17-4cfc-9bfd-6fbb229039f5.gif)

# Advantage this libarary

- Really minimalistic
- Fully responsive
- Support all the usual taps that are in all applications work, such as pinch-to-zoom (scroll wheel on desktop), swipe right/left to slide images, swipe up to close.
- Simple and neat animations of the appearance, loading of the image.

# How to install
1. First of all you should create react app by command `npx create-react-app appname` ([more details](https://reactjs.org/docs/create-a-new-react-app.html))
2. Download folder `src/imager` from this repository and set in your folder where you created your app in folder `.../src/imager`
3. Then connect it by `import { ImagerDisplay, imagerShow, ImagerImg } from './imager/index.js'`
4. That's all. Below i tell you about `ImagerDisplay`, `imagerShow`, `ImagerImg`

# How to use
EXAMPLE:
```
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
```

You should insert somewhere object `ImagerDisplay`. This is object which appears when you open image gallery. You can also set `z-index` property for it.

To call the gallery of images, you can use the `ImagerImg` object or assign the event `(e) => imagerShow(e, imgs, 0)` to any DOM element. `imagerShow` takes three arguments. The first is the event from the context, the second is the url array of the images that you want to show. The third is the number of the picture with which you want to start showing.
