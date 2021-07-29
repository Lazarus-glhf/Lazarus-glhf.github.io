---
layout:     post
title:      UE4 镜头脚本开发
date:       2021-07-29 15:03:00
author:     Lazarus
summary:    UE
categories: ue  
thumbnail:  ue4
tags:
 - ue4
---

## Spline

**Basic Operations in "SplineComponent.h"**
```CPP
/** Adds an FSplinePoint to the spline. This contains its input key, position, tangent, rotation and scale. */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void AddPoint(const FSplinePoint& Point, bool bUpdateSpline = true);

	/** Adds an array of FSplinePoints to the spline. */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void AddPoints(const TArray<FSplinePoint>& Points, bool bUpdateSpline = true);

	/** Adds a point to the spline */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void AddSplinePoint(const FVector& Position, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Adds a point to the spline at the specified index */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void AddSplinePointAtIndex(const FVector& Position, int32 Index, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Removes point at specified index from the spline */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void RemoveSplinePoint(int32 Index, bool bUpdateSpline = true);

	/** Adds a world space point to the spline */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use AddSplinePoint, specifying SplineCoordinateSpace::World"))
	void AddSplineWorldPoint(const FVector& Position);

	/** Adds a local space point to the spline */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use AddSplinePoint, specifying SplineCoordinateSpace::Local"))
	void AddSplineLocalPoint(const FVector& Position);

	/** Sets the spline to an array of points */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetSplinePoints(const TArray<FVector>& Points, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Sets the spline to an array of world space points */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use SetSplinePoints, specifying SplineCoordinateSpace::World"))
	void SetSplineWorldPoints(const TArray<FVector>& Points);

	/** Sets the spline to an array of local space points */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use SetSplinePoints, specifying SplineCoordinateSpace::Local"))
	void SetSplineLocalPoints(const TArray<FVector>& Points);

	/** Move an existing point to a new location */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetLocationAtSplinePoint(int32 PointIndex, const FVector& InLocation, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Move an existing point to a new world location */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use SetLocationAtSplinePoint, specifying SplineCoordinateSpace::World"))
	void SetWorldLocationAtSplinePoint(int32 PointIndex, const FVector& InLocation);

	/** Specify the tangent at a given spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetTangentAtSplinePoint(int32 PointIndex, const FVector& InTangent, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Specify the tangents at a given spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetTangentsAtSplinePoint(int32 PointIndex, const FVector& InArriveTangent, const FVector& InLeaveTangent, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Specify the up vector at a given spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetUpVectorAtSplinePoint(int32 PointIndex, const FVector& InUpVector, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Set the rotation of an existing spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetRotationAtSplinePoint(int32 PointIndex, const FRotator& InRotation, ESplineCoordinateSpace::Type CoordinateSpace, bool bUpdateSpline = true);

	/** Set the scale at a given spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetScaleAtSplinePoint(int32 PointIndex, const FVector& InScaleVector, bool bUpdateSpline = true); 

	/** Get the type of a spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	ESplinePointType::Type GetSplinePointType(int32 PointIndex) const;

	/** Specify the type of a spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	void SetSplinePointType(int32 PointIndex, ESplinePointType::Type Type, bool bUpdateSpline = true);

	/** Get the number of points that make up this spline */
	UFUNCTION(BlueprintCallable, Category = Spline)
	int32 GetNumberOfSplinePoints() const;

	/** Get the number of segments that make up this spline */
	UFUNCTION(BlueprintCallable, Category = Spline)
	int32 GetNumberOfSplineSegments() const;

	/** Get the location at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetLocationAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the world location at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use GetLocationAtSplinePoint, specifying SplineCoordinateSpace::World"))
	FVector GetWorldLocationAtSplinePoint(int32 PointIndex) const;

	/** Get the direction at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetDirectionAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the tangent at spline point. This fetches the Leave tangent of the point. */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetTangentAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the arrive tangent at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetArriveTangentAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the leave tangent at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetLeaveTangentAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the rotation at spline point as a quaternion */
	FQuat GetQuaternionAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the rotation at spline point as a rotator */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FRotator GetRotationAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the up vector at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetUpVectorAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the right vector at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetRightVectorAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the amount of roll at spline point, in degrees */
	UFUNCTION(BlueprintCallable, Category = Spline)
	float GetRollAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get the scale at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetScaleAtSplinePoint(int32 PointIndex) const;

	/** Get the transform at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FTransform GetTransformAtSplinePoint(int32 PointIndex, ESplineCoordinateSpace::Type CoordinateSpace, bool bUseScale = false) const;

	/** Get location and tangent at a spline point */
	UFUNCTION(BlueprintCallable, Category=Spline)
	void GetLocationAndTangentAtSplinePoint(int32 PointIndex, FVector& Location, FVector& Tangent, ESplineCoordinateSpace::Type CoordinateSpace) const;

	/** Get local location and tangent at a spline point */
	UFUNCTION(BlueprintCallable, Category = Spline, meta = (DeprecatedFunction, DeprecationMessage = "Please use GetLocationAndTangentAtSplinePoint, specifying SplineCoordinateSpace::Local"))
	void GetLocalLocationAndTangentAtSplinePoint(int32 PointIndex, FVector& LocalLocation, FVector& LocalTangent) const;

	/** Get the distance along the spline at the spline point */
	UFUNCTION(BlueprintCallable, Category=Spline)
	float GetDistanceAlongSplineAtSplinePoint(int32 PointIndex) const;

    /** Get a metadata property float value along the spline at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	float GetFloatPropertyAtSplinePoint(int32 Index, FName PropertyName) const;
	
 	/** Get a metadata property vector value along the spline at spline point */
	UFUNCTION(BlueprintCallable, Category = Spline)
	FVector GetVectorPropertyAtSplinePoint(int32 Index, FName PropertyName) const;

	/** Returns total length along this spline */
	UFUNCTION(BlueprintCallable, Category=Spline) 
	float GetSplineLength() const;
```
<br>

