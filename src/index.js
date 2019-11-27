var Bagpipe = require('bagpipe')
var fs = require("fs");
var request = require("request");

var bou = [113.68652, 30.00000, 122.29980, 36.08462];//下载范围
var Minlevel = 1;//最小层级
var Maxlevel = 16;//最大层级
var token = 'a4ee5c551598a1889adfabff55a5fc27';//天地图key
var zpath = './tiles' // 瓦片目录
var speed = 100;//并发数
var mapstyle = 'img_w';//地图类型(img_w:影像底图 cia_w:影像标注 vec_w:街道底图 cva_w街道标注)


var all = [];
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
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 UBrowser/4.0.3214.0 Safari/537.36"
]


/**
 * 计算经纬度转换成瓦片坐标
 * @param {Number} lng 经度 
 * @param {Number} lat 纬度
 * @param {Number} level 层级 
 */
function calcXY(lng, lat, level) {
    let x = (lng + 180) / 360
    let title_X = Math.floor(x * Math.pow(2, level))
    let lat_rad = lat * Math.PI / 180
    let y = (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2
    let title_Y = Math.floor(y * Math.pow(2, level))
    return { title_X, title_Y }
}
/**
 * 计算每个层级的瓦片坐标
 * @param {Arr} bounding 范围
 * @param {Number} Minlevel 最小层级
 * @param {Number} Maxlevel 最大层级
 */
function mainnAllXY(bounding, Minlevel, Maxlevel) {
    for (i = Minlevel; i <= Maxlevel; i++) {
        alli = {}
        let p1 = calcXY(bounding[2], bounding[3], i);
        let p2 = calcXY(bounding[0], bounding[1], i);
        alli.t = i // 层级
        alli.x = [p2.title_X, p1.title_X] // 瓦片横坐标范围（左至右）
        alli.y = [p1.title_Y, p2.title_Y] // 瓦片纵坐标范围（下至上）
        all.push(alli)
    }

    createDir()
}
mainnAllXY(bou, Minlevel, Maxlevel)

function createDir() {
    fs.access(zpath, fs.constants.F_OK, err => {
        // 创建tiles文件夹
        if (err) fs.mkdir(zpath, err => { })
        for (let z = 0; z <= all.length - 1; z++) {
            fs.access(`${zpath}/${all[z].t}`, fs.constants.F_OK, err => {
                // 创建tiles/Z文件夹 ,Z是层级
                if (err) fs.mkdir(`${zpath}/${all[z].t}`, err => { })
                for (let x = all[z].x[0]; x <= all[z].x[1]; x++) {
                    fs.access(`${zpath}/${all[z].t}/${x}`, fs.constants.F_OK, err => {
                        // 创建tiles/Z/X文件夹 ,X是瓦片横坐标
                        if (err) fs.mkdir(`${zpath}/${all[z].t}/${x}`, err => { })
                    })
                }
            })
        }
        // 文件夹可能较多，等待2s开始下载
        setTimeout(() => {
            task()
        }, 2000)
    })
}

/**
 * 创建下载队列
 */

var sum = 0;
var bag = new Bagpipe(speed, { timeout: 1000 })
function task() {
    for (let z = 0; z <= all.length - 1; z++) {
        for (let x = all[z].x[0]; x <= all[z].x[1]; x++) {
            for (let y = all[z].y[0]; y <= all[z].y[1]; y++) {
                // 将下载任务推入队列
                ++sum
                bag.push(download, x, y, all[z].t)
            }
        }
    }
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
        console.log(`图片下载成功,第${z}层`)
        console.log(--sum)
    }).on('error', (err) => {
        console.log('发生异常:', err);
    }));
}
