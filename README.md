# sac-cannon

## 依赖项

"leaflet": "^1.9.4"

"echarts": "^5.4.3"

## 功能支持

### leaflet

#### 函数

##### setTileSource

设置瓦片源

```typescript
@params
```

##### focus

聚焦到gis地图的特定经纬度,层级上

```typescript
@params coods [经度，纬度]
@params zoom  [地图层级]

focus(coods, zoom);
```

##### renderPolygon

在leaflet上绘制多边形

```typescript
@params cityName 城市名称
@params prefix?   url前缀

内部会通过 fetch(`${prefix}${cityName}.json`) 加载json文件 并绘制多边形
```

### echarts

支持将echarts覆盖到leaflet上。

#### overlayEcharts

```typescript
覆盖到leaflet上的echarts覆盖实例。
可通过此数据获取 echarts实例。
```

#### 函数

##### applyEchartsOption

与echarts的option配置项合并

```typescript
@ paramns option echarts相关配置项
```

##### applyMigrationData

迁徙图，会将数据映射到 effectScatter 和 lines上

```typescript
type EchartsNode = {
  name: string;
  coords: [string | number, string | number];
  value: number;
};
type EchartsData = {
  source?: EchartsNode;
  target?: EchartsNode;
};

@params list:EchartsData[]
```

##### applyScatter

散点图，会将数据映射到 scatter上

```typescript
type EchartsScatter = {
  name:string,
  value:[number|string,number|string,value,any] // 前两位是经纬度,第三位是value，之后可以自定义
}

@params list:EchartsScatter[]

`symbol`：可通过修改scatter中的symbol函数配置散点的类型
```

#### tooltip

```typescript
`tooltip`：可通过applyEchartsOption修改tootip配置
```

### 事件

pointClick

```
scatter点击事件
```

