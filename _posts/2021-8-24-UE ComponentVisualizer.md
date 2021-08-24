---
layout:     post
title:      UE ComponentVisualizer
date:       2021-08-24 00:00:00
author:     Lazarus
summary:    UE
categories: ue  
thumbnail:  ue4
tags:
 - ue4
---

利用 ComponentVisualizer 可视化在编辑器视口内画出相机脚本的运行轨迹。

## 1. 创建一个 Module，修改 Build.cs 和 .cpp 文件如下

``` json
.Build.cs

using UnrealBuildTool;

public class UnLuaTestEditor : ModuleRules
{
public UnLuaTestEditor(ReadOnlyTargetRules Target) : base(Target)
{
 PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
 // ComponentViz needed for the objects we're visualizing
 PublicDependencyModuleNames.AddRange(new string[] {  "Core",
     "Engine", "CoreUObject", "UnluaTest" });
        
 // Needed for our editor logic
       // 这里加入 UnrealEd 模块
 PrivateDependencyModuleNames.AddRange(new string[] { "UnrealEd" });	
}
}
```

```c++
#include "UnLuaTestEditor.h"
#include "UnrealEd.h"
#include "LineVisualizer.h"
#include "UnLuaTest/LineDraw.h"

// Actually registers the module
IMPLEMENT_GAME_MODULE(FUnLuaTestEditorModule, UnLuaTestEditor);

void FUnLuaTestEditorModule::StartupModule()
{
 UE_LOG(LogTemp, Warning, TEXT("StartupModule"));
 if (GUnrealEd)
 {
  UE_LOG(LogTemp, Warning, TEXT("OnRegeister"));
  TSharedPtr<FComponentVisualizer> Viz = 
        MakeShareable(new LineVisualizer());	

        // ULineDraw 为 自定义 ActorComponent, 这里对其注册 ComponentVisualizer
  GUnrealEd->RegisterComponentVisualizer
        (ULineDraw::StaticClass()->GetFName(), Viz);
  Viz->OnRegister();
 }
 else
 {
  UE_LOG(LogTemp, Warning, TEXT("Regeister failed"));
 }
}

void FUnLuaTestEditorModule::ShutdownModule()
{
 if (GUnrealEd)
 {
  GUnrealEd->UnregisterComponentVisualizer
        (ULineDraw::StaticClass()->GetFName());
 }
}

```

---



## 2. ActorComponent

在编辑器默认 Module 下创建一 ActorComponent, ActorComponent 内主要存储画线所需要的信息，如点的位置，以及一些增加易用性的函数等

```c++
.h
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "PointActor.h"
#include "Components/ActorComponent.h"
#include "Curves/CurveVector.h"
#include "LineDraw.generated.h"

UCLASS( ClassGroup=(Custom), meta=(BlueprintSpawnableComponent) )
class UNLUATEST_API ULineDraw : public UActorComponent
{
 GENERATED_BODY()

public:	
 // Sets default values for this component's properties
 ULineDraw();

protected:
 // Called when the game starts
 virtual void BeginPlay() override;

public:	
 // Called every frame
 virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

    /** Spawn Actor 的种类 */
 UPROPERTY()
 TSubclassOf<APointActor> ActorToSpawn;

    /** 点的集合 */
 UPROPERTY(EditAnywhere, BlueprintReadWrite)
 TArray<APointActor*> PointActors;

    /** 画线信息来源的 Curve, 增加的点的值最终也是更新到 Curve 上 */
 UPROPERTY(EditAnywhere)
 UCurveVector* Points;

    /** 是否以 Component Owner 的坐标为起点 */
 UPROPERTY(EditAnywhere)
 bool bDrawFromActor;

    /** 添加一个点 */
 UFUNCTION(CallInEditor, Category="Custom Point")
 void AddPoints();

    /** 销毁所有的点，重置 Curve 数据 */
 UFUNCTION(CallInEditor, Category="Custom Point")
 void ClearAllPoints();
 
private:
    /**AddPoint() 生成 Point 对应 Curve 上的默认 Key 值
 * 每次调用 +2
 */
 float PointDefaultTime = 0;
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

.cpp
    
// Fill out your copyright notice in the Description page of Project Settings.

#include "LineDraw.h"
#include "GetMeshSizeInterface.h"

// Sets default values for this component's properties
ULineDraw::ULineDraw()
{
 // Set this component to be initialized when the game starts, and to be ticked every frame.  You can turn these features
 // off to improve performance if you don't need them.
 PrimaryComponentTick.bCanEverTick = true;
 bDrawFromActor = true;
 // ...
}

// Called when the game starts
void ULineDraw::BeginPlay()
{
 Super::BeginPlay();
 // ...
}

// Called every frame
void ULineDraw::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
 Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
 // ...
}

void ULineDraw::AddPoints()
{
 if (ActorToSpawn)
 {
  UWorld* MyWorld = GetWorld();

  if (MyWorld)
  {
   APointActor* Point = MyWorld->SpawnActor<APointActor>(ActorToSpawn, this->GetOwner()->GetActorLocation(), FRotator(0.f));
   PointActors.Add(Point);
   Point->AttachToActor(this->GetOwner(), FAttachmentTransformRules::KeepWorldTransform);
   Point->Time = PointDefaultTime;
   PointDefaultTime += 2;
  }
 }
}

void ULineDraw::ClearAllPoints()
{
 for (APointActor* point : PointActors)
 {
  point->Destroy();
 }
 PointActors.Reset();
 Points->ResetCurve();
}

```

