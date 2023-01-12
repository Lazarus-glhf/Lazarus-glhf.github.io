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

  - **[glGenbuffer()]()** 函数创建对象，这是它生命的开始
  - **[glBindBuffer(GL_ARRAY_BUFFER, VBO)]([glBindBuffer - OpenGL 3 - docs.gl](https://docs.gl/gl3/glBindBuffer))** 调用此函数表示，从这里开始我所有对 **GL_ARRAY_BUFFER** 这个东西的操作，实质上都是在操作这里绑定的 VBO。
  - **[glBufferData()]([glBufferData - OpenGL 3 - docs.gl](https://docs.gl/gl3/glBufferData))** 数据在这一步传入 GPU, 这个函数不需要 VBO 对象作为输入，直接对 **GL_ARRAY_BUFFER** 进行操作，实质上是把数据传给了 VBO 管理。
  - **[glVertexAttribPointer]([glVertexAttribPointer - OpenGL 3 - docs.gl](https://docs.gl/gl3/glVertexAttribPointer))(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);** 
    - 这个吊函数参数一堆
    - 第一个参数是顶点属性的位置值，也就是这个值和 shader 里的那个 `layout(location = 0)` 对上，这样就可以把顶点数据传到对应 location 上
    - 第二个参数指定是一个多大的 vec
    - 第三个参数指定数据类型
    - 第四个参数决定是否进行标准化，把所有数据重定位到 -1 到 1 之间
    - 第五个参数是步长，即两个 location, color 等数据间隔了多少个其它数据。
    - 第六个参数表示偏移量，第一个需要的数据出现的位置，比如 color 如果在 location 后 3 个，那就是 `(void*)3`![img](https://ask.qcloudimg.com/http-save/yehe-7399394/ff0716e776ca594581a032f413febd83.png?imageView2/2/w/1620)

-  Vertex Array Object 是一个指针数组 VertexAttribArray ，用来管理和使用 VBO 中每个 location 的数据。所以要声明绑定 VAO 后再对 VBO 进行对应的修改等操作。在绘制时也要绑定 VAO，要使用其他 VBO 时就重新绑定 VAO。

  ![Image of how a VAO (Vertex Array Object) operates and what it stores in OpenGL](https://learnopengl.com/img/getting-started/vertex_array_objects.png)

  >  vertex array object stores the following:
  >
  > - Calls to [glEnableVertexAttribArray()](glEnableVertexAttribArray) or [glDisableVertexAttribArray()]([glEnableVertexAttribArray - OpenGL 3 - docs.gl](https://docs.gl/gl3/glEnableVertexAttribArray)).
  > - Vertex attribute configurations via glVertexAttribPointer.
  > - Vertex buffer objects associated with vertex attributes by calls to glVertexAttribPointer.

## Shader

Shader 这里主要分为 vertex shader 和 fragment shader, 其中 vertex shader 的输入来自 VBO 对应 location; fragment shader 的输入来自 vertex shader 的 out。二者也都可通过 uniform 接受来自程序的运行时输入。

![The OpenGL graphics pipeline with shader stages](https://learnopengl.com/img/getting-started/pipeline.png)

着色器主要就是编译，然后用就完了。

```c++
// shader.h
#pragma once
#ifndef SHADER_H
#define SHADER_H

#include <glad/glad.h>

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

class Shader
{
public:
	unsigned int ID;

	Shader(const char* vertexPath, const char* fragmentPath);

	void use();
	void setBool(const std::string& name, bool value) const;
	void setInt(const std::string& name, int value) const;
	void setFloat(const std::string& name, float value) const;
	void setVec(const std::string& name, float value1, float value2, float value3) const;
};

#endif

// shader.cpp
#include "shader.h"

Shader::Shader(const char* vertexPath, const char* fragmentPath)
{
	// 1. retrieve the vertex/fragment source code from filePath
	std::string vertexCode;
	std::string fragmentCode;
	std::ifstream vShaderFile;
	std::ifstream fShaderFile;
	// ensure ifstream objects can throw exceptions:
	vShaderFile.exceptions(std::ifstream::failbit | std::ifstream::badbit);
	fShaderFile.exceptions(std::ifstream::failbit| std::ifstream::badbit);
	try
	{
		// open files
		vShaderFile.open(vertexPath);
		fShaderFile.open(fragmentPath);
		std::stringstream vShaderStream, fShaderStream;
		// read file's buffer contents into streams
		vShaderStream << vShaderFile.rdbuf();
		fShaderStream << fShaderFile.rdbuf();
		// close file handlers
		vShaderFile.close();
		fShaderFile.close();
		// convert stream into string
		vertexCode = vShaderStream.str();
		fragmentCode = fShaderStream.str();
	}
	catch (std::ifstream::failure& e)
	{
		std::cout << "ERROR::SHADER::FILE_NOT_SUCCESFULLY_READ" << std::endl;
	}
	const char* vShaderCode = vertexCode.c_str();
	const char* fShaderCode = fragmentCode.c_str();

	// 2. compile shaders
	unsigned int vertex, fragment;
	int success;
	char infoLog[512];

	// vertex Shader
	vertex = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vertex, 1, &vShaderCode, NULL);
	glCompileShader(vertex);
	// print compile errors if any
	glGetShaderiv(vertex, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(vertex, 512, NULL, infoLog);
		std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
	}

	fragment = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(fragment, 1, &fShaderCode, NULL);
	glCompileShader(fragment);
	glGetShaderiv(fragment, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(fragment, 512, NULL, infoLog);
		std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
	}

	// shader program
	ID = glCreateProgram();
	glAttachShader(ID, vertex);
	glAttachShader(ID, fragment);
	glLinkProgram(ID);
	// print linking errors if any
	glGetProgramiv(ID, GL_LINK_STATUS, &success);
	if(!success)
	{
		glGetProgramInfoLog(ID, 512, NULL, infoLog);
		std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
	}

	// delete the shaders as they are linked into our program now and no longer necessary
	glDeleteShader(vertex);
	glDeleteShader(fragment);
}

void Shader::use()
{
	glUseProgram(ID);
}

void Shader::setBool(const std::string& name, bool value) const
{
	glUniform1i(glGetUniformLocation(ID, name.c_str()), (int)value);
}

void Shader::setInt(const std::string& name, int value) const
{
	glUniform1i(glGetUniformLocation(ID, name.c_str()), value);
}

void Shader::setFloat(const std::string& name, float value) const
{
	glUniform1f(glGetUniformLocation(ID, name.c_str()), value);
}

void Shader::setVec(const std::string& name, float value1, float value2, float value3) const
{
	glUniform3f(glGetUniformLocation(ID, name.c_str()), value1, value2, value3);
}
```

不会吧不会吧。这点代码都看不懂吗？我邦邦给你两拳。

接下来关注 shader 本身

```glsl
// vertex shader
#version 330 core
layout (location = 0) in vec3 aPos;   // set position attribute value to 0 
layout (location = 1) in vec3 aColor; // set color attribute value to  1

out vec3 ourColor; // output a color to fragment shader
out vec3 outPosition;
uniform vec3 pOffset;

void main()
{
	gl_Position = vec4(-aPos + pOffset / 2, 1.0);
	// outPosition = gl_Position.xyz;
	ourColor = aColor; // set ourColor as what we got from vertex data
}

// fragment shader
#version 330 core
out vec4 FragColor;  

in vec3 ourColor;
in vec3 outPosition;

uniform vec3 pOffset;

void main()
{
	//FragColor = vec4(outPosition, 1.0f);
	 FragColor = vec4(ourColor + pOffset, 1.0);
}
```

首先是变量，in / out 开头表示这个变量是输入还是输出，紧随其后是变量类型，再往后是变量名。vertex shader 通过 `layout (location = x)` 标记这个变量来自 attribute pointers array 的哪一部分。

> 关于 vertex shader 怎么输出 position
>
> To set the output of the vertex shader we have to assign the position data to the predefined ***gl_Position*** variable which is a `vec4` behind the scenes. At the end of the main function, whatever we set ***gl_Position*** to will be used as the output of the vertex shader.

关于 uniform，在 shader 内声明 uniform 类型变量的 data type 和 variable name, 随后在程序中使用对应 data type 的 **glUniform()** 系列函数进行赋值，在调用这个函数前要调用 **glUseProgram()** 函数。

---

最后来看下 render loop

```c++
	while (!glfwWindowShouldClose(window))
	{
		processIput(window);

		// 渲染
		// 清空屏幕
		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT);

		// update uniform color value
		float timeValue = glfwGetTime();
		float OffsetValue = -cos(timeValue);
		// int vertexColorLocation = glGetUniformLocation(myShader.ID, "pOffset");
		// int vertexColorlocation2 = glGetUniformLocation(shaderProgram2, "uColor2");

		// render triangle
		myShader.use();
		// glUniform4f(vertexColorLocation, OffsetValue, 0.0f, 0.0f, 1.0f);
		myShader.setVec("pOffset", OffsetValue, 0.0f, 0.0f);
		glBindVertexArray(VAO);
		glDrawArrays(GL_TRIANGLES, 0, 3);


		//using EBO
		//glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

		// 检查并调用事件，交换缓冲。
		glfwSwapBuffers(window);
		glfwPollEvents();
	}
```



目前还没怎么用到 EBO，所以先不写了，本质上和 VBO 是一个东西。
