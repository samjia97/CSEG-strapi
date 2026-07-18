import { FlexProps } from '@strapi/design-system';
import { Struct } from '@strapi/types';
import * as React from 'react';
interface ComponentIconProps extends FlexProps {
    showBackground?: boolean;
    icon?: Struct.ContentTypeSchemaInfo['icon'];
}
declare const ComponentIcon: ({ showBackground, icon, ...props }: ComponentIconProps) => import("react/jsx-runtime").JSX.Element;
declare const COMPONENT_ICONS: Record<string, React.ComponentType<any>>;
export { ComponentIcon, COMPONENT_ICONS };
export type { ComponentIconProps };
