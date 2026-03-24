'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { brandData } from '@/lib/pricing';
import { trackEvent } from '@/lib/firebase';
import type { Device, EstimateStep } from '@/types';

const steps: EstimateStep[] = [
  { step: 1, title: 'เลือกยี่ห้อ', completed: false, current: true },
  { step: 2, title: 'เลือกรุ่น', completed: false, current: false },
  { step: 3, title: 'เลือกความจุ', completed: false, current: false },
  { step: 4, title: 'เลือกสภาพ', completed: false, current: false },
];

const conditionOptions = [
  {
    value: 'good',
    title: 'สภาพดี',
    description: 'ใช้งานปกติ รอยขีดข่วนเล็กน้อย',
    icon: '✨',
    color: 'text-primary-green'
  },
  {
    value: 'fair',
    title: 'สภาพปานกลาง',
    description: 'มีรอยใช้งานบ้าง แต่ทำงานได้ปกติ',
    icon: '📱',
    color: 'text-accent-gold'
  },
  {
    value: 'bad',
    title: 'สภาพทั่วไป',
    description: 'มีรอยใช้งาน หรือเสียหายเล็กน้อย',
    icon: '🔧',
    color: 'text-accent-orange'
  },
];

export default function EstimatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [device, setDevice] = useState<Partial<Device>>({
    brand: '',
    model: '',
    storage: '',
    condition: undefined,
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableStorage, setAvailableStorage] = useState<string[]>([]);

  useEffect(() => {
    trackEvent('estimate_started', { page: 'estimate' });
  }, []);

  const updateSteps = (step: number) => {
    const newSteps = steps.map((s, index) => ({
      ...s,
      completed: index < step - 1,
      current: index === step - 1,
    }));
    return newSteps;
  };

  const handleBrandSelect = (brand: string) => {
    const brandInfo = brandData.find(b => b.name === brand);
    if (brandInfo) {
      setDevice(prev => ({ ...prev, brand, model: '', storage: '' }));
      setAvailableModels(brandInfo.models);
      setCurrentStep(2);
    }
  };

  const handleModelSelect = (model: string) => {
    const brandInfo = brandData.find(b => b.name === device.brand);
    if (brandInfo) {
      setDevice(prev => ({ ...prev, model, storage: '' }));
      setAvailableStorage(brandInfo.storageOptions);
      setCurrentStep(3);
    }
  };

  const handleStorageSelect = (storage: string) => {
    setDevice(prev => ({ ...prev, storage }));
    setCurrentStep(4);
  };

  const handleConditionSelect = (condition: 'good' | 'fair' | 'bad') => {
    const completeDevice = { ...device, condition } as Device;
    setDevice(completeDevice);
    
    // Store device data and navigate to result page
    localStorage.setItem('selectedDevice', JSON.stringify(completeDevice));
    trackEvent('estimate_completed', { 
      brand: completeDevice.brand,
      model: completeDevice.model,
      storage: completeDevice.storage,
      condition: completeDevice.condition
    });
    router.push('/result');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setDevice(prev => ({ ...prev, model: '', storage: '' }));
        setAvailableModels([]);
      } else if (currentStep === 3) {
        setDevice(prev => ({ ...prev, storage: '' }));
        setAvailableStorage([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Turn2Cash
            </Link>
            <Link href="/" className="text-neutral-text-secondary hover:text-neutral-text-primary">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {updateSteps(currentStep).map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className={`progress-step ${
                  step.completed ? 'completed' : step.current ? 'current' : ''
                }`}>
                  {step.completed ? '✓' : step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step.completed ? 'bg-primary-green' : 'bg-neutral-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center text-neutral-text-primary mb-2">
            {steps[currentStep - 1]?.title}
          </h1>
          
          <div className="text-center text-neutral-text-secondary">
            ขั้นตอนที่ {currentStep} จาก {steps.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Step 1: Brand Selection */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-6 text-center">เลือกยี่ห้อมือถือของคุณ</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {brandData.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandSelect(brand.name)}
                    className={`device-card text-left ${
                      device.brand === brand.name ? 'selected' : ''
                    }`}
                  >
                    <div className="text-3xl mb-3">
                      {brand.name === 'Apple' ? '🍎' : brand.name === 'Samsung' ? '📱' : '📞'}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                    <p className="text-sm text-neutral-text-secondary">
                      {brand.models.length} รุ่น
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Model Selection */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handleBack} className="btn-ghost">
                  ← ย้อนกลับ
                </button>
                <h2 className="text-xl font-semibold">เลือกรุ่น {device.brand}</h2>
                <div />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    className={`device-card text-left ${
                      device.model === model ? 'selected' : ''
                    }`}
                  >
                    <div className="text-2xl mb-3">📱</div>
                    <h3 className="text-lg font-semibold">{model}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Storage Selection */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handleBack} className="btn-ghost">
                  ← ย้อนกลับ
                </button>
                <h2 className="text-xl font-semibold">เลือกความจุ {device.model}</h2>
                <div />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableStorage.map((storage) => (
                  <button
                    key={storage}
                    onClick={() => handleStorageSelect(storage)}
                    className={`device-card text-center ${
                      device.storage === storage ? 'selected' : ''
                    }`}
                  >
                    <div className="text-2xl mb-3">💾</div>
                    <h3 className="text-lg font-semibold">{storage}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Condition Selection */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handleBack} className="btn-ghost">
                  ← ย้อนกลับ
                </button>
                <h2 className="text-xl font-semibold">เลือกสภาพมือถือ</h2>
                <div />
              </div>
              
              <div className="space-y-4">
                {conditionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleConditionSelect(option.value as 'good' | 'fair' | 'bad')}
                    className="w-full device-card text-left"
                  >
                    <div className="flex items-center">
                      <div className={`text-3xl mr-4 ${option.color}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                        <p className="text-neutral-text-secondary">{option.description}</p>
                      </div>
                      <div className="text-primary-green text-xl">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Device Summary */}
        {currentStep > 1 && (
          <div className="mt-6 bg-primary-green-light rounded-lg p-4 border border-primary-green">
            <div className="text-sm font-semibold text-primary-green mb-2">เลือกแล้ว:</div>
            <div className="text-neutral-text-primary">
              {device.brand} {device.model} {device.storage} 
              {device.condition && ` - สภาพ${conditionOptions.find(c => c.value === device.condition)?.title}`}
            </div>
          </div>
        )}
      </div>
      
      {/* Help Section */}
      <div className="bg-white border-t border-neutral-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold mb-4">ต้องการความช่วยเหลือ?</h3>
          <p className="text-neutral-text-secondary mb-4">
            ไม่แน่ใจเรื่องรุ่นหรือสภาพมือถือ? เราพร้อมช่วยเหลือคุณ
          </p>
          <button className="btn-outline">
            ติดต่อเรา
          </button>
        </div>
      </div>
    </div>
  );
}