export default function format(str: string, repl: object) {
    return str.replace(/{([^}]*)}/g, (_, key, ...args) => {
        return repl[key];
    });
}
