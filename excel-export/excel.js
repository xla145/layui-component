/**
 * 读取文件 excel
 * **/

layui.define(['layer','xlsx','util'], function (exports) {

    var $ = layui.jquery;

    var Excel = function () {
        this.options = {
            type: 'xlsx',
            header: {},
            filename: 'exportData',
            props: {
                Title: 'exportData',
                Subject: 'Export From web browser',
                Author: "excel.wj2015.com",
                CreatedData: new Date(),
            },
            sheetName: 'sheet1',
            fields: {}
        }
        this.rABS = false;
        this.wb = null;
    }

    Excel.prototype.readExcel = function (file) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let reader = new FileReader();
            reader.onload = function (e) {
                let data = e.target.result;
                if (that.rABS) {
                    that.wb = XLSX.read(btoa(this.fixdata(data)), {//手动转化
                        type: 'base64'
                    });
                } else {
                    that.wb = XLSX.read(data, {
                        type: 'binary'
                    });
                }
            };
            reader.onloadend = function () {
                resolve(XLSX.utils.sheet_to_json(that.wb.Sheets[that.wb.SheetNames[0]]));
            }
            if (that.rABS) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsBinaryString(file);
            }
        });
    }


    Excel.prototype.fixdata = function (data) {
        //文件流转BinaryString
        let o = "", l = 0, w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }


    /**
     * 将导出的数据格式，转换为可以aoa导出的格式
     * @return {[type]} [description]
     */
    Excel.prototype.filterDataToAoaData =  function(filterData){
        let aoaData = [];
        layui.each(filterData, function(index, item) {
            let itemData = [];
            for (let i in item) {
                itemData.push(item[i]);
            }
            aoaData.push(itemData);
        });
        return aoaData;
    }


    /**
     * 梳理导出的数据，包括字段排序和多余数据过滤
     */
    Excel.prototype.filterExportData = function(data, fields) {

        let that = this;
        let exportData = [];
        let trueFields = [];

        // filed 支持两种模式，数组则单纯排序，对象则转换映射关系，为了统一处理，将数组转换为符合要求的映射关系对象
        if (Array.isArray(fields)) {
            for (let i in fields) {
                trueFields[fields[i]] = fields[i];
            }
        } else {
            trueFields = fields;
        }
        let header = that.options.header;
        if (header == null) {
            console.error("header头部不能为空");
            return;
        }
        for (let i in data) {
            let item = data[i];
            let formatData = {};
            for (let key in header) {
                let newFieldName = key;
                let oldFieldName = trueFields[key]? trueFields[key] : key;
                // 如果传入的是回调，则回调的值则为新值
                if (typeof oldFieldName == 'function' && oldFieldName.apply) {
                    formatData[newFieldName] = oldFieldName.apply(window, [item[newFieldName], item, data]);
                } else {
                    if (typeof item[oldFieldName] != 'undefined') {
                        formatData[newFieldName] = item[oldFieldName];
                    } else {
                        formatData[newFieldName] = '';
                    }
                }
            }
            exportData.push(formatData);
        }
        return exportData;
    }


    /**
     * 导出excel
     * @param data
     */
    Excel.prototype.exportExcel = function (data) {
        let that = this;
        let options = that.options;

        let fields = options.fields;

        // 如果需要格式化
        if (fields != null) {
            data = that.filterExportData(data,fields);
        }

        data.unshift(options.header);

        let filename = options.filename +"_"+ layui.util.toDateString(new Date(),"yyyyMMddHHmmss") +'.'+ options.type;

        // 创建一个 XLSX 对象
        let wb = XLSX.utils.book_new();
        wb.Props = options.props;

        // 2. 设置sheet名称
        let sheetName = options.sheetName;
        wb.SheetNames.push(sheetName);

        // 3. 分配工作表对象到 sheet
        let is_aoa = false;
        if (data.length && data[0] && $.isArray(data[0])) {
            is_aoa = true;
        }
        let ws = XLSX.utils.aoa_to_sheet(is_aoa ? data : this.filterDataToAoaData(data));
        wb.Sheets[sheetName] = ws;
        XLSX.writeFile(wb,filename)
    }

    var e = function () {}


    /**
     * 数据配置
     * @param options
     * @returns {Excel}
     */
    e.dataConfig = function (options) {
        let excel = new Excel();
        excel.options = $.extend(excel.options,options);
        return excel;
    }

    exports('excel', e);
});