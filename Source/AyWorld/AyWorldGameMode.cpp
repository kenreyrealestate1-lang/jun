// Source/AyWorld/AyWorldGameMode.cpp
#include "AyWorldGameMode.h"
#include "AyWorldCharacter.h"
#include "AyWorldUIPlayerController.h"
#include "GameFramework/PlayerStart.h"
#include "Kismet/GameplayStatics.h"

AAyWorldGameMode::AAyWorldGameMode()
{
	DefaultPawnClass = AAyWorldCharacter::StaticClass();
	PlayerControllerClass = AAyWorldUIPlayerController::StaticClass();
}

AActor* AAyWorldGameMode::ChoosePlayerStart_Implementation(AController* Player)
{
	TArray<AActor*> PlayerStarts;
	UGameplayStatics::GetAllActorsOfClass(this, APlayerStart::StaticClass(), PlayerStarts);

	for (AActor* Start : PlayerStarts)
	{
		APlayerStart* PStart = Cast<APlayerStart>(Start);
		if (PStart && PStart->PlayerStartTag == FName("Belvedere_Spawn"))
		{
			return PStart;
		}
	}

	return Super::ChoosePlayerStart_Implementation(Player);
}
