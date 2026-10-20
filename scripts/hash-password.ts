import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password || password.length < 10) {
    console.error(
      'Usage: npm run hash-password -- "a-strong-password"\nUse at least 10 characters.',
    );
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const escapedForEnvFile = hash.replaceAll("$", "\\$");

  console.log("\nFor .env.local (Next.js expands unescaped $ characters):");
  console.log("ADMIN_PASSWORD_HASH=" + escapedForEnvFile);
  console.log("\nFor the Vercel dashboard (paste the raw value):");
  console.log("ADMIN_PASSWORD_HASH=" + hash);
  console.log(
    "\nAdd ADMIN_USERNAME, ADMIN_PASSWORD_HASH and AUTH_SECRET to .env.local and Vercel.",
  );
}

main();
