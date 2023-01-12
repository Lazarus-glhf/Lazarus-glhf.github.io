---
layout:     post
title:      Learn OpenGL Part Ⅰ
date:       2023-01-10 00:00:00
author:     Lazarus
summary:    Recording experience of learning OpenGL
categories: Computer Graphics
thumbnail:  ue4
tags:
 - Computer Graphics
---

*update on 1/11/2023*

##  Window

Well, let's start with the window.

Initialize GLFW at the very first.

```c++
int main()
{
    // 初始化并配置 GLFW
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    
    // 只有高贵的 MacOS 用户需要
	// glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
}
```

And create the window with the  **glfwCreateWindow()** function.

```c++
GLFWwindow* window = glfwCreateWindow(800, 600, "LearnOpenGL", NULL, NULL);
if (window == NULL)
{
    std::cout << "Failed to create GLFW window" << std::endl;
    glfwTerminate();
    return -1;
}
glfwMakeContextCurrent(window);
```

GLAD manages function pointers for OpenGL so we want to initialize GLAD before we call any OpenGL function.

```c++
if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
{
    std::cout << "Failed to initialize GLAD" << std::endl;
    return -1;
}  
```

---

## Viewport

`Window` is just a window, viewport is where we see the world.

We can directly set the viewport with the [**glViewport()**](https://docs.gl/gl3/glViewport) function like this:

```c++
glViewport(0, 0, 800, 600);
```

But it won't be adjusted when the window is been resized, so a call back function is needed.

```c++
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    glViewport(0, 0, width, height);
}  
```

And we can use the **glfwSetFramebufferSizeCallback()** function to bind the  call back function. So it will be called every time when window was created or resized.

```c++
glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);  
```

And we can bind more call back functions, We register the callback functions **after we've created the window** and **before the render loop is initiated**. 

---

## Render Loop

The loop is controlled by **glfwWindowShouldClose()** function.

```c++
while(!glfwWindowShouldClose(window))
{
    glfwSwapBuffers(window);
    glfwPollEvents();    
}
```

>The **glfwWindowShouldClose()** function checks at the start of each loop iteration if GLFW has been instructed to close. If so, the function returns `true` and the render loop stops running, after which we can close the application.
>
>The **glfwPollEvents()** function checks if any events are triggered (like keyboard input or mouse movement events), updates the window state, and calls the corresponding functions (which we can register via callback methods). 
>
>The **glfwSwapBuffers()** will swap the color buffer (a large 2D buffer that contains color values for each pixel in GLFW's window) that is used to render to during this render iteration and show it as output to the screen.

After looping we can use **glfwTerminate()** to clean everything up and quit.

```c++
glfwTerminate();
return 0;
```

So if we run the program, there should be a empty black window.

We can clear the previous frame render result and draw the *window* with the **[glClearColor()]([glClearColor - OpenGL 3 - docs.gl](https://docs.gl/gl3/glClearColor))** and **[glClear()]([glClear - OpenGL 3 - docs.gl](https://docs.gl/gl3/glClear))** functions.

```c++
glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT);
```

>  As you may recall from the *OpenGL* chapter, the **glClearColor()** function is a *state-setting* function and **glClear()** is a *state-using* function in that it uses the current state to retrieve the clearing color from.

---

## Input

We can use  **glfwGetKey()** function to get the inputs. The function takes a `window` as input together with a `key`. To make every thing clear, we create a function to handle all the inputs.

```c++
// Check if we are pressing ESC key
void processInput(GLFWwindow *window)
{
    if(glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}
```

And we need to call the **processInput()** function every iteration of the render loop:

```c++
while (!glfwWindowShouldClose(window))
{
    processInput(window);

    glfwSwapBuffers(window);
    glfwPollEvents();
}  
```

---



