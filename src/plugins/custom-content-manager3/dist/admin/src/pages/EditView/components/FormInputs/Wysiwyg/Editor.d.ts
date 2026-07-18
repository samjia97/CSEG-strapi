import { EditorFromTextArea } from 'codemirror5';
import { FieldValue, InputProps } from '@strapi/strapi/admin';
import * as React from 'react';
interface EditorApi {
    focus: () => void;
    scrollIntoView: (args?: Parameters<HTMLElement['scrollIntoView']>[0]) => void;
}
interface EditorProps extends Omit<FieldValue, 'initialValue'>, Omit<InputProps, 'type' | 'label'> {
    editorRef: React.MutableRefObject<EditorFromTextArea>;
    isPreviewMode?: boolean;
    isExpandMode?: boolean;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}
declare const Editor: React.ForwardRefExoticComponent<EditorProps & React.RefAttributes<EditorApi>>;
export { Editor };
export type { EditorProps, EditorApi };
