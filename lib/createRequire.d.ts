export interface RequireFunction {
    cwd: string;
    (name: any, relativeTo?: any): any;
    resolve(name: any, relativeTo?: any): string;
    probe(name: any, relativeTo?: any): string;
}
declare const _default: (cwd: string) => RequireFunction;
export default _default;
