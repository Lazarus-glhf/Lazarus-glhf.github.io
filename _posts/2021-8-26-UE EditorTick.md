---
layout:     post
title:      UE Editor Tick
date:       2021-08-26 00:00:00
author:     Lazarus
summary:    UE
categories: ue  
thumbnail:  ue4
tags:
 - ue4
---

# Editor Tick

在 Editor 内调用 Tick 事件还是比较好用的一个功能，之前有所设想但一直没付出实践，以为会很麻烦，没想到居然如此简单，只能说想到了就去做，犹豫就会败北。<br>

对需要在 Editor 内调用 Tick 事件的 Actor 类的代码进行一点点修改

```c++
.h
    
UPROPERTY(EditInstanceOnly)
bool bIsTick = false;

virtual void TickActor(float DeltaTime, ELevelTick TickType, FActorTickFunction& ThisTickFunction) 
override;
virtual bool ShouldTickIfViewportsOnly() const override;

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

.cpp
    
void AFloatTarget::TickActor(float DeltaTime, ELevelTick TickType, FActorTickFunction& ThisTickFunction)
{
	FEditorScriptExecutionGuard ScripGuard;
	Super::TickActor(DeltaTime, TickType, ThisTickFunction);
	
}

bool AFloatTarget::ShouldTickIfViewportsOnly() const
{
	return bIsTick;
}
```

基本都是模板定式的，`ShouldTickIfViewportsOnly()` 函数返回的  `bool` 变量决定是否在 Editor 内 Tick。

---