**Here is my code part**

```cpp
// Create a TArray<FVector> to save the locations of spline points
TArray<FVector> Locations;
Spline->SetSplineLocalPoints(Locations); // Add points by the locations of points

void ASplineCamera::MoveAlongSpline()
{
    FVector TargetLocation;
    if (Target)
    {
        TargetLocation = Target->GetActorLocation();
    }
    if (MyCameraActor)
    {
        // Update Camera Location every tick
        MyCameraActor->SetActorLocation(Spline->GetLocationAtTime(TotalTime,ESplineCoordinateSpace::World, false));
        MyCameraActor->SetActorRotation(UKismetMathLibrary::FindLookAtRotation(MyCameraActor->GetActorLocation(), TargetLocation));
    }
}
```

---

## UE FileIO

```cpp

	/**
	 * Load a text file to an FString.
	 * Supports all combination of ANSI/Unicode files and platforms.
	*/
	static void BufferToString( FString& Result, const uint8* Buffer, int32 Size );

	/**
	 * Load a binary file to a dynamic array with two uninitialized bytes at end as padding.
	 *
	 * @param Result    Receives the contents of the file
	 * @param Filename  The file to read
	 * @param Flags     Flags to pass to IFileManager::CreateFileReader
	*/
	static bool LoadFileToArray( TArray<uint8>& Result, const TCHAR* Filename, uint32 Flags = 0 );

	/**
	 * Load a binary file to a dynamic array with two uninitialized bytes at end as padding.
	 *
	 * @param Result    Receives the contents of the file
	 * @param Filename  The file to read
	 * @param Flags     Flags to pass to IFileManager::CreateFileReader
	*/
	static bool LoadFileToArray( TArray64<uint8>& Result, const TCHAR* Filename, uint32 Flags = 0 );

	/**
	 * Load a text file to an FString. Supports all combination of ANSI/Unicode files and platforms.
	 *
	 * @param Result       String representation of the loaded file
	 * @param Archive      Name of the archive to load from
	 * @param VerifyFlags  Flags controlling the hash verification behavior ( see EHashOptions )
	 */
	static bool LoadFileToString(FString& Result, FArchive& Reader, EHashOptions VerifyFlags = EHashOptions::None);

	/**
	 * Load a text file to an FString. Supports all combination of ANSI/Unicode files and platforms.
	 *
	 * @param Result       String representation of the loaded file
	 * @param Filename     Name of the file to load
	 * @param VerifyFlags  Flags controlling the hash verification behavior ( see EHashOptions )
	 */
	static bool LoadFileToString( FString& Result, const TCHAR* Filename, EHashOptions VerifyFlags = EHashOptions::None, uint32 ReadFlags = 0 );

	/**
	 * Load a text file to an FString. Supports all combination of ANSI/Unicode files and platforms.
	 *
	 * @param Result       String representation of the loaded file
	 * @param PlatformFile PlatformFile interface to use
	 * @param Filename     Name of the file to load
	 * @param VerifyFlags  Flags controlling the hash verification behavior ( see EHashOptions )
	 */
	static bool LoadFileToString(FString& Result, IPlatformFile* PlatformFile, const TCHAR* Filename, EHashOptions VerifyFlags = EHashOptions::None);

	/**
	 * Load a text file to an array of strings. Supports all combination of ANSI/Unicode files and platforms.
	 *
	 * @param Result       String representation of the loaded file
	 * @param Filename     Name of the file to load
	 */
	static bool LoadFileToStringArray( TArray<FString>& Result, const TCHAR* Filename );
```
<br>

**My Code Part**

```cpp
TArray<FString> StringArray; // FString Array to save data from FilePath
TArray<FVector> LocationArray; // Location Array to save data transform from file
FString FilePath; // File path
FVector Location; // tmp
FFileHelper::LoadFileToStringArray(StringArray, *FilePath);
for (auto &Str : File)
{
    // Translate a formate FString to FVector, return flag to judge success
    UKismetStringLibrary::Conv_StringToVector(Str, Location, flag); 
    if (flag)
    {
        UE_LOG(LogTemp, Warning, TEXT("%s"), *Str);
        Locations.Add(Location);
    }
}

// Set spline points
Spline->SetSplineLocalPoints(Locations);
```
---
<br>

**Get Actors From Level**

```cpp
// TMap to save Actors from the level
TMap<int,AActor*> LevelActors;

AActor* Target;

// Use "TActorIterator" to traverse actors in the level
for (TActorIterator<AActor> ActorItr(GetWorld()); ActorItr; ++ActorItr)
{
    LevelActors.Add(++Index, *ActorItr);
}

// Find Target Actor by "MyKey"
if (MyKey <= Index && MyKey != 0)
{
    UE_LOG(LogTemp, Warning, TEXT("Geting Target"));
    Target = *LevelActors.Find(MyKey);
}

// Camera attach to Target 
// 如果不附加至 Target, 则在 FollowCamera 视角下，Target 往返运动时，视角会有延迟
MyCameraActor->AttachToActor(Target, FAttachmentTransformRules::SnapToTargetNotIncludingScale, FName("RootComponent"));
```
---
<br>

## Spawn Custom Actor

```cpp
#include "MyCameraActor.h"

AMyCameraActor* MyCameraActor;
if (GetWorld())
{
    MyCameraActor = GetWorld()->SpawnActor<AMyCameraActor>();
    UE_LOG(LogTemp,Warning, TEXT("MyCamera has spwaned"));
}

```
