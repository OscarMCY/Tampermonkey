// ==UserScript==
// @id             CNKI_PDF_Supernova
// @name           知网PDF下载助手
// @version        1.1.0
// @namespace      https://github.com/supernovaZhangJiaXing/Tampermonkey/
// @author         Supernova
// @description    直接以PDF格式下载知网上的文献, 包括期刊论文和博硕士论文
// @include        *://*.cnki.net/*
// @include        *://*.cnki.net.*/*
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
    // 杂牌网站就是这个待遇
    if (isCNKIPage === false) {
        window.alert("建议移步CNKI主站下载");
    }
    else {
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
        // 分章下载我觉得没什么用所以我就替你们删掉了_(:з」∠)_
        downloadpart.removeChild(downloadpart.childNodes[2]);
        // 在线阅读的按钮
        var readonline = downloadpart.childNodes[2];// 这里因为我们已经删掉了“分章下载”，“在线阅读”就变成第2个子结点了
        // 修改外观
        readonline.classList.add('icon-dlcrsp');
        readonline.classList.add('xml');
        readonline.classList.remove('icon-dlGreen');
        //
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
        // 分章下载我觉得没什么用所以我就替你们删掉了_(:з」∠)_
        dllink.removeChild(dllink.childNodes[2]);
        // 在线阅读的按钮
        readonline = dllink.childNodes[2];// 同上, “在线阅读”是第2个子结点
        // 修改外观
        readonline.classList.add('icon-dlcrsp');
        readonline.classList.add('xml');
        readonline.classList.remove('icon-dlGreen');
    }
}
