"use client";

import { useTranslations } from "next-intl";

type Duration = {
    hours: number;
    minutes: number;
    seconds: number;
};

export function pretty_duration(contentDuration: Duration) {

    const t = useTranslations();

    return [
      t("common.dates.hours", { count: contentDuration.hours }),
      t("common.dates.minutes", { count: contentDuration.minutes }),
      t("common.dates.seconds", { count: contentDuration.seconds }),
    ].join(" ");
  }

    // Inspired by https://blog.bitsrc.io/calculate-the-difference-between-two-2-dates-e1d76737c05a
  // My version includes some improvements in the codebase & changes to fit my needs
  export function calcDate(date1: string) {

    const t = useTranslations();

    //new date instance
    const dt_date1 = new Date(date1);
    const dt_date2 = new Date();

    //Get the Timestamp
    const date1_time_stamp = dt_date1.getTime();
    const date2_time_stamp = dt_date2.getTime();

    let calc;

    //Check which timestamp is greater
    if (date1_time_stamp > date2_time_stamp) {
      calc = new Date(date1_time_stamp - date2_time_stamp);
    } else {
      calc = new Date(date2_time_stamp - date1_time_stamp);
    }
    //Retrieve the date, month and year
    const calcFormatTmp =
      calc.getDate() + "-" + (calc.getMonth() + 1) + "-" + calc.getFullYear();
    //Convert to an array and store
    const calcFormat = calcFormatTmp.split("-");
    //Subtract each member of our array from the default date
    const days_passed = Number(Math.abs(Number(calcFormat[0])) - 1);
    const months_passed = Number(Math.abs(Number(calcFormat[1])) - 1);
    const years_passed = Number(Math.abs(Number(calcFormat[2])) - 1970);

    //Convert to days and sum together
    const total_days =
      years_passed * 365 + months_passed * 30.417 + days_passed;
    const total_secs = total_days * 24 * 60 * 60;
    const total_mins = total_days * 24 * 60;
    const total_hours = total_days * 24;
    const total_weeks = total_days >= 7 ? total_days / 7 : 0;

    //display result with custom text
    const result = [
      t("common.dates.years", { count: years_passed }),
      t("common.dates.months", { count: months_passed }),
      t("common.dates.days", { count: days_passed }),
    ].join(" ");

    //return the result
    return {
      total_days: Math.round(total_days),
      total_weeks: Math.round(total_weeks),
      total_hours: Math.round(total_hours),
      total_minutes: Math.round(total_mins),
      total_seconds: Math.round(total_secs),
      result: result.trim(),
    };
  }