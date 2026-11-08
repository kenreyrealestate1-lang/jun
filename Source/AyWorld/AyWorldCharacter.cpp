// Source/AyWorld/AyWorldCharacter.cpp
#include "AyWorldCharacter.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"

AAyWorldCharacter::AAyWorldCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	// Dimensions de la capsule adaptées à l'exploration humaine
	GetCapsuleComponent()->InitCapsuleSize(42.0f, 92.0f);

	// Caméra première personne fixée à hauteur des yeux : 1.70 m (Z = 78.0f par rapport au centre de capsule)
	FirstPersonCameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("FirstPersonCamera"));
	FirstPersonCameraComponent->SetupAttachment(GetCapsuleComponent());
	InitialCameraRelativeLocation = FVector(0.0f, 0.0f, 78.0f); // 92 - 14 = 78cm au dessus du centre -> 1.70m
	FirstPersonCameraComponent->SetRelativeLocation(InitialCameraRelativeLocation);
	FirstPersonCameraComponent->SetFieldOfView(DefaultFOV);
	FirstPersonCameraComponent->bUsePawnControlRotation = true;

	// Configuration du Movement Component
	UCharacterMovementComponent* MoveComp = GetCharacterMovement();
	if (MoveComp)
	{
		MoveComp->MaxWalkSpeed = WalkSpeed;
		MoveComp->MaxStepHeight = 45.0f;
		
		// Pente franchissable calibrée à 45°
		MoveComp->SetWalkableFloorAngle(45.0f);
		MoveComp->bCanWalkOffLedges = true;
		MoveComp->bCanWalkOffLedgesWhenCrouching = true;

		// Décélération et freinage doux pour une sensation de marche naturelle
		MoveComp->BrakingDecelerationWalking = 800.0f;
		MoveComp->GroundFriction = 4.5f;
	}

	// Désactivation de la rotation de maillage par contrôleur
	bUseControllerRotationPitch = true;
	bUseControllerRotationYaw = true;
	bUseControllerRotationRoll = false;
}

void AAyWorldCharacter::BeginPlay()
{
	Super::BeginPlay();
}

void AAyWorldCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	UpdateHeadBob(DeltaTime);
}

void AAyWorldCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	PlayerInputComponent->BindAxis("MoveForward", this, &AAyWorldCharacter::MoveForward);
	PlayerInputComponent->BindAxis("MoveRight", this, &AAyWorldCharacter::MoveRight);
	PlayerInputComponent->BindAxis("Turn", this, &APawn::AddControllerYawInput);
	PlayerInputComponent->BindAxis("LookUp", this, &APawn::AddControllerPitchInput);

	PlayerInputComponent->BindAction("Sprint", IE_Pressed, this, &AAyWorldCharacter::StartSprint);
	PlayerInputComponent->BindAction("Sprint", IE_Released, this, &AAyWorldCharacter::StopSprint);
}

void AAyWorldCharacter::MoveForward(float Val)
{
	if (Val != 0.0f)
	{
		AddMovementInput(GetActorForwardVector(), Val);
	}
}

void AAyWorldCharacter::MoveRight(float Val)
{
	if (Val != 0.0f)
	{
		AddMovementInput(GetActorRightVector(), Val);
	}
}

void AAyWorldCharacter::StartSprint()
{
	bIsSprinting = true;
	if (GetCharacterMovement())
	{
		GetCharacterMovement()->MaxWalkSpeed = SprintSpeed;
	}
}

void AAyWorldCharacter::StopSprint()
{
	bIsSprinting = false;
	if (GetCharacterMovement())
	{
		GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
	}
}

void AAyWorldCharacter::UpdateHeadBob(float DeltaTime)
{
	if (!bEnableHeadBob || !FirstPersonCameraComponent)
	{
		return;
	}

	const float CurrentSpeed = GetVelocity().Size2D();
	if (CurrentSpeed > 20.0f && GetCharacterMovement()->IsMovingOnGround())
	{
		// Fréquence calée sur le rythme du pas
		const float StepFrequency = (bIsSprinting ? HeadBobFrequency * 1.35f : HeadBobFrequency);
		HeadBobTimer += DeltaTime * StepFrequency;

		// Mouvement en huit horizontal et vertical (figure-8 walk cycle)
		const float BobY = FMath::Cos(HeadBobTimer * 0.5f) * HeadBobIntensity * 0.6f;
		const float BobZ = FMath::Sin(HeadBobTimer) * HeadBobIntensity;

		FVector TargetLocation = InitialCameraRelativeLocation + FVector(0.0f, BobY, BobZ);
		FirstPersonCameraComponent->SetRelativeLocation(FMath::VInterpTo(FirstPersonCameraComponent->GetRelativeLocation(), TargetLocation, DeltaTime, 12.0f));
	}
	else
	{
		// Retour au repos doux
		HeadBobTimer = 0.0f;
		FirstPersonCameraComponent->SetRelativeLocation(FMath::VInterpTo(FirstPersonCameraComponent->GetRelativeLocation(), InitialCameraRelativeLocation, DeltaTime, 8.0f));
	}
}
