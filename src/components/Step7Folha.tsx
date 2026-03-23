import React from 'react';
import { AppState } from '../types';
import { Layout } from './Layout';
import { AlertTriangle } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onNext: () => void;
  onBack: () => void;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

export function Step7Folha({ state, updateState, onNext, onBack, viewMode, setViewMode }: Props) {
  const formatNum = (num: number | '') => num === '' ? '-' : Number(num).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  const totalRem = Number(state.remLeft) + Number(state.remCenter) + Number(state.remRight);
  const totalCurrent = Number(state.currentLeft) + Number(state.currentCenter) + Number(state.currentRight);
  const totalReq = Number(state.distributionLeft) + Number(state.distributionCenter) + Number(state.distributionRight);

  const addedLbs = Math.max(0, totalCurrent - totalRem);
  const calcGallons = Number(state.density) > 0 ? Math.round(addedLbs / Number(state.density)) : 0;
  const meterTotal = (state.meters || []).reduce((acc: number, curr) => acc + (Number(curr) || 0), 0);
  const actualDifference = Math.abs(calcGallons - Number(meterTotal));
  const allowableDifference = 750;

  const isExceeded = actualDifference > allowableDifference;
  const excessGallons = isExceeded ? actualDifference - allowableDifference : 0;
  const excessLbs = isExceeded ? excessGallons * Number(state.density) : 0;

  const handleSuggestNewSheet = () => {
    if (!isExceeded) return;

    const densityVal = Number(state.density) || 0;
    
    // O objetivo é que: (TotalReq - TotalRem) / Density = meterTotal
    // Logo: TotalRem = TotalReq - (meterTotal * Density)
    const idealTotalRem = (totalReq as number) - ((meterTotal as number) * (densityVal as number));
    
    // Arredondando o TOTAL para a centena mais próxima para manter a regra centesimal
    const targetTotalRem = Math.round(idealTotalRem / 100) * 100;
    
    // Tanque central sempre vazio na sugestão
    const newRemCenter = 0;
    
    // Distribuição nas asas
    const half = targetTotalRem / 2;
    let newRemLeft: number, newRemRight: number;
    
    if (half % 100 === 0) {
      // Divisão exata (ex: 20.800 / 2 = 10.400)
      newRemLeft = half;
      newRemRight = half;
    } else {
      // Divisão com sobra de 50 (ex: 20.700 / 2 = 10.350)
      // Um tanque recebe +50 e outro -50 para manter o total e ser centesimal
      newRemLeft = Math.ceil(half / 100) * 100;  // 10.400
      newRemRight = Math.floor(half / 100) * 100; // 10.300
    }

    updateState({
      remLeft: newRemLeft,
      remCenter: newRemCenter,
      remRight: newRemRight,
      // Sincroniza os valores atuais com a distribuição requerida para garantir consistência
      currentLeft: Number(state.distributionLeft) || 0,
      currentCenter: Number(state.distributionCenter) || 0,
      currentRight: Number(state.distributionRight) || 0
    });
    
    // Removido o onBack() para permanecer na folha e ver o resultado reajustado
  };

  return (
    <Layout subtitle="FOLHA" onBack={onBack} onNext={onNext} nextLabel="FECHAR" viewMode={viewMode} setViewMode={setViewMode}>
      <div className="flex-1 flex flex-col p-4 md:p-8 w-full bg-white print:p-0">
        
        {/* Table Section */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800">
                <th className="text-left p-2 text-[10px] font-bold text-slate-800 uppercase align-bottom">TANK</th>
                <th className="text-right p-2 text-[10px] font-bold text-slate-800 uppercase">
                  <div className="flex flex-col">
                    <span>GAUGE READING</span>
                    <span>BEFORE FUELING</span>
                  </div>
                </th>
                <th className="text-right p-2 text-[10px] font-bold text-slate-800 uppercase">
                  <div className="flex flex-col">
                    <span>GAUGE READING</span>
                    <span>AFTER FUELING</span>
                  </div>
                </th>
                <th className="text-right p-2 text-[10px] font-bold text-slate-800 uppercase">
                  <div className="flex flex-col">
                    <span>GAUGE REQUIRED QTY.</span>
                    <span>-LBS- (GATE RELEASE)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-base text-slate-700 font-mono">
              <tr className="border-b border-slate-100">
                <td className="p-3 font-sans font-bold">L</td>
                <td className="p-3 text-right">{formatNum(state.remLeft)}</td>
                <td className="p-3 text-right">{formatNum(state.currentLeft)}</td>
                <td className="p-3 text-right">{formatNum(state.distributionLeft)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-sans font-bold">C</td>
                <td className="p-3 text-right">{formatNum(state.remCenter)}</td>
                <td className="p-3 text-right">{formatNum(state.currentCenter)}</td>
                <td className="p-3 text-right">{formatNum(state.distributionCenter)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-sans font-bold">R</td>
                <td className="p-3 text-right">{formatNum(state.remRight)}</td>
                <td className="p-3 text-right">{formatNum(state.currentRight)}</td>
                <td className="p-3 text-right">{formatNum(state.distributionRight)}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="p-3 font-sans">TOTAL</td>
                <td className="p-3 text-right">{formatNum(totalRem)}</td>
                <td className="p-3 text-right">{formatNum(totalCurrent)}</td>
                <td className="p-3 text-right">{formatNum(totalReq)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculations Section - Redesigned for "Print" look */}
        <div className="space-y-4 font-sans">
          
          <div className="flex items-end gap-2">
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap uppercase">AFTER TOTAL LBS MINUS BEFORE TOTAL LBS</span>
            <div className="flex-1 border-b border-dotted border-slate-400 mb-1"></div>
            <span className="text-lg font-mono font-bold text-slate-900">{formatNum(addedLbs)}</span>
            <span className="text-[10px] font-bold text-slate-500 w-16">POUNDS</span>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap uppercase">DIVIDED BY ACTUAL DENSITY ({state.density || '0.00'})</span>
            <div className="flex-1 border-b border-dotted border-slate-400 mb-1"></div>
            <span className="text-lg font-mono font-bold text-slate-900">{formatNum(calcGallons)}</span>
            <span className="text-[10px] font-bold text-slate-500 w-16">GALLONS</span>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap uppercase">GALLONS ADDED FROM EQUIPMENT METER</span>
            <div className="flex-1 border-b border-dotted border-slate-400 mb-1"></div>
            <span className="text-lg font-mono font-bold text-slate-900">{formatNum(meterTotal)}</span>
            <span className="text-[10px] font-bold text-slate-500 w-16">GALLONS</span>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap uppercase">ACTUAL DIFFERENCE</span>
            <div className="flex-1 border-b border-dotted border-slate-400 mb-1"></div>
            <span className={`text-lg font-mono font-bold ${isExceeded ? 'text-red-600 underline decoration-double' : 'text-slate-900'}`}>
              {formatNum(actualDifference)}
            </span>
            <span className="text-[10px] font-bold text-slate-500 w-16">GALLONS</span>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap uppercase">ALLOWABLE DIFFERENCE</span>
            <div className="flex-1 border-b border-dotted border-slate-400 mb-1"></div>
            <span className="text-lg font-mono font-bold text-slate-900">{formatNum(allowableDifference)}</span>
            <span className="text-[10px] font-bold text-slate-500 w-16">GALLONS</span>
          </div>
          
          {isExceeded && (
            <div className="bg-red-50 border border-red-500 p-4 mt-6">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <AlertTriangle size={20} />
                <span className="text-sm font-bold uppercase">Atenção: Diferença Excedida!</span>
              </div>
              <p className="text-xs text-red-600 mb-3 uppercase font-bold">
                A diferença atual excede a tolerância permitida de {allowableDifference} galões.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-700">
                <div className="flex gap-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase block opacity-70">Galões Excedentes</span>
                    <span className="text-xl font-mono font-bold">{formatNum(excessGallons)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase block opacity-70">Em Libras (LBS)</span>
                    <span className="text-xl font-mono font-bold">{formatNum(excessLbs)}</span>
                  </div>
                </div>
                <button
                  onClick={handleSuggestNewSheet}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-none text-xs uppercase tracking-widest transition-colors shadow-sm"
                >
                  Sugerir Nova Folha
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
