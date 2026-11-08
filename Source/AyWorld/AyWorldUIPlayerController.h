// Source/AyWorld/AyWorldUIPlayerController.h
// Contrôleur de joueur avec gestion des menus CommonUI et du mode pause
// AyWorld - Claude Edition (Phase 4)
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "AyWorldUIPlayerController.generated.h"

class UUserWidget;

UCLASS()
class AYWORLD_API AAyWorldUIPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	AAyWorldUIPlayerController();

protected:
	virtual void BeginPlay() override;
	virtual void SetupInputComponent() override;

public:
	// Bascule du menu pause sur touche Échap ou Bouton Manette Start
	UFUNCTION(BlueprintCallable, Category = "AyWorld|UI")
	void TogglePauseMenu();

	// Affichage / Masquage du panneau d'options
	UFUNCTION(BlueprintCallable, Category = "AyWorld|UI")
	void ShowOptionsMenu();

	UFUNCTION(BlueprintCallable, Category = "AyWorld|UI")
	void CloseOptionsMenu();

	// Application des paramètres de jeu en direct
	UFUNCTION(BlueprintCallable, Category = "AyWorld|Settings")
	void ApplyGameSettings(float InMouseSensitivity, float InFOV, bool bInHeadBob, float InMasterVolume, int32 InGraphicsPreset);

protected:
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "AyWorld|UI")
	TSubclassOf<UUserWidget> HUDWidgetClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "AyWorld|UI")
	TSubclassOf<UUserWidget> PauseMenuWidgetClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "AyWorld|UI")
	TSubclassOf<UUserWidget> OptionsWidgetClass;

private:
	UPROPERTY()
	TObjectPtr<UUserWidget> ActiveHUDWidget;

	UPROPERTY()
	TObjectPtr<UUserWidget> ActivePauseWidget;

	UPROPERTY()
	TObjectPtr<UUserWidget> ActiveOptionsWidget;

	bool bIsPauseActive = false;
};
