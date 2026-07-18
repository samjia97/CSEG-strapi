import { UseDocument } from '../../../hooks/useDocument';
import { EditFieldLayout } from '../../../hooks/useDocumentLayout';
import { Schema } from '@strapi/types';
import { DistributiveOmit } from 'react-redux';
import * as React from 'react';
type InputRendererProps = DistributiveOmit<EditFieldLayout, 'size'> & {
    document: ReturnType<UseDocument>;
};
declare const useFieldHint: (hint: React.ReactNode, attribute: Schema.Attribute.AnyAttribute) => string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element | (string | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | import("react/jsx-runtime").JSX.Element)[] | null | undefined;
/**
 * Conditionally routes the exported InputRender component towards ConditionalInputRenderer
 * (when there's a JSON logic condition on the attribute, or BaseInputRenderer otherwise.
 * We do this because rendering a conditional field requires access to the values of
 * other form fields, which causes many re-renders and performance issues on complex content
 * types. By splitting the component into two, we isolate the performance issue to
 * conditional fields only, not all edit view fields.
 */
declare const MemoizedInputRenderer: React.MemoExoticComponent<(props: InputRendererProps) => import("react/jsx-runtime").JSX.Element>;
export type { InputRendererProps };
export { MemoizedInputRenderer as InputRenderer, useFieldHint };
