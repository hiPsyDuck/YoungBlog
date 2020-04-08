var app = getApp()
Page({
    data: {
        svr_url: app.globalData.svr_url,
        controller: app.globalData.controller,
        is_show_page: false,
        list: true,
    },

    onLoad: function(e) {
        var that = this;
        app.getSvrData(function(data) {
            that.setData({
                svr_data: data,
                list: data.list,
            }, function() {
                that.setData({
                    is_show_page: true,
                })
            })
        }, e, 'collection_list')
    },

    location: function(e) {
        app.location('../home/article?a_id=' + e.currentTarget.dataset.a_id);
    },
    //转发
    onShareAppMessage: function(e) {
        var that = this;
        var title = e.target.dataset.title;
        var img = e.target.dataset.img;
        var a_id = e.target.dataset.a_id;
        return {
            title: title,
            path: '/pages/home/article?a_id=' + a_id,
            imageUrl: that.data.svr_url + img,
        }
    },


    //确认删除
    deleteThis(e) {
        var that = this;
        var para = {
            collection: 0
        }
        para.a_id = e.currentTarget.dataset.a_id;
        var list = that.data.list;
        app.getSvrData(function(data) {
            list.splice(e.currentTarget.dataset.indexdel, 1); //截取指定的内容
            that.setData({
                list: list.length > 0 ? list : false,
            }) //重新渲染列表
        }, para, 'collection');

    },

    // ListTouch触摸开始
    ListTouchStart(e) {
        this.setData({
            ListTouchStart: e.touches[0].pageX
        })
    },

    // ListTouch计算方向
    ListTouchMove(e) {
        this.setData({
            ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
        })
    },

    // ListTouch计算滚动
    ListTouchEnd(e) {
        if (this.data.ListTouchDirection == 'left') {
            this.setData({
                modalName: e.currentTarget.dataset.target
            })
        } else {
            this.setData({
                modalName: null
            })
        }
        this.setData({
            ListTouchDirection: null
        })
    },


})