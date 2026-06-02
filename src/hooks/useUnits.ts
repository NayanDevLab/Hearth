// useUnits — live measurement units from SQLite.

import { useEffect, useState } from 'react';

import { getAllUnits, type Unit } from '@/db/modules/units';

export function useUnits(): Unit[] {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    getAllUnits().then(setUnits);
  }, []);

  return units;
}
