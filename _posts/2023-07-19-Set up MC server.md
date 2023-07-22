---
layout:     post
title:      搭建个人 MC 服务器指北
date:       2023-07-19 00:00:00
author:     Lazarus
summary:    Set up a linux Minecraft Server
categories: Linux
thumbnail:  Linux
tags:
 - linux
---

*update on 7/22/2023*

## **What do you need**
搭建一个 Java Edition Minecraft 服务器所需的东西并不多:  
- 一台安装了操作系统并能够运行的电脑  
- Java 环境
- MC 服务器资源 (Server Core)  
- 一个良好的网络环境 *
- Tmux *
- FRP *

本教程使用的是 ubuntu 22.04 LTS 系统。下面让我们逐步进行。

## **Java 环境**  
执行下列指令: 
``` shell
sudo apt-get update  
sudo apt-get upgrade
sudo apt install openjdk-17-jdk

# 安装 jre
sudo apt install openjdk-17-jre

# 卸载
sudo apt remove openjdk-17-jre openjdk-17-jdk --purge
```
执行 `java --version` 验证安装是否成功

## **MineCraft 服务器配置**  
### 服务器下载
MC 服务器种类繁多，这里以 Fabric Minecraft Server Launcher 为例。
> ***Fabric is a lightweight, experimental modding toolchain for Minecraft.***  

