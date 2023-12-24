import { months } from "./data";

export const formatedDate = (date: string | undefined) => {
  const month: string | undefined = date?.split("-")[1];
  return date
    ?.split("-")
    .map((elem, index) => {
      if (index !== 1) return elem;
      return months[`${month}`];
    })
    ?.reverse()
    .join(" ");
};

export const formatedTime = (time: string | undefined) => {
  return time
    ?.split(":")
    .map((val, ind) => {
      if (ind === 0) return Number(val) + 3;
      return val;
    })
    .join(":");
};
