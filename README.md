# ChinaGeo · 中国地理地形地图

中国三维地形探索工具：真实高程、可调地形夸张、山脉河湖中文标注、地球仪模式，以及可安装到手机主屏幕的 PWA。

## 一个项目，两个客户端

| 客户端 | 现有在线版本 | 本仓库入口 |
| --- | --- | --- |
| PC / Web | https://chinageo.vercel.app/ | `apps/web/index.html` |
| 移动试用版 / PWA | https://chinageo-mobile.xhengxxxx.chatgpt.site | `apps/mobile/app/index.html` |

两者是同一 ChinaGeo 项目的不同客户端，分别部署。上述线上地址是已有版本，可能仍包含历史叠加功能；本次开源版仅发布地形功能，历史入口跳转到第三方[《坤舆纪年》原站](https://wanglu2016.github.io/kunyu-jinian/)。本次 GitHub 发布不代表已更新上述部署。

## 本地使用

无需安装前端依赖，也无需构建。在仓库根目录执行：

```sh
python3 -m http.server 8000
```

- PC/Web： http://localhost:8000/apps/web/
- 移动/PWA： http://localhost:8000/apps/mobile/app/

地图引擎、底图、高程和县界需要联网。PWA 只缓存应用外壳，不提供离线地图；主屏幕安装需要 HTTPS 或 localhost，是否可安装取决于浏览器。

## 功能

- MapLibre GL JS 三维地形，1–100 倍高程夸张和视角调整。
- 平面展开 / 地球仪切换，常用地区视角，山脉、河流和湖泊标注。
- 可选历史县级边界、地形阴影和 GeoJSON 水系导入。
- 地图导出；移动端触屏面板、点选海拔和 PWA 应用外壳。
- 历史地图以外链形式打开独立的《坤舆纪年》项目。

## 目录

```text
apps/web/       PC/Web 静态客户端
apps/mobile/    移动静态客户端与 PWA
third_party/    第三方许可证与数据来源元数据
docs/          项目关系、来源与发布记录
```

PC 版来自项目所有者提供的公开部署页面快照，移动版来自 Sites 源码提交；尚未恢复 PC 版原始开发历史。详见 [项目关系与源码来源](docs/PROJECT_RELATIONSHIPS.md)。

## 开源许可与数据

本仓库项目代码以 [MIT](LICENSE) 发布，版权归 goodok01。外部地图数据、在线服务与第三方库分别适用其许可及服务条款，不因本项目采用 MIT 而变更。详见 [第三方说明](THIRD_PARTY_NOTICES.md)。

《坤舆纪年》没有明确的项目代码开源许可；本次发布不包含其数据文件、历史几何解码或历史叠加实现，不为该第三方项目授予任何许可。

数字高程读数和夸张效果用于地理浏览；2017 年县界不代表现行法定界线。正式界线应用请参照自然资源部标准地图。
