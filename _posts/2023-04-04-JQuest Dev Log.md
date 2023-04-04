---
layout:     post
title:      JQuest 任务系统插件开发日志
date:       2023-04-04 00:00:00
author:     Lazarus
summary:    UE
categories: ue 
thumbnail:  ue4
tags:
 - ue c++
---

## 参考项目解析

参考项目中主要包括以下几个重要的 Class  
1. Main Character，它负责在 BeginPlay 的时候收集场景内所有的 QuestActor。 
2. class QuestActor 继承自 AActor
	- 包含一个 UObjCollection* RootObjCollection
	- 构建 RootObjCollection 的虚函数 ConstructRootObjectiveCollection()
	- GetRootObjCollection() 函数
	- 用于将 Objectives 添加到 ObjCollection 的 PopulateObjectives() 函数
	- 负责激活 Objective 的 ActiveObjective() 函数  
3. class ObjCollection 继承自 UObjective
	- 用于存储 Objectives 的数组
	- 用于标记是否需要按顺序完成任务的 bool
	- 用于将 Objective 添加到 Array 的函数 AddObjective(UObjective* obj)
	- 重写的 ActiveObjective()
		- 当不需要按顺序时，直接遍历数组内的所有 Obj，并调用它们的 ActiveObjective()
		- 当需要按顺序时，调用 HandleOrderRequired();
	- HandleOrderRequired()
		- 调用 FindNexIncompleteObjective 获取要激活的 obj
		- 激活 obj，并将 OnCompleteEvent() 绑定到此 Obj 的 OnCompleted 委托
	- 查找 Array 中第一个未完成的 Obj 的函数 FindNexIncompleteObjective()
	- 委托事件 OnCompleteEvent()
		- 当 obj 完成后触发委托时，将此函数解绑，并重新调用 HandleOrderRequired()
		- 啊没错就是会套娃捏
	- 判断当前 objectives 是否全部完成了的 GetIsComplete()   
4. 万物起源 Objective 继承自 UObject
	- 带一个 UObjective* 参数的多播动态委托 FOnCompleted
	- 当前任务名 FText ObjectiveName
	- 决定激活的 bool bIsActive
	- FText GetObjectiveName() const;
	- virtual bool GetIsComplete() const;
	- virtual bool GetIsActive() const;
	- virtual void ActiveObjective();
	- void SetObjectiveName(FText name);
