export default class Stack {
    technologies: string[];
    platform: string;
    constructor(...stack: any[]);
    hasAny(technologies: any): boolean;
    hasAll(technologies: any): boolean;
}
