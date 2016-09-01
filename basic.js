var ChartObj = function(x,y,canvas){
	this.canvas = document.getElementById(canvas);
	this.maxX = this.canvas.width;
	this.maxY = this.canvas.height;
	this.ctx = this.canvas.getContext('2d');
	this.minX = x;
	this.minY = y;
	this.AxisY = this.maxY - 2*this.minY;
	this.AxisX = this.maxX - 2*this.minX;
	this.originX = this.minX;
	this.originY = this.maxY - this.minY;
	this.clear = function(){
		var self = this;
		var ctx = self.ctx;
		ctx.clearRect(0, 0, self.maxX, self.maxY);
	}
	this.drawPartition = function(partition,base){
		var self = this;
		var ctx = self.ctx;
		var gap = self.AxisY/(partition+1);
		for (var i = 1; i <= partition; i++) {
			this.drawline(self.originX, self.originY - i*gap, self.originX + self.AxisX, self.originY - i*gap,"#eee");
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
      		ctx.fillText(parseInt(i*base), self.originX-5 , self.originY - i*gap);	
		}
	};
	this.drawGroup = function(partition,base){
		var self = this;
		var ctx = self.ctx;
		var gap = self.AxisX/(partition+1);
		for (var i = 0; i < partition; i++) {
			this.drawline(self.originX + i*gap, self.originY-2, self.originX+ i*gap, self.originY+2,"#000");
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
      		ctx.fillText(base[i], self.originX+i*gap , self.originY + 5);	
		}	
	};
	this.drawline = function(sx,sy,dx,dy,color){
		var self = this;
		var ctx = self.ctx;
		ctx.beginPath();
		ctx.moveTo(sx,sy);
		ctx.lineTo(dx,dy);
		ctx.lineWidth = 1;
		ctx.strokeStyle=color;
		ctx.stroke();
		ctx.closePath();	
	};
	this.drwaAxis = function(){
		var self = this;
		var ctx = self.ctx;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.font = "20px verdana"
      	ctx.fillText('Your basic salary and savings graph', (self.minX + self.maxX)/2 , 0 );
		ctx.font = "10px verdana"
		ctx.beginPath();
		ctx.moveTo(self.originX, self.originY);
		ctx.lineTo(self.originX + self.AxisX , self.originY);
		ctx.lineWidth = 2;
		ctx.strokeStyle="#444";
		ctx.stroke();
		ctx.textBaseline = 'middle';
      	ctx.closePath();	
		ctx.textAlign = 'center';
		ctx.fillText('Amount', self.originX , self.originY - self.AxisY-10 );
		ctx.textAlign = 'left';
		ctx.fillText('Month', self.originX+self.AxisX + 10 , self.originY);		
	};
	this.plot = function(data,color,max){
		var self = this;
		var ctx =self.ctx;	
		var xgap = self.AxisX/(12+1);
		var ygap = self.AxisY/data.length;
		console.log(10000);
		var px,py,x,y;
		for (var i = 0 ; i < data.length ; i++) {
			var x = self.originX + (i*xgap);
			var y = self.originY - ((self.AxisY*data[i])/(max*1.1));
			if (i==0){
				self.drawline(x,y,x,y,color);
			}else{
				self.drawline(px,py,x,y,color);
			}
			ctx.beginPath();
			ctx.arc(x,y,5,0,2*Math.PI);
			ctx.fillStyle = color;
      		ctx.fill();
			ctx.stroke();
			ctx.closePath();
			px = x;
			py = y;
		}
	};
	this.detectMouse = function(){
		var self = this;
		self.canvas.addEventListener('mousemove', function(evt) {
        	var rect = self.canvas.getBoundingClientRect();
			var mousePos = {
				x: evt.clientX - rect.left -self.minX,
				y: (evt.clientY-self.minY) - rect.top,
			};
        	var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        	//console.log(message);
     	 }, false);
	}
}
window.onload = function (argument) {
    var partition = 10;
	document.getElementById('addmore').addEventListener('click',function(){addMore();});
    document.getElementById('showGraph').addEventListener('click',function(){makeGraph();});
    document.getElementById('resetData').addEventListener('click',function(){reset();});
}
var x_value = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	
function addMore(){
	var template = document.getElementById('template');
	var container = document.getElementById('inputContainer');
	var total = container.getElementsByClassName('data-input-group').length;
	if (total > 11) {
		console.log(container.childNodes)
		return;
	}
	template.content.querySelector('legend').innerHTML = x_value[total];
	var clone = document.importNode(template.content,true);
	container.insertBefore(clone,container.childNodes[0]);
	document.getElementById('showGraph').style.display = 'block';
	document.getElementById('inputContainer').style.display = 'block';
	document.getElementById('resetData').style.display = 'block';
}

