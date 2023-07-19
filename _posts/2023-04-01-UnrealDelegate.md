---
layout:     post
title:      Unreal Delegate
date:       2023-04-01 00:00:00
author:     Lazarus
summary:    UE
categories: ue 
thumbnail:  ue4
tags:
 - ue c++
---

## 官方 Quick Start  

在我看来大概的流程就是
1. 创建一个委托类，由这个类的一个实例来完成委托
    ``` c++
    DECLARE_DELEGATE(FOnBossDiedDelegate);

    FOnBossDiedDelegate OnBossDied;
    ```  

2. 触发委托 / 回调函数  
    ```c++
    OnBossDied.ExecuteIfBound();
    ```  

3. 执行者 / 回调函数  
    - BossActorRef 是一个包含 FOnBossDiedDelegate 实例 (OnBossDied) 的类的实例（绕口令  
    - 这里通过调用 OnBossDied 的 BindUobject 函数来把执行者 (ADoorActor) 的 BossDiedEventFunction 绑定到委托上  

    ```c++
    BossActorRef->OnBossDied.BindUObject(this, &ADoorActor::BossDiedEventFunction);
    ```

### Sample Codes
``` c++
// BossActor.h
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "BossActor.generated.h"

DECLARE_DELEGATE(FOnBossDiedDelegate);

UCLASS()
class DELEGATE_API ABossActor : public AActor
{
	GENERATED_BODY()
	
public:	
	// Sets default values for this actor's properties
	ABossActor();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

	UFUNCTION()
	void HandleBossDiedEvent();

	UPROPERTY(EditInstanceOnly, BlueprintReadWrite)
	class UBoxComponent* BoxComp;

	virtual void NotifyActorBeginOverlap(AActor* OtherActor) override;
	
public:	
	// Called every frame
	virtual void Tick(float DeltaTime) override;

	FOnBossDiedDelegate OnBossDied;
};

// BossActor.cpp
#include "BossActor.h"
#include "Components/BoxComponent.h"

// Sets default values
ABossActor::ABossActor()
{
 	// Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;

	BoxComp = CreateDefaultSubobject<UBoxComponent>(TEXT("BoxCom"));
	BoxComp->SetBoxExtent(FVector(128, 128, 64));
	BoxComp->SetVisibility(true);
}

// Called when the game starts or when spawned
void ABossActor::BeginPlay()
{
	Super::BeginPlay();
	
}

// Called every frame
void ABossActor::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

}

void ABossActor::HandleBossDiedEvent()
{
	OnBossDied.ExecuteIfBound();
}

void ABossActor::NotifyActorBeginOverlap(AActor* OtherActor)
{
	HandleBossDiedEvent();
}

// DoorActor.h
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/TimelineComponent.h"
#include "DoorActor.generated.h"

UCLASS()
class DELEGATE_API ADoorActor : public AActor
{
	GENERATED_BODY()
	
public:	
	// Sets default values for this actor's properties
	ADoorActor();

	UPROPERTY(EditInstanceOnly)
	UCurveFloat* DoorTimelineFloatCurve;

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

	void BossDiedEventFunction();

	UPROPERTY(EditInstanceOnly, BlueprintReadWrite)
	class ABossActor* BossActorRef;

	UPROPERTY(VisibleAnywhere, BlueprintReadWrite)
	UStaticMeshComponent* DoorFrame;

	UPROPERTY(VisibleAnywhere, BlueprintReadWrite)
	UStaticMeshComponent* Door;

	UPROPERTY(VisibleAnywhere, BlueprintReadWrite)
	UTimelineComponent* DoorTimeLineComp;

	FOnTimelineFloat UpdateFunctionFloat;

	UFUNCTION()
	void UpdateTimeLineComp(float Output);

public:	
	// Called every frame
	virtual void Tick(float DeltaTime) override;

};

// DoorActor.cpp
#include "DoorActor.h"
#include "BossActor.h"

// Sets default values
ADoorActor::ADoorActor()
{
 	// Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;

	// 设置默认组件
	DoorFrame = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DoorFrameMesh"));
	Door = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DoorMesh"));
	DoorTimeLineComp = CreateDefaultSubobject<UTimelineComponent>(TEXT("DoorTimeLineComp"));

	// 设置绑定
	DoorFrame->SetupAttachment(RootComponent);
	Door->AttachToComponent(DoorFrame, FAttachmentTransformRules::KeepRelativeTransform);
	Door->SetRelativeLocation(FVector(0, 45, 0));
}

// Called when the game starts or when spawned
void ADoorActor::BeginPlay()
{
	Super::BeginPlay();

	UpdateFunctionFloat.BindDynamic(this, &ADoorActor::UpdateTimeLineComp);

	if (DoorTimelineFloatCurve)
	{
		DoorTimeLineComp->AddInterpFloat(DoorTimelineFloatCurve, UpdateFunctionFloat);
	}

	if (BossActorRef)
	{
		BossActorRef->OnBossDied.BindUObject(this, &ADoorActor::BossDiedEventFunction);
	}
}

void ADoorActor::BossDiedEventFunction()
{
	DoorTimeLineComp->Play();
}

void ADoorActor::UpdateTimeLineComp(float Output)
{
	FRotator DoorNewRotation = FRotator(0.0f, Output, 0.0f);
	Door->SetRelativeRotation(DoorNewRotation);
}


// Called every frame
void ADoorActor::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

}

```

## 多播委托

上面样例运用了无参数，无返回值的单播委托，虽然很简洁，但是单播委托是一对一绑定的。无法解决存在多个物体要对委托做出回应的问题。
> “单播委托只能绑定一个回调函数,新绑定的会覆盖旧的,因此被称为单播。”

想要使用多播委托，需要对以下几处进行修改  
```c++
// DECLARE_DELEGATE(FOnBossDiedDelegate);
DECLARE_MULTICAST_DELEGATE(FOnBossDiedDelegate);

// OnBossDied.ExecuteIfBound();
OnBossDied.Broadcast();

// BossActorRef->OnBossDied.BindUObject(this, &ADoorActor::BossDiedEventFunction);
BossActorRef->OnBossDied.AddUObject(this, &ADoorActor::BossDiedEventFunction);
```



**ref:**  
[[UE4 C++入门到进阶] 4.Delegate(委托)](bilibili.com/read/cv9602026)  

[[UE 官方文档] Delegate](docs.unrealengine.com/4.27/zh-CN/ProgrammingAndScripting/ProgrammingWithCPP/UnrealArchitecture/Delegates/)  

[[UE 官方入门教程] EventDispatcherQuickStart](docs.unrealengine.com/4.27/zh-CN/ProgrammingAndScripting/ActorCommunication/EventDispatcherQuickStart/)