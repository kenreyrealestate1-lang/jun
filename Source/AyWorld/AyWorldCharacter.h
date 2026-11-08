// Source/AyWorld/AyWorldCharacter.h
// Personnage d'exploration contemplative en vue à la première personne
// AyWorld - Claude Edition (Phase 3)
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AyWorldCharacter.generated.h"

class UCameraComponent;
class USpringArmComponent;

UCLASS(config=Game)
class AYWORLD_API AAyWorldCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AAyWorldCharacter();

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaTime) override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

	// Déplacement de base
	void MoveForward(float Val);
	void MoveRight(float Val);
	void TurnAtRate(float Rate);
	void LookUpAtRate(float Rate);

	// Sprint & Marche contemplative
	void StartSprint();
	void StopSprint();

	// Mise à jour de l'oscillation naturelle de marche (Head Bob)
	void UpdateHeadBob(float DeltaTime);

public:
	// Caméra première personne positionnée à 1.70 m du sol
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	TObjectPtr<UCameraComponent> FirstPersonCameraComponent;

	// Paramètres de locomotion
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AyWorld|Locomotion")
	float WalkSpeed = 200.0f; // 2.0 m/s (marche contemplative)

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AyWorld|Locomotion")
	float SprintSpeed = 500.0f; // 5.0 m/s (sprint alpin)

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AyWorld|Locomotion")
	float DefaultFOV = 85.0f; // Champ de vision naturel sans distorsion

	// Paramètres du Head Bob (léger et désactivable)
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AyWorld|HeadBob")
	bool bEnableHeadBob = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AyWorld|HeadBob")
	float HeadBobIntensity = 1.2f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AyWorld|HeadBob")
	float HeadBobFrequency = 6.8f;

private:
	bool bIsSprinting = false;
	float HeadBobTimer = 0.0f;
	FVector InitialCameraRelativeLocation;
};
