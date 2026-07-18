import { InputProps } from '@strapi/strapi/admin';
import { Schema } from '@strapi/types';
import * as React from 'react';
interface UIDInputProps extends Omit<InputProps, 'type'> {
    attribute?: Pick<Schema.Attribute.UIDProperties, 'regex'>;
    type: Schema.Attribute.TypeOf<Schema.Attribute.UID>;
}
declare const MemoizedUIDInput: React.MemoExoticComponent<React.ForwardRefExoticComponent<UIDInputProps & React.RefAttributes<any>>>;
export { MemoizedUIDInput as UIDInput };
export type { UIDInputProps };
