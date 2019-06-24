import { RequireFunction } from './createRequire';
export interface Dependencies {
    [x: string]: string;
}
declare const getDeps: (packageJsonPath: string, requireDep: RequireFunction, deps: Dependencies) => Dependencies;
export default getDeps;
