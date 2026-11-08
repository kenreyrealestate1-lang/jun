// Source/AyWorld/AyWorldUIPlayerController.cpp
#include "AyWorldUIPlayerController.h"
#include "Blueprint/UserWidget.h"
#include "Kismet/GameplayStatics.h"
#include "AyWorldCharacter.h"
#include "Camera/CameraComponent.h"

AAyWorldUIPlayerController::AAyWorldUIPlayerController()
{
	bShowMouseCursor = false;
	bEnableClickEvents = false;
	bEnableMouseOverEvents = false;
}

void AAyWorldUIPlayerController::BeginPlay()
{
	Super::BeginPlay();

	// Création du HUD boussole en début de partie
	if (HUDWidgetClass)
	{
		ActiveHUDWidget = CreateWidget<UUserWidget>(this, HUDWidgetClass);
		if (ActiveHUDWidget)
		{
			ActiveHUDWidget->AddToViewport(0);
		}
	}

	// Mode d'entrée standard en jeu : contrôle exclusif du personnage
	FInputModeGameOnly InputMode;
	SetInputMode(InputMode);
}

void AAyWorldUIPlayerController::SetupInputComponent()
{
	Super::SetupInputComponent();

	if (InputComponent)
	{
		InputComponent->BindAction("Pause", IE_Pressed, this, &AAyWorldUIPlayerController::TogglePauseMenu).bExecuteWhenPaused = true;
	}
}

void AAyWorldUIPlayerController::TogglePauseMenu()
{
	if (!PauseMenuWidgetClass)
	{
		return;
	}

	bIsPauseActive = !bIsPauseActive;

	if (bIsPauseActive)
	{
		// Création ou affichage du widget de pause
		if (!ActivePauseWidget)
		{
			ActivePauseWidget = CreateWidget<UUserWidget>(this, PauseMenuWidgetClass);
		}

		if (ActivePauseWidget && !ActivePauseWidget->IsInViewport())
		{
			ActivePauseWidget->AddToViewport(10);
		}

		// Met le jeu en pause (moteur stoppé sauf audio UI)
		UGameplayStatics::SetGamePaused(this, true);

		// Configuration du focus et affichage du curseur souris
		bShowMouseCursor = true;
		FInputModeGameAndUI InputMode;
		InputMode.SetWidgetToFocus(ActivePauseWidget ? ActivePauseWidget->TakeWidget() : TSharedPtr<SWidget>());
		InputMode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
		SetInputMode(InputMode);
	}
	else
	{
		// Fermeture de la pause et reprise
		if (ActivePauseWidget && ActivePauseWidget->IsInViewport())
		{
			ActivePauseWidget->RemoveFromParent();
		}
		if (ActiveOptionsWidget && ActiveOptionsWidget->IsInViewport())
		{
			ActiveOptionsWidget->RemoveFromParent();
		}

		UGameplayStatics::SetGamePaused(this, false);

		bShowMouseCursor = false;
		FInputModeGameOnly InputMode;
		SetInputMode(InputMode);
	}
}

void AAyWorldUIPlayerController::ShowOptionsMenu()
{
	if (!OptionsWidgetClass)
	{
		return;
	}

	if (!ActiveOptionsWidget)
	{
		ActiveOptionsWidget = CreateWidget<UUserWidget>(this, OptionsWidgetClass);
	}

	if (ActiveOptionsWidget && !ActiveOptionsWidget->IsInViewport())
	{
		ActiveOptionsWidget->AddToViewport(20);
	}
}

void AAyWorldUIPlayerController::CloseOptionsMenu()
{
	if (ActiveOptionsWidget && ActiveOptionsWidget->IsInViewport())
	{
		ActiveOptionsWidget->RemoveFromParent();
	}
}

void AAyWorldUIPlayerController::ApplyGameSettings(float InMouseSensitivity, float InFOV, bool bInHeadBob, float InMasterVolume, int32 InGraphicsPreset)
{
	// 1. Sensibilité souris
	InputYawScale_DEPRECATED = InMouseSensitivity * 2.5f;
	InputPitchScale_DEPRECATED = InMouseSensitivity * 2.5f;

	// 2. FOV & Head Bob sur le personnage actif
	AAyWorldCharacter* MyChar = Cast<AAyWorldCharacter>(GetPawn());
	if (MyChar)
	{
		if (MyChar->FirstPersonCameraComponent)
		{
			MyChar->FirstPersonCameraComponent->SetFieldOfView(InFOV);
		}
		MyChar->bEnableHeadBob = bInHeadBob;
	}

	// 3. Préréglages graphiques via Console Command
	if (InGraphicsPreset == 0) // Cinématographique
	{
		ConsoleCommand("sg.ViewDistanceQuality 4");
		ConsoleCommand("sg.ShadowQuality 4");
		ConsoleCommand("sg.GlobalIlluminationQuality 4");
		ConsoleCommand("sg.ReflectionQuality 4");
	}
	else if (InGraphicsPreset == 1) // Épique
	{
		ConsoleCommand("sg.ViewDistanceQuality 3");
		ConsoleCommand("sg.ShadowQuality 3");
		ConsoleCommand("sg.GlobalIlluminationQuality 3");
		ConsoleCommand("sg.ReflectionQuality 3");
	}
	else // Équilibré
	{
		ConsoleCommand("sg.ViewDistanceQuality 2");
		ConsoleCommand("sg.ShadowQuality 2");
		ConsoleCommand("sg.GlobalIlluminationQuality 2");
		ConsoleCommand("sg.ReflectionQuality 2");
	}

	// 4. Volume audio maître
	UGameplayStatics::SetSoundMixClassOverride(this, nullptr, nullptr, InMasterVolume, 1.0f, 0.1f, true);
}
