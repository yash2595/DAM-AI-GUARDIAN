import { createContext, useContext, useState, ReactNode } from 'react';

interface Dam {
  value: string;
  label: string;
  location: [number, number]; // [latitude, longitude]
}

interface DamContextType {
  selectedDam: string;
  setSelectedDam: (dam: string) => void;
  getDamLocation: (damValue: string) => [number, number];
  getDamLabel: (damValue: string) => string;
  dams: Dam[];
}

const dams: Dam[] = [
  { value: 'tehri', label: 'Tehri Dam, Uttarakhand', location: [30.3783, 78.4806] },
  { value: 'bhakra', label: 'Bhakra Dam, Himachal Pradesh', location: [31.4104, 76.4378] },
  { value: 'sardar', label: 'Sardar Sarovar Dam, Gujarat', location: [21.8333, 73.7500] },
  { value: 'nagarjuna', label: 'Nagarjuna Sagar Dam, Telangana', location: [16.5744, 79.3117] },
  { value: 'hirakud', label: 'Hirakud Dam, Odisha', location: [21.5329, 83.8766] },
];

const DamContext = createContext<DamContextType | undefined>(undefined);

export const DamProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDam, setSelectedDam] = useState('tehri');

  const getDamLocation = (damValue: string): [number, number] => {
    const dam = dams.find((d) => d.value === damValue);
    return dam?.location || dams[0].location;
  };

  const getDamLabel = (damValue: string): string => {
    const dam = dams.find((d) => d.value === damValue);
    return dam?.label || dams[0].label;
  };

  return (
    <DamContext.Provider
      value={{
        selectedDam,
        setSelectedDam,
        getDamLocation,
        getDamLabel,
        dams,
      }}
    >
      {children}
    </DamContext.Provider>
  );
};

export const useDam = () => {
  const context = useContext(DamContext);
  if (context === undefined) {
    throw new Error('useDam must be used within a DamProvider');
  }
  return context;
};
