import { FieldContentSourceMap } from '@strapi/strapi/admin';
import { UseDocument } from '../../hooks/useDocument';
import { EditLayout } from '../../hooks/useDocumentLayout';
import { Schema } from '@strapi/types';
import * as React from 'react';
interface PopoverField extends FieldContentSourceMap {
    position: DOMRect;
    attribute: Schema.Attribute.AnyAttribute;
}
interface PreviewContextValue {
    url: string;
    title: string;
    document: NonNullable<ReturnType<UseDocument>['document']>;
    meta: NonNullable<ReturnType<UseDocument>['meta']>;
    schema: NonNullable<ReturnType<UseDocument>['schema']>;
    components: NonNullable<ReturnType<UseDocument>['components']>;
    layout: EditLayout;
    onPreview: () => void;
    iframeRef: React.RefObject<HTMLIFrameElement>;
    popoverField: PopoverField | null;
    setPopoverField: (value: PopoverField | null) => void;
}
declare const usePreviewContext: <Selected, ShouldThrow extends boolean = true>(consumerName: string, selector: (value: PreviewContextValue) => Selected, shouldThrowOnMissingContext?: ShouldThrow | undefined) => ShouldThrow extends true ? Selected : Selected | undefined;
declare const ProtectedPreviewPage: () => import("react/jsx-runtime").JSX.Element;
export { ProtectedPreviewPage, usePreviewContext };
export type { PreviewContextValue };
