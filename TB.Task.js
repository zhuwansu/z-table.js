(function (n, t, i) {
    var u, r;
    parseFloat(jQuery.fn.jquery) < 2 && (u = n.MutationObserver || n.WebKitMutationObserver || n.MozMutationObserver ||
        function () {
            return {
                observe: function () { }
            }
        }, new u(function (n) {
            for (var r, t, i = 0, u = n.length; i < u; i++) r = n[i], r.addedNodes.length && (t = r.addedNodes[0]).tagName == "SCRIPT" && t.src && t.src.indexOf("jQuery") > -1 && (t.onerror = function () {
                return this.onload(), !1
            })
        }).observe(document.getElementsByTagName("head")[0], {
            childList: !0,
            subtree: !1,
            attributes: !1,
            characterData: !1
        }));
    r = {
        args: [],
        onRun: function () { },
        onSuccess: null,
        onError: null,
        onComplete: null,
        onProgress: null,
        interval: 0,
        filter: function (n, t) {
            return n && t == "success"
        },
        dialog: {
            options: {},
            onClose: null,
            formatter: function (n) {
                var t = n.data;
                return t || (t = {
                    Message: "\u672a\u77e5\u9519\u8bef\uff01"
                }), t.Message || t.message || t
            },
            message: !0
        }
    };
    i.task = function () {
        var a = null,
            e = 0,
            n = {},
            o = 0,
            f = {
                success: 0,
                error: 0,
                leave: e
            },
            h = null,
            u = t.Deferred(),
            y = [],
            c;
        if (arguments[0] instanceof Array && typeof arguments[1] == "function") t.extend(!0, n, r, {
            args: arguments[0],
            onRun: arguments[1]
        });
        else if (typeof arguments[0] == "object") t.extend(!0, n, r, arguments[0]);
        else throw new TypeError("\u53c2\u6570\u9519\u8bef\uff01");
        if (e = f.leave = n.args.length, c = function (t) {
            a = n.args[o];
            h = n.onRun.call(u, a, o);
            h.index = o;
            h.item = a;
            h.always(function (i, r, s) {
                f.leave--;
                if (i.Success === false) {
                    r = "error";
                }
                r === "success" && n.filter.call(u, i, r, s) === !0 ? f.success++ : (s = i, i = null, r = "error", f.error++);
                y.push(i);
                u.notify({
                    status: r,
                    total: e,
                    index: s.index,
                    data: i,
                    arg: s.item,
                    progress: f.success + f.error,
                    success: f.success,
                    error: f.error
                });
                f.leave <= 0 ? u.resolve({
                    success: f.success,
                    error: f.error,
                    total: e,
                    datas: y
                }) : t || (o++ , setTimeout(c, n.interval))
            })
        }, u.run = n.interval && n.interval > 0 ?
            function () {
                e && c()
            } : function () {
                for (; o < e; o++) c(!0)
            }, u.options = function () {
                return n
            }, n.dialog) {
            var s = t("<div><\/div>").css({
                position: "relative",
                height: "100%"
            }),
                l = t("<div><\/div>").css({
                    position: "relative",
                    padding: "10px 5px",
                    "font-weight": "bold"
                }).appendTo(s),
                v = t("<div class='scrollbar'><\/div>").css({
                    overflow: "auto",
                    "border-top": "solid 1px #ddd",
                    "line-height": "24px",
                    position: "absolute",
                    top: "38px",
                    left: "0",
                    bottom: "0",
                    right: "0",
                    padding: "0 5px",
                    display: n.dialog.message ? "block" : "none"
                }).appendTo(s);
            l.html("\u6b63\u5728\u51c6\u5907\u6267\u884c\u4efb\u52a1...");
            u.progress(function (t) {
                l.html("\u8bf7\u7a0d\u5019\uff0c\u6b63\u5728\u6267\u884c\u4efb\u52a1\uff1a" + t.progress + "/" + t.total + " ...");
                n.dialog.message && (v.append("<div>" + n.dialog.formatter.call(u, t) + "<\/div>"), v[0].scrollTop = v[0].scrollHeight)
            }).done(function (t) {
                l.html("\u6267\u884c\u5b8c\u6210\u3002<span style='color:#008000'>\u6210\u529f\uff1a" + t.success + "<\/span>\uff0c<span style='color:#f00'>\u5931\u8d25\uff1a" + t.error + "<\/span>\uff01");
                t.error > 0 && l.append('<div class="panel-tool"><a href="javascript:;" class="panel-tool-close"><\/a><\/div>').find(".panel-tool-close").click(function () {
                    n.dialog.onClose && n.dialog.onClose.call(u);
                    n.dialog.dom.dialog("close")
                })
            });
            u.dialog = function () {
                s.dialog.apply(s, arguments)
            };
            t.fn.dialog ? i.dialog(t.extend(!0, {
                width: 350,
                height: n.dialog.message ? 200 : 38
            }, n.dialog, {
                    closable: !1,
                    content: s,
                    border: !1,
                    noheader: !0,
                    style: {
                        "border-radius": 2
                    }
                })) : s.appendTo(document.body)
        }
        return n.onProgress && u.progress(n.onProgress), u.done(function (t) {
            t.error == 0 && n.onSuccess && n.onSuccess.call(u, t);
            t.error > 0 && n.onError && n.onError.call(u, t);
            n.onComplete && n.onComplete.call(u, t)
        }), u
    }
})(window, jQuery, erp);