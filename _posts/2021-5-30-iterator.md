---
layout:     post
title:      iterator
date:       2021-05-28 00:00:00
author:     Lazarus
summary:    c++ primer
categories: c++
thumbnail:  cpp
tags:
 - c++
---

`end`  成员返回指向容器 (或 `string` 对象) "尾元素的下一个位置 (one past the end)" 的迭代器，  也就是说，该迭代器指示的是容器的一个本不存在的 **尾后 (off the end)** 元素，这样的迭代器没有实  际意义，仅是个标记。`end` 成员返回的迭代器常被称作 **尾后迭代器 (off-the-end-iterator)** 或者简称为 **尾迭代器 (end iterator)**。 特殊情况下如果容器为空，则 `begin` 和 `end` 返回的是一个迭代器.

```c++
    //由编译器决定 b 和 e 的类型;
    // b 表示 v 的第一个元素。 e 表示 v 尾元素的下一个位置
    auto b = v.begin(); e = v.end();
```

---

**迭代器运算符**

```c++
    *iter   //解引用
    iter->mem   //等价于 (*iter).mem
    ++iter      //指示下一个元素
    --iter      //指示上一个元素
    iter1 == iter2
    iter1 != iter2
```

---

**泛型编程**

只有 `string` 和 `vector` 等一些标准库类型有下标运算符，而非全部如此。
所有标准库容器的迭代器都定义了 == 和 != ， 但是他们中的大多数都没有
定义 < 运算符。 

**某些对 `vector` 对象的操作会使迭代器失效**

1. 不能在范围 for 循环中向 `vector` 对象添加元素
2. 任何一种可能改变 `vector`  对象容量的操作，比如 `push_back` 都会使该 `vector` 对象的迭代器失效

---

**迭代器运算**

```c++
    iter1 += n  //后移 n 个位置
    iter1 -= n  //前移 n 个位置
    iter1 - iter2 //两个迭代器之间的距离
```

**迭代器算术运算**

```c++
    //计算得到最接近 vi 中间元素的一个迭代器
    auto mid = vi.begin() + vi.size() / 2;

    if (it < mid)//处理 vi 前半部分的元素
```

只要两个迭代器指向的是同一个容器中的元素或者尾元素的下一个位置，就能将其相减，所得结果是两个迭代器的距离。所谓距离值得是右侧迭代器向前移动多少位置就能追上左侧迭代器，其类型名为 `difference_type` 的带符号整数, `string` 和 `vector` 都定义了 `difference_type` ，因为这个距离可正可负

**使用迭代器运算**

*二分搜素*
```c++
    //text 必须是有序的
    //beg 和 end 表示我们搜索的范围
    auto beg = text.begin(), end = text.end();
    auto mid = text.begin() + (end - beg) /2;
    //当元素尚未检查并且我们还没有找到 sought 时执行循环
    while (mid != end && *mid != sought) {
        if (sought < *mid>)          //查找前半部分
            end = mid;
        else                        //后半部分
            beg = mid + 1;
        mid = beg + (end - beg) /2;  //新的中间点
    }
```




