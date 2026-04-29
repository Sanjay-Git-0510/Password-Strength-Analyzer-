import { useState, useCallback, useRef } from 'react';
import { analyzePassword as apiAnalyze } from '../utils/api';
import zxcvbn from 'zxcvbn';

function charsetSize(p) {
  let s = 0;
  if (/[a-z]/.test(p)) s += 26;
  if (/[A-Z]/.test(p)) s += 26;
  if (/\d/.test(p))    s += 10;
  if (/[^a-zA-Z\d]/.test(p)) s += 32;
  return s || 26;
}

export function usePasswordAnalyzer() {
  const [password,         setPasswordState] = useState('');
  const [showPassword,     setShowPassword]  = useState(false);
  const [result,           setResult]        = useState(null);
  const [loading,          setLoading]       = useState(false);
  const [error,            setError]         = useState(null);
  const [realtimeStrength, setRTS]           = useState(null);
  const debRef = useRef(null);

  const runAnalysis = useCallback(async (pwd) => {
    if (!pwd) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiAnalyze(pwd);
      setResult(data.data);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot reach the backend server. Make sure it is running on port 5000.');
      } else {
        setError('Analysis failed. Please try again.');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setPassword = useCallback((val) => {
    setPasswordState(val);
    setError(null);

    if (!val) {
      setRTS(null);
      setResult(null);
      return;
    }

    const z = zxcvbn(val);
    setRTS({
      score:       z.score,
      entropy:     Math.log2(Math.max(z.guesses, 1)),
      charsetSize: charsetSize(val),
      length:      val.length,
    });

    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => runAnalysis(val), 650);
  }, [runAnalysis]);

  const analyze = useCallback(() => {
    if (debRef.current) clearTimeout(debRef.current);
    runAnalysis(password);
  }, [password, runAnalysis]);

  return {
    password, setPassword,
    showPassword, setShowPassword,
    result, loading, error,
    realtimeStrength,
    analyze,
  };
}