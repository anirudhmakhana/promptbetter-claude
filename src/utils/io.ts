export async function readAllStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  let data = '';
  for await (const chunk of process.stdin) {
    data += String(chunk);
  }
  return data;
}
