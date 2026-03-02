export async function readAllStdin() {
    if (process.stdin.isTTY)
        return '';
    let data = '';
    for await (const chunk of process.stdin) {
        data += String(chunk);
    }
    return data;
}
//# sourceMappingURL=io.js.map