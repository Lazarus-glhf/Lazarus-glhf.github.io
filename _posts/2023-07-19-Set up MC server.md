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

*update on 7/19/2023*

## **What do you need**
搭建一个 MC 服务器所需的东西并不多:  
- 一台安装了操作系统并能够运行的电脑  
- Java 环境
- MC 服务器资源 (Server Core)  
- Tmux
- 一个良好的网络环境 *
- FRP *

本教程使用的是 ubuntu 22.04 LTS 系统。下面让我们逐步进行。

## Java 环境
1. **下载 Java**  
```
### Linux 64-bit ### 
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz  
tar xvf openjdk-17.0.2_linux-x64_bin.tar.gz
sudo mv jdk-17.0.2/ /opt/jdk-17/
```
2. **设置环境变量**  
```
echo 'export JAVA_HOME=/opt/jdk-17' | sudo tee /etc/profile.d/java17.sh 
echo 'export PATH=$JAVA_HOME/bin:$PATH'|sudo tee -a /etc/profile.d/java17.sh 
source /etc/profile.d/java17.sh
```
3. **设置 JAVA_HOME 环境变量**
- 编辑 /etc/profile  
`sudo vim /etc/profile`  
在文件内加入 `JAVA_HOME="/opt/jdk-17"`，这里填入你实际的安装位置，本案例中为 `/opt/jdk-17`。  
- 应用更改
`source /etc/environment`  
4. **验证安装**  
- `echo $JAVA_HOME`  
![echo $JAVA_HOME](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230720004037.png)
- `java` 与 `javac`  
![java](https://cdn.jsdelivr.net/gh/Lazarus-glhf/ImageStorage@main/Blog/20230720004134.png)  


## 代理配置  
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


