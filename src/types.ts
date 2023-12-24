import {
  RecurrenceRule,
  RecurrenceSpecDateRange,
  RecurrenceSpecObjLit,
} from "node-schedule";

export interface IGame {
  competition: {
    name: string;
  };
  utcDate:
    | string
    | number
    | Date
    | RecurrenceRule
    | RecurrenceSpecDateRange
    | RecurrenceSpecObjLit;
  status: string;
  matchday: number;
  id: number;
  homeTeam: {
    name: string;
    shortName: string;
    id: number;
  };
  awayTeam: {
    name: string;
    shortName: string;
    id: number;
  };
  score: {
    fullTime: { home: null | number; away: null | number };
  };
}

export interface IScorer {
  player: {
    name: string;
  };
  team: {
    shortName: "Inter";
  };
  goals: number;
  assists: number;
}
export interface IStandings {
  position: number;
  team: {
    id: number;
    name: string;
  };
  points: number;
}
export interface ISquad {
  name: string;
  position: string;
}

export interface IHead2Head {
  resultSet: {
    count: number;
    competitions: string;
    first: string;
    last: string;
  };
  aggregates: {
    numberOfMatches: number;
    totalGoals: number;
    homeTeam: {
      id: number;
      name: string;
      wins: number;
      draws: number;
      losses: number;
    };
    awayTeam: {
      id: number;
      name: string;
      wins: number;
      draws: number;
      losses: number;
    };
  };
}
