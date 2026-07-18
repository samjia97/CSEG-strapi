import { EditLayout } from '../../hooks/useDocumentLayout';
import { ContentType, FindContentTypeConfiguration } from '../../../../shared/contracts/content-types';
import { HistoryVersionDataResponse, GetHistoryVersions } from '../../../../shared/contracts/history-versions';
import { UID } from '@strapi/types';
import * as React from 'react';
interface HistoryContextValue {
    contentType: UID.ContentType;
    id?: string;
    layout: EditLayout['layout'];
    configuration: FindContentTypeConfiguration.Response['data'];
    selectedVersion: HistoryVersionDataResponse;
    versions: Extract<GetHistoryVersions.Response, {
        data: Array<HistoryVersionDataResponse>;
    }>;
    page: number;
    mainField: string;
    schema: ContentType;
}
declare const HistoryProvider: {
    (props: HistoryContextValue & {
        children: React.ReactNode;
    }): import("react/jsx-runtime").JSX.Element;
    displayName: string;
}, useHistoryContext: <Selected, ShouldThrow extends boolean = true>(consumerName: string, selector: (value: HistoryContextValue) => Selected, shouldThrowOnMissingContext?: ShouldThrow | undefined) => ShouldThrow extends true ? Selected : Selected | undefined;
declare const ProtectedHistoryPage: () => import("react/jsx-runtime").JSX.Element;
export { ProtectedHistoryPage, HistoryProvider, useHistoryContext };
export type { HistoryContextValue };
