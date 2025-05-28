export abstract class BaseCommand {
  abstract execute(args: string[]): Promise<void>;
}
