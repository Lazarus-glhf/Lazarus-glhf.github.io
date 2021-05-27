---
layout:     post
title:      typedef&using
date:       2021-05-27 20:00:00
author:     Lazarus
summary:    balabala
categories: c++
thumbnail:  cpp
tags:
 - c++
---

### typedef

```c++
    typedef double wages;
    typedef wages base,*p;//base == double, p == double*;

    using SI = Sales_Item;

    wages hourly,weekly;
    Si iem;
```

不要写出`typedef char *pstring:`这种东西
`pstring`实际上是类型`char *`的别名

```c++
    const pstring cstr = 0;//cstr是指向char的常量指针
    const pstring *ps;//ps是一个指针，它指向的对象是一指向char的常量指针
```

---

### auto类型说明符

`auto`一般会忽略顶层`const`，保留底层`const`

```c++
    const int ci = i,&cr = ci;
    auto b = ci;    //b为一个整数,ci的顶层const特性被忽略掉了
    auto e = &ci;   //e是一个指向整数常量的指针(对常量对象取地址是一种底层const)
```


