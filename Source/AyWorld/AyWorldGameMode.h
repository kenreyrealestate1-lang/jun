// Source/AyWorld/AyWorldGameMode.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "AyWorldGameMode.generated.h"

UCLASS(minimalapi)
class AAyWorldGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AAyWorldGameMode();

	virtual AActor* ChoosePlayerStart_Implementation(AController* Player) override;
};
