const app = getApp()
Page({
    data: {
        svr_url: app.globalData.svr_url,
        goTopHidden: true,
        init: 0,
        pagenum: 1,
        articles: [],
        loading: false,
        noMore: false,
        currentTab: 0,
        // is_show_page: false,
        scrollLeft: 0,
        callbackcount: 15,
        is_login: 0
    },

    onShow(e) {
        let para = {
            cate_id: this.data.currentTab
        }
        if (this.data.init == 1) {
            if (this.data.is_login == 0) {
                app.Tologin(res =>
                    this.onLoad(para)
                );
            } else {
                this.onLoad(para);
            }
        }
        this.setData({
            init: 1
        });
    },

    onLoad(e) {
        app.getSvrData(data => {
            let articlesList = this.data.articles;
            this.setData({
                svr_data: data,
                articles: data.articles,
                is_login: data.is_login,
                loading: false
            }, () => {
                this.setData({
                    is_show_page: true,
                })
            })

            if (data.is_login == 0) {
                app.Tologin();
            }

        }, e, 'article_list')

    },

    // //上拉加载
    // onReachBottom: function() {
    //     var that = this;
    // },

    //下拉刷新
    onPullDownRefresh() {
        wx.showNavigationBarLoading();
        var para = {
            cate_id: this.data.currentTab,
        }
        this.onLoad(para);
        wx.stopPullDownRefresh() //停止下拉刷新
        setTimeout(function() {
            wx.hideNavigationBarLoading()
        }, 1500);
    },


    //转发页面
    onShareAppMessage(res) {
        var path = '/pages/home/index';
        var title = this.data.svr_data.cfg[0];
        var img = this.data.svr_url + this.data.svr_data.cfg[1];
        return {
            path: path,
            title: title,
            imageUrl: img
        }
    },



    //监听页面位置
    onPageScroll(e) {
        if (e.scrollTop > 200) {
            this.setData({
                goTopHidden: false
            });
        } else {
            this.setData({
                goTopHidden: true
            });
        }
    },


    //回到顶部
    goTop(e) { // 一键回到顶部
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 400
            })
        }
    },


    // 点击标题切换当前页时改变样式
    check_cate(e) {
        var cur = e.currentTarget.dataset.current;
        var index = e.currentTarget.dataset.currentindex;
        if (this.data.currentTaB == cur) {
            return false;
        } else {
            this.setData({
                currentTab: cur,
                currentIndex: index
            })
        }
        var para = {
            cate_id: this.data.currentTab
        }
        this.onLoad(para);
    },


    longPress(e) {
        var title = 'Hello';
        var image = '../../imgs/kiss.png';
        wx.showToast({
            title: title,
            image: image,
            icon: 'none',
            duration: 2000
        })
    },

    toArticle(e) {
        var a_id = e.currentTarget.dataset.a_id;
        app.location("../home/article?a_id=" + a_id)
    }

})