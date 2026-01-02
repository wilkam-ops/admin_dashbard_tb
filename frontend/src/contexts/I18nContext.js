import React, { createContext, useContext, useState } from 'react';
import { getTranslation } from '../lib/translations';

const I18nContext = createContext(null);

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr'); // Default to French
  const t = getTranslation(language);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const value = {
    language,
    changeLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
