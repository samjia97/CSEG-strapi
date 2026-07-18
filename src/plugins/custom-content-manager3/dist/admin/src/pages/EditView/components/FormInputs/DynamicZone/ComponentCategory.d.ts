import { Accordion } from '@strapi/design-system';
import * as React from 'react';
interface ComponentCategoryProps {
    category: string;
    components?: Array<{
        uid: string;
        displayName: string;
        icon?: string;
    }>;
    onAddComponent: (componentUid: string) => React.MouseEventHandler<HTMLButtonElement> & React.MouseEventHandler<HTMLDivElement>;
    variant?: Accordion.Variant;
}
declare const ComponentCategory: ({ category, components, variant, onAddComponent, }: ComponentCategoryProps) => import("react/jsx-runtime").JSX.Element;
export { ComponentCategory };
export type { ComponentCategoryProps };
