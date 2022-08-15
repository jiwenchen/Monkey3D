function ParserImage() {
    onmessage = function(event) {
        var data = event.data;
        var fd = new FormData();
        fd.append("file", data.form);
        var ajax = new XMLHttpRequest();
        //步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
        ajax.open("post", `${data.origin}/orthanc/instances/`);
        //步骤三:发送请求
        ajax.send(fd);
        //步骤四:注册事件 onreadystatechange 状态改变就会调用
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4 && ajax.status == 200) {
                //步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
                postMessage("response"); //返回单文件合并结果
            } else if (ajax.readyState == 4) {
                postMessage("error"); //返回单文件合并结果
            }
        };
    };
}

//线程入口
function main() {
    ParserImage();
}

main();
