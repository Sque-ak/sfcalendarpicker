import React, { useState, useCallback, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { CalendarFilterProps } from "./types";

const { RangePicker } = DatePicker;
const DISPLAY_FMT = "DD.MM.YYYY";
const API_FMT = "YYYY-MM-DD";

export default function SimpleCalendarFilter({
  setDataMask,
  filterState,
}: CalendarFilterProps) {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    const val = filterState?.value;
    if (!val) return;
    if (Array.isArray(val) && val.length === 2) {
      setDates([dayjs(val[0]), dayjs(val[1])]);
    } else if (typeof val === "string") {
      const d = dayjs(val);
      setDates([d, d]);
    }
  }, []);

  const applyFilter = useCallback(
    (start: Dayjs | null, end: Dayjs | null) => {
      if (!start || !end) {
        setDataMask({ extraFormData: {}, filterState: { value: undefined } });
        return;
      }
      const fromApi = start.format(API_FMT);
      const toApi = end.add(1, "day").format(API_FMT);
      setDataMask({
        extraFormData: { time_range: `${fromApi} : ${toApi}` },
        filterState: {
          value: [start.format(API_FMT), end.format(API_FMT)],
          label: start.isSame(end, "day")
            ? start.format(DISPLAY_FMT)
            : `${start.format(DISPLAY_FMT)} — ${end.format(DISPLAY_FMT)}`,
        },
      });
    },
    [setDataMask],
  );

  const handleChange = useCallback(
    (values: [Dayjs | null, Dayjs | null] | null) => {
      setDates(values);
      if (!values || (!values[0] && !values[1])) {
        applyFilter(null, null);
        return;
      }
      const [s, e] = values;
      if (s && !e) {
        applyFilter(s, s);
      } else if (s && e) {
        applyFilter(s, e);
      }
    },
    [applyFilter],
  );

  return (
    <div style={{ padding: "4px 0" }}>
      <RangePicker
        style={{ width: "100%" }}
        value={dates}
        onChange={handleChange}
        format={DISPLAY_FMT}
        placeholder={["Начало", "Конец"]}
        size="small"
        allowClear
      />
    </div>
  );
}
