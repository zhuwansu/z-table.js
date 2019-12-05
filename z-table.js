(function ($) {
    'use strict';

    function tableUtil($table) {
        this.version = 1.0;
        this.prefix = "z";
        if (!($table instanceof jQuery)) $table = $($table);
        this.$table = $table;
        this.templates = {
            tr: `<tr class="${this.prefix}"></tr>`,
            td: `<td class="${this.prefix}td"></td>`,
            opTd: `<td class="${this.prefix}op-td"></td>`,
            input: `<input class="${this.prefix}input">`,
            checkbox: `<input type="checkbox" class="${this.prefix}check"><span class="${this.prefix}check"></span>`,
            file: `<input class="${this.prefix}input" type="file">`,
            uploadImg: `<div class="${this.prefix}uploadImg"></div><input class="${this.prefix}uploadImg" type="file" multiple>`,
            textarea: `<textarea class="${this.prefix}textarea"></textarea>`,
            th: `<th></th>`,
            select: `<select class="${this.prefix}select"></select>`,
            span: `<span class="${this.prefix}span"></span>`,
            thead: `<thead><tr class="text-center"></tr></thead>`,
            a: `<a class="${this.prefix}a" href="javascript:;" ></a>`,
            add: `<a class=" ${this.prefix}add" href="javascript:;" >新增</a>`,
            del: `<a class=" ${this.prefix}del" href="javascript:;" >删除</a>`,
            br: `</br>`,
            option: `<option></option>`,
            $div: $(`<div></div>`),
            span2: `<${this.prefix}span></${this.prefix}span>`,
        };
        this.labels = {
            input: this.templates.input,
            text: this.templates.input,
            checkbox: this.templates.checkbox,
            file: this.templates.file,
            uploadImg: this.templates.uploadImg,
            textarea: this.templates.textarea,
            select: this.templates.select,
            spanInput: this.templates.input,
        };
        this.option = { debug: true }
        this.options = { appendBtn: true };
        this.rowHtml = this.$table.find('tbody').html();
        this.rowIndex = 0;
        this.events = new event();
        function event() {
            this.onAddRow = null;
            this.onFillData = null;
            this.onAppendRow = null;
            this.afterAppendBtn = null;
        }
        this.$table.find('tbody').html('');
        //注册增加和删除事件
        var that = this;
        this.$table
            .on('click', `.${this.prefix}add`, function () {
                that.addRow();
            })
            .on('click', `.${this.prefix}del`, function () {
                that.removeRow($(this));
            });
        this.countTr = function () {
            return this.$table.find('tbody>tr[rowIndex]').length;
        };
        this.generateFormItem = function (col, header) {
            var inputType = col.inputType;
            if (!col.inputType) inputType = 'spanInput';

            var name = col.name;
            var attr = col.inputAttr;
            var placeHolder = col.placeHolder;
            var data = col.data;
            if (header) {
                inputType = col.headerInput.inputType;
                name = col.headerInput.name;
                attr = col.headerInput.attr;
                placeHolder = col.headerInput.placeHolder;
                data = col.headerInput.data;
            }

            var res = $(this.labels[inputType]);
            if (attr && attr.length > 0) {
                $.each(attr, function (index, item) {
                    res.attr(item.name, item.value);
                });
            }
            res.attr('placeholder', placeHolder);
            res.attr('name', name);

            if (inputType == 'select') {
                var $option = $(this.templates.option);
                $option.val('');
                $option.html(placeHolder);
                res.append($option);
                if (data && data.length > 0) {
                    $.each(data, function (sIndex, sItem) {
                        var $option = $(that.templates.option).html(sItem.name);
                        $option.attr("value", sItem.id);
                        res.append($option);
                    });
                }
            }
            res.addClass(`${this.prefix}${inputType}`);
            return res;
        };
        this.refreshRowIndex = function () {
            while (true) {
                var last = this.$table.find('tr[rowIndex="' + this.rowIndex + '"]');
                if (last.length > 0) return last;

                this.rowIndex--;
                if (this.rowIndex < 0) {
                    break;
                }
            }
        }
        this.initRowTemplate = function (containerSelector) {
            if (containerSelector) this.rowHtml = $(containerSelector + " tbody").html();

            if (this.options && this.options.cols && this.options.cols.length > 0) {
                var $tr = $(this.templates.tr);
                var cols = this.options.cols;
                $.each(cols, function (index, col) {
                    var $td = $(that.templates.td);
                    $td.attr(`${that.prefix}columnId`, col.id);
                    $td.attr(`${that.prefix}typeId`, col.typeId);
                    $td.html(that.generateFormItem(col));
                    $tr.append($td);
                });
                this.rowHtml = $tr[0].outerHTML;
            }
        }
        this.initColumns = function (cols) {
            if (cols) this.options.cols = cols;
            var $thead = $(this.templates.thead);
            $.each(cols, function (index, col) {
                var $th = $(that.templates.th);
                var $span = $(that.templates.span);
                if (!col.displayName) {
                    col.displayName = col.name;
                }
                $span.html(col.displayName);
                $th.append($span);

                //head input
                if (col.headerInput && col.input) {
                    if (col.headerInput === true) {
                        col.headerInput = {
                            inputType: col.inputType,
                            placeHolder: col.placeHolder,
                            name: col.name,
                            data: col.data
                        };
                    } else {
                        if (!col.headerInput.name) {
                            col.headerInput.name = col.name;
                        }
                        if (!col.headerInput.inputType) {
                            col.headerInput.inputType = col.inputType;
                        }
                        if (!col.headerInput.placeHolder) {
                            col.headerInput.placeHolder = col.placeHolder;
                        }
                        if (!col.headerInput.data) {
                            col.headerInput.data = col.data;
                        }
                    }
                    var $input = that.generateFormItem(col, true);

                    $th.append(that.templates.br);
                    $th.append($input);
                }

                $thead.find('tr').append($th);
            });

            this.initRowTemplate();
            $thead.find('tr').append('<th><span>操作</span></th>>');
            this.$table.html($thead);
            return this;
        }
        this.appendBtn = function ($tr) {
            if (!$tr) $tr = this.refreshRowIndex();
            if (!$tr || !$tr.length || $tr.length == 0) return;

            var $td = $tr.find(`.${this.prefix}op-td`);
            if ($td.length == 0) {
                $td = $(this.templates.opTd);
                $tr.append($td);
            }
            $td.html('');
            var $add = $(this.templates.add);
            $td.append($add);
            $td.append(this.templates.br);
            var $del = $(this.templates.del);
            $td.append($del);

            if (this.events.afterAppendBtn) {
                this.events.afterAppendBtn(this, $add, $del);
            }
        }
        // add row and render it to html by use rowHtml
        this.addRow = function (data) {
            //check rowHtml
            if (!this.rowHtml) {
                //try init row by cols
                this.initRowTemplate();
            }

            var $row = this.doAddRow(this.rowHtml);
            if (data) {

                //行填充数据
                var $controls = $row.find(`input,select,textarea,${this.prefix}span`);
                for (var i = 0; i < $controls.length; i++) {
                    var $control = $($controls[i]);
                    var nodeName = $control.prop('nodeName').toLowerCase();
                    var name = $control.attr(this.prefix + 'name');
                    if (!name) {
                        name = $control.attr('name');
                    }
                    var value = $control.val();
                    var type = $control.attr('type');
                    var oldV;
                    var v = oldV = data[name];

                    if (nodeName == 'input' && type == 'radio') {
                        //radio
                        if (value == v) {
                            $control.attr('checked', 'checked');
                        }
                    } else if (nodeName == `${this.prefix}span`) {
                        //span
                        $control.html(v);
                    } else if (nodeName == 'input' || nodeName == 'select' || nodeName == 'textarea') {
                        // form control
                        $control.val(v);
                    }
                }
                $row.data('oldValue', data);
            }

            if (this.events.onAddRow) {
                this.events.onAddRow(this.rowIndex, $row);
            }

            return $row;
        }
        // add rows <see f: addRow>
        this.addRows = function (data) {
            if (data && data.length > 0) {
                $.each(data, function (index, item) {
                    that.addRow(item);
                });

                for (var i = 0; i < this.plugins.length; i++) {
                    var plugin = this.plugins[i];
                    if (plugin.onPostBody) {
                        plugin.onPostBody();
                    }
                }
            }
        }
        // add row by row html
        this.doAddRow = function () {
            this.rowIndex++;
            var $newRow = $(this.rowHtml);
            $newRow.attr('rowIndex', this.rowIndex);
            $newRow.addClass(this.prefix + 'tr');

            //name 增加 rowIndex
            $newRow.find(`input,select,textarea,${this.prefix}span`).attr(`${this.prefix}name`, function () {
                return $(this).attr('name');
            });
            $newRow.find(`input,select,textarea,${this.prefix}span`).attr('name', function (n, v) {
                return v + that.rowIndex;
            });
            var $tbody = this.$table.find('tbody');
            if ($tbody.length == 0) {
                $tbody = $('<tbody></tbody>');
                this.$table.append($tbody);
            }
            $tbody.append($newRow);

            //添加新行后增加新增和删除按钮
            this.appendBtn($newRow, true, true);
            return $newRow;
        }
        this.getRowIndex = function ($this) {
            var rowIndex = null;
            var step = $this;
            while (true) {
                if (!step) break;
                rowIndex = step.attr('rowIndex');
                if (rowIndex && rowIndex >= 0) {
                    return rowIndex;
                }
                step = step.parent();
            }
        }
        //remove current row
        this.removeRow = function ($this) {
            var rowIndex = this.getRowIndex($this);
            this.removeRowByIndex(rowIndex);
        }
        //removeRow by rowIndex
        this.removeRowByIndex = function (rowIndex) {
            this.$table.find(`tr[rowIndex="${rowIndex}"]`).remove();
        }
        // generate a form serialize object for every row , like this [{},{}]
        this.rows = function (onRowCallback, onFieldCallBack) {
            var params = [];
            $('tr[rowIndex]').each(function (index, item) {
                var oldValue = $(item).data('oldValue');
                var rowIndex = $(item).attr('rowIndex');
                var obj = {};
                if (oldValue) obj.id = oldValue.id;

                $.each($(item).find(`input,select,textarea,${that.prefix}span`), function (cIndex, cItem) {
                    var name = $(cItem).attr(that.prefix + 'name');

                    var val = $(cItem).val();
                    if (cItem.nodeName == `${that.prefix}span`.toUpperCase()) {
                        val = $(cItem).text();
                    }
                    if (cItem.type == 'radio') {
                        if (name && cItem.checked === true) {
                            obj[name] = val;
                        }
                    } else if (name) {
                        obj[name] = val;
                    }

                    if (onFieldCallBack) {
                        onFieldCallBack(obj, cItem);
                    }
                });


                $.extend(obj, { rowIndex: rowIndex });
                if (onRowCallback) {
                    onRowCallback(obj, $(item));
                }
                params.push(obj);
            });
            if (this.debug()) {
                console.log("table-ext.js:rows");
                console.log(JSON.stringify(params));
            }
            return params;
        }
        this.debug = function () {
            return this.options.debug;
        }
    }

    $.fn.extend({
        zTable: function () {
            return new tableUtil($(this));
        }
    });

}(window.jQuery));
