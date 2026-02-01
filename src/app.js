document.addEventListener('DOMContentLoaded', function(){
  new Vue({
    el: '#app',
    data(){
      return {
        collapsed: false,
        dialogVisible: false,
        dialogTitle: '详情',
        chartShown: false,
        headers:['无线网络分布式协同认证','无线网络数据可信交互','无线网络用户数据隐私保护'],
        leftRecord: null,
        leftRecordKey: '',
        gifDurationMs: 11100,
        gifIntervalId: null,
        gifTickRunning: false,
        centerRecord: null,
        centerRecordKey: '',
        centerGifDurationMs: 12020,
        centerGifIntervalId: null,
        centerGifTickRunning: false,
        apiBase: 'http://localhost:3001'
      }
    },
    mounted(){
      this.initCharts();
      this.startGifLoop();
      this.startCenterGifLoop();
    },
    methods:{
      togglePreview(){ this.collapsed = !this.collapsed },
      openHelp(){ window.open('https://example.com','_blank') },
      openDialog(i){ this.dialogTitle = this.headers[i]; this.dialogShown(i) },
      dialogShown(i){ this.dialogVisible = true; this.chartShown = false },
      showChart(i){
        this.dialogTitle = this.headers[i] + ' - 图表示例';
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.chartShown = true;
          var chartDom = document.getElementById('chart');
          var myChart = echarts.init(chartDom);
          var option = {
            title: {text: this.headers[i], left:'center', textStyle:{color:'#fff'}},
            tooltip: {},
            xAxis: {data: ['A','B','C','D','E','F'], axisLine:{lineStyle:{color:'#6fb3ff'}}},
            yAxis: {axisLine:{lineStyle:{color:'#6fb3ff'}}},
            series: [{type: 'bar', data: [5, 20, 36, 10, 10, 20], itemStyle:{color:'#4fd1ff'}}]
          };
          myChart.setOption(option);
        })
      },
      initCharts(){
        var tpsChart = echarts.init(document.getElementById('tps-chart'));
        var growthChart = echarts.init(document.getElementById('growth-chart'));
        
        const fetchTpsData = async () => {
          try {
            const resp = await fetch(`${this.apiBase}/api/tps-data`, { cache: 'no-store' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            
            const tpsXData = data.tps.map(item => item.time);
            const tpsYData = data.tps.map(item => item.value);
            const growthXData = data.growth.map(item => item.time);
            const growthYData = data.growth.map(item => item.value);
            
            const tpsMin = 0;
            const tpsMax = 40;
            
            tpsChart.setOption({
              backgroundColor: 'transparent',
              title: {
                text: 'TPS曲线',
                left: 'center',
                top: '0%',
                textStyle: {
                  color: '#C4CAF3',
                  fontSize: 20,
                  fontFamily: '"Microsoft YaHei", sans-serif'
                },
                padding: [20, 0, 0, 0]
              },
              grid: { top: "20%", bottom: "20%", right: "5%", left: "8%" },
              tooltip: { 
                trigger: "axis",
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(1, 202, 251, 0.4)',
                textStyle: { color: '#C4CAF3' }
              },
              xAxis: {
                type: "category",
                boundaryGap: false,
                data: tpsXData,
                axisLabel: { 
                  color: "#C4CAF3", 
                  fontSize: 12,
                  interval: 2
                },
                axisLine: { show: true, lineStyle: { color: "rgba(1, 202, 251, 0.4)", width: 1 } },
                splitLine: { show: false }
              },
              yAxis: {
                type: "value",
                name: "TPS",
                min: tpsMin,
                max: tpsMax,
                interval: 10,
                nameLocation: "middle",
                nameTextStyle: { color: "#00FFF6", fontSize: 12, rotate: 0 },
                axisLabel: { color: "#C4CAF3", fontSize: 12 },
                axisLine: { show: true, lineStyle: { color: "rgba(1, 202, 251, 0.4)" } },
                splitLine: {
                  show: true,
                  lineStyle: { type: "dashed", color: "rgba(1, 202, 251, 0.4)" }
                }
              },
              series: [{
                name: "TPS",
                type: "line",
                smooth: true,
                showSymbol: false,
                clip: true,
                lineStyle: { width: 2, color: "#3ae6d5" },
                data: tpsYData
              }]
            });
            
            const growthMin = 90;
            const growthMax = 140;
            
            growthChart.setOption({
              backgroundColor: 'transparent',
              title: {
                text: '链生长率',
                left: 'center',
                top: '0%',
                textStyle: {
                  color: '#C4CAF3',
                  fontSize: 20,
                  fontFamily: '"Microsoft YaHei", sans-serif'
                },
                padding: [20, 0, 0, 0]
              },
              grid: { top: "20%", bottom: "20%", right: "5%", left: "8%" },
              tooltip: { 
                trigger: "axis",
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(1, 202, 251, 0.4)',
                textStyle: { color: '#C4CAF3' }
              },
              xAxis: {
                type: "category",
                boundaryGap: false,
                data: growthXData,
                axisLabel: { 
                  color: "#C4CAF3", 
                  fontSize: 12,
                  interval: 2
                },
                axisLine: { show: true, lineStyle: { color: "rgba(1, 202, 251, 0.4)", width: 1 } },
                splitLine: { show: false }
              },
              yAxis: {
                type: "value",
                name: "出块时间 (ms)",
                min: growthMin,
                max: growthMax,
                interval: 12.5,
                nameLocation: "middle",
                nameTextStyle: { color: "#00FFF6", fontSize: 12, rotate: 0 },
                axisLabel: { color: "#C4CAF3", fontSize: 12 },
                axisLine: { show: true, lineStyle: { color: "rgba(1, 202, 251, 0.4)" } },
                splitLine: {
                  show: true,
                  lineStyle: { type: "dashed", color: "rgba(1, 202, 251, 0.4)" }
                }
              },
              series: [{
                name: "链生长率",
                type: "line",
                smooth: true,
                showSymbol: false,
                clip: true,
                lineStyle: { width: 2, color: "#3ae6d5" },
                data: growthYData
              }]
            });
          } catch (err) {
            console.warn('[tps-data] fetch failed', err);
          }
        };
        
        fetchTpsData();
        setInterval(fetchTpsData, 10000);
        
        window.addEventListener('resize', function(){
          tpsChart.resize();
          growthChart.resize();
        });
      },
      startGifLoop(){
        const img = document.getElementById('left-gif');
        if (!img) return;
        const baseSrc = img.getAttribute('src') || '';
        const restart = async () => {
          if (this.gifTickRunning) return;
          this.gifTickRunning = true;
          await this.fetchLeftData();
          img.setAttribute('src', '');
          img.setAttribute('src', baseSrc);
          this.gifTickRunning = false;
        };
        this.fetchLeftData();
        if (this.gifIntervalId) {
          clearInterval(this.gifIntervalId);
        }
        this.gifIntervalId = setInterval(restart, this.gifDurationMs);
      },
      async fetchLeftData(){
        try{
          const resp = await fetch(`${this.apiBase}/api/left-data`, { cache: 'no-store' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          const record = {
            ue: data.ue || 'UEB',
            timestamp: data.timestamp,
            blockHeight: data.blockHeight,
            status: data.status || '证书验证通过'
          };
          this.leftRecord = record;
          this.leftRecordKey = `${record.timestamp}-${record.blockHeight}`;
        }catch(err){
          console.warn('[left-data] fetch failed', err);
        }
      },
      startCenterGifLoop(){
        const img = document.getElementById('center-gif');
        if (!img) return;
        const baseSrc = img.getAttribute('src') || '';
        const restart = async () => {
          if (this.centerGifTickRunning) return;
          this.centerGifTickRunning = true;
          await this.fetchCenterData();
          img.setAttribute('src', '');
          img.setAttribute('src', baseSrc);
          this.centerGifTickRunning = false;
        };
        this.fetchCenterData();
        if (this.centerGifIntervalId) {
          clearInterval(this.centerGifIntervalId);
        }
        this.centerGifIntervalId = setInterval(restart, this.centerGifDurationMs);
      },
      async fetchCenterData(){
        try{
          const resp = await fetch(`${this.apiBase}/api/center-data`, { cache: 'no-store' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          const record = {
            ueId: data.ueId || '265',
            targetId: data.targetId || '64f070:00000089',
            reason: data.reason || '无线网络层',
            status: data.status || '上下文释放',
            blockHeight: data.blockHeight,
            risk: data.risk || '否'
          };
          this.centerRecord = record;
          this.centerRecordKey = `${record.blockHeight}-${record.ueId}`;
        }catch(err){
          console.warn('[center-data] fetch failed', err);
        }
      }
    }
  })
});
