---
layout:     post
title:      UE4 Camera
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
```cpp
inline void USplineComponent::AddSplineWorldPoint(const FVector& Position) 
{ AddSplinePoint(Position, ESplineCoordinateSpace::World); }

inline void USplineComponent::AddSplineLocalPoint(const FVector& Position) 
{ AddSplinePoint(Position, ESplineCoordinateSpace::Local); }

inline void USplineComponent::SetSplineWorldPoints(const TArray<FVector>& Points) 
{ SetSplinePoints(Points, ESplineCoordinateSpace::World); }

inline void USplineComponent::SetSplineLocalPoints(const TArray<FVector>& Points) 
{ SetSplinePoints(Points, ESplineCoordinateSpace::Local); }

inline void USplineComponent::SetWorldLocationAtSplinePoint(int32 PointIndex, const FVector& InLocation) 
{ SetLocationAtSplinePoint(PointIndex, InLocation, ESplineCoordinateSpace::World); }

inline FVector USplineComponent::GetWorldLocationAtSplinePoint(int32 PointIndex) 
const { return GetLocationAtSplinePoint(PointIndex, ESplineCoordinateSpace::World); }

inline void USplineComponent::GetLocalLocationAndTangentAtSplinePoint(int32 PointIndex, FVector& LocalLocation, FVector& LocalTangent) 
const { GetLocationAndTangentAtSplinePoint(PointIndex, LocalLocation, LocalTangent, ESplineCoordinateSpace::Local); }

inline FVector USplineComponent::GetWorldLocationAtDistanceAlongSpline(float Distance) const 
{ return GetLocationAtDistanceAlongSpline(Distance, ESplineCoordinateSpace::World); }

inline FVector USplineComponent::GetWorldDirectionAtDistanceAlongSpline(float Distance) const 
{ return GetDirectionAtDistanceAlongSpline(Distance, ESplineCoordinateSpace::World); }

inline FVector USplineComponent::GetWorldTangentAtDistanceAlongSpline(float Distance) const 
{ return GetTangentAtDistanceAlongSpline(Distance, ESplineCoordinateSpace::World); }

inline FRotator USplineComponent::GetWorldRotationAtDistanceAlongSpline(float Distance) const 
{ return GetRotationAtDistanceAlongSpline(Distance, ESplineCoordinateSpace::World); }

inline FVector USplineComponent::GetWorldLocationAtTime(float Time, bool bUseConstantVelocity) const 
{ return GetLocationAtTime(Time, ESplineCoordinateSpace::World, bUseConstantVelocity); }

inline FVector USplineComponent::GetWorldDirectionAtTime(float Time, bool bUseConstantVelocity) const 
{ return GetDirectionAtTime(Time, ESplineCoordinateSpace::World, bUseConstantVelocity); }

inline FRotator USplineComponent::GetWorldRotationAtTime(float Time, bool bUseConstantVelocity) const 
{ return GetRotationAtTime(Time, ESplineCoordinateSpace::World, bUseConstantVelocity); }
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
<br>

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
