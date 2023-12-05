/**
 * @license Highcharts Gantt JS v@product.version@ (@product.date@)
 * @module highcharts/modules/gantt
 * @requires highcharts
 *
 * Gantt series
 *
 * (c) 2016-2021 Lars A. V. Cabrera
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import ArrowSymbols from '../../Extensions/ArrowSymbols.js';
import Connection from '../../Gantt/Connection.js';
import CurrentDateIndication from '../../Extensions/CurrentDateIndication.js';
import GanttChart from '../../Core/Chart/GanttChart.js';
import Navigator from '../../Stock/Navigator/Navigator.js';
import RangeSelector from '../../Stock/RangeSelector/RangeSelector.js';
import Scrollbar from '../../Stock/Scrollbar/Scrollbar.js';
import StaticScale from '../../Extensions/StaticScale.js';
import './pathfinder.src.js';
// Series
import './xrange.src.js';
import GanttSeries from '../../Series/Gantt/GanttSeries.js';
const G: AnyRecord = Highcharts;
// Classes
G.Connection = Connection;
G.GanttChart = GanttChart;
G.ganttChart = GanttChart.ganttChart;
// Compositions
ArrowSymbols.compose(G.SVGRenderer);
CurrentDateIndication.compose(G.Axis, G.PlotLineOrBand);
GanttSeries.compose(G.Axis, G.Chart, G.Series, G.Tick);
StaticScale.compose(G.Axis, G.Chart);
if (!G.Navigator) {
    G.Navigator = Navigator;
    Navigator.compose(G.Axis, G.Chart, G.Series);
}
if (!G.RangeSelector) {
    G.RangeSelector = RangeSelector;
    RangeSelector.compose(G.Axis, G.Chart);
}
if (!G.Scrollbar) {
    G.Scrollbar = Scrollbar;
    Scrollbar.compose(G.Axis);
}
export default Highcharts;
