import { Registry } from "../registry";

export interface ExecutionContext {
  registry: Registry;
  targetPath: string;
}

export abstract class BaseCommand {
  abstract execute(args: string[], context: ExecutionContext): Promise<void>;
}
