export type UserModel = {
  id: string;
  username: string;
  password: string;
};

export enum FunctionMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
}

export const methodOptions = Object.entries(FunctionMethod).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export type FunctionModel = {
  id: string;
  method: FunctionMethod;
  url: string;
  code: string;
  createdAt?: number;
  modifiedAt?: number;
  size?: number;
};

export type SchedulerModel = {
  id: string;
  name: string;
  frequency: string;
  method: FunctionMethod;
  url: string;
};
