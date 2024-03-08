import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';

export default function Warehouses() {
  const [warehouseRegionInput, setWarehouseRegionInput] = useState('Europe');
  const [warehouseNumberInput, setWarehouseNumberInput] = useState('10');

  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/warehouses', {
      body: JSON.stringify({
        config: appConfig,
        warehouseNumber: warehouseNumberInput,
        warehouseRegion: warehouseRegionInput,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();
    console.log('data', data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <Layout
      description="Type your region into the field below and wait for your warehouses. <br/> Example regions  are 'global', 'Midwestern United States', 'Italy and surrounding countries'."
      setAppConfig={setAppConfig}
      title="Liferay Warehouse Generator"
    >
      <form onSubmit={onSubmit}>
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <FieldString
            defaultValue="Europe"
            inputChange={setWarehouseRegionInput}
            label="Region for Warehouses"
            name="regionName"
            placeholder="Enter a region for your warehouses"
          />

          <FieldString
            defaultValue="10"
            inputChange={setWarehouseNumberInput}
            label="Number of Warehouses"
            name="numberOfWarehouses"
            placeholder="Enter a the number of warehouses to generate"
          />
        </div>

        <FieldSubmit disabled={isLoading} label="Generate Warehouses" />
      </form>

      <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 w-1/2 italic">
        <b>Note:</b> Recently the AI generation of warehouse lists became not
        dependable for GPT 3.5. Because of this, GPT 4.0 Turbo Preview is
        automatically enforced.
      </p>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
