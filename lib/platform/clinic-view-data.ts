import { cache } from 'react';
import { listAdminClinicsAction } from '@/lib/actions/admin-clinics.actions';

// Share the authorized list within a server render, never between requests.
export const listClinicsForView = cache(listAdminClinicsAction);
