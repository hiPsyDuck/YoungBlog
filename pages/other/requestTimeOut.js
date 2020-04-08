var app = getApp()
Page({
    data: {
        loading: false
    },

    onLoad: function(e) {
        var that = this;
        that.setData({
            url: e.url,
            url_type: e.type
        });
    },

    connet: function() {
        var that = this;
        that.setData({
            loading: true
        })
        app.getSvrData(function(data) {
            if (data.is_login == 1) {
                app.clo_href('/' + that.data.url);
				that.setData({
					loading: false
				})
            }else{
				app.Tologin(function(data){
					if(data==1){
						app.clo_href('/' + that.data.url);
						that.setData({
							loading: false
						})
					}
				});
			}
        }, {}, 'connet')
    }

})