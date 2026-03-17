import { Behavior, ChartMetadata, ChartPlugin } from "@superset-ui/core";
import controlPanel from "./controlPanel";
import transformProps from "./transformProps";
import buildQuery from "./buildQuery";

export default class SimpleCalendarFilterPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery: buildQuery as any,
      controlPanel,
      loadChart: () => import("./SimpleCalendarFilter"),
      metadata: new ChartMetadata({
        behaviors: [Behavior.InteractiveChart, Behavior.NativeFilter],
        description:
          "Simple calendar date picker — select a single date or date range with one click",
        name: "Calendar Date",
        tags: ["filter"],
      }),
      transformProps,
    });
  }
}
