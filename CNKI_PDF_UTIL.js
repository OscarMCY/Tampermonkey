// ==UserScript==
// @id             CNKI_PDF_Supernova
// @name           知网PDF下载助手
// @version        2.1.0
// @namespace      https://github.com/supernovaZhangJiaXing/Tampermonkey/
// @author         Supernova
// @description    直接以PDF格式下载知网上的文献, 包括期刊论文和博硕士论文
// @include        http*://*.cnki.net/*
// @include        http*://*.cnki.net.*/*
// @include        */kns/brief/*
// @include        */kns55/brief/*
// @include        */grid2008/brief/*
// @include        */detail/detail.aspx*
// @exclude        http://image.cnki.net/*
// @run-at         document-idle
// @grant          none
// ==/UserScript==

var isDetailPage = false;
var isCNKIPage = false;
var myurl = window.location.href;

// isDetailPage: 点进文献后的详情页
if (myurl.indexOf("detail.aspx") != -1) {
    isDetailPage = true;
}
// isNewPage: 是知网页面(谁从杂牌网站下载(╯‵□′)╯︵┻━┻)
if (document.title.indexOf(" - 中国知网") != -1) {
    isCNKIPage = true;
}

var allLinks = document.evaluate(
    '//a[@href]',
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null);

// 如果不是详情页, 即在搜索页面直接点右面的下载图标, 把点击后发送的get请求的dflag参数内容改为"pdfdown"就可以了(知网老贼你以为隐藏起来我就找不到了?)
if (isDetailPage === false) {
    // TODO: 感觉是可以优化的
    for (var i = 0; i < allLinks.snapshotLength; i++) {
        var thisLink = allLinks.snapshotItem(i);
        // 超链接是存在的
        if (thisLink.href) {
            // 超链接是文献的下载链接
            if (thisLink.href.includes("download.aspx?filename=")) {
                // <code>&dflag</code>是get请求的参数之一
                if (thisLink.href.indexOf("&dflag") != -1) {
                    thisLink.href = thisLink.href.replace("nhdown", "pdfdown");
                } else {
                    // 也有可能没有(但好像一般会有啊)
                    thisLink.href = thisLink.href + "&dflag=pdfdown";
                }
                //把按钮变一下颜色表示现在是PDF了
                thisLink.classList.remove('briefDl_Y');
                thisLink.classList.add('briefDl_D');
            }
        }
    }
}
// 如果进了详情页, 博硕士论文下面会出现四个按钮, 期刊论文下会有三个按钮
else {
    // 只对"博硕论文"详情页做优化, 否则影响期刊页面的显示
    if (isCNKIPage === true && document.getElementById("catalog_Ptitle").innerHTML == "博硕论文") {
        ////////////////////////// downloadpart是正文的部分
        var downloadpart = document.getElementById("DownLoadParts");
        // 整本下载的按钮
        var dlcaj = downloadpart.childNodes[0];
        // 修改内容和外观
        dlcaj.innerHTML = dlcaj.innerHTML.replace("整本", "CAJ");
        dlcaj.classList.add('icon-dlcaj');
        dlcaj.classList.remove('icon-dlGreen');
        // 获得pdf的链接
        var pdf_link = dlcaj.href.replace("nhdown", "pdfdown");
        // 分页下载的按钮
        var dlpdf = downloadpart.childNodes[1];
        // 修改内容和外观
        dlpdf.innerHTML = dlpdf.innerHTML.replace("分页", "PDF");
        dlpdf.href = pdf_link;
        dlpdf.classList.add('icon-dlpdf');
        dlpdf.classList.remove('icon-dlBlue');
        // 分章下载可以用来获取目录
        var dlChapter = downloadpart.childNodes[2];
        dlChapter.innerHTML = dlChapter.innerHTML.replace("分章", "目录");
        dlChapter.classList.add('icon-dlcrsp');
        dlChapter.classList.add('xml');
        dlChapter.classList.remove('icon-dlBlue');
        // 本来想做个ajax直接下载目录的, 发现不会写, 只能先跳转了
//         // 目录页面的链接
//         var cnt_link = dlChapter.href;
//         // 获取页面目录信息并写入文本文件
//         dlChapter.onclick=function(){
//             // 没做IE6, IE5检查, 因为用脚本的估计没有上古IE用户
//             var xmlhttp = new XMLHttpRequest();
//             xmlhttp.onreadystatechange=function() {
//                 if (xmlhttp.readyState==4 && xmlhttp.status==200) {
//                     console.log("我不知道该说什么, 先给大家拜个早年吧");
//                 }
//             }
//             // 页面跳转了
//             // href指向: /kns/download.aspx?filename=INDathWM4xke1k0QHRWTyN2UzFUctNmNQdkb2knRoNlTPd0aEpVcrt2VyN1KVFzU29GSSJEbRVmdZhFZkhnbxkUOp1ERiZEZhp0dTdDS5skUCRVMwEjZVVzLEF0LvZ3KWt2Ri9SWTBXY2plQadTdzxkVHFzMrtyQ&dflag=catalog&tablename=CDFDLAST2019&uid=WEEvREcwSlJHSldRa1FhcTdWa2FjR2F5a0d0dXBKMUw5SkR0NG9pWUFNMD0=$9A4hF_YAuvQ5obgVAqNKPCYcEjKensW4IQMovwHtwkF4VYPoHbKxJw!!
//             // 新页面: https://kdoc.cnki.net/kdoc/download.aspx?filename=INDathWM4xke1k0QHRWTyN2UzFUctNmNQdkb2knRoNlTPd0aEpVcrt2VyN1KVFzU29GSSJEbRVmdZhFZkhnbxkUOp1ERiZEZhp0dTdDS5skUCRVMwEjZVVzLEF0LvZ3KWt2Ri9SWTBXY2plQadTdzxkVHFzMrtyQ&dflag=catalog&tablename=CDFDLAST2019&uid=WEEvREcwSlJHSldRa1FhcTdWa2FjR2F5a0d0dXBKMUw5SkR0NG9pWUFNMD0=$9A4hF_YAuvQ5obgVAqNKPCYcEjKensW4IQMovwHtwkF4VYPoHbKxJw!!&t=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBpZCI6IjI5MjU4IiwidGltZXN0YW1wIjoxNTcwODYyNzg0LCJub25jZSI6IlJiUmVLV1JpNU4ifQ.TF0oshJiESmtvyTn-FYG9UHKkdiYaWwi8lM5IukEpnM
//             var new_link = "http://kdoc.cnki.net/kdoc" + cnt_link.substring(cnt_link.indexOf("kns/", cnt_link) + 3, cnt_link.length);
//             console.log(new_link);
// //             xmlhttp.open("GET", new_link, true);
//             xmlhttp.open("POST", cnt_link, true);
//             xmlhttp.send();
//         };
        // 在线阅读的按钮
        var readonline = downloadpart.childNodes[3];
        // 修改外观
        readonline.classList.add('icon-phone');
        readonline.classList.add('xml');
        readonline.classList.remove('icon-dlGreen');

        ////////////////////////// dllink是底栏的部分
        var dllink = document.getElementById("wxDlToolbar").childNodes[1].childNodes[1];
        // 整本下载的按钮
        dlcaj = dllink.childNodes[0];
        // 修改内容和外观
        dlcaj.innerHTML = dlcaj.innerHTML.replace("整本", "CAJ");
        dlcaj.classList.add('icon-dlcaj');
        dlcaj.classList.remove('icon-dlGreen');
        // 分页下载的按钮
        dlpdf = dllink.childNodes[1];
        // 修改内容和外观
        dlpdf.innerHTML = dlpdf.innerHTML.replace("分页", "PDF");
        dlpdf.href = pdf_link;
        dlpdf.classList.add('icon-dlpdf');
        dlpdf.classList.remove('icon-dlBlue');
        // 分章下载可以用来获取目录
        dlChapter = dllink.childNodes[2];
        dlChapter.innerHTML = dlChapter.innerHTML.replace("分章", "目录");
        dlChapter.classList.remove('icon-dlBlue');
        dlChapter.classList.add('icon-dlcrsp');
        dlChapter.classList.add('xml');
        // 在线阅读的按钮
        readonline = dllink.childNodes[3];
        // 修改外观
        readonline.classList.add('icon-phone');
        readonline.classList.add('xml');
        readonline.classList.remove('icon-dlGreen');
    }
}

