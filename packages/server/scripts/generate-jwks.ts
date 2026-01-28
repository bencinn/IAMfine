import Bun from "bun";
import { generateKeyPair, exportJWK } from "jose";

const keyFile = process.argv[2] || "private-key.json";
const publicKeyFile = process.argv[3] || "public-key.json";

const fileExists = await Bun.file(keyFile).exists();

if (!fileExists) {
  const { privateKey } = await generateKeyPair("RS256", { extractable: true });
  await Bun.write(Bun.file(keyFile), JSON.stringify(await exportJWK(privateKey)));
  console.log(`Private key saved to ${keyFile}`);
}

const { kty, n, e } = JSON.parse(await Bun.file(keyFile).text());
const publicKey = { kty, n, e };

console.log(`Public JWK:`);
console.log(publicKey);

await Bun.write(Bun.file(publicKeyFile), JSON.stringify(publicKey));
