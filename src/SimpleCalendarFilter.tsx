/**
 * Filter plugin that renders a simple antd DatePicker / RangePicker
 * and emits time_range via setDataMask.
 */
import React, { useCallback } from "react";
import { DatePicker } from "antd";
import { styled } from "@superset-ui/core";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { CalendarFilterProps } from "./types";

const { RangePicker } = DatePicker;

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.gridUnit * 2}px 0;
  & .ant-picker {
    width: 100%;
  }
`;

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
      <Wrapper>
        <RangePicker
          value={rangeVal}
          onChange={handleRangeChange}
          format={dateFormat}
          allowClear
        />
      </Wrapper>
    );
  }

  const singleVal =
    typeof filterState?.value === "string" ? dayjs(filterState.value) : null;

  return (
    <Wrapper>
      <DatePicker
        value={singleVal}
        onChange={handleSingleChange}
        format={dateFormat}
        allowClear
      />
    </Wrapper>
  );
}
