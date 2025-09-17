const n=`---
title: 有趣的图片api
date: 2024-08-31 13:15:54
tags:
categories:
    - [有趣的东西]
---
# 这里有一些有趣的图片api（更新中）

<script>
    let picture = document.getElementById("maomao1");
    function qiehuan(){
            picture.src="http://edgecats.net/"+'?' + new Date().getTime();
    }
    <\/script>
## 随机猫猫动图（点击图片以切换）
<img src="http://edgecats.net/" id="maomao1" onclick="qiehuan()" ></img>

`;export{n as default};
