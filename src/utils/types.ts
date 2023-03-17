export type flow = {
  version: number;
  blocks: (flowBlock | flowFetch | flowRun | flowRequest | flowResponse)[];
};

export type flowBlock = {
  type: "block";
  blockID: string;
  outputVar: string;
};

export type flowFetch = {
  type: "fetch";
  url: string;
  body: object;
};

export type flowRun = {
  type: "run";
  contentToRun: string;
  returnVariable: string;
};

export type flowRequest = {
  type: "request";
};

export type flowResponse = {
  type: "response";
};
