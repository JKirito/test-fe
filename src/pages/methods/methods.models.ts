export interface IMethodCardLink {
  title: string;
  children: { title: string; url: string }[];
}

export interface IMethodCardUser {
  firstName: string;
  lastName: string;
}

export interface IMethodCard {
  title: string;
  id?: string;
  nodeId?: string;
  description?: string;
  nodeType?: string;
  order?: number;
  showIndex?: boolean;
  numberOnly?: boolean;
  users?: IMethodCardUser[];
  links?: IMethodCardLink[];
  children?: IMethodCard[];
  // Additional properties that might be useful
  createdAt?: string;
  experts?: any[];
  originalFiles?: any[];
  originalExperts?: any[];
}
