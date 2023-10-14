export interface IGame {
  competition: {
    name: string;
  };
  utcDate: string;
  matchday: number;
  homeTeam: {
    name: string;
    shortName: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
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
