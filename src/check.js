var Bagpipe = require('bagpipe')
var fs = require('fs');
var path = require('path');
var request = require("request");
var speed = 200;//并发数
var mapstyle = 'img_w';//地图类型
var token = 'a4ee5c551598a1889adfabff55a5fc27';//天地图key
var zpath = './tiles' // 瓦片目录
//解析需要遍历的文件夹，我这以E盘根目录为例
var filePath = './tiles'

var user_agent_list_2 = [
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0",
    "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)",
    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E; LBBROWSER)",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.84 Safari/535.11 SE 2.X MetaSr 1.0",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SV1; QQDownload 732; .NET4.0C; .NET4.0E; SE 2.X MetaSr 1.0)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Maxthon/4.4.3.4000 Chrome/30.0.1599.101 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 UBrowser/4.0.3214.0 Safari/537.36",
]

//调用文件遍历方法
fileDisplay(filePath);
var sum = 0;
var bag = new Bagpipe(speed, { timeout: 1000 })
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err)
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn('获取文件stats失败');
                    } else {
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if (isFile) {
                            if (stats.size == 0) {
                                console.log(filedir, stats.size);
                                let fileArr = filedir.split("\\");
                                let fileArrthree = fileArr[3].split('.')[0];
                                bag.push(download, fileArr[2], fileArrthree, fileArr[1])
                                console.log(`检查出第${++sum}图片`)
                            }
                        }
                        if (isDir) {
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}
/**
 * 下载图片方法
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 */
function download(x, y, z) {
    var ts = Math.floor(Math.random() * 8)//随机生成0-7台服务器
    let imgurl = `http://t${ts}.tianditu.gov.cn/DataServer?T=${mapstyle}&x=${x}&y=${y}&l=${z}&tk=${token}`;
    var ip = Math.floor(Math.random() * 256)//随机生成IP迷惑服务器
        + "." + Math.floor(Math.random() * 256)
        + "." + Math.floor(Math.random() * 256)
        + "." + Math.floor(Math.random() * 256)
    var v = Math.floor(Math.random() * 9)
    var options = {
        method: 'GET',
        url: imgurl,
        headers: {
            'User-Agent': user_agent_list_2[v],
            'X-Forwarded-For': ip,
            "Connection": 'keep-alive'

        },
        timeout: 5000,
        forever: true
    };

    request(options, (err, res, body) => {
        if (err) {
            bag.push(download, x, y, z)
            console.log("request错误", err)
        }
    }).pipe(fs.createWriteStream(`${zpath}/${z}/${x}/${y}.png`).on('finish', () => {
        console.log(`错误图片下载剩余:${--sum}`)
    }).on('error', (err) => {
        console.log('发生异常:', err);
    }));
}