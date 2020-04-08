const Towxml = require('./towxml/main'); // 引入towxml库

App({
    globalData: {
        svr_url: '',
        svr_img_path: '',
        controller: '',
        loginApi: '',
        isIPX: false, // 当前设备是否为 iPhone X
    },

    onLaunch: function(e) {
        //检查更新
        this.updataApp()

        // 判断设备是否为 iPhone X
        this.checkIsIPhoneX()
    },

    updataApp: function() {
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function(res) {
                if (res.hasUpdate) { // 请求完新版本信息的回调
                    updateManager.onUpdateReady(function() {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启小程序？',
                            success: function(res) {
                                if (res.confirm) { // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function() {
                        wx.showModal({ // 新的版本下载失败
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                        })
                    })
                }
            })
        } else {
            wx.showModal({ // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
                title: '提示',
                content: '当前微信版本过低，可能导致部分功能无法使用，请升级到最新微信版本后重试。'
            })
        }
    },

    towxml: new Towxml(), //创建towxml对象，供小程序页面使用

    //用户登录（成功返回1，失败返回-1）
    onlogin: function(cb) {
        var that = this;
        //检查登录态是否已过期
        wx.checkSession({
            success: function() {
                //登录态未过期，判断session_3rd是否存在
                if (that.getCache('session_3rd') == '') {
                    that.Tologin(function(data) {
                        cb(data);
                    });
                } else {
                    cb(1);
                }

            },

            fail: function() {
                //登录态过期，重新登录
                that.Tologin(function(data) {
                    cb(data);
                });

            }

        })

    },


    //登录过程（成功返回1，失败返回-1）
    Tologin: function(cb) {
        var that = this;
        wx.login({
            success: function(res) {
                if (res.code) {
                    wx.request({
                        url: that.globalData.svr_url + loginApi,
                        method: 'POST',
                        data: res,
                        header: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        success: function(result) {
                            // console.log(result);
                            if (result.data.no == 1) {
                                that.setCache("session_3rd", result.data.msg);
                            }
                            typeof cb == 'function' && cb(result.data.no);
                        },
                        fail: function(fresult) {
                            console.log('登录失败');
                        }
                    })
                } else {
                    console.log('登录失败' + res.errMsg)
                }
            }
        });
    },



    //向服务器请求数据
    getSvrData: function(cb = '', para = {}, action = 'index', controller = 'V1', is_show = 1, url = '', titles = '加载中') {
        var that = this;
        is_show || wx.showLoading({
            title: titles,
            mask: true
        });
        wx.getNetworkType({
            success: function(netres) {
                // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                var networkType = netres.networkType
                if (networkType == 'none') {
                    var url = getCurrentPages()[0]['route'];
                    if (url != "pages/other/requestTimeOut") {
                        that.href("/pages/other/requestTimeOut?url=" + url + "&type=1");
                    }
                }
            }
        })
        para.session_3rd = that.getCache('session_3rd');
        // console.log(para);
        wx.request({
            url: that.globalData.svr_url + '/Applet/' + controller + '/' + action,
            method: 'POST',
            data: para,
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function(res) {
                if (res.statusCode == 200) {
                    if (res.data.no == 1) {
                        is_show || wx.hideLoading();
                        typeof cb == "function" && cb(res.data.msg); //获取服务器数据正常
                    } else {
                        wx.hideLoading();
                        if (typeof res.data.msg == 'string') {
                            that.alert(res.data.msg, function() {
                                url && that.clo_href(url);
                            });
                        } else {
                            that.alert('服务器繁忙~');
                        }
                    }
                } else {
                    that.show_notice('网络出错~');
                }
            },
            fail: function(fres) {
                var url = getCurrentPages()[0]['route'];
                if (url != "pages/other/requestTimeOut") {
                    that.href("/pages/other/requestTimeOut?url=" + url + "&type=2");
                }
            }
        })
    },


    getUserInfo(e, cb) {
        var that = this;
        if (e.detail.errMsg == 'getUserInfo:ok') {
            var userInfo = e.detail.userInfo;
            that.getSvrData(function(res) {
                typeof cb == "function" && cb(res);
            }, userInfo, 'updUserInfo');
        }
    },

    navTo: function(url) {
        var that = this;
        that.onlogin(function(data) {
            if (data == 1) {
                that.href(url);
            }
        });
    },
    //显示系统提示
    show_notice: function(title = '', ms = 3000) {
        wx.showLoading({
            title: title,
            mask: true,
        })
        setTimeout(function() {
            wx.hideLoading()
        }, ms)
    },

    //弹框
    alert: function(content, cb, title = '') {
        wx.showModal({
            title: title,
            content: content,
            showCancel: false,
            success: function(res) {
                typeof cb == 'function' && cb();
            }
        })
    },

    //确认提示框
    confirm: function(title = '确定进行此操作？', cb1, cb2) {
        wx.showModal({
            title: title,
            content: '',
            showCancel: true,
            success: function(res) {
                if (res.confirm) {
                    typeof cb1 == 'function' && cb1();
                } else if (res.cancel) {
                    typeof cb2 == 'function' && cb2();
                }
            }

        })
    },

    //设置本地缓存
    setCache: function(key, val) {
        wx.setStorageSync(key, val);
    },

    //获取本地缓存
    getCache: function(key) {
        var val = wx.getStorageSync(key);
        return val ? val : '';
    },

    //删除本地缓存
    delCache: function(key) {
        try {
            wx.removeStorageSync(key)
        } catch (e) {
            return;
        }
    },

    //新窗口跳转
    location: function(url) {
        wx.navigateTo({
            url: url
        })
    },

    //本窗口跳转
    href: function(url) {
        wx.redirectTo({
            url: url
        })
    },

    //关闭所有页面，跳转到指定页面
    clo_href: function(url) {
        wx.reLaunch({
            url: url
        });
    },

    back: function(num = 1) {
        wx.navigateBack({
            delta: num
        })
    },

    //返回上一个页面，并携带参数
    backToData: function(data = {}) {
        var pagelist = getCurrentPages();
        if (pagelist.length > 1) {
            var prePage = pagelist[pagelist.length - 2];
            prePage.getBackData(data);
            wx.navigateBack({
                delta: 1
            })
        }
    },

    //获取当前页带参数的url
    pageNowUrl: function() {
        var pages = getCurrentPages() //获取加载的页面
        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        var url = currentPage.route //当前页面url
        var options = currentPage.options //如果要获取url中所带的参数可以查看options

        //拼接url的参数
        var urlWithArgs = url + '?'
        for (var key in options) {
            var value = options[key]
            urlWithArgs += key + '=' + value + '&'
        }
        urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
        return urlWithArgs
    },

    checkIsIPhoneX: function() {
        const self = this
        wx.getSystemInfo({
            success: function(res) {
                // 根据 model 进行判断
                if (res.model.search('iPhone X') != -1) {
                    self.globalData.isIPX = true
                }
            }
        })
    },


})