---
layout:     post
title:      UE UInterface
date:       2021-08-22 00:00:00
author:     Lazarus
summary:    UE
categories: ue  
thumbnail:  ue4
tags:
 - ue4
---

What can UInterface do?

> Interface classes are useful for ensuring that a set of (potentially) unrelated classes implement a common set of functions. This is very useful in cases where some game functionality may be shared by large, complex classes, that are otherwise dissimilar. 

说人话，就是让不同的类能够调用同一（组）函数，对于能在 C++ 代码里面处理好的数据而言，使用 UInterface 是可以但不见得有必要的，更多的还是用于蓝图。<br>

因为项目需求一个方法能够获得一个蓝图类里面 Mesh 的大小，该蓝图类是基于 C++ 类的，但 Mesh 是在蓝图里面加进去的，在大佬的指点下得知了 UInterface 这个好东西。<br>

下面是示例<br>

## 创建 UInterface

在 Editor 里面新建一个 C++ 类，如果你习惯性的从 show all classes 里面去找，那么你一定会一脸失望的发现找不到

<img src="https://i.loli.net/2021/08/26/kLCZ47s5ewd2YTF.png" alt="image-20210822174319155"  />

正解是直接在默认的这个地方翻到最下面

<img src="https://i.loli.net/2021/08/26/aeE8FxsztkDuR2i.png" alt="image-20210822174550628" style="zoom: 80%;" />

嗯，它神奇的出现了，amazing

然后来看下代码

```c++
.h
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "GetMeshSizeInterface.generated.h"

// This class does not need to be modified.
UINTERFACE(MinimalAPI)
class UGetMeshSizeInterface : public UInterface
{
	GENERATED_BODY()
};

/**
 * 
 */
class UNLUATEST_API IGetMeshSizeInterface
{
	GENERATED_BODY()

	// Add interface functions to this class. This is the class that will be inherited to implement this interface.
public:
	UFUNCTION(BlueprintCallable, BlueprintImplementableEvent, Category = "GetMeshSize")
	float GetMeshSize() const;

	virtual bool ReactToTrigger();
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

.cpp
// Fill out your copyright notice in the Description page of Project Settings.

#include "GetMeshSizeInterface.h"

// Add default functionality here for any IGetMeshSizeInterface functions that are not pure virtual.
bool IGetMeshSizeInterface::ReactToTrigger()
{
    return false;
}

```

从头文件看起，细心的你一定会发现它实现了两个类，一个是 UYourUInterface 继承自 UInterface 一个是 IYourInterface.<br>

UYourUInterface 里面不需要加任何东西，这个类是引擎实现 UInterface 一些功能的地方，比如蓝图可以调用等等，原理我也不知道。<br>

IYourInterface 里面就可以声明你需要的函数了，对于蓝图实现和调用的函数加上 UFUNCTION( ) 宏，对于 C++ 调用的函数，写成虚函数即可，然后在 .cpp 文件里面实现。<br>

---



## 蓝图内调用<br>

如图

![image-20210822180131149](https://i.loli.net/2021/08/26/jMpinZ4FGzqKPo9.png)

![image-20210822180210323](https://i.loli.net/2021/08/26/y1LeIC6UaNTYpiv.png)

然后是数据获取和处理，这部分功能我放在相机类里面

```c++
//	CameraTargetActor 蓝图实例
// 判断该对象是否实现了 UInterface
if (CameraTargetActor->GetClass()->ImplementsInterface(UGetMeshSizeInterface::StaticClass()))
{
	UE_LOG(LogTemp, Warning, TEXT("Got Interface"));
    // 调用接口函数
	TargetMeshSize = IGetMeshSizeInterface::Execute_GetMeshSize(CameraTargetActor);
}
```

C++ 内调用 Interface 函数还有些别的东西，等用到了在补充，饿了，去吃饭了

2021-8-22 18:15