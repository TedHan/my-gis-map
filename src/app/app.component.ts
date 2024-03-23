import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { transformValue } from 'src/common/index.js';
import { config } from '../../src/decorators/config.js';
import * as echarts from '../assets/lib/echarts.min5.4.3.js';
import { overlayEchartsInit } from '../assets/lib/leaflet-echarts.js';
import { SIMPLE_WORLD } from './data/simple-world.js';
import { EchartsService } from './echarts.service';
import { GIS_CONFIG } from './gis-config.js';
import { getEchartsOption } from './options/echarts.option.js';
import { deepCopy, randomKeyGenerator } from './utils';

type EchartsScatter = {
  name: string;
  value: [number | string, number | string, any];
};
type EchartsNode = {
  name: string;
  coords: [string | number, string | number];
  value: number;
};
type EchartsData = {
  source?: EchartsNode;
  target?: EchartsNode;
};

//@ts-ignore
declare var require: any;
echarts.registerMap('50000', require('../assets/json/china.json'));

overlayEchartsInit();
@config(GIS_CONFIG)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  @Output('pointClick') pointClick = new EventEmitter();
  static tagNamePrefix: string = 'sac-cannon';
  @ViewChild('map', { static: true }) map: any;
  gisIns: any;
  overlayEcharts: any;
  center = [37.550339, 104.114129];
  zoom = 4;
  tileLayer: any;
  tileSource = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  tileSourceGeoq =
    'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
  tileSourceCustom =
    'http://10.7.212.153:30000/infrastructure-screen/map/{z}/{y}/{x}';
  constructor() {}
  ngOnInit(): void {
    this.initMap();
    this.initEcharts();
    // this.renderPolygon('shandong');
    // this.createIconMarker();
    EchartsService.eventBus.subscribe((res: any) => {
      this.pointClick.emit(res);
    });
  }

  ngOnDestroy(): void {
    if (this.carousel) {
      clearInterval(this.carousel);
    }
  }
  // 设置瓦片源
  setTileSource(source = this.tileSourceGeoq) {
    this.tileLayer.setUrl(source, false);
  }
  // 初始化gis地图
  initMap() {
    const corner1 = L.latLng(-90, -160),
      corner2 = L.latLng(90, 260);
    var map = (this.gisIns = L.map(this.map.nativeElement, {
      minZoom: 3,
      maxZoom: 3,
      maxBounds: L.latLngBounds(corner1, corner2),
      zoomControl: false, // 缩放按钮
      attributionControl: false,
      dragging: false,
    }));
    this.tileLayer = L.tileLayer(this.tileSource).addTo(map);
    //@ts-ignore
    this.focus(this.center, this.zoom); //设置缩放级别及中心点
  }

  // 聚焦
  focus(coods = this.center, zoom = this.zoom) {
    //@ts-ignore
    this.gisIns.setView(L.latLng(...coods), zoom); //设置缩放级别及中心点
  }
  // 绘制多边形
  async renderPolygon(cityName: string, prefix = 'assets/json/') {
    // 多边形
    // create a red polygon from an array of LatLng points
    var cityJSON = await fetch(`${prefix}${cityName}.json`).then((res) =>
      res.json()
    );
    //@ts-ignore
    var polygon = L.polygon(cityJSON, { color: 'rgb(22 98 134)' }).addTo(
      this.gisIns
    );
    // zoom the map to the polygon
    this.gisIns.fitBounds(polygon.getBounds());
  }
  // 贴 echarts 内部配置由echarts决定【散点图，热力图，飞线图....】
  initEcharts() {
    //将Echarts加到地图上
    // @ts-ignore
    this.overlayEcharts = L.overlayEcharts(getEchartsOption()).addTo(
      this.gisIns
    );
  }
  // create icon marker
  createIconMarker(coords: L.LatLngTuple = [43.854108, 113.653412]) {
    L.marker(coords, {
      icon: new L.Icon({
        className: 'map-icon',
        iconUrl: 'assets/img/marker.png',
        iconSize: [20, 20],
        iconAnchor: [16, 16],
      }),
    }).addTo(this.gisIns);
  }
  // 应用散点图,数据会映射到 scatter上
  applyScatter(list: EchartsScatter[] = []) {
    let options = this.getEchartsOption();
    //  scatter
    options.series[0].data = list;
    EchartsService.echartsIns.setOption({ ...options });
    //@ts-ignore
    this.overlayEcharts._echartsOption = { ...options };
  }
  // 应用迁徙数据,默认将source/target 数据映射到effectScatter，lines
  applyMigrationData(list: EchartsData[] = []) {
    let effectScatter: any[] = [],
      lines: any[] = [];
    list.forEach((item) => {
      const { source, target } = item;
      [target, source].forEach((node: any, index) => {
        const { name, coords, value } = node;
        // scatter.push({ name, value: [...coords, value, index], item: node });
        effectScatter.push({
          name,
          value: [...coords, value, index],
          item: node,
        });
      });
      // 有source，target时有连线
      if (source && target) {
        lines.push([
          { name: source.name, coord: source.coords },
          { name: target.name, coord: target.coords },
        ]);
      }
    });
    let options = this.getEchartsOption();
    //  effectScatter
    options.series[1].data = effectScatter;
    // lines
    options.series[2].data = lines;
    EchartsService.echartsIns.setOption({ ...options });
    //@ts-ignore
    this.overlayEcharts._echartsOption = { ...options };
  }
  getEchartsOption() {
    return EchartsService.echartsIns.getOption();
  }
  // 修改echarts Option 配置项
  applyEchartsOption(option = {}) {
    let oldOption = this.getEchartsOption();
    EchartsService.echartsIns.setOption({ ...oldOption, ...option });
    //@ts-ignore
    this.overlayEcharts._echartsOption = option;
    this.overlayEcharts.redraw();
  }
  static extends(option: any): { tagName: string; html: string; js: string } {
    // web component 的索引不能递增，因为索引重置后会重复，而且cache后apply会有冲突。
    const index = String(Math.random()).substring(2),
      tagName = `${AppComponent.tagNamePrefix}-${index}`;
    const { html, className } = option;
    let config: any = {};
    Object.keys({}).map((key) => {
      config[key] = transformValue(html[key]);
    });
    return {
      tagName: `${tagName}`,
      html: `<${tagName} _data="_ngElementStrategy.componentRef.instance"
                        _methods="_ngElementStrategy.componentRef.instance" 
                       ></${tagName}>`,
      js: `class MyGis${index} extends ${className}{
             constructor(){
                 super();
             }
         }
         MyGis${index}.ɵcmp.factory = () => { return new MyGis${index}()};
         (()=>{
          let customEl = createCustomElement2(MyGis${index}, {  injector: injector2,});
          // 添加用户自定义数据
          Object.defineProperties(customEl.prototype,{
            option:{
              get(){
                return ${JSON.stringify(config)}
              },
              configurable: false,
              enumerable: false
            },
            instance:{
              get(){
                return this._ngElementStrategy.componentRef.instance
              },
              configurable: false,
              enumerable: false
            },
            setTileSource:function(source){
              this.instance.setTileSource(source)
            },
            focus:function(){
              this.instance.focus()
            },
            getEchartsOption:function(){
              this.instance.getEchartsOption()
            },
            applyEchartsOption:function(option){
              this.instance.applyEchartsOption(option)
            },
            applyMigrationData:function(list){
              this.instance.applyMigrationData()
            },
          })
          customElements.define('${tagName}',customEl);
        })();
         `,
    };
  }

  private carousel: any;
  createMapCannon(
    tileSrc: string,
    icons: {
      china: string;
      foreign: string;
      lineIn: string;
      lineOut: string;
      tooltipBg: string;
    },
    lines: Array<{
      country: string;
      destCountry: string;
      status: 'in' | 'out';
    }>,
    points: Array<{
      country: string;
      count: string;
      mapTypeList: Array<{
        type: string;
        count: number;
      }>;
    }>,
    interval: number = 3,
    tooltipCountLabel: string = '攻击团伙数',
    tooltipChartLabel: string = 'IP类型分布'
  ) {
    // 设置瓦片源
    this.setTileSource(tileSrc || this.tileSourceCustom);

    // 设置中心点、缩放层级
    const CENTER = [35.86166, 0];
    const ZOOM = 3;
    this.focus(CENTER, ZOOM);

    const countrySet = new Set<string>();
    lines.forEach((l) => {
      const { country, destCountry } = l;

      if (!countrySet.has(country)) {
        countrySet.add(country);
      }
      if (!countrySet.has(destCountry)) {
        countrySet.add(destCountry);
      }
    });
    const countryPoints = Array.from<string>(countrySet)
      .map((name) => {
        const geo = (SIMPLE_WORLD as any)[name];
        if (geo) {
          return {
            name,
            value: [...geo, '中国' === name ? 1 : 0],
          };
        } else {
          return null;
        }
      })
      .filter((i) => i);

    const cardPoints = points
      .map((p) => {
        const { country: name } = p;
        const geo = (SIMPLE_WORLD as any)[name];

        if (geo) {
          return {
            name,
            value: [...geo, p],
          };
        } else {
          return null;
        }
      })
      .filter((i) => i);

    const options = this.getEchartsOption();

    const series = options.series;

    const scatter = deepCopy(series.find((s: any) => 'scatter' === s.type));
    const linesIn = deepCopy(series.find((s: any) => 'lines' === s.type));

    scatter.data = countryPoints;
    scatter.tooltip = {
      show: true,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 0,
      padding: 0,
      formatter: (params: any) => {
        const { name } = params;
        const detail = points.find((i) => i.country === name);

        if (detail) {
          const { count, mapTypeList: list } = detail;

          const chartData = list.map((i) => ({ name: i.type, value: i.count }));

          const CHART_ID = `pie-${randomKeyGenerator(3)}`;
          let tpl = '<div class="cannon-tooltip">';
          tpl += `<img src="${icons.tooltipBg}" class="cannon-tooltip-bg" />`;
          tpl += `<p class="cannon-tooltip-title">${name}</p>`;
          tpl += `<p class="cannon-tooltip-count">${tooltipCountLabel}：<label>${count}</label></p>`;
          tpl += `<p class="cannon-tooltip-chart">${tooltipChartLabel}</p>`;
          tpl += '<div class="cannon-tooltip-chart-box">';
          tpl += `<div style="position: relative; width: 100%; height: 100%" id="${CHART_ID}"></div>`;
          tpl += '</div>';
          tpl += '</div>';

          setTimeout(() => {
            // @ts-ignore
            const pie = echarts.init(document.getElementById(CHART_ID));

            // @ts-ignore
            // const getCirlPoint = (x0, y0, r, angle) => {
            //   let x1 = x0 + r * Math.cos((angle * Math.PI) / 180);
            //   let y1 = y0 + r * Math.sin((angle * Math.PI) / 180);
            //   return {
            //     x: x1,
            //     y: y1,
            //   };
            // };

            let angle = 0;

            const option = {
              color: ['#5755f2', '#8500a7', '#25cfbb', '#2dd2f6', '#2387df'],
              tooltip: {
                show: false,
              },
              legend: {
                show: false,
              },
              series: [
                {
                  name: 'ring5',
                  type: 'custom',
                  coordinateSystem: 'none',
                  // @ts-ignore
                  renderItem: (params, api) => {
                    return {
                      type: 'arc',
                      shape: {
                        cx: api.getWidth() / 2,
                        cy: api.getHeight() / 2,
                        r:
                          (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.6,
                        startAngle: ((0 + angle) * Math.PI) / 180,
                        endAngle: ((90 + angle) * Math.PI) / 180,
                      },
                      style: {
                        stroke: '#8383FA',
                        fill: 'transparent',
                        lineWidth: 1.5,
                      },
                      silent: true,
                    };
                  },
                  data: [0],
                },
                {
                  name: 'ring5',
                  type: 'custom',
                  coordinateSystem: 'none',
                  // @ts-ignore
                  renderItem: (params, api) => {
                    return {
                      type: 'arc',
                      shape: {
                        cx: api.getWidth() / 2,
                        cy: api.getHeight() / 2,
                        r:
                          (Math.min(api.getWidth(), api.getHeight()) / 2) * 0.6,
                        startAngle: ((180 + angle) * Math.PI) / 180,
                        endAngle: ((270 + angle) * Math.PI) / 180,
                      },
                      style: {
                        stroke: '#4386FA',
                        fill: 'transparent',
                        lineWidth: 1.5,
                      },
                      silent: true,
                    };
                  },
                  data: [0],
                },
                {
                  name: 'ring5',
                  type: 'custom',
                  coordinateSystem: 'none',
                  // @ts-ignore
                  renderItem: (params, api) => {
                    return {
                      type: 'arc',
                      shape: {
                        cx: api.getWidth() / 2,
                        cy: api.getHeight() / 2,
                        r:
                          (Math.min(api.getWidth(), api.getHeight()) / 2) *
                          0.65,
                        startAngle: ((270 + -angle) * Math.PI) / 180,
                        endAngle: ((40 + -angle) * Math.PI) / 180,
                      },
                      style: {
                        stroke: '#0CD3DB',
                        fill: 'transparent',
                        lineWidth: 1.5,
                      },
                      silent: true,
                    };
                  },
                  data: [0],
                },
                {
                  name: 'ring5',
                  type: 'custom',
                  coordinateSystem: 'none',
                  // @ts-ignore
                  renderItem: (params, api) => {
                    return {
                      type: 'arc',
                      shape: {
                        cx: api.getWidth() / 2,
                        cy: api.getHeight() / 2,
                        r:
                          (Math.min(api.getWidth(), api.getHeight()) / 2) *
                          0.65,
                        startAngle: ((90 + -angle) * Math.PI) / 180,
                        endAngle: ((220 + -angle) * Math.PI) / 180,
                      },
                      style: {
                        stroke: '#FF8E89',
                        fill: 'transparent',
                        lineWidth: 1.5,
                      },
                      silent: true,
                    };
                  },
                  data: [0],
                },
                {
                  name: tooltipChartLabel,
                  type: 'pie',
                  radius: ['52%', '40%'],
                  silent: true,
                  clockwise: true,
                  avoidLabelOverlap: false,
                  startAngle: 90,
                  padAngle: 5,
                  itemStyle: {
                    borderRadius: 10,
                  },
                  label: {
                    color: '#42B5AF',
                    fontSize: 12,
                  },
                  data: chartData,
                },
              ],
            };

            pie.setOption(option);
          });

          return tpl;
        } else {
          return '';
        }
      },
    };
    scatter.symbol = (value: [number, number, number]) => {
      const [, , type] = value;
      const img = 1 === type ? icons.china : icons.foreign;
      return `image://${img}`;
    };
    scatter.symbolRotate = 0;
    scatter.symbolOffset = 0;
    scatter.symbolSize = (value: [number, number, number]) => {
      const [, , type] = value;
      const size = 1 === type ? 100 : 30;
      return size;
    };
    scatter.label = {
      show: true,
      color: '#ccfbf8',
      fontSize: 14,
      position: 'top',
      formatter: (params: any) => {
        if ('中国' === params.name) {
          return '';
        } else {
          return params.name;
        }
      },
    };
    scatter.zlevel = 10;

    const cannonLines = lines
      .map((l) => {
        const { country: src, destCountry: dest, status } = l;
        const srcGeo = (SIMPLE_WORLD as any)[src];
        const destGeo = (SIMPLE_WORLD as any)[dest];

        if (srcGeo && destGeo) {
          return [
            { name: src, coord: srcGeo },
            { name: dest, coord: destGeo },
            status,
          ];
        } else {
          return null;
        }
      })
      .filter((i) => i);

    linesIn.data = cannonLines.filter((l: any) => 'in' === l[2]);
    linesIn.effect = {
      show: true,
      trailLength: 0.8,
      symbol: `image://${icons.lineIn}`,
      symbolSize: 10,
      constantSpeed: 280,
    };
    linesIn.lineStyle = {
      color: 'white',
      width: 1,
      opacity: 0,
      curveness: 0.3,
    };
    linesIn.emphasis = { show: false };
    linesIn.tooltip = { show: false };
    linesIn.zlevel = 12;

    const linesOut = deepCopy(linesIn);
    linesOut.data = cannonLines.filter((l: any) => 'out' === l[2]);
    linesOut.effect = {
      show: true,
      trailLength: 0.8,
      symbol: `image://${icons.lineOut}`,
      symbolSize: 10,
      constantSpeed: 200,
    };
    linesOut.zlevel = 13;

    options.series = [scatter, linesIn, linesOut];

    this.applyEchartsOption(options);

    const arrIndex = points.map((p) => {
      return countryPoints.findIndex((i) => i?.name === p.country);
    });

    if (this.carousel) {
      clearInterval(this.carousel);
    }

    let i = 0;
    this.carousel = setInterval(() => {
      EchartsService.echartsIns.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: arrIndex[i % arrIndex.length],
      });

      i++;
    }, interval * 1000);
  }
}
