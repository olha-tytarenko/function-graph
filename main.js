window.addEventListener('load', () => {
  // define all controls
  let btnDraw = document.getElementById('drowFunction');
  let btnClear = document.getElementById('clear');
  let btnSave = document.getElementById('save');
  let removeBtn = document.getElementById('remove');
  let btnSaveChange = document.getElementById('change');
  let getAll = document.getElementById('getAll');
  let graphsArray = [];

  // define class for drawing graph functions
  class drawFunction {
    constructor() {
      this._width = 1200;
      this._height = 800;
      this._canvas = document.getElementById('canvas');
      this._canvas.width = this._width;
      this._canvas.height = this._height;
      this._context = canvas.getContext('2d');
      this.countOfGraph = 0;
      this._color = 'black';
      this._thickness = 0.5;
    }

    set minX(val) {
      this._minX = val;
    }

    set maxX(val) {
      this._maxX = val;
    }
    get minX() {
      return this._minX;
    }
    get maxX() {
      return this._maxX;
    }

    set countOfGraph(val) {
      this._countOfGraph = val;
    }

    get countOfGraph() {
      return this._countOfGraph;
    }

    set color(col) {
      this._color = col;
    }

    set thickness(th) {
      this._thickness = th;
    }


    setSettings(minX, maxX, color, drowWidth) {
      this._minX = minX;
      this._maxX = maxX;
      this._step = (this._maxX - this._minX) / this._width;

      this._thickness = drowWidth;
      //draw Ox
      this._context.beginPath();
      this._context.moveTo(0, this._height / 2);
      this._context.lineTo(this._width, this._height / 2);
      this._context.closePath();
      this._context.stroke();
      //draw Oy
      this._context.beginPath();
      this._context.moveTo(this._width * Math.abs(this._minX) / (this._maxX - this._minX), 0);
      this._context.lineTo(this._width * Math.abs(this._minX) / (this._maxX - this._minX), this._height);
      this._context.closePath();
      this._context.stroke();

      this._color = color;
    }

    draw(userFunction) {
      this._parseFunction(userFunction);
      let x = this.minX;
      let y = 0;
      let prevX = 0;
      let prevY = 0;
      this._context.strokeStyle = this._color;
      for (let i = 0; i < this._width; i++) {
        y = (this._height / 2) - (this._calculate(x) * 80);
        x += this._step;
        if (prevX && prevY) {
          this._context.beginPath();
          this._context.moveTo(prevX, prevY);
          this._context.lineTo(i, y);
          this._context.lineWidth = this._thickness;
          this._context.closePath();
          this._context.stroke();
        }
        prevX = i;
        prevY = y;
      }
    }

    _parseFunction(func) {
      console.log(func);
      let powExp = /x\^[0-9]/ig;
      let powArray = func.match(powExp);
      if (powArray) {
        if (powArray.length > 0) {
          let i = 1;
          powArray.forEach(elem => {
            func = func.replace(elem, `Math.pow(x, ${elem.match(/[0-9]+/)})`);
          });
        }
      }
      let bufferFunc = '';
      let trigonometricExp = /(sin|cos|tan|ctg|asin|acos|sqrt)+/ig;
      let trigonometricArray = func.match(trigonometricExp);
      if (trigonometricArray) {
        while (trigonometricArray.length > 0) {
          let index = func.match(trigonometricArray[0]).index;
          bufferFunc += func.substring(0, index);
          bufferFunc += `Math.${trigonometricArray[0]}`;
          func = func.slice(index + trigonometricArray[0].length);
          trigonometricArray.shift();
        }
        bufferFunc += func;
      }
      console.log(bufferFunc);
      if (bufferFunc) {
        this._calculate = new Function('x', `return ${bufferFunc};`);
      } else {
        this._calculate = new Function('x', `return ${func};`);
      }

      console.log(this._calculate);
    }

    clear() {
      this._context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // define object for drawing
  let draw = new drawFunction();

  // draw and clear 
  btnDraw.addEventListener('click', (event) => {
    let startX = parseFloat(document.getElementById('minX').value);
    let endX = parseFloat(document.getElementById('maxX').value);
    let color = document.getElementById('color').value;
    let thickness = parseFloat(document.getElementById('thickness').value);
    if (startX < endX && draw.minX !== startX && draw.maxX !== endX) {
      draw.setSettings(startX, endX, color, thickness);
    }

    if (draw.countOfGraph === 0) {
      document.getElementById('minX').disabled = true;
      document.getElementById('maxX').disabled = true;
      draw.setSettings(startX, endX, color, thickness);
    } else {
      draw.color = color;
      draw.thickness = thickness;
    }

    console.log(draw);
    let userFunction = document.getElementById('userFunction').value;
    draw.draw(userFunction);
    draw.countOfGraph++;
    document.getElementById('info').style.visibility = 'visible';
  });

  btnClear.addEventListener('click', () => {
    clearForm();
  });

  // get information about all functions from the server
  getAll.addEventListener('click', () => {
    getAllGraphs();
  });

  // REQUESTS TO THE SERVER

  // GET
  function getAllGraphs() {
    clearGraphsList()
    fetch('http://epam-js-sommer2017.eu-4.evennode.com/api/functions').
      then(res => {
        return res.json();
      }).then((json) => {
        graphsArray = json;
        console.log(graphsArray);
        for (let i = 0; i < graphsArray.length; i++) {
          document.getElementsByClassName('info-2')[0].style.display = 'block';
          let p = document.createElement('p');
          p.id = `id${i}`;
          p.innerHTML = `<strong>Graph name:</strong> ${graphsArray[i].graphName}, <strong>graph function:</strong> ${graphsArray[i].graphFunction}, <strong>graph color:</strong> <span style="color: ${graphsArray[i].graphColor}">${graphsArray[i].graphColor}</span>, <strong>max x:</strong> ${graphsArray[i].maxX},  <strong>min x:</strong> ${graphsArray[i].minX}`;
          document.getElementById('graphsList').appendChild(p);

          document.getElementById(`id${i}`).addEventListener('click', () => {
            document.getElementById('minX').value = graphsArray[i].minX;
            document.getElementById('maxX').value = graphsArray[i].maxX;
            document.getElementById('color').value = COLORS[graphsArray[i].graphColor] || graphsArray[i].graphColor;
            document.getElementById('userFunction').value = graphsArray[i].graphFunction;
            document.getElementById('graphName').value = graphsArray[i].graphName;
            document.querySelector('form').dataset.currentGraph = graphsArray[i]._id;
          });
        }

      }).catch((err) => {
        console.log(err);
      });
  }

  // POST - save function
  btnSave.addEventListener('click', () => {
    let xhr = new XMLHttpRequest();
    let body = `color=${document.getElementById('color').value}&name=${document.getElementById('graphName').value}&graph_function=${document.getElementById('userFunction').value}&min_x=${parseFloat(document.getElementById('minX').value)}&max_x=${parseFloat(document.getElementById('maxX').value)}`;
    xhr.open("POST", 'http://epam-js-sommer2017.eu-4.evennode.com/api/functions', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 500) {
        if (document.getElementById("graphsList").firstChild) {
          clearGraphsList();
          getAllGraphs();
        }
      };
    };
    xhr.send(body);
  });

  // DELETE
  removeBtn.addEventListener('click', () => {


    let id = document.querySelector('form').dataset.currentGraph;
    if (id && confirm('Are you sure you want to delete this function from the server?')) {
      let xhr = new XMLHttpRequest();
      let body = `function_id=${id}`;
      xhr.open("DELETE", 'http://epam-js-sommer2017.eu-4.evennode.com/api/functions/function', true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 500) {
          clearGraphsList();
          getAllGraphs();
        };
      };
      xhr.send(body);
    }
  });

  // PUT
  btnSaveChange.addEventListener('click', () => {
    let id = document.querySelector('form').dataset.currentGraph;
    if (id && confirm('Please, confirm saving changes')) {
      let xhr = new XMLHttpRequest();
      let body = `color=${document.getElementById('color').value}&name=${document.getElementById('graphName').value}&graph_function=${document.getElementById('userFunction').value}&min_x=${parseFloat(document.getElementById('minX').value)}&max_x=${parseFloat(document.getElementById('maxX').value)}`;
      xhr.open('PUT', `http://epam-js-sommer2017.eu-4.evennode.com/api/functions/function/${id}`, true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 500) {
          clearGraphsList();
          getAllGraphs();
        };
      };

      xhr.send(body);
    }
  })

  // helpers
  function clearGraphsList() {
    let graphsList = document.getElementById("graphsList");
    while (graphsList.firstChild) {
      graphsList.removeChild(graphsList.firstChild);
    }
  }

  function clearForm() {
    document.getElementById('info').style.visibility = 'hidden';
    document.getElementById('graphName').value = '';
    let min = document.getElementById('minX');
    let max = document.getElementById('maxX');
    min.disabled = false;
    max.disabled = false;
    min.value = '';
    max.value = '';
    document.getElementById('userFunction').value = '';
    draw.clear();
    draw.countOfGraph = 0;
  }

  // dictionary for colors
  const COLORS = {
    black: '#000000',
    dimgray: '#696969',
    gray: '#808080',
    darkgray: '#A9A9A9	',
    silver: '#C0C0C0	 ',
    lightgrey: '#D3D3D3',
    gainsboro: '#DCDCDC',
    whitesmoke: '#F5F5F5',
    white: '#FFFFFF',
    snow: '#FFFAFA',
    rosybrown: '#BC8F8F',
    lightcoral: '#F08080',
    indianred: '#CD5C5C',
    brown: '#A52A2A',
    firebrick: '#B22222',
    maroon: '#800000',
    darkred: '#8B0000',
    red: '#FF0000',
    salmon: '#FA8072',
    mistyrose: '#FFE4E1',
    tomato: '#FF6347',
    darksalmon: '#E9967A',
    coral: '#FF7F50',
    orangered: '#FF4500',
    lightsalmon: '#FFA07A',
    sienna: '#A0522D',
    seashell: '#FFF5EE',
    saddlebrown: '#8B4513',
    chocolate: '#D2691E',
    peachpuff: '#FFDAB9',
    sandybrown: '#F4A460',
    linen: '#FAF0E6',
    peru: '#CD853F',
    bisque: '#FFE4C4',
    darkorange: '#FF8C00',
    antiquewhite: '#FAEBD7',
    tan: '#D2B48C',
    burlywood: '#DEB887 ',
    blanchedalmond: '#FFEBCD',
    navajowhite: '#FFDEAD',
    papayawhip: '#FFEFD5',
    moccasin: '#FFE4B5',
    wheat: '#F5DEB3',
    orange: '#FFA500',
    floralwhite: '#FFFAF0',
    goldenrod: '#DAA520',
    darkgoldenrod: '#B8860B',
    cornsilk: '#FFF8DC',
    gold: '#FFD700',
    lemonchiffon: '#FFFACD',
    khaki: '#F0E68C',
    palegoldenrod: '#EEE8AA',
    darkkhaki: '#BDB76B',
    ivory: '#FFFFF0',
    beige: '#F5F5DC',
    lightyellow: '#FFFFE0',
    olive: '#808000',
    yellow: '#FFFF00',
    olivedrab: '#6B8E23',
    yellowgreen: '#9ACD32',
    darkolivegreen: '#556B2F',
    greenyellow: '#ADFF2F',
    lawngreen: '#7CFC00',
    chartreuse: '#7FFF00',
    honeydew: '#F0FFF0',
    darkseagreen: '#8FBC8F',
    lightgreen: '#90EE90',
    palegreen: '#98FB98',
    forestgreen: '#228B22',
    limegreen: '#32CD32',
    darkgreen: '#006400',
    green: '#008000',
    lime: '#00FF00',
    seagreen: '#2E8B57',
    mediumseagreen: '#3CB371',
    mintcream: '#F5FFFA',
    springgreen: '#00FF7F',
    mediumspringgreen: '#00FA9A',
    mediumaquamarine: '#66CDAA',
    aquamarine: '#7FFFD4',
    turquoise: '#40E0D0',
    lightseagreen: '#20B2AA',
    mediumturquoise: '#48D1CC',
    azure: '#F0FFFF',
    paleturquoise: '#AFEEEE',
    darkslategray: '#2F4F4F',
    teal: '#008080',
    darkcyan: '#008B8B',
    aqua: '#00FFFF',
    cyan: '#00FFFF',
    lightcyan: '#E0FFFF',
    darkturquoise: '#00CED1',
    cadetblue: '#5F9EA0',
    powderblue: '#B0E0E6',
    lightblue: '#ADD8E6',
    deepskyblue: '#00BFFF',
    skyblue: '#87CEEB',
    lightskyblue: '#87CEFA',
    steelblue: '#4682B4',
    aliceblue: '#F0F8FF',
    slategray: '#708090',
    lightslategray: '#778899',
    dodgerblue: '#1E90FF',
    lightsteelblue: '#B0C4DE',
    cornflowerblue: '#6495ED',
    royalblue: '#4169E0',
    ghostwhite: '#F8F8FF',
    lavender: '#E6E6FA',
    midnightblue: '#191970',
    navy: '#000080',
    darkblue: '#00008B',
    mediumblue: '#0000CD',
    blue: '#0000FF',
    darkslateblue: '#483D8B',
    slateblue: '#6A5ACD',
    mediumslateblue: '#7B68EE',
    mediumpurple: '#9370DB',
    blueviolet: '#8A2BE2',
    indigo: '#4B0082',
    darkorchid: '#9932CC',
    darkviolet: '#9400D3',
    mediumorchid: '#BA55D3',
    thistle: '#D8BFD8',
    plum: '#DDA0DD',
    violet: '#EE82EE',
    purple: '#800080',
    darkmagenta: '#8B008B',
    fuchsia: '#FF00FF',
    magenta: '#FF00FF',
    orchid: '#DA70D6',
    mediumvioletred: '#C71585',
    deeppink: '#FF1493',
    hotpink: '#FF69B4',
    lavenderblush: '#FFF0F5',
    palevioletred: '#DB7093',
    crimson: '#DC143C',
    pink: '#FFC0CB',
    lightpink: '#FFB6C1'
  }
})