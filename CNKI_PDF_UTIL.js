// ==UserScript==
// @id             CNKI_PDF_Supernova
// @name           中国知网PDF下载助手
// @version        1.0.2
// @namespace      http://
// @author         Supernova
// @description    直接以PDF格式下载知网上的文献, 包括期刊论文和博硕士论文
// @include        http://*.cnki.net/*
// @include        http://*.cnki.net.*/*
// @include        */kns/brief/*
// @include        */kns55/brief/*
// @include        */grid2008/brief/*
// @include        */detail/detail.aspx*
// @exclude        http://image.cnki.net/*
// @run-at         document-idle
// @grant          none
// @supportURL
// ==/UserScript==

var allLinks, allLis, thisLi, newLi, aPDF, bPDF, thisLink;
var isDetailPage = false;
var isCNKIPage = false;
var myurl = window.location.href;

allLinks = document.evaluate(
    '//a[@href]',
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null);

allLis = document.evaluate(
    "//li[@class]",
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null);

// isDetailPage: 点进文献后的详情页
if (myurl.indexOf("detail.aspx") != -1) {
    isDetailPage = true;
}
// isNewPage: 是知网页面(谁从杂牌网站下载(╯‵□′)╯︵┻━┻)
if (document.title.indexOf(" - 中国知网") != -1) {
    isCNKIPage = true;
}

// 如果不是详情页, 即在搜索页面直接点右面的"下载", 把点击后发送的get请求的dflag参数内容改为"pdfdown"就可以了(知网老贼你隐藏起来就以为我找不到了?)
if (isDetailPage === false) {
    // TODO: 这部分之后有时间优化一下, 主要从XPath结点搜索的方式，让它只搜索一列下载链接，而不是所有链接
    for (var i = 0; i < allLinks.snapshotLength; i++) {
        thisLink = allLinks.snapshotItem(i);
        // 超链接是存在的
        if (thisLink.href) {
            // 超链接是文献的下载链接
            if (thisLink.href.indexOf("download.aspx?filename=") != -1) {
                // <code>&dflag</code>是get请求的参数之一
                if (thisLink.href.indexOf("&dflag") != -1) {
                    thisLink.href = thisLink.href.replace("nhdown", "pdfdown");
                } else {
                    // 也有可能没有(但好像一般会有啊)
                    thisLink.href = thisLink.href + "&dflag=pdfdown";
                }
            }
        }
    }
}
// 如果进了详情页, 博硕士论文下面会出现四个按钮, 期刊论文下会有三个按钮
else {
    if (isCNKIPage === false) {
        // 创建一个"PDF下载"按钮, 放在旁边
        for (i = 0; i < allLis.snapshotLength; i++) {
            thisLi = allLis.snapshotItem(i);
            if (thisLi.getAttribute("class").indexOf("readol") != -1) {
                newLi = document.createElement('li');
                newLi.setAttribute("class", "pdf");
                aPDF = '<a target="_blank" href="' + thisLi.firstChild.href.replace("&dflag=readonline", "&dflag=pdfdown") + '">PDF下载</a>';
                newLi.innerHTML = aPDF;
                thisLi.parentNode.insertBefore(newLi, thisLi.nextSibling);
            }
        }
    }
    else {
        for (i = 0; i < allLinks.snapshotLength; i++) {
            thisLink = allLinks.snapshotItem(i);
            // 超链接是存在的
            if (thisLink.href) {
                // 超链接是文献的下载链接
                if (thisLink.href.indexOf("download.aspx?filename=") != -1) {
                    // 整本下载改为CAJ下载
                    if (thisLink.innerHTML.indexOf("整本下载") != -1) {
                        thisLink.innerHTML = thisLink.innerHTML.replace("整本", "CAJ");
                        bPDF = thisLink.href;
                    }
                    // 分页下载改为PDF下载
                    if (thisLink.innerHTML.indexOf("分页下载") != -1) {
                        thisLink.innerHTML = thisLink.innerHTML.replace("分页", "PDF");
                        thisLink.href = bPDF.replace("nhdown", "pdfdown");
                    }
                }
            }
        }
        // 分章下载我觉得没什么用所以我就替你们删掉了_(:з」∠)_
        var downloadpart = document.getElementById("DownLoadParts");
        downloadpart.removeChild(downloadpart.childNodes[2]);
        var dllink = document.getElementById("wxDlToolbar").childNodes[1].childNodes[1];
        dllink.removeChild(dllink.childNodes[2]);
    }
}
