/**
 * 1С-style calendar filter for Superset.
 * Two date pickers (start/end) + quick period buttons.
 */
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DatePicker, Button } from "antd";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import type { Dayjs } from "dayjs";
import type { CalendarFilterProps } from "./types";

dayjs.extend(quarterOfYear);

const DISPLAY_FMT = "DD.MM.YYYY";
const API_FMT = "YYYY-MM-DD";

interface Preset {
  label: string;
  start: Dayjs;
  end: Dayjs;
}

function getPresets(): Preset[] {
  const t = dayjs().startOf("day");
  return [
    { label: "Сегодня", start: t, end: t },
    { label: "Вчера", start: t.subtract(1, "day"), end: t.subtract(1, "day") },
    { label: "Неделя", start: t.startOf("week"), end: t.endOf("week").startOf("day") },
    { label: "Месяц", start: t.startOf("month"), end: t.endOf("month").startOf("day") },
    { label: "Квартал", start: t.startOf("quarter"), end: t.endOf("quarter").startOf("day") },
    { label: "Год", start: t.startOf("year"), end: t.endOf("year").startOf("day") },
    {
      label: "Пр. месяц",
      start: t.subtract(1, "month").startOf("month"),
      end: t.subtract(1, "month").endOf("month").startOf("day"),
    },
  ];
}

const btnStyle: React.CSSProperties = {
  padding: "0 6px",
  fontSize: 11,
  height: 22,
  lineHeight: "22px",
};

export default function SimpleCalendarFilter({
  setDataMask,
  filterState,
}: CalendarFilterProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  /* restore saved state on mount */
  useEffect(() => {
    const val = filterState?.value;
    if (!val) return;
    if (Array.isArray(val) && val.length === 2) {
      setStartDate(dayjs(val[0]));
      setEndDate(dayjs(val[1]));
    } else if (typeof val === "string") {
      setStartDate(dayjs(val));
      setEndDate(dayjs(val));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = useCallback(
    (start: Dayjs | null, end: Dayjs | null) => {
      if (!start || !end) {
        setDataMask({
          extraFormData: {},
          filterState: { value: undefined },
        });
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

  const handleStartChange = useCallback(
    (date: Dayjs | null) => {
      setStartDate(date);
      let eff = endDate;
      if (date && eff && eff.isBefore(date, "day")) {
        eff = date;
        setEndDate(date);
      }
      applyFilter(date, eff);
    },
    [endDate, applyFilter],
  );

  const handleEndChange = useCallback(
    (date: Dayjs | null) => {
      setEndDate(date);
      let eff = startDate;
      if (date && eff && eff.isAfter(date, "day")) {
        eff = date;
        setStartDate(date);
      }
      applyFilter(eff, date);
    },
    [startDate, applyFilter],
  );

  const handlePreset = useCallback(
    (start: Dayjs, end: Dayjs) => {
      setStartDate(start);
      setEndDate(end);
      applyFilter(start, end);
    },
    [applyFilter],
  );

  const handleClear = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    applyFilter(null, null);
  }, [applyFilter]);

  const presets = useMemo(() => getPresets(), []);

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        <DatePicker
          style={{ flex: 1 }}
          value={startDate}
          onChange={handleStartChange}
          format={DISPLAY_FMT}
          placeholder="Начало"
          allowClear={false}
          size="small"
        />
        <span style={{ color: "#999", flexShrink: 0 }}>—</span>
        <DatePicker
          style={{ flex: 1 }}
          value={endDate}
          onChange={handleEndChange}
          format={DISPLAY_FMT}
          placeholder="Конец"
          allowClear={false}
          size="small"
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 0" }}>
        {presets.map((p) => (
          <Button
            key={p.label}
            type="link"
            size="small"
            style={btnStyle}
            onClick={() => handlePreset(p.start, p.end)}
          >
            {p.label}
          </Button>
        ))}
        <Button
          type="link"
          size="small"
          danger
          style={btnStyle}
          onClick={handleClear}
        >
          Сброс
        </Button>
      </div>
    </div>
  );
}
