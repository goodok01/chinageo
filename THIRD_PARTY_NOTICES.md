# 第三方代码、数据与服务

本项目代码使用 MIT；以下第三方内容各自适用原有许可。在线服务访问权不随本仓库分发。

## 历史地图：仅外链

原项目：[坤舆纪年 / wanglu2016](https://github.com/wanglu2016/kunyu-jinian)，[在线原站](https://wanglu2016.github.io/kunyu-jinian/)。本次开源版本仅提供普通外链，不自动加载上游脚本、数据、字体或影像。

2026-11-09 核验上游提交 `ee8f9f15aa5b19801b135bbd1f13bd1320f8b5db`：未发现整个项目代码的明确开源许可证。上游 README 对 Cliopatria / Seshat 疆域数据声明 CC BY 4.0，对其他来源分别说明许可；这些数据许可不自动覆盖应用代码。本仓库移除了之前集成的历史解码与叠加实现，不将其作为原创代码发布，也不向使用者授予上游代码或数据的使用许可。

## MapLibre GL JS 5.12.0

https://github.com/maplibre/maplibre-gl-js ，BSD-3-Clause。客户端从 jsDelivr / unpkg 加载，不在仓库中打包引擎。原始版权及许可全文见 [MapLibre 许可证](third_party/MapLibre-GL-JS-LICENSE.txt)。

## OpenFreeMap / OpenStreetMap

https://openfreemap.org/ 提供在线矢量底图、样式和字形；OpenStreetMap 数据 © OpenStreetMap contributors，ODbL 1.0：https://www.openstreetmap.org/copyright 。客户端保留 MapLibre attribution 控件及底图返回的来源署名。

## AWS Terrain Tiles / Mapzen

在线 Terrarium 瓦片：https://registry.opendata.aws/terrain-tiles/ 。这些瓦片汇总多个高程来源，不能统一按本项目 MIT 再许可。上游规定的来源说明完整保存在 [terrain-attribution.md](third_party/terrain-attribution.md)，地图内同时提供来源链接；具体数据许可须参阅 https://github.com/tilezen/joerd/blob/master/docs/data-sources.md 。本仓库不包含高程瓦片。

## geoBoundaries 中国县级边界

引用版本 `9469f09` 的 `gbOpen/CHN/ADM2`，boundaryID `CHN-ADM2-17275852`，边界年份 2017；来源 National Administration of Surveying, Mapping and Geoinformation of China / Revolutionary GIS。

具体文件元数据声明 **Open Data Commons Public Domain Dedication and License (PDDL) v1.0**，见 [原始元数据](third_party/geoBoundaries-CHN-ADM2-metadata.json) 和 https://opendatacommons.org/licenses/pddl/1-0/ 。不要把其他版本或整个 gbOpen 系列的许可直接套用到这个文件。客户端按需远程加载，不在仓库中打包数据。地图内添加来源说明；这些历史边界不代表现行法定边界。

## Esri World Topographic Map

备用底图为 Esri 在线服务，客户端保留服务来源署名。服务及供应者条款见 https://www.esri.com/en-us/legal/terms/full-master-agreement ，属于第三方服务，不能视为 MIT 开源瓦片。自建或商业部署时须确认对应服务访问条件。