// 下面是在目录页面加一个下载按钮
if (myurl.includes("kdoc")) {
    var title = document.getElementsByClassName("DBlueText")[0];
    var downCnt = document.createElement("button");
    downCnt.innerHTML = "下载目录索引";
    downCnt.id = "downCnt";
    downCnt.style = "height: 32px; padding: 0 15px; background-color: #1890ff; border-color: #1890ff; color: #fff; font-size: 14px; border-radius: 4px; text-shadow: 0 -1px 0 rgba(0,0,0,0.12); box-shadow: 0 2px 0 rgba(0,0,0,0.045); margin: 10px";
    downCnt.onclick = function() {
        var cnt_list = document.getElementById("downCnt").nextSibling.childNodes[1].childNodes;
        // 要写的内容
        var contents = "";
        for (var i = 0; i < cnt_list.length - 1; i++) { // 长度减一, 因为最后一个是text(???这又是什么神仙操作)
            var cnt_item = cnt_list[i].childNodes[1].childNodes[1];
            cnt_item = cnt_item.innerHTML;
            var cnt_page = cnt_list[i].childNodes[3].childNodes[0].textContent.trim().split("-")[0]; // 知网的目录给的是个范围, 正常只需要前半部分
            contents = contents + cnt_item.trim().replace(/&nbsp;/g, " ") + "\t" + cnt_page + "\r\n";
        }
        var data = new Blob([contents],{type:"text/plain; charset=UTF-8"});
        var downloadUrl = window.URL.createObjectURL(data);
        var anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.download = "目录索引_" + title.innerHTML.trim().replace(/&nbsp;/g, "");
        anchor.click();
        window.URL.revokeObjectURL(data);
        window.alert("目录索引已保存, 请使用FreePic2Pdf软件将目录整合到PDF中");
    };
    title.parentElement.insertBefore(downCnt, title.nextElementSibling);
}
