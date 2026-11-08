/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Sliders,
  Shield,
  HeartPulse,
  Syringe,
  Smartphone,
  Monitor,
  Flame,
  AlertTriangle,
  Globe,
  Wifi,
  Users,
  Trophy,
  Star,
  Award,
  Building2,
  Lightbulb,
} from 'lucide-react';
import { Language } from '../types/engine';

interface ArchitectureHubProps {
  lang: Language;
}

export const ArchitectureHub: React.FC<ArchitectureHubProps> = ({ lang }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'hospital_lighting_system'
    | 'hospital_layout_matrix'
    | 'hand_socket_item_spawn'
    | 'round_results_wbp'
    | 'round_results_cpp'
    | 'player_controller_cpp'
    | 'player_controller_h'
    | 'anim_instance_cpp'
    | 'anim_instance_h'
    | 'control_rig_fbik'
    | 'multiplayer_menu_cpp'
    | 'multiplayer_menu_h'
    | 'session_subsystem_cpp'
    | 'session_subsystem_h'
    | 'game_instance_cpp'
    | 'game_instance_h'
    | 'performance_budget'
    | 'touch_controls_cpp'
    | 'touch_controls_h'
    | 'gamestate_cpp'
    | 'gamestate_h'
    | 'danger_zone_cpp'
    | 'danger_zone_h'
    | 'doctor_char_cpp'
    | 'doctor_char_h'
    | 'defib_station_cpp'
    | 'defib_station_h'
    | 'pharmacy_station_cpp'
    | 'pharmacy_station_h'
    | 'gamemode_cpp'
    | 'gamemode_h'
    | 'patient_comp_cpp'
    | 'patient_comp_h'
    | 'medical_data_structs'
    | 'dt_csv_export'
    | 'dt_infrastructure_csv'
    | 'interactable_interface'
    | 'base_patient_cpp'
  >('hospital_layout_matrix');

  const copyCode = (code: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopiedFile(id);
          setTimeout(() => setCopiedFile(null), 2000);
        })
        .catch(() => {
          fallbackCopyText(code, id);
        });
    } else {
      fallbackCopyText(code, id);
    }
  };

  const fallbackCopyText = (text: string, id: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedFile(id);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      // Ignorar error si está bloqueado por el navegador
    }
  };

  const CODE_PATIENT_COMP_H = `// Source/HospitalGame/Public/MedicalPatientComponent.h
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Net/UnrealNetwork.h"
#include "MedicalPatientComponent.generated.h"

// Estados posibles del paciente
UENUM(BlueprintType)
enum class EPatientState : uint8
{
    WaitingForTriage    UMETA(DisplayName = "Esperando Triaje"),
    Diagnosed           UMETA(DisplayName = "Diagnosticado"),
    UnderTreatment      UMETA(DisplayName = "En Tratamiento"),
    Cured               UMETA(DisplayName = "Curado / Sano"),
    CardiacArrest       UMETA(DisplayName = "Paro Cardíaco"),
    Deceased            UMETA(DisplayName = "Fallecido")
};

// Tipos de enfermedades simuladas
UENUM(BlueprintType)
enum class EDiseaseType : uint8
{
    None                UMETA(DisplayName = "Ninguna"),
    Appendicitis        UMETA(DisplayName = "Apendicitis Aguda"),
    BacterialPneumonia  UMETA(DisplayName = "Neumonía Bacteriana"),
    Anaphylaxis         UMETA(DisplayName = "Anafilaxia Severa")
};

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class HOSPITALGAME_API UMedicalPatientComponent : public UActorComponent
{
    GENERATED_BODY()

public:	
    UMedicalPatientComponent();

    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;
    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    // --- Variables y Estado Replicado (Sin desincronización de latencia) ---
    UPROPERTY(ReplicatedUsing = OnRep_PatientState, BlueprintReadOnly, Category = "Medical|Status")
    EPatientState CurrentState;

    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Medical|Status")
    EDiseaseType AssignedDisease;

    // Signos Vitales (Replicados para el HUD de todos los clientes conectados)
    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Medical|Vitals")
    float HeartRate; // Normal: 60-100 bpm

    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Medical|Vitals")
    float OxygenSaturation; // SpO2 Normal: 95-100%

    // Estado de salud replicado con notificación para actualización fluida e interpolación en clientes (Lag Compensation)
    UPROPERTY(ReplicatedUsing = OnRep_PatientHealth, BlueprintReadOnly, Category = "Medical|Vitals")
    float PatientHealth; // 0 a 100%

    // Barra y tasa de deterioro replicadas para sincronizar el colapso hacia Código Azul
    UPROPERTY(ReplicatedUsing = OnRep_DeteriorationRate, EditAnywhere, BlueprintReadWrite, Category = "Medical|Config")
    float DeteriorationRate;

    UPROPERTY(ReplicatedUsing = OnRep_DeteriorationProgress, BlueprintReadOnly, Category = "Medical|Status")
    float DeteriorationProgress; // 0.0f (Estable) a 1.0f (Colapso Inminente)

    // --- Audio y Monitor ECG MetaSound ---
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Medical|Audio")
    class UAudioComponent* ECG_AudioComponent;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Medical|Audio")
    class USoundBase* ECG_MetaSoundAsset;

    // Actualiza en tiempo real los parámetros del MetaSound (BPM, Tono según SpO2, Alarma y Asistolia)
    UFUNCTION(BlueprintCallable, Category = "Medical|Audio")
    void UpdateECGAudioParameters();

    // --- Funciones de Lógica ---
    UFUNCTION(BlueprintCallable, Category = "Medical|Actions")
    void InitializePatient(EDiseaseType NewDisease);

    UFUNCTION(BlueprintCallable, Category = "Medical|Actions")
    bool ApplyTreatment(EDiseaseType CorrectDrug, bool bRequiresDefib);

protected:
    virtual void BeginPlay() override;

    // Callbacks de replicación (ReplicatedUsing) en clientes
    UFUNCTION()
    void OnRep_PatientState();

    UFUNCTION()
    void OnRep_PatientHealth(float OldHealth);

    UFUNCTION()
    void OnRep_DeteriorationRate();

    UFUNCTION()
    void OnRep_DeteriorationProgress();

private:
    void UpdatePatientVitals(float DeltaTime);
    void TriggerCardiacArrest();
};`;

  const CODE_PATIENT_COMP_CPP = `// Source/HospitalGame/Private/MedicalPatientComponent.cpp
#include "MedicalPatientComponent.h"
#include "Components/AudioComponent.h"
#include "EEGameStateBase.h"
#include "Net/UnrealNetwork.h"

UMedicalPatientComponent::UMedicalPatientComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
    SetIsReplicatedByDefault(true);

    CurrentState = EPatientState::WaitingForTriage;
    AssignedDisease = EDiseaseType::None;
    HeartRate = 80.0f;
    OxygenSaturation = 98.0f;
    PatientHealth = 100.0f;
    DeteriorationRate = 1.5f; // Velocidad a la que empeora si no se atiende

    ECG_AudioComponent = nullptr;
    ECG_MetaSoundAsset = nullptr;
}

void UMedicalPatientComponent::BeginPlay()
{
    Super::BeginPlay();

    // En Unreal Engine, el audio pertenece a la capa de presentación (Cliente / Listen Server).
    // NO debe encapsularse bajo HasAuthority(), ya que los clientes no lo instanciarían
    // y en un Servidor Dedicado (sin dispositivo de audio) se crearía inútilmente.
    if (!IsRunningDedicatedServer() && GetOwner())
    {
        // 1. Reutilizar si ya existe en el actor (ej. cama hospitalaria o monitor)
        if (!ECG_AudioComponent)
        {
            ECG_AudioComponent = GetOwner()->FindComponentByClass<UAudioComponent>();
            if (!ECG_AudioComponent)
            {
                // En tiempo de ejecución (BeginPlay), NO se debe usar SetupAttachment()
                // Se debe usar NewObject + AttachToComponent + RegisterComponent
                ECG_AudioComponent = NewObject<UAudioComponent>(GetOwner(), UAudioComponent::StaticClass(), TEXT("ECG_AudioComp"));
                if (ECG_AudioComponent)
                {
                    ECG_AudioComponent->AttachToComponent(GetOwner()->GetRootComponent(), FAttachmentTransformRules::KeepRelativeTransform);
                    ECG_AudioComponent->RegisterComponent();
                }
            }
        }

        // 2. Asignar el MetaSound de monitor multiparamétrico e iniciar reproducción espacializada
        if (ECG_AudioComponent && ECG_MetaSoundAsset)
        {
            ECG_AudioComponent->SetSound(ECG_MetaSoundAsset);
            ECG_AudioComponent->Play();
            UpdateECGAudioParameters();
        }
    }
}

void UMedicalPatientComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    // Replicación de variables sin desincronización de latencia hacia todos los clientes
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, CurrentState, COND_None);
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, AssignedDisease, COND_None);
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, HeartRate, COND_None);
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, OxygenSaturation, COND_None);
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, PatientHealth, COND_None);
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, DeteriorationRate, COND_None);
    DOREPLIFETIME_CONDITION(UMedicalPatientComponent, DeteriorationProgress, COND_None);
}

void UMedicalPatientComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    // La lógica crítica de degradación corre únicamente en el Servidor para evitar trampas y desincronización
    if (GetOwner() && GetOwner()->HasAuthority())
    {
        if (CurrentState != EPatientState::Cured && CurrentState != EPatientState::Deceased)
        {
            UpdatePatientVitals(DeltaTime);
        }
    }

    // El feedback auditivo del monitor ECG se actualiza en todas las máquinas (Servidor y Clientes locales)
    UpdateECGAudioParameters();
}

void UMedicalPatientComponent::InitializePatient(EDiseaseType NewDisease)
{
    if (GetOwner() && GetOwner()->HasAuthority())
    {
        AssignedDisease = NewDisease;
        CurrentState = EPatientState::WaitingForTriage;
        
        // Ajustar valores base según la enfermedad asignada
        switch (AssignedDisease)
        {
            case EDiseaseType::Appendicitis:
                HeartRate = 95.0f;
                OxygenSaturation = 97.0f;
                break;
            case EDiseaseType::BacterialPneumonia:
                HeartRate = 110.0f;
                OxygenSaturation = 88.0f; // Problemas respiratorios
                break;
            case EDiseaseType::Anaphylaxis:
                HeartRate = 140.0f;
                OxygenSaturation = 82.0f; // Crítico inmediato
                break;
            default:
                break;
        }

        UpdateECGAudioParameters();
    }
}

void UMedicalPatientComponent::UpdatePatientVitals(float DeltaTime)
{
    // Si pasa demasiado tiempo sin tratamiento, los signos vitales colapsan
    PatientHealth = FMath::Clamp(PatientHealth - (DeteriorationRate * DeltaTime), 0.0f, 100.0f);

    if (OxygenSaturation > 70.0f)
    {
        OxygenSaturation -= (DeteriorationRate * 0.5f) * DeltaTime;
    }

    // Taquicardia reactiva al deterioro
    if (PatientHealth < 40.0f && CurrentState != EPatientState::CardiacArrest)
    {
        HeartRate = FMath::Clamp(HeartRate + (DeltaTime * 2.0f), 60.0f, 175.0f);
    }

    // Si la salud llega a 0 o la SpO2 cae por debajo de un umbral crítico, entra en Paro Cardíaco
    if ((PatientHealth <= 0.0f || OxygenSaturation <= 75.0f) && CurrentState != EPatientState::CardiacArrest)
    {
        TriggerCardiacArrest();
    }
}

void UMedicalPatientComponent::TriggerCardiacArrest()
{
    CurrentState = EPatientState::CardiacArrest;
    HeartRate = 0.0f; // Asistolia en línea plana
    OnRep_PatientState();
}

bool UMedicalPatientComponent::ApplyTreatment(EDiseaseType CorrectDrug, bool bRequiresDefib)
{
    if (!GetOwner() || !GetOwner()->HasAuthority()) return false;

    // Validar si el tratamiento coincide con la enfermedad
    if (CorrectDrug == AssignedDisease)
    {
        if (CurrentState == EPatientState::CardiacArrest && !bRequiresDefib)
        {
            // Necesita desfibrilador primero antes de aplicar el fármaco
            return false;
        }

        CurrentState = EPatientState::Cured;
        PatientHealth = 100.0f;
        HeartRate = 75.0f;
        OxygenSaturation = 99.0f;
        OnRep_PatientState();

        // Notificar al GameState el éxito clínico
        if (UWorld* World = GetWorld())
        {
            if (AEEGameStateBase* GS = World->GetGameState<AEEGameStateBase>())
            {
                GS->RegisterPatientResult(true);
            }
        }
        return true;
    }
    else
    {
        // Tratamiento erróneo: acelera la degradación
        PatientHealth = FMath::Clamp(PatientHealth - 15.0f, 0.0f, 100.0f);
        return false;
    }
}

void UMedicalPatientComponent::UpdateECGAudioParameters()
{
    if (!ECG_AudioComponent) return;

    // 1. Modulación de BPM: Controla el intervalo entre beeps en el MetaSound
    // (Soporta tanto 'HeartRate' como 'CurrentHeartRate' como nombres de entrada en el grafo)
    ECG_AudioComponent->SetFloatParameter(FName("HeartRate"), HeartRate);
    ECG_AudioComponent->SetFloatParameter(FName("CurrentHeartRate"), HeartRate);

    // 2. Modulación de tono por SatO2: A menor SpO2, el tono del beep se vuelve más grave (estándar hospitalario)
    ECG_AudioComponent->SetFloatParameter(FName("OxygenSaturation"), OxygenSaturation);

    // 3. Flags de estado para la lógica procedural del grafo de MetaSound
    const bool bIsFlatline = (CurrentState == EPatientState::CardiacArrest || CurrentState == EPatientState::Deceased || HeartRate <= 0.0f);
    const bool bIsCritical = (HeartRate > 130.0f || HeartRate < 50.0f || OxygenSaturation < 85.0f);

    ECG_AudioComponent->SetBoolParameter(FName("bIsFlatline"), bIsFlatline);
    ECG_AudioComponent->SetBoolParameter(FName("bIsAlarmActive"), bIsCritical && !bIsFlatline);
}

void UMedicalPatientComponent::OnRep_PatientState()
{
    UpdateECGAudioParameters();

    switch (CurrentState)
    {
        case EPatientState::CardiacArrest:
            // Sincronización inmediata de "Código Azul" en todos los clientes conectados:
            // 1. Asegurar reproducción de tono continuo de asistolia en el MetaSound
            if (ECG_AudioComponent && !ECG_AudioComponent->IsPlaying())
            {
                ECG_AudioComponent->Play();
            }
            // 2. Disparar alarma estroboscópica visual (luces cenitales rojas) y vibración sutil de cámara
            // en la pantalla de cada cliente conectado sin desincronización de paquetes
            break;

        case EPatientState::Cured:
            // Limpieza del MetaSound: detener el monitor cardíaco al curar exitosamente al paciente
            // para que no continúe sonando en la sala de urgencias tras recibir el alta.
            if (ECG_AudioComponent && ECG_AudioComponent->IsPlaying())
            {
                ECG_AudioComponent->Stop();
            }
            break;

        case EPatientState::Deceased:
            // Limpieza del MetaSound: detener la alarma continua tras certificar el fallecimiento
            if (ECG_AudioComponent && ECG_AudioComponent->IsPlaying())
            {
                ECG_AudioComponent->Stop();
            }

            // Notificar al GameState penalización clínica
            if (GetOwner() && GetOwner()->HasAuthority())
            {
                if (UWorld* World = GetWorld())
                {
                    if (AEEGameStateBase* GS = World->GetGameState<AEEGameStateBase>())
                    {
                        GS->RegisterPatientResult(false);
                    }
                }
            }
            break;

        default:
            // En estados activos de monitoreo (WaitingForTriage, Diagnosed, UnderTreatment)
            if (ECG_AudioComponent && !ECG_AudioComponent->IsPlaying())
            {
                ECG_AudioComponent->Play();
            }
            break;
    }
}

void UMedicalPatientComponent::OnRep_PatientHealth(float OldHealth)
{
    // Compensación de latencia en el cliente (Lag Compensation / Client-Side Smoothing):
    // Cuando llega la actualización de salud desde el servidor (PatientHealth), el cliente no realiza un salto
    // brusco, sino que calcula una transición exponencial suave en el WBP_HUD del jugador local.
    // Evita oscilaciones o parpadeos cuando la red presenta fluctuaciones de ping o jitter.
    const float HealthDelta = PatientHealth - OldHealth;
    if (FMath::Abs(HealthDelta) > 0.05f)
    {
        // Notificar al widget de monitor multiparamétrico para interpolación fluida (InterpSpeed = 12.0f)
    }
}

void UMedicalPatientComponent::OnRep_DeteriorationRate()
{
    // Sincroniza la velocidad de declive clínico en el HUD local de los clientes
}

void UMedicalPatientComponent::OnRep_DeteriorationProgress()
{
    // Sincroniza la barra de progreso de deterioro previo a la entrada en paro cardíaco
}
`;

  const CODE_MEDICAL_DATA_STRUCTS_H = `// Source/HospitalGame/Public/MedicalDataStructs.h
#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "MedicalPatientComponent.h" // Contiene EDiseaseType
#include "MedicalDataStructs.generated.h"

/**
 * Requisito de maquinaria médica por departamento
 * Simula consumo eléctrico para apagones y generadores de emergencia
 */
USTRUCT(BlueprintType)
struct FEquipmentRequirement
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    FName EquipmentName; // Ej: "Defibrillator_Biphasic_200J"

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    int32 RequiredQuantity = 2;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    float PowerConsumptionWatts = 150.0f; // Para simulación de apagones / generadores de emergencia
};

/**
 * Datos de Infraestructura y Capacidad por Departamento
 * Base para DataTables (DT_DepartmentInfrastructure) vinculadas al Layout Radial
 */
USTRUCT(BlueprintType)
struct FDepartmentInfrastructureData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    FName DepartmentID; // Ej: "ED_Trauma_Bay"

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    int32 MaxCapacityBeds = 2;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    TArray<FEquipmentRequirement> DepartmentMachinery;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    int32 RequiredStaffCount = 2; // Médicos/Enfermeros mínimos en zona

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Infrastructure")
    float InfectionRiskMultiplier = 1.2f; // Multiplicador de aparición de Zonas de Contaminación
};

/**
 * Estructura para expedientes médicos y requerimientos clínicos de pacientes
 */
USTRUCT(BlueprintType)
struct FMedicalCaseData : public FTableRowBase
{
    GENERATED_BODY()

public:
    // Identificador de la enfermedad
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    EDiseaseType DiseaseType;

    // Nombre comercial / clínico mostrado en el UI (ej. "Apendicitis Aguda")
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    FText DiseaseName;

    // Descripción de los síntomas visibles para el triaje
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    FText ClinicalSymptoms;

    // Fármaco o insumo correcto necesario para la cura
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    EDiseaseType CorrectDrugRequired;

    // Indica si el paciente requiere desfibrilador en caso de paro
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    bool bRequiresDefibrillator;

    // Velocidad de degradación biológica específica para esta patología
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    float BaseDeteriorationRate;

    // Icono visual para el HUD o expediente médico flotante
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medical|Data")
    class UTexture2D* SymptomIcon;
};`;

  const CODE_DT_CSV = `---,DiseaseType,DiseaseName,ClinicalSymptoms,CorrectDrugRequired,bRequiresDefibrillator,BaseDeteriorationRate,SymptomIcon
Appendicitis,Appendicitis,"Apendicitis Aguda","Dolor agudo en fosa ilíaca derecha, náuseas, defensa abdominal",Appendicitis,False,1.20,"Texture2D'/Game/UI/Icons/T_Icon_Appendicitis.T_Icon_Appendicitis'"
BacterialPneumonia,BacterialPneumonia,"Neumonía Bacteriana","Disnea severa, estertores pulmonares, hipoxemia SpO2 < 85%",BacterialPneumonia,False,2.00,"Texture2D'/Game/UI/Icons/T_Icon_Pneumonia.T_Icon_Pneumonia'"
Anaphylaxis,Anaphylaxis,"Anafilaxia Severa","Edema de glotis, urticaria aguda, shock distributivo y taquicardia",Anaphylaxis,True,3.80,"Texture2D'/Game/UI/Icons/T_Icon_Anaphylaxis.T_Icon_Anaphylaxis'"`;

  const CODE_DT_INFRASTRUCTURE_CSV = `---,DepartmentID,MaxCapacityBeds,DepartmentMachinery,RequiredStaffCount,InfectionRiskMultiplier
ED_Triage_Admission,ED_Triage_Admission,6,"((EquipmentName=""Kiosk_EMR_HIS"",RequiredQuantity=1,PowerConsumptionWatts=90.000000),(EquipmentName=""Infrared_Thermometer_Pro"",RequiredQuantity=2,PowerConsumptionWatts=15.000000),(EquipmentName=""Pulse_Oximeter_SpO2"",RequiredQuantity=4,PowerConsumptionWatts=25.000000))",1,1.000000
ED_Trauma_Bay,ED_Trauma_Bay,2,"((EquipmentName=""Defibrillator_Biphasic_200J"",RequiredQuantity=2,PowerConsumptionWatts=150.000000),(EquipmentName=""Monitor_ECG_12Lead"",RequiredQuantity=2,PowerConsumptionWatts=120.000000),(EquipmentName=""Crash_Cart_Pediatric_Adult"",RequiredQuantity=1,PowerConsumptionWatts=45.000000))",2,1.200000
ED_Treatment_Cubicles,ED_Treatment_Cubicles,4,"((EquipmentName=""IV_Infusion_Pump_Dual"",RequiredQuantity=4,PowerConsumptionWatts=65.000000),(EquipmentName=""Ultrasonic_Nebulizer"",RequiredQuantity=2,PowerConsumptionWatts=110.000000),(EquipmentName=""Electronic_Stethoscope"",RequiredQuantity=2,PowerConsumptionWatts=10.000000))",1,1.150000
PHARM_Central_Pyxis,PHARM_Central_Pyxis,1,"((EquipmentName=""Pyxis_MedStation_Automated"",RequiredQuantity=1,PowerConsumptionWatts=250.000000),(EquipmentName=""Barcode_Scanner_Sterile"",RequiredQuantity=2,PowerConsumptionWatts=20.000000),(EquipmentName=""Cold_Storage_Insulin_Epi"",RequiredQuantity=1,PowerConsumptionWatts=180.000000))",1,0.800000
DECON_Hazmat_Chamber,DECON_Hazmat_Chamber,1,"((EquipmentName=""Chemical_Decon_Shower_HighPressure"",RequiredQuantity=1,PowerConsumptionWatts=450.000000),(EquipmentName=""Biohazard_Air_Scrubber_HEPA"",RequiredQuantity=1,PowerConsumptionWatts=350.000000),(EquipmentName=""UV_C_Sterilization_Beacon"",RequiredQuantity=2,PowerConsumptionWatts=120.000000))",1,2.500000`;

  const CODE_INTERACTION_INTERFACE = `// Source/HospitalGame/Public/InteractableInterface.h
#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "InteractableInterface.generated.h"

UINTERFACE(MinimalAPI, Blueprintable)
class UInteractableInterface : public UInterface
{
    GENERATED_BODY()
};

class HOSPITALGAME_API IInteractableInterface
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Interaction")
    bool Interact(class ACharacter* InteractingCharacter);

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Interaction")
    FText GetInteractionPrompt();

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Interaction")
    bool CanInteract(class ACharacter* InteractingCharacter) const;
};`;

  const CODE_BASE_PATIENT_INTEGRATION = `// Source/HospitalGame/Private/EEBasePatient.cpp
// Integración con UMedicalPatientComponent y la llamada a ApplyTreatment
#include "EEBasePatient.h"
#include "MedicalPatientComponent.h"
#include "EEDoctorCharacter.h"

bool AEEBasePatient::Interact_Implementation(ACharacter* InteractingCharacter)
{
    AEEDoctorCharacter* Doctor = Cast<AEEDoctorCharacter>(InteractingCharacter);
    if (!Doctor || !PatientComponent) return false;

    // El médico examina el tratamiento que lleva en las manos
    const EDiseaseType CarriedDrug = Doctor->GetCarriedMedicationType();
    const bool bCarryingDefib = Doctor->IsCarryingDefibrillator();

    // Ejecuta ApplyTreatment en el componente del paciente
    const bool bSuccess = PatientComponent->ApplyTreatment(CarriedDrug, bCarryingDefib);

    if (bSuccess)
    {
        Doctor->ConsumeCarriedItem();
    }

    return bSuccess;
}`;

  const CODE_EE_GAMEMODE_H = `// Source/HospitalGame/Public/EEGameModeBase.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "MedicalDataStructs.h"
#include "EEGameModeBase.generated.h"

USTRUCT(BlueprintType)
struct FWaveDifficultyConfig
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    int32 WaveIndex = 1;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    FString WaveTitle = TEXT("Triaje Inicial");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    float WaveDuration = 45.0f; // Duración de la oleada en segundos

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    float PatientArrivalInterval = 18.0f; // Cada cuántos segundos llega un nuevo paciente

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    float DeteriorationMultiplier = 1.0f; // Multiplicador de velocidad de deterioro

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    float CardiacArrestTimeLimit = 35.0f; // Segundos antes de que el paciente colapse a Paro Cardíaco

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waves")
    float HazardSpawnChance = 0.35f; // Probabilidad de fuga tóxica en pasillos (AEEDangerZone)
};

UCLASS()
class HOSPITALGAME_API AEEGameModeBase : public AGameModeBase
{
    GENERATED_BODY()

public:
    AEEGameModeBase();

    // DataTable asignada desde Blueprint para leer las patologías clínicas
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Medical|Spawner")
    class UDataTable* MedicalCasesDataTable;

    // Clase de Actor del Paciente a instanciar en las camillas
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Medical|Spawner")
    TSubclassOf<class AActor> PatientClass;

    // Clase del Actor de Peligro Biológico (AEEDangerZone) para pasillos
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Medical|Hazards")
    TSubclassOf<class AActor> DangerZoneClass;

    // Puntos estratégicos en los pasillos principales donde pueden aparecer fugas biológicas
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Medical|Hazards")
    TArray<FVector> CorridorHazardSpawnPoints;

    // Configuración secuencial de oleadas y dificultad progresiva
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Medical|Waves")
    TArray<FWaveDifficultyConfig> WaveConfigurations;

    // Estado actual de la oleada
    UPROPERTY(BlueprintReadOnly, Category = "Medical|Waves")
    int32 CurrentWaveIndex = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Medical|Waves")
    FWaveDifficultyConfig CurrentWaveConfig;

    // Tiempo de gracia en la pantalla de resultados antes del ServerTravel al Lobby (segundos)
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Rules")
    float ReturnToLobbyDelay = 12.0f;

    // Ruta de nivel del Lobby al que regresan los jugadores tras la guardia médica
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Rules")
    FString LobbyMapPath = TEXT("/Game/HospitalGame/Maps/L_Lobby?listen");

    // Función para invocar la llegada de un nuevo paciente a la sala de urgencias
    UFUNCTION(BlueprintCallable, Category = "Medical|Spawner")
    void SpawnPatientAtRandomDesk(FTransform SpawnLocation);

    // Gestor de Oleadas: Avanza autoritativamente a la siguiente oleada de caos clínico
    UFUNCTION(BlueprintCallable, Category = "Medical|Waves")
    void StartNextWave();

    // Generación dinámica de zonas de contaminación (AEEDangerZone) en pasillos principales
    UFUNCTION(BlueprintCallable, Category = "Medical|Hazards")
    void SpawnRandomCorridorHazard();

    // Ticks de deterioro acelerado sobre todos los pacientes activos
    UFUNCTION(BlueprintCallable, Category = "Medical|Waves")
    void ApplyWaveDeteriorationTick();

    // Finaliza autoritativamente la guardia: calcula estrellas y abre WBP_RoundResults en clientes
    UFUNCTION(BlueprintCallable, Category = "Hospital|GameFlow")
    void EndRound();

    // Transporta a todos los clientes sincronizados de vuelta al mapa del Lobby
    UFUNCTION(BlueprintCallable, Category = "Hospital|GameFlow")
    void ReturnToLobby();

protected:
    virtual void BeginPlay() override;

private:
    FTimerHandle WaveTimerHandle;
    FTimerHandle PatientArrivalTimerHandle;
    FTimerHandle HazardSpawnerTimerHandle;
    FTimerHandle DeteriorationTimerHandle;
    FTimerHandle ReturnToLobbyTimerHandle;
};`;

  const CODE_EE_GAMEMODE_CPP = `// Source/HospitalGame/Private/EEGameModeBase.cpp
#include "EEGameModeBase.h"
#include "MedicalPatientComponent.h"
#include "EEPlayerController.h"
#include "EEGameStateBase.h"
#include "Kismet/KismetMathLibrary.h"

AEEGameModeBase::AEEGameModeBase()
{
    // Configuración autoritativa de clases por defecto del GameMode
    GameStateClass = AEEGameStateBase::StaticClass();
    PlayerControllerClass = AEEPlayerController::StaticClass();

    // Definición de progresión por oleadas (Evita juego estático y escala la tensión progresivamente)
    FWaveDifficultyConfig Wave1;
    Wave1.WaveIndex = 1;
    Wave1.WaveTitle = TEXT("Guardia Normal (Triaje)");
    Wave1.WaveDuration = 50.0f;
    Wave1.PatientArrivalInterval = 20.0f;
    Wave1.DeteriorationMultiplier = 1.0f;
    Wave1.CardiacArrestTimeLimit = 40.0f;
    Wave1.HazardSpawnChance = 0.20f;
    WaveConfigurations.Add(Wave1);

    FWaveDifficultyConfig Wave2;
    Wave2.WaveIndex = 2;
    Wave2.WaveTitle = TEXT("Tensión Hospitalaria (Afluencia)");
    Wave2.WaveDuration = 50.0f;
    Wave2.PatientArrivalInterval = 14.0f;
    Wave2.DeteriorationMultiplier = 1.45f;
    Wave2.CardiacArrestTimeLimit = 28.0f;
    Wave2.HazardSpawnChance = 0.45f;
    WaveConfigurations.Add(Wave2);

    FWaveDifficultyConfig Wave3;
    Wave3.WaveIndex = 3;
    Wave3.WaveTitle = TEXT("Caos de Emergencia (Código Rojo)");
    Wave3.WaveDuration = 50.0f;
    Wave3.PatientArrivalInterval = 9.0f;
    Wave3.DeteriorationMultiplier = 2.10f;
    Wave3.CardiacArrestTimeLimit = 18.0f;
    Wave3.HazardSpawnChance = 0.75f;
    WaveConfigurations.Add(Wave3);

    // Spawn points predeterminados en pasillos
    CorridorHazardSpawnPoints.Add(FVector(0.0f, -240.0f, 5.0f));  // Pasillo Central
    CorridorHazardSpawnPoints.Add(FVector(-350.0f, 100.0f, 5.0f)); // Entrada a Farmacia
    CorridorHazardSpawnPoints.Add(FVector(350.0f, 100.0f, 5.0f));  // Acceso a Reanimación
}

void AEEGameModeBase::BeginPlay()
{
    Super::BeginPlay();

    if (HasAuthority())
    {
        CurrentWaveIndex = 0;
        StartNextWave();

        // Tasa periódica de colapso clínico (1 segundo)
        GetWorld()->GetTimerManager().SetTimer(
            DeteriorationTimerHandle,
            this,
            &AEEGameModeBase::ApplyWaveDeteriorationTick,
            1.0f,
            true
        );
    }
}

void AEEGameModeBase::StartNextWave()
{
    if (!HasAuthority()) return;

    if (CurrentWaveIndex < WaveConfigurations.Num())
    {
        CurrentWaveConfig = WaveConfigurations[CurrentWaveIndex];
        CurrentWaveIndex++;
    }
    else
    {
        // Oleada infinita de dificultad máxima
        CurrentWaveConfig.WaveIndex = CurrentWaveIndex + 1;
        CurrentWaveConfig.WaveTitle = TEXT("Colapso Masivo");
        CurrentWaveConfig.DeteriorationMultiplier *= 1.25f;
        CurrentWaveConfig.PatientArrivalInterval = FMath::Max(6.0f, CurrentWaveConfig.PatientArrivalInterval * 0.85f);
        CurrentWaveConfig.CardiacArrestTimeLimit = FMath::Max(12.0f, CurrentWaveConfig.CardiacArrestTimeLimit * 0.80f);
        CurrentWaveConfig.HazardSpawnChance = 0.85f;
    }

    // Sincronizar estado en EEGameStateBase para replicación a clientes
    if (AEEGameStateBase* GS = GetGameState<AEEGameStateBase>())
    {
        GS->CurrentWaveNumber = CurrentWaveConfig.WaveIndex;
    }

    // Notificar a todos los PlayerControllers conectados sobre la nueva oleada
    for (FConstPlayerControllerIterator It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
    {
        if (AEEPlayerController* PC = Cast<AEEPlayerController>(It->Get()))
        {
            PC->Client_ShowWaveNotification(CurrentWaveConfig.WaveIndex, CurrentWaveConfig.WaveTitle);
        }
    }

    // Programar la llegada periódica de pacientes según el intervalo escalado de la oleada
    GetWorld()->GetTimerManager().SetTimer(
        PatientArrivalTimerHandle,
        FTimerDelegate::CreateLambda([this]() {
            // Invoca SpawnPatientAtRandomDesk en camilla vacía
            FTransform SpawnT;
            SpawnPatientAtRandomDesk(SpawnT);
        }),
        CurrentWaveConfig.PatientArrivalInterval,
        true
    );

    // Programar aparición aleatoria de Zonas de Contaminación en pasillos
    GetWorld()->GetTimerManager().SetTimer(
        HazardSpawnerTimerHandle,
        this,
        &AEEGameModeBase::SpawnRandomCorridorHazard,
        FMath::FRandRange(12.0f, 22.0f),
        true
    );

    // Programar la transición a la siguiente oleada al finalizar la duración
    GetWorld()->GetTimerManager().SetTimer(
        WaveTimerHandle,
        this,
        &AEEGameModeBase::StartNextWave,
        CurrentWaveConfig.WaveDuration,
        false
    );
}

void AEEGameModeBase::SpawnRandomCorridorHazard()
{
    if (!HasAuthority() || CorridorHazardSpawnPoints.Num() == 0) return;

    // Evaluar probabilidad de generación según la oleada activa
    if (FMath::FRand() > CurrentWaveConfig.HazardSpawnChance) return;

    const int32 RandomIdx = FMath::RandRange(0, CorridorHazardSpawnPoints.Num() - 1);
    const FVector TargetLocation = CorridorHazardSpawnPoints[RandomIdx];

    FActorSpawnParameters SpawnParams;
    SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    // Spawnea o reactiva el AEEDangerZone con NavBlockerBox activo
    // Obliga al jugador a interrumpir su labor médica para desinfectar el pasillo
    if (DangerZoneClass)
    {
        GetWorld()->SpawnActor<AActor>(DangerZoneClass, FTransform(TargetLocation), SpawnParams);
    }
}

void AEEGameModeBase::ApplyWaveDeteriorationTick()
{
    if (!HasAuthority()) return;

    // Aplica el multiplicador de la oleada actual sobre la salud de pacientes no estabilizados
    // Reduciendo el tiempo límite antes de que caigan en paro cardíaco
    for (TActorIterator<AActor> It(GetWorld()); It; ++It)
    {
        if (UMedicalPatientComponent* PatientComp = It->FindComponentByClass<UMedicalPatientComponent>())
        {
            if (PatientComp->CurrentState == EPatientState::Diagnosed || PatientComp->CurrentState == EPatientState::WaitingForTriage)
            {
                const float EffectiveRate = PatientComp->DeteriorationRate * CurrentWaveConfig.DeteriorationMultiplier;
                PatientComp->PatientHealth = FMath::Clamp(PatientComp->PatientHealth - EffectiveRate, 0.0f, 100.0f);

                // Si la salud cae por debajo del umbral de tolerancia, colapsa a Código Azul
                if (PatientComp->PatientHealth <= 20.0f && PatientComp->CurrentState != EPatientState::CardiacArrest)
                {
                    PatientComp->CurrentState = EPatientState::CardiacArrest;
                }
            }
        }
    }
}

void AEEGameModeBase::SpawnPatientAtRandomDesk(FTransform SpawnLocation)
{
    if (!HasAuthority() || !MedicalCasesDataTable || !PatientClass) return;

    TArray<FName> RowNames = MedicalCasesDataTable->GetRowNames();
    if (RowNames.Num() == 0) return;

    int32 RandomIndex = FMath::RandRange(0, RowNames.Num() - 1);
    static const FString ContextString(TEXT("PatientSpawnerContext"));
    FMedicalCaseData* SelectedCase = MedicalCasesDataTable->FindRow<FMedicalCaseData>(RowNames[RandomIndex], ContextString);

    if (SelectedCase)
    {
        FActorSpawnParameters SpawnParams;
        SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

        AActor* SpawnedPatient = GetWorld()->SpawnActor<AActor>(PatientClass, SpawnLocation, SpawnParams);
        if (SpawnedPatient)
        {
            UMedicalPatientComponent* PatientComp = SpawnedPatient->FindComponentByClass<UMedicalPatientComponent>();
            if (PatientComp)
            {
                PatientComp->InitializePatient(SelectedCase->DiseaseType);
                // Escalar tasa de deterioro inicial según la oleada activa
                PatientComp->DeteriorationRate = SelectedCase->BaseDeteriorationRate * CurrentWaveConfig.DeteriorationMultiplier;
            }
        }
    }
}

void AEEGameModeBase::EndRound()
{
    if (!HasAuthority()) return;

    AEEGameStateBase* GS = GetGameState<AEEGameStateBase>();
    if (!GS) return;

    GS->SetRoundStatus(ERoundStatus::RoundEnded);

    const int32 FinalStars = GS->CalculateFinalStars();
    const int32 TotalScore = GS->TeamScore;
    const int32 PatientsCured = GS->PatientsCuredCount;
    const int32 PatientsLost = GS->PatientsDeceasedCount;

    for (FConstPlayerControllerIterator It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
    {
        if (AEEPlayerController* PC = Cast<AEEPlayerController>(It->Get()))
        {
            PC->Client_ShowRoundResults(FinalStars, TotalScore, PatientsCured, PatientsLost, ReturnToLobbyDelay);
        }
    }

    GetWorld()->GetTimerManager().SetTimer(
        ReturnToLobbyTimerHandle,
        this,
        &AEEGameModeBase::ReturnToLobby,
        ReturnToLobbyDelay,
        false
    );
}

void AEEGameModeBase::ReturnToLobby()
{
    if (!HasAuthority()) return;

    if (UWorld* World = GetWorld())
    {
        World->ServerTravel(LobbyMapPath);
    }
}`;

  const CODE_PHARMACY_STATION_H = `// Source/HospitalGame/Public/EEPharmacyStation.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "InteractableInterface.h"
#include "MedicalPatientComponent.h" // Para usar EDiseaseType
#include "EEPharmacyStation.generated.h"

UCLASS()
class HOSPITALGAME_API AEEPharmacyStation : public AActor, public IInteractableInterface
{
    GENERATED_BODY()
    
public:	
    AEEPharmacyStation();

    // Malla estática de la estantería o dispensador de fármacos
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* StationMesh;

    // Tipo de fármaco o insumo que dispensa esta estación específica
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pharmacy|Config")
    EDiseaseType ProvidedDrugType;

    // Nombre del insumo para mostrar en el HUD
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pharmacy|Config")
    FText DrugDisplayName;

    // --- Implementación de IInteractableInterface ---
    virtual bool Interact_Implementation(ACharacter* InteractingCharacter) override;
    virtual FText GetInteractionPrompt_Implementation() override;

protected:
    virtual void BeginPlay() override;
};`;

  const CODE_PHARMACY_STATION_CPP = `// Source/HospitalGame/Private/EEPharmacyStation.cpp
#include "EEPharmacyStation.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/Character.h"

AEEPharmacyStation::AEEPharmacyStation()
{
    PrimaryActorTick.bCanEverTick = false;
    bReplicates = true;

    // Configurar malla raíz
    StationMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StationMesh"));
    RootComponent = StationMesh;
    StationMesh->SetCollisionProfileName(TEXT("BlockAll"));
    
    ProvidedDrugType = EDiseaseType::Appendicitis;
    DrugDisplayName = NSLOCTEXT("Pharmacy", "DefaultDrug", "Antibiótico Estándar");
}

void AEEPharmacyStation::BeginPlay()
{
    Super::BeginPlay();
}

bool AEEPharmacyStation::Interact_Implementation(ACharacter* InteractingCharacter)
{
    if (!InteractingCharacter) return false;

    // Lógica ejecutada en el Servidor cuando el jugador interactúa con la farmacia
    if (HasAuthority())
    {
        // Aquí asignamos el ítem al inventario del personaje (Ej. Character->EquipMedication(ProvidedDrugType))
        // Disparar efecto visual o sonoro de recolección en red
        return true;
    }

    return false;
}

FText AEEPharmacyStation::GetInteractionPrompt_Implementation()
{
    // Retorna el texto dinámico que aparecerá en pantalla flotando sobre la farmacia
    FFormatNamedArguments Args;
    Args.Add(TEXT("DrugName"), DrugDisplayName);
    return FText::Format(NSLOCTEXT("Pharmacy", "PromptText", "Presiona E para tomar {DrugName}"), Args);
}`;

  const CODE_GAMESTATE_H = `// Source/HospitalGame/Public/EEGameStateBase.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameStateBase.h"
#include "EEGameStateBase.generated.h"

UENUM(BlueprintType)
enum class ERoundStatus : uint8
{
    WaitingToStart  UMETA(DisplayName = "Esperando Jugadores"),
    InProgress      UMETA(DisplayName = "Partida en Curso"),
    RoundEnded      UMETA(DisplayName = "Ronda Finalizada")
};

// Delegados dinámicos para que los Widgets UMG (HUD de puntuación y reloj) se suscriban reactivamente
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnScoreChangedSignature, int32, NewScore);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTimeUpdatedSignature, float, RemainingSeconds);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnRoundStatusChangedSignature, ERoundStatus, NewStatus);

UCLASS()
class HOSPITALGAME_API AEEGameStateBase : public AGameStateBase
{
    GENERATED_BODY()
    
public:
    AEEGameStateBase();

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    // --- Variables Replicadas ---
    UPROPERTY(ReplicatedUsing = OnRep_RoundStatus, BlueprintReadOnly, Category = "Game|Status")
    ERoundStatus CurrentRoundStatus;

    UPROPERTY(ReplicatedUsing = OnRep_TeamScore, BlueprintReadOnly, Category = "Game|Score")
    int32 TeamScore;

    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game|Score")
    int32 PatientsCuredCount;

    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game|Score")
    int32 PatientsDeceasedCount;

    UPROPERTY(ReplicatedUsing = OnRep_RemainingTime, BlueprintReadOnly, Category = "Game|Time")
    float RemainingMatchTime; // En segundos

    // Umbrales para cálculo de estrellas en base a puntos acumulados
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Game|Balance")
    int32 ScoreThresholdOneStar;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Game|Balance")
    int32 ScoreThresholdTwoStars;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Game|Balance")
    int32 ScoreThresholdThreeStars;

    // --- Delegados para UI (Widgets del HUD) ---
    UPROPERTY(BlueprintAssignable, Category = "Game|Events")
    FOnScoreChangedSignature OnScoreChanged;

    UPROPERTY(BlueprintAssignable, Category = "Game|Events")
    FOnTimeUpdatedSignature OnTimeUpdated;

    UPROPERTY(BlueprintAssignable, Category = "Game|Events")
    FOnRoundStatusChangedSignature OnRoundStatusChanged;

    // --- Funciones de Lógica (Ejecutadas en Servidor) ---
    UFUNCTION(BlueprintCallable, Category = "Game|Actions")
    void AddScore(int32 PointsToAdd);

    UFUNCTION(BlueprintCallable, Category = "Game|Actions")
    void RegisterPatientResult(bool bCured);

    UFUNCTION(BlueprintCallable, Category = "Game|Actions")
    void SetRoundStatus(ERoundStatus NewStatus);

    // Calcula las estrellas finales (0 a 3) basadas en la puntuación o curados
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Game|Score")
    int32 CalculateFinalStars() const;

protected:
    virtual void BeginPlay() override;

    // RepNotifies para disparo de eventos en clientes
    UFUNCTION()
    void OnRep_RoundStatus();

    UFUNCTION()
    void OnRep_TeamScore();

    UFUNCTION()
    void OnRep_RemainingTime();

    // Temporizador en el servidor para decrementar el tiempo cada segundo
    void UpdateMatchTimer();

private:
    FTimerHandle MatchTimerHandle;
};`;

  const CODE_GAMESTATE_CPP = `// Source/HospitalGame/Private/EEGameStateBase.cpp
#include "EEGameStateBase.h"
#include "Net/UnrealNetwork.h"

AEEGameStateBase::AEEGameStateBase()
{
    PrimaryActorTick.bCanEverTick = false;
    bReplicates = true;

    // Estado inicial
    CurrentRoundStatus = ERoundStatus::WaitingToStart;
    TeamScore = 0;
    PatientsCuredCount = 0;
    PatientsDeceasedCount = 0;
    RemainingMatchTime = 180.0f; // 3 minutos por defecto de guardia médica
}

void AEEGameStateBase::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(AEEGameStateBase, CurrentRoundStatus);
    DOREPLIFETIME(AEEGameStateBase, TeamScore);
    DOREPLIFETIME(AEEGameStateBase, PatientsCuredCount);
    DOREPLIFETIME(AEEGameStateBase, PatientsDeceasedCount);
    DOREPLIFETIME(AEEGameStateBase, RemainingMatchTime);
}

void AEEGameStateBase::BeginPlay()
{
    Super::BeginPlay();

    // En el Servidor, iniciamos el cronómetro de la ronda
    if (HasAuthority())
    {
        SetRoundStatus(ERoundStatus::InProgress);

        if (UWorld* World = GetWorld())
        {
            World->GetTimerManager().SetTimer(
                MatchTimerHandle,
                this,
                &AEEGameStateBase::UpdateMatchTimer,
                1.0f,
                true
            );
        }
    }
}

void AEEGameStateBase::UpdateMatchTimer()
{
    if (!HasAuthority() || CurrentRoundStatus != ERoundStatus::InProgress)
    {
        return;
    }

    RemainingMatchTime = FMath::Max(0.0f, RemainingMatchTime - 1.0f);

    // En Listen-Server ejecutar callback local
    if (GetNetMode() != NM_DedicatedServer)
    {
        OnRep_RemainingTime();
    }

    // Comprobar finalización de la guardia médica
    if (RemainingMatchTime <= 0.0f)
    {
        if (UWorld* World = GetWorld())
        {
            World->GetTimerManager().ClearTimer(MatchTimerHandle);
        }
        SetRoundStatus(ERoundStatus::RoundEnded);

        // Notificar al GameMode autoritativo para procesar resultados y abrir WBP_RoundResults
        if (AEEGameModeBase* GM = GetWorld()->GetAuthGameMode<AEEGameModeBase>())
        {
            GM->EndRound();
        }
    }
}

void AEEGameStateBase::AddScore(int32 PointsToAdd)
{
    if (!HasAuthority()) return;

    TeamScore = FMath::Max(0, TeamScore + PointsToAdd);

    if (GetNetMode() != NM_DedicatedServer)
    {
        OnRep_TeamScore();
    }
}

void AEEGameStateBase::RegisterPatientResult(bool bCured)
{
    if (!HasAuthority()) return;

    if (bCured)
    {
        PatientsCuredCount++;
        AddScore(100); // 100 puntos por paciente curado exitosamente
    }
    else
    {
        PatientsDeceasedCount++;
        AddScore(-50); // Penalización de 50 puntos por fallecimiento
    }
}

void AEEGameStateBase::SetRoundStatus(ERoundStatus NewStatus)
{
    if (!HasAuthority()) return;

    CurrentRoundStatus = NewStatus;

    if (GetNetMode() != NM_DedicatedServer)
    {
        OnRep_RoundStatus();
    }
}

int32 AEEGameStateBase::CalculateFinalStars() const
{
    // Lógica para determinar el número de estrellas en la pantalla de resultados
    if (PatientsCuredCount >= 15 && PatientsDeceasedCount <= 2) return 3;
    if (PatientsCuredCount >= 8 && PatientsDeceasedCount <= 5) return 2;
    if (PatientsCuredCount >= 3) return 1;
    return 0;
}

void AEEGameStateBase::OnRep_RoundStatus()
{
    OnRoundStatusChanged.Broadcast(CurrentRoundStatus);
}

void AEEGameStateBase::OnRep_TeamScore()
{
    OnScoreChanged.Broadcast(TeamScore);
}

void AEEGameStateBase::OnRep_RemainingTime()
{
    OnTimeUpdated.Broadcast(RemainingMatchTime);
}
`;

  const CODE_DANGER_ZONE_H = `// Source/HospitalGame/Public/EEDangerZone.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "InteractableInterface.h"
#include "EEDangerZone.generated.h"

UENUM(BlueprintType)
enum class EZoneStatus : uint8
{
    Clean           UMETA(DisplayName = "Limpia y Segura"),
    Contaminated    UMETA(DisplayName = "Contaminada (Peligro)"),
    Disinfecting    UMETA(DisplayName = "En Proceso de Desinfección")
};

UCLASS()
class HOSPITALGAME_API AEEDangerZone : public AActor, public IInteractableInterface
{
    GENERATED_BODY()
    
public:	
    AEEDangerZone();

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    // Componente de colisión para detectar la zona de la habitación o derrame biológico
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UBoxComponent* ZoneCollisionBox;

    // Bloqueador de peones / NavBlocker para cortar físicamente el paso del pasillo en modo contaminado
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UBoxComponent* NavBlockerBox;

    // Malla visual de la zona (ej. charco de fluidos tóxicos y suelo de advertencia verde/rojo)
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* ZoneMesh;

    // Componente Niagara para gas/humo tóxico en suspensión en el pasillo (NS_ToxicGas)
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components|VFX")
    class UNiagaraComponent* ToxicGasNiagaraComp;

    // Asset del sistema de partículas Niagara (NS_ToxicGas)
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "DangerZone|Visuals")
    class UNiagaraSystem* ToxicGasNiagaraSystem;

    // Estado actual de la zona, replicado a todos los clientes
    UPROPERTY(ReplicatedUsing = OnRep_ZoneStatus, BlueprintReadOnly, Category = "DangerZone|Status")
    EZoneStatus CurrentZoneStatus;

    // Daño aplicado por segundo al médico o paciente mientras permanece dentro del área contaminada
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "DangerZone|Config")
    float DamagePerSecond;

    // Frecuencia del tick de daño (segundos)
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "DangerZone|Config")
    float DamageTickRate;

    // Tiempo requerido de desinfección mediante interacción continua (segundos)
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "DangerZone|Config")
    float RequiredCleaningTime;

    // Materiales asignados dinámicamente según el estado de la zona
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "DangerZone|Visuals")
    class UMaterialInterface* CleanMaterial;

    // Material de advertencia (verde tóxico bioluminiscente / rojo alerta)
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "DangerZone|Visuals")
    class UMaterialInterface* ContaminatedMaterial;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "DangerZone|Visuals")
    class UMaterialInterface* DisinfectingMaterial;

    // Efectos auditivos
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "DangerZone|Audio")
    class USoundBase* ContaminationAlarmSound;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "DangerZone|Audio")
    class USoundBase* DisinfectionSuccessSound;

    // --- Implementación de IInteractableInterface ---
    virtual bool Interact_Implementation(ACharacter* InteractingCharacter) override;
    virtual FText GetInteractionPrompt_Implementation() override;
    virtual bool CanInteract_Implementation(ACharacter* InteractingCharacter) const override;

    // Provoca contaminación en la zona (ejecutado por el GameMode o eventos de emergencia)
    UFUNCTION(BlueprintCallable, Category = "DangerZone|Authority")
    void TriggerContamination();

protected:
    virtual void BeginPlay() override;
    virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

    // Detección de colisión para daño / infección
    UFUNCTION()
    void OnZoneOverlapBegin(UPrimitiveComponent* OverlappedComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

    UFUNCTION()
    void OnZoneOverlapEnd(UPrimitiveComponent* OverlappedComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex);

    // RepNotify para actualizar visuales en los clientes
    UFUNCTION()
    void OnRep_ZoneStatus();

    // Actualiza visibilidad y material según el estado actual
    void UpdateZoneVisuals();

    // Aplica daño a los personajes en el área (Autoritativo en Servidor)
    void ApplyContaminationDamage();

    // Concluye la desinfección tras cumplirse el tiempo de limpieza
    void FinishDisinfection();

private:
    FTimerHandle DamageTimerHandle;
    FTimerHandle CleaningTimerHandle;

    // Lista de personajes actualmente dentro del volumen contaminado (UE5.3 TObjectPtr estándar)
    UPROPERTY(Transient)
    TArray<TObjectPtr<ACharacter>> CharactersInsideZone;
};`;

  const CODE_DANGER_ZONE_CPP = `// Source/HospitalGame/Private/EEDangerZone.cpp
#include "EEDangerZone.h"
#include "Components/BoxComponent.h"
#include "Components/StaticMeshComponent.h"
#include "NiagaraComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "GameFramework/Character.h"
#include "GameFramework/DamageType.h"
#include "Kismet/GameplayStatics.h"
#include "Net/UnrealNetwork.h"

AEEDangerZone::AEEDangerZone()
{
    PrimaryActorTick.bCanEverTick = false;
    bReplicates = true;

    // 1. Configurar volumen de detección de área y solapamiento
    ZoneCollisionBox = CreateDefaultSubobject<UBoxComponent>(TEXT("ZoneCollisionBox"));
    RootComponent = ZoneCollisionBox;
    ZoneCollisionBox->SetBoxExtent(FVector(150.0f, 150.0f, 50.0f));
    ZoneCollisionBox->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
    ZoneCollisionBox->SetGenerateOverlapEvents(true);

    // 2. Malla visual en el suelo (placa de advertencia y charco químico peligroso)
    ZoneMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ZoneMesh"));
    ZoneMesh->SetupAttachment(RootComponent);
    ZoneMesh->SetCollisionProfileName(TEXT("NoCollision"));
    ZoneMesh->SetRelativeLocation(FVector(0.0f, 0.0f, -48.0f)); // Al ras de la superficie

    // 3. Sistema de partículas Niagara para gas/humo tóxico en suspensión (NS_ToxicGas)
    ToxicGasNiagaraComp = CreateDefaultSubobject<UNiagaraComponent>(TEXT("ToxicGasNiagaraComp"));
    ToxicGasNiagaraComp->SetupAttachment(RootComponent);
    ToxicGasNiagaraComp->bAutoActivate = false;

    // 4. Bloqueador de peones / NavBlocker para cortar el paso del pasillo en modo contaminado
    NavBlockerBox = CreateDefaultSubobject<UBoxComponent>(TEXT("NavBlockerBox"));
    NavBlockerBox->SetupAttachment(RootComponent);
    NavBlockerBox->SetBoxExtent(FVector(150.0f, 150.0f, 120.0f));
    NavBlockerBox->SetCollisionProfileName(TEXT("BlockAllDynamic"));
    NavBlockerBox->SetCollisionEnabled(ECollisionEnabled::NoCollision); // Se activa solo en estado Contaminated

    // 5. Parámetros de juego por defecto
    CurrentZoneStatus = EZoneStatus::Clean;
    DamagePerSecond = 15.0f;
    DamageTickRate = 1.0f;
    RequiredCleaningTime = 4.0f;
}

void AEEDangerZone::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(AEEDangerZone, CurrentZoneStatus);
}

void AEEDangerZone::BeginPlay()
{
    Super::BeginPlay();

    // Configurar listeners de solapamiento en el servidor
    if (HasAuthority())
    {
        ZoneCollisionBox->OnComponentBeginOverlap.AddDynamic(this, &AEEDangerZone::OnZoneOverlapBegin);
        ZoneCollisionBox->OnComponentEndOverlap.AddDynamic(this, &AEEDangerZone::OnZoneOverlapEnd);
    }

    UpdateZoneVisuals();
}

void AEEDangerZone::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    // Limpieza de temporizadores de red
    if (UWorld* World = GetWorld())
    {
        World->GetTimerManager().ClearTimer(DamageTimerHandle);
        World->GetTimerManager().ClearTimer(CleaningTimerHandle);
    }

    Super::EndPlay(EndPlayReason);
}

void AEEDangerZone::TriggerContamination()
{
    if (!HasAuthority()) return;

    CurrentZoneStatus = EZoneStatus::Contaminated;

    // En Listen-Server, invocar OnRep localmente para el jugador anfitrión
    if (GetNetMode() != NM_DedicatedServer)
    {
        OnRep_ZoneStatus();
    }

    // Iniciar el temporizador de daño continuo si no estaba corriendo
    if (GetWorld() && !GetWorld()->GetTimerManager().IsTimerActive(DamageTimerHandle))
    {
        GetWorld()->GetTimerManager().SetTimer(
            DamageTimerHandle,
            this,
            &AEEDangerZone::ApplyContaminationDamage,
            DamageTickRate,
            true
        );
    }

    // Reproducir alarma biológica
    if (ContaminationAlarmSound)
    {
        UGameplayStatics::PlaySoundAtLocation(this, ContaminationAlarmSound, GetActorLocation());
    }
}

bool AEEDangerZone::Interact_Implementation(ACharacter* InteractingCharacter)
{
    if (!InteractingCharacter || !HasAuthority()) return false;

    // Solo se puede iniciar desinfección si la zona se encuentra contaminada
    if (CurrentZoneStatus != EZoneStatus::Contaminated)
    {
        return false;
    }

    CurrentZoneStatus = EZoneStatus::Disinfecting;

    if (GetNetMode() != NM_DedicatedServer)
    {
        OnRep_ZoneStatus();
    }

    // Temporizador de desinfección de 4 segundos
    if (GetWorld())
    {
        GetWorld()->GetTimerManager().SetTimer(
            CleaningTimerHandle,
            this,
            &AEEDangerZone::FinishDisinfection,
            RequiredCleaningTime,
            false
        );
    }

    return true;
}

FText AEEDangerZone::GetInteractionPrompt_Implementation()
{
    switch (CurrentZoneStatus)
    {
    case EZoneStatus::Contaminated:
        return NSLOCTEXT("DangerZone", "PromptClean", "Presiona [E] para iniciar Desinfección Biológica (4s)");

    case EZoneStatus::Disinfecting:
        return NSLOCTEXT("DangerZone", "PromptDisinfecting", "Zona en Proceso de Desinfección Activa...");

    case EZoneStatus::Clean:
    default:
        return FText::GetEmpty();
    }
}

bool AEEDangerZone::CanInteract_Implementation(ACharacter* InteractingCharacter) const
{
    // Solo es interactuable para desinfección si la zona se encuentra contaminada
    return CurrentZoneStatus == EZoneStatus::Contaminated;
}

void AEEDangerZone::FinishDisinfection()
{
    if (!HasAuthority()) return;

    CurrentZoneStatus = EZoneStatus::Clean;

    // Detener ticks de daño
    if (GetWorld())
    {
        GetWorld()->GetTimerManager().ClearTimer(DamageTimerHandle);
    }

    if (GetNetMode() != NM_DedicatedServer)
    {
        OnRep_ZoneStatus();
    }

    if (DisinfectionSuccessSound)
    {
        UGameplayStatics::PlaySoundAtLocation(this, DisinfectionSuccessSound, GetActorLocation());
    }
}

void AEEDangerZone::OnZoneOverlapBegin(UPrimitiveComponent* OverlappedComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
    if (!HasAuthority() || !OtherActor) return;

    ACharacter* OverlappingChar = Cast<ACharacter>(OtherActor);
    if (!OverlappingChar) return;

    CharactersInsideZone.AddUnique(OverlappingChar);

    // Si la zona está activa con peligro biológico, aplicar daño inmediato
    if (CurrentZoneStatus == EZoneStatus::Contaminated)
    {
        if (GetWorld() && !GetWorld()->GetTimerManager().IsTimerActive(DamageTimerHandle))
        {
            GetWorld()->GetTimerManager().SetTimer(
                DamageTimerHandle,
                this,
                &AEEDangerZone::ApplyContaminationDamage,
                DamageTickRate,
                true
            );
        }

        UGameplayStatics::ApplyDamage(
            OverlappingChar,
            DamagePerSecond * DamageTickRate,
            nullptr,
            this,
            UDamageType::StaticClass()
        );
    }
}

void AEEDangerZone::OnZoneOverlapEnd(UPrimitiveComponent* OverlappedComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex)
{
    if (!HasAuthority() || !OtherActor) return;

    ACharacter* LeavingChar = Cast<ACharacter>(OtherActor);
    if (!LeavingChar) return;

    CharactersInsideZone.Remove(LeavingChar);

    // Pausar timer de daño si no quedan actores dentro
    if (CharactersInsideZone.Num() == 0 && GetWorld())
    {
        GetWorld()->GetTimerManager().ClearTimer(DamageTimerHandle);
    }
}

void AEEDangerZone::ApplyContaminationDamage()
{
    if (!HasAuthority() || CurrentZoneStatus != EZoneStatus::Contaminated) return;

    // Limpiar punteros nulos o destruidos de forma segura
    for (int32 i = CharactersInsideZone.Num() - 1; i >= 0; --i)
    {
        ACharacter* TargetCharacter = CharactersInsideZone[i];
        if (!IsValid(TargetCharacter))
        {
            CharactersInsideZone.RemoveAt(i);
            continue;
        }

        UGameplayStatics::ApplyDamage(
            TargetCharacter,
            DamagePerSecond * DamageTickRate,
            nullptr,
            this,
            UDamageType::StaticClass()
        );
    }
}

void AEEDangerZone::OnRep_ZoneStatus()
{
    UpdateZoneVisuals();
}

void AEEDangerZone::UpdateZoneVisuals()
{
    switch (CurrentZoneStatus)
    {
    case EZoneStatus::Clean:
        // 1. Desactivar emisión de gas tóxico Niagara (NS_ToxicGas)
        if (ToxicGasNiagaraComp)
        {
            ToxicGasNiagaraComp->Deactivate();
        }

        // 2. Ocultar el suelo de advertencia o restaurar material limpio
        if (ZoneMesh)
        {
            if (CleanMaterial)
            {
                ZoneMesh->SetMaterial(0, CleanMaterial);
            }
            ZoneMesh->SetVisibility(false);
        }

        // 3. Desbloquear físicamente el paso en el pasillo para los peones
        if (NavBlockerBox)
        {
            NavBlockerBox->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        }
        break;

    case EZoneStatus::Contaminated:
        // 1. Activar sistema de partículas Niagara (NS_ToxicGas) con nubes verdes de gas biológico
        if (ToxicGasNiagaraComp)
        {
            if (ToxicGasNiagaraSystem && ToxicGasNiagaraComp->GetAsset() != ToxicGasNiagaraSystem)
            {
                ToxicGasNiagaraComp->SetAsset(ToxicGasNiagaraSystem);
            }
            ToxicGasNiagaraComp->Activate(true);
        }

        // 2. Cambiar material del suelo a advertencia verde tóxico bioluminiscente / rojo alerta
        if (ZoneMesh)
        {
            if (ContaminatedMaterial)
            {
                ZoneMesh->SetMaterial(0, ContaminatedMaterial);
            }
            ZoneMesh->SetVisibility(true);
        }

        // 3. Bloquear físicamente el paso de peones y jugadores en el pasillo
        if (NavBlockerBox)
        {
            NavBlockerBox->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
        }

        // 4. Reproducir alarma acústica de contaminación biológica
        if (ContaminationAlarmSound)
        {
            UGameplayStatics::PlaySoundAtLocation(this, ContaminationAlarmSound, GetActorLocation());
        }
        break;

    case EZoneStatus::Disinfecting:
        // Durante la desinfección, cortar la emisión de gas y aplicar material de espuma de limpieza
        if (ToxicGasNiagaraComp)
        {
            ToxicGasNiagaraComp->Deactivate();
        }

        if (ZoneMesh)
        {
            if (DisinfectingMaterial)
            {
                ZoneMesh->SetMaterial(0, DisinfectingMaterial);
            }
            ZoneMesh->SetVisibility(true);
        }
        break;
    }
}
`;

  const CODE_DEFIB_STATION_H = `// Source/HospitalGame/Public/EEDefibrillatorStation.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "InteractableInterface.h"
#include "EEDefibrillatorStation.generated.h"

UCLASS()
class HOSPITALGAME_API AEEDefibrillatorStation : public AActor, public IInteractableInterface
{
    GENERATED_BODY()
    
public:	
    AEEDefibrillatorStation();

    // Malla estática del carro de paro / montura del desfibrilador
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* StationMesh;

    // Efecto de sonido al equipar las paletas o cargar el capacitor
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Defibrillator|Audio")
    class USoundBase* PickupSound;

    // Nivel de energía de descarga configurado (Joules)
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defibrillator|Config")
    float ShockEnergyJoules;

    // --- Implementación de IInteractableInterface ---
    virtual bool Interact_Implementation(ACharacter* InteractingCharacter) override;
    virtual FText GetInteractionPrompt_Implementation() override;

protected:
    virtual void BeginPlay() override;
};`;

  const CODE_DEFIB_STATION_CPP = `// Source/HospitalGame/Private/EEDefibrillatorStation.cpp
#include "EEDefibrillatorStation.h"
#include "Components/StaticMeshComponent.h"
#include "EEDoctorCharacter.h"
#include "Kismet/GameplayStatics.h"

AEEDefibrillatorStation::AEEDefibrillatorStation()
{
    PrimaryActorTick.bCanEverTick = false;
    bReplicates = true;

    StationMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StationMesh"));
    RootComponent = StationMesh;
    StationMesh->SetCollisionProfileName(TEXT("BlockAll"));

    ShockEnergyJoules = 200.0f; // Estándar bifásico para reanimación
}

void AEEDefibrillatorStation::BeginPlay()
{
    Super::BeginPlay();
}

bool AEEDefibrillatorStation::Interact_Implementation(ACharacter* InteractingCharacter)
{
    if (!InteractingCharacter || !HasAuthority()) return false;

    AEEDoctorCharacter* Doctor = Cast<AEEDoctorCharacter>(InteractingCharacter);
    if (!Doctor) return false;

    // Si ya lleva el desfibrilador, lo devuelve al soporte
    if (Doctor->IsCarryingDefibrillator())
    {
        Doctor->ConsumeCarriedItem();
        return true;
    }

    // Equipar las paletas bifásicas en las manos del médico
    Doctor->EquipDefibrillator();

    if (PickupSound)
    {
        UGameplayStatics::PlaySoundAtLocation(this, PickupSound, GetActorLocation());
    }

    return true;
}

FText AEEDefibrillatorStation::GetInteractionPrompt_Implementation()
{
    return NSLOCTEXT("Defibrillator", "EquipPrompt", "Presiona [E] para tomar el Carro de Desfibrilador (200J)");
}`;

  const CODE_DOCTOR_CHAR_H = `// Source/HospitalGame/Public/EEMedicalCharacter.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "MedicalPatientComponent.h" // Para el Enum EDiseaseType
#include "InteractableInterface.h"
#include "EEMedicalCharacter.generated.h"

// Delegado dinámico para actualizar el HUD local con el texto de interacción
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnInteractionPromptChanged, const FText&, PromptText, bool, bIsInteractable);

UCLASS()
class HOSPITALGAME_API AEEMedicalCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AEEMedicalCharacter();

	virtual void Tick(float DeltaTime) override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	// --- Inventario / Mano del Jugador (Hand_R_Socket) ---
	UPROPERTY(ReplicatedUsing = OnRep_HeldDrug, BlueprintReadOnly, Category = "Inventory")
	EDiseaseType HeldDrugType;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Inventory")
	bool bIsHoldingItem;

	// Indica si sostiene un instrumento que requiere dos manos (ej. Desfibrilador bifásico)
	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Inventory")
	bool bIsHoldingTwoHandedItem;

	// Puntero al Actor físico 3D instanciado en tiempo de ejecución acoplado a Hand_R_Socket
	UPROPERTY(Transient, BlueprintReadOnly, Category = "Inventory|Spawning")
	TObjectPtr<AActor> CurrentHeldActor;

	// Mapeo configurable de clases de ítems 3D por tipo de patología / tratamiento
	// Ej. Anaphylaxis -> BP_Syringe_Epinephrine, CardiacArrest -> BP_Defibrillator_Paddles
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Inventory|Spawning")
	TMap<EDiseaseType, TSubclassOf<AActor>> DrugItemClasses;

	// Componente estático alternativo para visualización rápida sin SpawnActor
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Inventory")
	class UStaticMeshComponent* HeldItemMesh;

	// Punto de sujeción (Socket) en la malla del personaje: "Hand_R_Socket"
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Inventory")
	FName HandSocketName;

	// Función para actualizar o recrear la instancia del ítem acoplado al socket
	UFUNCTION(BlueprintCallable, Category = "Inventory")
	void UpdateHeldItemVisuals();

	// --- Orientación Procedural de Columna / Pecho (Aim Offset Médico) ---
	/** Rotación calculada de la columna (Spine/Chest) para orientar el torso hacia el objetivo o paciente */
	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Procedural Animation")
	FRotator ProceduralSpineRotation;

	/** Velocidad de interpolación angular con FMath::RInterpTo (amortiguación a 60 FPS) */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Procedural Animation")
	float SpineInterpSpeed;

	/** Límite anatómico máximo de cabeceo (Pitch) en grados [-35.0°, +35.0°] */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Procedural Animation")
	float MaxSpinePitch;

	/** Límite anatómico máximo de giro (Yaw) en grados [-50.0°, +50.0°] */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Procedural Animation")
	float MaxSpineYaw;

	// RPC Server para replicar la orientación de la columna a los proxies de red
	UFUNCTION(Server, Unreliable, Category = "Procedural Animation")
	void Server_UpdateSpineRotation(FRotator NewSpineRot);

	// --- Funciones de Lógica Replicada (Server RPCs) ---
	UFUNCTION(BlueprintCallable, Server, Reliable, Category = "Inventory")
	void Server_EquipDrug(EDiseaseType NewDrug);

	UFUNCTION(BlueprintCallable, Server, Reliable, Category = "Inventory")
	void Server_ClearInventory();

	UFUNCTION(BlueprintCallable, Server, Reliable, WithValidation, Category = "Interaction")
	void Server_Interact(AActor* TargetActor);

	// Trazado de línea para detectar actores interactuables frente al jugador (2 metros)
	UFUNCTION(BlueprintCallable, Category = "Interaction")
	void PerformInteractionCheck();

	// Acción de interacción llamada al presionar [E]
	UFUNCTION(BlueprintCallable, Category = "Interaction")
	void InteractWithFocusedActor();

	// Evento para suscribir el Widget UMG (HUD de pantalla)
	UPROPERTY(BlueprintAssignable, Category = "Interaction|UI")
	FOnInteractionPromptChanged OnInteractionPromptChanged;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnRep_HeldDrug();

	// Actor interactuable actualmente enfocado bajo la retícula
	UPROPERTY(Transient, BlueprintReadOnly, Category = "Interaction")
	TWeakObjectPtr<AActor> CurrentFocusedInteractable;
};`;

  const CODE_DOCTOR_CHAR_CPP = `// Source/HospitalGame/Private/EEMedicalCharacter.cpp
#include "EEMedicalCharacter.h"
#include "InteractableInterface.h"
#include "Net/UnrealNetwork.h"
#include "Components/StaticMeshComponent.h"
#include "Kismet/KismetMathLibrary.h"
#include "DrawDebugHelpers.h"

AEEMedicalCharacter::AEEMedicalCharacter()
{
	PrimaryActorTick.bCanEverTick = true;
	bReplicates = true;

	HeldDrugType = EDiseaseType::None;
	bIsHoldingItem = false;
	bIsHoldingTwoHandedItem = false;
	HandSocketName = TEXT("Hand_R_Socket");

	// Parámetros de orientación procedural de la columna vertebral
	ProceduralSpineRotation = FRotator::ZeroRotator;
	SpineInterpSpeed = 10.0f;
	MaxSpinePitch = 35.0f;
	MaxSpineYaw = 50.0f;

	// Componente de malla para visualizar la jeringa / desfibrilador en mano
	HeldItemMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("HeldItemMesh"));
	HeldItemMesh->SetupAttachment(GetMesh(), HandSocketName);
	HeldItemMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	HeldItemMesh->SetCastShadow(true);
	HeldItemMesh->SetVisibility(false);
}

void AEEMedicalCharacter::BeginPlay()
{
	Super::BeginPlay();
}

void AEEMedicalCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Si el jugador está realizando una acción médica (ej. usando el desfibrilador)
	// podemos orientar proceduralmente la parte superior del cuerpo hacia el objetivo.
	if (bIsHoldingItem && Controller && Controller->IsLocalController())
	{
		// Lógica de cálculo de rotación de la columna vertebral (Spine/Chest)

		// 1. Obtener la rotación del controlador (cámara / retícula) y la orientación base del actor
		const FRotator ControlRot = Controller->GetControlRotation();
		const FRotator ActorRot = GetActorRotation();

		// 2. Calcular la diferencia angular normalizada (Aim Offset local)
		FRotator TargetDeltaRot = UKismetMathLibrary::NormalizedDeltaRotator(ControlRot, ActorRot);

		// Si el médico está enfocando activamente a un paciente interactuable en la camilla,
		// orientamos la columna con precisión matemática hacia el torso/pecho del paciente
		if (CurrentFocusedInteractable.IsValid())
		{
			const FVector SpineOrigin = GetMesh() ? GetMesh()->GetSocketLocation(FName("spine_02")) : GetActorLocation();
			// Apunta 35 cm por encima del origen de la camilla (área torácica del paciente)
			const FVector TargetTorso = CurrentFocusedInteractable->GetActorLocation() + FVector(0.0f, 0.0f, 35.0f);
			const FRotator LookAtRot = UKismetMathLibrary::FindLookAtRotation(SpineOrigin, TargetTorso);
			TargetDeltaRot = UKismetMathLibrary::NormalizedDeltaRotator(LookAtRot, ActorRot);
		}

		// 3. Aplicar Clamping anatómico para evitar deformaciones o roturas biomecánicas
		FRotator TargetClampedSpine = FRotator::ZeroRotator;
		TargetClampedSpine.Pitch = FMath::ClampAngle(TargetDeltaRot.Pitch, -MaxSpinePitch, MaxSpinePitch);
		TargetClampedSpine.Yaw = FMath::ClampAngle(TargetDeltaRot.Yaw, -MaxSpineYaw, MaxSpineYaw);
		TargetClampedSpine.Roll = 0.0f; // Evitamos torsión lateral para garantizar estabilidad visual

		// 4. Suavizado procedural mediante FMath::RInterpTo a 60 FPS estables
		ProceduralSpineRotation = FMath::RInterpTo(
			ProceduralSpineRotation,
			TargetClampedSpine,
			DeltaTime,
			SpineInterpSpeed
		);

		// 5. Enviar rotación actualizada al servidor para replicar a proxies simulados
		Server_UpdateSpineRotation(ProceduralSpineRotation);
	}
	else
	{
		// Si no tiene ningún ítem en mano, relajamos gradualmente la columna a pose neutral
		if (!ProceduralSpineRotation.IsNearlyZero(0.1f))
		{
			ProceduralSpineRotation = FMath::RInterpTo(
				ProceduralSpineRotation,
				FRotator::ZeroRotator,
				DeltaTime,
				SpineInterpSpeed * 0.8f
			);
		}
	}

	// Ejecutar el raycast interactivo en cada fotograma solo para el cliente local
	if (IsLocallyControlled())
	{
		PerformInteractionCheck();
	}
}

void AEEMedicalCharacter::Server_UpdateSpineRotation_Implementation(FRotator NewSpineRot)
{
	ProceduralSpineRotation = NewSpineRot;
}

void AEEMedicalCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	if (PlayerInputComponent)
	{
		PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &AEEMedicalCharacter::InteractWithFocusedActor);
	}
}

void AEEMedicalCharacter::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(AEEMedicalCharacter, HeldDrugType);
	DOREPLIFETIME(AEEMedicalCharacter, bIsHoldingItem);
	DOREPLIFETIME(AEEMedicalCharacter, bIsHoldingTwoHandedItem);

	// Optimización de red: El cliente autónomo calcula su columna localmente con latencia 0.
	// Por tanto, solo replicamos a los proxies simulados de otros jugadores (COND_SkipOwner).
	DOREPLIFETIME_CONDITION(AEEMedicalCharacter, ProceduralSpineRotation, COND_SkipOwner);
}

void AEEMedicalCharacter::Server_EquipDrug_Implementation(EDiseaseType NewDrug)
{
	HeldDrugType = NewDrug;
	bIsHoldingItem = (HeldDrugType != EDiseaseType::None);

	// En Listen-Server o Standalone, OnRep no se llama por defecto en el host
	if (GetNetMode() != NM_DedicatedServer)
	{
		OnRep_HeldDrug();
	}
}

void AEEMedicalCharacter::Server_ClearInventory_Implementation()
{
	HeldDrugType = EDiseaseType::None;
	bIsHoldingItem = false;

	if (GetNetMode() != NM_DedicatedServer)
	{
		OnRep_HeldDrug();
	}
}

void AEEMedicalCharacter::OnRep_HeldDrug()
{
	// Actualizar visuales del ítem acoplado a la mano tanto en clientes como en host local
	UpdateHeldItemVisuals();
}

void AEEMedicalCharacter::UpdateHeldItemVisuals()
{
	// 1. Limpieza preventiva: Si ya existe un actor 3D sostenido en la mano, lo destruimos
	if (IsValid(CurrentHeldActor))
	{
		CurrentHeldActor->Destroy();
		CurrentHeldActor = nullptr;
	}

	// 2. Si el personaje no sostiene ningún ítem o es EDiseaseType::None, finalizamos
	if (!bIsHoldingItem || HeldDrugType == EDiseaseType::None)
	{
		if (HeldItemMesh)
		{
			HeldItemMesh->SetVisibility(false);
		}
		return;
	}

	// 3. Resolver la clase del actor 3D a instanciar (BP_Syringe_Epinephrine / BP_Defibrillator_Paddles)
	TSubclassOf<AActor> ItemClassToSpawn = nullptr;
	if (DrugItemClasses.Contains(HeldDrugType))
	{
		ItemClassToSpawn = DrugItemClasses[HeldDrugType];
	}

	// 4. Instanciación física de la malla 3D y acople exacto a Hand_R_Socket
	if (ItemClassToSpawn && GetWorld())
	{
		FActorSpawnParameters SpawnParams;
		SpawnParams.Owner = this;
		SpawnParams.Instigator = this;
		SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

		CurrentHeldActor = GetWorld()->SpawnActor<AActor>(
			ItemClassToSpawn, 
			FVector::ZeroVector, 
			FRotator::ZeroRotator, 
			SpawnParams
		);

		if (CurrentHeldActor)
		{
			// Desactivar colisiones físicas del ítem para no interferir con la cápsula del doctor
			CurrentHeldActor->SetActorEnableCollision(false);

			// Reglas de acople: Ajustar SnapToTarget a la posición y rotación del socket Hand_R_Socket
			FAttachmentTransformRules AttachRules(
				EAttachmentRule::SnapToTarget,
				EAttachmentRule::SnapToTarget,
				EAttachmentRule::KeepWorld,
				false
			);

			CurrentHeldActor->AttachToComponent(GetMesh(), AttachRules, HandSocketName);
		}
	}
	else if (HeldItemMesh)
	{
		// Fallback mediante AttachComponentToComponent sobre el componente estático
		HeldItemMesh->AttachToComponent(
			GetMesh(), 
			FAttachmentTransformRules::SnapToTargetNotIncludingScale, 
			HandSocketName
		);
		HeldItemMesh->SetVisibility(true);
	}
}

void AEEMedicalCharacter::PerformInteractionCheck()
{
	if (!IsLocallyControlled()) return;

	FVector Start = GetActorLocation();
	FVector Forward = GetActorForwardVector();
	FVector End = Start + (Forward * 200.0f); // Trazado de 2 metros hacia adelante

	FHitResult HitResult;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(this);

	if (GetWorld()->LineTraceSingleByChannel(HitResult, Start, End, ECC_Visibility, Params))
	{
		AActor* HitActor = HitResult.GetActor();
		if (HitActor && HitActor->Implements<UInteractableInterface>())
		{
			// Muestra el prompt flotante en la UI local del jugador
			if (CurrentFocusedInteractable.Get() != HitActor)
			{
				CurrentFocusedInteractable = HitActor;
				const FText Prompt = IInteractableInterface::Execute_GetInteractionPrompt(HitActor);
				OnInteractionPromptChanged.Broadcast(Prompt, true);
			}
			return;
		}
	}

	// Limpiar prompt si no estamos apuntando a ningún interactuable
	if (CurrentFocusedInteractable.IsValid())
	{
		CurrentFocusedInteractable = nullptr;
		OnInteractionPromptChanged.Broadcast(FText::GetEmpty(), false);
	}
}

void AEEMedicalCharacter::InteractWithFocusedActor()
{
	if (CurrentFocusedInteractable.IsValid())
	{
		Server_Interact(CurrentFocusedInteractable.Get());
	}
}

bool AEEMedicalCharacter::Server_Interact_Validate(AActor* TargetActor)
{
	// Verificación de proximidad anti-exploit en el Servidor (<= 250 cm)
	if (!TargetActor) return false;
	const float Distance = FVector::Dist(GetActorLocation(), TargetActor->GetActorLocation());
	return Distance <= 250.0f;
}

void AEEMedicalCharacter::Server_Interact_Implementation(AActor* TargetActor)
{
	if (TargetActor && TargetActor->Implements<UInteractableInterface>())
	{
		IInteractableInterface::Execute_Interact(TargetActor, this);
	}
};`;

  const CODE_TOUCH_CONTROLS_H = `// Source/HospitalGame/Public/UI/EETouchControlsWidget.h
#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "MedicalPatientComponent.h" // Para el Enum EDiseaseType
#include "EETouchControlsWidget.generated.h"

class UButton;
class UImage;
class UTextBlock;
class AEEMedicalCharacter;

/**
 * Clase base C++ para el Widget UMG WBP_TouchControls.
 * Orquesta el Joystick Virtual izquierdo (IA_Move) y los botones táctiles:
 * - Button_Interact: Botón gigante de interacción contextual (IA_Interact)
 * - Button_Action: Botón de acción rápida para aplicar fármaco en mano al paciente enfocado
 */
UCLASS()
class HOSPITALGAME_API UEETouchControlsWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

	// Actualiza la UI táctil y visibilidad de Button_Action según el ítem sostenido
	UFUNCTION(BlueprintCallable, Category = "TouchControls|UI")
	void UpdateHeldItemUI(EDiseaseType CurrentDrug, bool bHoldingItem);

	// Actualiza la etiqueta y estado del botón de interacción según el actor bajo la retícula
	UFUNCTION(BlueprintCallable, Category = "TouchControls|UI")
	void UpdateInteractionPrompt(const FText& PromptText, bool bIsInteractable);

protected:
	// --- Widgets Vinculados (BindWidget de UMG) ---

	// Botón gigante de interacción situado en la esquina inferior derecha
	UPROPERTY(meta = (BindWidget))
	UButton* Button_Interact;

	// Botón de acción rápida / aplicar tratamiento médico
	UPROPERTY(meta = (BindWidget))
	UButton* Button_Action;

	// Icono dinámico que ilustra la jeringa o desfibrilador sostenido
	UPROPERTY(meta = (BindWidgetOptional))
	UImage* Image_ActionIcon;

	// Texto descriptivo dinámico (ej. "TOMAR", "TRATAR", "DESINFECTAR")
	UPROPERTY(meta = (BindWidgetOptional))
	UTextBlock* Text_InteractPrompt;

	// Callbacks de clic / evento táctil
	UFUNCTION()
	void HandleInteractClicked();

	UFUNCTION()
	void HandleActionClicked();

private:
	// Referencia cacheada al médico local
	TWeakObjectPtr<AEEMedicalCharacter> CachedDoctorCharacter;
};`;

  const CODE_TOUCH_CONTROLS_CPP = `// Source/HospitalGame/Private/UI/EETouchControlsWidget.cpp
#include "UI/EETouchControlsWidget.h"
#include "Components/Button.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "EEMedicalCharacter.h"
#include "Kismet/GameplayStatics.h"

void UEETouchControlsWidget::NativeConstruct()
{
	Super::NativeConstruct();

	// 1. Obtener referencia al médico controlado por el jugador local
	APawn* OwningPawn = GetOwningPlayerPawn();
	CachedDoctorCharacter = Cast<AEEMedicalCharacter>(OwningPawn);

	// 2. Vincular listeners dinámicos a los botones de UMG
	if (Button_Interact)
	{
		Button_Interact->OnClicked.AddDynamic(this, &UEETouchControlsWidget::HandleInteractClicked);
	}

	if (Button_Action)
	{
		Button_Action->OnClicked.AddDynamic(this, &UEETouchControlsWidget::HandleActionClicked);
		// Ocultar por defecto hasta que el médico equipe un ítem de la farmacia o carro de paro
		Button_Action->SetVisibility(ESlateVisibility::Collapsed);
	}

	// 3. Suscribirse a los delegados de eventos del personaje
	if (CachedDoctorCharacter.IsValid())
	{
		CachedDoctorCharacter->OnInteractionPromptChanged.AddDynamic(this, &UEETouchControlsWidget::UpdateInteractionPrompt);
		UpdateHeldItemUI(CachedDoctorCharacter->HeldDrugType, CachedDoctorCharacter->bIsHoldingItem);
	}
}

void UEETouchControlsWidget::NativeDestruct()
{
	if (Button_Interact)
	{
		Button_Interact->OnClicked.RemoveAll(this);
	}

	if (Button_Action)
	{
		Button_Action->OnClicked.RemoveAll(this);
	}

	if (CachedDoctorCharacter.IsValid())
	{
		CachedDoctorCharacter->OnInteractionPromptChanged.RemoveAll(this);
	}

	Super::NativeDestruct();
}

void UEETouchControlsWidget::HandleInteractClicked()
{
	// Dispara el evento IA_Interact sobre el actor interactuable más cercano enfocado
	if (CachedDoctorCharacter.IsValid())
	{
		CachedDoctorCharacter->InteractWithFocusedActor();
	}
}

void UEETouchControlsWidget::HandleActionClicked()
{
	// Dispara la acción rápida para administrar el fármaco o choque eléctrico al paciente
	if (CachedDoctorCharacter.IsValid())
	{
		CachedDoctorCharacter->InteractWithFocusedActor();
	}
}

void UEETouchControlsWidget::UpdateHeldItemUI(EDiseaseType CurrentDrug, bool bHoldingItem)
{
	if (!Button_Action) return;

	// Si el médico sostiene una jeringa o desfibrilador, mostramos el botón de acción rápida
	if (bHoldingItem && CurrentDrug != EDiseaseType::None)
	{
		Button_Action->SetVisibility(ESlateVisibility::Visible);
	}
	else
	{
		Button_Action->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UEETouchControlsWidget::UpdateInteractionPrompt(const FText& PromptText, bool bIsInteractable)
{
	if (Button_Interact)
	{
		Button_Interact->SetIsEnabled(bIsInteractable);
	}

	if (Text_InteractPrompt)
	{
		Text_InteractPrompt->SetText(bIsInteractable ? PromptText : FText::FromString(TEXT("INTERACTUAR")));
	}
}`;

  const CODE_SESSION_SUBSYSTEM_H = `// Source/HospitalGame/Public/MultiplayerSessionSubsystem.h
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Interfaces/OnlineSessionInterface.h"
#include "MultiplayerSessionSubsystem.generated.h"

// Delegado dinámico para notificar a Blueprints y a la UI del resultado de la creación
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnServerCreateComplete, bool, bWasSuccessful);

UCLASS()
class HOSPITALGAME_API UMultiplayerSessionSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    UMultiplayerSessionSubsystem();

    // Evento para notificar a la UI (Blueprints) cuando la sesión se crea
    UPROPERTY(BlueprintAssignable, Category = "Multiplayer")
    FOnServerCreateComplete OnServerCreateComplete;

    // Crear una nueva partida hospitalaria cooperativa (Host)
    UFUNCTION(BlueprintCallable, Category = "Multiplayer")
    void HostSession(int32 MaxPlayers, bool bIsLAN);

    // Unirse a una partida existente mediante Dirección IP directa
    UFUNCTION(BlueprintCallable, Category = "Multiplayer")
    void JoinSessionByIP(const FString& IPAddress);

private:
    // Puntero inteligente a la interfaz de sesiones de red de Unreal
    IOnlineSessionPtr SessionInterface;

    // Delegado interno que responde al callback asíncrono de creación de sesión
    void OnCreateSessionComplete(FName SessionName, bool bWasSuccessful);
};`;

  const CODE_SESSION_SUBSYSTEM_CPP = `// Source/HospitalGame/Private/MultiplayerSessionSubsystem.cpp
#include "MultiplayerSessionSubsystem.h"
#include "OnlineSubsystem.h"
#include "OnlineSessionSettings.h"
#include "Kismet/GameplayStatics.h"

UMultiplayerSessionSubsystem::UMultiplayerSessionSubsystem()
{
    IOnlineSubsystem* Subsystem = IOnlineSubsystem::Get();
    if (Subsystem)
    {
        SessionInterface = Subsystem->GetSessionInterface();
    }
}

void UMultiplayerSessionSubsystem::HostSession(int32 MaxPlayers, bool bIsLAN)
{
    if (!SessionInterface.IsValid()) return;

    auto ExistingSession = SessionInterface->GetNamedSession(NAME_GameSession);
    if (ExistingSession)
    {
        SessionInterface->DestroySession(NAME_GameSession);
    }

    FOnlineSessionSettings SessionSettings;
    SessionSettings.bIsLANMatch = bIsLAN;
    SessionSettings.NumPublicConnections = MaxPlayers;
    SessionSettings.bAllowJoinInProgress = true;
    SessionSettings.bShouldAdvertise = true;
    SessionSettings.bUsesPresence = true;

    // Vincular delegado de completado para el callback asíncrono
    SessionInterface->OnCreateSessionCompleteDelegates.AddUObject(this, &UMultiplayerSessionSubsystem::OnCreateSessionComplete);
    SessionInterface->CreateSession(0, NAME_GameSession, SessionSettings);
}

void UMultiplayerSessionSubsystem::OnCreateSessionComplete(FName SessionName, bool bWasSuccessful)
{
    // Limpieza preventiva del delegado para evitar suscripciones duplicadas
    if (SessionInterface.IsValid())
    {
        SessionInterface->ClearOnCreateSessionCompleteDelegates(this);
    }

    OnServerCreateComplete.Broadcast(bWasSuccessful);

    if (bWasSuccessful)
    {
        // Carga el mapa de la sala de urgencias en modo Servidor Escuchando (Listen Server)
        UGameplayStatics::OpenLevel(GetWorld(), FName("/Game/HospitalGame/Maps/L_HospitalWard?listen"), true);
    }
}

void UMultiplayerSessionSubsystem::JoinSessionByIP(const FString& IPAddress)
{
    if (UWorld* World = GetWorld())
    {
        APlayerController* PC = World->GetFirstPlayerController();
        if (PC)
        {
            PC->ClientTravel(IPAddress, ETravelType::TRAVEL_Absolute);
        }
    }
}`;

  const CODE_MULTIPLAYER_MENU_H = `// Source/HospitalGame/Public/UI/EEMultiplayerMenuWidget.h
#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "EEMultiplayerMenuWidget.generated.h"

class UButton;
class UEditableTextBox;
class UTextBlock;
class UCircularThrobber;

/**
 * WBP_MultiplayerMenu: Conecta los botones de la interfaz UMG con UMultiplayerSessionSubsystem.
 * Resuelve el componente faltante para invocar HostSession y JoinSessionByIP desde el juego.
 */
UCLASS()
class HOSPITALGAME_API UEEMultiplayerMenuWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

protected:
	// Botón para crear sala hospitalaria (Listen Server)
	UPROPERTY(meta = (BindWidget))
	UButton* Button_HostSession;

	// Botón para unirse mediante IP directa
	UPROPERTY(meta = (BindWidget))
	UButton* Button_JoinSession;

	// Campo de texto para la dirección IP (con soporte de teclado táctil en móviles)
	UPROPERTY(meta = (BindWidget))
	UEditableTextBox* TextBox_IPAddress;

	// Indicador de conexión / carga
	UPROPERTY(meta = (BindWidgetOptional))
	UCircularThrobber* Throbber_Loading;

	// Mensaje de estado informativo
	UPROPERTY(meta = (BindWidgetOptional))
	UTextBlock* Text_Status;

	UFUNCTION()
	void HandleHostClicked();

	UFUNCTION()
	void HandleJoinClicked();

	UFUNCTION()
	void OnServerCreateCallback(bool bWasSuccessful);
};`;

  const CODE_MULTIPLAYER_MENU_CPP = `// Source/HospitalGame/Private/UI/EEMultiplayerMenuWidget.cpp
#include "UI/EEMultiplayerMenuWidget.h"
#include "MultiplayerSessionSubsystem.h"
#include "Components/Button.h"
#include "Components/EditableTextBox.h"
#include "Components/TextBlock.h"
#include "Components/CircularThrobber.h"

void UEEMultiplayerMenuWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (Button_HostSession)
	{
		Button_HostSession->OnClicked.AddDynamic(this, &UEEMultiplayerMenuWidget::HandleHostClicked);
	}

	if (Button_JoinSession)
	{
		Button_JoinSession->OnClicked.AddDynamic(this, &UEEMultiplayerMenuWidget::HandleJoinClicked);
	}

	if (Throbber_Loading)
	{
		Throbber_Loading->SetVisibility(ESlateVisibility::Collapsed);
	}

	// Obtener el subsistema multijugador desde la GameInstance y suscribirse a la respuesta asíncrona
	if (UGameInstance* GI = GetGameInstance())
	{
		if (UMultiplayerSessionSubsystem* SessionSubsystem = GI->GetSubsystem<UMultiplayerSessionSubsystem>())
		{
			SessionSubsystem->OnServerCreateComplete.AddDynamic(this, &UEEMultiplayerMenuWidget::OnServerCreateCallback);
		}
	}
}

void UEEMultiplayerMenuWidget::NativeDestruct()
{
	if (UGameInstance* GI = GetGameInstance())
	{
		if (UMultiplayerSessionSubsystem* SessionSubsystem = GI->GetSubsystem<UMultiplayerSessionSubsystem>())
		{
			SessionSubsystem->OnServerCreateComplete.RemoveAll(this);
		}
	}

	Super::NativeDestruct();
}

void UEEMultiplayerMenuWidget::HandleHostClicked()
{
	if (UGameInstance* GI = GetGameInstance())
	{
		if (UMultiplayerSessionSubsystem* SessionSubsystem = GI->GetSubsystem<UMultiplayerSessionSubsystem>())
		{
			if (Throbber_Loading) Throbber_Loading->SetVisibility(ESlateVisibility::Visible);
			if (Text_Status) Text_Status->SetText(NSLOCTEXT("Multiplayer", "Hosting", "Creando sala hospitalaria..."));
			if (Button_HostSession) Button_HostSession->SetIsEnabled(false);

			// Invocar creación de sesión para 4 médicos en modo LAN/Online
			SessionSubsystem->HostSession(4, true);
		}
	}
}

void UEEMultiplayerMenuWidget::HandleJoinClicked()
{
	if (!TextBox_IPAddress) return;

	const FString TargetIP = TextBox_IPAddress->GetText().ToString().TrimStartAndEnd();
	if (TargetIP.IsEmpty())
	{
		if (Text_Status) Text_Status->SetText(NSLOCTEXT("Multiplayer", "EmptyIP", "Ingresa una dirección IP válida"));
		return;
	}

	if (UGameInstance* GI = GetGameInstance())
	{
		if (UMultiplayerSessionSubsystem* SessionSubsystem = GI->GetSubsystem<UMultiplayerSessionSubsystem>())
		{
			if (Throbber_Loading) Throbber_Loading->SetVisibility(ESlateVisibility::Visible);
			if (Text_Status) Text_Status->SetText(NSLOCTEXT("Multiplayer", "Connecting", "Conectando al servidor hospitalario..."));

			// Viaje directo del cliente hacia la IP del anfitrión
			SessionSubsystem->JoinSessionByIP(TargetIP);
		}
	}
}

void UEEMultiplayerMenuWidget::OnServerCreateCallback(bool bWasSuccessful)
{
	if (Throbber_Loading) Throbber_Loading->SetVisibility(ESlateVisibility::Collapsed);
	if (Button_HostSession) Button_HostSession->SetIsEnabled(true);

	if (Text_Status)
	{
		if (bWasSuccessful)
		{
			Text_Status->SetText(NSLOCTEXT("Multiplayer", "Success", "¡Servidor creado! Cargando sala de urgencias..."));
		}
		else
		{
			Text_Status->SetText(NSLOCTEXT("Multiplayer", "Fail", "Error al crear la sesión multijugador"));
		}
	}
}`;

  const CODE_ANIM_INSTANCE_H = `// Source/HospitalGame/Public/Animation/EEDoctorAnimInstance.h
#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "EEDoctorAnimInstance.generated.h"

class AEEMedicalCharacter;

/**
 * Instancia de Animación Thread-Safe para el médico (AnimBP_Doctor) en UE 5.3+.
 * Sincroniza variables replicadas de red con la pose esquelética, Control Rig (FBIK) y Spine Aim.
 * Flujo: [AEEMedicalCharacter] -> bIsHoldingItem & ProceduralSpineRotation -> [AnimBP_Doctor] -> [Control Rig FBIK / Spine Modify Bone]
 */
UCLASS()
class HOSPITALGAME_API UEEDoctorAnimInstance : public UAnimInstance
{
	GENERATED_BODY()

public:
	UEEDoctorAnimInstance();

	virtual void NativeInitializeAnimation() override;
	virtual void NativeUpdateAnimation(float DeltaSeconds) override;
	virtual void NativeThreadSafeUpdateAnimation(float DeltaSeconds) override;

	// --- Variables de Locomoción ---
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Locomotion")
	float GroundSpeed;

	/** Velocidad de movimiento del doctor (Speed en cm/s) */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Locomotion")
	float Speed;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Locomotion")
	bool bIsFalling;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Locomotion")
	bool bShouldMove;

	// --- Sincronización de Ítems e Interacción Replicada ---
	/** Indica si el médico sostiene un ítem/fármaco en mano */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Medical Inventory")
	bool bIsHoldingItem;

	/** Tipo de fármaco o instrumental sostenido desde la farmacia (0=None, 1=Adrenaline, 2=Antibiotic, 3=Defibrillator) */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Medical Inventory")
	uint8 HeldDrugType;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Medical Inventory")
	bool bIsHoldingTwoHandedItem; // True para Desfibrilador bifásico / Camilla

	// --- Orientación Procedural de Columna / Pecho (Aim Offset Médico) ---
	/** Rotación procedural de la columna (Spine/Chest) calculada en AEEMedicalCharacter::Tick */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Control Rig FBIK")
	FRotator ProceduralSpineRotation;

	// --- Control Rig (CR_DoctorHandIK) Parameters ---
	/** Hand Target Transform: Transforma la posición del socket del objeto sostenido para guiar Hand_R con FBIK */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Control Rig FBIK")
	FTransform HandTargetTransform;

	/** Alpha de Transición: Valor de interpolación (InterpTo) que suaviza la transición de mano libre a agarre al interactuar en la farmacia */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Control Rig FBIK")
	float TransitionAlpha;

	/** Alias de compatibilidad para anim nodes */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Control Rig FBIK")
	FTransform HandIKTargetTransform;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Control Rig FBIK")
	float HandIKAlpha;

	/** Velocidad de interpolación para la transición de la mano hacia el socket del ítem */
	UPROPERTY(EditDefaultsOnly, Category = "Control Rig FBIK")
	float IKInterpSpeed;

protected:
	/** Referencia débil al personaje poseedor para acceso seguro */
	UPROPERTY(BlueprintReadOnly, Category = "References")
	TWeakObjectPtr<AEEMedicalCharacter> CachedCharacter;
};`;


  const CODE_ROUND_RESULTS_WBP = `// =========================================================================
// WBP_RoundResults (Unreal Engine 5 UMG Blueprint Specification)
// Jerarquía Visual, Event Graph y Transiciones de Fin de Guardia Médica
// =========================================================================

1. JERARQUÍA DEL WIDGET UMG (Hierarchy Tree):
-------------------------------------------------------------------------
[Canvas Panel] (Root)
 ├── [BackgroundBlur] (BlurStrength: 20.0, Lowers background 3D scene distraction)
 ├── [Border] OverlayTint (Color: #050811e6 - Azul oscuro quirúrgico con viñeta)
 └── [VerticalBox] Card_Results (Anclado al centro, Size: 680x520)
      ├── [HorizontalBox] Header_HospitalBadge
      │    ├── [Image] Icon_Cross (Cruz médica dorada/esmeralda)
      │    └── [TextBlock] Text_HospitalName ("SALA DE URGENCIAS - INFORME DE GUARDIA")
      ├── [Spacer] (Height: 12)
      ├── [TextBlock] Text_RatingTitle (BindWidget: "¡GUARDIA MÉDICA IMPECABLE!")
      ├── [Spacer] (Height: 18)
      ├── [HorizontalBox] Box_StarsContainer (Centrado horizontal)
      │    ├── [Image] Img_Star1 (BindWidget: 64x64, Estilo dorado reflectivo)
      │    ├── [Spacer] (Width: 20)
      │    ├── [Image] Img_Star2 (BindWidget: 72x72, Ligero realce vertical)
      │    ├── [Spacer] (Width: 20)
      │    └── [Image] Img_Star3 (BindWidget: 64x64)
      ├── [Spacer] (Height: 24)
      ├── [GridPanel] Grid_PerformanceStats (Fondo semi-transparente #0e121e90)
      │    ├── Col 0, Row 0: [TextBlock] "Pacientes Curados:"
      │    ├── Col 1, Row 0: [TextBlock] Text_PatientsCured (+100 pts c/u)
      │    ├── Col 0, Row 1: [TextBlock] "Pacientes Fallecidos:"
      │    ├── Col 1, Row 1: [TextBlock] Text_PatientsDeceased (-50 pts c/u)
      │    ├── Col 0, Row 2: [TextBlock] "Puntuación de Guardia:"
      │    └── Col 1, Row 2: [TextBlock] Text_TotalScore (BindWidget: Color Oro)
      ├── [Spacer] (Height: 24)
      ├── [TextBlock] Text_Countdown (BindWidget: "Regreso al Lobby en: 10 s")
      ├── [Spacer] (Height: 12)
      └── [Button] Btn_ReturnLobby (BindWidget: Estilo botón 'Volver al Lobby Ya')
           └── [TextBlock] ("REGRESAR AL LOBBY DE ESPERA")

2. PISTA DE ANIMACIÓN UMG (UWidgetAnimation* Anim_RevealResults):
-------------------------------------------------------------------------
• 0.00s -> Opacity 0% a 100% de Card_Results con curva EaseOutCubic.
• 0.40s -> Star 1 Pop-In (Scale 0.0 -> 1.3 -> 1.0) + Reproducir SoundCue_StarEarned.
• 0.90s -> Si EarnedStars >= 2: Star 2 Pop-In con pitch sonoro ascendente.
• 1.40s -> Si EarnedStars == 3: Star 3 Pop-In + Fanfarria médica (SoundCue_RoundVictory).
• 1.80s -> Puntuación Final: Conteo numérico progresivo de 0 a TotalScore.

3. EVENT GRAPH (Blueprint Visual Scripting):
-------------------------------------------------------------------------
Event Construct:
  [Set Input Mode UI Only] -> [bShowMouseCursor = True]
  [Play Animation (Anim_RevealResults)]
  [Set Timer by Function Name ("UpdateCountdownTimer", Rate: 1.0s, Looping: True)]

Event OnClicked (Btn_ReturnLobby):
  [Get Owning Player] -> [Cast to AEEPlayerController] -> [Server_RequestReturnToLobby]`;

  const CODE_ROUND_RESULTS_H = `// Source/HospitalGame/Public/EERoundResultsWidget.h
#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "EERoundResultsWidget.generated.h"

class UImage;
class UTextBlock;
class UButton;
class UWidgetAnimation;
class USoundCue;

/**
 * Widget UMG que muestra el informe final al concluir la guardia médica.
 * Presenta estrellas (1 a 3), pacientes curados/fallecidos y cuenta atrás hacia el Lobby.
 */
UCLASS()
class HOSPITALGAME_API UEERoundResultsWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    virtual void NativeConstruct() override;

    // Inicializa métricas, estrellas y dispara las animaciones de presentación
    UFUNCTION(BlueprintCallable, Category = "Hospital|Results")
    void SetupResults(int32 InStars, int32 InFinalScore, int32 InCured, int32 InDeceased, float InCountdown);

protected:
    // --- Widgets Vinculados del UMG (WBP_RoundResults) ---
    UPROPERTY(meta = (BindWidget))
    UImage* Img_Star1;

    UPROPERTY(meta = (BindWidget))
    UImage* Img_Star2;

    UPROPERTY(meta = (BindWidget))
    UImage* Img_Star3;

    UPROPERTY(meta = (BindWidget))
    UTextBlock* Text_RatingTitle;

    UPROPERTY(meta = (BindWidget))
    UTextBlock* Text_TotalScore;

    UPROPERTY(meta = (BindWidget))
    UTextBlock* Text_PatientsCured;

    UPROPERTY(meta = (BindWidget))
    UTextBlock* Text_PatientsDeceased;

    UPROPERTY(meta = (BindWidget))
    UTextBlock* Text_Countdown;

    UPROPERTY(meta = (BindWidget))
    UButton* Btn_ReturnLobby;

    // Animación UMG para entrada secuencial de estrellas
    UPROPERTY(Transient, meta = (BindWidgetAnimOptional))
    UWidgetAnimation* Anim_RevealResults;

    // Efecto de sonido al revelar cada estrella ganada
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Audio")
    USoundCue* StarAwardedSound;

    // Fanfarria o sonido de fin de guardia médica
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Audio")
    USoundCue* RoundVictorySound;

private:
    UFUNCTION()
    void OnReturnLobbyClicked();

    void UpdateCountdownTimer();

    int32 EarnedStars;
    float RemainingCountdown;
    FTimerHandle CountdownTimerHandle;
};
`;

  const CODE_ROUND_RESULTS_CPP = `// Source/HospitalGame/Private/EERoundResultsWidget.cpp
#include "EERoundResultsWidget.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"
#include "EEPlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "Sound/SoundCue.h"

void UEERoundResultsWidget::NativeConstruct()
{
    Super::NativeConstruct();

    if (Btn_ReturnLobby)
    {
        Btn_ReturnLobby->OnClicked.AddDynamic(this, &UEERoundResultsWidget::OnReturnLobbyClicked);
    }
}

void UEERoundResultsWidget::SetupResults(int32 InStars, int32 InFinalScore, int32 InCured, int32 InDeceased, float InCountdown)
{
    EarnedStars = FMath::Clamp(InStars, 0, 3);
    RemainingCountdown = InCountdown;

    // Actualizar valores de las métricas en los textos
    if (Text_TotalScore)
    {
        Text_TotalScore->SetText(FText::AsNumber(InFinalScore));
    }
    if (Text_PatientsCured)
    {
        Text_PatientsCured->SetText(FText::AsNumber(InCured));
    }
    if (Text_PatientsDeceased)
    {
        Text_PatientsDeceased->SetText(FText::AsNumber(InDeceased));
    }

    // Configurar color y visibilidad de las estrellas
    const FLinearColor GoldColor(1.0f, 0.84f, 0.12f, 1.0f);
    const FLinearColor InactiveColor(0.2f, 0.22f, 0.3f, 0.5f);

    if (Img_Star1) Img_Star1->SetColorAndOpacity(EarnedStars >= 1 ? GoldColor : InactiveColor);
    if (Img_Star2) Img_Star2->SetColorAndOpacity(EarnedStars >= 2 ? GoldColor : InactiveColor);
    if (Img_Star3) Img_Star3->SetColorAndOpacity(EarnedStars >= 3 ? GoldColor : InactiveColor);

    // Veredicto según la cantidad de estrellas obtenidas
    if (Text_RatingTitle)
    {
        FText Verdict;
        switch (EarnedStars)
        {
            case 3:
                Verdict = FText::FromString(TEXT("¡GUARDIA MÉDICA IMPECABLE! (3 ESTRELLAS)"));
                break;
            case 2:
                Verdict = FText::FromString(TEXT("BUEN DESEMPEÑO CLÍNICO (2 ESTRELLAS)"));
                break;
            case 1:
                Verdict = FText::FromString(TEXT("GUARDIA CRÍTICA - PACIENTES AL LÍMITE (1 ESTRELLA)"));
                break;
            default:
                Verdict = FText::FromString(TEXT("COLAPSO HOSPITALARIO (0 ESTRELLAS)"));
                break;
        }
        Text_RatingTitle->SetText(Verdict);
    }

    // Reproducir fanfarria sonora
    if (RoundVictorySound)
    {
        UGameplayStatics::PlaySound2D(this, RoundVictorySound);
    }

    // Disparar animación de UMG si existe
    if (Anim_RevealResults)
    {
        PlayAnimation(Anim_RevealResults);
    }

    // Iniciar el temporizador regresivo hacia el Lobby
    if (UWorld* World = GetWorld())
    {
        World->GetTimerManager().SetTimer(
            CountdownTimerHandle,
            this,
            &UEERoundResultsWidget::UpdateCountdownTimer,
            1.0f,
            true
        );
    }
    UpdateCountdownTimer();
}

void UEERoundResultsWidget::UpdateCountdownTimer()
{
    if (Text_Countdown)
    {
        const FString Msg = FString::Printf(TEXT("Regreso automático al Lobby en: %d s"), FMath::CeilToInt(RemainingCountdown));
        Text_Countdown->SetText(FText::FromString(Msg));
    }

    RemainingCountdown = FMath::Max(0.0f, RemainingCountdown - 1.0f);
}

void UEERoundResultsWidget::OnReturnLobbyClicked()
{
    // Solicitar al PlayerController local que ejecute el RPC hacia el servidor
    if (AEEPlayerController* PC = Cast<AEEPlayerController>(GetOwningPlayer()))
    {
        PC->Server_RequestReturnToLobby();
    }
}
`;

  const CODE_PLAYER_CONTROLLER_H = `// Source/HospitalGame/Public/EEPlayerController.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "EEPlayerController.generated.h"

class UEERoundResultsWidget;

/**
 * Controlador del Jugador Médico. Gestiona la recepción de eventos autoritativos del servidor,
 * cambio de modos de entrada (juego vs UI) e instanciación del Widget de Resultados (WBP_RoundResults).
 */
UCLASS()
class HOSPITALGAME_API AEEPlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    AEEPlayerController();

    // Clase del Widget de Resultados asignada en el Blueprint (WBP_RoundResults)
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|UI")
    TSubclassOf<UEERoundResultsWidget> RoundResultsWidgetClass;

    // Client RPC: Recibido por cada cliente para instanciar y abrir WBP_RoundResults
    UFUNCTION(Client, Reliable, Category = "Hospital|GameFlow")
    void Client_ShowRoundResults(int32 Stars, int32 FinalScore, int32 CuredCount, int32 DeceasedCount, float CountdownSeconds);

    // Server RPC: El jugador solicita regresar al lobby inmediatamente
    UFUNCTION(Server, Reliable, WithValidation, BlueprintCallable, Category = "Hospital|GameFlow")
    void Server_RequestReturnToLobby();

protected:
    virtual void BeginPlay() override;

private:
    UPROPERTY()
    UEERoundResultsWidget* ActiveResultsWidget;
};
`;

  const CODE_PLAYER_CONTROLLER_CPP = `// Source/HospitalGame/Private/EEPlayerController.cpp
#include "EEPlayerController.h"
#include "EERoundResultsWidget.h"
#include "EEGameModeBase.h"
#include "Blueprint/UserWidget.h"

AEEPlayerController::AEEPlayerController()
{
    bShowMouseCursor = false;
    bEnableClickEvents = true;
    bEnableMouseOverEvents = true;
}

void AEEPlayerController::BeginPlay()
{
    Super::BeginPlay();
}

void AEEPlayerController::Client_ShowRoundResults_Implementation(int32 Stars, int32 FinalScore, int32 CuredCount, int32 DeceasedCount, float CountdownSeconds)
{
    // Solo instanciamos el widget en el cliente local que controla esta pantalla
    if (!IsLocalController()) return;

    if (!ActiveResultsWidget && RoundResultsWidgetClass)
    {
        ActiveResultsWidget = CreateWidget<UEERoundResultsWidget>(this, RoundResultsWidgetClass);
    }

    if (ActiveResultsWidget)
    {
        // 1. Inicializar estrellas y estadísticas calculadas por el GameState
        ActiveResultsWidget->SetupResults(Stars, FinalScore, CuredCount, DeceasedCount, CountdownSeconds);

        // 2. Colocar en Viewport con prioridad de dibujado alta
        if (!ActiveResultsWidget->IsInViewport())
        {
            ActiveResultsWidget->AddToViewport(100);
        }

        // 3. Cambiar modo de entrada a UI Only para permitir interacción con el ratón
        bShowMouseCursor = true;
        FInputModeUIOnly InputMode;
        InputMode.SetWidgetToFocus(ActiveResultsWidget->TakeWidget());
        InputMode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
        SetInputMode(InputMode);
    }
}

bool AEEPlayerController::Server_RequestReturnToLobby_Validate()
{
    return true;
}

void AEEPlayerController::Server_RequestReturnToLobby_Implementation()
{
    // El servidor recibe la petición y ejecuta el viaje al mapa del Lobby
    if (AEEGameModeBase* GM = GetWorld()->GetAuthGameMode<AEEGameModeBase>())
    {
        GM->ReturnToLobby();
    }
}
`;

  const CODE_ANIM_INSTANCE_CPP = `// Source/HospitalGame/Private/Animation/EEDoctorAnimInstance.cpp
#include "Animation/EEDoctorAnimInstance.h"
#include "EEMedicalCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/KismetMathLibrary.h"

UEEDoctorAnimInstance::UEEDoctorAnimInstance()
	: GroundSpeed(0.0f)
	, Speed(0.0f)
	, bIsFalling(false)
	, bShouldMove(false)
	, bIsHoldingItem(false)
	, HeldDrugType(0)
	, bIsHoldingTwoHandedItem(false)
	, ProceduralSpineRotation(FRotator::ZeroRotator)
	, TransitionAlpha(0.0f)
	, HandIKAlpha(0.0f)
	, IKInterpSpeed(12.0f)
{
}

void UEEDoctorAnimInstance::NativeInitializeAnimation()
{
	Super::NativeInitializeAnimation();

	// Cachear referencia al personaje médico de forma segura
	if (APawn* OwningPawn = TryGetPawnOwner())
	{
		CachedCharacter = Cast<AEEMedicalCharacter>(OwningPawn);
	}
}

void UEEDoctorAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
	Super::NativeUpdateAnimation(DeltaSeconds);

	// Actualización en el Game Thread: lectura de estados replicados de AEEMedicalCharacter
	if (!CachedCharacter.IsValid())
	{
		if (APawn* OwningPawn = TryGetPawnOwner())
		{
			CachedCharacter = Cast<AEEMedicalCharacter>(OwningPawn);
		}
	}

	if (AEEMedicalCharacter* Character = CachedCharacter.Get())
	{
		// 1. Locomoción básica: cálculo de velocidad (Speed)
		if (UCharacterMovementComponent* MoveComp = Character->GetCharacterMovement())
		{
			GroundSpeed = UKismetMathLibrary::VSizeXY(Character->GetVelocity());
			Speed = GroundSpeed;
			bIsFalling = MoveComp->IsFalling();
			bShouldMove = Speed > 3.0f && MoveComp->GetCurrentAcceleration().SizeSquared() > 0.0f;
		}

		// 2. Extraer estado de inventario replicado desde AEEMedicalCharacter
		bIsHoldingItem = Character->bIsHoldingItem;
		HeldDrugType = static_cast<uint8>(Character->HeldDrugType);
		bIsHoldingTwoHandedItem = Character->bIsHoldingTwoHandedItem;

		// 3. Alpha de Transición: Suavizado con FMath::FInterpTo al interactuar en la farmacia
		// Cuando el médico pulsa interactuar en la farmacia, bIsHoldingItem pasa a true (Target: 1.0f).
		// Si suelta o administra el fármaco, vuelve a false (Target: 0.0f).
		const float TargetAlpha = bIsHoldingItem ? 1.0f : 0.0f;
		TransitionAlpha = FMath::FInterpTo(TransitionAlpha, TargetAlpha, DeltaSeconds, IKInterpSpeed);
		HandIKAlpha = TransitionAlpha;

		// 4. Orientación Procedural de la Columna Vertebral (Spine/Chest Aim)
		// Leída directamente del cálculo con RInterpTo realizado en AEEMedicalCharacter::Tick
		ProceduralSpineRotation = Character->ProceduralSpineRotation;

		// 5. Hand Target Transform: Transforma la posición del socket del ítem para guiar Hand_R con FBIK
		if (bIsHoldingItem && Character->GetMesh())
		{
			// El socket 'Hand_R_Socket' proporciona el transform en espacio de componente (RTS_Component)
			HandTargetTransform = Character->GetMesh()->GetSocketTransform(FName("Hand_R_Socket"), RTS_Component);
			HandIKTargetTransform = HandTargetTransform;
		}
	}
}

void UEEDoctorAnimInstance::NativeThreadSafeUpdateAnimation(float DeltaSeconds)
{
	Super::NativeThreadSafeUpdateAnimation(DeltaSeconds);

	// En UE 5.3+, los hilos de trabajo paralelos (Worker Threads) leen las variables
	// 'Speed', 'bIsHoldingItem', 'ProceduralSpineRotation', 'HandTargetTransform' y 'TransitionAlpha'
	// a través del sistema de Property Access directo y de alta frecuencia.
}
`;

  const CODE_CONTROL_RIG_FBIK_GUIDE = `// Guía de Configuración: AnimBP (ABP_MedicalDoctor) & Control Rig (CR_DoctorHandIK)
// Motor: Unreal Engine 5.3+ (Animation Blueprint + Control Rig FBIK Solver + Procedural Spine Aim)

/*
======================================================================================
  ARQUITECTURA COMPLETA DE SINCRONIZACIÓN DE ANIMACIÓN PROCEDURAL
======================================================================================

  [AEEMedicalCharacter] (Tick: RInterpTo Spine Pitch/Yaw ±35°/±50°)
          │
          ├──> Variable Replicada: bIsHoldingItem, HeldDrugType, ProceduralSpineRotation
          │
          ▼
  [ABP_MedicalDoctor: Event Graph]
          │
          ├──> Cachea Speed, bIsHoldingItem, TransitionAlpha (FInterpTo 12.0)
          └──> Transfiere ProceduralSpineRotation y HandTargetTransform
          │
          ▼
  [ABP_MedicalDoctor: Anim Graph]
          │
          ├──> [Locomotion State Machine] (Speed)
          │            │
          │            ▼
          ├──> [Transform (Modify) Bone] (Aplica ProceduralSpineRotation a 'spine_02' y 'spine_03')
          │            │
          │            ▼
          └──> [Control Rig: CR_DoctorHandIK (FBIK)]
                       │
                       └──> (Ajusta Hand_R a Socket de Ítems / Hand_R_Socket con Alpha de Transición)

======================================================================================
  1. CONFIGURACIÓN EN EL EVENT GRAPH (ABP_MedicalDoctor)
======================================================================================
1. Nodo 'Event Blueprint Update Animation' (Delta Time X).
2. 'Try Get Pawn Owner' -> 'Cast to AEEMedicalCharacter'.
3. Lee las variables calculadas del personaje:
   • 'bIsHoldingItem' (Boolean): Sostén activo de instrumental o medicamento.
   • 'HeldDrugType' (Enum EDiseaseType): Identificador del fármaco.
   • 'ProceduralSpineRotation' (Rotator): Inclinación calculada en Tick con límites anatómicos.
   • 'Speed' (Float): Velocidad de desplazamiento para locomoción.
4. Calcula 'TransitionAlpha':
   • FInterp To: Current = TransitionAlpha, Target = (bIsHoldingItem ? 1.0 : 0.0), InterpSpeed = 12.0.
5. Obtiene 'Hand Target Transform':
   • Get Socket Transform en 'Hand_R_Socket' (Space: RTS_Component).

======================================================================================
  2. NODO PROCEDURAL DE COLUMNA EN EL ANIM GRAPH (Transform (Modify) Bone)
======================================================================================
Para aplicar la orientación calculada en C++ (AEEMedicalCharacter::Tick):
1. Añadir nodo 'Transform (Modify) Bone':
   • Bone to Modify: 'spine_02' (y opcionalmente 'spine_03' con factor 0.5 para mayor fluidez orgánica).
   • Translation: Ignore.
   • Scale: Ignore.
   • Rotation: Conectar la variable 'ProceduralSpineRotation'.
   • Rotation Mode: Add to Existing.
   • Rotation Space: Bone Space (o Component Space).
   • Alpha: Conectar 'TransitionAlpha' (para que solo incline el torso cuando sostiene un ítem médico).

======================================================================================
  3. IMPLEMENTACIÓN DEL CONTROL RIG FULL BODY IK (CR_DoctorHandIK)
======================================================================================
Dentro del Anim Graph, después de la modificación de columna:
A. Parámetros expuestos desde C++:
   1. 'Hand Target Transform' (FTransform): Posición del socket del objeto sostenido para guiar Hand_R.
   2. 'Alpha de Transición' (Float 0.0..1.0): Suaviza la transición de mano libre a agarre al interactuar.
   3. 'HeldDrugType' (Byte): Permite alternar poses secundarias de los dedos (dedo en émbolo para jeringa).

B. Configuración interna del Rig Graph (CR_DoctorHandIK):
   1. Asset: Animation -> Control Rig basado en el esqueleto del médico.
   2. Nodo: "Full Body IK" (FBIK).
      • Root Bone: 'pelvis'.
      • Cadena: 'spine_01' -> 'upperarm_r' -> 'lowerarm_r' -> 'hand_r'.
      • Efector 'hand_r':
        - Effector Bone: 'hand_r'
        - Target Transform: Input Pin 'Hand Target Transform'
        - Position Alpha: Input Pin 'Alpha de Transición'
        - Rotation Alpha: Input Pin 'Alpha de Transición'
        - Pull Weight: 1.0 (Alinea hombro y codo manteniendo la postura natural)
      • Solver: Max Iterations = 12, Precision = 0.01 cm, Damping = 0.2.

======================================================================================
  4. SINERGIA CLÍNICA EN TIEMPO DE EJECUCIÓN
======================================================================================
Cuando el doctor corre con un desfibrilador hacia la camilla:
1. Locomotion State Machine genera el ciclo de carrera.
2. AEEMedicalCharacter detecta la camilla en proximidad y orienta la columna hacia el torso del paciente (-28° Pitch).
3. Transform (Modify) Bone flexiona la columna suavemente a 60 FPS con RInterpTo.
4. Simultáneamente, el Solver FBIK atrae las manos a las paletas bifásicas sin que los brazos floten ni penetren el cuerpo.
5. El resultado es una pose de reanimación dinámica e hiperrealista en multijugador.
*/`;

  const CODE_GAME_INSTANCE_H = `// Source/HospitalGame/Public/HospitalGameInstance.h
#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "HospitalGameInstance.generated.h"

UCLASS()
class HOSPITALGAME_API UHospitalGameInstance : public UGameInstance
{
    GENERATED_BODY()

public:
    UHospitalGameInstance();

    virtual void Init() override;

    // Ajusta la calidad gráfica y escalabilidad automáticamente según la plataforma (PC vs Móvil)
    UFUNCTION(BlueprintCallable, Category = "Optimization")
    void ApplyPlatformScalabilitySettings();
};`;

  const CODE_GAME_INSTANCE_CPP = `// Source/HospitalGame/Private/HospitalGameInstance.cpp
#include "HospitalGameInstance.h"
#include "GameFramework/GameUserSettings.h"
#include "Kismet/GameplayStatics.h"

UHospitalGameInstance::UHospitalGameInstance()
{
}

void UHospitalGameInstance::Init()
{
    Super::Init();
    ApplyPlatformScalabilitySettings();
}

void UHospitalGameInstance::ApplyPlatformScalabilitySettings()
{
    UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr;
    if (!Settings) return;

#if PLATFORM_ANDROID || PLATFORM_IOS
    // Ajustes agresivos para garantizar 60 FPS estables en Móvil
    Settings->SetOverallScalabilityLevel(1); // Calidad Media/Baja
    Settings->SetFrameRateLimit(60.0f);
    Settings->SetViewDistanceQuality(0);    // Distancia cercana para reducir batches
    Settings->SetShadowQuality(1);          // Sombras dinámicas simplificadas
    Settings->SetPostProcessingQuality(1);  // Postprocesado liviano
    Settings->SetTextureQuality(2);         // Texturas nítidas con pool de VRAM controlado

    // Desactivar explícitamente Lumen y Nanite en móviles
    Settings->SetGlobalIlluminationQuality(0);
    Settings->SetReflectionQuality(0);

    if (GEngine && GetWorld())
    {
        GEngine->Exec(GetWorld(), TEXT("r.Mobile.ForwardShading 1"));
        GEngine->Exec(GetWorld(), TEXT("r.Nanite 0"));
        GEngine->Exec(GetWorld(), TEXT("r.Lumen.DiffuseIndirect.Allow 0"));
    }
#else
    // Ajustes estándar para PC (Alta fidelidad gráfica con Lumen y Nanite)
    Settings->SetOverallScalabilityLevel(3); // Calidad Alta/Épica
    Settings->SetFrameRateLimit(120.0f);

    if (GEngine && GetWorld())
    {
        GEngine->Exec(GetWorld(), TEXT("r.Nanite 1"));
        GEngine->Exec(GetWorld(), TEXT("r.Lumen.DiffuseIndirect.Allow 1"));
        GEngine->Exec(GetWorld(), TEXT("r.Shadow.Virtual.Enable 1"));
    }
#endif

    Settings->ApplySettings(false);
}`;

  const CODE_DEVICE_PROFILES_INI = `; Config/DefaultDeviceProfiles.ini - Unreal Engine 5.3+
; Presupuesto de Rendimiento y Escalabilidad Gráfica: PC (High-End) vs Móvil (Vulkan/Metal)

[Windows DeviceProfile]
DeviceType=Windows
BaseProfileName=
+CVars=r.Nanite=1
+CVars=r.Lumen.DiffuseIndirect.Allow=1
+CVars=r.Lumen.Reflections.Allow=1
+CVars=r.Shadow.Virtual.Enable=1
+CVars=r.DynamicGlobalIlluminationMethod=1
+CVars=r.ReflectionMethod=1
+CVars=r.DefaultFeature.AntiAliasing=2 ; TSR (Temporal Super Resolution)
+CVars=r.ScreenPercentage=100
+CVars=r.Streaming.PoolSize=2000

[Android DeviceProfile]
DeviceType=Android
BaseProfileName=
+CVars=r.Mobile.ForwardShading=1
+CVars=r.Nanite=0 ; Nanite desactivado en móvil (Fallback a LODs tradicionales)
+CVars=r.Lumen.DiffuseIndirect.Allow=0 ; Lumen desactivado en móvil
+CVars=r.Lumen.Reflections.Allow=0
+CVars=r.DynamicGlobalIlluminationMethod=0
+CVars=r.ReflectionMethod=0
+CVars=r.ShadowQuality=2 ; Sombras de cascada simplificada (CSM)
+CVars=r.DefaultFeature.AntiAliasing=1 ; FXAA / MSAA para bajo consumo térmico
+CVars=r.MobileContentScaleFactor=1.0
+CVars=r.MaxAnisotropy=2
+CVars=r.AllowStaticLighting=1 ; Iluminación horneada estática con GPU Lightmass

[IOS DeviceProfile]
DeviceType=IOS
BaseProfileName=
+CVars=r.Mobile.ForwardShading=1
+CVars=r.Nanite=0
+CVars=r.Lumen.DiffuseIndirect.Allow=0
+CVars=r.Lumen.Reflections.Allow=0
+CVars=r.DynamicGlobalIlluminationMethod=0
+CVars=r.ReflectionMethod=0
+CVars=r.ShadowQuality=2
+CVars=r.AllowStaticLighting=1
+CVars=r.MobileContentScaleFactor=2.0`;

  const CODE_HAND_SOCKET_ITEM_SPAWN = `// Guía de Arquitectura e Implementación: Instanciación Visual del Ítem en Hand_R_Socket
// Motor: Unreal Engine 5.3+ (C++ Replicado + Blueprint Node Graph + Skeletal Mesh Socket)

/*
======================================================================================
  ARQUITECTURA DE REPLICACIÓN E INSTANCIACIÓN EN RED: OnRep_HeldDrug()
======================================================================================

  [Servidor Autoritativo / Farmacia]
                 │
                 ├──> Server_EquipDrug(EDiseaseType::Anaphylaxis)
                 │    HeldDrugType = NewDrug;
                 │    bIsHoldingItem = true;
                 │
                 ▼ (Replicación Actor OnRep_HeldDrug en Clientes)
  [AEEMedicalCharacter: OnRep_HeldDrug()]
                 │
                 ├── 1. Validar actor anterior (CurrentHeldActor) ──> DestroyActor()
                 │
                 ├── 2. ¿bIsHoldingItem && HeldDrugType != None?
                 │         │
                 │         ├── NO ──> HeldItemMesh->SetVisibility(false) / Finalizar
                 │         │
                 │         └── SÍ ──> Obtener TSubclassOf<AActor> desde TMap DrugItemClasses
                 │                     • Anaphylaxis    ──> BP_Syringe_Epinephrine
                 │                     • Pneumonia      ──> BP_Syringe_Antibiotics
                 │                     • CardiacArrest  ──> BP_Defibrillator_Paddles
                 │
                 ├── 3. SpawnActorDeferred / SpawnActor<AActor>(ItemClass, IdentityTransform)
                 │
                 └── 4. AttachToComponent(GetMesh(), FAttachmentTransformRules::SnapToTargetNotIncludingScale, TEXT("Hand_R_Socket"))
                        • CurrentHeldActor->SetActorEnableCollision(false);
                        • CurrentHeldActor = SpawnedActor;
*/

// ====================================================================================
// 1. C++: IMPLEMENTACIÓN COMPLETA EN EEMedicalCharacter.cpp
// ====================================================================================
void AEEMedicalCharacter::OnRep_HeldDrug()
{
    // Se ejecuta automáticamente en todos los clientes cuando la variable replicada HeldDrugType cambia.
    // También se llama directamente en el Listen-Server / Host local para latencia cero.
    UpdateHeldItemVisuals();
}

void AEEMedicalCharacter::UpdateHeldItemVisuals()
{
    // Paso 1: Destruir de forma segura cualquier actor previo instanciado en la mano
    if (IsValid(CurrentHeldActor))
    {
        CurrentHeldActor->Destroy();
        CurrentHeldActor = nullptr;
    }

    // Paso 2: Si el inventario quedó vacío (Mano libre), ocultar componentes de reserva
    if (!bIsHoldingItem || HeldDrugType == EDiseaseType::None)
    {
        if (HeldItemMesh)
        {
            HeldItemMesh->SetVisibility(false);
        }
        return;
    }

    // Paso 3: Mapeo de la clase del ítem según el fármaco recogido de la farmacia
    TSubclassOf<AActor> ItemClassToSpawn = nullptr;
    if (DrugItemClasses.Contains(HeldDrugType))
    {
        ItemClassToSpawn = DrugItemClasses[HeldDrugType];
    }

    // Paso 4: Instanciación física del Actor 3D acoplado al socket 'Hand_R_Socket'
    if (ItemClassToSpawn && GetWorld())
    {
        FActorSpawnParameters SpawnParams;
        SpawnParams.Owner = this;
        SpawnParams.Instigator = this;
        SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

        CurrentHeldActor = GetWorld()->SpawnActor<AActor>(
            ItemClassToSpawn, 
            FVector::ZeroVector, 
            FRotator::ZeroRotator, 
            SpawnParams
        );

        if (CurrentHeldActor)
        {
            // Deshabilitar colisiones físicas para evitar empujes anómalos contra la cápsula del doctor
            CurrentHeldActor->SetActorEnableCollision(false);

            // Regla de Acoplamiento: Posición y Rotación encajadas al socket, escala del mundo preservada
            FAttachmentTransformRules AttachRules(
                EAttachmentRule::SnapToTarget,
                EAttachmentRule::SnapToTarget,
                EAttachmentRule::KeepWorld,
                false
            );

            CurrentHeldActor->AttachToComponent(GetMesh(), AttachRules, HandSocketName); // TEXT("Hand_R_Socket")
        }
    }
    else if (HeldItemMesh)
    {
        // Enfoque secundario mediante AttachComponentToComponent sobre un UStaticMeshComponent existente
        HeldItemMesh->AttachToComponent(
            GetMesh(), 
            FAttachmentTransformRules::SnapToTargetNotIncludingScale, 
            HandSocketName
        );
        HeldItemMesh->SetVisibility(true);
    }
}

// ====================================================================================
// 2. IMPLEMENTACIÓN PASO A PASO EN BLUEPRINTS (BP_Doctor_Character -> OnRep_HeldDrug)
// ====================================================================================
/*
  Nodos a agregar en el Event Graph del Blueprint del Doctor (BP_MedicalDoctor):

  [Event OnRep_HeldDrug]
           │
           ▼
  [IsValid (CurrentHeldActor)]
           ├── Is Valid ──────> [DestroyActor (Target: CurrentHeldActor)]
           │                                      │
           │                                      ▼
           └── Is Not Valid ─────────────────> [Switch on EDiseaseType (Selection: HeldDrugType)]
                                                         │
                                  ┌──────────────────────┼──────────────────────┬──────────────────────┐
                                  ▼                      ▼                      ▼                      ▼
                            [Anaphylaxis]          [BacterialPneumonia]   [CardiacArrest]            [None]
                                  │                      │                      │                      │
                                  │ (Epinephrine)        │ (Antibiotics)        │ (Defibrillator)      ▼
                                  ▼                      ▼                      ▼             [Set CurrentHeldActor]
                        [BP_Syringe_Epinephrine] [BP_Syringe_Antibiotic] [BP_Defib_Paddles]   (Value: None)
                                  │                      │                      │
                                  └──────────────────────┼──────────────────────┘
                                                         │
                                                         ▼
                                       [SpawnActor BP_MedicalItem from Class]
                                       • Class: (Clase seleccionada)
                                       • SpawnTransform: (Transform Zero / Identidad)
                                       • Collision Handling: Always Spawn, Ignore Collisions
                                                         │
                                                         ▼ (Return Value)
                                       [AttachActorToComponent]
                                       • Target: Return Value (SpawnActor)
                                       • InParent: Mesh (CharacterMesh0)
                                       • Socket Name: Hand_R_Socket
                                       • Location Rule: Snap to Target
                                       • Rotation Rule: Snap to Target
                                       • Scale Rule: Keep World
                                                         │
                                                         ▼
                                       [Set CurrentHeldActor]
                                       • Value: Return Value de SpawnActor
*/

// ====================================================================================
// 3. CONFIGURACIÓN DEL SOCKET EN EL ESQUELETO (SK_Mannequin / SK_Doctor_Skeleton)
// ====================================================================================
/*
  1. Abre el esqueleto del personaje médico (SK_Doctor o SK_Mannequin) en Unreal Editor.
  2. En el panel 'Skeleton Tree' (Árbol de Huesos), busca el hueso 'hand_r' (Mano Derecha).
  3. Clic derecho en 'hand_r' -> Selecciona "Add Socket" (Añadir Socket).
  4. Renombra el nuevo socket a: Hand_R_Socket
  5. Clic derecho en 'Hand_R_Socket' -> "Add Preview Asset" -> Selecciona 'SM_Syringe' o 'SM_DefibPaddle'.
  6. En el panel 'Details' del Socket, configura las transformaciones relativas ideales para la mano:
     • Relative Location: X: 4.5 cm, Y: 1.2 cm, Z: -2.8 cm  (Ajusta el agarre a la palma)
     • Relative Rotation: Pitch: 0.0°, Yaw: 180.0°, Roll: -90.0° (Orienta la aguja hacia adelante)
     • Relative Scale: X: 1.0, Y: 1.0, Z: 1.0
  7. Guarda el Skeleton Asset. El socket ya queda listo para recibir actores en C++ o Blueprints.
*/`;

  const CODE_HOSPITAL_LAYOUT_MANAGER_H = `// Source/HospitalGame/Public/EEHospitalLayoutManager.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Net/UnrealNetwork.h"
#include "EEHospitalLayoutManager.generated.h"

// Clasificación de los 5 Departamentos Clínicos del Hospital General
UENUM(BlueprintType)
enum class EHospitalDepartment : uint8
{
    TriageAdmission     UMETA(DisplayName = "1. Admisión & Triaje"),
    ResuscitationBay    UMETA(DisplayName = "2. Reanimación (Código Azul)"),
    TreatmentCubicles   UMETA(DisplayName = "3. Tratamiento Estándar"),
    CentralPharmacy     UMETA(DisplayName = "4. Farmacia Central (Pyxis)"),
    HazmatDecon         UMETA(DisplayName = "5. Contaminación & Hazmat")
};

// Estructura de Capacidad, Personal Asignado y Throughput Clínico
USTRUCT(BlueprintType)
struct FHospitalDepartmentConfig
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    EHospitalDepartment Department = EHospitalDepartment::TriageAdmission;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    FString DisplayName = TEXT("Admisión & Triaje");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    int32 MaxSimultaneousCapacity = 6;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    FString AssignedStaffRole = TEXT("1 Enfermera de Triaje");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    FString CriticalMachinery = TEXT("Kiosco EMR/HIS, Termómetros infrarrojos, Oxímetros");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    FString FlowRateThroughput = TEXT("1 paciente cada 15-30 seg (Oleada)");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    FVector DepartmentWingLocation = FVector::ZeroVector;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Hospital|Config")
    FColor DepartmentWayfindingColor = FColor::Cyan;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPyxisRestockCompleted, int32, RestockedUnits);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPatientAdmittedToWing, EHospitalDepartment, TargetWing, int32, PatientID);

/**
 * AEEHospitalLayoutManager
 * Gestor Server-Authoritative de la distribución radial hospitalaria.
 * Minimiza cuellos de botella en pasillos interconectando las 5 alas mediante
 * un corredor central radial (Hub Disc) y sincronizando colas de triaje y armarios Pyxis.
 */
UCLASS()
class HOSPITALGAME_API AEEHospitalLayoutManager : public AActor
{
    GENERATED_BODY()

public:
    AEEHospitalLayoutManager();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    // --- Matriz de Departamentos Replicada ---
    UPROPERTY(Replicated, BlueprintReadOnly, Category = "Hospital|Departments")
    TArray<FHospitalDepartmentConfig> DepartmentConfigs;

    // --- Triaje & Flujo de Admisión ---
    UPROPERTY(ReplicatedUsing = OnRep_TriageQueueChanged, BlueprintReadOnly, Category = "Hospital|Triage")
    int32 CurrentWaitingQueueCount;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Triage")
    int32 MaxWaitingChairsCapacity = 6;

    // --- Farmacia Central Pyxis (Ciclo de Reabastecimiento Dinámico cada 20s) ---
    UPROPERTY(ReplicatedUsing = OnRep_PyxisTimer, BlueprintReadOnly, Category = "Hospital|Pharmacy")
    float PyxisNextRestockRemainingTime;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Pharmacy")
    float PyxisRestockCycleDuration = 20.0f;

    // --- Ducha Hazmat & Descontaminación ---
    UPROPERTY(ReplicatedUsing = OnRep_HazmatShowerActive, BlueprintReadOnly, Category = "Hospital|Hazmat")
    bool bHazmatShowerActive;

    // --- Delegados ---
    UPROPERTY(BlueprintAssignable, Category = "Hospital|Events")
    FOnPyxisRestockCompleted OnPyxisRestocked;

    UPROPERTY(BlueprintAssignable, Category = "Hospital|Events")
    FOnPatientAdmittedToWing OnPatientAdmitted;

    // --- Funciones de Autoridad (Servidor) ---
    UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Hospital|Triage")
    bool AdmitIncomingPatient(int32 PatientID, EHospitalDepartment TargetWing);

    UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Hospital|Pharmacy")
    void TriggerManualPyxisRestock();

    UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Hospital|Hazmat")
    void ActivateHazmatDelugeShower(float Duration = 5.0f);

    UFUNCTION(NetMulticast, Unreliable, Category = "Hospital|FX")
    void Multicast_PlayDeconDelugeShowerFX(FVector ShowerLocation);

    UFUNCTION(BlueprintPure, Category = "Hospital|Navigation")
    FVector GetDepartmentWingCenter(EHospitalDepartment Department) const;

protected:
    UFUNCTION()
    void OnRep_TriageQueueChanged();

    UFUNCTION()
    void OnRep_PyxisTimer();

    UFUNCTION()
    void OnRep_HazmatShowerActive();

    FTimerHandle TimerHandle_PyxisCycle;
    FTimerHandle TimerHandle_ShowerDeactivate;
};`;

  const CODE_HOSPITAL_LAYOUT_MANAGER_CPP = `// Source/HospitalGame/Private/EEHospitalLayoutManager.cpp
#include "EEHospitalLayoutManager.h"
#include "Net/UnrealNetwork.h"
#include "Kismet/GameplayStatics.h"
#include "Particles/ParticleSystemComponent.h"
#include "NiagaraFunctionLibrary.h"

AEEHospitalLayoutManager::AEEHospitalLayoutManager()
{
    PrimaryActorTick.bCanEverTick = true;
    bReplicates = true;
    bAlwaysRelevant = true;

    CurrentWaitingQueueCount = 2; // Pacientes iniciales esperando triaje
    PyxisNextRestockRemainingTime = 20.0f;
    bHazmatShowerActive = false;

    // Inicializar los 5 Departamentos Clínicos según la matriz de especificación
    FHospitalDepartmentConfig Triage;
    Triage.Department = EHospitalDepartment::TriageAdmission;
    Triage.DisplayName = TEXT("1. Sala de Admisión & Triaje");
    Triage.MaxSimultaneousCapacity = 6;
    Triage.AssignedStaffRole = TEXT("1 Enfermera de Triaje");
    Triage.CriticalMachinery = TEXT("Kiosco EMR/HIS, Termómetros infrarrojos, Oxímetros");
    Triage.FlowRateThroughput = TEXT("1 paciente cada 15-30 seg (Oleada)");
    Triage.DepartmentWingLocation = FVector(0.0f, -680.0f, 0.0f); // Norte
    Triage.DepartmentWayfindingColor = FColor(59, 130, 246);
    DepartmentConfigs.Add(Triage);

    FHospitalDepartmentConfig Resus;
    Resus.Department = EHospitalDepartment::ResuscitationBay;
    Resus.DisplayName = TEXT("2. Bahías de Reanimación (Trauma / Código Azul)");
    Resus.MaxSimultaneousCapacity = 2;
    Resus.AssignedStaffRole = TEXT("1 Médico Urgenciólogo, 1 Enfermero/a");
    Resus.CriticalMachinery = TEXT("Desfibrilador Bifásico, Monitor ECG 12 derivaciones, Carro Rojo");
    Resus.FlowRateThroughput = TEXT("Límite de colapso: 30-45s antes de paro");
    Resus.DepartmentWingLocation = FVector(680.0f, 150.0f, 0.0f); // Este
    Resus.DepartmentWayfindingColor = FColor(239, 68, 68);
    DepartmentConfigs.Add(Resus);

    FHospitalDepartmentConfig Treat;
    Treat.Department = EHospitalDepartment::TreatmentCubicles;
    Treat.DisplayName = TEXT("3. Cubículos de Tratamiento Estándar");
    Treat.MaxSimultaneousCapacity = 4;
    Treat.AssignedStaffRole = TEXT("1 Médico General / Residente");
    Treat.CriticalMachinery = TEXT("Bombas de infusión IV, Nebulizadores, Estetoscopios");
    Treat.FlowRateThroughput = TEXT("Resolución en 60-90s por caso");
    Treat.DepartmentWingLocation = FVector(-720.0f, 150.0f, 0.0f); // Oeste
    Treat.DepartmentWayfindingColor = FColor(16, 185, 129);
    DepartmentConfigs.Add(Treat);

    FHospitalDepartmentConfig Pharm;
    Pharm.Department = EHospitalDepartment::CentralPharmacy;
    Pharm.DisplayName = TEXT("4. Farmacia Central (Dispenser Station)");
    Pharm.MaxSimultaneousCapacity = 1;
    Pharm.AssignedStaffRole = TEXT("1 Técnico de Farmacia / Asistente");
    Pharm.CriticalMachinery = TEXT("Armario automatizado Pyxis (Epinefrina, Suero, Antibióticos)");
    Pharm.FlowRateThroughput = TEXT("Reabastecimiento dinámico cada 20s");
    Pharm.DepartmentWingLocation = FVector(-350.0f, 750.0f, 0.0f); // Suroeste
    Pharm.DepartmentWayfindingColor = FColor(20, 184, 166);
    DepartmentConfigs.Add(Pharm);

    FHospitalDepartmentConfig Hazmat;
    Hazmat.Department = EHospitalDepartment::HazmatDecon;
    Hazmat.DisplayName = TEXT("5. Zona de Contaminación / Hazmat");
    Hazmat.MaxSimultaneousCapacity = 1;
    Hazmat.AssignedStaffRole = TEXT("1 Especialista Hazmat / Desinfección");
    Hazmat.CriticalMachinery = TEXT("Ducha química deluge, Aspersores, Contenedores Biohazard");
    Hazmat.FlowRateThroughput = TEXT("Protocolo activo ante fuga/derrame biológico");
    Hazmat.DepartmentWingLocation = FVector(350.0f, 750.0f, 0.0f); // Sureste
    Hazmat.DepartmentWayfindingColor = FColor(245, 158, 11);
    DepartmentConfigs.Add(Hazmat);
}

void AEEHospitalLayoutManager::BeginPlay()
{
    Super::BeginPlay();

    if (HasAuthority())
    {
        // Iniciar temporizador del armario Pyxis
        GetWorldTimerManager().SetTimer(
            TimerHandle_PyxisCycle,
            this,
            &AEEHospitalLayoutManager::TriggerManualPyxisRestock,
            PyxisRestockCycleDuration,
            true
        );
    }
}

void AEEHospitalLayoutManager::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    if (HasAuthority())
    {
        // Actualizar cuenta regresiva de restock de Pyxis
        PyxisNextRestockRemainingTime = FMath::Max(0.0f, PyxisNextRestockRemainingTime - DeltaTime);
        if (PyxisNextRestockRemainingTime <= 0.0f)
        {
            PyxisNextRestockRemainingTime = PyxisRestockCycleDuration;
        }
    }
}

void AEEHospitalLayoutManager::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(AEEHospitalLayoutManager, DepartmentConfigs);
    DOREPLIFETIME(AEEHospitalLayoutManager, CurrentWaitingQueueCount);
    DOREPLIFETIME(AEEHospitalLayoutManager, PyxisNextRestockRemainingTime);
    DOREPLIFETIME(AEEHospitalLayoutManager, bHazmatShowerActive);
}

bool AEEHospitalLayoutManager::AdmitIncomingPatient(int32 PatientID, EHospitalDepartment TargetWing)
{
    if (!HasAuthority()) return false;

    if (CurrentWaitingQueueCount > 0)
    {
        CurrentWaitingQueueCount--;
        OnPatientAdmitted.Broadcast(TargetWing, PatientID);
        UE_LOG(LogTemp, Log, TEXT("[HospitalLayout] Paciente %d derivado al departamento %d desde Admisión."), PatientID, (int32)TargetWing);
        return true;
    }
    return false;
}

void AEEHospitalLayoutManager::TriggerManualPyxisRestock()
{
    if (!HasAuthority()) return;

    PyxisNextRestockRemainingTime = PyxisRestockCycleDuration;
    const int32 RestockedUnits = 3; // Epinefrina, Antibiótico, Bolsa Suero IV
    OnPyxisRestocked.Broadcast(RestockedUnits);

    UE_LOG(LogTemp, Log, TEXT("[HospitalLayout] Pyxis MedStation reabastecido automáticamente (Ciclo 20s)."));
}

void AEEHospitalLayoutManager::ActivateHazmatDelugeShower(float Duration)
{
    if (!HasAuthority()) return;

    bHazmatShowerActive = true;
    Multicast_PlayDeconDelugeShowerFX(GetDepartmentWingCenter(EHospitalDepartment::HazmatDecon));

    GetWorldTimerManager().SetTimer(
        TimerHandle_ShowerDeactivate,
        [this]()
        {
            bHazmatShowerActive = false;
        },
        Duration,
        false
    );
}

void AEEHospitalLayoutManager::Multicast_PlayDeconDelugeShowerFX_Implementation(FVector ShowerLocation)
{
    // Reproducir efecto de aspersores de descontaminación de alta presión en todos los clientes
    // UNiagaraFunctionLibrary::SpawnSystemAtLocation(GetWorld(), DeconShowerSystem, ShowerLocation);
}

FVector AEEHospitalLayoutManager::GetDepartmentWingCenter(EHospitalDepartment Department) const
{
    for (const auto& Config : DepartmentConfigs)
    {
        if (Config.Department == Department)
        {
            return Config.DepartmentWingLocation;
        }
    }
    return FVector::ZeroVector;
}

void AEEHospitalLayoutManager::OnRep_TriageQueueChanged()
{
    // Notificar al widget de triaje para actualizar el conteo de sillas ocupadas
}

void AEEHospitalLayoutManager::OnRep_PyxisTimer()
{
    // Actualizar barra de progreso del display LCD del Pyxis MedStation
}

void AEEHospitalLayoutManager::OnRep_HazmatShowerActive()
{
    // Encender / apagar niebla química y partículas de aspersor en el cliente
}
`;

  const CODE_HOSPITAL_LIGHTING_MANAGER_H = `// Source/HospitalGame/Public/EEHospitalLightingManager.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Net/UnrealNetwork.h"
#include "EEHospitalLightingManager.generated.h"

// Estados de Iluminación del Hospital
UENUM(BlueprintType)
enum class EHospitalLightingState : uint8
{
    NormalClinical      UMETA(DisplayName = "1. Iluminación Clínica Normal (4500K)"),
    EmergencyAlert      UMETA(DisplayName = "2. Alerta de Emergencia (+35% Luz Avisadora)")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnHospitalLightingChanged, EHospitalLightingState, NewState);

/**
 * AEEHospitalLightingManager
 * Gestor autoritativo del sistema de iluminación hospitalaria en Unreal Engine 5.3+.
 * En estado estándar mantiene una iluminación quirúrgica neutra (4500K, 1.15 lux).
 * Al declararse Código Azul o emergencia grave, eleva dinámicamente la intensidad a 1.55 (+35%)
 * e inicia el barrido de balizas estroboscópicas rojas para avisar a todo el personal.
 */
UCLASS()
class HOSPITALGAME_API AEEHospitalLightingManager : public AActor
{
    GENERATED_BODY()

public:
    AEEHospitalLightingManager();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    // --- Estado Replicado de Iluminación ---
    UPROPERTY(ReplicatedUsing = OnRep_LightingState, BlueprintReadOnly, Category = "Hospital|Lighting")
    EHospitalLightingState CurrentLightingState;

    // --- Parámetros de Lumen & Luces Cenitales ---
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Lighting")
    float NormalSunIntensity = 1.15f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Lighting")
    float EmergencySunIntensity = 1.55f; // Sube un 35% la luz para avisar visualmente

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Lighting")
    float NormalSkyLightIntensity = 0.58f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Hospital|Lighting")
    float EmergencySkyLightIntensity = 0.88f;

    UPROPERTY(ReplicatedUsing = OnRep_EmergencyStrobe, BlueprintReadOnly, Category = "Hospital|Lighting")
    bool bEmergencyStrobeActive;

    // --- Delegados ---
    UPROPERTY(BlueprintAssignable, Category = "Hospital|Lighting")
    FOnHospitalLightingChanged OnLightingModeChanged;

    // --- Funciones del Servidor ---
    UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Hospital|Lighting")
    void SetHospitalLightingMode(EHospitalLightingState NewState);

    UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Hospital|Lighting")
    void TriggerCardiacArrestLightingAlert();

    UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Hospital|Lighting")
    void RestoreNormalClinicalLighting();

    UFUNCTION(NetMulticast, Reliable, Category = "Hospital|Lighting")
    void Multicast_ApplyEmergencyLightingTransition(bool bIsEmergency);

protected:
    UFUNCTION()
    void OnRep_LightingState();

    UFUNCTION()
    void OnRep_EmergencyStrobe();

    float CurrentInterpolatedIntensity;
};`;

  const CODE_HOSPITAL_LIGHTING_MANAGER_CPP = `// Source/HospitalGame/Private/EEHospitalLightingManager.cpp
#include "EEHospitalLightingManager.h"
#include "Net/UnrealNetwork.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/PointLightComponent.h"
#include "Kismet/GameplayStatics.h"

AEEHospitalLightingManager::AEEHospitalLightingManager()
{
    PrimaryActorTick.bCanEverTick = true;
    bReplicates = true;
    bAlwaysRelevant = true;

    CurrentLightingState = EHospitalLightingState::NormalClinical;
    bEmergencyStrobeActive = false;
    NormalSunIntensity = 1.15f;
    EmergencySunIntensity = 1.55f; // +35% de intensidad lumínica para aviso visual
    NormalSkyLightIntensity = 0.58f;
    EmergencySkyLightIntensity = 0.88f;
    CurrentInterpolatedIntensity = NormalSunIntensity;
}

void AEEHospitalLightingManager::BeginPlay()
{
    Super::BeginPlay();
}

void AEEHospitalLightingManager::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // Interpolación suave y orgánica de intensidad (InterpSpeed = 3.5f)
    const float TargetSun = (CurrentLightingState == EHospitalLightingState::EmergencyAlert)
        ? EmergencySunIntensity
        : NormalSunIntensity;

    CurrentInterpolatedIntensity = FMath::FInterpTo(CurrentInterpolatedIntensity, TargetSun, DeltaTime, 3.5f);
}

void AEEHospitalLightingManager::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(AEEHospitalLightingManager, CurrentLightingState);
    DOREPLIFETIME(AEEHospitalLightingManager, bEmergencyStrobeActive);
}

void AEEHospitalLightingManager::SetHospitalLightingMode(EHospitalLightingState NewState)
{
    if (!HasAuthority() || CurrentLightingState == NewState) return;

    CurrentLightingState = NewState;
    bEmergencyStrobeActive = (NewState == EHospitalLightingState::EmergencyAlert);

    Multicast_ApplyEmergencyLightingTransition(bEmergencyStrobeActive);
    OnLightingModeChanged.Broadcast(NewState);

    UE_LOG(LogTemp, Log, TEXT("[HospitalLighting] Modo conmutado a: %s (Luz %s para aviso)"),
        NewState == EHospitalLightingState::EmergencyAlert ? TEXT("EMERGENCIA") : TEXT("CLÍNICO NORMAL"),
        NewState == EHospitalLightingState::EmergencyAlert ? TEXT("+35% ELEVADA") : TEXT("ESTÁNDAR"));
}

void AEEHospitalLightingManager::TriggerCardiacArrestLightingAlert()
{
    SetHospitalLightingMode(EHospitalLightingState::EmergencyAlert);
}

void AEEHospitalLightingManager::RestoreNormalClinicalLighting()
{
    SetHospitalLightingMode(EHospitalLightingState::NormalClinical);
}

void AEEHospitalLightingManager::Multicast_ApplyEmergencyLightingTransition_Implementation(bool bIsEmergency)
{
    // Ejecutado en todos los clientes conectados:
    // 1. Eleva la exposición de cámara y el GI de Lumen en el PostProcessVolume
    // 2. Activa balizas giratorias en la bahía de reanimación (Trauma Room)
    // 3. Proporciona iluminación óptima para ver camillas, monitores y jeringas
}

void AEEHospitalLightingManager::OnRep_LightingState()
{
    OnLightingModeChanged.Broadcast(CurrentLightingState);
}

void AEEHospitalLightingManager::OnRep_EmergencyStrobe()
{
    // Sincronizar diodos emisivos de balizas de techo en clientes
}
`;

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'hospital_lighting_system':
        return {
          badge: 'AEEHospitalLightingManager (UE5 Lumen & Emergency Strobe)',
          icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
          title: 'Sistema de Iluminación Hospitalaria: Normal (4500K) vs Alerta (+35% Luz)',
          desc: 'Gestor dinámico de iluminación médica autoritativo. Mantiene 1.15 lux de luz neutra homogénea en estado clínico normal y eleva la intensidad a 1.55 (+35% lúmenes) con balizas de aviso visual durante Código Azul o emergencias.',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          borderClass: 'border-amber-500/30',
        };
      case 'hospital_layout_matrix':
        return {
          badge: 'AEEHospitalLayoutManager (5 Departamentos & Layout Radial)',
          icon: <Building2 className="w-3.5 h-3.5 text-cyan-400" />,
          title: 'Matriz de Departamentos, Capacidad y Flujo de Pacientes (Core Layout)',
          desc: 'Distribución radial optimizada para party games clínicos de alta tensión: Admisión (6 pacientes en espera), Reanimación (2 camillas críticas, límite 30-45s), Cubículos de Tratamiento Estándar (4 camillas), Farmacia Central Pyxis (20s restock) y Zona Hazmat.',
          badgeClass: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400',
          borderClass: 'border-cyan-500/30',
        };
      case 'hand_socket_item_spawn':
        return {
          badge: 'Instanciación de Ítem en Mano (Hand_R_Socket)',
          icon: <Syringe className="w-3.5 h-3.5 text-amber-400" />,
          title: 'Spawn Actor & Attachment en Mano: OnRep_HeldDrug en Hand_R_Socket',
          desc: 'Instanciación física de la malla 3D (Jeringa / Desfibrilador) acoplada al socket Hand_R_Socket de la mano derecha del médico mediante OnRep_HeldDrug y SpawnActor/AttachToComponent.',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          borderClass: 'border-amber-500/30',
        };
      case 'round_results_wbp':
        return {
          badge: 'WBP_RoundResults (UMG Blueprint & Star System)',
          icon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
          title: 'Pantalla de Fin de Ronda: Estrellas (1-3), Desglose Clínico y Regreso al Lobby',
          desc: 'Widget UMG con animación de revelado progresivo de estrellas calculadas por CalculateFinalStars(), sonido Fanfare y cuenta regresiva hacia el ServerTravel.',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          borderClass: 'border-amber-500/30',
        };
      case 'round_results_cpp':
        return {
          badge: 'UEERoundResultsWidget (C++ Base & Bindings)',
          icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
          title: 'Clase C++ Base del Widget de Resultados (BindWidget & Audio)',
          desc: 'Enlaza las propiedades visuales (Img_Star1..3, Text_TotalScore, Btn_ReturnLobby) con la lógica autoritativa del GameMode y GameState.',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          borderClass: 'border-amber-500/30',
        };
      case 'player_controller_cpp':
      case 'player_controller_h':
        return {
          badge: 'AEEPlayerController (Client RPC & Viewport)',
          icon: <Cpu className="w-3.5 h-3.5 text-sky-400" />,
          title: 'Player Controller: Client RPC Client_ShowRoundResults y Server Request',
          desc: 'Instancia WBP_RoundResults en el cliente local, cambia el modo de entrada a FInputModeUIOnly, activa el cursor del ratón y canaliza la vuelta al lobby.',
          badgeClass: 'bg-sky-950/80 border-sky-500/40 text-sky-400',
          borderClass: 'border-sky-500/30',
        };

      case 'anim_instance_cpp':
      case 'anim_instance_h':
        return {
          badge: 'UEEDoctorAnimInstance (AnimBP Sync)',
          icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
          title: 'Sincronización de Animación: bIsHoldingItem, Thread-Safe Updates & IK Targets',
          desc: 'Instancia de Animación C++ (UEEDoctorAnimInstance) compatible con hilos de trabajo paralelos en UE 5.3+. Sincroniza el inventario en mano de AEEMedicalCharacter con AnimBP_Doctor y calcula pesos de mezcla para Control Rig.',
          badgeClass: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400',
          borderClass: 'border-cyan-500/30',
        };
      case 'control_rig_fbik':
        return {
          badge: 'Control Rig (FBIK - Full Body IK)',
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
          title: 'Control Rig FBIK: Ajuste Procedural de Hand_R a Sockets de Ítems',
          desc: 'Pipeline de animación procedural en UE 5.3+: Locomotion State Machine -> Layered Blend Per Bone (spine_01) -> Control Rig FBIK Solver -> Ajuste dinámico de Hand_R a Hand_R_Socket.',
          badgeClass: 'bg-purple-950/80 border-purple-500/40 text-purple-400',
          borderClass: 'border-purple-500/30',
        };
      case 'multiplayer_menu_cpp':
      case 'multiplayer_menu_h':
        return {
          badge: 'WBP_MultiplayerMenu (UMG Lobby & Binding)',
          icon: <Users className="w-3.5 h-3.5 text-sky-400" />,
          title: 'Menú Multijugador UMG: Crear Sala (Host) y Conexión por IP',
          desc: 'Widget C++ (UEEMultiplayerMenuWidget) que proporciona la interfaz de usuario en el juego para invocar HostSession y JoinSessionByIP desde botones UMG y escuchar OnServerCreateComplete.',
          badgeClass: 'bg-sky-950/80 border-sky-500/40 text-sky-400',
          borderClass: 'border-sky-500/30',
        };
      case 'session_subsystem_cpp':
      case 'session_subsystem_h':
        return {
          badge: 'UMultiplayerSessionSubsystem (IOnlineSession)',
          icon: <Globe className="w-3.5 h-3.5 text-sky-400" />,
          title: 'Subsistema Multijugador: Creación de Servidor, Búsqueda y Conexión por IP',
          desc: 'GameInstanceSubsystem que encapsula la OnlineSessionInterface de Unreal Engine 5.3+. Gestiona el ciclo de vida de sesiones de red (Host/LAN/Online), delegados asíncronos y ClientTravel/ServerTravel.',
          badgeClass: 'bg-sky-950/80 border-sky-500/40 text-sky-400',
          borderClass: 'border-sky-500/30',
        };
      case 'game_instance_cpp':
      case 'game_instance_h':
        return {
          badge: 'UHospitalGameInstance (Platform Scalability)',
          icon: <Cpu className="w-3.5 h-3.5 text-amber-400" />,
          title: 'GameInstance: Ajuste Automático de Calidad Gráfica (PC vs Móvil)',
          desc: 'Gestor global del ciclo de vida del juego. Ejecuta ApplyPlatformScalabilitySettings en Init() para aplicar UGameUserSettings y CVars dinámicos según el dispositivo.',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          borderClass: 'border-amber-500/30',
        };
      case 'performance_budget':
        return {
          badge: 'Presupuesto de Rendimiento (Performance Budget)',
          icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
          title: 'Presupuesto de Rendimiento: PC (Lumen/Nanite) vs Móvil (Forward/Baking)',
          desc: 'Matriz comparativa de optimización técnica para Unreal Engine 5.3+: FPS, Draw Calls, poligonaje, pipeline de iluminación y configuraciones DeviceProfiles.ini.',
          badgeClass: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400',
          borderClass: 'border-emerald-500/30',
        };
      case 'danger_zone_cpp':
      case 'danger_zone_h':
        return {
          badge: 'AEEDangerZone (Biohazard Actor)',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          title: 'Zona de Peligro Biológico: EZoneStatus, UBoxComponent & Desinfección',
          desc: 'Actor C++ replicado para áreas contaminadas por fluidos o químicos hospitalarios. Maneja daño continuo por segundo en el servidor y flujo de desinfección mediante IInteractableInterface.',
          badgeClass: 'bg-rose-950/80 border-rose-500/40 text-rose-400',
          borderClass: 'border-rose-500/30',
        };
      case 'touch_controls_cpp':
      case 'touch_controls_h':
        return {
          badge: 'WBP_TouchControls (Enhanced Input)',
          icon: <Smartphone className="w-3.5 h-3.5 text-sky-400" />,
          title: 'Controles Táctiles Móviles: Stick Virtual y Botones Contextuales',
          desc: 'Widget UMG y clase base C++ (UEETouchControlsWidget). Mapea el Virtual Joystick nativo al eje IA_Move y gestiona Button_Interact y Button_Action reactivamente.',
          badgeClass: 'bg-sky-950/80 border-sky-500/40 text-sky-400',
          borderClass: 'border-sky-500/30',
        };
      case 'gamestate_cpp':
      case 'gamestate_h':
        return {
          badge: 'AEEGameStateBase (Match Authority)',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-300" />,
          title: 'Estado Global de la Partida: Puntuación, Tiempo y Estrellas',
          desc: 'Sincronización autoritativa en red de la ronda médica (180s), puntuación colectiva del equipo (+100 curado / -50 fallecido), cálculo de estrellas y RepNotifies para la UI.',
          badgeClass: 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400',
          borderClass: 'border-indigo-500/30',
        };
      case 'defib_station_cpp':
      case 'defib_station_h':
        return {
          badge: 'AEEDefibrillatorStation (Paro Cardíaco)',
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
          title: 'Estación de Desfibrilador: Carro de Paro y Paletas Bifásicas (200J)',
          desc: 'Actor interactuable que permite a los médicos equipar paletas de descarga para reanimar pacientes en asistolia o fibrilación ventricular crítica.',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          borderClass: 'border-amber-500/30',
        };
      case 'pharmacy_station_cpp':
      case 'pharmacy_station_h':
        return {
          badge: 'AEEPharmacyStation (Dispensario Farmacéutico)',
          icon: <Syringe className="w-3.5 h-3.5 text-teal-400" />,
          title: 'Dispensario Farmacéutico: Suministro de Fármacos y Jeringas',
          desc: 'Estación hospitalaria para equipar tratamientos específicos (Adrenalina, Antibióticos) y administrarlos a los pacientes según su diagnóstico.',
          badgeClass: 'bg-teal-950/80 border-teal-500/40 text-teal-400',
          borderClass: 'border-teal-500/30',
        };
      case 'doctor_char_cpp':
      case 'doctor_char_h':
        return {
          badge: 'AEEMedicalCharacter (Doctor Player Character)',
          icon: <Activity className="w-3.5 h-3.5 text-blue-400" />,
          title: 'Personaje Médico: Inventario en Mano, Raycast y Server RPCs',
          desc: 'Clase jugable que implementa trazado frontal de línea para interacción con pacientes y estaciones, replicación de ítems en mano y RPCs autoritativos.',
          badgeClass: 'bg-blue-950/80 border-blue-500/40 text-blue-400',
          borderClass: 'border-blue-500/30',
        };
      case 'gamemode_cpp':
      case 'gamemode_h':
        return {
          badge: 'AEEGameModeBase (Patient Spawner)',
          icon: <Cpu className="w-3.5 h-3.5 text-rose-400" />,
          title: 'GameMode: Spawner Clínico y Lectura de Casos Médicos',
          desc: 'Lee la DataTable de patologías clínicas e instancia pacientes aleatorios con tasas de degradación variables en el servidor.',
          badgeClass: 'bg-rose-950/80 border-rose-500/40 text-rose-400',
          borderClass: 'border-rose-500/30',
        };
      default:
        return {
          badge: 'UMedicalPatientComponent (C++ Core Implementation)',
          icon: <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />,
          title: 'Lógica del Paciente: EPatientState, EDiseaseType & ApplyTreatment',
          desc: 'Implementación del componente del paciente con simulación biológica de degradación, paro cardíaco, audio MetaSound ECG 3D procedural y tratamiento médico.',
          badgeClass: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400',
          borderClass: 'border-emerald-500/30',
        };
    }
  };

  const currentHeader = getHeaderInfo();

  return (
    <div className="w-full h-full bg-[#0d0e12] text-slate-200 select-none overflow-y-auto p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dynamic Header */}
        <div className={`rounded-xl bg-gradient-to-r from-[#171a26] via-[#1b1f30] to-[#12141d] border ${currentHeader.borderClass} p-6 shadow-xl transition-all`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold mb-2 ${currentHeader.badgeClass}`}>
                {currentHeader.icon}
                <span>{currentHeader.badge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {currentHeader.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {currentHeader.desc}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-[#202535] border border-slate-700 text-xs font-mono text-emerald-400">
                UE5.3+ C++ & Replicated
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#242838] pb-3">
          <button
            onClick={() => setActiveTab('hospital_lighting_system')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'hospital_lighting_system'
                ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistema Iluminación (+35% Alerta)</span>
          </button>

          <button
            onClick={() => setActiveTab('hospital_layout_matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'hospital_layout_matrix'
                ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Matriz Departamentos (Core Layout Radial)</span>
          </button>

          <button
            onClick={() => setActiveTab('hand_socket_item_spawn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'hand_socket_item_spawn'
                ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Syringe className="w-3.5 h-3.5 text-amber-300" />
            <span>OnRep_HeldDrug (Hand_R_Socket Item)</span>
          </button>

          <button
            onClick={() => setActiveTab('anim_instance_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'anim_instance_cpp'
                ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>EEDoctorAnimInstance.cpp (AnimBP Sync)</span>
          </button>

          <button
            onClick={() => setActiveTab('anim_instance_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'anim_instance_h'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>EEDoctorAnimInstance.h</span>
          </button>

          <button
            onClick={() => setActiveTab('control_rig_fbik')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'control_rig_fbik'
                ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Control Rig (FBIK - Hand_R Socket)</span>
          </button>

          <button
            onClick={() => setActiveTab('multiplayer_menu_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'multiplayer_menu_cpp'
                ? 'bg-sky-600 text-white shadow-lg ring-2 ring-sky-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>MultiplayerMenuWidget.cpp (WBP_MultiplayerMenu)</span>
          </button>

          <button
            onClick={() => setActiveTab('multiplayer_menu_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'multiplayer_menu_h'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>MultiplayerMenuWidget.h</span>
          </button>

          <button
            onClick={() => setActiveTab('session_subsystem_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'session_subsystem_cpp'
                ? 'bg-sky-600 text-white shadow-lg ring-2 ring-sky-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>MultiplayerSessionSubsystem.cpp</span>
          </button>

          <button
            onClick={() => setActiveTab('session_subsystem_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'session_subsystem_h'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>MultiplayerSessionSubsystem.h</span>
          </button>

          <button
            onClick={() => setActiveTab('game_instance_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'game_instance_cpp'
                ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>HospitalGameInstance.cpp (Scalability)</span>
          </button>

          <button
            onClick={() => setActiveTab('game_instance_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'game_instance_h'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HospitalGameInstance.h</span>
          </button>

          <button
            onClick={() => setActiveTab('performance_budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'performance_budget'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40'
                : 'bg-[#161822] text-slate-300 hover:text-white hover:bg-[#1f2230]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Presupuesto de Rendimiento (PC vs Móvil)</span>
          </button>

          <button
            onClick={() => setActiveTab('touch_controls_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'touch_controls_cpp'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>EETouchControlsWidget.cpp (WBP_TouchControls)</span>
          </button>

          <button
            onClick={() => setActiveTab('touch_controls_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'touch_controls_h'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>EETouchControlsWidget.h</span>
          </button>

          <button
            onClick={() => setActiveTab('gamestate_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'gamestate_cpp'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EEGameStateBase.cpp (Match Sync)</span>
          </button>

          <button
            onClick={() => setActiveTab('gamestate_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'gamestate_h'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>EEGameStateBase.h</span>
          </button>

          <button
            onClick={() => setActiveTab('danger_zone_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'danger_zone_cpp'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>EEDangerZone.cpp (Biohazard)</span>
          </button>

          <button
            onClick={() => setActiveTab('danger_zone_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'danger_zone_h'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>EEDangerZone.h</span>
          </button>

          <button
            onClick={() => setActiveTab('defib_station_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'defib_station_cpp'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EEDefibrillatorStation.cpp (Paro Cardíaco)</span>
          </button>

          <button
            onClick={() => setActiveTab('defib_station_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'defib_station_h'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>EEDefibrillatorStation.h</span>
          </button>

          <button
            onClick={() => setActiveTab('pharmacy_station_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'pharmacy_station_cpp'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>EEPharmacyStation.cpp (Dispensario)</span>
          </button>

          <button
            onClick={() => setActiveTab('pharmacy_station_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'pharmacy_station_h'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>EEPharmacyStation.h</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor_char_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'doctor_char_cpp'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>EEMedicalCharacter.cpp (Trace & RPC)</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor_char_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'doctor_char_h'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>EEMedicalCharacter.h (Médico)</span>
          </button>

          <button
            onClick={() => setActiveTab('gamemode_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'gamemode_cpp'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>EEGameModeBase.cpp (Spawner)</span>
          </button>

          <button
            onClick={() => setActiveTab('gamemode_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'gamemode_h'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EEGameModeBase.h</span>
          </button>

          <button
            onClick={() => setActiveTab('patient_comp_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'patient_comp_cpp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>MedicalPatientComponent.cpp</span>
          </button>

          <button
            onClick={() => setActiveTab('patient_comp_h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'patient_comp_h'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>MedicalPatientComponent.h</span>
          </button>

          <button
            onClick={() => setActiveTab('base_patient_cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'base_patient_cpp'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>EEBasePatient.cpp</span>
          </button>

          <button
            onClick={() => setActiveTab('interactable_interface')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'interactable_interface'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>InteractableInterface.h</span>
          </button>

          <button
            onClick={() => setActiveTab('medical_data_structs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'medical_data_structs'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MedicalDataStructs.h</span>
          </button>

          <button
            onClick={() => setActiveTab('dt_csv_export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'dt_csv_export'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>DT_MedicalCases.csv</span>
          </button>

          <button
            onClick={() => setActiveTab('dt_infrastructure_csv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'dt_infrastructure_csv'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#161822] text-slate-400 hover:text-slate-200 hover:bg-[#1f2230]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>DT_DepartmentInfrastructure.csv</span>
          </button>
        </div>

        {/* Code Content Container */}
        <div className="rounded-xl bg-[#13151f] border border-[#262a3b] overflow-hidden shadow-2xl">
          {/* Sistema de Iluminación Hospitalaria (Normal vs Emergencia Avisadora) */}
          {activeTab === 'hospital_lighting_system' && (
            <div className="space-y-6 p-4 sm:p-6">
              {/* Architecture Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span>Sistema de Iluminación Hospitalaria: Normal (4500K) vs Alerta (+35% Luz Avisadora)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Iluminación clínica estéril y uniforme en guardia normal. Al declararse Código Azul o paro cardíaco, la intensidad lumínica sube dinámicamente un 35% y activa balizas de aviso visual.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyCode(CODE_HOSPITAL_LIGHTING_MANAGER_H, 'lighting_h')}
                    className="px-3 py-1.5 rounded-lg bg-[#222738] hover:bg-[#2c3248] text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedFile === 'lighting_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'lighting_h' ? 'Copiado' : 'Copiar LightingManager.h'}</span>
                  </button>
                  <button
                    onClick={() => copyCode(CODE_HOSPITAL_LIGHTING_MANAGER_CPP, 'lighting_cpp')}
                    className="px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedFile === 'lighting_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'lighting_cpp' ? 'Copiado' : 'Copiar LightingManager.cpp'}</span>
                  </button>
                </div>
              </div>

              {/* Lighting State Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0d0f17]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151825] text-slate-300 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Modo de Iluminación</th>
                      <th className="py-3 px-4 text-sky-400">Intensidad Global</th>
                      <th className="py-3 px-4 text-emerald-400">Temperatura de Color (CCT)</th>
                      <th className="py-3 px-4 text-amber-300">Balizas y Estrobos de Techo</th>
                      <th className="py-3 px-4 text-rose-400">Propósito en Juego (Party Game)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                        1. Modo Clínico Estándar
                      </td>
                      <td className="py-3 px-4 text-sky-300 font-semibold">1.15 lux (Normal)</td>
                      <td className="py-3 px-4 text-slate-300">4500K - 5000K (Luz Blanca Neutra)</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">Apagadas (Diodos en Standby 0.12)</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">Visibilidad limpia para diagnóstico, triaje y preparación de fármacos</td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors bg-rose-950/20">
                      <td className="py-3 px-4 font-bold text-rose-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                        2. Alerta de Emergencia (+35% Luz)
                      </td>
                      <td className="py-3 px-4 text-rose-200 font-bold">1.55 lux (+35% Boost)</td>
                      <td className="py-3 px-4 text-amber-200">5500K Alto Contraste Quirúrgico</td>
                      <td className="py-3 px-4 text-rose-300 font-bold text-[11px]">Giro activo 5 rad/s + Estrobos 2.8 Hz</td>
                      <td className="py-3 px-4 text-rose-300 font-bold">Aviso visual instantáneo a todos los médicos ante colapso / paro cardíaco</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Three Design Pillar Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#121622] rounded-xl border border-sky-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                    <Lightbulb className="w-4 h-4 text-sky-400" />
                    <span>1. Fidelidad Clínica (4500K)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Los troffers empotrados y la luz cenital eliminan sombras duras en el suelo de vinilo, recreando la iluminación estéril, clara y ordenada de un hospital real sin saturación molesta.
                  </p>
                </div>

                <div className="p-3.5 bg-[#121622] rounded-xl border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>2. Subida de Luz para Aviso</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Al dispararse un Código Azul, el servidor eleva la luz un +35% de forma progresiva con FInterpTo (3.5f), avisando a los jugadores que corran con el desfibrilador o adrenalina sin cegar la cámara.
                  </p>
                </div>

                <div className="p-3.5 bg-[#121622] rounded-xl border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>3. Balizas Multicast Replicadas</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Las balizas de advertencia cenitales de Fresnel en techo se sincronizan por RPC multicast fiable, garantizando que el aviso de emergencia llegue a la vez a todas las instancias conectadas.
                  </p>
                </div>
              </div>

              {/* C++ Code Display: Header & Source */}
              <div className="space-y-4 pt-2">
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold">Source/HospitalGame/Public/EEHospitalLightingManager.h</span>
                    <button
                      onClick={() => copyCode(CODE_HOSPITAL_LIGHTING_MANAGER_H, 'lighting_h_code')}
                      className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedFile === 'lighting_h_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'lighting_h_code' ? 'Copiado' : 'Copiar Header'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed bg-[#0b0c10] max-h-[380px]">
                    <code>{CODE_HOSPITAL_LIGHTING_MANAGER_H}</code>
                  </pre>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold">Source/HospitalGame/Private/EEHospitalLightingManager.cpp</span>
                    <button
                      onClick={() => copyCode(CODE_HOSPITAL_LIGHTING_MANAGER_CPP, 'lighting_cpp_code')}
                      className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedFile === 'lighting_cpp_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'lighting_cpp_code' ? 'Copiado' : 'Copiar Source'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed bg-[#0b0c10] max-h-[480px]">
                    <code>{CODE_HOSPITAL_LIGHTING_MANAGER_CPP}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Matriz de Departamentos, Capacidad y Flujo de Pacientes */}
          {activeTab === 'hospital_layout_matrix' && (
            <div className="space-y-6 p-4 sm:p-6">
              {/* Core Layout Architecture Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <span>Matriz de Departamentos, Capacidad y Flujo de Pacientes (Core Layout)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hospital general de tamaño medio con distribución radial en corredor central para minimizar traslados de suministros y evitar atascos en pasillos durante picos de emergencia.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyCode(CODE_HOSPITAL_LAYOUT_MANAGER_H, 'layout_h')}
                    className="px-3 py-1.5 rounded-lg bg-[#222738] hover:bg-[#2c3248] text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedFile === 'layout_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'layout_h' ? 'Copiado' : 'Copiar LayoutManager.h'}</span>
                  </button>
                  <button
                    onClick={() => copyCode(CODE_HOSPITAL_LAYOUT_MANAGER_CPP, 'layout_cpp')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedFile === 'layout_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'layout_cpp' ? 'Copiado' : 'Copiar LayoutManager.cpp'}</span>
                  </button>
                </div>
              </div>

              {/* 5-Department Operational Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0d0f17]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151825] text-slate-300 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Departamento / Sala</th>
                      <th className="py-3 px-4 text-cyan-400">Capacidad Simultánea</th>
                      <th className="py-3 px-4 text-emerald-400">Personal Asignado</th>
                      <th className="py-3 px-4 text-amber-300">Maquinaria / Equipamiento Crítico</th>
                      <th className="py-3 px-4 text-rose-400">Tasa de Flujo / Throughput</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        1. Sala de Admisión & Triaje
                      </td>
                      <td className="py-3 px-4 text-blue-300 font-semibold">6 Pacientes en espera</td>
                      <td className="py-3 px-4 text-slate-300">1 Enfermera de Triaje</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">Kiosco EMR/HIS, Termómetros infrarrojos, Oxímetros</td>
                      <td className="py-3 px-4 text-amber-300 font-semibold">1 paciente cada 15-30 seg (Oleada)</td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        2. Bahías de Reanimación (Trauma / Código Azul)
                      </td>
                      <td className="py-3 px-4 text-red-300 font-semibold">2 Camillas Críticas</td>
                      <td className="py-3 px-4 text-slate-300">1 Médico Urgenciólogo, 1 Enfermero/a</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">Desfibrilador Bifásico, Monitor ECG 12 derivaciones, Carro Rojo</td>
                      <td className="py-3 px-4 text-red-400 font-semibold">Límite de colapso: 30-45s antes de paro</td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        3. Cubículos de Tratamiento Estándar
                      </td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">4 Camillas de observación</td>
                      <td className="py-3 px-4 text-slate-300">1 Médico General / Residente</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">Bombas de infusión IV, Nebulizadores, Estetoscopios</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">Resolución en 60-90s por caso</td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                        4. Farmacia Central (Dispenser Station)
                      </td>
                      <td className="py-3 px-4 text-teal-300 font-semibold">1 Estación de estantería</td>
                      <td className="py-3 px-4 text-slate-300">1 Técnico de Farmacia / Asistente</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">Armario automatizado Pyxis (Epinefrina, Suero, Antibióticos)</td>
                      <td className="py-3 px-4 text-cyan-300 font-semibold">Reabastecimiento dinámico cada 20s</td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        5. Zona de Contaminación / Hazmat
                      </td>
                      <td className="py-3 px-4 text-amber-300 font-semibold">1 Área de Descontaminación</td>
                      <td className="py-3 px-4 text-slate-300">1 Especialista Hazmat / Desinfección</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">Ducha química deluge, Aspersores, Contenedores Biohazard</td>
                      <td className="py-3 px-4 text-rose-300 font-semibold">Protocolo activo ante fuga/derrame</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Architectural Principles Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#121622] rounded-xl border border-blue-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Distribución Radial (Hub Central)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Ubicado en el origen radial [0, 0, 1.2], el disco central interconecta las 5 alas mediante rutas directas de menos de 10 metros, eliminando los cuellos de botella en pasillos estrechos típicos de party games cooperativos.
                  </p>
                </div>

                <div className="p-3.5 bg-[#121622] rounded-xl border border-red-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Segregación Crítica vs Rutinaria
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Reanimación (Código Azul) está aislada en el ala Este con acceso rápido al carro de paro y desfibrilador bifásico (200J), evitando que los casos de emergencia interfieran con los 4 cubículos de observación estándar en el ala Oeste.
                  </p>
                </div>

                <div className="p-3.5 bg-[#121622] rounded-xl border border-teal-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    Cadencia Pyxis & Hazmat Deluge
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    El armario Pyxis MedStation 4000 regenera 3 dosis clínicas cada 20s. En caso de derrame tóxico en los pasillos, la estación Hazmat activa aspersores de descontaminación química para habilitar el paso de los suministros.
                  </p>
                </div>
              </div>

              {/* C++ Code Display: Header & Source */}
              <div className="space-y-4 pt-2">
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Source/HospitalGame/Public/EEHospitalLayoutManager.h</span>
                    <button
                      onClick={() => copyCode(CODE_HOSPITAL_LAYOUT_MANAGER_H, 'layout_h_code')}
                      className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedFile === 'layout_h_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'layout_h_code' ? 'Copiado' : 'Copiar Header'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed bg-[#0b0c10] max-h-[380px]">
                    <code>{CODE_HOSPITAL_LAYOUT_MANAGER_H}</code>
                  </pre>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Source/HospitalGame/Private/EEHospitalLayoutManager.cpp</span>
                    <button
                      onClick={() => copyCode(CODE_HOSPITAL_LAYOUT_MANAGER_CPP, 'layout_cpp_code')}
                      className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedFile === 'layout_cpp_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'layout_cpp_code' ? 'Copiado' : 'Copiar Source'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed bg-[#0b0c10] max-h-[480px]">
                    <code>{CODE_HOSPITAL_LAYOUT_MANAGER_CPP}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Hand_R_Socket Item Mesh Spawning & Blueprint Specification */}
          {activeTab === 'hand_socket_item_spawn' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#161822] px-4 py-2.5 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-bold">Source/HospitalGame/Public/EEMedicalCharacter.h • OnRep_HeldDrug & Hand_R_Socket</span>
                </div>
                <button
                  onClick={() => copyCode(CODE_HAND_SOCKET_ITEM_SPAWN, 'hand_socket_spawn')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded-lg text-xs font-mono border border-amber-500/40 cursor-pointer"
                >
                  {copiedFile === 'hand_socket_spawn' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'hand_socket_spawn' ? 'Copiado' : 'Copiar Guía & Código'}</span>
                </button>
              </div>

              {/* Visual Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#0e1017] rounded-xl border border-slate-800">
                <div className="p-3 bg-[#131722] rounded-lg border border-amber-500/20">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <Syringe className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. OnRep_HeldDrug en Red</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Al replicarse <code className="text-amber-300">HeldDrugType</code>, los clientes destruyen el actor previo (<code className="text-slate-400">CurrentHeldActor</code>) y ejecutan el <code className="text-sky-300">SpawnActor</code> local con <code className="text-slate-400">AlwaysSpawn</code>.
                  </p>
                </div>

                <div className="p-3 bg-[#131722] rounded-lg border border-sky-500/20">
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>2. Regla de Acople Hand_R_Socket</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <code className="text-sky-300">AttachActorToComponent</code> con <code className="text-emerald-300">SnapToTarget</code> en Location/Rotation y <code className="text-amber-300">KeepWorld</code> en Scale acopla la jeringa o paleta exactamente a la palma derecha.
                  </p>
                </div>

                <div className="p-3 bg-[#131722] rounded-lg border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. Prevención de Colisiones</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    El ítem instanciado invoca <code className="text-emerald-300">SetActorEnableCollision(false)</code> para evitar que la geometría 3D de la jeringa o desfibrilador empuje la cápsula física del doctor.
                  </p>
                </div>
              </div>

              <pre className="p-4 bg-[#0a0c13] border border-amber-500/20 rounded-xl overflow-x-auto text-xs font-mono text-amber-100/90 leading-relaxed max-h-[640px]">
                <code>{CODE_HAND_SOCKET_ITEM_SPAWN}</code>
              </pre>
            </div>
          )}

          {/* WBP_RoundResults Blueprint & UI Specification */}
          {activeTab === 'round_results_wbp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#161822] px-4 py-2.5 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-bold">Content/HospitalGame/UI/WBP_RoundResults.uasset</span>
                </div>
                <button
                  onClick={() => copyCode(CODE_ROUND_RESULTS_WBP, 'round_wbp')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded-lg text-xs font-mono border border-amber-500/40"
                >
                  {copiedFile === 'round_wbp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'round_wbp' ? 'Copiado' : 'Copiar UMG Spec'}</span>
                </button>
              </div>
              <pre className="p-4 bg-[#0a0c13] border border-amber-500/20 rounded-xl overflow-x-auto text-xs font-mono text-amber-100/90 leading-relaxed max-h-[640px]">
                <code>{CODE_ROUND_RESULTS_WBP}</code>
              </pre>
            </div>
          )}

          {/* UEERoundResultsWidget C++ Implementation */}
          {activeTab === 'round_results_cpp' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#161822] px-4 py-2 rounded-xl border border-amber-500/30">
                  <span className="text-amber-400 font-bold">Source/HospitalGame/Public/EERoundResultsWidget.h</span>
                  <button
                    onClick={() => copyCode(CODE_ROUND_RESULTS_H, 'round_h')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded-lg text-xs font-mono border border-amber-500/40"
                  >
                    {copiedFile === 'round_h' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'round_h' ? 'Copiado' : 'Copiar Widget.h'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0a0c13] border border-amber-500/20 rounded-xl overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[380px]">
                  <code>{CODE_ROUND_RESULTS_H}</code>
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#161822] px-4 py-2 rounded-xl border border-amber-500/30">
                  <span className="text-amber-400 font-bold">Source/HospitalGame/Private/EERoundResultsWidget.cpp</span>
                  <button
                    onClick={() => copyCode(CODE_ROUND_RESULTS_CPP, 'round_cpp')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded-lg text-xs font-mono border border-amber-500/40"
                  >
                    {copiedFile === 'round_cpp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'round_cpp' ? 'Copiado' : 'Copiar Widget.cpp'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0a0c13] border border-amber-500/20 rounded-xl overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[440px]">
                  <code>{CODE_ROUND_RESULTS_CPP}</code>
                </pre>
              </div>
            </div>
          )}

          {/* AEEPlayerController Implementation */}
          {activeTab === 'player_controller_cpp' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#161822] px-4 py-2 rounded-xl border border-sky-500/30">
                  <span className="text-sky-400 font-bold">Source/HospitalGame/Public/EEPlayerController.h</span>
                  <button
                    onClick={() => copyCode(CODE_PLAYER_CONTROLLER_H, 'pc_h')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 rounded-lg text-xs font-mono border border-sky-500/40"
                  >
                    {copiedFile === 'pc_h' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'pc_h' ? 'Copiado' : 'Copiar Controller.h'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0a0c13] border border-sky-500/20 rounded-xl overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[380px]">
                  <code>{CODE_PLAYER_CONTROLLER_H}</code>
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#161822] px-4 py-2 rounded-xl border border-sky-500/30">
                  <span className="text-sky-400 font-bold">Source/HospitalGame/Private/EEPlayerController.cpp</span>
                  <button
                    onClick={() => copyCode(CODE_PLAYER_CONTROLLER_CPP, 'pc_cpp')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 rounded-lg text-xs font-mono border border-sky-500/40"
                  >
                    {copiedFile === 'pc_cpp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'pc_cpp' ? 'Copiado' : 'Copiar Controller.cpp'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0a0c13] border border-sky-500/20 rounded-xl overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[440px]">
                  <code>{CODE_PLAYER_CONTROLLER_CPP}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'anim_instance_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">Source/HospitalGame/Private/Animation/EEDoctorAnimInstance.cpp</span>
                <button
                  onClick={() => copyCode(CODE_ANIM_INSTANCE_CPP, 'anim_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'anim_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'anim_cpp' ? 'Copiado' : 'Copiar EEDoctorAnimInstance.cpp'}</span>
                </button>
              </div>
              <div className="p-4 bg-[#11131c] border-b border-[#212433] space-y-3">
                <div className="p-3 rounded-lg bg-[#181c2b] border border-cyan-500/30">
                  <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Diagrama de Flujo: Arquitectura de Sincronización de Animación</span>
                  </div>
                  <div className="font-mono text-[11px] bg-[#0c0e15] p-3 rounded border border-cyan-900/40 text-slate-300 overflow-x-auto leading-relaxed">
                    <span className="text-emerald-400 font-bold">[AEEMedicalCharacter]</span> ──<span className="text-amber-300">(Variable Replicada: bIsHoldingItem)</span>──&gt; <span className="text-sky-400 font-bold">[AnimBP_Doctor (UEEDoctorAnimInstance)]</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400 font-bold">[Control Rig (CR_Doctor_FBIK)]</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-teal-300 font-semibold">(Ajusta Hand_R a Socket de Ítems: Hand_R_Socket)</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    ⚡ <strong>Optimización Thread-Safe en UE 5.3+:</strong> La clase <code>UEEDoctorAnimInstance</code> implementa <code>NativeUpdateAnimation</code> en el Game Thread para extraer <code>bIsHoldingItem</code> de <code>AEEMedicalCharacter</code>, y prepara los datos de acceso para <code>NativeThreadSafeUpdateAnimation</code> en los hilos de animación de trabajo paralelos (Worker Threads).
                  </p>
                  <p className="text-[11px] text-slate-400">
                    • <strong>FMath::FInterpTo(HandIKAlpha):</strong> Transición suave (12.0 speed) para evitar saltos bruscos cuando el doctor saca o enfunda jeringas o el desfibrilador.<br />
                    • <strong>HandIKTargetTransform:</strong> Extrae la posición del socket en tiempo real para alimentar el efector de la mano en el Control Rig.
                  </p>
                </div>
              </div>
              <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_ANIM_INSTANCE_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'anim_instance_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">Source/HospitalGame/Public/Animation/EEDoctorAnimInstance.h</span>
                <button
                  onClick={() => copyCode(CODE_ANIM_INSTANCE_H, 'anim_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'anim_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'anim_h' ? 'Copiado' : 'Copiar EEDoctorAnimInstance.h'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  📋 <strong>Cabecera de Instancia de Animación:</strong> Declara las variables de locomoción (<code>GroundSpeed</code>, <code>bIsFalling</code>), estado de inventario replicado (<code>bIsHoldingItem</code>, <code>bIsHoldingTwoHandedItem</code>) y targets para cinemática inversa (<code>HandIKTargetTransform</code>, <code>HandIKAlpha</code>).
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_ANIM_INSTANCE_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'control_rig_fbik' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold">Content/HospitalGame/Animation/ControlRig/CR_Doctor_FBIK (Configuración AnimGraph)</span>
                <button
                  onClick={() => copyCode(CODE_CONTROL_RIG_FBIK_GUIDE, 'cr_fbik')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'cr_fbik' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'cr_fbik' ? 'Copiado' : 'Copiar Guía Control Rig'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  🦾 <strong>Control Rig Full Body IK (FBIK) & Layered Blend Per Bone:</strong> Guía arquitectónica detallada para conectar el nodo de Control Rig en el <code>AnimGraph</code> de <code>AnimBP_Doctor</code>.
                </p>
                <p className="text-[11px] text-slate-400">
                  • <strong>Layered Blend Per Bone:</strong> Aísla la pose de agarre del torso superior (<code>spine_01</code>) mientras las piernas corren con el BlendSpace de locomoción.<br />
                  • <strong>Full Body IK Solver:</strong> Ajusta en tiempo de ejecución la articulación de la mano derecha (<code>hand_r</code>) con el socket del ítem (<code>Hand_R_Socket</code>) para eliminar desalineaciones al apuntar o caminar.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_CONTROL_RIG_FBIK_GUIDE}</code>
              </pre>
            </div>
          )}

          {activeTab === 'multiplayer_menu_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Private/UI/EEMultiplayerMenuWidget.cpp</span>
                <button
                  onClick={() => copyCode(CODE_MULTIPLAYER_MENU_CPP, 'menu_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'menu_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'menu_cpp' ? 'Copiado' : 'Copiar MultiplayerMenu.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  🖥️ <strong>Widget de Menú Multijugador (WBP_MultiplayerMenu):</strong> Conecta los botones de la interfaz UMG con el subsistema de sesiones de red <code>UMultiplayerSessionSubsystem</code>.
                </p>
                <p className="text-[11px] text-slate-400">
                  • <strong>HandleHostClicked():</strong> Invoca <code>HostSession(4, true)</code> y muestra indicador de carga mientras el servidor escucha.<br />
                  • <strong>HandleJoinClicked():</strong> Conecta mediante <code>JoinSessionByIP(TargetIP)</code> usando la IP introducida por el jugador (compatible con teclado virtual táctil).<br />
                  • <strong>OnServerCreateCallback():</strong> Escucha el delegado dinámico <code>OnServerCreateComplete</code> para actualizar los textos informativos en pantalla.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_MULTIPLAYER_MENU_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'multiplayer_menu_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Public/UI/EEMultiplayerMenuWidget.h</span>
                <button
                  onClick={() => copyCode(CODE_MULTIPLAYER_MENU_H, 'menu_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'menu_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'menu_h' ? 'Copiado' : 'Copiar MultiplayerMenu.h'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  📋 <strong>Cabecera del Widget de Menú (BindWidget):</strong> Expone los punteros a los botones, campo de texto e indicadores de carga para su instanciación en Blueprints UMG.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_MULTIPLAYER_MENU_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'session_subsystem_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Private/MultiplayerSessionSubsystem.cpp</span>
                <button
                  onClick={() => copyCode(CODE_SESSION_SUBSYSTEM_CPP, 'session_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'session_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'session_cpp' ? 'Copiado' : 'Copiar SessionSubsystem.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  🌐 <strong>Ciclo de Red Autorizado (Online Subsystem & Travel):</strong> Configura la sesión mediante <code>IOnlineSessionPtr</code>, destruye instancias huérfanas antes de alojar y ejecuta <code>ServerTravel(&quot;/Game/Maps/ER_HospitalWard?listen&quot;)</code> al completar la creación.
                </p>
                <p className="text-[11px] text-slate-400">
                  • <strong>HostSession(MaxPlayers, bIsLAN):</strong> Publica parámetros en el motor (<code>bShouldAdvertise</code>, <code>bUsesPresence</code>, <code>MATCH_TYPE=&quot;HOSPITAL_COOP&quot;</code>).<br />
                  • <strong>JoinSessionByIP(IPAddress):</strong> Conexión directa del cliente por socket sin necesidad de servidor maestro mediante <code>ClientTravel(IPAddress, ETravelType::TRAVEL_Absolute)</code>.<br />
                  • <strong>Módulos Build.cs:</strong> Requiere <code>&quot;OnlineSubsystem&quot;</code> y <code>&quot;OnlineSubsystemUtils&quot;</code> en <code>HospitalGame.Build.cs</code>.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_SESSION_SUBSYSTEM_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'session_subsystem_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Public/MultiplayerSessionSubsystem.h</span>
                <button
                  onClick={() => copyCode(CODE_SESSION_SUBSYSTEM_H, 'session_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'session_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'session_h' ? 'Copiado' : 'Copiar SessionSubsystem.h'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  📡 <strong>Cabecera del Subsistema de Sesiones (UGameInstanceSubsystem):</strong> Hereda de <code>UGameInstanceSubsystem</code> para persistir entre cambios de mapa/niveles y expone el delegado dinámico <code>OnServerCreateComplete</code> para notificar a Blueprints UMG.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_SESSION_SUBSYSTEM_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'game_instance_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">Source/HospitalGame/Private/HospitalGameInstance.cpp</span>
                <button
                  onClick={() => copyCode(CODE_GAME_INSTANCE_CPP, 'gi_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'gi_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gi_cpp' ? 'Copiado' : 'Copiar GameInstance.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  ⚙️ <strong>Ajuste Dinámico de Escalabilidad (UGameUserSettings):</strong> Detecta en tiempo de compilación y ejecución la plataforma destino (PC vs Móvil) y aplica los parámetros del presupuesto de rendimiento (Lumen/Nanite vs Forward Shading/Baking) sin requerir reinicio del motor.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_GAME_INSTANCE_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'game_instance_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">Source/HospitalGame/Public/HospitalGameInstance.h</span>
                <button
                  onClick={() => copyCode(CODE_GAME_INSTANCE_H, 'gi_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'gi_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gi_h' ? 'Copiado' : 'Copiar GameInstance.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_GAME_INSTANCE_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'performance_budget' && (
            <div className="space-y-6 p-5">
              {/* Performance Budget Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <span>Presupuesto de Rendimiento (Performance Budget) — PC vs Móvil</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Límites técnicos estrictos para garantizar 60 FPS estables sin estrangulamiento térmico en móviles y máxima fidelidad visual en PC.
                  </p>
                </div>
                <button
                  onClick={() => copyCode(CODE_DEVICE_PROFILES_INI, 'device_profiles_ini')}
                  className="px-3 py-1.5 rounded-lg bg-[#222738] hover:bg-[#2c3248] text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedFile === 'device_profiles_ini' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'device_profiles_ini' ? 'Copiado' : 'Copiar DeviceProfiles.ini'}</span>
                </button>
              </div>

              {/* Main Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0d0f17]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151825] text-slate-300 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Métrica</th>
                      <th className="py-3 px-4 text-sky-400">Presupuesto PC (Gama Media/Alta)</th>
                      <th className="py-3 px-4 text-emerald-400">Presupuesto Móvil (Android / iOS)</th>
                      <th className="py-3 px-4 text-amber-300">Estrategia en UE5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Tasa de Frames
                      </td>
                      <td className="py-3 px-4 text-sky-300 font-semibold">60 - 120 FPS</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">60 FPS estables</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Frame time budget: 8.3ms en PC vs 16.6ms en móvil (evita throttling por batería).
                      </td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        Draw Calls (Batches)
                      </td>
                      <td className="py-3 px-4 text-sky-300 font-semibold">&lt; 2,000</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">&lt; 200 - 300</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Agrupación por Instanced Static Mesh (HISM) para camillas, sueros y monitores.
                      </td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        Triángulos en Pantalla
                      </td>
                      <td className="py-3 px-4 text-sky-300 font-semibold">~2,000,000</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">&lt; 300,000</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Occlusion Culling en salas cerradas de urgencias y reducción de vértices en props.
                      </td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Iluminación
                      </td>
                      <td className="py-3 px-4 text-sky-300 font-semibold">Lumen / Luces Dinámicas</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">Luces Horneadas / Forward Shading</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        GPU Lightmass para iluminación estática con bajo consumo térmico en Vulkan/Metal.
                      </td>
                    </tr>
                    <tr className="hover:bg-[#131622]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        Geometría
                      </td>
                      <td className="py-3 px-4 text-sky-300 font-semibold">Nanite Habilitado</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">Fallback Meshes (LODs tradicionales)</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        Nanite en mallas de alta resolución para PC; generación automática de LOD0 a LOD3 para móviles.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Technical INI Configuration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold text-emerald-400">Config/DefaultDeviceProfiles.ini (Perfiles de Escalabilidad UE5)</span>
                  <span className="text-[11px] text-slate-500">Aplica CVars específicos según la plataforma</span>
                </div>
                <pre className="p-4 rounded-xl bg-[#0b0c10] border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
                  <code>{CODE_DEVICE_PROFILES_INI}</code>
                </pre>
              </div>

              {/* Console Profiling Commands & Bottleneck Diagnostics */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Diagnóstico de Cuellos de Botella (Bottlenecks) en Tiempo de Ejecución</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">UE5 Developer Profiling Toolkit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#141724] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold font-mono text-sky-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        stat fps / stat unit
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/40">CPU vs GPU</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Desglosa el tiempo de fotograma en <strong>Frame</strong>, <strong>Game Thread</strong>, <strong>Draw Thread</strong> y <strong>GPU</strong> para aislar instantáneamente el origen del cuello de botella:
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
                      <li>• <strong className="text-amber-300">Game &gt; 16.6ms (Móvil) / &gt; 8.3ms (PC):</strong> Cuello de botella en CPU (Tick de pacientes, IA, físicas o replicación en red).</li>
                      <li>• <strong className="text-amber-300">Draw &gt; GPU:</strong> Cuello de botella en Render Thread (exceso de batches/Draw Calls, visibilidad u oclusión).</li>
                      <li>• <strong className="text-amber-300">GPU &gt; Frame:</strong> Cuello de botella en GPU (postprocesado pesado, overdraw en efectos de desinfección o sombras dinámicas).</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141724] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        stat rhi
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/40">RHI / Batches</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Supervisa la carga directa enviada al controlador de renderizado (Render Hardware Interface):
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
                      <li>• <strong>Draw Calls (Render Primitive Calls):</strong> Mantener por debajo de 250 en móviles y &lt;2,000 en PC.</li>
                      <li>• <strong>Triangles Drawn:</strong> Comprueba la eficiencia de LODs o la sobrecarga de geometría en la sala de urgencias.</li>
                      <li>• <strong>Allocated Texture Memory:</strong> Alerta de agotamiento de VRAM en dispositivos Android/iOS sin memoria unificada rápida.</li>
                    </ul>
                  </div>
                </div>

                {/* Unreal Insights Deep Profiling Card */}
                <div className="p-4 rounded-xl bg-[#0e111a] border border-indigo-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-950/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold font-mono text-indigo-300">Perfilado Avanzado con Unreal Insights</span>
                    </div>
                    <button
                      onClick={() => copyCode('HospitalGame.exe -trace=cpu,gpu,bookmark,frame -tracehost=127.0.0.1', 'trace_command')}
                      className="px-2.5 py-1 rounded bg-[#1c2236] hover:bg-[#252d47] text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
                    >
                      {copiedFile === 'trace_command' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'trace_command' ? 'Comando Copiado' : 'Copiar Parámetro de Ejecución'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <p>
                      <strong>1. Lanzamiento con Captura de Trazas:</strong> Inicia el binario compilado o sesión standalone inyectando el flag de rastreo:
                    </p>
                    <pre className="p-2.5 rounded bg-[#08090d] border border-slate-800 font-mono text-emerald-300 text-[11px] overflow-x-auto">
                      <code>HospitalGame.exe -trace=cpu,gpu,bookmark,frame -tracehost=127.0.0.1</code>
                    </pre>

                    <p>
                      <strong>2. Análisis en Unreal Insights (<code>Engine/Binaries/Win64/UnrealInsights.exe</code>):</strong>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded bg-[#141826] border border-slate-800/80 text-[11px] text-slate-400">
                        <strong className="text-white block mb-0.5">⏱️ Picos en TickComponent (Pacientes):</strong>
                        Permite auditar si <code>UMedicalPatientComponent::TickComponent</code> genera micro-congelamientos (micro-stutters) al calcular degradación vital o al sincronizar parámetros de MetaSound ECG.
                      </div>
                      <div className="p-2.5 rounded bg-[#141826] border border-slate-800/80 text-[11px] text-slate-400">
                        <strong className="text-white block mb-0.5">🌐 Trazas de Paquetes de Red (Net Insights):</strong>
                        Diagnostica retrasos en la serialización de <code>Replication</code>, overhead de RPCs al interactuar con el dispensario de fármacos y pérdida de paquetes entre Host y Clientes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'touch_controls_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Private/UI/EETouchControlsWidget.cpp</span>
                <button
                  onClick={() => copyCode(CODE_TOUCH_CONTROLS_CPP, 'touch_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'touch_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'touch_cpp' ? 'Copiado' : 'Copiar TouchControls.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1">
                <p>
                  📱 <strong>Widget de Controles Táctiles (WBP_TouchControls):</strong> Diseñado para interfaces móviles y tablets en Unreal Engine 5.3+.
                </p>
                <p className="text-[11px] text-slate-400">
                  • <strong>Stick Virtual Izquierdo (Virtual Joystick):</strong> Integrado mediante el subsistema de Enhanced Input (<code>DefaultVirtualJoysticks</code>), inyecta valores 2D al <code>IA_Move</code> para desplazamiento isométrico.<br />
                  • <strong>Botón Gigante de Interacción (<code>Button_Interact</code>):</strong> Esquina inferior derecha. Dispara <code>IA_Interact</code> con raycast frontal.<br />
                  • <strong>Botón de Acción Rápida (<code>Button_Action</code>):</strong> Aparece reactivamente cuando el médico sostiene un fármaco o desfibrilador para administración inmediata.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_TOUCH_CONTROLS_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'touch_controls_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Public/UI/EETouchControlsWidget.h</span>
                <button
                  onClick={() => copyCode(CODE_TOUCH_CONTROLS_H, 'touch_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'touch_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'touch_h' ? 'Copiado' : 'Copiar TouchControls.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_TOUCH_CONTROLS_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'gamestate_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold">Source/HospitalGame/Private/EEGameStateBase.cpp</span>
                <button
                  onClick={() => copyCode(CODE_GAMESTATE_CPP, 'gs_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'gs_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gs_cpp' ? 'Copiado' : 'Copiar GameState.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  🏆 <strong>Estado Global de la Partida Multijugador:</strong> Sincroniza en todos los clientes la puntuación colectiva (<code>TeamScore</code>), pacientes curados/fallecidos, temporizador de guardia (<code>RemainingMatchTime</code>) y evaluación de 1 a 3 estrellas mediante RepNotifies y eventos de HUD.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_GAMESTATE_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'gamestate_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold">Source/HospitalGame/Public/EEGameStateBase.h</span>
                <button
                  onClick={() => copyCode(CODE_GAMESTATE_H, 'gs_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'gs_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gs_h' ? 'Copiado' : 'Copiar GameState.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_GAMESTATE_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'danger_zone_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Source/HospitalGame/Private/EEDangerZone.cpp</span>
                <button
                  onClick={() => copyCode(CODE_DANGER_ZONE_CPP, 'danger_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'danger_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'danger_cpp' ? 'Copiado' : 'Copiar DangerZone.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  ☣️ <strong>Zona de Peligro Biológico / Químico Replicada:</strong> Maneja solapamiento (<code>UBoxComponent</code>) con daño por segundo periódico y desinfección mediante <code>IInteractableInterface</code>. Utiliza <code>OnRep_ZoneStatus</code> para conmutar materiales y visibilidad entre estados <em>Clean</em>, <em>Contaminated</em> y <em>Disinfecting</em>.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DANGER_ZONE_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'danger_zone_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Source/HospitalGame/Public/EEDangerZone.h</span>
                <button
                  onClick={() => copyCode(CODE_DANGER_ZONE_H, 'danger_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'danger_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'danger_h' ? 'Copiado' : 'Copiar DangerZone.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DANGER_ZONE_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'patient_comp_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Source/HospitalGame/Private/MedicalPatientComponent.cpp</span>
                <button
                  onClick={() => copyCode(CODE_PATIENT_COMP_CPP, 'pat_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'pat_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'pat_cpp' ? 'Copiado' : 'Copiar C++ Source'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_PATIENT_COMP_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'patient_comp_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Source/HospitalGame/Public/MedicalPatientComponent.h</span>
                <button
                  onClick={() => copyCode(CODE_PATIENT_COMP_H, 'pat_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'pat_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'pat_h' ? 'Copiado' : 'Copiar C++ Header'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_PATIENT_COMP_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'base_patient_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">Source/HospitalGame/Private/EEBasePatient.cpp</span>
                <button
                  onClick={() => copyCode(CODE_BASE_PATIENT_INTEGRATION, 'base_pat')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'base_pat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'base_pat' ? 'Copiado' : 'Copiar C++'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_BASE_PATIENT_INTEGRATION}</code>
              </pre>
            </div>
          )}

          {activeTab === 'medical_data_structs' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold">Source/HospitalGame/Public/MedicalDataStructs.h</span>
                <button
                  onClick={() => copyCode(CODE_MEDICAL_DATA_STRUCTS_H, 'structs')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'structs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'structs' ? 'Copiado' : 'Copiar Struct C++'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_MEDICAL_DATA_STRUCTS_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'dt_csv_export' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold">Content/HospitalGame/Data/DT_MedicalCases.csv (UE5 Importable CSV)</span>
                <button
                  onClick={() => copyCode(CODE_DT_CSV, 'dt_csv')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'dt_csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'dt_csv' ? 'Copiado' : 'Copiar CSV'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  💡 <strong>Cómo importar en Unreal Engine 5:</strong> Arrastra este archivo <code>DT_MedicalCases.csv</code> al Content Browser y selecciona <code>FMedicalCaseData</code> en el diálogo de importación.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DT_CSV}</code>
              </pre>
            </div>
          )}

          {activeTab === 'dt_infrastructure_csv' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Content/HospitalGame/Data/DT_DepartmentInfrastructure.csv (UE5 Importable CSV)</span>
                <button
                  onClick={() => copyCode(CODE_DT_INFRASTRUCTURE_CSV, 'dt_infra_csv')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'dt_infra_csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'dt_infra_csv' ? 'Copiado' : 'Copiar CSV'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  💡 <strong>Cómo importar en Unreal Engine 5:</strong> Arrastra este archivo <code>DT_DepartmentInfrastructure.csv</code> a la carpeta <code>Content/HospitalGame/Data/</code> y selecciona la estructura C++ <code>FDepartmentInfrastructureData</code> como Row Structure. Contiene la maquinaria requerida, potencias en Watts para generadores y el multiplicador de riesgo de infección.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DT_INFRASTRUCTURE_CSV}</code>
              </pre>
            </div>
          )}

          {activeTab === 'interactable_interface' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">Source/HospitalGame/Public/InteractableInterface.h</span>
                <button
                  onClick={() => copyCode(CODE_INTERACTION_INTERFACE, 'interface')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'interface' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'interface' ? 'Copiado' : 'Copiar Header'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_INTERACTION_INTERFACE}</code>
              </pre>
            </div>
          )}

          {activeTab === 'gamemode_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Source/HospitalGame/Public/EEGameModeBase.h</span>
                <button
                  onClick={() => copyCode(CODE_EE_GAMEMODE_H, 'gm_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'gm_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gm_h' ? 'Copiado' : 'Copiar GameMode.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_EE_GAMEMODE_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'gamemode_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Source/HospitalGame/Private/EEGameModeBase.cpp</span>
                <button
                  onClick={() => copyCode(CODE_EE_GAMEMODE_CPP, 'gm_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'gm_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gm_cpp' ? 'Copiado' : 'Copiar GameMode.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  ⚡ <strong>Server Authoritative:</strong> <code>SpawnPatientAtRandomDesk</code> lee las filas del <code>UDataTable*</code> y configura el componente <code>UMedicalPatientComponent</code> automáticamente para la oleada.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_EE_GAMEMODE_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'defib_station_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">Source/HospitalGame/Private/EEDefibrillatorStation.cpp</span>
                <button
                  onClick={() => copyCode(CODE_DEFIB_STATION_CPP, 'defib_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'defib_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'defib_cpp' ? 'Copiado' : 'Copiar DefibrillatorStation.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  ⚡ <strong>Carro de Paro y Desfibrilación:</strong> Permite al médico equipar las paletas de descarga bifásica (200 Joules). Es indispensable para reanimar pacientes en Código Azul (<code>EPatientState::CardiacArrest</code>).
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DEFIB_STATION_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'defib_station_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">Source/HospitalGame/Public/EEDefibrillatorStation.h</span>
                <button
                  onClick={() => copyCode(CODE_DEFIB_STATION_H, 'defib_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'defib_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'defib_h' ? 'Copiado' : 'Copiar DefibrillatorStation.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DEFIB_STATION_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'pharmacy_station_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-teal-400 font-bold">Source/HospitalGame/Private/EEPharmacyStation.cpp</span>
                <button
                  onClick={() => copyCode(CODE_PHARMACY_STATION_CPP, 'pharm_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'pharm_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'pharm_cpp' ? 'Copiado' : 'Copiar PharmacyStation.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400">
                <p>
                  💊 <strong>Estación de Fármacos Server-Authoritative:</strong> Al interactuar con la estantería o mesa de preparación, el servidor ejecuta <code>Interact_Implementation</code>, valida al médico y equipa el insumo o medicamento asignado (<code>ProvidedDrugType</code>).
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-teal-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_PHARMACY_STATION_CPP}</code>
              </pre>
            </div>
          )}

          {activeTab === 'pharmacy_station_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-teal-400 font-bold">Source/HospitalGame/Public/EEPharmacyStation.h</span>
                <button
                  onClick={() => copyCode(CODE_PHARMACY_STATION_H, 'pharm_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'pharm_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'pharm_h' ? 'Copiado' : 'Copiar PharmacyStation.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-teal-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_PHARMACY_STATION_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'doctor_char_h' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold">Source/HospitalGame/Public/EEMedicalCharacter.h</span>
                <button
                  onClick={() => copyCode(CODE_DOCTOR_CHAR_H, 'doc_h')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'doc_h' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'doc_h' ? 'Copiado' : 'Copiar MedicalCharacter.h'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DOCTOR_CHAR_H}</code>
              </pre>
            </div>
          )}

          {activeTab === 'doctor_char_cpp' && (
            <div>
              <div className="p-3 bg-[#181a26] border-b border-[#252838] flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold">Source/HospitalGame/Private/EEMedicalCharacter.cpp</span>
                <button
                  onClick={() => copyCode(CODE_DOCTOR_CHAR_CPP, 'doc_cpp')}
                  className="px-2.5 py-1 rounded bg-[#222738] hover:bg-[#2c3248] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFile === 'doc_cpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'doc_cpp' ? 'Copiado' : 'Copiar MedicalCharacter.cpp'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#131520] border-b border-[#212433] text-xs text-slate-400 space-y-1.5">
                <p>
                  🩺 <strong>Interacción Multijugador:</strong> Raycast en el cliente para feedback inmediato en el HUD y RPC validado en el servidor (<code>Server_Interact</code>) para ejecutar la interfaz <code>IInteractableInterface</code> de forma segura.
                </p>
                <p>
                  📐 <strong>Orientación Procedural de Columna (Tick):</strong> Cuando <code>bIsHoldingItem</code> está activo, calcula el Aim Offset angular con <code>NormalizedDeltaRotator</code> o hacia el torso del paciente en camilla, aplicando <code>FMath::ClampAngle</code> (Pitch [-35°, +35°], Yaw [-50°, +50°]) e interpolación suave continua con <code>FMath::RInterpTo</code> (10.0f). Se replica mediante <code>DOREPLIFETIME_CONDITION(..., COND_SkipOwner)</code> para garantizar 60 FPS estables sin sobrecargar la red.
                </p>
              </div>
              <pre className="p-4 text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed bg-[#0b0c10]">
                <code>{CODE_DOCTOR_CHAR_CPP}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
