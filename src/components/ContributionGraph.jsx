import React, { useEffect, useReducer} from "react";
import { HeatMap } from "../HeatMap.js";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
// import "tippy.js/dist/svg-arrow.css";
import "tippy.js/animations/scale.css";
import { useMemo } from "react";
import { SET_HEATMAP, SET_DAYS_LABEL_TRANSFORM, SET_HEIGHT, SET_WIDTH, reducer } from "../store.js";




const ContributionGraph = ({ endDate, values }) => {
  const initialState = {
    heatmap: new HeatMap(endDate, values),
    width: 0,
    height: 0,
    daysLabelWrapperTransform: "",
    monthsLabelWrapperTransform: "",
    activityColorRules: HeatMap.activityColorRules,
  };


  const [state, dispatch] = useReducer(reducer, initialState);

  const heatmapMemo = useMemo(() => {
    return new HeatMap(endDate, values);
  }, [endDate, values]);

  const SquareGap = HeatMap.squareSize / 5;
  const SquareSizeWithGap = HeatMap.squareSize + SquareGap;
  const LeftSectionWidth = Math.ceil(HeatMap.squareSize * 2.5);
  const TopSectionHeight = HeatMap.squareSize + (HeatMap.squareSize / 2);
  const TopLegendHeight=HeatMap.squareSize-SquareGap

  useEffect(() => {
    dispatch({ type: SET_HEATMAP, payload: new HeatMap(endDate, values) })
    dispatch({ type: SET_WIDTH, payload: LeftSectionWidth + (SquareSizeWithGap * state.heatmap.weekCount) + SquareGap });
    dispatch({ type: SET_HEIGHT, payload: TopSectionHeight + (SquareSizeWithGap * HeatMap.daysInWeek) });
    dispatch({ type: SET_DAYS_LABEL_TRANSFORM, payload: `translate(0 , ${TopSectionHeight})` });
  }, [endDate, heatmapMemo]);







  function getDayOfWeekPositionX() {
    if (HeatMap.infos) return 8;
    return 0;
  }


  function getWeekPosition(index) {
    return `translate(${index * SquareSizeWithGap},0)`
  }

  function getDayPosition(index) {
    return `translate(0,${index * SquareSizeWithGap})`
  }

  function getMonthLabelPosition(month) {
    return { x: SquareSizeWithGap * month.index, y: HeatMap.squareSize }
  }

  useEffect(() => {
    initTippy()
  }, []);

  function initTippy() {
    tippy.setDefaultProps({
      moveTransition: "transform 0.2s ease-in-out",
      allowHTML: true,
      animation: "scale",
    });
  }

  function initTip(event) {
    const target = event.target;

    if (
      target &&
      target.classList.contains("graph__day__square") &&
      target.dataset.weekIndex !== undefined &&
      target.dataset.dayIndex !== undefined
    ) {
      const weekIndex = Number(target.dataset.weekIndex);
      const dayIndex = Number(target.dataset.dayIndex);
      if (isNaN(weekIndex) || isNaN(dayIndex)) return;

      const day = state.heatmap.graph[weekIndex][dayIndex]

      const tooltip = tooltipOptions(day);
      if (tooltip === undefined) return;

      tippy(target, { content: tooltip, trigger: "click" });
    }

  }

  function tooltipOptions(day) {
    if (day.count !== undefined) {
      return (
        `  <div className="tippy__tooltip">
          <b>
            ${day.count} ${HeatMap.infos.defaultTooltipMessage}
          </b></br>
          <div className='tippy__tooltip_date' style={{backgroundColor:'red'}}>
          ${HeatMap.infos.dayOfWeek.get(day.date.getDay())}
          ${HeatMap.infos.months[day.date.getMonth()]}
          ${day.date.getDate()},${day.date.getFullYear()}
          </div>
        </div>`
      );
    }
    return (
      `  <div className="tippy__tooltip">
        <b>${HeatMap.infos.noDataTooltipMessage}</b> <br />
        ${HeatMap.infos.dayOfWeek.get(day.date.getDay())}
        ${HeatMap.infos.months[day.date.getMonth()]}
        ${day.date.getDate()}, ${day.date.getFullYear()}

      </g>`
    );
  }

  function showLegendTip(event) {
    const target = event.target;

    if (
      target &&
      target.classList.contains("graph__legend__square") &&
      target.dataset.item !== undefined
    ) {
      const item = JSON.parse(target.dataset.item);

      let message;

      if (item.min === HeatMap.max)
        message = `${HeatMap.max} + ${HeatMap.infos.defaultTooltipMessage}`;

      else if (item.min === undefined || (item.min === 0 && item.max === 0))
        message = `${HeatMap.infos.noDataTooltipMessage}`;


      else
        message = `${item.min}-${item.max} ${HeatMap.infos.defaultTooltipMessage}`;



      const tooltip = (
        `   <div id="tippy__tooltip">
               <b>${message}</b> <br />
        </div>`
      );

      tippy(target, { content: tooltip, delay:[200,100] });

    }
  }



  return (
    <div className="graph__container" >
      <svg className="graph__wrapper" viewBox="0 0 639 150" >
        <g
          className="graph__months__labels__wrapper"
          transform={state.monthsLabelWrapperTransform}
        >
          {state.heatmap.fullWeekOfMonths?.map((month, index) => (
            <text
              className="graph__month__label"
              key={index}
              x={getMonthLabelPosition(month).x}
              y={getMonthLabelPosition(month).y}
            >
              {HeatMap.infos.months[month.value]}
            </text>

          ))}
        </g>
        <g
          className="graph__days__labels__wrapper"
          transform={state.daysLabelWrapperTransform}
        >
          <text className="graph__day__label" x={getDayOfWeekPositionX()} y={TopLegendHeight}>
            {HeatMap.infos.days[0]}
          </text>
          <text
            className="graph__day__label"
            x={getDayOfWeekPositionX()}
            y={32}
          >
            {HeatMap.infos.days[2]}
          </text>
          <text
            className="graph__day__label"
            x={getDayOfWeekPositionX()}
            y={56}
          >
            {HeatMap.infos.days[4]}
          </text>
        </g>

        <g className="graph__year__wrapper" transform={`translate(${LeftSectionWidth},${TopSectionHeight})`}>
          {state.heatmap.graph.map((week, weekIndex) => (
            <g
              className="graph__month__wrapper"
              key={weekIndex}
              transform={getWeekPosition(weekIndex)}
            >
              {week.map((day, dayIndex) => (
                <g key={dayIndex} onMouseOver={initTip}>
                  <rect
                    className="graph__day__square"
                    transform={getDayPosition(dayIndex)}
                    key={dayIndex}
                    width={HeatMap.squareSize}
                    height={HeatMap.squareSize}
                    fill={HeatMap.colorSet[day.colorIndex]}
                    data-week-index={weekIndex}
                    data-day-index={dayIndex}
                  />
                </g>
              ))}
            </g>
          ))}
        </g>
        <g
          className="graph__external__legend__wrapper"
          height={HeatMap.legendSquareSize}
          transform={`translate(${SquareSizeWithGap *2},${SquareSizeWithGap * 9})`}
        >

          <g className="graph__legend__text"
            transform={`translate(${0},${TopLegendHeight})`}>
            <text >
              {HeatMap.infos.less}
            </text>
          </g>

          <g className="graph__legend__wrapper" onMouseOver={showLegendTip} transform={`translate(${0, SquareSizeWithGap * 3.5})`}>
            {HeatMap.activityColorRules.map((item) => (
              <rect
                className="graph__legend__square"
                key={item.colorIndex}
                fill={HeatMap.colorSet[item.colorIndex]}
                width={HeatMap.squareSize}
                height={HeatMap.squareSize}
                x={SquareSizeWithGap * item.colorIndex}
                data-item={JSON.stringify(item)}
              />
            ))}
          </g>
          <g className="graph__legend__text" transform={`translate(${SquareSizeWithGap * 9},${TopLegendHeight})`}>
            <text >
              {HeatMap.infos.more}
            </text>
          </g>

        </g>
      </svg>



    </div>


  );
};

export default ContributionGraph;


