import type { QueryFormData, DataMask } from "@superset-ui/core";

export interface CalendarFilterFormData extends QueryFormData {}

export interface CalendarFilterProps {
  height: number;
  width: number;
  formData: CalendarFilterFormData;
  setDataMask: (dataMask: DataMask) => void;
  filterState: {
    value?: string | [string, string];
    label?: string;
  };
  appSection?: number;
}
