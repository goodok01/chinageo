# 项目关系与来源核验

核验日期：2026-11-09。

ChinaGeo（中国地理地形地图）
- PC/Web 客户端：https://chinageo.vercel.app/
- 移动/PWA 客户端：https://chinageo-mobile.xhengxxxx.chatgpt.site
- 两个客户端均集成历史图层，使用《坤舆纪年》的数据结构和上游远程资源。

## 既有线上版本的技术关系（本次发布已移除）

两版历史模块均从 `https://wanglu2016.github.io/kunyu-jinian/assets/` 动态载入 `data.js` 与 `geo.js`。本准备目录没有打包这些上游文件。
两版均包含 `decodeHistoryGeoms`，其实现与上游 `index.html` 的 `decodeGeoms` 高度对应，须按派生/改编代码核验授权，不能仅作普通数据 API 引用。
集成改动包括将压缩几何转为 GeoJSON、MapLibre 历史图层、年代筛选与交互适配。
尚未完成全部函数的逐项原创性鉴别。

## 可复核的来源

- 移动源码：Sites 源码仓库，提交 `7c111cfdcd7a551b7770fa52e5136b3bb6af837b`；Site 版本 1。
- PC/Web：从在线页面取得的静态 HTML 快照。尚未与原始 Git 仓库或部署提交比对，不能称为已恢复完整开发历史。
- Vercel 搜索返回项目 `china-terrain-3d-10x`；团队详情访问受限，因此其域名绑定与 Git 来源仍待核验。
- 上游核验提交：`ee8f9f15aa5b19801b135bbd1f13bd1320f8b5db`。
- 上游远程数据 URL 未锁定提交，运行时内容可能与核验快照变化。

## 本次开源仓库布局

使用一个主仓库 `chinageo`，`apps/web` 和 `apps/mobile` 分别保留客户端，文档统一维护。后续再按实际重复逻辑抽取共享代码，部署入口可继续分开。

## 首次开源决策

经项目所有者确认：先开源地形功能；历史功能改为原站链接。`apps/` 中不再保留上游历史加载、解码、年代与政权图层实现；外链不代表授权、合作或背书。线上已有版本和本次 GitHub 版本分别管理。