这里因为功能需求，我自己实现了个类似于 SplineComponent  的功能，可以在编辑器内设置线上的点。这里直接用一个自定义的 Actor : "APointActor", 作为点，如果直接 Spawn 默认的 Actor 的话生成的 Actor 是不带 SceneComponent 的，也就是没有 Transform 属性，毕竟 UE Actor 的属性什么的都是通过挂载 Component 实现的，隔壁 Unity 好歹出生自带 Transform, UE 是真的啥也不带

---



## 3.  FComponentVisualizer

终于到了实现画线的部分，这里在自定义的 Module 下新建一空的 C++ 类， 然后让其继承自 FComponentVisualizer

```c++
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "ComponentVisualizer.h"


/**
 * 
 */
class UNLUATESTEDITOR_API LineVisualizer : public FComponentVisualizer 
{
virtual void DrawVisualization(const UActorComponent* Component, const FSceneView* View, FPrimitiveDrawInterface* PDI) override;
};

```

只需要重写 `DrawVisualization()` 这一个函数就可以了

```c++
// Fill out your copyright notice in the Description page of Project Settings.


#include "LineVisualizer.h"
#include "SceneManagement.h"
#include "UnLuaTest/LineDraw.h"

void LineVisualizer::DrawVisualization(const UActorComponent* Component, const FSceneView* View, FPrimitiveDrawInterface* PDI)
{
 // UE_LOG(LogTemp, Warning, TEXT("Drawing"));
 const ULineDraw* LineDrawer = Cast<const ULineDraw>(Component);
 
    // 获取组件所在 Actor 的坐标
 FVector ActorLocation= LineDrawer->GetOwner()->GetTargetLocation();
 
 if (LineDrawer->Points != nullptr)
 {
  float Time = 0;
  float MaxTime;
  UCurveVector* Curve = LineDrawer->Points;

        // 将 PointActor 点的信息写入到 Curve 里面
  for (int i = 0; i < LineDrawer->PointActors.Num(); i++)
  {
   APointActor* Point = LineDrawer->PointActors[i];
   FVector Val = Point->GetActorLocation() - LineDrawer->GetOwner()->GetActorLocation();

   FKeyHandle Key = Curve->FloatCurves[0].UpdateOrAddKey(Point->Time, Val.X);
   Curve->FloatCurves[0].SetKeyInterpMode(Key, ERichCurveInterpMode::RCIM_Cubic);
   
   Key = Curve->FloatCurves[1].UpdateOrAddKey(Point->Time, Val.Y);
   Curve->FloatCurves[1].SetKeyInterpMode(Key, ERichCurveInterpMode::RCIM_Cubic);
   
   Key = Curve->FloatCurves[2].UpdateOrAddKey(Point->Time, Val.Z);
   Curve->FloatCurves[2].SetKeyInterpMode(Key, ERichCurveInterpMode::RCIM_Cubic);
  }
  
        /** 获取 Curve 所有值的时间区间 */
  Curve->GetTimeRange(Time, MaxTime);
  
        /** 画出整个 Curve 曲线 */
  while (Time < MaxTime)
  {
   FVector Start = LineDrawer->Points->GetVectorValue(Time) + ActorLocation;
   FVector End = LineDrawer->Points->GetVectorValue(Time + 0.1) + ActorLocation;
   
   PDI->DrawLine(Start, End, FLinearColor::Red, SDPG_World, 2.0f);
   
   Time += 0.1;
  }
 }
}


```

上述代码参杂了太多的我个人项目所需的代码逻辑，其实核心代码就是简简单单的一行<br>

`PDI->DrawLine(Start, End, FLinearColor::Red, SDPG_World, 2.0f);` <br>

我们看下 `DrawLine()` 的声明 <br>

```c++
 virtual void DrawLine(
  const FVector& Start,
  const FVector& End,
  const FLinearColor& Color,
  uint8 DepthPriorityGroup,
  float Thickness = 0.0f,
  float DepthBias = 0.0f,
  bool bScreenSpace = false
  ) = 0;
```

很清晰了，就是这些参数。<br>

其实原本是准备用 MeshComponent 来画线的，顺便学习下怎么自定义一个 Mesh，但属实能力不够只能先用 Visualizer 凑合凑合，有时间搞定了 Mesh 到时候再发一篇。