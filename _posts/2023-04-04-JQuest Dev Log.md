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

### 类  

1. class QuestActor 继承自 AActor
  - 包含一个 UObjCollection* RootObjCollection

  - 构建 RootObjCollection 的虚函数 ConstructRootObjectiveCollection()

  - GetRootObjCollection() 函数

  - 用于将 Objectives 添加到 ObjCollection 的 PopulateObjectives() 函数

  - 负责激活 Objective 的 ActiveObjective() 函数  

  - BeginPlay 里会调用的

    - ```c++
      RootObjectiveCollection = ConstructRootObjectiveCollection();
      PopulateObjectives(RootObjectiveCollection);
      
      // TODO Active Root Objectives
      RootObjectiveCollection->ActiveObjective();
      ```

2. class ObjCollection 继承自 UObjective
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

3. 万物起源 Objective 继承自 UObject
  - 带一个 UObjective* 参数的多播动态委托 FOnCompleted，Obj 完成时会 broadcast 并将自己作为参数传回。
  - 当前任务名 FText ObjectiveName
  - 决定激活的 bool bIsActive
  - FText GetObjectiveName() const;
  - virtual bool GetIsComplete() const;
  - virtual bool GetIsActive() const;
  - virtual void ActiveObjective();
  - void SetObjectiveName(FText name);

4. Main Character，它负责在 BeginPlay 的时候收集场景内所有的 QuestActor。 

### 创建一个任务

第一种任务为到达指定地点。  

创建一种新任务需要创建一个 QuestActor 的子类和一个 UObjective 的子类。  

- QuestActorChild

  - 若干个 TriggerBox* ，判断是否到达了目的地
  - ConstructRootObjectiveCollection() override; 
    - NewObject 了一个 ObjCollection，给它起个名字，然后设定下 bOrderRequired;
  - PopulateObjectives() override; 
    - NewObject 若干个 ObjectiveChild，每一个都代表一个小任务。
    - 设置 ObjectiveChild 的名字，TriggerBox.
    - 把 ObjectiveChild 添加到 ObjCollection 的 ObjectivesArray 中。

- UObjective Child

  - 一个 TriggerBox* 
  - 判断是否到达目的地的 bool
  - 处理 TriggerBox 触发的函数 HandleOverlapEvent()
    - **触发 OnCompleted 委托**
  - ActiveObjective() override;
    - bActive  = true;
    - 把 HandleOverlapEvent() 绑定到 TriggerBox 的 OnActorOverlapBegin()
  - GetIsComplete() override;
    - return bReached;

  任务完成时，会触发 OnCompleted 委托，这里绑定的是 ObjCollection 的 OnCompleteEvent()。同时因为这是个带一个参数委托，所以这里把 this 传回去后，ObjCollection 也得以知道是哪个 Objective 任务完成了。

```c++
// QuestActorChild.h
UCLASS()
class JQUEST_API AQuestReach : public AQuest
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	class ATriggerBox* MegatonTrigger;

private:
	virtual void PopulateObjectives(UObjCollection* RootCollection) override;

	virtual UObjCollection* ConstructRootObjectiveCollection() override;
};

// QuestActorChild.cpp
void AQuestReach::PopulateObjectives(UObjCollection* RootCollection)
{
	UObjReachDestination* ObjReach = NewObject<UObjReachDestination>(this);
	if (MegatonTrigger)
	{
		ObjReach->DestinationBox = MegatonTrigger;
	}

	ObjReach->SetObjectiveName(FText::FromString("Reached Magaton"));

	RootObjectiveCollection->AddObjective(ObjReach);
}

UObjCollection* AQuestReach::ConstructRootObjectiveCollection()
{
	UObjCollection* UC = NewObject<UObjCollection>(this);

	UC->bOrderRequired = true;
	UC->ObjectiveName = FText(FText::FromString("Long way from home"));

	return UC;
}

// ObjectiveChild.h
UCLASS()
class JQUEST_API UObjReachDestination : public UObjective
{
	GENERATED_BODY()

public:
	// 目的地 TriggerBox
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	ATriggerBox* DestinationBox;

	virtual void ActiveObjective() override;

	virtual bool GetIsComplete() const override;

private:
	bool bReachedDestination = false;

	virtual void HandleOverlapEvent(AActor* OverlappedActor, AActor* OtherActor);
};

// ObjectiveChild.cpp
void UObjReachDestination::ActiveObjective()
{
	Super::ActiveObjective();

	DestinationBox->OnActorBeginOverlap.AddDynamic(this, &UObjReachDestination::HandleOverlapEvent);
}

void UObjReachDestination::HandleOverlapEvent(AActor* OverlappedActor, AActor* OtherActor)
{
	DestinationBox->OnActorBeginOverlap.RemoveDynamic(this, &UObjReachDestination::HandleOverlapEvent);

	bReachedDestination = true;

	OnCompleted.Broadcast(this);
}

bool UObjReachDestination::GetIsComplete() const
{
	return bReachedDestination;
}
```



### 关于一些变量的解析

1. bOrderRequired 是一个 ObjCollection 的重要变量，它决定了此 Collection 下的任务是不是逐一启用的。
2. bIsActive 是一个 Objective 的变量，当 bIsActive == false 时无法完成任务，UI 中不会显示。

