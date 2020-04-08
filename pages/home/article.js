const app = getApp()
Page({
    data: {
        svr_url: app.globalData.svr_url,
        controller: app.globalData.controller,
        is_show_page: false,
        collection: 0,
        init: 0,
        is_login: 0,
        commentHidden: 0,
        svr_data: {
            comment_list: true
        },
        article: {},
        isIPX: app.globalData.isIPX,
    },

    onShow: function(e) {
        if (this.data.init == 1) {
            if (this.data.is_login == 0) {
                app.Tologin(res =>
                    this.onLoad(this.data.gets)
                );
            } else {
                this.onLoad(this.data.gets);
            }
        }
        this.setData({
            init: 1
        });
    },

    onLoad: function(e) {
        var that = this;
        app.getSvrData(function(data) {
            //将markdown内容转换为towxml数据
            let mdata = app.towxml.toJson(
                data.info.contents, // `markdown`或`html`文本内容
                'markdown' // `markdown`或`html`
            );

            //前台初始化小程序数据
            mdata = app.towxml.initData(mdata, {
                base: app.globalData.svr_url, // 需要解析的内容中相对路径的资源`base`地址
                app: that // 传入小程序页面的`this`对象，以用于音频播放器初始化
            });

            //设置文档显示主题，默认'light'
            mdata.theme = 'light';

            that.setData({
                svr_data: data,
                is_show_page: true,
                collection: data.collection,
                article: mdata,
                gets: e,
                is_login: data.is_login,
                needLogin: data.userInfo.nickname ? true : false,
            }, function() {
                var query = wx.createSelectorQuery();
                query.select('#comment_view').boundingClientRect(function(res) {
                    // console.log(res);                    
                    that.setData({
                        comment_top: res.top
                    })
                }).exec()

            });

            if (data.is_login == 0) {
                app.Tologin(function(res) {
                    if (res == 1) {
                        that.onLoad(e)
                    }
                })
            }

        }, e, 'article_info')
    },


    userLogin: function(e) {
        var that = this;
        if (e.detail.errMsg != 'getUserInfo:ok') {
            that.setData({
                is_modal: true,
            })
            return;
        }
        app.getUserInfo(e, function(res) {
            if (res == 1) {
                that.setData({
                    needLogin: true
                });
                if (e.currentTarget.dataset.type == 1) {
                    that.setData({
                        commentHidden: that.data.commentHidden == 1 ? 0 : 1,
                        phText: ''
                    })
                } else if (e.currentTarget.dataset.type == 2) {
                    that.collection({});
                } else if (e.currentTarget.dataset.type == 3) {
                    that.resendComment(e);
                }
            }
        });

    },


    //返回上一级
    back: function() {
        var pagelist = getCurrentPages();
        if (pagelist.length > 1) {
            wx.navigateBack({
                delta: 1
            })
        } else {
            wx.switchTab({
                url: 'index',
            })
        }
    },

    comment: function() {
        this.setData({
            commentHidden: this.data.commentHidden == 1 ? 0 : 1,
            phText: '',
            is_modal: false
        })
    },

    submit_comment: function(e) {
        var that = this;
        var para = {
            comments: e.detail.value.comments
        }
        para.formId = e.detail.formId;
        para.a_id = that.data.svr_data.info.a_id;
        para.phText = that.data.phText ? that.data.phText : '';
        that.setData({
            commentHidden: 0,
        })
        if (!para.comments.trim()) {
            that.setData({
                notice: '你还没有填写评论哦',
                is_modal: true
            })
            return false;
        }
        app.getSvrData(function(data) {
            if (data.cid) {
                that.onLoad(para);
            }
        }, para, 'submit_comment')
    },

    toComment: function(e) {
        wx.pageScrollTo({
            scrollTop: this.data.comment_top,
            duration: 400
        })
    },

    //收藏
    collection: function(e) {
        var that = this;

        var para = {
            a_id: that.data.svr_data.info.a_id
        }
        para.collection = that.data.collection == 0 ? 1 : 0;
        app.getSvrData(function(data) {
            // that.onLoad(that.data.gets)
            that.setData({
                collection: para.collection
            })
            wx.showToast({
                title: para.collection == 1 ? '收藏成功' : '取消收藏',
                icon: 'none',
                duration: 1000
            })
        }, para, 'collection')
    },

    //转发
    onShareAppMessage: function(res) {
        var that = this;
        return {
            title: that.data.svr_data.info.title,
            path: '/pages/home/article?a_id=' + that.data.svr_data.info.a_id,
            imageUrl: that.data.svr_url + that.data.svr_data.info.img,
        }
    },

    //长按回复
    resendComment: function(e) {
        var that = this;
        var nickname = e.currentTarget.dataset.title;
        that.setData({
            commentHidden: 1,
            phText: "回复 @" + nickname + "："
        })
    },

    //隐藏窗口
    hideModal(e) {
        this.setData({
            is_modal: false
        })
    },




})