# drag.js
一个简单的js拖拽插件

1、支持有效的拖拽元素

2、支持拖拽区域限制

### 基本使用
#### html
```
<div id="obj1" class="dialog" style="position:absolute;left:50px">
    <div class="header">
        拖拽的有效元素
    </div>
    <div class="content">
        拖拽对象1
    </div>
</div>
```

#### script
```
<script src="../src/draggable.js"></script>
<script>
	drag(document.getElementById("obj1"), { validSelector: ".header" });
</script>
```
查看<a href="http://luopq.com/demo/drag/index.html" target="_blank">Demo</a>

### Options
| 参数名 | 类型 |默认值|描述|
| ----  | ---- |-----|---|
|validSelector|string|null|有效的拖拽元素的选择器，默认整个元素|
|parentSelector|string|null|父级区域选择器，默认body元素|
