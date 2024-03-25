function getEchartsOption() {
  return {
    geo3D: {
      map: "world",
      roam: false,
      tooltip: {
        show: false,
      },
      regionHeight: 5,
      itemStyle: {
        color: "#efcbcb",
        borderWidth: 1.5,
        borderColor: "#459bca",
        shadowOffsetX: 1000,
        shadowOffsetY: 100,
        opacity: 0.8, //透明度
        shadowBlur: 8, //阴影大小
        type: "dotted", //实线
      },
      shading: "realistic",
      label: {
        show: true,
        textStyle: {
          color: "#00ff7f",
          fontSize: 8,
          opacity: 1,
        },
        formatter: (params) => `${params.name}`,
      },
      light: {
        main: {
          color: "#fff",
          intensity: 1,
          shadow: true,
          alpha: 40,
          beta: 30,
        },
        ambient: {
          intensity: 0,
        },
        ambientCubemap: {
          cubemap: {},
          diffuseIntensity: 1,
          texture: "",
        },
      },

      groundPlane: {
        show: false,
      },
      visualMap: {
        //视角控制
        show: true,
        min: 0,
        max: 100,
        calculable: true,
      },
      globe: {
        // 光照效果
        baseColor: "#fff0.5",
        shading: "color",
      },
      regions: [
        // {
        //   name: '北京市',
        //   itemStyle: {
        //     color: 'red',
        //   },
        // },
        {
          name: "河北省",
          itemStyle: {
            color: "red",
          },
        },

        {
          name: "河南省",
          itemStyle: {
            color: "yellow",
          },
        },
      ],
    },
    geo: {
      show: false,
      map: "world",
      roam: false,
      zlevel: 3,
      left: 0,
      top: 36,
      right: 0,
      bottom: 20,
      label: {
        show: false,
      },
      itemStyle: {
        areaColor: {
          type: "radial",
          x: 800,
          y: 320,
          r: 700,
          colorStops: [
            {
              offset: 0,
              color: "rgba(51, 121, 203, 0.9)", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "rgba(30, 63, 120, 0.9)", // 100% 处的颜色
            },
          ],
          global: true, // 缺省为 false
        },
        borderColor: "rgba(117, 171, 222, 0.9)",
        borderWidth: 1,
      },
      emphasis: {
        disabled: true,
      },
      tooltip: {
        show: false,
      },
      regions: [
        {
          name: "China",
          itemStyle: {
            borderColor: "rgba(77, 243, 248, 1)",
            borderWidth: 3,
            shadowColor: "rgba(77, 243, 248, 1)",
            shadowBlur: 10,
          },
          label: { show: false, color: "#fff", fontSize: 16 },
        },
      ],
    },
    tooltip: {
      show: true,
      trigger: "item",
    },
    series: [
      {
        type: "scatter",
        coordinateSystem: "geo",
        symbolSize: [30, 40],
        symbolOffset: [-10, -10],
        symbolRotate: 45,
        zlevel: 4,
        symbolKeepAspect: true,
        symbol: (value, params) => {
          const [, , , type] = value;
          let img = type == 1 ? "source" : "target";
          return `image://assets/img/${img}.png`;
        },
        /**
         * @value
         * source:1
         * target:0
         * [经度，纬度，value,source/target]
         */
        data: [
          // {
          //   name: "北京",
          //   value: [116.405285, 39.904989, 5, 1],
          // },
          // {
          //   name: "花都",
          //   value: [113.211184, 23.39205, 5, 0],
          // },
          // {
          //   name: "天河",
          //   value: [113.335367, 23.13559, 5, 0],
          // },
          // {
          //   name: "黄埔",
          //   value: [113.450761, 23.103239, 5, 0],
          // },
          // {
          //   name: "南沙",
          //   value: [113.53738, 22.794531, 5, 1],
          // },
          // {
          //   name: "新疆",
          //   value: [87.617733, 43.792818, 2, 1],
          // },
        ],
      },
      {
        //涟漪图
        type: "effectScatter",
        coordinateSystem: "geo",
        showEffectOn: "render",
        rippleEffect: {
          brushType: "stroke",
          period: 6,
          number: 3,
          scale: 4.5,
        },
        symbolKeepAspect: true,
        label: {
          show: true,
          color: "#FFF", //字体颜色
          position: "right",
          fontSize: 8,
          formatter: function (params) {
            return params.name;
          },
        },
        symbolSize: 10,
        itemStyle: {
          color: (params) => {
            const { value } = params;
            const [, , , type] = value;
            return type == 1 ? "#facf1975" : "#ff391b";
          }, //散点颜色
        },
        data: [
          // {
          //   name: "北京",
          //   value: [116.405285, 39.904989, 5, 1],
          // },
          // {
          //   name: "花都",
          //   value: [113.211184, 23.39205, 5, 0],
          // },
          // {
          //   name: "天河",
          //   value: [113.335367, 23.13559, 5, 0],
          // },
          // {
          //   name: "黄埔",
          //   value: [113.450761, 23.103239, 5, 0],
          // },
          // {
          //   name: "南沙",
          //   value: [113.53738, 22.794531, 5, 0],
          // },
          // {
          //   name: "新疆",
          //   value: [87.617733, 43.792818, 2, 0],
          // },
        ],
      },
      {
        type: "lines",
        coordinateSystem: "geo",
        zlevel: 50,
        zlevel: 1,
        effect: {
          show: true,
          color: "red",
          period: 6, //箭头指向速度，值越小速度越快
          trailLength: 0.5, //特效尾迹长度[0,1]值越大，尾迹越长重
          symbol: "circle", //箭头图标
          // symbol: "image://assets/img/source.png", //箭头图标
          symbolSize: 5, //图标大小
        },
        lineStyle: {
          color: "white",
          width: 1, //尾迹线条宽度
          opacity: 0.01, //尾迹线条透明度
          curveness: 0.3, //尾迹线条曲直度
        },
        // emphasis: {
        //   lineStyle: {
        //     color: "white",
        //     width: 1, //尾迹线条宽度
        //     opacity: 0.3, //尾迹线条透明度
        //     curveness: 0.3, //尾迹线条曲直度
        //   },
        //   disabled: false,
        //   focus: "series",
        // },

        selectMode: true,
        select: {
          lineStyle: {
            color: "white",
            width: 1, //尾迹线条宽度
            opacity: 1, //尾迹线条透明度
            curveness: 0.3, //尾迹线条曲直度
          },
        },
        data: [
          // [
          //   { name: "北京", coord: [116.405285, 39.904989] },
          //   { name: "南沙", coord: [113.53738, 22.794531] },
          //   123,
          // ],
          // [
          //   { name: "北美洲", coord: [-100, 43.854108] },
          //   { name: "苏尼特左旗", coord: [113.653412, 43.854108] },
          //   123,
          // ],
        ],
      },
    ],
  };
}
export { getEchartsOption };