function reset(){
	var container = document.getElementById('inputContainer');	
	container.innerHTML = '';
	document.getElementById('inputContainer').style.display = 'none';
	document.getElementById('showGraph').style.display = 'none';
	document.getElementById('graphSpace').style.display = 'none';
	document.getElementById('resetData').style.display = 'none';
}

function makeGraph(){
	var container = document.getElementById('inputContainer');
	var child = container.getElementsByClassName('data-input-group');
	var salary = [];
	var savings = [];
    var xmax = 0;
	var ymax = 0;
	for (var i = 0; i < child.length; i++) {
		var x = parseInt(child[i].getElementsByClassName('data-x')[0].value);
		var y = parseInt(child[i].getElementsByClassName('data-y')[0].value);
		xmax = xmax>x?xmax:x;
		ymax = ymax>y?ymax:y;
		salary.push(x);
		savings.push(y);
	}
	max = parseInt((ymax>xmax?ymax:xmax)/1000)*1000*2;
	loadHighCharts(salary,savings);
	loadCombinedCharts(salary,savings);
	loadPieCharts(salary,savings);
	var chart = document.getElementById('myCanvas').chartify(50,50,10,max,salary,savings);
	document.getElementById('graphSpace').style.display = 'block';    
}

Element.prototype.chartify = function(offsetX,offsetY,partition,max,salary,savings,color) {
	var chart =  new ChartObj(offsetX,offsetY,this.id);
	chart.clear();
	chart.drwaAxis();
    chart.drawPartition(partition,max/(partition));
    chart.drawGroup(x_value.length,x_value);
    chart.detectMouse();
    if (!color){
    	color = [];
	    for (var i = 0, j=0 ; i < 256,j<50; i= (i + 70)%252,j++) {
	    	color.push('rgb('+ i +','+ (2*i)%250 +',' + i +')');
	    }
	}
	console.log(color);
    chart.plot(salary,color[3],max);
  	chart.plot(savings,color[9],max);
};

function loadHighCharts(salary,savings){
	$('#graph').highcharts({
        title: {
            text: 'My Monthly salary',
            x: -20 //center
        },
        subtitle: {
            text: 'Take a visual to your economic growth',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Salary'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#232323'
            }]
        },
        tooltip: {
            valueSuffix: 'Rs.'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'salary',
            data: salary
        },{
        	name: 'savings',
        	data: savings
        }]
    });
}

function loadCombinedCharts(salary,savings) {
	var expenditure = [];
	for (var i = 0; i < salary.length; i++) {
		expenditure.push(salary[i] - savings[i]);
	}

    $('#bar').highcharts({
        title: {
            text: 'SALARY BREAKUP'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        labels: {
            items: [{
                html: 'Total salary details',
                style: {
                    left: '50px',
                    top: '18px',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }]
        },
        series: [{
            type: 'column',
            name: 'salary',
            data: salary
        }, {
            type: 'column',
            name: 'savings',
            data: savings
        },{
            type: 'column',
            name: 'expenditure',
            data: expenditure
        }]
    });
}

function loadPieCharts(salary,savings) {
	var expenditure = [];
	for (var i = 0; i < salary.length; i++) {
		expenditure.push(salary[i] - savings[i]);
	}

    $('#pie').highcharts({
        title: {
            text: 'SALARY BREAKUP'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        series: [{
            type: 'pie',
            name: 'Salary Break up',
            labels: {
	            items: [{
	                html: 'Total salary details',
	                style: {
	                    left: '50px',
	                    top: '18px',
	                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
	                }
	            }]
	        },

            data: [{
                name: 'expenditure',
                y: expenditure.reduce(add,0),
                color: Highcharts.getOptions().colors[0]
            }, {
                name: 'savings',
                y:savings.reduce(add,0),
                color: Highcharts.getOptions().colors[1]
            }],
            center: [250, 200],
            size: 150,
            showInLegend: true,
            dataLabels: {
                enabled: true
            }
        }]
    });
}


function add(a,b){
	return a+b;
}
