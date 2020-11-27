// ==UserScript==
// @id             CNKI_PDF_Supernova
// @name           知网PDF下载助手
// @version        2.4.1
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

(function() {
    'use strict';
    window.onload = function(){
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

        // 查找所有链接的XPath
        var allLinks;

        // 如果不是详情页, 即在搜索页面直接点右面的下载图标, 把点击后发送的get请求的dflag参数内容改为"pdfdown"就可以了(知网老贼你以为隐藏起来我就找不到了?)
        if (isDetailPage === false) {
            if (window.location.href.indexOf("kns8") != -1){ // 文献检索页面, 防止在别处出现
                // 加一个转换下载方式的按钮
                var thisLink;
                // 浮动框
                var float_box = document.createElement("div");
                float_box.style = "position: fixed ; right: 20px; top: 50px; width: 200px; text-align: center; border: dashed; padding: 10px; background-color: cyan";
                document.getElementsByTagName("body")[0].insertAdjacentElement("afterbegin", float_box);
                // 勾选框
                var change_type = document.createElement("button");
                change_type.innerText = "转换为默认下载PDF";
                change_type.id = "change_type";
                change_type.style = "font-size:150%;";
                change_type.onclick = function() {
                    allLinks = document.evaluate(
                        '//a[@title="下载"]',
                        document,
                        null,
                        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                        null);
                    for (var i = 0; i < allLinks.snapshotLength; i++) {
                        thisLink = allLinks.snapshotItem(i);
                        if (thisLink.href && thisLink.href.indexOf("download.aspx?filename=") != -1 && thisLink.href.indexOf("&dflag") == -1) {
                            thisLink.href = thisLink.href + "&dflag=pdfdown";
                        } else if (thisLink.href && thisLink.href.indexOf("download.aspx?filename=") != -1 && thisLink.href.indexOf("&dflag=nhdown") != -1) {
                            thisLink.href = thisLink.href.replace("nhdown", "pdfdown");
                        } else {
                            thisLink.href = "https://kns.cnki.net/kcms/download.aspx?" + thisLink.href.substr(thisLink.href.indexOf("filename=")) + "&dflag=pdfdown";
                        }
                    }
                    change_type.innerText = "√ 已转换: 默认下载PDF";
                };
                float_box.insertAdjacentElement("beforeend", change_type);
            }
        }
        // 如果进了详情页, 博硕士论文下面会出现五个个按钮: 手机, 整本, 分页, 分章, 在线
        // 期刊论文下会有三个按钮
        else {
            // 只对"博硕论文"详情页做优化, 否则影响期刊页面的显示
            // 新版界面更改了详情页的显示方式, 原本的"博硕论文"四个大字没有了, 只能数按钮数量了
            var operate_buttons = document.getElementsByClassName("operate-btn")[0];
            if (isCNKIPage === true && operate_buttons.childNodes[3].innerText == "整本下载") {
                // 整本下载替换为CAJ下载
                var dlcaj = document.getElementsByClassName("btn-dlcaj")[0];
                dlcaj.innerHTML = dlcaj.innerHTML.replace("整本", "CAJ");
                // 新增PDF下载的按钮
                var dlpdf = document.getElementsByClassName("btn-dlpdf")[0]; // 从分页下载获取链接
                var pdfdown = dlpdf.getElementsByTagName('a');
                var dl = pdfdown[0].href.replace("&dflag=downpage", "&dflag=pdfdown");
                var li = document.createElement('li');
                li.className = "btn-dlpdf";
                var a = document.createElement('a');
                a.innerHTML = "<i></i>PDF 下载";
                a.target="_blank";
                a.id = "pdfDown";
                a.name = "pdfDown";
                a.href = dl;
                li.appendChild(a);
                operate_buttons.appendChild(li);
                operate_buttons.insertBefore(li, dlcaj.nextElementSibling);

                // 分页下载替换为目录复制
                dlpdf.innerHTML = dlpdf.innerHTML.replace("分页下载", "目录复制");
                dlpdf.className = "btn-dlcaj";
                pdfdown[0].removeAttribute("href");
                pdfdown[0].removeAttribute("target");
                pdfdown[0].removeAttribute("onclick");
                pdfdown[0].id = "copyContents";
                pdfdown[0].name = "copyContents";
                pdfdown[0].removeChild(pdfdown[0].childNodes[0]);
                dlpdf.onclick = function() {
                    var catalog_list = document.getElementsByClassName("catalog-list")[0];
                    var contents = "";
                    for (var i = 0; i < catalog_list.childElementCount; i++){
                        contents = contents + catalog_list.children[i].innerText + "\r\n";
                    }
                    // 利用隐藏textArea实现复制
                    const textarea = document.createElement('textarea');
                    operate_buttons.appendChild(textarea);
                    textarea.setAttribute('readonly', 'readonly');
                    textarea.value = contents; // 这里应该用value，不用innerText
                    textarea.select();
                    if (document.execCommand('copy')) {
                        document.execCommand('copy');
                        window.alert('目录已复制到剪贴板');
                    }
                    operate_buttons.removeChild(textarea);
                };
                // 分章下载替换为目录下载
                var dlChapter = document.getElementsByClassName("btn-dlcaj")[2];
                dlChapter.className = "btn-dlpdf";
                var dlChapter_link = dlChapter.childNodes[0];
                dlChapter_link.removeChild(dlChapter_link.childNodes[0]);
                dlChapter.innerHTML = dlChapter.innerHTML.replace("分章", "目录");
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
                var cnt_list = document.getElementById("downCnt").nextSibling.nextSibling.childNodes[1].childNodes; // 加了一句说明, 再取一个.nextSibling才是目录
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
            var info = document.createElement("div");
            info.style = "font-size:120%; margin: 15px;";
            info.innerText = "索引文件的使用说明见此";
            var manual = document.createElement("a");
            manual.href = "https://zhuanlan.zhihu.com/p/237574559";
            manual.style = "color: blue";
            manual.innerText = "链接";
            manual.target="_blank";
            info.insertAdjacentElement("beforeend", manual);
            title.parentElement.insertBefore(downCnt, title.nextElementSibling);
            downCnt.parentElement.insertBefore(info, downCnt.nextElementSibling);
        }
    };
})();
