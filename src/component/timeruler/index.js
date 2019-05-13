         
  /**
 * 时间刻度尺组件
 * Created by luoxi on 2019/04/29.
 */

import React from 'react';
import './index.css';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/dataZoom';

// receiveTime = (obj) =>{
// 	if (!obj || JSON.stringify(obj) === '{}') {
// 		return false;
// 	}
// 	this.setState({
// 		picktime:obj.time
// 	})
// }

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			picktime: this.props.initTime || '9:00',
			conflict: this.props.conflict || null
		};
		
		this.staticPro = {
			min: 0,
			max: 1.5,
			barWidth: 2,
			startHour: 9,
			endHour: 18,
			screenPice: 6,//一屏可显示6个小时的时间跨度
			gap: 5,// 每个大刻度间隔5小格
			gapMinute: 0.5*60,// 每个大刻度间隔半个小时
		}

		this.staticPro.start = this.staticPro.startHour - this.staticPro.screenPice / 2;// 开始区域有1/2区域绘制空白数据
		this.staticPro.end = this.staticPro.endHour + this.staticPro.screenPice / 2;// 结束区域有1/2区域绘制空白数据
		this.staticPro.blocks = (this.staticPro.end - this.staticPro.start) / (this.staticPro.screenPice / 2);// 总共分为多少小块
		this.staticPro.minMinute = this.staticPro.gapMinute / this.staticPro.gap; // 最小刻度的时间差
  };

  componentDidMount() {
		this.initChart();
		if (this.state.conflict) {
			this.refs.pointer.classList.add("conflict");
			this.refs.timeline.classList.add("conflict");
		} else {
			this.refs.pointer.classList.remove("conflict");
			this.refs.timeline.classList.remove("conflict");
		}
  }

	componentWillReceiveProps(nextProps){
		if (nextProps.conflict) {
			this.refs.pointer.classList.add("conflict");
			this.refs.timeline.classList.add("conflict");
		} else {
			this.refs.pointer.classList.remove("conflict");
			this.refs.timeline.classList.remove("conflict");
		}
		this.setState({
			time: nextProps.time,
			conflict: nextProps.conflict
		});
	}

	translate(StatusMinute) { // 转换分 --> 时&&分
		var hour = parseInt(StatusMinute / 60, 10);
		var min = parseInt(StatusMinute % 60, 10);
		var tmp = {hour: 0,minute: '00'};
		if (hour > 0){
				tmp.hour = hour;
		} 
		if (min > 0){
				tmp.minute = parseFloat(min) > 10 ? parseFloat(min) : '0' + parseFloat(min);
		}
		return tmp;
	}

	creatData() { // 构造x轴坐标和data数据
		var _this = this;
		var dateArr={first:[],second:[]};
		var xArr=[];
		for (var i=this.staticPro.start;i<=this.staticPro.end;i+=0.5) {
			var n=null;
			if (String(i).indexOf('.')>-1) {
				n=parseInt(i, 10)+':30'
			} else {
				n = i+':00'
			}
			if (i<this.staticPro.startHour || i >this.staticPro.endHour) {
				dateArr.first.push(this.staticPro.min);
					dateArr.second.push(this.staticPro.min);
			} else {
					dateArr.first.push(this.staticPro.max);
					dateArr.second.push(this.staticPro.min);
			}
			
			xArr.push(n);
			if (i === this.staticPro.end) {break;}
			for (var j=1;j<this.staticPro.gap;j++) {
				if (i<this.staticPro.startHour || i >=this.staticPro.endHour) {
					dateArr.first.push(this.staticPro.min);
					dateArr.second.push(this.staticPro.min);
				} else {
					dateArr.first.push(this.staticPro.min);
					dateArr.second.push(1);
				}
				var m = null;
				if (String(i).indexOf('.')>-1) {
					xArr.push(parseInt(i, 10)+":"+(j*this.staticPro.minMinute + this.staticPro.gapMinute));
				} else {
					m = j*this.staticPro.minMinute > 10 ? j*this.staticPro.minMinute : '0'+(j*this.staticPro.minMinute);
					xArr.push(i+":"+m);
				}
			}
		}

		var keyArr = Object.keys(dateArr)
		var keyLen = keyArr.length;
		var chartData = new Array(keyLen);
		for (var x = 0;x < keyLen;x++) {
			chartData[x] = {
				type: 'bar',
				barWidth:_this.staticPro.barWidth,
				stack:'a',
				data:dateArr[keyArr[x]],
				itemStyle:{color:'#ccc'}
			}
			if(keyArr[x] === 'first'){
				chartData[x].itemStyle.color = '#999';
			}
		}
		return {
			xArr:xArr,
			data:chartData
		}
	}
	
	throttle(method,delay,duration) { //节流函数
		var timer = null;
		var begin = new Date();    
		return function(){                
			var context = this, args = arguments;
			var current = new Date();        
			clearTimeout(timer);
			if(current - begin >= duration){
					method.apply(context,args);
					begin = current;
			}else{
					timer = setTimeout(()=>{
							method.apply(context,args);
					},delay);
			}
		}
}
	//刻度尺左右蒙层  TODO
  initChart() { // 初始化chart
		var _this = this;
		var tmpData = this.creatData();
		var chart = echarts.init(this.refs.echart, null, {});
		var offset = 100 / (tmpData.xArr.length - 1);

		var startZoom = 0;
		if (this.props.initTime) {
			var startIndex = tmpData.xArr.indexOf(this.staticPro.startHour + ':00');
			var index = tmpData.xArr.indexOf(this.props.initTime);
			if (index > -1){
				startZoom = offset * (index - startIndex);
			}
		}
		var endZoom = startZoom + (100 / _this.staticPro.blocks) * 2;
		endZoom = endZoom > 100 ? 100 : endZoom;
		var option = {
			// animation:false,
			axisPointer:{
				triggerOn: 'none',
				snap: false,
			},
			grid:{
				top: '26px',
				left: '2px',
				right: '2px',
				bottom: 0
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				nameGap: 0,
				show: false,
				position: 'top',
				data: tmpData.xArr
			},
			yAxis: {
				type: 'value',
				boundaryGap: false,
				nameGap: 0,
				show: false,
				inverse: true,
				min: _this.staticPro.min,
				max: _this.staticPro.max,
				splitNumber: 1
			},
			dataZoom: [{
				type: 'inside',
				show: true,
				xAxisIndex: [0],
				start: startZoom,
				filterMode: 'weekfilter',
				minValueSpan: 1,
				zoomLock: true,
				end: endZoom, //初始化滚动条
				preventDefaultMouseMove: true
			}],
			series: tmpData.data
	  };

    chart.setOption(option);
		
		var callback = _this.throttle(function(data){
			var start = data.batch[0].start;
			var minutes=Math.round(start / offset) * this.staticPro.minMinute;
			var times = this.translate(minutes);
			var time = (this.staticPro.startHour+times.hour) + ':' + times.minute;
			this.setState({picktime: time});
			
			if (this.props.endScroll && typeof(this.props.endScroll) === 'function') {
				this.props.endScroll({time: time});
			}
	  },100,300).bind(_this);

    chart.on("dataZoom",(data)=>{
			callback(data);
    });
  }

  render() {
    const {
      picktime
    } = this.state;
    return (
		<div className="time-ruler-container">
			<div ref='echart' className="ruler-echart"></div>
			<div ref='pointer' className="timer-pointer">{picktime}</div>
			<div className="time-line" ref='timeline'></div>
		</div>
    )
  };
}
