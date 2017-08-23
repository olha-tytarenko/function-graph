window.addEventListener('load', () => {
    let btnDraw = document.getElementById('drowFunction');
    let btnClear = document.getElementById('clear');
    

    class drawFunction{
      constructor(){
        this._width = 1200;
        this._height = 800;
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._context = canvas.getContext('2d');
        this.countOfGraph = 0;
      }

      set minX(val){
        this._minX = val;
      }

      set maxX(val){
        this._maxX = val;
      }
      get minX(){
        return this._minX;
      }
      get maxX(){
        return this._maxX;
      }

      set countOfGraph(val){
        this._countOfGraph = val;
      }

      get countOfGraph(){
        return this._countOfGraph;
      }

      setSettings(minX, maxX){
        this._minX = minX;
        this._maxX = maxX;
        this._step = (this._maxX - this._minX) / this._width;
        this._context.strokeStyle = 'black';
        //draw Ox
        this._context.beginPath();
        this._context.moveTo(0, this._height/2);
        this._context.lineTo(this._width, this._height/2);
        this._context.closePath();
        this._context.stroke();
        //draw Oy
        this._context.beginPath();
        this._context.moveTo(this._width * Math.abs(this._minX)/(this._maxX - this._minX), 0);
        this._context.lineTo(this._width * Math.abs(this._minX)/(this._maxX - this._minX), this._height);
        this._context.closePath();
        this._context.stroke();
      }

      draw(userFunction){
        this._parseFunction(userFunction);
        let x = this.minX;
        let y = 0;
        let prevX = 0;
        let prevY = 0;
        let color =  '#000';
        if (this.countOfGraph >= 1){
          color = this.getColor();
          this._context.strokeStyle = color;
        }
        for (let i = 0; i < this._width; i++){
          y = (this._height/2) - (this._calculate(x)*80);
            x+=this._step;
            if (prevX && prevY){
              this._context.beginPath();
              this._context.moveTo(prevX, prevY);
              this._context.lineTo(i, y);
              this._context.lineWidth = 0.5;
              this._context.closePath();
              this._context.stroke();
            }
            prevX = i;
            prevY = y;
        }
      }

      _parseFunction(func){
        console.log(func);
        let powExp = /x\^[0-9]/ig;
        let powArray = func.match(powExp);
        if (powArray){
          if (powArray.length > 0){
            let i=1;
            powArray.forEach(elem=>{
              func = func.replace(elem, `Math.pow(x, ${elem.match(/[0-9]+/)})`);
            });
          }
        }
        let bufferFunc = '';
        let trigonometricExp = /(sin|cos|tan|ctg|asin|acos|sqrt)+/ig;
        let trigonometricArray = func.match(trigonometricExp);
        if (trigonometricArray){
          while (trigonometricArray.length > 0){
            let index = func.match(trigonometricArray[0]).index;
            bufferFunc += func.substring(0, index);
            bufferFunc += `Math.${trigonometricArray[0]}`; 
            func = func.slice(index+trigonometricArray[0].length);      
            trigonometricArray.shift();
          }
          bufferFunc += func;
        }
        console.log(bufferFunc);
        if (bufferFunc){
          this._calculate = new Function('x', `return ${bufferFunc};`);
        } else {
          this._calculate = new Function('x', `return ${func};`);
        }
        
        console.log(this._calculate);
      }

      getColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      clear(){
        this._context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    let draw = new drawFunction();
    
    btnDraw.addEventListener('click', (event)=>{
        let startX = parseInt(document.getElementById('minX').value);
        let endX = parseInt(document.getElementById('maxX').value);
        if(startX < endX && draw.minX !== startX && draw.maxX !== endX){
          draw.setSettings(startX, endX);
        }

        if (draw.countOfGraph === 0){
          document.getElementById('minX').disabled = true;
          document.getElementById('maxX').disabled = true;
          draw.setSettings(startX, endX);
        }
        
        console.log(draw);
        let userFunction = document.getElementById('userFunction').value;
        draw.draw(userFunction); 
        draw.countOfGraph++;
        document.getElementById('info').style.visibility = 'visible';
    });

    btnClear.addEventListener('click', () => {
      document.getElementById('info').style.visibility = 'hidden';
      let min = document.getElementById('minX');
      let max = document.getElementById('maxX');
      min.disabled = false;
      max.disabled = false;
      min.value = '';
      max.value = '';
      document.getElementById('userFunction').value = '';
      draw.clear();
      draw.countOfGraph = 0;
    });
})