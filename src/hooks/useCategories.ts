// useCategories — live categories from SQLite, optionally filtered by area.
// area: 'tasks' | 'money' | 'meals' | 'maintenance' | 'calendar' | undefined (all)

import { useEffect, useState } from 'react';

import { type Category, getAllCategories } from '@/db/modules/categories';

export function useCategories(area?: string): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories().then((all) => {
      if (!area) {
        setCategories(all);
        return;
      }
      setCategories(
        all.filter((c) =>
          c.areas
            .split(',')
            .map((a) => a.trim())
            .includes(area)
        )
      );
    });
  }, [area]);

  return categories;
}
