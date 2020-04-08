var app = getApp()
Page({
    data: {
        svr_url: app.globalData.svr_url,
        svr_img_path: app.globalData.svr_img_path,
        is_show_page: 0,
        init: 0,
        is_login: 0,
    },

    onShow: function(e) {
        var that = this;
        if (this.data.init == 1) {
            if (this.data.is_login == 0) {
                app.Tologin(res =>
                    this.onLoad({})
                );
            } else {
                this.onLoad({});
            }
        }
        this.setData({
            init: 1
        });
    },

    onLoad: function(e) {
        app.getSvrData(data => {
            // console.log(data);
            this.setData({
                svr_data: data,
                nickname: data.info.nickname || '游客' + (data.info.user_id ? (' . ' + data.info.user_id) : ''),
                headimgurl: data.info.headimgurl || '../../imgs/default_head.png',
                needLogin: data.info.nickname ? true : false,
                is_login: data.is_login
            }, () => {
                this.setData({
                    is_show_page: 1
                })
            });
            if (data.is_login == 0) {
                app.Tologin(loginRes => {
                    if (loginRes == 1) {
                        this.onLoad({});
                    }
                });
            }
        }, {}, 'user');

    },


    userLogin: function(e) {
        var that = this;
        if (e.detail.errMsg != 'getUserInfo:ok' && !e.currentTarget.dataset.head) {
            that.setData({
                modalName: 'Notice'
            })
            return;
        }
        app.getUserInfo(e, function(res) {
            if (res == 1) {
                var userInfo = e.detail.userInfo;
                that.setData({
                    nickname: userInfo.nickName,
                    headimgurl: userInfo.avatarUrl
                });
            }
        });

        if (e.currentTarget.dataset.url) {
            app.location(e.currentTarget.dataset.url);
        }
    },


    location: function(e) {
        app.location(e.currentTarget.dataset.url);
    },

    save_formId: function(e) {
        app.getSvrData({}, {
            form_id: e.detail.formId
        }, 'join_tmp_msg_id', app.globalData.controller, 1);
    },

    //转发页面
    onShareAppMessage: function(res) {
        var that = this;
        var path = '/pages/home/index';
        var title = that.data.svr_data.cfg[0];
        var img = that.data.svr_url + that.data.svr_data.cfg[1];
        return {
            path: path,
            title: title,
            imageUrl: img
        }
    },

    //隐藏窗口
    hideModal(e) {
        this.setData({
            modalName: false
        })
    },

    //显示窗口
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.val
        })
    },

    showQrcode() {
        wx.previewImage({
            urls: ['https://blog.liujiayang.cn/Public/applet/img/redPacket.jpg'],
            current: 'https://blog.liujiayang.cn/Public/applet/img/redPacket.jpg' // 当前显示图片的http链接      
        })
    },

})