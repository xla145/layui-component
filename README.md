# layui-component
主要结合fly社区的一些组件，在它们的基础上做一些修改完善加上自己的一些idea.目前主要有动态隐藏条件筛选框，excel导出功能（支持接口数据导出），table 穿梭框，
下拉表格等组件

1. excel 导出/读取

    主要基于xlsx.js 插件 (具体使用方法参考官方文档) 实现excel导出功能，下面我们说一下如何使用：
由于组件是基于layui实现的，所以首先需要引入 layui.js 和 layui.css 文件，接下来

```
layui.use(['jquery', 'excel', 'layer'], function() {

var $ = layui.jquery, layer = layui.layer,excel = layui.excel; // 引入excel 组件

// 进行数据自定义配置
let e = excel.dataConfig({
        // 写入自定义header头部信息
        header:{ name: "用户名", range: '时间', sex: '性别',  city: '城市',  score: '签名' },
        // 处理数据信息，根据具体业务自行编写函数处理
        fields: {
            name: 'username',
            range: function(value, line, data) {
                return line['start'] + '~' + line['end'];
            },
            score: function(value, line, data) {
                return value * 10;
            }
        }
    })

}

// 执行导出操作，完成功能
e.exportExcel(data, '导出接口数据.xlsx', 'xlsx');
```
我们通过上述demo大概能知道如何使用，接下来我们说一下里面一些方法的具体使用

* excel.dataConfig

    1. header：主要是key/value 的形式，根据传入的数据信息转成对应的中文，从而为生成header做准备
    2. fields：做字段数据进行处理，得到最后想要的数据信息，value (当前字段数据信息) line(当前行数据信息) data(接口返回的原始数据)
    根据这三个变量编写自己的处理逻辑，完成最后的数据处理。

* excel.exportExcel
    该方法主要有三个参数 data (原始数据) fileName (导出的文件名称) fileType(文件类型)

说了excel的导出，我们来说一下excel的导入

```
//指定允许上传的文件类型
    upload.render({
        elem: '#test3'
        ,url: '/upload/'
        ,auto: false
        ,accept: 'file' //普通文件
        ,choose: function (obj) {
            //预读本地文件示例，不支持ie8
            obj.preview(function(index, file, result){
                let data = e.readExcel(file).then(function (result) {
                    $("#excel-content").text(JSON.stringify(result))
                }).catch(function (result) {

                });

            });
        }
        ,done: function(res){
            console.log(res)
        }
    });
```
在上述代码中引入upload上传组件，然后再选择文件后执行文件预览操作，通过readExcel方法传入file，主要readExcel是异步读取数据返回的是Promise对象，需要通过Promise对象的then表示异步执行成功通知
```
new Promise().then(function (result) {
    $("#excel-content").text(JSON.stringify(result))
})
```
返回的是读取成功的结果，也有可能是异常情况，有什么问题可以提issues也可以自行看源码


2. 下拉框表格

3. 表格穿梭框

4. 动态隐藏搜索列























 参考项目：

 [js-xlsx](https://github.com/SheetJS/js-xlsx)

 [layui-excel](https://github.com/wangerzi/layui-excel)