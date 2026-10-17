---
title: "脑屿：用 3D 理解脑区与日常生活"
description: "旋转与探索六类脑结构，从记忆、心算和骑行三个生活案例理解大脑如何协作。"
date: "2026-10-16"
category: "web-3d"
topic: "projects"
tags: ["Three.js", "交互科普", "脑科学"]
cover: "/images/web-3d.svg"
featured: true
experience: "brain-atlas"
---

## 关于这个作品

脑屿是一个使用 Vue、Nuxt 与 Three.js 构建的交互科普作品。可以选择脑区查看位置、功能与生活案例，也可以跟随分步导览，观察不同区域如何参与同一项活动。

## 模型与内容边界

模型采用 [HRA Brain, Male v1.3](https://purl.humanatlas.io/ref-organ/brain-male/v1.3)，作者 Kristen Browne、Heidi Schlehlein（2023），依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 使用。原始数据基于 Allen 解剖图谱，通过镜像组成完整脑部，并非某个个体左右半球的独立扫描。

本项目保留原始网格形态与相对位置，量化压缩文件、调整材质并添加交互高亮。前额叶入口用相关额叶脑回提示位置，其范围不等同于精确的前额叶功能边界；其他分组也用于入门探索，不能用于医学定位。处理记录与完整署名见[模型说明](/models/brain/NOTICE.txt)。

半透明头部外形取自同一 HRA 的 [Skin, Male v1.2](https://purl.humanatlas.io/ref-organ/skin-male/v1.2)（CC BY 4.0），保留头部和上颈部，沿用与大脑相同的坐标。可对照额头、鼻子和下颌理解脑区位置，也可以关闭轮廓单独观察大脑。这一层展示皮肤外形，未展示颅骨；[头部模型署名与处理说明](/models/head/NOTICE.txt)单独保留。

功能描述是入门摘要；一项心理活动通常涉及多个区域和网络，不是一个区域对应一种能力。

知识介绍附有 NIMH 与 BrainFacts 的资料链接。生活案例用于帮助理解知识，不评估个人的记忆、自控或心理健康状况。
