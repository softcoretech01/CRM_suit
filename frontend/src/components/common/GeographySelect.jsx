import { useState, useEffect, useRef } from 'react';
import { Field } from './Ui';
import { apiFetch } from '../../utils/api';

export default function GeographySelect({
  countryId, stateId, cityId,
  onChange, // onChange(key, value)
  layout = 4, // 4 for col-4, 12 for col-12, etc
  disabled = false
}) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const reqRef = useRef({ stateReq: 0, cityReq: 0 });

  useEffect(() => {
    setLoadingCountries(true);
    apiFetch('/masters/countries')
      .then(res => setCountries(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error("Failed to load countries", err))
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return;
    }
    const reqId = ++reqRef.current.stateReq;
    setLoadingStates(true);
    apiFetch(`/masters/states?country_id=${countryId}`)
      .then(res => {
        if (reqRef.current.stateReq === reqId) setStates(Array.isArray(res) ? res : res.data || []);
      })
      .catch(err => console.error("Failed to load states", err))
      .finally(() => {
        if (reqRef.current.stateReq === reqId) setLoadingStates(false);
      });
  }, [countryId]);

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      return;
    }
    const reqId = ++reqRef.current.cityReq;
    setLoadingCities(true);
    apiFetch(`/masters/cities?state_id=${stateId}`)
      .then(res => {
        if (reqRef.current.cityReq === reqId) setCities(Array.isArray(res) ? res : res.data || []);
      })
      .catch(err => console.error("Failed to load cities", err))
      .finally(() => {
        if (reqRef.current.cityReq === reqId) setLoadingCities(false);
      });
  }, [stateId]);

  const handleCountryChange = (e) => {
    const val = e.target.value;
    const finalVal = val ? (isNaN(Number(val)) ? val : Number(val)) : '';
    onChange('country_id', finalVal);
    onChange('state_id', '');
    onChange('city_id', '');
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    const finalVal = val ? (isNaN(Number(val)) ? val : Number(val)) : '';
    onChange('state_id', finalVal);
    onChange('city_id', '');
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    const finalVal = val ? (isNaN(Number(val)) ? val : Number(val)) : '';
    onChange('city_id', finalVal);
  };

  return (
    <>
      <Field label="Country" col={layout}>
        <select
          className="form-select"
          value={countryId || ''}
          onChange={handleCountryChange}
          disabled={disabled || loadingCountries}
        >
          <option value="">
            {loadingCountries ? 'Loading countries...' : 'Select Country'}
          </option>
          {countries.map(c => <option key={c.id || c.name} value={c.id || c.name}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="State" col={layout}>
        <select
          className="form-select"
          value={stateId || ''}
          onChange={handleStateChange}
          disabled={disabled || !countryId || loadingStates}
        >
          <option value="">
            {loadingStates ? 'Loading states...' :
              !countryId ? 'Select Country First' :
              states.length === 0 ? 'No states available' : 'Select State'}
          </option>
          {states.map(s => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
        </select>
      </Field>

      <Field label="City" col={layout}>
        <select
          className="form-select"
          value={cityId || ''}
          onChange={handleCityChange}
          disabled={disabled || !stateId || loadingCities}
        >
          <option value="">
            {loadingCities ? 'Loading cities...' :
              !stateId ? 'Select State First' :
              cities.length === 0 ? 'No cities available' : 'Select City'}
          </option>
          {cities.map(c => <option key={c.id || c.name} value={c.id || c.name}>{c.name}</option>)}
        </select>
      </Field>
    </>
  );
}
