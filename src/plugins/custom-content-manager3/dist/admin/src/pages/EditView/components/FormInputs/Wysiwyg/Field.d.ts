import { InputProps } from '@strapi/strapi/admin';
import { EditorApi } from './Editor';
import { Schema } from '@strapi/types';
import * as React from 'react';
interface WysiwygProps extends Omit<InputProps, 'type'> {
    labelAction?: React.ReactNode;
    type: Schema.Attribute.RichText['type'];
}
declare const MemoizedWysiwyg: React.MemoExoticComponent<React.ForwardRefExoticComponent<WysiwygProps & React.RefAttributes<EditorApi>>>;
export { MemoizedWysiwyg as Wysiwyg };
export type { WysiwygProps };
