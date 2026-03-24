/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, initialState } from './types';
import { Dashboard } from './components/Dashboard';
import { Step7Folha } from './components/Step7Folha';

export default function App() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<AppState>(initialState);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);
  const reset = () => {
    setState(initialState);
    setStep(1);
  };

  return (
    <div className={`min-h-screen bg-slate-100 ${viewMode === 'mobile' ? 'force-landscape-mobile' : ''}`}>
      <Dashboard 
        state={state} 
        updateState={updateState} 
        onGenerate={() => {}} 
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
}
