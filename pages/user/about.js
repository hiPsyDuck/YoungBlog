var app = getApp()
Page({
	data: {
		svr_url: app.globalData.svr_url,
		svr_img_path: app.globalData.svr_img_path,
		is_show_page: 0,
	},

	onLoad: function (e) {
		this.setData({
			is_show_page: 1,
		});
	},






})