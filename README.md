# YoungBlog
微信小程序版博客**（以上源码只包含小程序部分，后台需要自己搭建）**

## 微信扫码预览

![QRCode](https://www.liujiayang.cn/psyduck/gh_81a98266fb8e_344.jpg)

## 截图预览

![pic](https://www.liujiayang.cn/psyduck/1.jpg)
![pic](https://www.liujiayang.cn/psyduck/2.jpg)
![pic](https://www.liujiayang.cn/psyduck/3.jpg)

### 搭建：

app.js 文件内：

```
globalData: {
    svr_url: '', //填入服务器域名
    svr_img_path: '', //服务端图片路径（纯路径不包含域名）
    controller: '', //路由控制器
    loginApi: '', //登录接口（函数）（不包含域名）
},
```
