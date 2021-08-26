---
layout:     post
title:      UE PilotLevelActor
date:       2021-08-26 00:00:00
author:     Lazarus
summary:    UE
categories: ue  
thumbnail:  ue4
tags:
 - ue4
---

# PilotLevelActor()

在 Editor 内选中一个放入到 Level 中的 Actor，右键选择 `Pilot` 或者按  `Ctrl + Shift + P` 都可以直接将视角锁定到目标 Actor 并且可以控制其移动，因为不需要 Play 所以会方便一些，对于一些光源之类 Actor 的调整，通过 Pilot 也可以得到一个比较清晰明了的效果。

## 配置

首先要在 Editor 的 Plugin 里面把 `Editor Scripting Utilities` 这个插件打开

![image-20210826110713276](https://i.loli.net/2021/08/26/v5u4DamdUjAc38Y.png)

然后在 Build.cs 文件里面加上 Module 名 `EditorScriptingUtilities`

```c++
// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class UnLuaTest : ModuleRules
{
	public UnLuaTest(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
	
        // 就是这个 EditorScriptingUtilities
		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "EditorScriptingUtilities" });

		PrivateDependencyModuleNames.AddRange(new string[] {  });

		// Uncomment if you are using Slate UI
		// PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore" });
		
		// Uncomment if you are using online features
		// PrivateDependencyModuleNames.Add("OnlineSubsystem");

		// To include OnlineSubsystemSteam, add it to the plugins section in your uproject file with the Enabled attribute set to true
	}
}

```

---

## 使用

主要就是俩函数，贴一下就完事了

```c++
/* EditorLevelLibrary.h */

/** 开始 Pilot ActorToPilot */	
UFUNCTION(BlueprintCallable, Category = "Editor Scripting | Level Utility", meta=(DevelopmentOnly))
static void PilotLevelActor(AActor* ActorToPilot);

/** 停止 Pliot */
UFUNCTION(BlueprintCallable, Category = "Editor Scripting | Level Utility", meta=(DevelopmentOnly))
static void EjectPilotLevelActor();
```

不行，这样这篇 Blog 太短了，再把实现复制粘贴下凑字数

```c++
void UEditorLevelLibrary::PilotLevelActor(AActor* ActorToPilot)
{
	FLevelEditorModule& LevelEditorModule = FModuleManager::GetModuleChecked<FLevelEditorModule>("LevelEditor");

	TSharedPtr<SLevelViewport> ActiveLevelViewport = LevelEditorModule.GetFirstActiveLevelViewport();
	if (ActiveLevelViewport.IsValid())
	{
		FLevelEditorViewportClient& LevelViewportClient = ActiveLevelViewport->GetLevelViewportClient();

		LevelViewportClient.SetActorLock(ActorToPilot);
		if (LevelViewportClient.IsPerspective() && LevelViewportClient.GetActiveActorLock().IsValid())
		{
			LevelViewportClient.MoveCameraToLockedActor();
		}
	}
}

void UEditorLevelLibrary::EjectPilotLevelActor()
{
	FLevelEditorModule& LevelEditorModule = FModuleManager::GetModuleChecked<FLevelEditorModule>("LevelEditor");

	TSharedPtr<SLevelViewport> ActiveLevelViewport = LevelEditorModule.GetFirstActiveLevelViewport();
	if (ActiveLevelViewport.IsValid())
	{
		FLevelEditorViewportClient& LevelViewportClient = ActiveLevelViewport->GetLevelViewportClient();

		if (AActor* LockedActor = LevelViewportClient.GetActiveActorLock().Get())
		{
			//// Check to see if the locked actor was previously overriding the camera settings
			//if (CanGetCameraInformationFromActor(LockedActor))
			//{
			//	// Reset the settings
			//	LevelViewportClient.ViewFOV = LevelViewportClient.FOVAngle;
			//}

			LevelViewportClient.SetActorLock(nullptr);

			// remove roll and pitch from camera when unbinding from actors
			GEditor->RemovePerspectiveViewRotation(true, true, false);
		}
	}
}
```

---

