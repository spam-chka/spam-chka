export type Command = {
    command: string | null
    args: string[]
}

export type CommandContext = Command & {
    peer_id: number,
    from_id: number
}
