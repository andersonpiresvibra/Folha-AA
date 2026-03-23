import React, { useState } from 'react';
import { AppState } from '../types';
import { Layout } from './Layout';
import { Plane, Droplets, Gauge, Calculator, FileText, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onGenerate: () => void;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

const NumericInput = ({ label, value, onChange, placeholder = "0", isDecimal = false, isDensity = false, shouldRoundTo100 = false }: any) => {
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
      <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1 md:mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode={isDecimal ? "decimal" : "numeric"}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full p-2 md:p-3 border-2 rounded-none focus:outline-none text-base md:text-xl font-mono text-right font-bold transition-colors pr-8 md:pr-10 ${
            isFilled 
              ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:border-emerald-600' 
              : 'border-slate-200 focus:border-blue-500'
          }`}
          placeholder={placeholder}
        />
        {isFilled && (
          <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 size={16} className="text-emerald-500 md:w-5 md:h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export function Dashboard({ state, updateState, onGenerate, viewMode, setViewMode }: Props) {
  const [expandedSection, setExpandedSection] = useState<string>('required');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? '' : section);
  };

  const isRequiredOk = state.distributionLeft !== '' && state.distributionCenter !== '' && state.distributionRight !== '';
  const isRemOk = state.remLeft !== '' && state.remCenter !== '' && state.remRight !== '';
  const isCurrentOk = state.currentLeft !== '' && state.currentCenter !== '' && state.currentRight !== '';
  const isDensityOk = state.density !== '';
  const isMeterOk = (state.meters || []).length > 0 && (state.meters || []).every(m => m !== '');

  const allOk = isRequiredOk && isRemOk && isCurrentOk && isDensityOk && isMeterOk;

  const getSum = (a: number | '', b: number | '', c: number | '') => (Number(a) || 0) + (Number(b) || 0) + (Number(c) || 0);
  const reqTotal = getSum(state.distributionLeft, state.distributionCenter, state.distributionRight);
  const remTotal = getSum(state.remLeft, state.remCenter, state.remRight);
  const currentTotal = getSum(state.currentLeft, state.currentCenter, state.currentRight);
  const meterTotal = (state.meters || []).reduce((acc: number, curr) => acc + (Number(curr) || 0), 0);

  const handleAddMeter = () => {
    updateState({ meters: [...(state.meters || []), ''] });
  };

  const handleMeterChange = (index: number, value: number | '') => {
    const newMeters = [...(state.meters || [])];
    newMeters[index] = value;
    updateState({ meters: newMeters });
  };

  const SectionHeader = ({ title, icon: Icon, isOk, sectionId, summary }: any) => {
    const isExpanded = expandedSection === sectionId;
    return (
      <button 
        onClick={() => toggleSection(sectionId)}
        className={`w-full flex items-center justify-between p-4 transition-colors ${isOk ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'bg-slate-50 hover:bg-slate-100'}`}
      >
        <div className="flex items-center gap-3">
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isOk ? 'text-emerald-700' : 'text-slate-600'}`}>
            <Icon size={18} className={isOk ? 'text-emerald-500' : 'text-slate-500'} /> {title}
            {isOk && <CheckCircle2 size={16} className="text-emerald-500 ml-1" />}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          {summary && (
            <span className={`text-[24px] leading-[19px] font-bold uppercase tracking-wider ${isOk ? 'text-emerald-700' : 'text-slate-600'}`}>
               {summary}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} className={isOk ? 'text-emerald-500' : 'text-slate-400'} /> : <ChevronDown size={20} className={isOk ? 'text-emerald-500' : 'text-slate-400'} />}
        </div>
      </button>
    );
  };

  const handleFillTest = () => {
    updateState({
      flightNumber: 'RG-1234',
      aircraftPrefix: 'PR-XMA',
      aircraftModel: 'B737-8',
      equipNumber: '2104',
      operatorInitials: 'AH',
      distributionLeft: 15000,
      distributionCenter: 20000,
      distributionRight: 15000,
      remLeft: 4000,
      remCenter: 4000,
      remRight: 4000,
      currentLeft: 15000,
      currentCenter: 20000,
      currentRight: 15000,
      density: 6.64,
      meters: [5723]
    });
    setExpandedSection('');
  };

  const handleFillError = () => {
    updateState({
      flightNumber: 'RG-1234',
      aircraftPrefix: 'PR-XMA',
      aircraftModel: 'B737-8',
      equipNumber: '2104',
      operatorInitials: 'AH',
      distributionLeft: 15000,
      distributionCenter: 20000,
      distributionRight: 15000,
      remLeft: 4000,
      remCenter: 4000,
      remRight: 4000,
      currentLeft: 15000,
      currentCenter: 20000,
      currentRight: 15000,
      density: 6.64,
      meters: [6500]
    });
    setExpandedSection('');
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
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        
        <div className="flex justify-between items-center mb-2 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
            <Plane className="text-blue-600" size={24} />
            <span className="hidden md:inline">DADOS DO ABASTECIMENTO</span>
            <span className="md:hidden">DADOS</span>
          </h2>
          <button
            onClick={onGenerate}
            className="font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-md transition-all uppercase tracking-wider flex items-center gap-2 text-sm md:text-base bg-slate-200 hover:bg-slate-300 text-slate-600"
          >
            <FileText size={18} />
            Exibir Folha
          </button>
        </div>

        {/* REQUERIDO */}
        <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isRequiredOk ? 'border-emerald-200' : 'border-slate-200'}`}>
          <SectionHeader 
            title="REQUERIDO" 
            icon={FileText} 
            isOk={isRequiredOk} 
            sectionId="required" 
            summary={reqTotal > 0 ? reqTotal.toLocaleString('pt-BR') : null} 
          />
          
          {expandedSection === 'required' && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2 md:gap-4">
              <NumericInput 
                label={<><span className="hidden sm:inline">Asa Esquerda</span><span className="sm:hidden">L</span></>}
                value={state.distributionLeft} 
                onChange={(val: any) => updateState({ distributionLeft: val })} 
                shouldRoundTo100
              />
              <NumericInput 
                label={<><span className="hidden sm:inline">Tanque Central</span><span className="sm:hidden">C</span></>}
                value={state.distributionCenter} 
                onChange={(val: any) => updateState({ distributionCenter: val })} 
                shouldRoundTo100
              />
              <NumericInput 
                label={<><span className="hidden sm:inline">Asa Direita</span><span className="sm:hidden">R</span></>}
                value={state.distributionRight} 
                onChange={(val: any) => updateState({ distributionRight: val })} 
                shouldRoundTo100
              />
            </div>
          )}
        </section>

        {/* REMANESCENTE */}
        <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isRemOk ? 'border-emerald-200' : 'border-slate-200'}`}>
          <SectionHeader 
            title="REMANESCENTE" 
            icon={Gauge} 
            isOk={isRemOk} 
            sectionId="rem" 
            summary={remTotal > 0 ? remTotal.toLocaleString('pt-BR') : null} 
          />
          
          {expandedSection === 'rem' && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2 md:gap-4">
              <NumericInput 
                label={<><span className="hidden sm:inline">Asa Esquerda</span><span className="sm:hidden">L</span></>}
                value={state.remLeft} 
                onChange={(val: any) => updateState({ remLeft: val })} 
                shouldRoundTo100
              />
              <NumericInput 
                label={<><span className="hidden sm:inline">Tanque Central</span><span className="sm:hidden">C</span></>}
                value={state.remCenter} 
                onChange={(val: any) => updateState({ remCenter: val })} 
                shouldRoundTo100
              />
              <NumericInput 
                label={<><span className="hidden sm:inline">Asa Direita</span><span className="sm:hidden">R</span></>}
                value={state.remRight} 
                onChange={(val: any) => updateState({ remRight: val })} 
                shouldRoundTo100
              />
            </div>
          )}
        </section>

        {/* ABASTECIDO */}
        <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isCurrentOk ? 'border-emerald-200' : 'border-slate-200'}`}>
          <SectionHeader 
            title="ABASTECIDO" 
            icon={Droplets} 
            isOk={isCurrentOk} 
            sectionId="current" 
            summary={currentTotal > 0 ? currentTotal.toLocaleString('pt-BR') : null} 
          />
          
          {expandedSection === 'current' && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2 md:gap-4">
              <NumericInput 
                label={<><span className="hidden sm:inline">Asa Esquerda</span><span className="sm:hidden">L</span></>}
                value={state.currentLeft} 
                onChange={(val: any) => updateState({ currentLeft: val })} 
                shouldRoundTo100
              />
              <NumericInput 
                label={<><span className="hidden sm:inline">Tanque Central</span><span className="sm:hidden">C</span></>}
                value={state.currentCenter} 
                onChange={(val: any) => updateState({ currentCenter: val })} 
                shouldRoundTo100
              />
              <NumericInput 
                label={<><span className="hidden sm:inline">Asa Direita</span><span className="sm:hidden">R</span></>}
                value={state.currentRight} 
                onChange={(val: any) => updateState({ currentRight: val })} 
                shouldRoundTo100
              />
            </div>
          )}
        </section>

        {/* DENSIDADE */}
        <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isDensityOk ? 'border-emerald-200' : 'border-slate-200'}`}>
          <SectionHeader 
            title="DENSIDADE" 
            icon={Calculator} 
            isOk={isDensityOk} 
            sectionId="density" 
            summary={state.density !== '' ? String(state.density).replace('.', ',') : null} 
          />
          
          {expandedSection === 'density' && (
            <div className="p-4 border-t border-slate-100">
              <NumericInput 
                label="Densidade (LBS/GAL)" 
                value={state.density} 
                isDensity={true}
                placeholder="0,00"
                onChange={(val: any) => updateState({ density: val })} 
              />
            </div>
          )}
        </section>

        {/* MEDIDORES */}
        <section className={`bg-white rounded-none shadow-sm border overflow-hidden transition-all ${isMeterOk ? 'border-emerald-200' : 'border-slate-200'}`}>
          <SectionHeader 
            title="MEDIDORES" 
            icon={Calculator} 
            isOk={isMeterOk} 
            sectionId="meters" 
            summary={Number(meterTotal) > 0 ? Number(meterTotal).toLocaleString('pt-BR') : null} 
          />
          
          {expandedSection === 'meters' && (
            <div className="p-4 border-t border-slate-100 space-y-4">
              {(state.meters || []).map((meter, index) => (
                <NumericInput 
                  key={index}
                  label={`Medidor ${index + 1}`} 
                  value={meter} 
                  onChange={(val: any) => handleMeterChange(index, val)} 
                />
              ))}
              <button
                onClick={handleAddMeter}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-none text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-none bg-slate-200 flex items-center justify-center">
                  <span className="text-lg leading-none mb-0.5">+</span>
                </div>
                Adicionar Medidor
              </button>
            </div>
          )}
        </section>

        <div className="pt-4 pb-8">
          <button
            onClick={onGenerate}
            className="w-full font-bold text-lg py-4 rounded-none shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText size={22} />
            Exibir Folha
          </button>
        </div>

      </div>
    </Layout>
  );
}
