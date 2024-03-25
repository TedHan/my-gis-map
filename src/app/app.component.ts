import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { config } from '../../src/decorators/config.js';
import * as world from '../assets/json/world-asia-center.json';
import * as echarts from '../assets/lib/echarts.min5.4.3.js';
import { SIMPLE_WORLD } from './data/simple-world.js';
import { GIS_CONFIG } from './gis-config';
import { getEchartsOption } from './options/echarts.option';
import { deepCopy, randomKeyGenerator, translatePoint } from './utils';

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

@config(GIS_CONFIG)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  static tagNamePrefix: string = 'sac-cannon';

  @ViewChild('map', { static: true }) map!: ElementRef<HTMLDivElement>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createWorldMap();
  }

  ngOnDestroy(): void {
    if (this.carousel) {
      clearInterval(this.carousel);
    }
  }

  getEchartsOption() {
    return this.worldMapInstance.getOption();
  }

  // 修改 Echarts Option 配置项
  applyEchartsOption(option = {}) {
    let oldOption = this.getEchartsOption();

    this.worldMapInstance.setOption({ ...oldOption, ...option });
  }

  worldMapInstance: any;
  private createWorldMap() {
    const mapDom = this.map.nativeElement;

    echarts.registerMap('world', world);

    // @ts-ignore
    this.worldMapInstance = echarts.init(mapDom);

    const initOpt = getEchartsOption();
    this.worldMapInstance.setOption(initOpt);
  }

  private carousel: any;
  createMapCannon(
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
        const geo = [...(SIMPLE_WORLD as any)[name]];
        if (geo) {
          // 平移
          geo[0] = translatePoint(geo[0]);

          return {
            name,
            value: [...geo, '中国' === name ? 1 : 0],
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
        const srcGeo = [...(SIMPLE_WORLD as any)[src]];
        const destGeo = [...(SIMPLE_WORLD as any)[dest]];

        if (srcGeo && destGeo) {
          srcGeo[0] = translatePoint(srcGeo[0]);
          destGeo[0] = translatePoint(destGeo[0]);

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
      this.worldMapInstance.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: arrIndex[i % arrIndex.length],
      });

      i++;
    }, interval * 1000);
  }
}
