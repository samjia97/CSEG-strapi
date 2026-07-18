import { InputProps } from '@strapi/strapi/admin';
import { Schema } from '@strapi/types';
import * as React from 'react';
interface BlocksInputProps extends Omit<InputProps, 'type'> {
    labelAction?: React.ReactNode;
    type: Schema.Attribute.Blocks['type'];
}
declare const MemoizedBlocksInput: React.MemoExoticComponent<React.ForwardRefExoticComponent<BlocksInputProps & React.RefAttributes<{
    focus: () => void;
}>>>;
export { MemoizedBlocksInput as BlocksInput };
