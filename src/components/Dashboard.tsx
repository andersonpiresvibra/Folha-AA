import React, { useState } from 'react';
import { AppState } from '../types';
import { Layout } from './Layout';
import { Plane, Droplets, Gauge, Calculator, FileText, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Weight, XCircle } from 'lucide-react';
import { Step7Folha } from './Step7Folha';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onGenerate: () => void;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

const NumericInput = ({ label, value, onChange, placeholder = "0", isDecimal = false, isDensity = false, shouldRoundTo100 = false, onClear }: any) => {
  const [localValue, setLocalValue] = useState(() => {
    if (value === '') return '';
    if (isDensity) return String(value).replace('.', ',');
    return isDecimal ? String(value).replace('.', ',') : Number(value).toLocaleString('pt-BR');
  });

  React.useEffect(() => {
    if (value === '') {
      setLocalValue('');
    } else if (isDensity) {
      setLocalValue(String(value).replace('.', ','));
    } else if (!isDecimal) {
      const formatted = Number(value).toLocaleString('pt-BR');
      if (localValue.replace(/\D/g, '') !== String(value)) {
        setLocalValue(formatted);
      }
    } else {
      const valStr = String(value);
      if (parseFloat(localValue.replace(',', '.')) !== value && localValue !== valStr.replace('.', ',')) {
        setLocalValue(valStr.replace('.', ','));
      }
    }
  }, [value, isDecimal, isDensity]);

  const handleChange = (e: any) => {
    let raw = e.target.value;
    
    if (isDensity) {
      const digits = raw.replace(/\D/g, '').slice(0, 3);
      if (digits === '') {
        setLocalValue('');
        onChange('');
        return;
      }
      
      let formatted = '';
      if (digits.length === 1) {
        formatted = digits + ',';
      } else if (digits.length === 2) {
        formatted = digits[0] + ',' + digits[1];
      } else if (digits.length === 3) {
        formatted = digits[0] + ',' + digits.slice(1);
      }
      
      setLocalValue(formatted);
      
      const numStr = digits.length === 1 ? digits : (digits[0] + '.' + digits.slice(1));
      const num = parseFloat(numStr);
      onChange(isNaN(num) ? '' : num);
    } else if (isDecimal) {
      raw = raw.replace(/[^0-9,]/g, '');
      const parts = raw.split(',');
      if (parts.length > 2) raw = parts[0] + ',' + parts.slice(1).join('');
      
      setLocalValue(raw);
      
      if (raw === '' || raw === ',') {
        onChange('');
      } else {
        const num = parseFloat(raw.replace(',', '.'));
        onChange(isNaN(num) ? '' : num);
      }
    } else {
      const digits = raw.replace(/\D/g, '');
      if (digits === '') {
        setLocalValue('');
        onChange('');
      } else {
        const num = parseInt(digits, 10);
        setLocalValue(num.toLocaleString('pt-BR'));
        onChange(num);
      }
    }
  };

  const handleBlur = () => {
    if (shouldRoundTo100 && value !== '' && !isDecimal) {
      const num = Number(value);
      const rounded = Math.round(num / 100) * 100;
      if (rounded !== num) {
        onChange(rounded);
        setLocalValue(rounded.toLocaleString('pt-BR'));
      }
    }
  };

  const isFilled = value !== '';

  return (
    <div>
      <div className="flex justify-between items-center mb-1 md:mb-2">
        <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">{label}</label>
        {isFilled && onClear && (
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Limpar campo"
          >
            <XCircle size={14} />
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode={isDecimal ? "decimal" : "numeric"}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full p-2 md:p-3 border-2 rounded-none focus:outline-none text-base md:text-xl font-mono text-right font-bold transition-colors pr-8 md:pr-10 ${
            isFilled 
              ? 'border-emerald-500 bg-emerald-100 text-emerald-900 focus:border-emerald-600' 
              : 'border-slate-200 focus:border-blue-500'
          }`}
          placeholder={placeholder}
        />
        {isFilled && (
          <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 size={16} className="text-emerald-600 md:w-5 md:h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export function Dashboard({ state, updateState, onGenerate, viewMode, setViewMode }: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'sheet'>('data');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isRequiredOk = state.distributionLeft !== '' && state.distributionCenter !== '' && state.distributionRight !== '';
  const isRemOk = state.remLeft !== '' && state.remCenter !== '' && state.remRight !== '';
  const isCurrentOk = state.currentLeft !== '' && state.currentCenter !== '' && state.currentRight !== '';
  const isDensityOk = state.density !== '';
  const isMeterOk = (state.meters || []).length > 0 && (state.meters || []).every(m => m !== '');

  const allFieldsFilled = isRequiredOk && isRemOk && isCurrentOk && isDensityOk && isMeterOk;

  const isAnyFieldFilled = 
    state.distributionLeft !== '' || state.distributionCenter !== '' || state.distributionRight !== '' ||
    state.remLeft !== '' || state.remCenter !== '' || state.remRight !== '' ||
    state.currentLeft !== '' || state.currentCenter !== '' || state.currentRight !== '' ||
    state.density !== '' || (state.meters || []).some(m => m !== '');

  const getSum = (a: number | '', b: number | '', c: number | '') => (Number(a) || 0) + (Number(b) || 0) + (Number(c) || 0);
  const reqTotal = getSum(state.distributionLeft, state.distributionCenter, state.distributionRight);
  const remTotal = getSum(state.remLeft, state.remCenter, state.remRight);
  const currentTotal = getSum(state.currentLeft, state.currentCenter, state.currentRight);
  const meterTotalRaw: number = (state.meters || []).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);
  const meterTotal = Math.round(meterTotalRaw);

  const handleAddMeter = () => {
    updateState({ meters: [...(state.meters || []), ''] });
  };

  const handleMeterChange = (index: number, value: number | '') => {
    const newMeters = [...(state.meters || [])];
    newMeters[index] = value;
    updateState({ meters: newMeters });
  };

  const handleClearAll = () => {
    updateState({
      flightNumber: '',
      aircraftPrefix: '',
      aircraftModel: '',
      equipNumber: '',
      operatorInitials: '',
      distributionLeft: '',
      distributionCenter: '',
      distributionRight: '',
      remLeft: '',
      remCenter: '',
      remRight: '',
      currentLeft: '',
      currentCenter: '',
      currentRight: '',
      density: '',
      meters: ['']
    });
    setShowClearConfirm(false);
    setExpandedSections([]);
  };

  const SectionHeader = ({ title, icon: Icon, isOk, sectionId, summary }: any) => {
    const isExpanded = expandedSections.includes(sectionId);
    return (
      <button 
        onClick={() => toggleSection(sectionId)}
        className={`w-full flex items-center justify-between p-4 transition-colors ${isOk ? 'bg-emerald-100 hover:bg-emerald-200' : 'bg-slate-50 hover:bg-slate-100'}`}
      >
        <div className="flex items-center gap-3">
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isOk ? 'text-emerald-800' : 'text-slate-600'}`}>
            <Icon size={18} className={isOk ? 'text-emerald-600' : 'text-slate-500'} /> {title}
            {isOk && <CheckCircle2 size={16} className="text-emerald-600 ml-1" />}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          {summary && (
            <span className={`text-[24px] leading-[19px] font-bold uppercase tracking-wider ${isOk ? 'text-emerald-800' : 'text-slate-600'}`}>
               {summary}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} className={isOk ? 'text-emerald-600' : 'text-slate-400'} /> : <ChevronDown size={20} className={isOk ? 'text-emerald-600' : 'text-slate-400'} />}
        </div>
      </button>
    );
  };

  const handleFillTest = () => {
    updateState({
      flightNumber: 'AA-905',
      aircraftPrefix: 'N772AA',
      aircraftModel: 'B777-200',
      equipNumber: '2104',
      operatorInitials: 'AH',
      distributionLeft: 75000,
      distributionCenter: 50000,
      distributionRight: 75000,
      remLeft: 15000,
      remCenter: 0,
      remRight: 15000,
      currentLeft: 75000,
      currentCenter: 50000,
      currentRight: 75000,
      density: 6.64,
      meters: [25602] // (200000 - 30000) / 6.64 = 25602.4
    });
    setExpandedSections([]);
  };

  const handleFillMaxTolerance = () => {
    updateState({
      flightNumber: 'AA-906',
      aircraftPrefix: 'N788AA',
      aircraftModel: 'B787-8',
      equipNumber: '2104',
      operatorInitials: 'AH',
      distributionLeft: 75000,
      distributionCenter: 50000,
      distributionRight: 75000,
      remLeft: 15000,
      remCenter: 0,
      remRight: 15000,
      currentLeft: 75000,
      currentCenter: 50000,
      currentRight: 75000,
      density: 6.64,
      meters: [24000] // Diferença será ~1602 galões (excede 750)
    });
    setExpandedSections([]);
  };

  const handleFastMode = () => {
    handleFillTest();
    setTimeout(onGenerate, 100);
  };

  return (
    <Layout 
      subtitle={
        <div className="flex justify-between items-center w-full">
          <span>PAINEL DE DADOS</span>
          <span className="text-[24px] leading-[19px] font-bold tracking-widest">{reqTotal > 0 ? reqTotal.toLocaleString('pt-BR') : ''}</span>
        </div>
      } 
      hideFooter 
      viewMode={viewMode} 
      setViewMode={setViewMode}
    >
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-4 ${
              activeTab === 'data' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dados do Abastecimento
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-4 ${
              activeTab === 'sheet' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Visualização da Folha
          </button>
        </div>

        <div className="p-4 md:p-8 space-y-6">
          {activeTab === 'data' ? (
            <>
              {remTotal >= reqTotal && reqTotal > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 uppercase text-sm tracking-wider">Aeronave com Combustível Suficiente</h3>
                      <p className="text-amber-700 text-xs mt-0.5">O remanescente a bordo ({remTotal.toLocaleString('pt-BR')} lbs) já atende ou supera a solicitação ({reqTotal.toLocaleString('pt-BR')} lbs). Abastecimento não é necessário.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-2 gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
                  <Plane className="text-blue-600" size={24} />
                  <span className="hidden md:inline">DADOS DO ABASTECIMENTO</span>
                  <span className="md:hidden">DADOS</span>
                </h2>
              </div>

              {/* REQUERIDO */}
              <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isRequiredOk ? 'border-emerald-300' : 'border-slate-200'}`}>
                <SectionHeader 
                  title="REQUERIDO" 
                  icon={FileText} 
                  isOk={isRequiredOk} 
                  sectionId="required" 
                  summary={reqTotal > 0 ? reqTotal.toLocaleString('pt-BR') : null} 
                />
                
                {expandedSections.includes('required') && (
                  <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2 md:gap-4">
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Asa Esquerda</span><span className="sm:hidden">L</span></>}
                      value={state.distributionLeft} 
                      onChange={(val: any) => updateState({ distributionLeft: val })} 
                      onClear={() => updateState({ distributionLeft: '' })}
                    />
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Tanque Central</span><span className="sm:hidden">C</span></>}
                      value={state.distributionCenter} 
                      onChange={(val: any) => updateState({ distributionCenter: val })} 
                      onClear={() => updateState({ distributionCenter: '' })}
                    />
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Asa Direita</span><span className="sm:hidden">R</span></>}
                      value={state.distributionRight} 
                      onChange={(val: any) => updateState({ distributionRight: val })} 
                      onClear={() => updateState({ distributionRight: '' })}
                    />
                  </div>
                )}
              </section>

              {/* REMANESCENTE */}
              <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isRemOk ? 'border-emerald-300' : 'border-slate-200'}`}>
                <SectionHeader 
                  title="REMANESCENTE" 
                  icon={Gauge} 
                  isOk={isRemOk} 
                  sectionId="rem" 
                  summary={remTotal > 0 ? remTotal.toLocaleString('pt-BR') : null} 
                />
                
                {expandedSections.includes('rem') && (
                  <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2 md:gap-4">
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Asa Esquerda</span><span className="sm:hidden">L</span></>}
                      value={state.remLeft} 
                      onChange={(val: any) => updateState({ remLeft: val })} 
                      onClear={() => updateState({ remLeft: '' })}
                      shouldRoundTo100
                    />
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Tanque Central</span><span className="sm:hidden">C</span></>}
                      value={state.remCenter} 
                      onChange={(val: any) => updateState({ remCenter: val })} 
                      onClear={() => updateState({ remCenter: '' })}
                      shouldRoundTo100
                    />
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Asa Direita</span><span className="sm:hidden">R</span></>}
                      value={state.remRight} 
                      onChange={(val: any) => updateState({ remRight: val })} 
                      onClear={() => updateState({ remRight: '' })}
                      shouldRoundTo100
                    />
                  </div>
                )}
              </section>

              {/* ABASTECIDO */}
              <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isCurrentOk ? 'border-emerald-300' : 'border-slate-200'}`}>
                <SectionHeader 
                  title="ABASTECIDO" 
                  icon={Droplets} 
                  isOk={isCurrentOk} 
                  sectionId="current" 
                  summary={currentTotal > 0 ? currentTotal.toLocaleString('pt-BR') : null} 
                />
                
                {expandedSections.includes('current') && (
                  <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2 md:gap-4">
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Asa Esquerda</span><span className="sm:hidden">L</span></>}
                      value={state.currentLeft} 
                      onChange={(val: any) => updateState({ currentLeft: val })} 
                      onClear={() => updateState({ currentLeft: '' })}
                      shouldRoundTo100
                    />
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Tanque Central</span><span className="sm:hidden">C</span></>}
                      value={state.currentCenter} 
                      onChange={(val: any) => updateState({ currentCenter: val })} 
                      onClear={() => updateState({ currentCenter: '' })}
                      shouldRoundTo100
                    />
                    <NumericInput 
                      label={<><span className="hidden sm:inline">Asa Direita</span><span className="sm:hidden">R</span></>}
                      value={state.currentRight} 
                      onChange={(val: any) => updateState({ currentRight: val })} 
                      onClear={() => updateState({ currentRight: '' })}
                      shouldRoundTo100
                    />
                  </div>
                )}
              </section>

              {/* DENSIDADE - Compacta */}
              <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isDensityOk ? 'border-emerald-300' : 'border-slate-200'}`}>
                <SectionHeader 
                  title="DENSIDADE" 
                  icon={Weight} 
                  isOk={isDensityOk} 
                  sectionId="density" 
                  summary={state.density !== '' ? String(state.density).replace('.', ',') : null} 
                />
                
                {expandedSections.includes('density') && (
                  <div className="p-4 border-t border-slate-100">
                    <div className="max-w-[200px]">
                      <NumericInput 
                        label="LBS/GAL" 
                        value={state.density} 
                        isDensity={true}
                        placeholder="0,00"
                        onChange={(val: any) => updateState({ density: val })} 
                        onClear={() => updateState({ density: '' })}
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* GALÕES DO PRÉ */}
              <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isMeterOk ? 'border-emerald-300' : 'border-slate-200'}`}>
                <SectionHeader 
                  title="GALÕES DO PRÉ" 
                  icon={Calculator} 
                  isOk={isMeterOk} 
                  sectionId="meters" 
                  summary={Number(meterTotal) > 0 ? Number(meterTotal).toLocaleString('pt-BR') : null} 
                />
                
                {expandedSections.includes('meters') && (
                  <div className="p-4 border-t border-slate-100 space-y-4">
                    {(state.meters || []).map((meter, index) => (
                      <NumericInput 
                        key={index}
                        label={`Galão ${index + 1}`} 
                        value={meter} 
                        isDecimal={true}
                        onChange={(val: any) => handleMeterChange(index, val)} 
                        onClear={() => {
                          const newMeters = [...(state.meters || [])];
                          newMeters.splice(index, 1);
                          updateState({ meters: newMeters });
                        }}
                      />
                    ))}
                    <button
                      onClick={handleAddMeter}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-none text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-none bg-slate-200 flex items-center justify-center">
                        <span className="text-lg leading-none mb-0.5">+</span>
                      </div>
                      Adicionar Galão
                    </button>
                  </div>
                )}
              </section>

              <div className="pt-4 pb-8 space-y-4">
                {!isAnyFieldFilled && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <button
                      onClick={handleFillTest}
                      className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Simular OK
                    </button>
                    <button
                      onClick={handleFillMaxTolerance}
                      className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Simular Tolerância Máxima
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    {showClearConfirm ? (
                      <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                        <button
                          onClick={handleClearAll}
                          className="flex-1 bg-red-600 text-white font-bold py-4 text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
                        >
                          Confirmar Limpar
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-6 bg-slate-200 text-slate-600 font-bold py-4 text-sm uppercase tracking-widest hover:bg-slate-300 transition-colors"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="w-full bg-yellow-400 text-yellow-900 font-bold py-4 text-sm uppercase tracking-widest hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Limpar Tudo
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('sheet')}
                    className="flex-1 bg-blue-600 text-white font-bold py-4 text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Somente Folha
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={24} />
                Folha de Rascunho
              </h2>
              <Step7Folha 
                state={state} 
                updateState={updateState} 
                onNext={() => {}} 
                onBack={() => setActiveTab('data')} 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
                isEmbedded={true}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
