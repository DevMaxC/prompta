export type flowComponent =
  | flowBlock
  | flowExtract
  | flowFetch
  | flowAssert
  | flowRequest
  | flowResponse;

export type flow = {
  version: number;
  components: flowComponent[];
};

export type flowBlock = {
  type: "block";
  blockID: string;
  requiredVariables: string[];
  outputVar: string;
};

export type flowFetch = {
  type: "fetch";
  url: string;
  variablesToSerialize: string[];
  responseVariablesToSave: string[];
};

export type flowAssert = {
  type: "assert";
  outputVar: string;
  outputValue: string;
};

export type flowExtract = {
  type: "extract";
  variable: string;
  starter: string;
  ender: string;
  outputVar: string;
};

export type flowRequest = {
  type: "request";
  incomings: string[];
};

export type flowResponse = {
  type: "response";
  outgoings: string[];
};
