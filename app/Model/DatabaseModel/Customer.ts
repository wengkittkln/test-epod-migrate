import { CustomerStep } from './CustomerStep';
import { Reason } from './Reason';
import { CustomerConfiguration } from './CustomerConfiguration';

 export interface Customer {
    id?: number;
    customerCode?: string;
    regexPatternValue?: string;
    description?: string;
    tnC?: string;
    customerSteps?: CustomerStep[];
    reasons?: Reason[];
    skuRegexPatternValue?: string;
    customerConfigurations?: CustomerConfiguration[]
  }
  