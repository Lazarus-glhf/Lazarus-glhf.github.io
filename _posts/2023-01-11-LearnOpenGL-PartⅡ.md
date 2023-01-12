---
layout:     post
title:      Learn OpenGL Part Ⅱ
date:       2023-01-11 00:00:00
author:     Lazarus
summary:    Recording experience of learning OpenGL
categories: Computer Graphics
thumbnail:  ue4
tags:
 - Computer Graphics
---

*update on 1/12/2023*

首先，不想写英文了。别问，问就是累了。

这章除了比较多的基础知识难以一时消化外，什么 VBO VAO EBO 的使用方法令人两眼一抹黑，其中各种什么绑定让人云里雾里，只见程序能跑但却不知道为什么。花了两三天把代码基本消化后，虽然可以独立完成最后的作业了，但对于 buffer 这个东西以及一整个 OpenGL 的运行逻辑还不是很清楚。这篇笔记准备把绘制三角形和着色器都写完嗯嗯，以后也尽量两三章内容合为一篇笔记。

## Buffers

```c++
unsigned int VBO, VAO, EBO;
glGenVertexArrays(1, &VAO);
glGenBuffers(1, &VBO);
glGenBuffers(1, &EBO);

// 必须先绑定 VAO
glBindVertexArray(VAO);

glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

// Position Attribute 位置属性
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// Color Attribute 颜色属性
// 颜色数据在位置数据后，不是从 0 开始的，所以最后的偏移量参数应该偏移 3 个 float
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);
```

关于 **VBO** 与 **VAO**，这块好像一直处于懂了但是完全没懂的状态，目前我的理解是：

- Vertex Buffer Object 是一块储存数据的对象，它存在的意义是为了一次性将多个顶点数据传给 GPU, 节省时间提高性能。
- 它的工作方式是：
  - **glGenbuffer()** 函数创建对象，这是它生命的开始
  - **glBinBuffer(GL_ARRAY_BUFFER, VBO)** 调用此函数表示，从这里开始我所有对 **GL_ARRAY_BUFFER** 这个东西的操作，实质上都是在操作这里绑定的 VBO。
  - **glBufferData()** 这个函数不需要 VBO 对象作为输入，直接对 **GL_ARRAY_BUFFER** 进行操作，实质上是把数据传给了 VBO 管理。
  - **glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);** 
