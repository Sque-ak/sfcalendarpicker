/**
 * Filter plugin that renders a simple antd DatePicker / RangePicker
 * and emits time_range via setDataMask.
 */
import React, { useCallback } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { CalendarFilterProps } from "./types";

const { RangePicker } = DatePicker;

const wrapperStyle: React.CSSProperties = {
  padding: "8px 0",
};

const pickerStyle: React.CSSProperties = {
  width: "100%",
};

export default function SimpleCalendarFilter({
  setDataMask,
  filterState,
  formData,
}: CalendarFilterProps) {
  const { mode = "single", dateFormat = "YYYY-MM-DD" } = formData;

  /* ── single date ── */
  const handleSingleChange = useCallback(
    (date: Dayjs | null) => {
      if (!date) {
        setDataMask({
          extraFormData: {},
          filterState: { value: undefined },
        });
        return;
      }
      const from = date.format("YYYY-MM-DD");
      const to = date.add(1, "day").format("YYYY-MM-DD");
      setDataMask({
        extraFormData: { time_range: `${from} : ${to}` },
        filterState: {
          value: from,
          label: date.format(dateFormat),
        },
      });
    },
    [setDataMask, dateFormat],
  );

  /* ── date range ── */
  const handleRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates || !dates[0] || !dates[1]) {
        setDataMask({
          extraFormData: {},
          filterState: { value: undefined },
        });
        return;
      }
      const from = dates[0].format("YYYY-MM-DD");
      const to = dates[1].add(1, "day").format("YYYY-MM-DD");
      setDataMask({
        extraFormData: { time_range: `${from} : ${to}` },
        filterState: {
          value: [dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")],
          label: `${dates[0].format(dateFormat)} — ${dates[1].format(dateFormat)}`,
        },
      });
    },
    [setDataMask, dateFormat],
  );

  /* ── render ── */
  if (mode === "range") {
    const val = filterState?.value;
    const rangeVal: [Dayjs, Dayjs] | null = Array.isArray(val)
      ? [dayjs(val[0]), dayjs(val[1])]
      : null;
    return (
      <div style={wrapperStyle}>
        <RangePicker
          style={pickerStyle}
          value={rangeVal}
          onChange={handleRangeChange}
          format={dateFormat}
          allowClear
        />
      </div>
    );
  }

  const singleVal =
    typeof filterState?.value === "string" ? dayjs(filterState.value) : null;

  return (
    <div style={wrapperStyle}>
      <DatePicker
        style={pickerStyle}
        value={singleVal}
        onChange={handleSingleChange}
        format={dateFormat}
        allowClear
      />
    </div>
  );
}
