import { ComponentsDictionary, Schema } from '../hooks/useDocument';
import * as yup from 'yup';
interface ValidationOptions {
    status: 'draft' | 'published' | null;
    removedAttributes?: string[];
}
/**
 * TODO: should we create a Map to store these based on the hash of the schema?
 */
declare const createYupSchema: (attributes?: Schema['attributes'], components?: ComponentsDictionary, options?: ValidationOptions) => yup.ObjectSchema<any>;
export { createYupSchema };
