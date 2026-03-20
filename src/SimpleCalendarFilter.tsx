import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { CalendarFilterProps } from "./types";

const { RangePicker } = DatePicker;
const DISPLAY_FMT = "DD.MM.YYYY";
const API_FMT = "YYYY-MM-DD";

const PLACEHOLDERS: Record<string, [string, string]> = {
  ru: ["Начало", "Конец"],
  en: ["Start", "End"],
  de: ["Start", "Ende"],
  fr: ["Début", "Fin"],
  es: ["Inicio", "Fin"],
  it: ["Inizio", "Fine"],
  ja: ["開始", "終了"],
  ko: ["시작", "끝"],
  zh: ["开始", "结束"],
  pt: ["Início", "Fim"],
  tr: ["Başlangıç", "Bitiş"],
  nl: ["Start", "Einde"],
  pl: ["Początek", "Koniec"],
  uk: ["Початок", "Кінець"],
  ar: ["البداية", "النهاية"],
  fa: ["شروع", "پایان"],
  sk: ["Začiatok", "Koniec"],
  sl: ["Začetek", "Konec"],
  ca: ["Inici", "Fi"],
};

function getDatePickerLocale(loc: string) {
  const base = loc.split("-")[0];
  const ph = PLACEHOLDERS[base] || PLACEHOLDERS.en;
  return {
    lang: {
      locale: loc,
      placeholder: ph[0],
      rangePlaceholder: ph,
    },
    timePickerLocale: { placeholder: "" },
  };
}

export default function SimpleCalendarFilter({
  setDataMask,
  filterState,
}: CalendarFilterProps) {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const locale = dayjs.locale();
  const dpLocale = useMemo(() => getDatePickerLocale(locale), [locale]);

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
      const fromApi = start.add(1, "day").format(API_FMT);
      const toApi = end.add(2, "day").format(API_FMT);
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
        value={dates}
        onChange={handleChange}
        format={DISPLAY_FMT}
        placeholder={dpLocale.lang.rangePlaceholder as [string, string]}
        locale={dpLocale}
        allowClear
      />
    </div>
  );
}
