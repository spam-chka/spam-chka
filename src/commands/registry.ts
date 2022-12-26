import {CommandContext} from "./types";

export type CommandPermissionChecker = (commandContext: CommandContext) => Promise<void>;
export type CommandExecutor = (commandContext: CommandContext) => Promise<object>;
export type CommandRegistryEntry = {
    checker: CommandPermissionChecker,
    executor: CommandExecutor
};
type CommandRegistry = {
    [K in string]: CommandRegistryEntry
}

const registry: CommandRegistry = {};

export function registerCommand(
    {
        command,
        checker,
        executor
    }: CommandRegistryEntry & { command: string }
): boolean {
    if (command in registry) {
        return false;
    }
    registry[command] = {checker, executor};
}

export function selectCommand(commandContext: CommandContext): CommandRegistryEntry | null {
    if (commandContext.command in registry) {
        return registry[commandContext.command];
    }
    return null;
}