下载服务器资产非常简单，访问 [Download Minecraft Server Launcher](https://fabricmc.net/use/server/) 界面:  
![Download Minecraft Server Launcher](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721105307.png)
选择 Mincraft 版本，会自动生成资源下载链接，这里以 JE 1.20.1 为例。我们复制 Fabric 下载界面提供的下载指令 `curl -OJ https://meta.fabricmc.net/v2/versions/loader/1.20.1/0.14.21/0.11.2/server/jar` 至 linux 终端并运行。
![Download Link](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721105847.png)  
会获得一个服务器的 jar 包。接着我们在服务器所在文件夹创建一个服务器启动脚本 `vim run.sh`, 将 Fabric 下载界面提供的启动命令 `java -Xmx2G -jar fabric-server-mc.1.20.1-loader.0.14.21-launcher.0.11.2.jar nogui` 输入，保存并退出。
![run.sh](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721110919.png)  
> 列举一些 run.sh 可能用到的参数  
    1. -Xmx?G ? 为服务器最多可用内存  
    2. -Xms?G ? 为服务器最小占用内存  
    3. nogui 不启用服务器 GUI  
    4. -jar 后面为 Server Launcher 的名字，如果强迫症看着默认名字难受修改了的话，启动脚本需要修改  

随后我们别忘了给运行脚本执行权限，`chomod +x run.sh`。此时我们可以直接运行脚本了 `./run.sh`，启动器会自动下载服务器核心资源，并生成需要的资产。 
第一次运行会失败，并且给出下列提示: ![EULA](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721111242.png)  
这里我们需要去修改刚刚生成的 eula 用户许可文件。`ls` 查看本地文件发现有一个 `eula.txt`, 我们 `vim eula.txt` 去修改它。
![eula](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721111625.png)  
我们将最后一行的 `eula=false` 改为 `eula=true` 即可，保存并退出。  
此时已经可以连接服务器愉快地玩耍了，但在此之前，我们可能还需要修改一些服务器的配置项。让我们输入 `stop` 终止服务器运行。我们查看服务器目录下的文件，发现有一个 `server.properties` 文件，这个就是服务器的配置文件，里面有着非常多的配置项。
![server directory](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721112213.png)
关于具体选项的作用，可以查看 Minecraft Wiki 了解更多: [Server.properties](https://minecraft.fandom.com/wiki/Server.properties)，这里主要提及几个比较重要的配置项：  

``` shell
- online-mode=true #重要！当值为 true 时只有拥有 MC JE 正版的账户才能够进入服务器，并且可以使用诸如官方皮肤，披风等物品。此项一般也被称为正版验证。当值为 false 时关闭正版验证。
- server-port=25565 # 重要！服务器监听端口！
- query.port=25565 # 重要！服务器查询端口！
- difficulty=easy # 难度，关系到游戏的某些特性
- level-seed= #服务器种子，默认随机。
```
完成配置文件修改后我们再次运行 `run.sh`，如果显示以下的画面，恭喜你，服务器成功运行了！
![server running](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230721111853.png)

## **Tmux**  
当我们在服务器运行时把终端的黑框框关掉时(包括 ssh 的终端)，那么服务器也会被直接关闭。显然我们不可能一直开着这个黑框框在电脑上，所以我们需要一些小工具，比如 **Tmux**。 
### 速通 Tmux
1. 执行 `sudo apt-get install tmux` 安装 tmux。  
2. 新建会话 `tmux new -s <session-name>`。使用 `tmux ls` 浏览会话列表。  
3. 退出会话 `tmux detach` 或者 `ctrl + b`  
4. 接入会话 `tmux a -t <session-name>`，`tmux a` 默认接入上次打开的会话  
5. 结束会话 `tmux kill-session -t <session-name>`  

### Tmux 在搭建服务器时的应用
1. `tmux new -s MCServer` 创建一个会话。
2. 在会话内执行 `run.sh` 服务器启动脚本。
3. `ctrl + b + d` 退出会话，此时即使关闭终端服务器也不会停止运行。

## Frp  
Frp 是什么？
> frp 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网。

关于 Frp 的更多内容，可以查阅[官方文档](https://frps.cn/11.html)与 [Github 仓库](https://github.com/fatedier/frp)。  
接下来示范如何将本地运行的 MC 服务器通过 Frp 反向代理到公网上。当然首先你需要一台拥有公网 ip 的电脑/服务器/VPS/路由器。  
1. 安装 Frp。
    - 访问 github 的 [Releases](https://github.com/fatedier/frp/releases)，获取所需版本的下载链接。
    - 在 Server (公网)和 Client (内网)上分别执行 `wget https://github.com/fatedier/frp/releases/download/v0.51.1/frp_0.51.1_linux_amd64.tar.gz` 指令下载预编译好的文件。  
    - `tar -zxvf frp.tar.gz` 解压文件，可以获得如下文件： 
    ![frp](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230722183125.png)  
2. 配置 Frp  
    - 配置服务端(公网)文件 frps.ini，默认状态下 frps.ini 的内容是这样的。设置了 frp 服务器用户接收客户端连接的端口为默认的 7000。这里我们要记住端口，以及公网的 ip 地址。
    ![frps](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230722183425.png)
    - 配置客户端(局域网)文件 frpc.ini。默认状态下 frpc.ini 的内容是这样的:
    ``` shell
        # 必要！
        [common]
        server_addr = 127.0.0.1 # 服务器的地址，这里要修改成你的公网服务器 IP
        server_port = 7000  # 服务器接收客户端连接的端口

        # 一个名为 ssh 的配置项，frp 会将请求服务器 6000 端口的流量转发到内网机器的 22 端口。
        [ssh]
        type = tcp # 连接方式
        local_ip = 127.0.0.1 # 本地地址
        local_port = 22 # 需要转发的端口
        remote_port = 6000 # 服务器监听端口            
    ```
    我们参考这份样例，先将 frpc.ini 中服务器的地址和接收端口改成自己的，然后在文件后面添加一个 MC 服务器需要使用的配置项:
    ```shell
        [MCServer]
        type = tcp # MCJE 使用 tcp 协议
        local_ip = 127.0.0.1 # 本地地址
        local_port = 25565 # MC 服务器监听和查询的地址，在 server.properties 中设定
        remote_port = 25565 # 服务器监听端口 
    ```  
3. 在公网服务器上开放需要使用到的端口，如 7000, 25565.
4. 运行 Frp 反向代理
    - 首先在服务器上执行 `tmux new -s frps` 创建一个 tmux 会话  
    - 然后在 frp 目录下执行 `./frps -c frps.ini` 开启 frp 服务端后 `ctrl + b + d` 退出 tmux 会话。  
    - 在客户端上执行 `tmux new -s frpc` 创建一个 tmux 会话
    - 在 frp 目录下执行 `./frpc -c frpc.ini` 开启 frp 客户端后 `ctrl + b + d` 退出 tmux 会话。

此时如果服务端和客户端都没有错误信息，那说明反向代理搭建成功，可以通过公网访问内网 MC 服务器了。

## Wsl 代理配置  
### Windows Subsystem for Linux
1. Clash 配置应确保如下图  
![Clash 配置](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230720001624.png){:height="75%" width="75%"}  
2. 配置 Wsl 环境
    - 编辑 ~/.bashrc `vim ~/.bashrc`,在末尾添加下列内容。
    ```text
        # add proxy
        export hostip=$(ip route | grep default | awk '{print $3}')
        export socks_hostport=7890
        export http_hostport=7890
        alias proxy='
            export https_proxy="http://${hostip}:${http_hostport}"
            export http_proxy="http://${hostip}:${http_hostport}"
            export ALL_PROXY="socks5://${hostip}:${socks_hostport}"
            export all_proxy="socks5://${hostip}:${socks_hostport}"
        '
        alias unproxy='
            unset ALL_PROXY
            unset https_proxy
            unset http_proxy
            unset all_proxy
        '
        alias echoproxy='
            echo $ALL_PROXY
            echo $all_proxy
            echo $https_proxy
            echo $http_proxy
        '
        #end proxy
    ```
    保存并退出后，执行 `source ~/.bashrc` 使配置生效。
    - 用法：
        在终端输入 `proxy` 启动代理，`unproxy` 关闭代理, `echoproxy` 查看代理相关信息。
    - 测试：
        启动代理后执行 `wget google.com`,如果能获取到 google.com 页面即为成功。


