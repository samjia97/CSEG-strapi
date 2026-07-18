import { UseDragAndDropOptions } from '../../../../../hooks/useDragAndDrop';
import { InputRendererProps } from '../../InputRenderer';
import { ComponentPickerProps } from './ComponentPicker';
import * as React from 'react';
interface DynamicComponentProps extends Pick<UseDragAndDropOptions, 'onGrabItem' | 'onDropItem' | 'onCancel'>, Pick<ComponentPickerProps, 'dynamicComponentsByCategory'> {
    componentUid: string;
    disabled?: boolean;
    index: number;
    name: string;
    onAddComponent: (componentUid: string, index: number) => void;
    onRemoveComponentClick: () => void;
    onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
    children?: (props: InputRendererProps) => React.ReactNode;
}
declare const DynamicComponent: ({ componentUid, disabled, index, name, onRemoveComponentClick, onMoveComponent, onGrabItem, onDropItem, onCancel, dynamicComponentsByCategory, onAddComponent, children, }: DynamicComponentProps) => import("react/jsx-runtime").JSX.Element;
export { DynamicComponent };
export type { DynamicComponentProps };
