import { Button } from '@strapi/design-system';
import { DialogOptions, ModalOptions, NotificationOptions } from '../../../EditView/components/DocumentActions';
import { BulkActionComponent } from '../../../../content-manager';
import { ComponentProps } from 'react';
import * as React from 'react';
type ButtonComponentProps = ComponentProps<typeof Button>;
interface BulkActionDescription {
    dialog?: DialogOptions | NotificationOptions | ModalOptions;
    disabled?: boolean;
    icon?: React.ReactNode;
    label: string;
    onClick?: (event: React.SyntheticEvent) => void;
    /**
     * @default 'default'
     */
    type?: 'icon' | 'default';
    /**
     * @default 'secondary'
     */
    variant?: ButtonComponentProps['variant'];
}
declare const BulkActionsRenderer: () => import("react/jsx-runtime").JSX.Element;
declare const Emphasis: (chunks: React.ReactNode) => import("react/jsx-runtime").JSX.Element;
declare const DEFAULT_BULK_ACTIONS: BulkActionComponent[];
export { DEFAULT_BULK_ACTIONS, BulkActionsRenderer, Emphasis };
export type { BulkActionDescription };
