// useMembers — live household members from SQLite.
// visibility: optionally filter to members visible in a specific feature.

import { useEffect, useState } from 'react';

import { getAllMembers, type HouseholdMember } from '@/db/modules/members';

type Visibility = 'tasks' | 'bills' | 'calendar' | 'meals';

const VISIBILITY_KEY: Record<Visibility, keyof HouseholdMember> = {
  tasks: 'show_in_tasks',
  bills: 'show_in_bills',
  calendar: 'show_in_calendar',
  meals: 'show_in_meals',
};

export function useMembers(visibility?: Visibility): HouseholdMember[] {
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  useEffect(() => {
    getAllMembers().then((all) => {
      if (!visibility) {
        setMembers(all);
        return;
      }
      const key = VISIBILITY_KEY[visibility];
      setMembers(all.filter((m) => Boolean(m[key])));
    });
  }, [visibility]);

  return members;
}
