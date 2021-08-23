---
layout:     post
title:      UE Add Module
date:       2021-08-23 00:00:00
author:     Lazarus
summary:    UE
categories: ue  
thumbnail:  ue4
tags:
 - ue4
---

项目在实现可视化的时候用到了添加模块，这里顺便记录下。

## 1. 编辑 uproject 文件

```json
{
	"FileVersion": 3,
	"EngineAssociation": "4.26",
	"Category": "",
	"Description": "",
	"Modules": [
		{
			"Name": "UnLuaTest",
			"Type": "Runtime",
			"LoadingPhase": "Default",
			"AdditionalDependencies": [
				"Engine",
				"CoreUObject"
			]
		},
        // 这一段是新加的
        ///////////////
		{
			"Name": "UnLuaTestEditor",	// module 名称
			"Type": "Editor",
			"LoadingPhase": "PostEngineInit", // 加载阶段
			"AdditionalDependencies": [
				"CoreUObject",
				"Engine"
			]
		}
		/////////////////
	]
}
```

需要注意的是加载阶段不仅影响引擎性能，还影响到一些写在模块内功能的运行，加载的太早会导致功能需求的部分没有加载，导致不能正常运行<br>



## 2. 编辑 xxxxEditor.Target.cs

```json
// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;
using System.Collections.Generic;

public class UnLuaTestEditorTarget : TargetRules
{
	public UnLuaTestEditorTarget( TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V2;
		ExtraModuleNames.AddRange( new string[] { "UnLuaTest", "UnLuaTestEditor" } ); 
	// 加上模块名 "UnLuaTestEditor"
	}
}
```



## 3. 模块 .h .cpp .Build.cs

首先是在项目的 source 文件夹下创建新的模块，文件夹名为模块名，（模块文件夹下建议再新建一个 Public 文件夹和一个 Private 文件夹），目录下再建一个 Modulename.Build.cs 文件。在 Public 文件夹下面添加 ModuleName.h 文件，Private 文件夹下添加 ModuleName.cpp 文件。

```c++
.h
 
#pragma once
#include "Modules/ModuleInterface.h"
#include "Modules/ModuleManager.h"

class FUnLuaTestEditorModule : public IModuleInterface
{
public:
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;
};
```

```c++
.cpp

#include "UnLuaTestEditor.h"
#include "UnrealEd.h"
#include "LineVisualizer.h"
#include "UnLuaTest/LineDraw.h"

// Actually registers the module
IMPLEMENT_GAME_MODULE(FUnLuaTestEditorModule, UnLuaTestEditor);

void FUnLuaTestEditorModule::StartupModule()
{
    /*
	UE_LOG(LogTemp, Warning, TEXT("StartupModule"));
	if (GUnrealEd)
	{
		UE_LOG(LogTemp, Warning, TEXT("OnRegeister"));
		TSharedPtr<FComponentVisualizer> Viz = MakeShareable(new LineVisualizer());

		GUnrealEd->RegisterComponentVisualizer(ULineDraw::StaticClass()->GetFName(), Viz);
		Viz->OnRegister();
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("Regeister failed"));
	}
	*/
}

void FUnLuaTestEditorModule::ShutdownModule()
{
    /*
	if (GUnrealEd)
	{
		GUnrealEd->UnregisterComponentVisualizer(ULineDraw::StaticClass()->GetFName());
	}
	*/
}

```

```json
.Build.cs

using UnrealBuildTool;

public class UnLuaTestEditor : ModuleRules
{
	public UnLuaTestEditor(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		// ComponentViz needed for the objects we're visualizing
		PublicDependencyModuleNames.AddRange(new string[] {  "Core", "Engine", "CoreUObject", "UnluaTest" });
		// Needed for our editor logic
		PrivateDependencyModuleNames.AddRange(new string[] { "UnrealEd" });
	}
}
```

---

最后再右键 uproject 文件选择 generate ，在重新打开编译项目文件就行了，编辑器内新建 C++ 类时记得手动选择所属模块