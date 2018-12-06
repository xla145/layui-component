layui.define(['jquery', 'form'], function (exports) {
    var $ = layui.jquery, form = layui.form;
    var DynamicFilter = function () {
        this.config = {
            container: '.id',
            conditionsElem: '.layui-filter-condition',
            conditions: [] // 筛选条件
        }
    }

    DynamicFilter.prototype.render = function(option) {
        let html = "<div class=\"layui-tool-self layui-form\">\n" +
                        "<div class=\"layui-inline layui-filter-list\" title=\"筛选列\" lay-event=\"LAYTABLE_COLS\"><i class=\"layui-icon layui-icon-cols\"></i>\n" +
                        "</div>" +
                    "</div>";
        let that = this;
        that.config = $.extend(that.config,option);
        let othis = $(that.config.container);
        othis.append(html);

        $(document).click(function(e){
            var _con = $('.layui-codition-list');   // 设置目标区域
            if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
                $(".layui-tool-panel").addClass("layui-hide");
            }
        });
        that.events(); //事件
    }

    DynamicFilter.prototype.events = function () {
        let that = this;
        //工具栏操作事件
        $(that.config.container).on('click', '*[lay-event]', function(e){
            let othis = $(this)
                ,events = othis.attr('lay-event')
            othis.find('.layui-tool-panel')[0] && othis.find('.layui-tool-panel').removeClass("layui-hide")
            let openPanel = function(sets){
                let list = sets.list
                    ,panel = $('<ul class="layui-tool-panel"></ul>');
                panel.html(list);
                othis.find('.layui-tool-panel')[0] || othis.append(panel);
                form.render('checkbox');
                panel.on('click', function(e){
                    layui.stope(e);
                });
                sets.done && sets.done(panel, list)
            };
            if (events == "LAYTABLE_COLS") {
                openPanel({
                    list: function () {
                        let lis = [];
                        that.eachConditions(function (i,item) {
                            lis.push('<li><input type="checkbox" name="'+ item.field +'" data-key="'+ item.key +'" data-parentkey="\'+ (item.parentKey||\'\') +\'" lay-skin="primary" '+ (item.hide ? '' : 'checked') +' title="'+ (item.title || item.field) +'" lay-filter="LAY_TABLE_TOOL_COLS"></li>');
                        })
                        return lis.join('');
                    }()
                    , done: function () {
                        form.on('checkbox(LAY_TABLE_TOOL_COLS)', function (obj) {
                            console.log(obj)
                            var othis = $(obj.elem)
                                , checked = this.checked
                                , key = othis.data('key');
                            that.eachConditions(function (i,item,that1) {
                                if (key == i) {
                                    if (!checked) {
                                        that1.addClass("layui-hide");
                                    } else {
                                        that1.removeClass("layui-hide");
                                    }
                                }
                            })
                        });
                    }
                })
            }
        });
    }

    /**
     * 遍历筛选条件
     */
    DynamicFilter.prototype.eachConditions = function(callback) {
        var that = this;
        let othis = $(that.config.conditionsElem);
        othis.each(function (i, j) {
            let item = {};
            let othis = $(this);
            let name = othis.find("input").attr("name") || $(this).find("select").attr("name");
            let title = othis.find(".layui-filtrate-title").text();
            let hide = othis.hasClass(".layui-hide");
            title = title.substring(0,title.lastIndexOf("：") || title.lastIndexOf(":"));
            item["field"] = name;
            item["title"] = title;
            item["key"] = i;
            item["hide"] = hide;
            typeof callback === 'function' && callback(i, item,othis);
        });
        return that;
    }
    // 有空实现，跨页选数据
    exports('dynamicFilter', new DynamicFilter());
});
